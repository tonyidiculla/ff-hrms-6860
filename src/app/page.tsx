'use client';

import { HRMSLayout, ContentCard, MetricsGrid } from '@/components/layout/HRMSLayout';
import { MetricCard } from '@/components/ui/MetricCard';
import { 
  UsersIcon, 
  ClockIcon, 
  CalendarDaysIcon, 
  ChartBarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const dashboardTabs = [
  { name: 'HR Home', href: '/', icon: ChartBarIcon },
  { name: 'Employees', href: '/employees', icon: UsersIcon },
  { name: 'Attendance', href: '/attendance', icon: ClockIcon },
  { name: 'Leave Management', href: '/leave', icon: CalendarDaysIcon },
  { name: 'Performance', href: '/performance', icon: ChartBarIcon },
  { name: 'Training', href: '/training', icon: AcademicCapIcon }
];

const headerProps = {
  title: "FURFIELD HRMS",
  subtitle: "Human Resource Management System - Your Complete HR Solution",
  breadcrumbs: [
    { name: 'Home', href: '/' }
  ]
};

export default function HRDashboard() {
  return (
    <HRMSLayout header={headerProps} tabs={dashboardTabs}>
      <MetricsGrid>
        <MetricCard
          title="Total Employees"
          value="247"
          trend={{ direction: 'up', value: 8 }}
          icon={UsersIcon}
          color="blue"
        />
        <MetricCard
          title="Present Today"
          value="218"
          trend={{ direction: 'up', value: 3.2 }}
          icon={ClockIcon}
          color="green"
        />
        <MetricCard
          title="Pending Leaves"
          value="12"
          trend={{ direction: 'down', value: 2 }}
          icon={CalendarDaysIcon}
          color="yellow"
        />
        <MetricCard
          title="Attendance Rate"
          value="88.3%"
          trend={{ direction: 'up', value: 1.8 }}
          icon={ChartBarIcon}
          color="purple"
        />
      </MetricsGrid>

      <ContentCard
        title="Welcome to FURFIELD HRMS"
      >
        <div className="text-center py-8">
          <ChartBarIcon className="mx-auto h-16 w-16 text-blue-500" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900">Complete HR Management System</h3>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Streamline your human resources operations with our comprehensive HRMS platform. 
            Manage employees, track attendance, handle leave requests, monitor performance, 
            and organize training programs all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <UsersIcon className="h-8 w-8 text-blue-600 mb-3" />
            <h4 className="font-semibold text-blue-900 mb-2">Employee Management</h4>
            <p className="text-sm text-blue-700 mb-4">
              Comprehensive employee directory, onboarding, and profile management
            </p>
            <a href="/employees" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              Manage Employees →
            </a>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <ClockIcon className="h-8 w-8 text-green-600 mb-3" />
            <h4 className="font-semibold text-green-900 mb-2">Attendance Tracking</h4>
            <p className="text-sm text-green-700 mb-4">
              Real-time attendance monitoring, time tracking, and reporting
            </p>
            <a href="/attendance" className="text-green-600 hover:text-green-800 font-medium text-sm">
              View Attendance →
            </a>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <CalendarDaysIcon className="h-8 w-8 text-yellow-600 mb-3" />
            <h4 className="font-semibold text-yellow-900 mb-2">Leave Management</h4>
            <p className="text-sm text-yellow-700 mb-4">
              Handle leave requests, approvals, and maintain leave balances
            </p>
            <a href="/leave" className="text-yellow-600 hover:text-yellow-800 font-medium text-sm">
              Manage Leave →
            </a>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <ChartBarIcon className="h-8 w-8 text-purple-600 mb-3" />
            <h4 className="font-semibold text-purple-900 mb-2">Performance Reviews</h4>
            <p className="text-sm text-purple-700 mb-4">
              Track goals, conduct reviews, and manage employee development
            </p>
            <a href="/performance" className="text-purple-600 hover:text-purple-800 font-medium text-sm">
              View Performance →
            </a>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <AcademicCapIcon className="h-8 w-8 text-indigo-600 mb-3" />
            <h4 className="font-semibold text-indigo-900 mb-2">Training Programs</h4>
            <p className="text-sm text-indigo-700 mb-4">
              Organize training sessions and track employee certifications
            </p>
            <a href="/training" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
              Manage Training →
            </a>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <ChartBarIcon className="h-8 w-8 text-gray-600 mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Analytics & Reports</h4>
            <p className="text-sm text-gray-700 mb-4">
              Comprehensive reporting and data analytics across all HR functions
            </p>
            <span className="text-gray-500 font-medium text-sm">
              Coming Soon
            </span>
          </div>
        </div>
      </ContentCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCard title="Recent HR Activities">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <UsersIcon className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New Employee Onboarded</p>
                <p className="text-xs text-gray-500">Sarah Johnson joined Engineering team</p>
              </div>
              <span className="text-xs text-gray-400">2h ago</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CalendarDaysIcon className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Leave Request Approved</p>
                <p className="text-xs text-gray-500">Michael Chen - Vacation Leave (Dec 20-25)</p>
              </div>
              <span className="text-xs text-gray-400">4h ago</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Attendance Alert</p>
                <p className="text-xs text-gray-500">3 employees marked late today</p>
              </div>
              <span className="text-xs text-gray-400">6h ago</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <AcademicCapIcon className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Training Completed</p>
                <p className="text-xs text-gray-500">15 employees completed Safety Training</p>
              </div>
              <span className="text-xs text-gray-400">1d ago</span>
            </div>
          </div>
        </ContentCard>

        <ContentCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-4">
            <a href="/employees/new" className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <UsersIcon className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">Add Employee</span>
            </a>
            
            <a href="/leave/requests" className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <CalendarDaysIcon className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Leave Requests</span>
            </a>
            
            <a href="/attendance/reports" className="flex flex-col items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
              <ClockIcon className="h-8 w-8 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-yellow-900">Attendance</span>
            </a>
            
            <a href="/performance/reviews" className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <ChartBarIcon className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">Reviews</span>
            </a>
          </div>
        </ContentCard>
      </div>
    </HRMSLayout>
  );
}
