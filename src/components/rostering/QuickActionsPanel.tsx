import React from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowsRightLeftIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface QuickActionsProps {
  onCreateTemplate: () => void;
  onManageAvailability: () => void;
  onViewRequests: () => void;
  onBulkSchedule: () => void;
  onViewReports: () => void;
  onManageExceptions: () => void;
  onSettings: () => void;
  onStaffManagement: () => void;
  pendingRequests?: number;
  loading?: boolean;
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  badge?: number;
  disabled?: boolean;
}

function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  color, 
  badge,
  disabled = false 
}: QuickActionCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100',
    green: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100',
    red: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100',
    gray: 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    gray: 'text-gray-600'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative p-4 border rounded-lg text-left transition-all duration-200
        ${colorClasses[color]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md transform hover:scale-105'}
      `}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`h-6 w-6 ${iconColorClasses[color]} shrink-0 mt-1`} />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 mb-1">
            {title}
            {badge !== undefined && badge > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {badge}
              </span>
            )}
          </h4>
          <p className="text-sm text-gray-600 leading-5">{description}</p>
        </div>
      </div>
    </button>
  );
}

export function QuickActionsPanel({
  onCreateTemplate,
  onManageAvailability,
  onViewRequests,
  onBulkSchedule,
  onViewReports,
  onManageExceptions,
  onSettings,
  onStaffManagement,
  pendingRequests = 0,
  loading = false
}: QuickActionsProps) {
  const actions = [
    {
      title: 'Create Schedule Template',
      description: 'Set up recurring shift patterns and weekly templates',
      icon: DocumentDuplicateIcon,
      onClick: onCreateTemplate,
      color: 'blue' as const
    },
    {
      title: 'Manage Staff Availability',
      description: 'Update staff availability preferences and constraints',
      icon: UserGroupIcon,
      onClick: onManageAvailability,
      color: 'green' as const
    },
    {
      title: 'Employee Requests',
      description: 'View and approve shift change and time-off requests',
      icon: ArrowsRightLeftIcon,
      onClick: onViewRequests,
      color: 'purple' as const,
      badge: pendingRequests
    },
    {
      title: 'Bulk Schedule Operations',
      description: 'Apply templates, copy schedules, or bulk edit shifts',
      icon: CalendarDaysIcon,
      onClick: onBulkSchedule,
      color: 'orange' as const
    },
    {
      title: 'Schedule Exceptions',
      description: 'Manage holidays, vacations, and special scheduling needs',
      icon: ExclamationTriangleIcon,
      onClick: onManageExceptions,
      color: 'red' as const
    },
    {
      title: 'Rostering Reports',
      description: 'View coverage reports, staff utilization, and analytics',
      icon: ChartBarIcon,
      onClick: onViewReports,
      color: 'gray' as const
    },
    {
      title: 'Staff Management',
      description: 'Add, edit, or manage staff member information and roles',
      icon: UserGroupIcon,
      onClick: onStaffManagement,
      color: 'blue' as const
    },
    {
      title: 'Rostering Settings',
      description: 'Configure scheduling rules, notifications, and preferences',
      icon: Cog6ToothIcon,
      onClick: onSettings,
      color: 'gray' as const
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        {loading && (
          <div className="flex items-center text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
            Loading...
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <QuickActionCard
            key={index}
            title={action.title}
            description={action.description}
            icon={action.icon}
            onClick={action.onClick}
            color={action.color}
            badge={action.badge}
            disabled={loading}
          />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Rostering System Status</h4>
            <p className="text-sm text-gray-600">
              All rostering features are now integrated with the database
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{pendingRequests}</div>
              <div className="text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">Active</div>
              <div className="text-gray-500">System</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}