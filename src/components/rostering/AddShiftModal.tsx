import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import type { 
  StaffMember, 
  CreateWeeklyScheduleRequest, 
  CreateScheduleExceptionRequest,
  RoleType 
} from '@/types/rostering';
import { DAY_NAMES, ROLE_TYPES } from '@/types/rostering';

interface AddShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: CreateWeeklyScheduleRequest | CreateScheduleExceptionRequest, type: 'schedule' | 'exception') => Promise<void>;
  staffMembers: StaffMember[];
  selectedDate?: Date;
  loading?: boolean;
}

type ShiftType = 'regular' | 'exception';
type ExceptionType = 'holiday' | 'sick_leave' | 'vacation' | 'special_hours' | 'unavailable';

export function AddShiftModal({
  isOpen,
  onClose,
  onSubmit,
  staffMembers,
  selectedDate,
  loading = false
}: AddShiftModalProps) {
  const [formData, setFormData] = useState({
    staff_member_id: '',
    shift_type: 'regular' as ShiftType,
    
    // Regular schedule fields
    day_of_week: 1,
    start_time: '08:00',
    end_time: '16:00',
    effective_from: new Date().toISOString().split('T')[0],
    effective_until: '',
    is_available: true,
    
    // Exception fields  
    exception_date: selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    exception_type: 'vacation' as ExceptionType,
    exception_start_time: '',
    exception_end_time: '',
    reason: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        exception_date: selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      }));
      setErrors({});
    }
  }, [isOpen, selectedDate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.staff_member_id) {
      newErrors.staff_member_id = 'Please select a staff member';
    }

    if (formData.shift_type === 'regular') {
      if (!formData.start_time) {
        newErrors.start_time = 'Start time is required';
      }
      if (!formData.end_time) {
        newErrors.end_time = 'End time is required';
      }
      if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
        newErrors.end_time = 'End time must be after start time';
      }
      if (!formData.effective_from) {
        newErrors.effective_from = 'Effective from date is required';
      }
    } else {
      if (!formData.exception_date) {
        newErrors.exception_date = 'Exception date is required';
      }
      if (formData.exception_type === 'special_hours') {
        if (!formData.exception_start_time || !formData.exception_end_time) {
          newErrors.exception_time = 'Both start and end times are required for special hours';
        }
        if (formData.exception_start_time && formData.exception_end_time && 
            formData.exception_start_time >= formData.exception_end_time) {
          newErrors.exception_end_time = 'End time must be after start time';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (formData.shift_type === 'regular') {
        const scheduleRequest: CreateWeeklyScheduleRequest = {
          staff_member_id: formData.staff_member_id,
          day_of_week: formData.day_of_week,
          start_time: formData.start_time,
          end_time: formData.end_time,
          effective_from: formData.effective_from,
          effective_until: formData.effective_until || undefined,
          is_available: formData.is_available
        };
        await onSubmit(scheduleRequest, 'schedule');
      } else {
        const exceptionRequest: CreateScheduleExceptionRequest = {
          staff_member_id: formData.staff_member_id,
          exception_date: formData.exception_date,
          exception_type: formData.exception_type,
          start_time: formData.exception_type === 'special_hours' ? formData.exception_start_time : undefined,
          end_time: formData.exception_type === 'special_hours' ? formData.exception_end_time : undefined,
          reason: formData.reason || undefined
        };
        await onSubmit(exceptionRequest, 'exception');
      }
      onClose();
    } catch (error) {
      console.error('Error submitting shift:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create shift' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedStaff = staffMembers.find(s => s.id === formData.staff_member_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Add Shift
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Error display */}
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Staff Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Member *
                  </label>
                  <select
                    value={formData.staff_member_id}
                    onChange={(e) => handleInputChange('staff_member_id', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.staff_member_id ? 'border-red-300' : ''
                    }`}
                  >
                    <option value="">Select a staff member</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.full_name} ({staff.role_type.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                  {errors.staff_member_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.staff_member_id}</p>
                  )}
                </div>

                {/* Shift Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="regular"
                        checked={formData.shift_type === 'regular'}
                        onChange={(e) => handleInputChange('shift_type', e.target.value)}
                        className="mr-2"
                      />
                      Regular Schedule
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="exception"
                        checked={formData.shift_type === 'exception'}
                        onChange={(e) => handleInputChange('shift_type', e.target.value)}
                        className="mr-2"
                      />
                      Exception/Override
                    </label>
                  </div>
                </div>

                {/* Regular Schedule Fields */}
                {formData.shift_type === 'regular' && (
                  <>
                    {/* Day of Week */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day of Week *
                      </label>
                      <select
                        value={formData.day_of_week}
                        onChange={(e) => handleInputChange('day_of_week', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {DAY_NAMES.map((day, index) => (
                          <option key={index} value={index}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time *
                        </label>
                        <input
                          type="time"
                          value={formData.start_time}
                          onChange={(e) => handleInputChange('start_time', e.target.value)}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.start_time ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.start_time && (
                          <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time *
                        </label>
                        <input
                          type="time"
                          value={formData.end_time}
                          onChange={(e) => handleInputChange('end_time', e.target.value)}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.end_time ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.end_time && (
                          <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
                        )}
                      </div>
                    </div>

                    {/* Effective Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Effective From *
                        </label>
                        <input
                          type="date"
                          value={formData.effective_from}
                          onChange={(e) => handleInputChange('effective_from', e.target.value)}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.effective_from ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.effective_from && (
                          <p className="mt-1 text-sm text-red-600">{errors.effective_from}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Effective Until
                          <span className="text-xs text-gray-500 ml-1">(optional)</span>
                        </label>
                        <input
                          type="date"
                          value={formData.effective_until}
                          onChange={(e) => handleInputChange('effective_until', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_available"
                        checked={formData.is_available}
                        onChange={(e) => handleInputChange('is_available', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
                        Available for appointments
                      </label>
                    </div>
                  </>
                )}

                {/* Exception Fields */}
                {formData.shift_type === 'exception' && (
                  <>
                    {/* Exception Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Exception Date *
                      </label>
                      <input
                        type="date"
                        value={formData.exception_date}
                        onChange={(e) => handleInputChange('exception_date', e.target.value)}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.exception_date ? 'border-red-300' : ''
                        }`}
                      />
                      {errors.exception_date && (
                        <p className="mt-1 text-sm text-red-600">{errors.exception_date}</p>
                      )}
                    </div>

                    {/* Exception Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Exception Type
                      </label>
                      <select
                        value={formData.exception_type}
                        onChange={(e) => handleInputChange('exception_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="vacation">Vacation</option>
                        <option value="sick_leave">Sick Leave</option>
                        <option value="holiday">Holiday</option>
                        <option value="special_hours">Special Hours</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>

                    {/* Special Hours Time Range */}
                    {formData.exception_type === 'special_hours' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time *
                          </label>
                          <input
                            type="time"
                            value={formData.exception_start_time}
                            onChange={(e) => handleInputChange('exception_start_time', e.target.value)}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.exception_time ? 'border-red-300' : ''
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time *
                          </label>
                          <input
                            type="time"
                            value={formData.exception_end_time}
                            onChange={(e) => handleInputChange('exception_end_time', e.target.value)}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.exception_end_time ? 'border-red-300' : ''
                            }`}
                          />
                        </div>
                        {(errors.exception_time || errors.exception_end_time) && (
                          <div className="col-span-2">
                            <p className="text-sm text-red-600">
                              {errors.exception_time || errors.exception_end_time}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason
                        <span className="text-xs text-gray-500 ml-1">(optional)</span>
                      </label>
                      <textarea
                        value={formData.reason}
                        onChange={(e) => handleInputChange('reason', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Additional notes about this exception..."
                      />
                    </div>
                  </>
                )}

                {/* Staff Info Display */}
                {selectedStaff && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Staff Information</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Role:</strong> {selectedStaff.role_type.replace('_', ' ')}</p>
                      {selectedStaff.job_title && (
                        <p><strong>Title:</strong> {selectedStaff.job_title}</p>
                      )}
                      <p><strong>Appointment Slots:</strong> {selectedStaff.slot_duration_minutes} minutes</p>
                      <p><strong>Can Take Appointments:</strong> {selectedStaff.can_take_appointments ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Create Shift
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}