'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  EyeIcon, 
  PencilIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { PerformanceReview, Employee } from '@/types/hr';

interface ReviewsPageState {
  reviews: PerformanceReview[];
  employees: Employee[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    type: string;
    status: string;
    employeeId: string;
    reviewerId: string;
  };
  showCreateModal: boolean;
  selectedReview: PerformanceReview | null;
}

export default function PerformanceReviewsPage() {
  const [state, setState] = useState<ReviewsPageState>({
    reviews: [],
    employees: [],
    loading: true,
    error: null,
    filters: {
      search: '',
      type: '',
      status: '',
      employeeId: '',
      reviewerId: '',
    },
    showCreateModal: false,
    selectedReview: null,
  });

  useEffect(() => {
    loadReviews();
    loadEmployees();
  }, []);

  const loadReviews = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API call - replace with actual API
      const mockReviews: PerformanceReview[] = [
        {
          id: '1',
          employeeId: 'emp1',
          reviewerId: 'mgr1',
          reviewPeriod: {
            startDate: '2024-01-01',
            endDate: '2024-06-30',
          },
          type: 'mid-year',
          status: 'completed',
          overallRating: 4.2,
          sections: [
            {
              id: 'section1',
              name: 'Technical Skills',
              description: 'Assessment of technical competencies',
              weight: 30,
              rating: 4.5,
              comments: 'Excellent technical skills and ability to adapt to new procedures.',
              criteria: [
                {
                  name: 'Surgical Proficiency',
                  rating: 5,
                  comments: 'Outstanding surgical skills with high success rates'
                },
                {
                  name: 'Diagnostic Accuracy',
                  rating: 4,
                  comments: 'Very good diagnostic abilities with room for improvement in complex cases'
                }
              ]
            },
            {
              id: 'section2', 
              name: 'Communication',
              weight: 25,
              rating: 4.0,
              comments: 'Good communication with clients and team members.',
              criteria: [
                {
                  name: 'Client Communication',
                  rating: 4,
                  comments: 'Explains procedures well to pet owners'
                }
              ]
            }
          ],
          goals: [
            {
              goalId: '1',
              achievementRating: 4,
              comments: 'Successfully improved client satisfaction scores'
            }
          ],
          strengths: [
            'Excellent surgical skills',
            'Strong work ethic',
            'Continuous learning mindset'
          ],
          areasForImprovement: [
            'Complex case diagnosis',
            'Time management during busy periods'
          ],
          developmentPlan: 'Focus on advanced diagnostic training and time management workshops.',
          managerComments: 'Sarah has shown excellent growth this period. Recommend for senior veterinarian track.',
          nextReviewDate: '2024-12-31',
          createdAt: '2024-07-01T00:00:00Z',
          updatedAt: '2024-07-15T00:00:00Z',
          submittedAt: '2024-07-10T00:00:00Z',
          approvedAt: '2024-07-15T00:00:00Z',
        },
        {
          id: '2',
          employeeId: 'emp2',
          reviewerId: 'mgr1',
          reviewPeriod: {
            startDate: '2024-01-01',
            endDate: '2024-06-30',
          },
          type: 'mid-year',
          status: 'in-progress',
          overallRating: 3.8,
          sections: [
            {
              id: 'section1',
              name: 'Technical Skills',
              weight: 30,
              rating: 3.5,
              comments: 'Good foundation with room for growth.',
              criteria: [
                {
                  name: 'Patient Care',
                  rating: 4,
                  comments: 'Excellent bedside manner with animals'
                }
              ]
            }
          ],
          goals: [],
          strengths: ['Compassionate care', 'Team collaboration'],
          areasForImprovement: ['Technical skill development', 'Efficiency'],
          developmentPlan: 'Enroll in advanced technical training programs.',
          createdAt: '2024-07-01T00:00:00Z',
          updatedAt: '2024-10-20T00:00:00Z',
        }
      ];

      setState(prev => ({ 
        ...prev, 
        reviews: mockReviews, 
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load reviews', 
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
        },
        {
          id: 'mgr1',
          employeeId: 'FF100',
          firstName: 'Dr. Michael',
          lastName: 'Roberts',
          email: 'michael.roberts@furfield.com',
          departmentId: 'dept1',
          positionId: 'pos100',
          hireDate: '2020-01-01',
          status: 'active',
          createdAt: '2020-01-01T00:00:00Z',
          updatedAt: '2024-10-01T00:00:00Z',
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

  const handleCreateReview = () => {
    setState(prev => ({ ...prev, showCreateModal: true }));
  };

  const handleViewReview = (review: PerformanceReview) => {
    setState(prev => ({ ...prev, selectedReview: review }));
  };

  const handleCloseModal = () => {
    setState(prev => ({ 
      ...prev, 
      showCreateModal: false, 
      selectedReview: null 
    }));
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = state.employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending-approval': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'bg-purple-100 text-purple-800';
      case 'mid-year': return 'bg-blue-100 text-blue-800';
      case 'quarterly': return 'bg-indigo-100 text-indigo-800';
      case 'probation': return 'bg-orange-100 text-orange-800';
      case 'project-based': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const filteredReviews = state.reviews.filter(review => {
    const employeeName = getEmployeeName(review.employeeId).toLowerCase();
    const reviewerName = getEmployeeName(review.reviewerId).toLowerCase();
    const matchesSearch = employeeName.includes(state.filters.search.toLowerCase()) ||
                         reviewerName.includes(state.filters.search.toLowerCase());
    const matchesType = !state.filters.type || review.type === state.filters.type;
    const matchesStatus = !state.filters.status || review.status === state.filters.status;
    const matchesEmployee = !state.filters.employeeId || review.employeeId === state.filters.employeeId;
    const matchesReviewer = !state.filters.reviewerId || review.reviewerId === state.filters.reviewerId;

    return matchesSearch && matchesType && matchesStatus && matchesEmployee && matchesReviewer;
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
          <h1 className="text-2xl font-bold leading-6 text-gray-900">Performance Reviews</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track performance reviews for your team members.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={handleCreateReview}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Review
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Reviews</dt>
                  <dd className="text-lg font-medium text-gray-900">{state.reviews.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {state.reviews.filter(r => r.status === 'in-progress').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {state.reviews.filter(r => r.status === 'completed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Rating</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {state.reviews.length > 0 
                      ? (state.reviews.reduce((sum, r) => sum + r.overallRating, 0) / state.reviews.length).toFixed(1)
                      : '0.0'
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                placeholder="Search by employee or reviewer..."
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
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={state.filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Types</option>
              <option value="annual">Annual</option>
              <option value="mid-year">Mid-Year</option>
              <option value="quarterly">Quarterly</option>
              <option value="probation">Probation</option>
              <option value="project-based">Project-Based</option>
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
              <option value="in-progress">In Progress</option>
              <option value="pending-approval">Pending Approval</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Reviews ({filteredReviews.length})
          </h3>
        </div>
        
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new performance review.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCreateReview}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Review
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        {getEmployeeName(review.employeeId)} - {review.type} Review
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(review.type)}`}>
                        {review.type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">Period:</span>
                        <p className="text-sm font-medium">
                          {new Date(review.reviewPeriod.startDate).toLocaleDateString()} - {new Date(review.reviewPeriod.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Reviewer:</span>
                        <p className="text-sm font-medium">{getEmployeeName(review.reviewerId)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Overall Rating:</span>
                        <p className={`text-sm font-medium ${getRatingColor(review.overallRating)}`}>
                          {formatRating(review.overallRating)}/5.0
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Sections:</span>
                        <p className="text-sm font-medium">{review.sections.length}</p>
                      </div>
                    </div>

                    {review.strengths && review.strengths.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-900">Key Strengths:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {review.strengths.slice(0, 3).map((strength, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 text-green-700"
                            >
                              {strength}
                            </span>
                          ))}
                          {review.strengths.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                              +{review.strengths.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {review.nextReviewDate && (
                      <div className="text-sm text-gray-500">
                        <strong>Next Review:</strong> {new Date(review.nextReviewDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewReview(review)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <EyeIcon className="-ml-1 mr-1 h-4 w-4" />
                      View
                    </button>
                    {review.status !== 'completed' && (
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <PencilIcon className="-ml-1 mr-1 h-4 w-4" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Review Modal */}
      {state.showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Create New Performance Review
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Start a new performance review process for an employee.
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
                  Create Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Details Modal */}
      {state.selectedReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Performance Review Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {getEmployeeName(state.selectedReview.employeeId)} - {state.selectedReview.type} Review
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Review Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Overall Rating</span>
                    <p className={`text-2xl font-bold ${getRatingColor(state.selectedReview.overallRating)}`}>
                      {formatRating(state.selectedReview.overallRating)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(state.selectedReview.status)}`}>
                      {state.selectedReview.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Type</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(state.selectedReview.type)}`}>
                      {state.selectedReview.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Sections</span>
                    <p className="text-lg font-medium">{state.selectedReview.sections.length}</p>
                  </div>
                </div>

                {/* Review Sections */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Review Sections</h4>
                  <div className="space-y-4">
                    {state.selectedReview.sections.map((section) => (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900">{section.name}</h5>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${getRatingColor(section.rating)}`}>
                              {formatRating(section.rating)}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">({section.weight}%)</span>
                          </div>
                        </div>
                        {section.comments && (
                          <p className="text-sm text-gray-600 mb-3">{section.comments}</p>
                        )}
                        {section.criteria.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-gray-700">Criteria:</span>
                            {section.criteria.map((criterion, index) => (
                              <div key={index} className="flex justify-between items-start text-sm">
                                <span className="text-gray-600">{criterion.name}</span>
                                <span className={`font-medium ${getRatingColor(criterion.rating)}`}>
                                  {formatRating(criterion.rating)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths and Areas for Improvement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {state.selectedReview.strengths && state.selectedReview.strengths.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Strengths</h4>
                      <ul className="space-y-2">
                        {state.selectedReview.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-600">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {state.selectedReview.areasForImprovement && state.selectedReview.areasForImprovement.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Areas for Improvement</h4>
                      <ul className="space-y-2">
                        {state.selectedReview.areasForImprovement.map((area, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-600">{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Development Plan */}
                {state.selectedReview.developmentPlan && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Development Plan</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                      {state.selectedReview.developmentPlan}
                    </p>
                  </div>
                )}

                {/* Comments */}
                {(state.selectedReview.managerComments || state.selectedReview.employeeComments) && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Comments</h4>
                    <div className="space-y-4">
                      {state.selectedReview.managerComments && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Manager Comments:</span>
                          <p className="text-sm text-gray-600 mt-1 bg-blue-50 p-3 rounded-lg">
                            {state.selectedReview.managerComments}
                          </p>
                        </div>
                      )}
                      {state.selectedReview.employeeComments && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Employee Comments:</span>
                          <p className="text-sm text-gray-600 mt-1 bg-green-50 p-3 rounded-lg">
                            {state.selectedReview.employeeComments}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}