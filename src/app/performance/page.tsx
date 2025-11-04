'use client';

import { 
  ChartBarIcon, 
  UserGroupIcon, 
  DocumentChartBarIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HRMSLayout, ContentCard, MetricsGrid } from '@/components/layout/HRMSLayout';
import { MetricCard } from '@/components/ui/MetricCard';
import { TabItem } from '@/types/layout';

const tabs: TabItem[] = [
  { name: 'Overview', href: '/performance', icon: ChartBarIcon },
  { name: 'Goals', href: '/performance/goals', icon: ArrowTrendingUpIcon },
  { name: 'Reviews', href: '/performance/reviews', icon: DocumentChartBarIcon },
  { name: 'Feedback', href: '/performance/feedback', icon: ChatBubbleLeftRightIcon },
  { name: 'Reports', href: '/performance/reports', icon: EyeIcon },
];

const headerProps = {
  title: "Performance Management",
  subtitle: "Track goals, reviews, and employee development",
  breadcrumbs: [
    { name: 'Home', href: '/' },
    { name: 'Performance' }
  ]
};

export default function PerformancePage() {
  return (
    <HRMSLayout header={headerProps} tabs={tabs}>
      <ContentCard title="Performance Management">
        <p className="text-gray-600 mb-6">
          Manage employee goals, conduct performance reviews, collect feedback, and analyze performance data across your organization.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-blue-900 mb-2">Goal Management</h3>
            <p className="text-sm text-blue-700 mb-4">Set, track, and manage employee goals and objectives</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-600">156 active goals</span>
              <span className="text-xs text-blue-600">78% completion rate</span>
            </div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <DocumentChartBarIcon className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-green-900 mb-2">Performance Reviews</h3>
            <p className="text-sm text-green-700 mb-4">Conduct regular performance evaluations and assessments</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-green-600">8 reviews due</span>
              <span className="text-xs text-green-600">92% completion</span>
            </div>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-purple-900 mb-2">Feedback & Communication</h3>
            <p className="text-sm text-purple-700 mb-4">Gather and manage ongoing feedback from team members</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-purple-600">45 feedback items</span>
              <span className="text-xs text-purple-600">4.2 avg rating</span>
            </div>
          </div>
        </div>
      </ContentCard>
    </HRMSLayout>
  );
}
