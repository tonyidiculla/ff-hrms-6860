'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DocumentPlusIcon, 
  CalendarDaysIcon, 
  UserIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { LeaveRequest, Employee } from '@/types/hr';
import { formatDate, dateDiffInDays } from '@/lib/utils';

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
  }
];

const leaveTypes = [
  { value: 'annual', label: 'Annual Leave', description: 'Vacation and personal time off' },
  { value: 'sick', label: 'Sick Leave', description: 'Medical leave for illness' },
  { value: 'maternity', label: 'Maternity Leave', description: 'Leave for new mothers' },
  { value: 'paternity', label: 'Paternity Leave', description: 'Leave for new fathers' },
  { value: 'personal', label: 'Personal Leave', description: 'Personal time off' },
  { value: 'emergency', label: 'Emergency Leave', description: 'Unplanned urgent leave' }
];

export default function NewLeaveRequestPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
    halfDayPeriod: 'morning' // 'morning' or 'afternoon'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Calculate days when dates change
  React.useEffect(() => {
    if (formData.startDate && formData.endDate) {
      if (formData.isHalfDay) {
        setCalculatedDays(0.5);
      } else {
        const days = dateDiffInDays(formData.startDate, formData.endDate) + 1;
        setCalculatedDays(days);
      }
    } else {
      setCalculatedDays(0);
    }
  }, [formData.startDate, formData.endDate, formData.isHalfDay]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Please select an employee';
    }
    if (!formData.leaveType) {
      newErrors.leaveType = 'Please select a leave type';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for leave';
    }
    if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const leaveRequestData = {
        ...formData,
        daysRequested: calculatedDays,
        status: 'pending'
      };
      
      console.log('Leave request data to submit:', leaveRequestData);
      alert('Leave request submitted successfully!');
      
      // Navigate back to leave requests list
      router.push('/leave/requests');
      
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Error submitting leave request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const selectedEmployee = mockEmployees.find(emp => emp.id === formData.employeeId);
  const selectedLeaveType = leaveTypes.find(type => type.value === formData.leaveType);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Leave Requests
        </button>
        
        <div className="flex items-center space-x-3 mb-2">
          <DocumentPlusIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">New Leave Request</h1>
        </div>
        <p className="text-gray-600">Submit a new leave request for approval</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Employee Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
            Employee Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                Employee *
              </label>
              <select
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.employeeId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select an employee</option>
                {mockEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} ({employee.employeeId})
                  </option>
                ))}
              </select>
              {errors.employeeId && <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>}
            </div>

            {selectedEmployee && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Employee Details</h3>
                <p className="text-sm text-blue-800">
                  <strong>Name:</strong> {selectedEmployee.firstName} {selectedEmployee.lastName}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Employee ID:</strong> {selectedEmployee.employeeId}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Email:</strong> {selectedEmployee.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Leave Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-600" />
            Leave Details
          </h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type *
              </label>
              <select
                id="leaveType"
                name="leaveType"
                value={formData.leaveType}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.leaveType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.leaveType && <p className="mt-1 text-sm text-red-600">{errors.leaveType}</p>}
              {selectedLeaveType && (
                <p className="mt-1 text-sm text-gray-600">{selectedLeaveType.description}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isHalfDay"
                name="isHalfDay"
                checked={formData.isHalfDay}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isHalfDay" className="text-sm font-medium text-gray-700">
                Half Day Leave
              </label>
            </div>

            {formData.isHalfDay && (
              <div>
                <label htmlFor="halfDayPeriod" className="block text-sm font-medium text-gray-700 mb-2">
                  Half Day Period
                </label>
                <select
                  id="halfDayPeriod"
                  name="halfDayPeriod"
                  value={formData.halfDayPeriod}
                  onChange={handleInputChange}
                  className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="morning">Morning (AM)</option>
                  <option value="afternoon">Afternoon (PM)</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  disabled={formData.isHalfDay}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  } ${formData.isHalfDay ? 'bg-gray-100 text-gray-500' : ''}`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
              </div>
            </div>

            {/* Days calculation */}
            {calculatedDays > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    Total Leave Duration: {calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}
                  </span>
                </div>
                {formData.startDate && formData.endDate && !formData.isHalfDay && (
                  <p className="text-sm text-green-700 mt-1">
                    From {formatDate(formData.startDate)} to {formatDate(formData.endDate)}
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Leave *
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Please provide a detailed reason for your leave request..."
              />
              {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
              <p className="mt-1 text-sm text-gray-500">
                Minimum 10 characters ({formData.reason.length}/10)
              </p>
            </div>
          </div>
        </div>

        {/* Warning Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900">Important Notes</h3>
              <ul className="mt-2 text-sm text-yellow-800 space-y-1">
                <li>• Leave requests should be submitted at least 2 weeks in advance when possible</li>
                <li>• Emergency leave requests will be reviewed as soon as possible</li>
                <li>• You will receive an email notification once your request is reviewed</li>
                <li>• Contact your manager directly for urgent leave requirements</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isSubmitting ? 'Submitting Request...' : 'Submit Leave Request'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}