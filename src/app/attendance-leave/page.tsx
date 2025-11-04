'use client';

import React, { useState } from 'react';
import { 
  ClockIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  PlusIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HRMSLayout, ContentCard, MetricsGrid } from '@/components/layout/HRMSLayout';
import { MetricCard } from '@/components/ui/MetricCard';
import { TabItem } from '@/types/layout';

// Main navigation tabs
const mainTabs: TabItem[] = [
  { 
    name: 'Attendance', 
    href: '/attendance-leave?tab=attendance',
    icon: ClockIcon
  },
  { 
    name: 'Leave', 
    href: '/attendance-leave?tab=leave',
    icon: CalendarDaysIcon
  },
];

// Attendance sub-tabs
const attendanceTabs: TabItem[] = [
  { 
    name: 'Overview', 
    href: '/attendance-leave?tab=attendance&subtab=overview',
    icon: ChartBarIcon
  },
  { 
    name: 'Tracking', 
    href: '/attendance-leave?tab=attendance&subtab=tracking',
    icon: ClockIcon
  },
  { 
    name: 'Time Off', 
    href: '/attendance-leave?tab=attendance&subtab=timeoff',
    icon: CalendarDaysIcon
  },
  { 
    name: 'Overtime', 
    href: '/attendance-leave?tab=attendance&subtab=overtime',
    icon: ClockIcon,
    badge: 5
  },
  { 
    name: 'Reports', 
    href: '/attendance-leave?tab=attendance&subtab=reports',
    icon: DocumentChartBarIcon
  },
];

// Leave sub-tabs
const leaveTabs: TabItem[] = [
  { 
    name: 'Overview', 
    href: '/attendance-leave?tab=leave&subtab=overview',
    icon: CalendarDaysIcon
  },
  { 
    name: 'New Request', 
    href: '/attendance-leave?tab=leave&subtab=new',
    icon: PlusIcon
  },
  { 
    name: 'Calendar', 
    href: '/attendance-leave?tab=leave&subtab=calendar',
    icon: CalendarIcon
  },
  { 
    name: 'Policies', 
    href: '/attendance-leave?tab=leave&subtab=policies',
    icon: DocumentTextIcon
  },
];

export default function AttendanceLeavePage() {
  const [activeMainTab, setActiveMainTab] = useState<'attendance' | 'leave'>('attendance');
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Parse URL parameters and listen for changes
  React.useEffect(() => {
    const updateFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      const subtab = urlParams.get('subtab') || 'overview';
      
      if (tab === 'leave') {
        setActiveMainTab('leave');
      } else {
        setActiveMainTab('attendance');
      }
      setActiveSubTab(subtab);
    };

    // Update on initial load
    updateFromURL();

    // Listen for URL changes
    const handlePopState = () => updateFromURL();
    window.addEventListener('popstate', handlePopState);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const headerProps = {
    title: "Attendance & Leave Management",
    subtitle: "Manage employee attendance, leave requests, and time tracking",
    breadcrumbs: [
      { name: 'HRMS', href: '/' },
      { name: 'Attendance & Leave' }
    ]
  };

  const renderAttendanceActions = () => (
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

  const renderLeaveActions = () => (
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

  const renderAttendanceContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return (
          <>
            <MetricsGrid>
              <MetricCard
                title="Present Today"
                value="142"
                icon={UserIcon}
                trend={{ value: 5.2, direction: 'up' }}
                color="green"
              />
              <MetricCard
                title="Late Arrivals"
                value="8"
                icon={ClockIcon}
                trend={{ value: 2.1, direction: 'down' }}
                color="yellow"
              />
              <MetricCard
                title="Overtime Hours"
                value="23.5"
                icon={ChartBarIcon}
                trend={{ value: 8.3, direction: 'up' }}
                color="blue"
              />
              <MetricCard
                title="Absences"
                value="8"
                icon={ExclamationTriangleIcon}
                trend={{ value: 1.5, direction: 'down' }}
                color="red"
              />
            </MetricsGrid>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContentCard title="Recent Clock-ins">
                <div className="space-y-4">
                  {[
                    { name: "Sarah Johnson", time: "8:30 AM", status: "On Time" },
                    { name: "Mike Chen", time: "8:45 AM", status: "Late" },
                    { name: "Emily Davis", time: "9:00 AM", status: "On Time" },
                  ].map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          entry.status === 'On Time' ? 'bg-green-500' : 'bg-orange-500'
                        }`}></div>
                        <span className="font-medium">{entry.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{entry.time}</div>
                        <div className={`text-xs ${
                          entry.status === 'On Time' ? 'text-green-600' : 'text-orange-600'
                        }`}>{entry.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ContentCard>

              <ContentCard title="Attendance Trends">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="text-sm font-medium">94.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '94.7%'}}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Week</span>
                    <span className="text-sm font-medium">96.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '96.2%'}}></div>
                  </div>
                </div>
              </ContentCard>
            </div>
          </>
        );
      case 'tracking':
        return (
          <ContentCard title="Time Tracking">
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Time Tracking Dashboard</h3>
              <p className="text-gray-600">Employee time tracking interface would be implemented here</p>
            </div>
          </ContentCard>
        );
      case 'timeoff':
        return (
          <ContentCard title="Time Off Requests">
            <div className="text-center py-12">
              <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Time Off Management</h3>
              <p className="text-gray-600">Time off requests and approvals would be managed here</p>
            </div>
          </ContentCard>
        );
      case 'overtime':
        return (
          <ContentCard title="Overtime Management">
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Overtime Tracking</h3>
              <p className="text-gray-600">Overtime hours and approvals would be tracked here</p>
            </div>
          </ContentCard>
        );
      case 'reports':
        return (
          <ContentCard title="Attendance Reports">
            <div className="text-center py-12">
              <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Attendance Reports</h3>
              <p className="text-gray-600">Generate and view attendance reports and analytics</p>
            </div>
          </ContentCard>
        );
      default:
        return null;
    }
  };

  const renderLeaveContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return (
          <>
            <MetricsGrid>
              <MetricCard
                title="Pending Requests"
                value="12"
                icon={ClockIcon}
                trend={{ value: 3.2, direction: 'down' }}
                color="yellow"
              />
              <MetricCard
                title="Approved This Month"
                value="45"
                icon={CheckIcon}
                trend={{ value: 8.1, direction: 'up' }}
                color="green"
              />
              <MetricCard
                title="Current Absences"
                value="18"
                icon={CalendarDaysIcon}
                trend={{ value: 2.3, direction: 'up' }}
                color="blue"
              />
              <MetricCard
                title="Rejected Requests"
                value="3"
                icon={XMarkIcon}
                trend={{ value: 1.2, direction: 'down' }}
                color="red"
              />
            </MetricsGrid>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContentCard title="Recent Leave Requests">
                <div className="space-y-4">
                  {[
                    { name: "John Smith", type: "Annual Leave", dates: "Dec 20-22", status: "Pending" },
                    { name: "Lisa Wang", type: "Sick Leave", dates: "Dec 18", status: "Approved" },
                    { name: "David Brown", type: "Personal Leave", dates: "Dec 25-26", status: "Approved" },
                  ].map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          request.status === 'Approved' ? 'bg-green-500' : 
                          request.status === 'Pending' ? 'bg-orange-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <div className="font-medium">{request.name}</div>
                          <div className="text-sm text-gray-600">{request.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{request.dates}</div>
                        <div className={`text-xs ${
                          request.status === 'Approved' ? 'text-green-600' : 
                          request.status === 'Pending' ? 'text-orange-600' : 'text-red-600'
                        }`}>{request.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ContentCard>

              <ContentCard title="Leave Balance Overview">
                <div className="space-y-4">
                  {[
                    { type: "Annual Leave", used: 18, total: 25, remaining: 7 },
                    { type: "Sick Leave", used: 3, total: 10, remaining: 7 },
                    { type: "Personal Leave", used: 2, total: 5, remaining: 3 },
                  ].map((balance, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{balance.type}</span>
                        <span className="text-sm text-gray-600">{balance.remaining} days left</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${(balance.used / balance.total) * 100}%`}}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">{balance.used} of {balance.total} days used</div>
                    </div>
                  ))}
                </div>
              </ContentCard>
            </div>
          </>
        );
      case 'new':
        return (
          <ContentCard title="New Leave Request">
            <div className="text-center py-12">
              <PlusIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Submit Leave Request</h3>
              <p className="text-gray-600">New leave request form would be implemented here</p>
            </div>
          </ContentCard>
        );
      case 'calendar':
        return (
          <ContentCard title="Leave Calendar">
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Leave Calendar View</h3>
              <p className="text-gray-600">Calendar view of all leave requests would be shown here</p>
            </div>
          </ContentCard>
        );
      case 'policies':
        return (
          <ContentCard title="Leave Policies">
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Leave Policies</h3>
              <p className="text-gray-600">Leave policies and guidelines would be displayed here</p>
            </div>
          </ContentCard>
        );
      default:
        return null;
    }
  };

  // Use only the sub-tabs for current main tab section  
  const currentTabs = activeMainTab === 'attendance' ? attendanceTabs : leaveTabs;

  return (
    <HRMSLayout 
      header={{
        ...headerProps,
        actions: activeMainTab === 'attendance' ? renderAttendanceActions() : renderLeaveActions()
      }}
      // Don't pass tabs to HRMSLayout - we'll handle navigation manually
    >
      {/* Main tab switcher - appears FIRST */}
      <div className="border-b border-gray-200 mb-6">
        <div className="sm:hidden">
          <select 
            value={activeMainTab}
            onChange={(e) => {
              const newTab = e.target.value as 'attendance' | 'leave';
              window.location.href = `/attendance-leave?tab=${newTab}&subtab=overview`;
            }}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
          >
            <option value="attendance">Attendance</option>
            <option value="leave">Leave</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="-mb-px flex space-x-8" aria-label="Main sections">
            {mainTabs.map((tab) => {
              const isActive = tab.name.toLowerCase() === activeMainTab;
              const tabName = tab.name.toLowerCase();
              return (
                <a
                  key={tab.name}
                  href={`/attendance-leave?tab=${tabName}&subtab=overview`}
                  className={`border-b-2 px-1 py-4 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    {tab.icon && React.createElement(tab.icon, { className: "h-5 w-5 mr-2" })}
                    {tab.name}
                  </div>
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sub-tabs - appear SECOND */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Sub sections">
          {currentTabs.map((tab) => {
            const TabIcon = tab.icon;
            let isActive = false;
            
            // Parse the tab URL to get subtab value
            if (typeof window !== 'undefined') {
              const currentURL = new URL(window.location.href);
              const tabURL = new URL(tab.href, window.location.origin);
              
              const currentParams = currentURL.searchParams;
              const tabParams = tabURL.searchParams;
              
              if (currentURL.pathname === tabURL.pathname) {
                let paramsMatch = true;
                for (const [key, value] of tabParams.entries()) {
                  if (currentParams.get(key) !== value) {
                    paramsMatch = false;
                    break;
                  }
                }
                isActive = paramsMatch;
              }
            }
            
            return (
              <a
                key={tab.name}
                href={tab.href}
                className={`group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {TabIcon && (
                  <TabIcon 
                    className={`-ml-0.5 mr-2 h-5 w-5 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} 
                  />
                )}
                <span>{tab.name}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isActive 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeMainTab === 'attendance' && renderAttendanceContent()}
      {activeMainTab === 'leave' && renderLeaveContent()}
    </HRMSLayout>
  );
}