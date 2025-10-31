'use client';

import { useState, useEffect } from 'react';
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
import { HRMSLayout, ContentCard, MetricsGrid } from '@/components/layout/HRMSLayout';
import { MetricCard } from '@/components/ui/MetricCard';
import { TabItem } from '@/types/layout';

const tabs: TabItem[] = [
  { 
    name: 'Directory', 
    href: '/employees',
    icon: UserGroupIcon
  },
  { 
    name: 'Add Employee', 
    href: '/employees/add',
    icon: UserPlusIcon
  },
  { 
    name: 'Departments', 
    href: '/employees/departments',
    icon: BuildingOfficeIcon
  },
  { 
    name: 'Positions', 
    href: '/employees/positions',
    icon: BriefcaseIcon
  },
];

const headerActions = (
  <div className="flex items-center space-x-3">
    <button className="hrms-btn hrms-btn-secondary">
      <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
      Search Employees
    </button>
    <button className="hrms-btn hrms-btn-primary">
      <UserPlusIcon className="h-4 w-4 mr-2" />
      Add Employee
    </button>
  </div>
);

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityId, setEntityId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserEntity();
  }, []);

  const fetchUserEntity = async () => {
    try {
      console.log('[HRMS Employees Page] Fetching user entity via auth proxy...');
      // Call local auth proxy which forwards to HMS
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        console.log('[HRMS Employees Page] User data:', userData);
        const userEntityId = userData.employee_entity_id || userData.entity_platform_id;
        
        if (userEntityId) {
          console.log('[HRMS Employees Page] Setting entity ID:', userEntityId);
          setEntityId(userEntityId);
        } else {
          console.error('[HRMS Employees Page] No entity assignment found');
          setError('No entity assignment found for this user');
        }
      } else {
        console.error('[HRMS Employees Page] Failed to fetch user info, status:', response.status);
        setError('Failed to fetch user information');
      }
    } catch (err) {
      setError('Failed to authenticate user');
      console.error('[HRMS Employees Page] Error fetching user entity:', err);
    }
  };

  useEffect(() => {
    if (entityId) {
      fetchEmployees();
    }
  }, [entityId]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      console.log('[HRMS Employees Page] Fetching employees for entity:', entityId);
      const response = await fetch(`/api/employees?entity_id=${entityId}`);
      
      console.log('[HRMS Employees Page] Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[HRMS Employees Page] API error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch employees');
      }

      const data = await response.json();
      console.log('[HRMS Employees Page] Received data:', data);
      setEmployees(data.employees || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
      console.error('[HRMS Employees Page] Error fetching employees:', err);
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
        actions: headerActions,
        breadcrumbs: [
          { name: 'HRMS', href: '/' },
          { name: 'Employees' },
        ],
      }}
      tabs={tabs}
    >
      {/* Employee Metrics */}
      <MetricsGrid columns={4}>
        <MetricCard
          title="Total Employees"
          value={employees.length}
          color="blue"
          icon={UserGroupIcon}
        />
        <MetricCard
          title="Active Employees"
          value={employees.filter(e => e.status === 'active').length}
          color="green"
          icon={UserGroupIcon}
        />
        <MetricCard
          title="Departments"
          value={new Set(employees.map(e => e.department)).size}
          color="yellow"
          icon={BuildingOfficeIcon}
        />
        <MetricCard
          title="Recent Hires"
          value={employees.filter(e => {
            const hireDate = new Date(e.hire_date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return hireDate >= thirtyDaysAgo;
          }).length}
          color="purple"
          icon={UserPlusIcon}
        />
      </MetricsGrid>

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
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hire Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                              {employee.first_name?.[0]}{employee.last_name?.[0]}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.employee_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                          {employee.email || 'N/A'}
                        </div>
                        {employee.phone && (
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            {employee.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.job_title}</div>
                        <div className="text-sm text-gray-500">{employee.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(employee.hire_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          View
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          Edit
                        </button>
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