'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Department } from '@/types/hr';
import { formatDate } from '@/lib/utils';

// Mock data - will be replaced with actual API calls later
const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Veterinary Services',
    description: 'Primary veterinary care and medical services for animals',
    managerId: 'emp-001',
    code: 'VET',
    budgetCode: 'BUD-VET-001',
    isActive: true,
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  },
  {
    id: 'dept-2',
    name: 'Reception & Administration',
    description: 'Front desk operations, scheduling, and administrative support',
    managerId: 'emp-005',
    code: 'ADMIN',
    budgetCode: 'BUD-ADM-001',
    isActive: true,
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  },
  {
    id: 'dept-3',
    name: 'Surgery',
    description: 'Surgical procedures and post-operative care',
    managerId: 'emp-003',
    code: 'SURG',
    budgetCode: 'BUD-SUR-001',
    isActive: true,
    createdAt: '2020-06-01T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  },
  {
    id: 'dept-4',
    name: 'Laboratory',
    description: 'Diagnostic testing and laboratory services',
    managerId: 'emp-007',
    code: 'LAB',
    budgetCode: 'BUD-LAB-001',
    isActive: true,
    createdAt: '2021-03-10T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  }
];

const mockEmployees = [
  { id: 'emp-001', name: 'Dr. Sarah Wilson' },
  { id: 'emp-003', name: 'Dr. Michael Johnson' },
  { id: 'emp-005', name: 'Lisa Anderson' },
  { id: 'emp-007', name: 'David Chen' }
];

const tabs = [
  { name: 'Directory', href: '/employees' },
  { name: 'Add Employee', href: '/employees/add' },
  { name: 'Departments', href: '/employees/departments' },
  { name: 'Positions', href: '/employees/positions' },
];

export default function DepartmentsPage() {
  const pathname = usePathname();
  const [departments] = useState<Department[]>(mockDepartments);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

    const filteredDepartments = mockDepartments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'Not assigned';
    const manager = mockEmployees.find(emp => emp.id === managerId);
    return manager?.name || 'Unknown';
  };

  return (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-6">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600">Manage hospital departments and organizational structure</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Department
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Departments</label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Show inactive departments</span>
            </label>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <div key={department.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{department.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  department.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {department.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">{department.description}</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Manager:</span>
                <span className="font-medium">{getManagerName(department.managerId)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Code:</span>
                <span className="font-medium">{department.code}</span>
              </div>
              {department.budgetCode && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Budget Code:</span>
                  <span className="font-medium">{department.budgetCode}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Created:</span>
                <span className="font-medium">{formatDate(department.createdAt)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">5</span> employees
                </div>
                <Link
                  href={`/employees?department=${department.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  View employees →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or add a new department.
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{departments.length}</div>
            <div className="text-sm text-gray-500">Total Departments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {departments.filter(d => d.isActive).length}
            </div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {departments.filter(d => d.managerId).length}
            </div>
            <div className="text-sm text-gray-500">With Managers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {departments.filter(d => d.budgetCode).length}
            </div>
            <div className="text-sm text-gray-500">With Budget Codes</div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}