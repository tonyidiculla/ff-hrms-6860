'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PerformanceGoal, Employee } from '@/types/hr';

interface GoalsPageState {
  goals: PerformanceGoal[];
  employees: Employee[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    category: string;
    priority: string;
    status: string;
    employeeId: string;
  };
  showCreateModal: boolean;
  editingGoal: PerformanceGoal | null;
}

export default function PerformanceGoalsPage() {
  const [state, setState] = useState<GoalsPageState>({
    goals: [],
    employees: [],
    loading: true,
    error: null,
    filters: {
      search: '',
      category: '',
      priority: '',
      status: '',
      employeeId: '',
    },
    showCreateModal: false,
    editingGoal: null,
  });

  useEffect(() => {
    loadGoals();
    loadEmployees();
  }, []);

  const loadGoals = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API call - replace with actual API
      const mockGoals: PerformanceGoal[] = [
        {
          id: '1',
          employeeId: 'emp1',
          title: 'Increase Client Satisfaction Score',
          description: 'Improve client satisfaction rating to 4.5/5 through enhanced service delivery and follow-up processes.',
          category: 'individual',
          priority: 'high',
          status: 'active',
          targetDate: '2024-12-31',
          startDate: '2024-01-01',
          progress: 75,
          metrics: {
            type: 'numeric',
            target: 4.5,
            current: 4.2,
            unit: 'rating'
          },
          managerId: 'mgr1',
          tags: ['client-service', 'quality'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-10-20T00:00:00Z',
        },
        {
          id: '2',
          employeeId: 'emp2',
          title: 'Complete Advanced Veterinary Certification',
          description: 'Obtain advanced certification in exotic animal care to expand service offerings.',
          category: 'individual',
          priority: 'medium',
          status: 'active',
          targetDate: '2024-11-30',
          startDate: '2024-06-01',
          progress: 60,
          metrics: {
            type: 'milestone',
            target: 'Certification Complete',
            current: 'Module 3 of 5'
          },
          managerId: 'mgr1',
          tags: ['certification', 'professional-development'],
          createdAt: '2024-06-01T00:00:00Z',
          updatedAt: '2024-10-15T00:00:00Z',
        },
        {
          id: '3',
          employeeId: 'emp1',
          title: 'Team Surgery Success Rate',
          description: 'Maintain 98% success rate for surgical procedures across the team.',
          category: 'team',
          priority: 'critical',
          status: 'active',
          targetDate: '2024-12-31',
          startDate: '2024-01-01',
          progress: 92,
          metrics: {
            type: 'percentage',
            target: 98,
            current: 97.2,
            unit: '%'
          },
          managerId: 'mgr1',
          tags: ['surgery', 'quality', 'team'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-10-22T00:00:00Z',
        }
      ];

      setState(prev => ({ 
        ...prev, 
        goals: mockGoals, 
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load goals', 
        loading: false 
      }));
    }
  };

  const loadEmployees = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockEmployees: Employee[] = [
        {
          id: 'emp1',
          employeeId: 'FF001',
          firstName: 'Dr. Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@furfield.com',
          departmentId: 'dept1',
          positionId: 'pos1',
          hireDate: '2023-01-15',
          status: 'active',
          createdAt: '2023-01-15T00:00:00Z',
          updatedAt: '2024-10-01T00:00:00Z',
        },
        {
          id: 'emp2',
          employeeId: 'FF002',
          firstName: 'Mark',
          lastName: 'Thompson',
          email: 'mark.thompson@furfield.com',
          departmentId: 'dept2',
          positionId: 'pos2',
          hireDate: '2023-03-20',
          status: 'active',
          createdAt: '2023-03-20T00:00:00Z',
          updatedAt: '2024-09-15T00:00:00Z',
        }
      ];

      setState(prev => ({ ...prev, employees: mockEmployees }));
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleFilterChange = (key: keyof typeof state.filters, value: string) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value }
    }));
  };

  const handleCreateGoal = () => {
    setState(prev => ({ ...prev, showCreateModal: true, editingGoal: null }));
  };

  const handleEditGoal = (goal: PerformanceGoal) => {
    setState(prev => ({ ...prev, showCreateModal: true, editingGoal: goal }));
  };

  const handleCloseModal = () => {
    setState(prev => ({ ...prev, showCreateModal: false, editingGoal: null }));
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = state.employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'individual': return 'bg-purple-100 text-purple-800';
      case 'team': return 'bg-indigo-100 text-indigo-800';
      case 'departmental': return 'bg-pink-100 text-pink-800';
      case 'company': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredGoals = state.goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                         goal.description.toLowerCase().includes(state.filters.search.toLowerCase());
    const matchesCategory = !state.filters.category || goal.category === state.filters.category;
    const matchesPriority = !state.filters.priority || goal.priority === state.filters.priority;
    const matchesStatus = !state.filters.status || goal.status === state.filters.status;
    const matchesEmployee = !state.filters.employeeId || goal.employeeId === state.filters.employeeId;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesEmployee;
  });

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-6 text-gray-900">Performance Goals</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track performance goals across your organization.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={handleCreateGoal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Goal
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={state.filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search goals..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-gray-700">
              Employee
            </label>
            <select
              id="employee"
              name="employee"
              value={state.filters.employeeId}
              onChange={(e) => handleFilterChange('employeeId', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Employees</option>
              {state.employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={state.filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Categories</option>
              <option value="individual">Individual</option>
              <option value="team">Team</option>
              <option value="departmental">Departmental</option>
              <option value="company">Company</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={state.filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={state.filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Goals ({filteredGoals.length})
          </h3>
        </div>
        
        {filteredGoals.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No goals found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new performance goal.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCreateGoal}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Goal
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredGoals.map((goal) => (
              <div key={goal.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {goal.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(goal.category)}`}>
                        {goal.category}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                        {goal.priority}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                        {goal.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>
                        <strong>Employee:</strong> {getEmployeeName(goal.employeeId)}
                      </span>
                      <span>
                        <strong>Target:</strong> {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                      <span>
                        <strong>Progress:</strong> {goal.progress}%
                      </span>
                      {goal.metrics && (
                        <span>
                          <strong>Current:</strong> {goal.metrics.current} {goal.metrics.unit}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {goal.tags && goal.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {goal.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal would go here */}
      {state.showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {state.editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {state.editingGoal ? 'Update the goal details below.' : 'Fill in the details to create a new performance goal.'}
                  </p>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                >
                  {state.editingGoal ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
