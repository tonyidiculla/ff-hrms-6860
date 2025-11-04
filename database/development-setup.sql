-- DEVELOPMENT SETUP SCRIPT FOR ROSTERING SYSTEM
-- Run this script in Supabase SQL Editor after running the main migration

-- ============================================================================
-- STEP 1: CREATE DEVELOPMENT ORGANIZATION
-- ============================================================================

-- Create the organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on organizations (users can only see their own org)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations_own_access" ON organizations
  FOR SELECT USING (id = get_user_organization_id() OR is_user_admin());

-- Insert development organization
INSERT INTO organizations (id, name, slug, email, is_active) 
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Furfield Development Veterinary Clinic',
  'furfield-dev',
  'admin@furfield.dev',
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  email = EXCLUDED.email,
  updated_at = NOW();

-- ============================================================================
-- STEP 2: CREATE YOUR USER PROFILE
-- ============================================================================

-- Replace 'your-email@example.com' with your actual email used in Supabase Auth
-- This creates a user profile that links your auth user to the development organization

DO $$
DECLARE
  user_email TEXT := 'your-email@example.com'; -- CHANGE THIS TO YOUR EMAIL
  existing_user_id UUID;
BEGIN
  -- Try to find existing user by email
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF existing_user_id IS NOT NULL THEN
    -- Create user profile
    INSERT INTO user_profiles (user_id, email, organization_id, full_name, role, is_active)
    VALUES (
      existing_user_id,
      user_email,
      '123e4567-e89b-12d3-a456-426614174000',
      'Development Admin',
      'admin',
      true
    ) ON CONFLICT (email) DO UPDATE SET
      organization_id = EXCLUDED.organization_id,
      role = EXCLUDED.role,
      is_active = EXCLUDED.is_active,
      updated_at = NOW();
      
    RAISE NOTICE 'User profile created for: %', user_email;
  ELSE
    RAISE NOTICE 'User not found with email: %. Please sign up first or check the email.', user_email;
  END IF;
END $$;

-- ============================================================================
-- STEP 3: CREATE SAMPLE STAFF AND SCHEDULE DATA
-- ============================================================================

-- Sample staff profiles
INSERT INTO rostering_entries (
  entity_platform_id,
  entry_type,
  staff_id,
  staff_name,
  staff_email,
  status,
  metadata
) VALUES 
  (
    '123e4567-e89b-12d3-a456-426614174000',
    'staff_profile',
    '550e8400-e29b-41d4-a716-446655440001',
    'Dr. Sarah Johnson',
    'sarah@furfield.dev',
    'active',
    '{
      "role_type": "veterinarian",
      "department": "Surgery",
      "employee_id": "VET001",
      "default_slot_duration": 30,
      "qualifications": ["DVM", "Surgery Specialist"],
      "phone": "+1-555-0123",
      "hire_date": "2024-01-15",
      "full_time_hours": 40,
      "can_take_appointments": true
    }'::jsonb
  ),
  (
    '123e4567-e89b-12d3-a456-426614174000',
    'staff_profile',
    '550e8400-e29b-41d4-a716-446655440002',
    'Jennifer Martinez',
    'jennifer@furfield.dev',
    'active',
    '{
      "role_type": "nurse",
      "department": "General Care",
      "employee_id": "NUR001",
      "default_slot_duration": 15,
      "qualifications": ["Veterinary Nursing Certificate"],
      "phone": "+1-555-0124",
      "hire_date": "2024-02-01",
      "full_time_hours": 40,
      "can_take_appointments": true
    }'::jsonb
  ),
  (
    '123e4567-e89b-12d3-a456-426614174000',
    'staff_profile',
    '550e8400-e29b-41d4-a716-446655440003',
    'Mike Chen',
    'mike@furfield.dev',
    'active',
    '{
      "role_type": "receptionist",
      "department": "Front Office",
      "employee_id": "REC001",
      "phone": "+1-555-0125",
      "hire_date": "2024-03-01",
      "full_time_hours": 32,
      "can_take_appointments": false
    }'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Sample weekly schedules
INSERT INTO rostering_entries (
  entity_platform_id,
  entry_type,
  staff_id,
  day_of_week,
  start_time,
  end_time,
  effective_date,
  status,
  priority,
  metadata
) VALUES 
  -- Dr. Sarah - Monday to Friday 9 AM - 5 PM
  ('123e4567-e89b-12d3-a456-426614174000', 'weekly_pattern', '550e8400-e29b-41d4-a716-446655440001', 1, '09:00:00', '17:00:00', '2024-11-01', 'active', 10, '{"pattern_name": "Regular Monday", "location": "Surgery Suite"}'),
  ('123e4567-e89b-12d3-a456-426614174000', 'weekly_pattern', '550e8400-e29b-41d4-a716-446655440001', 2, '09:00:00', '17:00:00', '2024-11-01', 'active', 10, '{"pattern_name": "Regular Tuesday", "location": "Surgery Suite"}'),
  ('123e4567-e89b-12d3-a456-426614174000', 'weekly_pattern', '550e8400-e29b-41d4-a716-446655440001', 3, '09:00:00', '17:00:00', '2024-11-01', 'active', 10, '{"pattern_name": "Regular Wednesday", "location": "Surgery Suite"}'),
  ('123e4567-e89b-12d3-a456-426614174000', 'weekly_pattern', '550e8400-e29b-41d4-a716-446655440001', 4, '09:00:00', '17:00:00', '2024-11-01', 'active', 10, '{"pattern_name": "Regular Thursday", "location": "Surgery Suite"}'),
  ('123e4567-e89b-12d3-a456-426614174000', 'weekly_pattern', '550e8400-e29b-41d4-a716-446655440001', 5, '09:00:00', '17:00:00', '2024-11-01', 'active', 10, '{"pattern_name": "Regular Friday", "location": "Surgery Suite"}'),
  
  -- Jennifer - Monday to Friday 8 AM - 4 PM
  ('123e4567-e89b-12d3-a456-426614174000', 'weekly_pattern', '550e8400-e29b-41d4-a716-446655440002', 1, '08:00:00', '16:00:00', '2024-11-01', 'active', 10, '{"pattern_name": "Early Shift Monday", "location": "General Care"}'),
  ('123e4567-e89b-12d3-a456-426614174000', 'weekly_pattern', '550e8400-e29b-41d4-a716-446655440002', 2, '08:00:00', '16:00:00', '2024-11-01', 'active', 10, '{"pattern_name": "Early Shift Tuesday", "location": "General Care"}'),
  ('123e4567-e89b-12d3-a456-426614174000', 'weekly_pattern', '550e8400-e29b-41d4-a716-446655440002', 3, '08:00:00', '16:00:00', '2024-11-01', 'active', 10, '{"pattern_name": "Early Shift Wednesday", "location": "General Care"}'),
  ('123e4567-e89b-12d3-a456-426614174000', 'weekly_pattern', '550e8400-e29b-41d4-a716-446655440002', 4, '08:00:00', '16:00:00', '2024-11-01', 'active', 10, '{"pattern_name": "Early Shift Thursday", "location": "General Care"}'),
  ('123e4567-e89b-12d3-a456-426614174000', 'weekly_pattern', '550e8400-e29b-41d4-a716-446655440002', 5, '08:00:00', '16:00:00', '2024-11-01', 'active', 10, '{"pattern_name": "Early Shift Friday", "location": "General Care"}'),
  
  -- Mike - Monday, Wednesday, Friday 10 AM - 6 PM
  ('123e4567-e89b-12d3-a456-426614174000', 'weekly_pattern', '550e8400-e29b-41d4-a716-446655440003', 1, '10:00:00', '18:00:00', '2024-11-01', 'active', 10, '{"pattern_name": "Reception Monday", "location": "Front Desk"}'),
  ('123e4567-e89b-12d3-a456-426614174000', 'weekly_pattern', '550e8400-e29b-41d4-a716-446655440003', 3, '10:00:00', '18:00:00', '2024-11-01', 'active', 10, '{"pattern_name": "Reception Wednesday", "location": "Front Desk"}'),
  ('123e4567-e89b-12d3-a456-426614174000', 'weekly_pattern', '550e8400-e29b-41d4-a716-446655440003', 5, '10:00:00', '18:00:00', '2024-11-01', 'active', 10, '{"pattern_name": "Reception Friday", "location": "Front Desk"}')
ON CONFLICT DO NOTHING;

-- Sample external booking
INSERT INTO rostering_entries (
  entity_platform_id,
  entry_type,
  staff_id,
  effective_date,
  start_time,
  end_time,
  status,
  priority,
  metadata
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'external_booking',
  '550e8400-e29b-41d4-a716-446655440001',
  CURRENT_DATE + INTERVAL '1 day', -- Tomorrow
  '10:30:00',
  '11:00:00',
  'active',
  50,
  '{
    "external_id": "HMS-APT-001234",
    "source_system": "ff-hms-6900",
    "client_name": "Max (Golden Retriever)",
    "appointment_type": "Surgery Consultation",
    "client_phone": "+1-555-0199",
    "notes": "Pre-surgical assessment for hip dysplasia"
  }'::jsonb
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that everything was created correctly
SELECT 
  'Organizations' as table_name,
  COUNT(*) as record_count
FROM organizations
WHERE is_active = true

UNION ALL

SELECT 
  'User Profiles' as table_name,
  COUNT(*) as record_count  
FROM user_profiles
WHERE is_active = true

UNION ALL

SELECT 
  'Staff Profiles' as table_name,
  COUNT(*) as record_count
FROM rostering_entries
WHERE entry_type = 'staff_profile' AND status = 'active'

UNION ALL

SELECT 
  'Weekly Patterns' as table_name,
  COUNT(*) as record_count
FROM rostering_entries  
WHERE entry_type = 'weekly_pattern' AND status = 'active'

UNION ALL

SELECT 
  'External Bookings' as table_name,
  COUNT(*) as record_count
FROM rostering_entries
WHERE entry_type = 'external_booking' AND status = 'active';

-- Test the RLS function
SELECT 
  'Current User Organization' as info,
  get_user_organization_id() as value;

-- Show sample data that should be accessible
SELECT 
  entry_type,
  staff_name,
  CASE 
    WHEN day_of_week IS NOT NULL THEN 'Day ' || day_of_week || ': ' || COALESCE(start_time::text, 'No time')
    WHEN effective_date IS NOT NULL THEN 'Date: ' || effective_date
    ELSE 'Profile'
  END as schedule_info
FROM rostering_entries
WHERE status = 'active'
ORDER BY entry_type, staff_name, day_of_week NULLS LAST;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ROSTERING SYSTEM DEVELOPMENT SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'What was created:';
  RAISE NOTICE '• Development organization: Furfield Development Veterinary Clinic';
  RAISE NOTICE '• 3 sample staff members with different roles';
  RAISE NOTICE '• Weekly schedule patterns for all staff';
  RAISE NOTICE '• 1 sample external booking appointment';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update your email in line 30 of this script and re-run';
  RAISE NOTICE '2. Test the rostering system in your application';
  RAISE NOTICE '3. Verify RLS is working by checking data access';
  RAISE NOTICE '';
  RAISE NOTICE 'Organization ID: 123e4567-e89b-12d3-a456-426614174000';
  RAISE NOTICE '========================================';
END $$;