'use client';

import { 
  ClockIcon,
  UserIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { HRMSLayout, ContentCard, MetricsGrid } from '@/components/layout/HRMSLayout';
import { MetricCard } from '@/components/ui/MetricCard';
import { TabItem } from '@/types/layout';

const tabs: TabItem[] = [
  { 
    name: 'Overview', 
    href: '/attendance',
    icon: ChartBarIcon
  },
  { 
    name: 'Tracking', 
    href: '/attendance/tracking',
    icon: ClockIcon
  },
  { 
    name: 'Time Off', 
    href: '/attendance/time-off',
    icon: CalendarDaysIcon
  },
  { 
    name: 'Overtime', 
    href: '/attendance/overtime',
    icon: ClockIcon,
    badge: 5
  },
  { 
    name: 'Reports', 
    href: '/attendance/reports',
    icon: DocumentChartBarIcon
  },
];

const headerActions = (
  <div className="flex items-center space-x-3">
    <button className="hrms-btn hrms-btn-secondary">
      <DocumentChartBarIcon className="h-4 w-4 mr-2" />
      Generate Report
    </button>
    <button className="hrms-btn hrms-btn-primary">
      <ClockIcon className="h-4 w-4 mr-2" />
      Clock In/Out
    </button>
  </div>
);

export default function AttendancePage() {
  return (
    <HRMSLayout
      header={{
        title: 'Attendance Management',
        subtitle: 'Track employee attendance, manage time logs, and generate comprehensive attendance reports.',
        actions: headerActions,
        breadcrumbs: [
          { name: 'HRMS', href: '/' },
          { name: 'Attendance' },
        ],
      }}
      tabs={tabs}
    >
      {/* Today's Attendance Metrics */}
      <MetricsGrid columns={4}>
        <MetricCard
          title="Present Today"
          value={47}
          color="green"
          icon={UserIcon}
          trend={{ value: 5.2, direction: 'up' }}
        />
        <MetricCard
          title="Absent Today"
          value={3}
          color="red"
          icon={ExclamationTriangleIcon}
          trend={{ value: 1.0, direction: 'down' }}
        />
        <MetricCard
          title="Late Check-ins"
          value={5}
          color="yellow"
          icon={ClockIcon}
          trend={{ value: 2.1, direction: 'up' }}
        />
        <MetricCard
          title="Overtime Hours"
          value={28}
          color="blue"
          icon={ClockIcon}
          trend={{ value: 8.5, direction: 'up' }}
        />
      </MetricsGrid>

      {/* Live Attendance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real-time Attendance Status */}
        <ContentCard title="Real-time Attendance Status">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium text-green-900">Currently Working</p>
                  <p className="text-sm text-green-700">47 employees checked in</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">94%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-yellow-900">Break Time</p>
                  <p className="text-sm text-yellow-700">2 employees on break</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">4%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-red-900">Not Checked In</p>
                  <p className="text-sm text-red-700">3 employees absent</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600">6%</span>
            </div>
          </div>
        </ContentCard>

        {/* Recent Activities */}
        <ContentCard title="Recent Activities">
          <div className="space-y-4">
            {[
              { name: 'Dr. Sarah Johnson', action: 'Checked In', time: '2 minutes ago', type: 'checkin' },
              { name: 'Mike Chen', action: 'Started Break', time: '5 minutes ago', type: 'break' },
              { name: 'Emily Davis', action: 'Checked Out', time: '8 minutes ago', type: 'checkout' },
              { name: 'James Wilson', action: 'Late Check In', time: '15 minutes ago', type: 'late' },
              { name: 'Lisa Park', action: 'Overtime Started', time: '1 hour ago', type: 'overtime' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'checkin' ? 'bg-green-500' :
                    activity.type === 'break' ? 'bg-yellow-500' :
                    activity.type === 'checkout' ? 'bg-blue-500' :
                    activity.type === 'late' ? 'bg-red-500' : 'bg-purple-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.name}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      {/* Quick Actions */}
      <ContentCard title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left">
            <ClockIcon className="h-8 w-8 text-blue-500 mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Manual Clock In/Out</h3>
            <p className="text-sm text-gray-600">Record attendance for employees manually</p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left">
            <DocumentChartBarIcon className="h-8 w-8 text-green-500 mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Daily Report</h3>
            <p className="text-sm text-gray-600">Generate today's attendance summary</p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left">
            <ExclamationTriangleIcon className="h-8 w-8 text-purple-500 mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Flag Irregularities</h3>
            <p className="text-sm text-gray-600">Review attendance issues and exceptions</p>
          </button>
        </div>
      </ContentCard>
    </HRMSLayout>
  );
}