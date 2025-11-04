import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import type { 
  StaffMember, 
  CreateStaffMemberRequest, 
  UpdateStaffMemberRequest,
  RoleType 
} from '@/types/rostering';
import { ROLE_TYPES } from '@/types/rostering';

interface StaffManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: CreateStaffMemberRequest | UpdateStaffMemberRequest, isEdit: boolean) => Promise<void>;
  staffMember?: StaffMember; // For editing existing staff
  loading?: boolean;
}

export function StaffManagementModal({
  isOpen,
  onClose,
  onSubmit,
  staffMember,
  loading = false
}: StaffManagementModalProps) {
  const isEdit = !!staffMember;
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role_type: 'veterinarian' as RoleType,
    job_title: '',
    employee_id: '',
    slot_duration_minutes: 15,
    can_take_appointments: true,
    hire_date: '',
    is_active: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load existing staff data for editing
  useEffect(() => {
    if (isOpen) {
      if (staffMember) {
        setFormData({
          full_name: staffMember.full_name || '',
          email: staffMember.email || '',
          phone: staffMember.phone || '',
          role_type: staffMember.role_type as RoleType,
          job_title: staffMember.job_title || '',
          employee_id: staffMember.employee_id || '',
          slot_duration_minutes: staffMember.slot_duration_minutes,
          can_take_appointments: staffMember.can_take_appointments,
          hire_date: staffMember.hire_date || '',
          is_active: staffMember.is_active
        });
      } else {
        // Reset for new staff
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          role_type: 'veterinarian',
          job_title: '',
          employee_id: '',
          slot_duration_minutes: 15,
          can_take_appointments: true,
          hire_date: '',
          is_active: true
        });
      }
      setErrors({});
      setShowSuccess(false);
    }
  }, [isOpen, staffMember]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.role_type) {
      newErrors.role_type = 'Role type is required';
    }

    if (formData.slot_duration_minutes < 5 || formData.slot_duration_minutes > 120) {
      newErrors.slot_duration_minutes = 'Slot duration must be between 5 and 120 minutes';
    }

    if (formData.hire_date) {
      const hireDate = new Date(formData.hire_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (hireDate > today) {
        newErrors.hire_date = 'Hire date cannot be in the future';
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
      const requestData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        role_type: formData.role_type,
        job_title: formData.job_title.trim() || undefined,
        employee_id: formData.employee_id.trim() || undefined,
        slot_duration_minutes: formData.slot_duration_minutes,
        can_take_appointments: formData.can_take_appointments,
        hire_date: formData.hire_date || undefined,
        ...(isEdit && { is_active: formData.is_active })
      };

      await onSubmit(requestData, isEdit);
      
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting staff member:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save staff member' });
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

  const getRoleDisplayName = (role: RoleType) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getDefaultJobTitle = (role: RoleType) => {
    const titles: Record<RoleType, string> = {
      veterinarian: 'Veterinarian',
      veterinary_technician: 'Veterinary Technician',
      veterinary_assistant: 'Veterinary Assistant',
      receptionist: 'Receptionist',
      practice_manager: 'Practice Manager',
      kennel_attendant: 'Kennel Attendant',
      groomer: 'Pet Groomer',
      other: ''
    };
    return titles[role] || '';
  };

  // Auto-populate job title when role changes
  useEffect(() => {
    if (!isEdit && formData.role_type) {
      const defaultTitle = getDefaultJobTitle(formData.role_type);
      if (defaultTitle && !formData.job_title) {
        setFormData(prev => ({ ...prev, job_title: defaultTitle }));
      }
    }
  }, [formData.role_type, isEdit, formData.job_title]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          
          {/* Success message */}
          {showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 z-10">
              <div className="text-center">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">
                  Staff member {isEdit ? 'updated' : 'created'} successfully!
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                  {isEdit ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Error display */}
              {errors.submit && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2">Basic Information</h4>
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.full_name ? 'border-red-300' : ''
                      }`}
                      placeholder="Enter full name"
                    />
                    {errors.full_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                    )}
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={formData.employee_id}
                      onChange={(e) => handleInputChange('employee_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="EMP001"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? 'border-red-300' : ''
                        }`}
                        placeholder="name@clinic.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? 'border-red-300' : ''
                        }`}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2">Professional Information</h4>
                  
                  {/* Role Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Type *
                    </label>
                    <select
                      value={formData.role_type}
                      onChange={(e) => handleInputChange('role_type', e.target.value as RoleType)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.role_type ? 'border-red-300' : ''
                      }`}
                    >
                      {ROLE_TYPES.map(role => (
                        <option key={role} value={role}>
                          {getRoleDisplayName(role)}
                        </option>
                      ))}
                    </select>
                    {errors.role_type && (
                      <p className="mt-1 text-sm text-red-600">{errors.role_type}</p>
                    )}
                  </div>

                  {/* Job Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BriefcaseIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.job_title}
                        onChange={(e) => handleInputChange('job_title', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Senior Veterinarian"
                      />
                    </div>
                  </div>

                  {/* Hire Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hire Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={formData.hire_date}
                        onChange={(e) => handleInputChange('hire_date', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.hire_date ? 'border-red-300' : ''
                        }`}
                      />
                    </div>
                    {errors.hire_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.hire_date}</p>
                    )}
                  </div>

                  {/* Slot Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Appointment Slot (minutes)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        step="5"
                        value={formData.slot_duration_minutes}
                        onChange={(e) => handleInputChange('slot_duration_minutes', parseInt(e.target.value))}
                        className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.slot_duration_minutes ? 'border-red-300' : ''
                        }`}
                      />
                    </div>
                    {errors.slot_duration_minutes && (
                      <p className="mt-1 text-sm text-red-600">{errors.slot_duration_minutes}</p>
                    )}
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="can_take_appointments"
                        checked={formData.can_take_appointments}
                        onChange={(e) => handleInputChange('can_take_appointments', e.target.checked)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="can_take_appointments" className="text-sm font-medium text-gray-700">
                        Can take appointments
                      </label>
                    </div>

                    {isEdit && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={formData.is_active}
                          onChange={(e) => handleInputChange('is_active', e.target.checked)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                          Active employee
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Role-specific Information */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h5 className="text-sm font-medium text-blue-900 mb-2">
                  {getRoleDisplayName(formData.role_type)} Information
                </h5>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Default Appointments:</strong> {formData.can_take_appointments ? 'Yes' : 'No'}</p>
                  <p><strong>Slot Duration:</strong> {formData.slot_duration_minutes} minutes</p>
                  {formData.hire_date && (
                    <p><strong>Tenure:</strong> {Math.floor((new Date().getTime() - new Date(formData.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 365 * 1000))} years</p>
                  )}
                </div>
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
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <UserIcon className="w-4 h-4 mr-2" />
                    {isEdit ? 'Update Staff Member' : 'Create Staff Member'}
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