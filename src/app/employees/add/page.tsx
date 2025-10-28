'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  UserPlusIcon, 
  BuildingOfficeIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { HRMSLayout, ContentCard } from '@/components/layout/HRMSLayout';
import { Employee, Department } from '@/types/hr';
import { TabItem } from '@/types/layout';

const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Veterinary Services',
    code: 'VET',
    budgetCode: 'BUD-VET-001',
    isActive: true,
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  },
  {
    id: 'dept-2',
    name: 'Reception & Administration',
    code: 'ADMIN',
    budgetCode: 'BUD-ADM-001',
    isActive: true,
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  },
  {
    id: 'dept-3',
    name: 'Surgery',
    code: 'SURG',
    budgetCode: 'BUD-SUR-001',
    isActive: true,
    createdAt: '2020-06-01T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  },
  {
    id: 'dept-4',
    name: 'Laboratory',
    code: 'LAB',
    budgetCode: 'BUD-LAB-001',
    isActive: true,
    createdAt: '2021-03-10T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  }
];

const mockManagers = [
  { id: 'emp-001', name: 'Dr. Sarah Wilson' },
  { id: 'emp-003', name: 'Dr. Michael Johnson' },
  { id: 'emp-005', name: 'Lisa Anderson' },
  { id: 'emp-007', name: 'David Chen' }
];

const tabs: TabItem[] = [
  { name: 'Directory', href: '/employees', icon: UserGroupIcon },
  { name: 'Add Employee', href: '/employees/add', icon: UserPlusIcon },
  { name: 'Departments', href: '/employees/departments', icon: BuildingOfficeIcon },
  { name: 'Positions', href: '/employees/positions', icon: UserPlusIcon },
];

const headerProps = {
  title: "Add New Employee",
  subtitle: "Register a new team member to the organization",
  breadcrumbs: [
    { name: 'Home', href: '/' },
    { name: 'Employees', href: '/employees' },
    { name: 'Add Employee' }
  ]
};

export default function AddEmployeePage() {
  const pathname = usePathname();
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    position: '',
    employmentType: 'full_time',
    hireDate: '',
    salary: '',
    managerId: '',
    status: 'active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.departmentId) {
      newErrors.departmentId = 'Please select a department';
    }
    if (!formData.position.trim()) {
      newErrors.position = 'Position/Job title is required';
    }
    if (!formData.hireDate) {
      newErrors.hireDate = 'Hire date is required';
    }
    if (formData.salary && isNaN(Number(formData.salary))) {
      newErrors.salary = 'Please enter a valid salary amount';
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Employee data to submit:', formData);
      alert('Employee added successfully!');
      
      // Reset form
      setFormData({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        departmentId: '',
        position: '',
        employmentType: 'full_time',
        hireDate: '',
        salary: '',
        managerId: '',
        status: 'active'
      });
      
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Error adding employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <HRMSLayout header={headerProps} tabs={tabs}>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <ContentCard title="Personal Information" headerActions={
          <UserGroupIcon className="h-5 w-5 text-blue-600" />
        }>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID *
              </label>
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.employeeId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="EMP001"
              />
              {errors.employeeId && <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Doe"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>
          </div>
        </ContentCard>

        {/* Contact Information */}
        <ContentCard title="Contact Information" headerActions={
          <EnvelopeIcon className="h-5 w-5 text-blue-600" />
        }>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john.doe@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>
        </ContentCard>

        {/* Employment Information */}
        <ContentCard title="Employment Information" headerActions={
          <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
        }>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.departmentId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a department</option>
                {mockDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
              {errors.departmentId && <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>}
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                Position/Job Title *
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.position ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Veterinarian"
              />
              {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
            </div>

            <div>
              <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                id="employmentType"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div>
              <label htmlFor="managerId" className="block text-sm font-medium text-gray-700 mb-2">
                Manager
              </label>
              <select
                id="managerId"
                name="managerId"
                value={formData.managerId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a manager</option>
                {mockManagers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 mb-2">
                Hire Date *
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  id="hireDate"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.hireDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.hireDate && <p className="mt-1 text-sm text-red-600">{errors.hireDate}</p>}
            </div>

            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                Annual Salary
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.salary ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="50000"
                  min="0"
                  step="1000"
                />
              </div>
              {errors.salary && <p className="mt-1 text-sm text-red-600">{errors.salary}</p>}
            </div>
          </div>
        </ContentCard>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
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
            <span>{isSubmitting ? 'Adding Employee...' : 'Add Employee'}</span>
          </button>
        </div>
      </form>
    </HRMSLayout>
  );
}