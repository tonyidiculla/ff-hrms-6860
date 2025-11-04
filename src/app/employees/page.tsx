'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  UserGroupIcon, 
  UserPlusIcon, 
  BuildingOfficeIcon, 
  BriefcaseIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { HRMSLayout, ContentCard } from '@/components/layout/HRMSLayout';
import { TabItem } from '@/types/layout';

const tabs: TabItem[] = [
  { 
    name: 'Directory', 
    href: '/employees',
    icon: UserGroupIcon
  },
  { 
    name: 'Employee Records', 
    href: '/employees/add',
    icon: UserPlusIcon
  },
  { 
    name: 'Positions', 
    href: '/employees/positions',
    icon: BriefcaseIcon
  },
  { 
    name: 'Departments', 
    href: '/employees/departments',
    icon: BuildingOfficeIcon
  },
];

// No header actions for Directory page - Add Employee button is on Add Employee tab

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityId, setEntityId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchUserEntity();
  }, []);

  const fetchUserEntity = async () => {
    try {
      const response = await fetch('/api/auth/me');
      
      if (!response.ok) {
        setError('Failed to fetch user information');
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setError('Authentication service returned invalid response');
        return;
      }

      const userData = await response.json();
      const userEntityId = userData.employee_entity_id || userData.entity_platform_id;
      
      if (userEntityId) {
        setEntityId(userEntityId);
      } else {
        setError('No entity assignment found for this user');
      }
    } catch (err) {
      console.error('[Directory] Auth error:', err);
      setError('Failed to authenticate user');
    }
  };

  useEffect(() => {
    if (entityId) {
      fetchEmployees();
    }
  }, [entityId]);

  const fetchEmployees = async () => {
    if (!entityId) return;
    
    try {
      setLoading(true);
      const startTime = performance.now();
      
      // Direct Supabase query with RLS - only fetch filled positions
      console.log('[Directory] Fetching employee seats...');
      const { data: assignments, error: assignError } = await supabase
        .from('employee_seat_assignment')
        .select(`
          id,
          entity_platform_id,
          user_platform_id,
          platform_role_id,
          employee_job_title,
          department,
          employment_status,
          employment_start_date,
          employee_email,
          employee_contact,
          is_active,
          assigned_at
        `)
        .eq('entity_platform_id', entityId)
        .eq('is_active', true)
        .eq('is_filled', true)
        .order('assigned_at', { ascending: false });

      const seatsTime = performance.now();
      console.log(`[Directory] Seats query took ${(seatsTime - startTime).toFixed(0)}ms, found ${assignments?.length || 0} employees`);

      if (assignError) {
        console.error('Error fetching employees:', assignError);
        throw assignError;
      }

      // Fetch profiles for all user_platform_ids
      const userPlatformIds = assignments?.map(a => a.user_platform_id).filter(Boolean) || [];
      
      let profilesMap = new Map();
      if (userPlatformIds.length > 0) {
        console.log(`[Directory] Fetching ${userPlatformIds.length} user profiles...`);
        const { data: profiles } = await supabase
          .from('profiles_with_auth')
          .select('user_platform_id, first_name, last_name, avatar_storage, phone')
          .in('user_platform_id', userPlatformIds);
        
        const profilesTime = performance.now();
        console.log(`[Directory] Profiles query took ${(profilesTime - seatsTime).toFixed(0)}ms, found ${profiles?.length || 0} profiles`);
        
        profiles?.forEach((p: any) => profilesMap.set(p.user_platform_id, p));
      }
      
      const transformStart = performance.now();

      // Transform to match expected employee structure
      // Filter out any assignments without user_platform_id (shouldn't happen for filled positions)
      const employeeData = assignments?.filter(a => a.user_platform_id).map((assignment: any) => {
        const profile = profilesMap.get(assignment.user_platform_id);
        
        return {
          id: assignment.id,
          entity_platform_id: assignment.entity_platform_id,
          employee_id: assignment.user_platform_id,
          first_name: profile?.first_name || 'Unknown',
          last_name: profile?.last_name || 'User',
          email: assignment.employee_email || profile?.email || '',
          phone: assignment.employee_contact || profile?.phone || '',
          department: assignment.department || 'Unassigned',
          job_title: assignment.employee_job_title || 'Employee',
          employment_type: 'full_time',
          hire_date: assignment.employment_start_date || assignment.assigned_at,
          status: assignment.employment_status || (assignment.is_active ? 'active' : 'inactive'),
          avatar_storage: profile?.avatar_storage,
          created_at: assignment.assigned_at
        };
      }) || [];

      const totalTime = performance.now();
      console.log(`[Directory] Data transformation took ${(totalTime - transformStart).toFixed(0)}ms`);
      console.log(`[Directory] Total fetch time: ${(totalTime - startTime).toFixed(0)}ms`);

      setEmployees(employeeData);
      setError(null);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    searchTerm === '' || 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <HRMSLayout
      header={{
        title: 'Employee Management',
        subtitle: 'Manage employee records, view information, and perform HR-related tasks.',
        breadcrumbs: [
          { name: 'HRMS', href: '/' },
          { name: 'Employees' },
        ],
      }}
      tabs={tabs}
    >
      {/* Employee Directory */}
      <ContentCard 
        title="Employee Directory"
        headerActions={
          <button className="hrms-btn hrms-btn-secondary text-xs">
            <EllipsisVerticalIcon className="h-4 w-4" />
          </button>
        }
      >
        <div className="space-y-6">
          {/* Search and Filter Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="hrms-input pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select className="hrms-input w-40">
                <option>All Departments</option>
                <option>Medical Services</option>
                <option>Administration</option>
                <option>Support</option>
              </select>
              <select className="hrms-input w-32">
                <option>All Status</option>
                <option>Active</option>
                <option>On Leave</option>
                <option>Inactive</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Sort by:</span>
              <select className="hrms-input w-32 text-sm">
                <option>Name</option>
                <option>Department</option>
                <option>Join Date</option>
                <option>Position</option>
              </select>
            </div>
          </div>

          {/* Employee List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading employees...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchEmployees}
                className="mt-4 hrms-btn hrms-btn-primary"
              >
                Retry
              </button>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Employees Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No employees match your search criteria.' : 'No employees have been assigned to this entity yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                              {employee.first_name?.[0]}{employee.last_name?.[0]}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.job_title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                          <span className="break-all">{employee.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <PhoneIcon className="h-4 w-4 text-gray-400" />
                          {employee.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.department || 'N/A'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ContentCard>
    </HRMSLayout>
  );
}