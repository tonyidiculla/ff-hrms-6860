'use client';

import React, { useState } from 'react';
import { 
  UserGroupIcon, 
  UserPlusIcon, 
  BuildingOfficeIcon, 
  BriefcaseIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { HRMSLayout, ContentCard } from '@/components/layout/HRMSLayout';
import { TabItem } from '@/types/layout';

const tabs: TabItem[] = [
  { name: 'Directory', href: '/employees', icon: UserGroupIcon },
  { name: 'Add Employee', href: '/employees/add', icon: UserPlusIcon },
  { name: 'Departments', href: '/employees/departments', icon: BuildingOfficeIcon },
  { name: 'Positions', href: '/employees/positions', icon: BriefcaseIcon },
];

const headerProps = {
  title: "Departments",
  subtitle: "Manage organizational departments and structure",
  breadcrumbs: [
    { name: 'Home', href: '/' },
    { name: 'Employees', href: '/employees' },
    { name: 'Departments' }
  ]
};

const mockDepartments = [
  {
    id: 'dept-1',
    name: 'Veterinary Services',
    description: 'Primary veterinary care and medical services for animals',
    employeeCount: 45,
    manager: 'Dr. Sarah Johnson',
    budget: 750000,
    isActive: true
  },
  {
    id: 'dept-2', 
    name: 'Administration',
    description: 'Administrative support and office management',
    employeeCount: 12,
    manager: 'Michael Chen',
    budget: 280000,
    isActive: true
  },
  {
    id: 'dept-3',
    name: 'Customer Service', 
    description: 'Client relations and customer support services',
    employeeCount: 18,
    manager: 'Emily Davis',
    budget: 320000,
    isActive: true
  }
];

export default function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredDepartments = mockDepartments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <HRMSLayout header={headerProps} tabs={tabs}>
      <ContentCard 
        title="Department Management"
        headerActions={
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Department
          </button>
        }
      >
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <div key={department.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{department.description}</p>
                </div>
                <BuildingOfficeIcon className="h-6 w-6 text-blue-500" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Employees:</span>
                  <span className="font-medium text-gray-900">{department.employeeCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Manager:</span>
                  <span className="font-medium text-gray-900">{department.manager}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Budget:</span>
                  <span className="font-medium text-gray-900">${department.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    department.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {department.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View Details
                  </button>
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDepartments.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or add a new department.
            </p>
          </div>
        )}
      </ContentCard>
    </HRMSLayout>
  );
}
