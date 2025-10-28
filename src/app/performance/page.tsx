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
      <MetricsGrid>
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
          title="Feedback Received"
          value="45"
          trend={{ direction: 'up', value: 18 }}
          icon={ChatBubbleLeftRightIcon}
          color="green"
        />
        <MetricCard
          title="Avg Rating"
          value="4.2"
          trend={{ direction: 'up', value: 0.3 }}
          icon={ChartBarIcon}
          color="purple"
        />
      </MetricsGrid>

      <ContentCard title="Performance Overview">
        <p className="text-gray-600 mb-6">
          Manage goals, reviews, feedback, and performance analytics for your team.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      </ContentCard>
    </HRMSLayout>
  );
}
