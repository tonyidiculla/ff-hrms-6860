'use client';

import { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  ClockIcon, 
  ChartBarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { DashboardMetric } from '@/types/hr';

interface HRDashboardState {
  metrics: DashboardMetric[];
  upcomingEvents: {
    id: string;
    type: 'review' | 'leave' | 'training' | 'goal';
    title: string;
    date: string;
    status: string;
  }[];
  recentActivities: {
    id: string;
    type: 'employee' | 'leave' | 'performance' | 'training';
    title: string;
    description: string;
    date: string;
  }[];
  loading: boolean;
}

export default function HRMSPage() {
  const [state, setState] = useState<HRDashboardState>({
    metrics: [],
    upcomingEvents: [],
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
          title: 'Total Employees',
          value: 127,
          change: {
            value: 8,
            type: 'increase',
            period: 'this month'
          },
          icon: <UserGroupIcon className="h-6 w-6" />,
          color: 'blue'
        },
        {
          title: 'Pending Leave Requests',
          value: 12,
          change: {
            value: 3,
            type: 'decrease',
            period: 'vs last week'
          },
          icon: <CalendarIcon className="h-6 w-6" />,
          color: 'yellow'
        },
        {
          title: 'Active Performance Goals',
          value: 24,
          change: {
            value: 15,
            type: 'increase',
            period: 'this quarter'
          },
          icon: <ChartBarIcon className="h-6 w-6" />,
          color: 'green'
        },
        {
          title: 'Avg Attendance Rate',
          value: '96.8%',
          change: {
            value: 2.1,
            type: 'increase',
            period: 'vs last month'
          },
          icon: <ClockIcon className="h-6 w-6" />,
          color: 'purple'
        }
      ];

      const mockUpcomingEvents = [
        {
          id: '1',
          type: 'review' as const,
          title: 'Mid-year Review - Dr. Sarah Johnson',
          date: '2025-10-25',
          status: 'scheduled'
        },
        {
          id: '2',
          type: 'leave' as const,
          title: 'Annual Leave - Mark Thompson',
          date: '2025-10-28',
          status: 'approved'
        },
        {
          id: '3',
          type: 'training' as const,
          title: 'Advanced Surgical Training',
          date: '2025-11-01',
          status: 'upcoming'
        },
        {
          id: '4',
          type: 'goal' as const,
          title: 'Q4 Performance Goals Due',
          date: '2025-10-31',
          status: 'pending'
        }
      ];

      const mockRecentActivities = [
        {
          id: '1',
          type: 'employee' as const,
          title: 'New Employee Onboarded',
          description: 'Lisa Chen joined as Veterinary Technician',
          date: '2025-10-22T14:30:00Z'
        },
        {
          id: '2',
          type: 'leave' as const,
          title: 'Leave Request Approved',
          description: 'Mark Thompson - Annual Leave (5 days)',
          date: '2025-10-22T11:15:00Z'
        },
        {
          id: '3',
          type: 'performance' as const,
          title: 'Performance Goal Completed',
          description: 'Dr. Sarah Johnson achieved Client Satisfaction target',
          date: '2025-10-21T16:45:00Z'
        },
        {
          id: '4',
          type: 'training' as const,
          title: 'Training Session Completed',
          description: 'Emergency Procedures Training - 8 participants',
          date: '2025-10-21T09:30:00Z'
        }
      ];

      setState(prev => ({ 
        ...prev, 
        metrics: mockMetrics,
        upcomingEvents: mockUpcomingEvents,
        recentActivities: mockRecentActivities,
        loading: false 
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <ChartBarIcon className="h-5 w-5 text-blue-500" />;
      case 'leave':
        return <CalendarIcon className="h-5 w-5 text-green-500" />;
      case 'training':
        return <UserGroupIcon className="h-5 w-5 text-purple-500" />;
      case 'goal':
        return <ChartBarIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'employee':
        return <UserGroupIcon className="h-5 w-5 text-blue-500" />;
      case 'leave':
        return <CalendarIcon className="h-5 w-5 text-green-500" />;
      case 'performance':
        return <ChartBarIcon className="h-5 w-5 text-purple-500" />;
      case 'training':
        return <UserGroupIcon className="h-5 w-5 text-indigo-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold leading-6 text-gray-900">HR Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome to Furfield HR Management System. Manage your team, track performance, and streamline HR processes.
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

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/employees"
            className="group relative bg-blue-50 p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-blue-600 text-white">
                <UserGroupIcon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                <span className="absolute inset-0" aria-hidden="true" />
                Manage Employees
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Add, edit, and manage employee information and records.
              </p>
            </div>
          </Link>

          <Link
            href="/leave"
            className="group relative bg-green-50 p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-green-600 text-white">
                <CalendarIcon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                <span className="absolute inset-0" aria-hidden="true" />
                Leave Management
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Handle leave requests, policies, and employee time off.
              </p>
            </div>
          </Link>

          <Link
            href="/performance"
            className="group relative bg-purple-50 p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-purple-600 text-white">
                <ChartBarIcon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                <span className="absolute inset-0" aria-hidden="true" />
                Performance
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Track goals, reviews, and employee performance metrics.
              </p>
            </div>
          </Link>

          <Link
            href="/attendance"
            className="group relative bg-indigo-50 p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-indigo-600 text-white">
                <ClockIcon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                <span className="absolute inset-0" aria-hidden="true" />
                Attendance
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Monitor attendance, track hours, and manage schedules.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Upcoming Events and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Upcoming Events
            </h3>
            <Link
              href="/calendar"
              className="text-sm text-blue-600 hover:text-blue-900 font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="divide-y divide-gray-200">
            {state.upcomingEvents.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {event.title}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Activities
            </h3>
            <Link
              href="/activities"
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
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
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
      </div>

      {/* HR Insights */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">HR Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <UserGroupIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Team Growth</h4>
                <p className="text-xs text-blue-700 mt-1">
                  8 new hires this month, 6% growth in team size
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <ChartBarIcon className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-green-900">Performance</h4>
                <p className="text-xs text-green-700 mt-1">
                  Average team performance rating: 4.2/5.0 this quarter
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CalendarIcon className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900">Leave Balance</h4>
                <p className="text-xs text-yellow-700 mt-1">
                  12 pending leave requests require attention
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
