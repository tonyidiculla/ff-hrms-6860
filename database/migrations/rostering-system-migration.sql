-- Rostering System Database Migration
-- Creates all required tables for the HRMS rostering functionality
-- Run this migration in Supabase to enable database integration

-- ============================================================================
-- CREATE ROSTERING TABLES
-- ============================================================================

-- Staff members table for rostering
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_platform_id UUID NOT NULL, -- Links to hospital/organization
  user_platform_id VARCHAR(255), -- Links to user management system  
  employee_id VARCHAR(100), -- Internal employee identifier
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  role_type VARCHAR(100) NOT NULL, -- veterinarian, veterinary_technician, etc.
  job_title VARCHAR(255),
  slot_duration_minutes INTEGER DEFAULT 15, -- Default appointment duration
  can_take_appointments BOOLEAN DEFAULT true,
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly schedules for staff members
CREATE TABLE IF NOT EXISTS weekly_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL,
  effective_until DATE, -- NULL means indefinite
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure start time is before end time
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  -- Prevent overlapping schedules for same staff/day
  UNIQUE(staff_member_id, day_of_week, effective_from)
);

-- Schedule exceptions (holidays, sick days, special hours)
CREATE TABLE IF NOT EXISTS schedule_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  exception_type VARCHAR(50) NOT NULL, -- holiday, sick_leave, vacation, special_hours, unavailable
  start_time TIME, -- NULL for full day exceptions
  end_time TIME, -- NULL for full day exceptions
  reason TEXT,
  created_by UUID, -- Who created this exception
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure valid time range for partial day exceptions
  CONSTRAINT valid_exception_time CHECK (
    (start_time IS NULL AND end_time IS NULL) OR 
    (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
  )
);

-- External bookings (appointments from other systems like HMS)
CREATE TABLE IF NOT EXISTS external_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_platform_id UUID NOT NULL, -- Links to hospital/organization
  staff_member_id UUID NOT NULL REFERENCES staff_members(id),
  external_booking_id VARCHAR(255) NOT NULL, -- ID from the external system
  source_service VARCHAR(100) NOT NULL, -- Which service created this booking (ff-hms, ff-pa, etc.)
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  booking_end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, completed, no_show
  metadata JSONB, -- Additional data from external system
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure booking end time is after start time
  CONSTRAINT valid_booking_time CHECK (booking_time < booking_end_time),
  -- Prevent duplicate external bookings
  UNIQUE(external_booking_id, source_service)
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Staff members indexes
CREATE INDEX IF NOT EXISTS idx_staff_members_entity_platform_id ON staff_members(entity_platform_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_active ON staff_members(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_members_role_type ON staff_members(role_type);
CREATE INDEX IF NOT EXISTS idx_staff_members_user_platform_id ON staff_members(user_platform_id);

-- Weekly schedules indexes
CREATE INDEX IF NOT EXISTS idx_weekly_schedules_staff_day ON weekly_schedules(staff_member_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_weekly_schedules_effective ON weekly_schedules(effective_from, effective_until);
CREATE INDEX IF NOT EXISTS idx_weekly_schedules_active ON weekly_schedules(is_active);

-- Schedule exceptions indexes
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_staff_date ON schedule_exceptions(staff_member_id, exception_date);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_date_range ON schedule_exceptions(exception_date);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_active ON schedule_exceptions(is_active);

-- External bookings indexes
CREATE INDEX IF NOT EXISTS idx_external_bookings_staff_date ON external_bookings(staff_member_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_external_bookings_external_id ON external_bookings(external_booking_id);
CREATE INDEX IF NOT EXISTS idx_external_bookings_entity_platform_id ON external_bookings(entity_platform_id);
CREATE INDEX IF NOT EXISTS idx_external_bookings_status ON external_bookings(status);
CREATE INDEX IF NOT EXISTS idx_external_bookings_source ON external_bookings(source_service);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_bookings ENABLE ROW LEVEL SECURITY;

-- Staff members: Only accessible by same entity
CREATE POLICY "staff_members_entity_isolation" ON staff_members
  FOR ALL USING (
    auth.jwt() ->> 'entity_platform_id' = entity_platform_id::text
  );

-- Weekly schedules: Only accessible through staff member's entity
CREATE POLICY "weekly_schedules_entity_isolation" ON weekly_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_members 
      WHERE staff_members.id = weekly_schedules.staff_member_id 
      AND staff_members.entity_platform_id::text = auth.jwt() ->> 'entity_platform_id'
    )
  );

-- Schedule exceptions: Only accessible through staff member's entity
CREATE POLICY "schedule_exceptions_entity_isolation" ON schedule_exceptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_members 
      WHERE staff_members.id = schedule_exceptions.staff_member_id 
      AND staff_members.entity_platform_id::text = auth.jwt() ->> 'entity_platform_id'
    )
  );

-- External bookings: Only accessible by same entity
CREATE POLICY "external_bookings_entity_isolation" ON external_bookings
  FOR ALL USING (
    auth.jwt() ->> 'entity_platform_id' = entity_platform_id::text
  );

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Create or update function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_schedules_updated_at BEFORE UPDATE ON weekly_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedule_exceptions_updated_at BEFORE UPDATE ON schedule_exceptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_external_bookings_updated_at BEFORE UPDATE ON external_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA FOR TESTING (Optional - remove in production)
-- ============================================================================

-- Insert some sample staff members (replace with actual data)
INSERT INTO staff_members (
  entity_platform_id, 
  full_name, 
  email, 
  role_type, 
  job_title, 
  employee_id,
  can_take_appointments
) VALUES 
(
  (SELECT entity_platform_id FROM profiles WHERE id = auth.uid() LIMIT 1),
  'Dr. Sarah Johnson', 
  'sarah.johnson@example.com', 
  'veterinarian', 
  'Senior Veterinarian', 
  'EMP001',
  true
),
(
  (SELECT entity_platform_id FROM profiles WHERE id = auth.uid() LIMIT 1),
  'Mike Chen', 
  'mike.chen@example.com', 
  'veterinary_technician', 
  'Lead Veterinary Technician', 
  'EMP002',
  true
),
(
  (SELECT entity_platform_id FROM profiles WHERE id = auth.uid() LIMIT 1),
  'Emily Rodriguez', 
  'emily.rodriguez@example.com', 
  'receptionist', 
  'Front Desk Coordinator', 
  'EMP003',
  false
)
ON CONFLICT DO NOTHING;

-- Insert sample weekly schedules
INSERT INTO weekly_schedules (
  staff_member_id, 
  day_of_week, 
  start_time, 
  end_time, 
  effective_from
)
SELECT 
  s.id,
  generate_series(1, 5) as day_of_week, -- Monday to Friday
  '08:00'::time as start_time,
  '16:00'::time as end_time,
  CURRENT_DATE as effective_from
FROM staff_members s 
WHERE s.role_type = 'veterinarian'
ON CONFLICT DO NOTHING;

-- Insert receptionist schedule (different hours)
INSERT INTO weekly_schedules (
  staff_member_id, 
  day_of_week, 
  start_time, 
  end_time, 
  effective_from
)
SELECT 
  s.id,
  generate_series(1, 6) as day_of_week, -- Monday to Saturday
  '07:30'::time as start_time,
  '15:30'::time as end_time,
  CURRENT_DATE as effective_from
FROM staff_members s 
WHERE s.role_type = 'receptionist'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE staff_members IS 'Staff members who can take appointments and have schedules';
COMMENT ON TABLE weekly_schedules IS 'Regular weekly working hours for staff members';
COMMENT ON TABLE schedule_exceptions IS 'Exceptions to regular schedules (holidays, sick days, etc.)';
COMMENT ON TABLE external_bookings IS 'Appointments booked from external systems like HMS';

COMMENT ON COLUMN staff_members.entity_platform_id IS 'Links to hospital/organization for multi-tenancy';
COMMENT ON COLUMN staff_members.slot_duration_minutes IS 'Default appointment duration for this staff member';
COMMENT ON COLUMN weekly_schedules.day_of_week IS '0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday';
COMMENT ON COLUMN schedule_exceptions.exception_type IS 'Types: holiday, sick_leave, vacation, special_hours, unavailable';
COMMENT ON COLUMN external_bookings.source_service IS 'Which microservice created this booking (ff-hms, ff-pa, etc.)';

-- ============================================================================
-- GRANT PERMISSIONS (Adjust based on your needs)
-- ============================================================================

-- Grant permissions to authenticated users
GRANT ALL ON staff_members TO authenticated;
GRANT ALL ON weekly_schedules TO authenticated;
GRANT ALL ON schedule_exceptions TO authenticated;
GRANT ALL ON external_bookings TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- This migration sets up the complete rostering system database structure
-- Next steps:
-- 1. Apply this migration to your Supabase database
-- 2. Update your application to use the database integration
-- 3. Test the rostering functionality
-- 4. Remove sample data in production

SELECT 'Rostering system database migration completed successfully!' as status;