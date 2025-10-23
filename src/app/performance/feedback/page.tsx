'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  EyeIcon, 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Feedback, Employee, FeedbackQuestion } from '@/types/hr';

interface FeedbackPageState {
  feedback: Feedback[];
  employees: Employee[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    type: string;
    status: string;
    providerId: string;
    subjectId: string;
  };
  showCreateModal: boolean;
  selectedFeedback: Feedback | null;
  viewMode: 'requests' | 'given' | 'received';
}

export default function FeedbackPage() {
  const [state, setState] = useState<FeedbackPageState>({
    feedback: [],
    employees: [],
    loading: true,
    error: null,
    filters: {
      search: '',
      type: '',
      status: '',
      providerId: '',
      subjectId: '',
    },
    showCreateModal: false,
    selectedFeedback: null,
    viewMode: 'requests',
  });

  useEffect(() => {
    loadFeedback();
    loadEmployees();
  }, []);

  const loadFeedback = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API call - replace with actual API
      const mockQuestions: FeedbackQuestion[] = [
        {
          id: 'q1',
          question: 'How would you rate this person\'s communication skills?',
          type: 'rating',
          required: true,
          category: 'Communication'
        },
        {
          id: 'q2',
          question: 'What are their key strengths?',
          type: 'text',
          required: true,
          category: 'Strengths'
        },
        {
          id: 'q3',
          question: 'How well do they collaborate with team members?',
          type: 'rating',
          required: true,
          category: 'Teamwork'
        },
        {
          id: 'q4',
          question: 'What areas could they improve on?',
          type: 'text',
          required: false,
          category: 'Improvement'
        }
      ];

      const mockFeedback: Feedback[] = [
        {
          id: '1',
          type: '360',
          requesterId: 'mgr1',
          providerId: 'emp2',
          subjectId: 'emp1',
          status: 'completed',
          isAnonymous: false,
          questions: mockQuestions,
          responses: [
            {
              questionId: 'q1',
              response: 4,
              comments: 'Very clear in explaining procedures to clients'
            },
            {
              questionId: 'q2',
              response: 'Excellent surgical skills and patient care'
            },
            {
              questionId: 'q3',
              response: 5,
              comments: 'Always willing to help colleagues'
            },
            {
              questionId: 'q4',
              response: 'Could improve time management during busy periods'
            }
          ],
          overallRating: 4.5,
          submittedAt: '2024-10-15T10:30:00Z',
          dueDate: '2024-10-20T23:59:59Z',
          createdAt: '2024-10-01T00:00:00Z',
          updatedAt: '2024-10-15T10:30:00Z',
        },
        {
          id: '2',
          type: 'peer',
          requesterId: 'emp1',
          providerId: 'emp3',
          subjectId: 'emp1',
          status: 'pending',
          isAnonymous: true,
          questions: mockQuestions.slice(0, 3),
          dueDate: '2024-10-25T23:59:59Z',
          createdAt: '2024-10-20T00:00:00Z',
          updatedAt: '2024-10-20T00:00:00Z',
        },
        {
          id: '3',
          type: 'upward',
          requesterId: 'emp1',
          providerId: 'emp1',
          subjectId: 'mgr1',
          status: 'completed',
          isAnonymous: true,
          questions: [
            {
              id: 'mq1',
              question: 'How effective is their leadership style?',
              type: 'rating',
              required: true,
              category: 'Leadership'
            },
            {
              id: 'mq2',
              question: 'How well do they support your professional development?',
              type: 'rating',
              required: true,
              category: 'Development'
            },
            {
              id: 'mq3',
              question: 'What leadership qualities do they demonstrate well?',
              type: 'text',
              required: false,
              category: 'Strengths'
            }
          ],
          responses: [
            {
              questionId: 'mq1',
              response: 4,
              comments: 'Provides clear direction and support'
            },
            {
              questionId: 'mq2',
              response: 5,
              comments: 'Always encourages learning and growth opportunities'
            },
            {
              questionId: 'mq3',
              response: 'Great at mentoring and providing constructive feedback'
            }
          ],
          overallRating: 4.5,
          submittedAt: '2024-10-18T14:20:00Z',
          dueDate: '2024-10-22T23:59:59Z',
          createdAt: '2024-10-10T00:00:00Z',
          updatedAt: '2024-10-18T14:20:00Z',
        }
      ];

      setState(prev => ({ 
        ...prev, 
        feedback: mockFeedback, 
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load feedback', 
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
          id: 'emp3',
          employeeId: 'FF003',
          firstName: 'Lisa',
          lastName: 'Chen',
          email: 'lisa.chen@furfield.com',
          departmentId: 'dept1',
          positionId: 'pos3',
          hireDate: '2023-06-10',
          status: 'active',
          createdAt: '2023-06-10T00:00:00Z',
          updatedAt: '2024-10-01T00:00:00Z',
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

  const handleViewModeChange = (mode: typeof state.viewMode) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  };

  const handleCreateFeedback = () => {
    setState(prev => ({ ...prev, showCreateModal: true }));
  };

  const handleViewFeedback = (feedback: Feedback) => {
    setState(prev => ({ ...prev, selectedFeedback: feedback }));
  };

  const handleCloseModal = () => {
    setState(prev => ({ 
      ...prev, 
      showCreateModal: false, 
      selectedFeedback: null 
    }));
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = state.employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '360': return 'bg-purple-100 text-purple-800';
      case 'peer': return 'bg-blue-100 text-blue-800';
      case 'upward': return 'bg-indigo-100 text-indigo-800';
      case 'downward': return 'bg-cyan-100 text-cyan-800';
      case 'self': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFeedback = state.feedback.filter(feedback => {
    const providerName = getEmployeeName(feedback.providerId).toLowerCase();
    const subjectName = getEmployeeName(feedback.subjectId).toLowerCase();
    const requesterName = getEmployeeName(feedback.requesterId).toLowerCase();
    
    const matchesSearch = providerName.includes(state.filters.search.toLowerCase()) ||
                         subjectName.includes(state.filters.search.toLowerCase()) ||
                         requesterName.includes(state.filters.search.toLowerCase());
    const matchesType = !state.filters.type || feedback.type === state.filters.type;
    const matchesStatus = !state.filters.status || feedback.status === state.filters.status;
    const matchesProvider = !state.filters.providerId || feedback.providerId === state.filters.providerId;
    const matchesSubject = !state.filters.subjectId || feedback.subjectId === state.filters.subjectId;

    return matchesSearch && matchesType && matchesStatus && matchesProvider && matchesSubject;
  });

  const getViewModeData = () => {
    switch (state.viewMode) {
      case 'given':
        return filteredFeedback.filter(f => f.status === 'completed');
      case 'received':
        return filteredFeedback.filter(f => f.status === 'completed');
      default:
        return filteredFeedback;
    }
  };

  const viewModeData = getViewModeData();

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
          <h1 className="text-2xl font-bold leading-6 text-gray-900">360° Feedback</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage feedback requests and view feedback received from colleagues.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={handleCreateFeedback}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Request Feedback
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => handleViewModeChange('requests')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              state.viewMode === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserGroupIcon className="w-5 h-5 inline-block mr-2" />
            All Requests ({state.feedback.length})
          </button>
          <button
            onClick={() => handleViewModeChange('given')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              state.viewMode === 'given'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5 inline-block mr-2" />
            Given ({state.feedback.filter(f => f.status === 'completed').length})
          </button>
          <button
            onClick={() => handleViewModeChange('received')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              state.viewMode === 'received'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckCircleIcon className="w-5 h-5 inline-block mr-2" />
            Received ({state.feedback.filter(f => f.status === 'completed').length})
          </button>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
                  <dd className="text-lg font-medium text-gray-900">{state.feedback.length}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {state.feedback.filter(f => f.status === 'pending').length}
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
                <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {state.feedback.filter(f => f.status === 'completed').length}
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
                    {state.feedback.filter(f => f.overallRating).length > 0 
                      ? (state.feedback
                          .filter(f => f.overallRating)
                          .reduce((sum, f) => sum + (f.overallRating || 0), 0) / 
                          state.feedback.filter(f => f.overallRating).length).toFixed(1)
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
                placeholder="Search by name..."
              />
            </div>
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
              <option value="360">360 Review</option>
              <option value="peer">Peer Feedback</option>
              <option value="upward">Upward Feedback</option>
              <option value="downward">Downward Feedback</option>
              <option value="self">Self Assessment</option>
              <option value="customer">Customer Feedback</option>
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
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              value={state.filters.subjectId}
              onChange={(e) => handleFilterChange('subjectId', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Subjects</option>
              {state.employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Feedback {state.viewMode} ({viewModeData.length})
          </h3>
        </div>
        
        {viewModeData.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by requesting feedback from colleagues.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCreateFeedback}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Request Feedback
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {viewModeData.map((feedback) => (
              <div key={feedback.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        Feedback for {getEmployeeName(feedback.subjectId)}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(feedback.type)}`}>
                        {feedback.type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                        {feedback.status}
                      </span>
                      {feedback.isAnonymous && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Anonymous
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">Requested by:</span>
                        <p className="text-sm font-medium">{getEmployeeName(feedback.requesterId)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Provider:</span>
                        <p className="text-sm font-medium">
                          {feedback.isAnonymous && feedback.status === 'completed' 
                            ? 'Anonymous' 
                            : getEmployeeName(feedback.providerId)
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Questions:</span>
                        <p className="text-sm font-medium">{feedback.questions.length}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Due Date:</span>
                        <p className="text-sm font-medium">
                          {feedback.dueDate ? new Date(feedback.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {feedback.overallRating && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">Overall Rating:</span>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= feedback.overallRating! ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {feedback.overallRating.toFixed(1)}/5.0
                          </span>
                        </div>
                      </div>
                    )}

                    {feedback.submittedAt && (
                      <div className="text-sm text-gray-500">
                        <strong>Submitted:</strong> {new Date(feedback.submittedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewFeedback(feedback)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <EyeIcon className="-ml-1 mr-1 h-4 w-4" />
                      {feedback.status === 'completed' ? 'View Feedback' : 'View Request'}
                    </button>
                    {feedback.status === 'pending' && (
                      <button className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Provide Feedback
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Feedback Modal */}
      {state.showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Request Feedback
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Request feedback from colleagues about an employee's performance.
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
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Feedback Modal */}
      {state.selectedFeedback && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Feedback Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {state.selectedFeedback.type} feedback for {getEmployeeName(state.selectedFeedback.subjectId)}
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
                {/* Feedback Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(state.selectedFeedback.status)}`}>
                      {state.selectedFeedback.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Type</span>
                    <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(state.selectedFeedback.type)}`}>
                      {state.selectedFeedback.type}
                    </span>
                  </div>
                  {state.selectedFeedback.overallRating && (
                    <div>
                      <span className="text-sm text-gray-500">Overall Rating</span>
                      <p className="text-lg font-bold text-yellow-600">
                        {state.selectedFeedback.overallRating.toFixed(1)}/5.0
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-500">Questions</span>
                    <p className="text-lg font-medium">{state.selectedFeedback.questions.length}</p>
                  </div>
                </div>

                {/* Questions and Responses */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    {state.selectedFeedback.status === 'completed' ? 'Feedback Responses' : 'Questions'}
                  </h4>
                  <div className="space-y-4">
                    {state.selectedFeedback.questions.map((question, index) => {
                      const response = state.selectedFeedback?.responses?.find(r => r.questionId === question.id);
                      return (
                        <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">
                              {index + 1}. {question.question}
                            </h5>
                            <div className="text-right">
                              <span className="text-xs text-gray-500">{question.category}</span>
                              {question.required && (
                                <span className="text-xs text-red-500 ml-1">*</span>
                              )}
                            </div>
                          </div>
                          
                          {response ? (
                            <div className="mt-3 p-3 bg-blue-50 rounded-md">
                              {question.type === 'rating' ? (
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-blue-800 mr-2">Rating:</span>
                                  <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <svg
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= (response.response as number) ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                      </svg>
                                    ))}
                                    <span className="ml-2 text-sm font-medium text-blue-800">
                                      ({response.response}/5)
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-blue-800">{response.response}</p>
                              )}
                              {response.comments && (
                                <p className="text-sm text-blue-700 mt-2 italic">
                                  "{response.comments}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-500 italic">
                                {state.selectedFeedback?.status === 'pending' ? 'Awaiting response' : 'No response provided'}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
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