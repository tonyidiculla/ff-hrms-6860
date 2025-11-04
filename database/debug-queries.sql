-- Test query to verify database structure and identify issues
-- Run these queries in Supabase to check if tables exist and have expected columns

-- Check if staff_members table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'staff_members' 
ORDER BY ordinal_position;

-- Check if weekly_schedules table exists and its structure  
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'weekly_schedules' 
ORDER BY ordinal_position;

-- Check if schedule_exceptions table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'schedule_exceptions' 
ORDER BY ordinal_position;

-- Check if external_bookings table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'external_bookings' 
ORDER BY ordinal_position;

-- Simple test queries to check if basic operations work
SELECT COUNT(*) as staff_count FROM staff_members;
SELECT COUNT(*) as schedule_count FROM weekly_schedules;
SELECT COUNT(*) as exception_count FROM schedule_exceptions;
SELECT COUNT(*) as booking_count FROM external_bookings;

-- Test a simple join to see if relationships work
SELECT 
    sm.full_name,
    ws.day_of_week,
    ws.start_time,
    ws.end_time
FROM staff_members sm
LEFT JOIN weekly_schedules ws ON sm.id = ws.staff_member_id
LIMIT 5;