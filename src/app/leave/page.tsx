'use client';

import { 
  CalendarDaysIcon,
  PlusIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HRMSLayout, ContentCard, MetricsGrid } from '@/components/layout/HRMSLayout';
import { MetricCard } from '@/components/ui/MetricCard';
import { TabItem } from '@/types/layout';

const tabs: TabItem[] = [
  { 
    name: 'Overview', 
    href: '/leave',
    icon: CalendarDaysIcon
  },
  { 
    name: 'New Request', 
    href: '/leave/requests/new',
    icon: PlusIcon
  },
  { 
    name: 'Calendar', 
    href: '/leave/calendar',
    icon: CalendarIcon
  },
  { 
    name: 'Policies', 
    href: '/leave/policies',
    icon: DocumentTextIcon
  },
];

const headerActions = (
  <div className="flex items-center space-x-3">
    <button className="hrms-btn hrms-btn-secondary">
      <CalendarIcon className="h-4 w-4 mr-2" />
      View Calendar
    </button>
    <button className="hrms-btn hrms-btn-primary">
      <PlusIcon className="h-4 w-4 mr-2" />
      New Request
    </button>
  </div>
);

export default function LeavePage() {
  return (
    <HRMSLayout
      header={{
        title: 'Leave Management',
        subtitle: 'Submit leave requests, approve applications, and manage leave balances across the organization.',
        actions: headerActions,
        breadcrumbs: [
          { name: 'HRMS', href: '/' },
          { name: 'Leave Management' },
        ],
      }}
      tabs={tabs}
    >
      {/* Leave Metrics */}
      <MetricsGrid columns={4}>
        <MetricCard
          title="Pending Requests"
          value={3}
          color="blue"
          icon={ClockIcon}
          trend={{ value: 2, direction: 'up' }}
        />
        <MetricCard
          title="Approved This Month"
          value={12}
          color="green"
          icon={CheckIcon}
          trend={{ value: 8.3, direction: 'up' }}
        />
        <MetricCard
          title="Average Leave Days"
          value={18}
          color="purple"
          icon={CalendarDaysIcon}
          trend={{ value: 1.5, direction: 'neutral' }}
        />
        <MetricCard
          title="Rejection Rate"
          value="2.1%"
          color="yellow"
          icon={XMarkIcon}
          trend={{ value: 0.5, direction: 'down' }}
        />
      </MetricsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Requests */}
        <div className="lg:col-span-2">
          <ContentCard 
            title="Pending Requests" 
            headerActions={
              <button className="hrms-btn hrms-btn-secondary text-xs">
                View All
              </button>
            }
          >
            <div className="space-y-4">
              {[
                {
                  employee: 'Dr. Sarah Johnson',
                  type: 'Annual Leave',
                  dates: 'Dec 20 - Dec 27, 2024',
                  days: 8,
                  reason: 'Family vacation',
                  submitted: '2 days ago',
                  urgency: 'normal'
                },
                {
                  employee: 'Mike Chen',
                  type: 'Sick Leave',
                  dates: 'Dec 15 - Dec 16, 2024',
                  days: 2,
                  reason: 'Medical appointment',
                  submitted: '1 day ago',
                  urgency: 'high'
                },
                {
                  employee: 'Emily Davis',
                  type: 'Personal Leave',
                  dates: 'Jan 5 - Jan 7, 2025',
                  days: 3,
                  reason: 'Personal matters',
                  submitted: '3 hours ago',
                  urgency: 'normal'
                },
              ].map((request, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{request.employee}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          request.type === 'Sick Leave' 
                            ? 'bg-red-100 text-red-700'
                            : request.type === 'Annual Leave'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}>
                          {request.type}
                        </span>
                        {request.urgency === 'high' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{request.submitted}</p>
                      <p className="font-medium text-gray-900">{request.days} days</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p><span className="font-medium">Dates:</span> {request.dates}</p>
                    <p><span className="font-medium">Reason:</span> {request.reason}</p>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2">
                    <button className="hrms-btn hrms-btn-secondary text-xs py-1 px-3">
                      <XMarkIcon className="h-3 w-3 mr-1" />
                      Reject
                    </button>
                    <button className="hrms-btn hrms-btn-success text-xs py-1 px-3">
                      <CheckIcon className="h-3 w-3 mr-1" />
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ContentCard>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-8">
          {/* Leave Balance */}
          <ContentCard title="Your Leave Balance">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Annual Leave</p>
                  <p className="text-sm text-green-700">Remaining this year</p>
                </div>
                <span className="text-xl font-bold text-green-600">15</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Sick Leave</p>
                  <p className="text-sm text-blue-700">Available days</p>
                </div>
                <span className="text-xl font-bold text-blue-600">8</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-purple-900">Personal Leave</p>
                  <p className="text-sm text-purple-700">Available days</p>
                </div>
                <span className="text-xl font-bold text-purple-600">5</span>
              </div>
            </div>
          </ContentCard>

          {/* Quick Actions */}
          <ContentCard title="Quick Actions">
            <div className="space-y-3">
              <button className="w-full hrms-btn hrms-btn-primary justify-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Submit Leave Request
              </button>
              
              <button className="w-full hrms-btn hrms-btn-secondary justify-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                View Team Calendar
              </button>
              
              <button className="w-full hrms-btn hrms-btn-secondary justify-center">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Leave Policies
              </button>
            </div>
          </ContentCard>
        </div>
      </div>
    </HRMSLayout>
  );
}