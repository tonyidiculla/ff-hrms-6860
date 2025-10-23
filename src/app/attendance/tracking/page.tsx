'use client';

import React, { useState } from 'react';
import { 
  ClockIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  PlusIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { AttendanceRecord, Employee } from '@/types/hr';
import { formatDate, getRelativeTime } from '@/lib/utils';

const mockEmployees: Employee[] = [
  {
    id: 'emp-001',
    employeeId: 'EMP001',
    firstName: 'Dr. Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@furfield.com',
    departmentId: 'dept-1',
    positionId: 'pos-001',
    hireDate: '2020-01-15',
    status: 'active',
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  },
  {
    id: 'emp-002',
    employeeId: 'EMP002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@furfield.com',
    departmentId: 'dept-1',
    positionId: 'pos-002',
    hireDate: '2021-03-15',
    status: 'active',
    createdAt: '2021-03-15T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  },
  {
    id: 'emp-003',
    employeeId: 'EMP003',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@furfield.com',
    departmentId: 'dept-2',
    positionId: 'pos-003',
    hireDate: '2021-08-20',
    status: 'active',
    createdAt: '2021-08-20T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  },
  {
    id: 'emp-004',
    employeeId: 'EMP004',
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson@furfield.com',
    departmentId: 'dept-2',
    positionId: 'pos-004',
    hireDate: '2020-06-10',
    status: 'active',
    createdAt: '2020-06-10T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  }
];

const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-001',
    employeeId: 'emp-001',
    date: '2025-10-23',
    checkIn: '08:00:00',
    checkOut: '17:30:00',
    totalHours: 8.5,
    overtimeHours: 0.5,
    status: 'present',
    notes: 'Regular workday',
    createdAt: '2025-10-23T08:00:00Z',
    updatedAt: '2025-10-23T17:30:00Z'
  },
  {
    id: 'att-002',
    employeeId: 'emp-002',
    date: '2025-10-23',
    checkIn: '08:15:00',
    checkOut: '17:00:00',
    totalHours: 8.25,
    status: 'late',
    notes: 'Arrived 15 minutes late',
    createdAt: '2025-10-23T08:15:00Z',
    updatedAt: '2025-10-23T17:00:00Z'
  },
  {
    id: 'att-003',
    employeeId: 'emp-003',
    date: '2025-10-23',
    status: 'absent',
    notes: 'Sick leave',
    createdAt: '2025-10-23T00:00:00Z',
    updatedAt: '2025-10-23T00:00:00Z'
  },
  {
    id: 'att-004',
    employeeId: 'emp-004',
    date: '2025-10-23',
    checkIn: '09:00:00',
    status: 'half-day',
    totalHours: 4,
    notes: 'Half day - left early for appointment',
    createdAt: '2025-10-23T09:00:00Z',
    updatedAt: '2025-10-23T13:00:00Z'
  },
  {
    id: 'att-005',
    employeeId: 'emp-001',
    date: '2025-10-22',
    checkIn: '07:45:00',
    checkOut: '18:00:00',
    totalHours: 9.25,
    overtimeHours: 1.25,
    status: 'present',
    notes: 'Emergency surgery',
    createdAt: '2025-10-22T07:45:00Z',
    updatedAt: '2025-10-22T18:00:00Z'
  },
  {
    id: 'att-006',
    employeeId: 'emp-002',
    date: '2025-10-22',
    checkIn: '08:00:00',
    checkOut: '16:30:00',
    totalHours: 8,
    status: 'present',
    createdAt: '2025-10-22T08:00:00Z',
    updatedAt: '2025-10-22T16:30:00Z'
  }
];

export default function AttendanceTrackingPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const getEmployeeName = (employeeId: string) => {
    const employee = mockEmployees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  };

  const getEmployeeByName = (employeeId: string) => {
    return mockEmployees.find(emp => emp.id === employeeId);
  };

  const calculateHours = (clockIn: string, clockOut: string, breakDuration: number = 0) => {
    const start = new Date(`2000-01-01T${clockIn}`);
    const end = new Date(`2000-01-01T${clockOut}`);
    const diffMs = end.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    return Math.max(0, hours - (breakDuration / 60));
  };

  const filteredRecords = mockAttendanceRecords.filter(record => {
    const matchesDate = record.date === selectedDate;
    const employee = getEmployeeByName(record.employeeId);
    const matchesSearch = employee ? 
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  const handleClockAction = async (employeeId: string, action: 'in' | 'out') => {
    setIsClockingIn(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentTime = new Date().toTimeString().slice(0, 8);
      console.log(`${action === 'in' ? 'Clock in' : 'Clock out'} for employee ${employeeId} at ${currentTime}`);
      alert(`Successfully clocked ${action} at ${currentTime}`);
      
    } catch (error) {
      console.error('Error with clock action:', error);
      alert('Error processing clock action. Please try again.');
    } finally {
      setIsClockingIn(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'absent':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'late':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />;
      case 'half-day':
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      case 'leave':
        return <CalendarDaysIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'present':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'absent':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'late':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'half-day':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'leave':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const todayRecords = mockAttendanceRecords.filter(r => r.date === new Date().toISOString().split('T')[0]);
  const presentToday = todayRecords.filter(r => r.status === 'present').length;
  const absentToday = todayRecords.filter(r => r.status === 'absent').length;
  const lateToday = todayRecords.filter(r => r.status === 'late').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendance Tracking</h1>
              <p className="text-gray-600">Monitor employee attendance and working hours</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Clock In/Out */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-8 text-white">
        <h2 className="text-xl font-semibold mb-4">Quick Clock In/Out</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-2 border border-blue-400 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Select Employee</option>
            {mockEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName} ({employee.employeeId})
              </option>
            ))}
          </select>
          
          <button
            onClick={() => selectedEmployee && handleClockAction(selectedEmployee, 'in')}
            disabled={!selectedEmployee || isClockingIn}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon className="h-4 w-4" />
            <span>Clock In</span>
          </button>
          
          <button
            onClick={() => selectedEmployee && handleClockAction(selectedEmployee, 'out')}
            disabled={!selectedEmployee || isClockingIn}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <StopIcon className="h-4 w-4" />
            <span>Clock Out</span>
          </button>
          
          {isClockingIn && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <p className="text-2xl font-bold text-green-600">{presentToday}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Absent Today</p>
              <p className="text-2xl font-bold text-red-600">{absentToday}</p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Late Arrivals</p>
              <p className="text-2xl font-bold text-yellow-600">{lateToday}</p>
            </div>
            <ExclamationCircleIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-blue-600">{mockEmployees.length}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="selectedDate" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <CalendarDaysIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="date"
                id="selectedDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-2">
              Search Employee
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="searchTerm"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
              <option value="leave">Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Attendance Records for {formatDate(selectedDate)} ({filteredRecords.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredRecords.map((record) => {
            const employee = getEmployeeByName(record.employeeId);
            
            return (
              <div key={record.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {employee ? `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}` : '??'}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getEmployeeName(record.employeeId)}
                      </h3>
                      <p className="text-gray-600">{employee?.employeeId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        <span className={getStatusBadge(record.status)}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    {record.checkIn && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Check In</p>
                        <p className="font-semibold text-gray-900">{record.checkIn}</p>
                      </div>
                    )}
                    
                    {record.checkOut && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Check Out</p>
                        <p className="font-semibold text-gray-900">{record.checkOut}</p>
                      </div>
                    )}
                    
                    {record.totalHours && record.totalHours > 0 && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Hours Worked</p>
                        <p className="font-semibold text-gray-900">{record.totalHours.toFixed(1)}h</p>
                      </div>
                    )}
                    
                    {record.overtimeHours && record.overtimeHours > 0 && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Overtime</p>
                        <p className="font-semibold text-orange-600">{record.overtimeHours}h</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {record.notes && (
                  <div className="mt-4 ml-14">
                    <p className="text-sm text-gray-600">
                      <strong>Notes:</strong> {record.notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredRecords.length === 0 && (
            <div className="p-12 text-center">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No attendance records match your current filters for {formatDate(selectedDate)}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}