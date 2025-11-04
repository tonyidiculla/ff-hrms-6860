-- INNOVATIVE SINGLE-TABLE ROSTERING SYSTEM
-- Replaces 4 complex tables with 1 flexible, JSON-powered table
-- Handles staff, schedules, exceptions, and bookings in unified structure

-- ============================================================================
-- DROP EXISTING COMPLEX TABLES
-- ============================================================================

DROP TABLE IF EXISTS external_bookings CASCADE;
DROP TABLE IF EXISTS schedule_exceptions CASCADE;
DROP TABLE IF EXISTS weekly_schedules CASCADE;
DROP TABLE IF EXISTS staff_members CASCADE;

-- ============================================================================
-- CREATE UNIFIED ROSTERING TABLE
-- ============================================================================

CREATE TABLE rostering_entries (
  -- Core Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_platform_id UUID NOT NULL, -- Hospital/organization
  
  -- Entry Classification
  entry_type VARCHAR(50) NOT NULL CHECK (entry_type IN (
    'staff_profile',     -- Staff member profile and defaults
    'weekly_pattern',    -- Recurring weekly schedule pattern
    'date_specific',     -- Specific date assignment/exception
    'external_booking',  -- Appointment from external system
    'availability_rule', -- Availability constraints
    'time_off_request'   -- Leave/vacation requests
  )),
  
  -- Flexible Identity System
  staff_id UUID, -- References staff when applicable
  staff_name VARCHAR(255),
  staff_email VARCHAR(255),
  
  -- Time Specifications (all optional, used as needed)
  effective_date DATE, -- When this entry becomes effective
  expiry_date DATE,    -- When this entry expires (NULL = permanent)
  day_of_week INTEGER, -- 0-6 for weekly patterns (NULL for non-recurring)
  start_time TIME,     -- Start time (NULL for full-day entries)
  end_time TIME,       -- End time (NULL for full-day entries)
  
  -- Status and Priority
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
    'active', 'inactive', 'pending', 'approved', 'rejected', 'cancelled'
  )),
  priority INTEGER DEFAULT 0, -- Higher number = higher priority for conflicts
  
  -- Flexible Metadata (JSON for extensibility)
  metadata JSONB DEFAULT '{}', -- Stores type-specific data
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (
    start_time IS NULL OR end_time IS NULL OR start_time < end_time
  ),
  CONSTRAINT valid_date_range CHECK (
    effective_date IS NULL OR expiry_date IS NULL OR effective_date <= expiry_date
  )
);

-- ============================================================================
-- INDEXES for PERFORMANCE
-- ============================================================================

-- Core lookup indexes
CREATE INDEX idx_rostering_entity_type ON rostering_entries(entity_platform_id, entry_type);
CREATE INDEX idx_rostering_staff_date ON rostering_entries(staff_id, effective_date) WHERE staff_id IS NOT NULL;
CREATE INDEX idx_rostering_date_range ON rostering_entries(effective_date, expiry_date);
CREATE INDEX idx_rostering_weekly ON rostering_entries(day_of_week, status) WHERE day_of_week IS NOT NULL;
CREATE INDEX idx_rostering_status ON rostering_entries(status);
CREATE INDEX idx_rostering_metadata ON rostering_entries USING GIN(metadata);

-- ============================================================================
-- ROW LEVEL SECURITY - PRODUCTION READY
-- ============================================================================

ALTER TABLE rostering_entries ENABLE ROW LEVEL SECURITY;

-- Create user organization context function
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
DECLARE
  user_org_id UUID;
  user_email TEXT;
  jwt_claims JSONB;
BEGIN
  -- Get the JWT claims from Supabase Auth
  jwt_claims := auth.jwt();
  
  IF jwt_claims IS NULL THEN
    -- No authenticated user - return NULL (will be denied by RLS)
    RETURN NULL;
  END IF;
  
  -- Get user email from JWT
  user_email := jwt_claims->>'email';
  
  -- Option 1: Direct organization ID from JWT custom claims
  -- This requires setting organization_id as a custom claim in Supabase Auth
  user_org_id := (jwt_claims->'app_metadata'->>'organization_id')::UUID;
  
  IF user_org_id IS NOT NULL THEN
    RETURN user_org_id;
  END IF;
  
  -- Option 2: Look up organization from user profiles table
  -- Assumes you have a user_profiles table linking users to organizations
  SELECT organization_id INTO user_org_id
  FROM user_profiles 
  WHERE email = user_email AND is_active = true;
  
  IF user_org_id IS NOT NULL THEN
    RETURN user_org_id;
  END IF;
  
  -- Option 3: Development fallback - use a default organization
  -- Only works if user email matches development pattern
  IF user_email LIKE '%@furfield.dev' OR user_email LIKE '%@localhost' THEN
    -- Development organization ID - replace with your actual dev org ID
    RETURN '123e4567-e89b-12d3-a456-426614174000'::UUID;
  END IF;
  
  -- No organization found - deny access
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is admin/super user
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN AS $$
DECLARE
  jwt_claims JSONB;
  user_role TEXT;
BEGIN
  jwt_claims := auth.jwt();
  
  IF jwt_claims IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check for admin role in JWT claims
  user_role := jwt_claims->'app_metadata'->>'role';
  
  RETURN user_role IN ('admin', 'super_admin', 'system');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Main RLS Policy: Users can only access data from their organization
CREATE POLICY "rostering_organization_isolation" ON rostering_entries
  FOR ALL 
  USING (
    -- Allow access if user belongs to the same organization
    entity_platform_id = get_user_organization_id()
    OR 
    -- Allow access for system admins
    is_user_admin()
  );

-- INSERT Policy: Users can only insert data for their organization
CREATE POLICY "rostering_organization_insert" ON rostering_entries
  FOR INSERT 
  WITH CHECK (
    -- Must insert with user's organization ID
    entity_platform_id = get_user_organization_id()
    OR 
    -- Allow for system admins
    is_user_admin()
  );

-- UPDATE Policy: Users can only update data from their organization
CREATE POLICY "rostering_organization_update" ON rostering_entries
  FOR UPDATE 
  USING (
    entity_platform_id = get_user_organization_id()
    OR 
    is_user_admin()
  )
  WITH CHECK (
    -- Prevent changing organization_id unless admin
    (entity_platform_id = get_user_organization_id() OR is_user_admin())
  );

-- DELETE Policy: Users can only delete data from their organization
CREATE POLICY "rostering_organization_delete" ON rostering_entries
  FOR DELETE 
  USING (
    entity_platform_id = get_user_organization_id()
    OR 
    is_user_admin()
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get staff schedule for a specific date
CREATE OR REPLACE FUNCTION get_staff_schedule_for_date(
  p_staff_id UUID,
  p_date DATE
) RETURNS TABLE (
  id UUID,
  entry_type VARCHAR,
  start_time TIME,
  end_time TIME,
  status VARCHAR,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    re.id,
    re.entry_type,
    re.start_time,
    re.end_time,
    re.status,
    re.metadata
  FROM rostering_entries re
  WHERE re.staff_id = p_staff_id
    AND re.status = 'active'
    AND (
      -- Weekly recurring pattern
      (re.entry_type = 'weekly_pattern' 
       AND re.day_of_week = EXTRACT(DOW FROM p_date)
       AND (re.effective_date IS NULL OR re.effective_date <= p_date)
       AND (re.expiry_date IS NULL OR re.expiry_date >= p_date))
      OR
      -- Specific date entry
      (re.entry_type IN ('date_specific', 'external_booking', 'time_off_request')
       AND re.effective_date = p_date)
    )
  ORDER BY re.priority DESC, re.entry_type;
END;
$$ LANGUAGE plpgsql;

-- Function to check schedule conflicts
CREATE OR REPLACE FUNCTION check_schedule_conflict(
  p_staff_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM get_staff_schedule_for_date(p_staff_id, p_date) s
  WHERE s.id != COALESCE(p_exclude_id, '00000000-0000-0000-0000-000000000000')
    AND s.start_time IS NOT NULL 
    AND s.end_time IS NOT NULL
    AND (
      (p_start_time >= s.start_time AND p_start_time < s.end_time) OR
      (p_end_time > s.start_time AND p_end_time <= s.end_time) OR
      (p_start_time <= s.start_time AND p_end_time >= s.end_time)
    );
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USER PROFILES TABLE (for organization mapping)
-- ============================================================================

-- Create user profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- References auth.users.id
  email VARCHAR(255) UNIQUE NOT NULL,
  organization_id UUID NOT NULL, -- References your organizations table
  full_name VARCHAR(255),
  role VARCHAR(100) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "user_profiles_own_access" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id OR email = auth.jwt()->>'email');

-- Only admins can modify user profiles
CREATE POLICY "user_profiles_admin_modify" ON user_profiles
  FOR ALL USING (is_user_admin());

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_org ON user_profiles(organization_id);

-- ============================================================================
-- DEVELOPMENT SETUP INSTRUCTIONS
-- ============================================================================

-- FOR DEVELOPMENT ENVIRONMENT:
-- 1. Create a development organization:
/*
INSERT INTO organizations (id, name, slug, is_active) 
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Furfield Development Clinic',
  'furfield-dev',
  true
) ON CONFLICT (id) DO NOTHING;
*/

-- 2. Create a development user profile (run after user signs up):
/*
INSERT INTO user_profiles (user_id, email, organization_id, full_name, role)
VALUES (
  auth.uid(), -- Current user's ID
  'dev@furfield.dev', -- Your development email
  '123e4567-e89b-12d3-a456-426614174000',
  'Development User',
  'admin'
) ON CONFLICT (email) DO NOTHING;
*/

-- 3. Alternative: Set organization_id in JWT custom claims via Supabase Dashboard:
-- Go to Authentication > Users > [Your User] > Raw user meta data
-- Add to app_metadata:
/*
{
  "organization_id": "123e4567-e89b-12d3-a456-426614174000",
  "role": "admin"
}
*/

-- FOR PRODUCTION ENVIRONMENT:
-- 1. Implement proper user onboarding flow
-- 2. Set organization_id during user registration
-- 3. Use proper organization IDs from your organizations table
-- 4. Set up admin roles through your application logic

-- ============================================================================
-- EXAMPLE DATA PATTERNS
-- ============================================================================

-- Staff Profile Example
/*
INSERT INTO rostering_entries (
  entity_platform_id, entry_type, staff_id, staff_name, staff_email,
  status, metadata
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000', 
  'staff_profile',
  '456e7890-e89b-12d3-a456-426614174001',
  'Dr. Sarah Johnson',
  'sarah.johnson@example.com',
  'active',
  '{
    "role_type": "veterinarian",
    "department": "Surgery",
    "default_slot_duration": 30,
    "qualifications": ["DVM", "Surgery Specialist"],
    "phone": "+1-555-0123",
    "hire_date": "2023-01-15",
    "full_time_hours": 40
  }'::jsonb
);
*/

-- Weekly Pattern Example (Monday 9 AM - 5 PM)
/*
INSERT INTO rostering_entries (
  entity_platform_id, entry_type, staff_id,
  day_of_week, start_time, end_time, effective_date,
  status, priority, metadata
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'weekly_pattern',
  '456e7890-e89b-12d3-a456-426614174001',
  1, -- Monday
  '09:00:00',
  '17:00:00',
  '2024-01-01',
  'active',
  10,
  '{
    "pattern_name": "Regular Monday Shift",
    "break_times": [{"start": "12:00", "end": "13:00"}],
    "location": "Main Clinic",
    "notes": "Surgery days"
  }'::jsonb
);
*/

-- Date-Specific Exception (Holiday override)
/*
INSERT INTO rostering_entries (
  entity_platform_id, entry_type, staff_id,
  effective_date, status, priority, metadata
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'date_specific',
  '456e7890-e89b-12d3-a456-426614174001',
  '2024-12-25', -- Christmas
  'active',
  100, -- High priority to override weekly pattern
  '{
    "reason": "Holiday - Christmas Day",
    "type": "day_off",
    "approved_by": "manager_id",
    "notes": "Clinic closed for holiday"
  }'::jsonb
);
*/

-- External Booking Example
/*
INSERT INTO rostering_entries (
  entity_platform_id, entry_type, staff_id,
  effective_date, start_time, end_time, status, metadata
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'external_booking',
  '456e7890-e89b-12d3-a456-426614174001',
  '2024-11-15',
  '14:30:00',
  '15:00:00',
  'active',
  '{
    "external_id": "HMS-APT-001234",
    "source_system": "ff-hms-6900",
    "client_name": "Max (Golden Retriever)",
    "appointment_type": "Surgery Consultation",
    "client_phone": "+1-555-0199",
    "notes": "Pre-surgical assessment"
  }'::jsonb
);
*/

-- ============================================================================
-- MIGRATION FROM OLD TABLES (if they exist)
-- ============================================================================

-- This would be used if migrating from the old 4-table structure
/*
-- Migrate staff_members to staff_profile entries
INSERT INTO rostering_entries (
  entity_platform_id, entry_type, staff_id, staff_name, staff_email, 
  status, metadata, created_at
)
SELECT 
  entity_platform_id,
  'staff_profile',
  id,
  full_name,
  email,
  CASE WHEN is_active THEN 'active' ELSE 'inactive' END,
  jsonb_build_object(
    'role_type', role_type,
    'job_title', job_title,
    'phone', phone,
    'slot_duration_minutes', slot_duration_minutes,
    'can_take_appointments', can_take_appointments,
    'hire_date', hire_date
  ),
  created_at
FROM staff_members_old;
*/