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
  CogIcon
} from '@heroicons/react/24/outline';
import { HRMSLayout, ContentCard, MetricsGrid } from '@/components/layout/HRMSLayout';
import { MetricCard } from '@/components/ui/MetricCard';
import { TabItem } from '@/types/layout';

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
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [showAddShift, setShowAddShift] = useState(false);

  // Mock data for demonstration
  const shifts = [
    { id: 1, employee: 'Dr. Sarah Johnson', role: 'Veterinarian', date: '2025-10-28', time: '08:00 - 16:00', status: 'confirmed' },
    { id: 2, employee: 'Mike Chen', role: 'Vet Tech', date: '2025-10-28', time: '09:00 - 17:00', status: 'pending' },
    { id: 3, employee: 'Emily Rodriguez', role: 'Receptionist', date: '2025-10-29', time: '07:30 - 15:30', status: 'confirmed' },
    { id: 4, employee: 'Dr. James Wilson', role: 'Veterinarian', date: '2025-10-29', time: '16:00 - 00:00', status: 'confirmed' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handler functions
  const handlePreviousWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
    console.log('Previous week selected:', newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
    console.log('Next week selected:', newDate);
  };

  const handleToday = () => {
    setSelectedWeek(new Date());
    console.log('Today selected');
  };

  const handleAddShift = () => {
    setShowAddShift(true);
    console.log('Add shift modal opened');
  };

  const handleEditShift = (shiftId: number) => {
    console.log('Edit shift:', shiftId);
  };

  const handleDeleteShift = (shiftId: number) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      console.log('Delete shift:', shiftId);
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

  return (
    <HRMSLayout header={headerProps} tabs={tabs}>
      {/* Rostering Metrics */}
      <MetricsGrid>
        <MetricCard
          title="This Week Shifts"
          value="24"
          trend={{ direction: 'up', value: 3 }}
          icon={CalendarIcon}
          color="blue"
        />
        <MetricCard
          title="Staff Scheduled"
          value="12"
          trend={{ direction: 'up', value: 2 }}
          icon={UserGroupIcon}
          color="green"
        />
        <MetricCard
          title="Total Hours"
          value="192"
          trend={{ direction: 'up', value: 8 }}
          icon={ClockIcon}
          color="purple"
        />
        <MetricCard
          title="Coverage Rate"
          value="98%"
          trend={{ direction: 'up', value: 2 }}
          icon={AdjustmentsHorizontalIcon}
          color="green"
        />
      </MetricsGrid>

      {/* Week Navigation */}
      <ContentCard 
        title="Week of October 28, 2025"
        headerActions={
          <div className="flex gap-2">
            <button onClick={handlePreviousWeek} className="hrms-btn hrms-btn-secondary text-sm">Previous</button>
            <button onClick={handleToday} className="hrms-btn hrms-btn-secondary text-sm">Today</button>
            <button onClick={handleNextWeek} className="hrms-btn hrms-btn-secondary text-sm">Next</button>
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
              {shifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {shift.employee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shift.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(shift.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shift.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shift.status)}`}>
                      {shift.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEditShift(shift.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteShift(shift.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>

      {/* Quick Actions */}
      <ContentCard title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleCreateTemplate}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <CalendarIcon className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Create Weekly Template</h4>
            <p className="text-sm text-gray-500">Set up recurring shift patterns</p>
          </button>
          <button 
            onClick={handleManageAvailability}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <UserGroupIcon className="h-6 w-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Availability</h4>
            <p className="text-sm text-gray-500">Update staff availability preferences</p>
          </button>
          <button 
            onClick={handleEmployeeRequests}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <ArrowsRightLeftIcon className="h-6 w-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Employee Requests</h4>
            <p className="text-sm text-gray-500">View and manage shift change requests</p>
          </button>
        </div>
      </ContentCard>
    </HRMSLayout>
  );
}
