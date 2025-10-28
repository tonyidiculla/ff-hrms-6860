'use client';

import { 
  UserGroupIcon, 
  UserPlusIcon, 
  BuildingOfficeIcon, 
  BriefcaseIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon
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
          value={156}
          color="blue"
          icon={UserGroupIcon}
          trend={{ value: 3.2, direction: 'up' }}
        />
        <MetricCard
          title="Active Employees"
          value={152}
          color="green"
          icon={UserGroupIcon}
          trend={{ value: 1.8, direction: 'up' }}
        />
        <MetricCard
          title="On Leave"
          value={4}
          color="yellow"
          icon={UserGroupIcon}
          trend={{ value: 0.5, direction: 'down' }}
        />
        <MetricCard
          title="New Hires (Month)"
          value={8}
          color="purple"
          icon={UserPlusIcon}
          trend={{ value: 12.5, direction: 'up' }}
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

          {/* Employee List Placeholder */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Directory</h3>
            <p className="text-gray-600 mb-4">
              Employee directory with search, filtering, and management features coming soon.
            </p>
            <div className="flex justify-center space-x-3">
              <button className="hrms-btn hrms-btn-primary">
                Import Employees
              </button>
              <button className="hrms-btn hrms-btn-secondary">
                Download Template
              </button>
            </div>
          </div>
        </div>
      </ContentCard>
    </HRMSLayout>
  );
}