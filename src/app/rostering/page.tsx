'use client';

import { useState } from 'react';
import {
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  CogIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { HRMSLayout, ContentCard, MetricsGrid } from '@/components/layout/HRMSLayout';
import { MetricCard } from '@/components/ui/MetricCard';
import { TabItem } from '@/types/layout';
import { useWeeklyRoster } from '@/hooks/useRostering';
import { DAY_NAMES } from '@/types/rostering';

import { AddShiftModal } from '@/components/rostering/AddShiftModal';
import { StaffManagementModal } from '@/components/rostering/StaffManagementModal';
import { QuickActionsPanel } from '@/components/rostering/QuickActionsPanel';
import type { 
  CreateWeeklyScheduleRequest, 
  CreateScheduleExceptionRequest,
  CreateStaffMemberRequest,
  UpdateStaffMemberRequest,
  StaffMember 
} from '@/types/rostering';

const tabs: TabItem[] = [
  { 
    name: 'Schedule Overview', 
    href: '/rostering',
    icon: CalendarIcon
  },
  { 
    name: 'Employee Requests', 
    href: '/rostering/requests',
    icon: ArrowsRightLeftIcon
  },
  { 
    name: 'Shift Templates', 
    href: '/rostering/templates',
    icon: DocumentTextIcon
  },
  { 
    name: 'Settings', 
    href: '/rostering/settings',
    icon: CogIcon
  },
];

const headerProps = {
  title: "Staff Rostering",
  subtitle: "Manage staff schedules, shifts, availability, and employee schedule requests",
  breadcrumbs: [
    { name: 'HRMS', href: '/' },
    { name: 'Rostering' }
  ]
};

export default function RosteringPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [showAddShift, setShowAddShift] = useState(false);
  const [showStaffManagement, setShowStaffManagement] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Use the database-connected rostering hook
  const {
    selectedWeek,
    weeklyRoster,
    staffMembers,
    metrics,
    loading,
    loadingRoster,
    error,
    navigateToPreviousWeek,
    navigateToNextWeek,
    navigateToCurrentWeek,
    upsertWeeklySchedule,
    deleteWeeklySchedule,
    createScheduleException,
    createStaffMember,
    updateStaffMember
  } = useWeeklyRoster();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format the selected week for display
  const formatWeekDisplay = (date: Date) => {
    const weekEnd = new Date(date);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric'
    };
    
    if (date.getFullYear() !== weekEnd.getFullYear()) {
      return `${date.toLocaleDateString('en-US', { ...options, year: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
    } else if (date.getMonth() !== weekEnd.getMonth()) {
      return `${date.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}, ${date.getFullYear()}`;
    } else {
      return `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weekEnd.getDate()}, ${date.getFullYear()}`;
    }
  };

  // Handler functions
  const handleAddShift = () => {
    setShowAddShift(true);
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    setShowStaffManagement(true);
  };

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setShowStaffManagement(true);
  };

  const handleEditShift = (shiftId: string) => {
    console.log('Edit shift:', shiftId);
    // TODO: Open edit shift modal
  };

  const handleDeleteShift = async (scheduleId: string) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      try {
        await deleteWeeklySchedule(scheduleId);
        console.log('Shift deleted successfully');
      } catch (error) {
        console.error('Error deleting shift:', error);
      }
    }
  };

  // Modal handlers
  const handleShiftSubmit = async (request: CreateWeeklyScheduleRequest | CreateScheduleExceptionRequest, type: 'schedule' | 'exception') => {
    try {
      if (type === 'schedule') {
        await upsertWeeklySchedule(request as CreateWeeklyScheduleRequest);
      } else {
        await createScheduleException(request as CreateScheduleExceptionRequest);
      }
      console.log(`${type === 'schedule' ? 'Schedule' : 'Exception'} created successfully`);
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      throw error;
    }
  };

  const handleStaffSubmit = async (request: CreateStaffMemberRequest | UpdateStaffMemberRequest, isEdit: boolean) => {
    try {
      if (isEdit && editingStaff) {
        await updateStaffMember(editingStaff.id, request as UpdateStaffMemberRequest);
        console.log('Staff member updated successfully');
      } else {
        await createStaffMember(request as CreateStaffMemberRequest);
        console.log('Staff member created successfully');
      }
    } catch (error) {
      console.error('Error saving staff member:', error);
      throw error;
    }
  };

  const handleCreateTemplate = () => {
    console.log('Create weekly template');
  };

  const handleManageAvailability = () => {
    console.log('Manage availability');
  };

  const handleEmployeeRequests = () => {
    window.location.href = '/rostering/requests';
  };

  const handleBulkSchedule = () => {
    console.log('Opening bulk schedule operations...');
    // TODO: Implement bulk scheduling modal
  };

  const handleManageExceptions = () => {
    console.log('Opening schedule exceptions management...');
    // TODO: Implement exceptions management modal
  };

  const handleViewReports = () => {
    console.log('Opening rostering reports...');
    // TODO: Navigate to reports page
  };

  const handleSettings = () => {
    console.log('Opening rostering settings...');
    // TODO: Navigate to settings page
  };

  return (
    <HRMSLayout header={headerProps} tabs={tabs}>
      {/* Error Display */}
      {error && (
        <ContentCard title="Error" className="mb-6">
          <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
          </div>
        </ContentCard>
      )}

      {/* Rostering Metrics */}
      <MetricsGrid>
        <MetricCard
          title="This Week Shifts"
          value={metrics?.shifts_this_week?.toString() || '0'}
          trend={{ direction: 'up', value: 0 }}
          icon={CalendarIcon}
          color="blue"
        />
        <MetricCard
          title="Staff Scheduled"
          value={metrics?.active_staff?.toString() || '0'}
          trend={{ direction: 'up', value: 0 }}
          icon={UserGroupIcon}
          color="green"
        />
        <MetricCard
          title="Total Hours"
          value={metrics?.total_hours_this_week?.toString() || '0'}
          trend={{ direction: 'up', value: 0 }}
          icon={ClockIcon}
          color="purple"
        />
        <MetricCard
          title="Coverage Rate"
          value={`${metrics?.coverage_rate || 0}%`}
          trend={{ direction: 'up', value: 0 }}
          icon={AdjustmentsHorizontalIcon}
          color="green"
        />
      </MetricsGrid>

      {/* Week Navigation */}
      <ContentCard 
        title={`Week of ${formatWeekDisplay(selectedWeek)}`}
        headerActions={
          <div className="flex gap-2">
            <button onClick={navigateToPreviousWeek} className="hrms-btn hrms-btn-secondary text-sm">Previous</button>
            <button onClick={navigateToCurrentWeek} className="hrms-btn hrms-btn-secondary text-sm">Today</button>
            <button onClick={navigateToNextWeek} className="hrms-btn hrms-btn-secondary text-sm">Next</button>
            <button onClick={handleAddStaff} className="hrms-btn hrms-btn-secondary text-sm">
              <UserGroupIcon className="w-4 h-4 mr-1" />
              Add Staff
            </button>
            <button onClick={handleAddShift} className="hrms-btn hrms-btn-primary text-sm">
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Shift
            </button>
          </div>
        }
      >
        {/* Shifts Table */}
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingRoster ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                      Loading roster data...
                    </div>
                  </td>
                </tr>
              ) : weeklyRoster.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No roster data available for this week.
                    <div className="mt-2">
                      <button 
                        onClick={handleAddShift} 
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Create your first shift
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                weeklyRoster.flatMap((daySchedule) =>
                  daySchedule.staff_schedules
                    .filter(staffSchedule => staffSchedule.regular_schedule || staffSchedule.bookings.length > 0)
                    .map((staffSchedule, index) => {
                      const schedule = staffSchedule.regular_schedule;
                      const staff = staffSchedule.staff_member;
                      const hasExceptions = staffSchedule.exceptions.length > 0;
                      const hasBookings = staffSchedule.bookings.length > 0;
                      
                      return (
                        <tr key={`${daySchedule.date}-${staff.id}-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <button
                              onClick={() => handleEditStaff(staff)}
                              className="text-gray-900 hover:text-blue-600 font-medium"
                            >
                              {staff.full_name}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {staff.role_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(daySchedule.date).toLocaleDateString()}
                            <div className="text-xs text-gray-400">
                              {DAY_NAMES[daySchedule.day_of_week]}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {schedule ? `${schedule.start_time} - ${schedule.end_time}` : 'No regular schedule'}
                            {hasBookings && (
                              <div className="text-xs text-blue-600 mt-1">
                                {staffSchedule.bookings.length} appointment(s)
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              hasExceptions ? 'bg-yellow-100 text-yellow-800' : 
                              schedule?.is_available ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {hasExceptions ? 'Exception' : 
                               schedule?.is_available ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleEditShift(schedule?.id || staff.id)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              Edit
                            </button>
                            {schedule && (
                              <button 
                                onClick={() => handleDeleteShift(schedule.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                )
              )}
            </tbody>
          </table>
        </div>
      </ContentCard>

      {/* Quick Actions */}
      <QuickActionsPanel
        onCreateTemplate={handleCreateTemplate}
        onManageAvailability={handleManageAvailability}
        onViewRequests={handleEmployeeRequests}
        onBulkSchedule={handleBulkSchedule}
        onViewReports={handleViewReports}
        onManageExceptions={handleManageExceptions}
        onSettings={handleSettings}
        onStaffManagement={handleAddStaff}
        pendingRequests={0}
        loading={loading}
      />

      {/* Modals */}
      <AddShiftModal
        isOpen={showAddShift}
        onClose={() => setShowAddShift(false)}
        onSubmit={handleShiftSubmit}
        staffMembers={staffMembers}
        loading={loading}
      />

      <StaffManagementModal
        isOpen={showStaffManagement}
        onClose={() => {
          setShowStaffManagement(false);
          setEditingStaff(null);
        }}
        onSubmit={handleStaffSubmit}
        staffMember={editingStaff || undefined}
        loading={loading}
      />
    </HRMSLayout>
  );
}
