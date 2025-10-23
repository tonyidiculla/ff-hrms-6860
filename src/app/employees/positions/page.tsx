'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BriefcaseIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  EyeIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Position, Department } from '@/types/hr';
import { formatCurrency } from '@/lib/utils';

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

const mockPositions: Position[] = [
  {
    id: 'pos-001',
    title: 'Senior Veterinarian',
    description: 'Lead veterinarian responsible for complex cases and team supervision',
    departmentId: 'dept-1',
    level: 'Senior',
    salaryRange: {
      min: 80000,
      max: 120000
    },
    requirements: [
      'DVM degree from accredited institution',
      '5+ years veterinary experience',
      'State veterinary license',
      'Leadership experience preferred'
    ],
    isActive: true,
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  },
  {
    id: 'pos-002',
    title: 'Veterinary Technician',
    description: 'Assists veterinarians with medical procedures and patient care',
    departmentId: 'dept-1',
    level: 'Mid-Level',
    salaryRange: {
      min: 35000,
      max: 50000
    },
    requirements: [
      'Veterinary Technology degree',
      'Certification/license as required by state',
      '2+ years experience preferred',
      'Strong animal handling skills'
    ],
    isActive: true,
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  },
  {
    id: 'pos-003',
    title: 'Receptionist',
    description: 'Front desk operations, client communication, and administrative support',
    departmentId: 'dept-2',
    level: 'Entry-Level',
    salaryRange: {
      min: 28000,
      max: 38000
    },
    requirements: [
      'High school diploma',
      'Customer service experience',
      'Computer proficiency',
      'Excellent communication skills'
    ],
    isActive: true,
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  },
  {
    id: 'pos-004',
    title: 'Office Manager',
    description: 'Oversee administrative operations and manage support staff',
    departmentId: 'dept-2',
    level: 'Senior',
    salaryRange: {
      min: 45000,
      max: 65000
    },
    requirements: [
      'Bachelor\'s degree preferred',
      '3+ years management experience',
      'Experience in healthcare/veterinary field',
      'Strong organizational skills'
    ],
    isActive: true,
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  },
  {
    id: 'pos-005',
    title: 'Veterinary Surgeon',
    description: 'Specialized surgical procedures for animals',
    departmentId: 'dept-3',
    level: 'Senior',
    salaryRange: {
      min: 100000,
      max: 150000
    },
    requirements: [
      'DVM degree',
      'Surgical residency completion',
      'Board certification in surgery',
      '3+ years surgical experience'
    ],
    isActive: true,
    createdAt: '2020-06-01T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  },
  {
    id: 'pos-006',
    title: 'Lab Technician',
    description: 'Perform diagnostic tests and laboratory analysis',
    departmentId: 'dept-4',
    level: 'Mid-Level',
    salaryRange: {
      min: 40000,
      max: 55000
    },
    requirements: [
      'Associate degree in relevant field',
      'Laboratory experience',
      'Attention to detail',
      'Knowledge of lab safety protocols'
    ],
    isActive: true,
    createdAt: '2021-03-10T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  },
  {
    id: 'pos-007',
    title: 'Veterinary Assistant',
    description: 'Support veterinary staff with basic animal care and clinic operations',
    departmentId: 'dept-1',
    level: 'Entry-Level',
    isActive: false,
    createdAt: '2021-08-15T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z'
  }
];

const tabs = [
  { name: 'Directory', href: '/employees' },
  { name: 'Add Employee', href: '/employees/add' },
  { name: 'Departments', href: '/employees/departments' },
  { name: 'Positions', href: '/employees/positions' },
];

export default function PositionsPage() {
  const pathname = usePathname();
  const [positions, setPositions] = useState<Position[]>(mockPositions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getDepartmentName = (departmentId: string) => {
    const dept = mockDepartments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Unknown Department';
  };

  const filteredPositions = positions.filter(position => {
    const matchesSearch = position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (position.description && position.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = selectedDepartment === '' || position.departmentId === selectedDepartment;
    const matchesLevel = selectedLevel === '' || position.level === selectedLevel;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && position.isActive) ||
                         (statusFilter === 'inactive' && !position.isActive);
    
    return matchesSearch && matchesDepartment && matchesLevel && matchesStatus;
  });

  const handleViewDetails = (position: Position) => {
    setSelectedPosition(position);
    setIsDetailModalOpen(true);
  };

  const activePositions = positions.filter(p => p.isActive);
  const uniqueLevels = [...new Set(positions.map(p => p.level).filter(Boolean))];

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

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BriefcaseIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Positions</h1>
              <p className="text-gray-600">Manage roles and position requirements across departments</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Position</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Positions</p>
              <p className="text-2xl font-bold text-gray-900">{positions.length}</p>
            </div>
            <BriefcaseIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active Positions</p>
              <p className="text-2xl font-bold text-green-600">{activePositions.length}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-purple-600">{mockDepartments.length}</p>
            </div>
            <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Salary Ranges</p>
              <p className="text-2xl font-bold text-orange-600">{positions.filter(p => p.salaryRange).length}</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Departments</option>
            {mockDepartments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Levels</option>
            {uniqueLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Positions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Positions ({filteredPositions.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredPositions.map((position) => (
            <div key={position.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{position.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      position.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {position.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {position.level && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {position.level}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-2">{position.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      <span>{getDepartmentName(position.departmentId)}</span>
                    </div>
                    {position.salaryRange && (
                      <div className="flex items-center space-x-1">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span>
                          {formatCurrency(position.salaryRange.min)} - {formatCurrency(position.salaryRange.max)}
                        </span>
                      </div>
                    )}
                    {position.requirements && (
                      <span>{position.requirements.length} requirements</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDetails(position)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="View Details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                    title="Edit Position"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredPositions.length === 0 && (
            <div className="p-12 text-center">
              <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No positions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or create a new position.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Position Detail Modal */}
      {isDetailModalOpen && selectedPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{selectedPosition.title}</h2>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-900">{selectedPosition.description || 'No description available'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Department</h3>
                  <p className="text-gray-900">{getDepartmentName(selectedPosition.departmentId)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Level</h3>
                  <p className="text-gray-900">{selectedPosition.level || 'Not specified'}</p>
                </div>
              </div>
              
              {selectedPosition.salaryRange && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Salary Range</h3>
                  <p className="text-gray-900">
                    {formatCurrency(selectedPosition.salaryRange.min)} - {formatCurrency(selectedPosition.salaryRange.max)}
                  </p>
                </div>
              )}
              
              {selectedPosition.requirements && selectedPosition.requirements.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Requirements</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-900">
                    {selectedPosition.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedPosition.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedPosition.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Created</h3>
                  <p className="text-gray-900">
                    {new Date(selectedPosition.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Position
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}