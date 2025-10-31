-- Simple fix: Allow everyone to read platform_roles

-- Check current policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'platform_roles';

-- Drop any restrictive policies
DROP POLICY IF EXISTS "Anyone can view platform roles" ON platform_roles;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON platform_roles;

-- Create simple policy to allow all authenticated users to view roles
CREATE POLICY "Allow authenticated users to view platform roles"
ON platform_roles
FOR SELECT
TO authenticated
USING (true);

-- Ensure RLS is enabled
ALTER TABLE platform_roles ENABLE ROW LEVEL SECURITY;

-- Test the query
SELECT role_code, role_name, id
FROM platform_roles
ORDER BY role_name
LIMIT 10;
