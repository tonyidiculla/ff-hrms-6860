'use client';

import { HRMSLayout, ContentCard, MetricsGrid } from '@/components/layout/HRMSLayout';
import { MetricCard } from '@/components/ui/MetricCard';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  ChartBarIcon, 
  UsersIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

const headerProps = {
  title: "FURFIELD HRMS",
  subtitle: "Human Resource Management System - Your Complete HR Solution",
  breadcrumbs: [
    { name: 'Home', href: '/' }
  ]
};

export default function HRDashboard() {
  return (
    <HRMSLayout header={headerProps}>
      {/* HR Dashboard Overview */}
      <ContentCard title="HR Dashboard Overview">
        <MetricsGrid>
          {/* Core HR Metrics */}
          <MetricCard
            title="Total Employees"
            value="247"
            trend={{ direction: 'up', value: 12 }}
            icon={UsersIcon}
            color="blue"
          />
          <MetricCard
            title="Present Today"
            value="218"
            trend={{ direction: 'up', value: 8 }}
            icon={ClockIcon}
            color="green"
          />
          <MetricCard
            title="Attendance Rate"
            value="88.3%"
            trend={{ direction: 'up', value: 2.1 }}
            icon={ChartBarIcon}
            color="purple"
          />
          <MetricCard
            title="Pending Leaves"
            value="12"
            trend={{ direction: 'down', value: 3 }}
            icon={CalendarDaysIcon}
            color="yellow"
          />
          
          {/* Performance Metrics */}
          <MetricCard
            title="Active Goals"
            value="156"
            trend={{ direction: 'up', value: 12 }}
            icon={ArrowTrendingUpIcon}
            color="blue"
          />
          <MetricCard
            title="Reviews Due"
            value="8"
            trend={{ direction: 'down', value: 3 }}
            icon={DocumentChartBarIcon}
            color="yellow"
          />
          <MetricCard
            title="Avg Performance"
            value="4.2"
            trend={{ direction: 'up', value: 0.3 }}
            icon={ChartBarIcon}
            color="green"
          />
          
          {/* Training Metrics */}
          <MetricCard
            title="Active Programs"
            value="12"
            trend={{ direction: 'up', value: 2 }}
            icon={AcademicCapIcon}
            color="purple"
          />
        </MetricsGrid>
      </ContentCard>

      {/* Performance Insights */}
      <ContentCard title="Performance Insights">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Goal Completion Rate</h3>
            <p className="text-2xl font-bold text-blue-600">78%</p>
            <p className="text-sm text-blue-700">+5% from last quarter</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Review Completion</h3>
            <p className="text-2xl font-bold text-green-600">92%</p>
            <p className="text-sm text-green-700">On track for Q4</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">Training Completed</h3>
            <p className="text-2xl font-bold text-purple-600">28</p>
            <p className="text-sm text-purple-700">This month</p>
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
          <div className="grid grid-cols-3 gap-4">
            <a href="/employees/add" className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <UsersIcon className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">Add Employee</span>
            </a>
            
            <a href="/attendance-leave?tab=leave" className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <CalendarDaysIcon className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Approve Leave</span>
            </a>
            
            <a href="/performance/reviews" className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <DocumentChartBarIcon className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">New Review</span>
            </a>
          </div>
        </ContentCard>
      </div>
    </HRMSLayout>
  );
}
