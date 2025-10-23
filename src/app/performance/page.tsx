'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  DocumentChartBarIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { DashboardMetric } from '@/types/hr';

interface PerformanceDashboardState {
  metrics: DashboardMetric[];
  recentActivities: {
    id: string;
    type: 'goal' | 'review' | 'feedback';
    title: string;
    description: string;
    date: string;
    status: string;
  }[];
  loading: boolean;
}

const tabs = [
  { name: 'Overview', href: '/performance' },
  { name: 'Goals', href: '/performance/goals' },
  { name: 'Reviews', href: '/performance/reviews' },
  { name: 'Feedback', href: '/performance/feedback' },
  { name: 'Reports', href: '/performance/reports' },
];

export default function PerformancePage() {
  const pathname = usePathname();
  const [state, setState] = useState<PerformanceDashboardState>({
    metrics: [],
    recentActivities: [],
    loading: true,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Simulate API calls - replace with actual API
      const mockMetrics: DashboardMetric[] = [
        {
          title: 'Active Goals',
          value: 24,
          change: {
            value: 12,
            type: 'increase',
            period: 'this month'
          },
          icon: <ChartBarIcon className="h-6 w-6" />,
          color: 'blue'
        },
        {
          title: 'Pending Reviews',
          value: 6,
          change: {
            value: 2,
            type: 'decrease',
            period: 'vs last week'
          },
          icon: <UserGroupIcon className="h-6 w-6" />,
          color: 'yellow'
        },
        {
          title: 'Feedback Requests',
          value: 18,
          change: {
            value: 8,
            type: 'increase',
            period: 'this quarter'
          },
          icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />,
          color: 'purple'
        },
        {
          title: 'Avg Performance',
          value: '4.2',
          change: {
            value: 5.2,
            type: 'increase',
            period: 'vs last quarter'
          },
          icon: <DocumentChartBarIcon className="h-6 w-6" />,
          color: 'green'
        }
      ];

      const mockActivities = [
        {
          id: '1',
          type: 'goal' as const,
          title: 'New Goal Created',
          description: 'Dr. Sarah Johnson created "Improve Client Satisfaction"',
          date: '2024-10-23T10:30:00Z',
          status: 'active'
        },
        {
          id: '2',
          type: 'review' as const,
          title: 'Review Completed',
          description: 'Mid-year review completed for Mark Thompson',
          date: '2024-10-22T14:20:00Z',
          status: 'completed'
        },
        {
          id: '3',
          type: 'feedback' as const,
          title: 'Feedback Received',
          description: '360-degree feedback submitted for Dr. Sarah Johnson',
          date: '2024-10-22T09:15:00Z',
          status: 'completed'
        },
        {
          id: '4',
          type: 'goal' as const,
          title: 'Goal Progress Updated',
          description: 'Surgery success rate goal reached 95% completion',
          date: '2024-10-21T16:45:00Z',
          status: 'in-progress'
        },
        {
          id: '5',
          type: 'feedback' as const,
          title: 'Feedback Request Sent',
          description: 'Peer feedback requested for Lisa Chen',
          date: '2024-10-21T11:30:00Z',
          status: 'pending'
        }
      ];

      setState(prev => ({ 
        ...prev, 
        metrics: mockMetrics,
        recentActivities: mockActivities,
        loading: false 
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return <ChartBarIcon className="h-5 w-5 text-blue-500" />;
      case 'review':
        return <UserGroupIcon className="h-5 w-5 text-green-500" />;
      case 'feedback':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <DocumentChartBarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetricColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'purple': return 'text-purple-600';
      case 'yellow': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Performance Management</h1>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-6">
        {/* Overview Content */}
        <div>
          <p className="text-sm text-gray-700 mb-6">
            Manage goals, reviews, feedback, and performance analytics for your team.
          </p>
        </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {state.metrics.map((metric, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className={getMetricColor(metric.color!)}>
                    {metric.icon}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {metric.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {metric.value}
                      </div>
                      {metric.change && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          metric.change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <ArrowTrendingUpIcon className={`h-4 w-4 shrink-0 self-center ${
                            metric.change.type === 'decrease' ? 'rotate-180' : ''
                          }`} />
                          <span className="sr-only">
                            {metric.change.type === 'increase' ? 'Increased' : 'Decreased'} by
                          </span>
                          {metric.change.value}%
                        </div>
                      )}
                    </dd>
                    {metric.change && (
                      <dd className="text-xs text-gray-500">
                        {metric.change.period}
                      </dd>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Activity
          </h3>
          <Link
            href="/performance/reports"
            className="text-sm text-blue-600 hover:text-blue-900 font-medium"
          >
            View All
          </Link>
        </div>
        
        <div className="divide-y divide-gray-200">
          {state.recentActivities.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-3">
                <div className="shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(activity.date).toLocaleString()}
                  </p>
                </div>
                <div className="shrink-0">
                  <button className="text-gray-400 hover:text-gray-600">
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Goal Completion Rate</h4>
                <p className="text-xs text-blue-700 mt-1">
                  85% of goals are on track this quarter (+12% from last quarter)
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <UserGroupIcon className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-green-900">Team Performance</h4>
                <p className="text-xs text-green-700 mt-1">
                  Average team rating increased to 4.2/5.0 this quarter
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-purple-900">Feedback Engagement</h4>
                <p className="text-xs text-purple-700 mt-1">
                  95% response rate on feedback requests this month
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <DocumentChartBarIcon className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900">Review Status</h4>
                <p className="text-xs text-yellow-700 mt-1">
                  6 pending reviews need completion by month-end
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}