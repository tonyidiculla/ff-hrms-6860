'use client';

import { useState } from 'react';
import {
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  CogIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon
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
  title: "Employee Requests",
  subtitle: "Manage employee shift change requests, swaps, and schedule modifications",
  breadcrumbs: [
    { name: 'HRMS', href: '/' },
    { name: 'Rostering', href: '/rostering' },
    { name: 'Employee Requests' }
  ]
};

export default function EmployeeRequestsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [requests, setRequests] = useState([
    {
      id: 1,
      employee: 'Dr. Sarah Johnson',
      type: 'shift_swap',
      currentShift: 'Mon, Nov 4 - 8:00 AM - 4:00 PM',
      requestedShift: 'Tue, Nov 5 - 2:00 PM - 10:00 PM',
      swapPartner: 'Dr. James Wilson',
      reason: 'Personal appointment conflict',
      status: 'pending',
      submittedDate: '2025-11-01',
      priority: 'medium'
    },
    {
      id: 2,
      employee: 'Mike Chen',
      type: 'time_off',
      currentShift: 'Wed, Nov 6 - 9:00 AM - 5:00 PM',
      requestedShift: null,
      swapPartner: null,
      reason: 'Family emergency',
      status: 'pending',
      submittedDate: '2025-11-02',
      priority: 'high'
    },
    {
      id: 3,
      employee: 'Emily Rodriguez',
      type: 'schedule_change',
      currentShift: 'Thu, Nov 7 - 7:30 AM - 3:30 PM',
      requestedShift: 'Thu, Nov 7 - 1:00 PM - 9:00 PM',
      swapPartner: null,
      reason: 'Childcare responsibilities',
      status: 'approved',
      submittedDate: '2025-10-30',
      priority: 'low'
    },
    {
      id: 4,
      employee: 'Dr. James Wilson',
      type: 'shift_swap',
      currentShift: 'Fri, Nov 8 - 4:00 PM - 12:00 AM',
      requestedShift: 'Fri, Nov 8 - 8:00 AM - 4:00 PM',
      swapPartner: 'Dr. Sarah Johnson',
      reason: 'Evening course enrollment',
      status: 'pending',
      submittedDate: '2025-11-01',
      priority: 'medium'
    },
    {
      id: 5,
      employee: 'Lisa Park',
      type: 'overtime_request',
      currentShift: 'Sat, Nov 9 - 8:00 AM - 4:00 PM',
      requestedShift: 'Sat, Nov 9 - 8:00 AM - 8:00 PM',
      swapPartner: null,
      reason: 'Additional coverage needed',
      status: 'rejected',
      submittedDate: '2025-10-31',
      priority: 'low'
    }
  ]);

  // Handler functions
  const handleApproveRequest = (requestId: number) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'approved' } : req
    ));
    console.log('Approved request:', requestId);
  };

  const handleRejectRequest = (requestId: number) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
    console.log('Rejected request:', requestId);
  };

  const handleCommentRequest = (requestId: number) => {
    console.log('Comment on request:', requestId);
  };

  const handleViewDetails = (requestId: number) => {
    console.log('View request details:', requestId);
  };

  const handleExportReport = () => {
    console.log('Exporting report');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shift_swap': return <ArrowsRightLeftIcon className="h-4 w-4" />;
      case 'time_off': return <CalendarIcon className="h-4 w-4" />;
      case 'schedule_change': return <ClockIcon className="h-4 w-4" />;
      case 'overtime_request': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'shift_swap': return 'Shift Swap';
      case 'time_off': return 'Time Off';
      case 'schedule_change': return 'Schedule Change';
      case 'overtime_request': return 'Overtime Request';
      default: return 'Other';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredRequests = requests.filter(request => {
    if (selectedFilter === 'all') return true;
    return request.status === selectedFilter;
  });

  const requestStats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  return (
    <HRMSLayout header={headerProps} tabs={tabs}>
      {/* Request Metrics */}
      <MetricsGrid>
        <MetricCard
          title="Total Requests"
          value={requestStats.total.toString()}
          trend={{ direction: 'up', value: 2 }}
          icon={DocumentTextIcon}
          color="blue"
        />
        <MetricCard
          title="Pending Review"
          value={requestStats.pending.toString()}
          trend={{ direction: 'up', value: 1 }}
          icon={ClockIcon}
          color="yellow"
        />
        <MetricCard
          title="Approved"
          value={requestStats.approved.toString()}
          trend={{ direction: 'up', value: 1 }}
          icon={CheckIcon}
          color="green"
        />
        <MetricCard
          title="Response Rate"
          value="85%"
          trend={{ direction: 'up', value: 5 }}
          icon={ChatBubbleLeftRightIcon}
          color="purple"
        />
      </MetricsGrid>

      {/* Filter and Actions */}
      <ContentCard 
        title="Employee Schedule Requests"
        headerActions={
          <div className="flex gap-3">
            <select 
              value={selectedFilter} 
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="hrms-input text-sm"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button 
              onClick={handleExportReport}
              className="hrms-btn hrms-btn-secondary text-sm"
            >
              Export Report
            </button>
          </div>
        }
      >
        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee & Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason & Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="shrink-0 mr-3">
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                          {getTypeIcon(request.type)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.employee}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getTypeLabel(request.type)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {request.currentShift}
                    </div>
                    <div className="text-xs text-gray-500">
                      Submitted: {request.submittedDate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {request.requestedShift || 'Time off requested'}
                    </div>
                    {request.swapPartner && (
                      <div className="text-xs text-blue-600">
                        Swap with: {request.swapPartner}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 mb-1">
                      {request.reason}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority} priority
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {request.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleApproveRequest(request.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleRejectRequest(request.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleCommentRequest(request.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Add Comment"
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleViewDetails(request.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No employee requests match the current filter criteria.
            </p>
          </div>
        )}
      </ContentCard>

      {/* Request Guidelines */}
      <ContentCard title="Request Guidelines & Policies">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <ArrowsRightLeftIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Shift Swaps</h3>
            <p className="text-xs text-gray-500">
              Must be submitted 48 hours in advance with confirmed swap partner
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Time Off</h3>
            <p className="text-xs text-gray-500">
              Emergency requests approved within 24 hours. Planned requests need 1 week notice
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Schedule Changes</h3>
            <p className="text-xs text-gray-500">
              Permanent changes require manager approval and 2 weeks notice
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Overtime</h3>
            <p className="text-xs text-gray-500">
              Overtime requests must be justified and approved by department head
            </p>
          </div>
        </div>
      </ContentCard>
    </HRMSLayout>
  );
}