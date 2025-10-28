'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  level: number;
  manager?: string;
  hireDate: Date;
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  salary?: number;
  contractType: string;
  avatar?: string;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string;
  approvedBy?: string;
  comments?: string;
}

interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewPeriod: string;
  overallRating: number;
  goals: any[];
  strengths: string[];
  improvementAreas: string[];
  reviewDate: Date;
  reviewerId: string;
  status: 'draft' | 'completed' | 'acknowledged';
}

interface HRMSState {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  performanceReviews: PerformanceReview[];
  currentEmployee: Employee | null;
  selectedDepartment: string | null;
  isLoading: boolean;
  error: string | null;
}

interface HRMSContextType extends HRMSState {
  // Employee Management
  loadEmployees: (department?: string) => Promise<void>;
  createEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => Promise<void>;
  terminateEmployee: (employeeId: string, reason: string) => Promise<void>;
  
  // Leave Management
  submitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'status'>) => Promise<void>;
  approveLeaveRequest: (requestId: string, comments?: string) => Promise<void>;
  rejectLeaveRequest: (requestId: string, reason: string) => Promise<void>;
  loadLeaveRequests: (employeeId?: string) => Promise<void>;
  
  // Performance Management
  createPerformanceReview: (review: Omit<PerformanceReview, 'id'>) => Promise<void>;
  updatePerformanceReview: (reviewId: string, updates: Partial<PerformanceReview>) => Promise<void>;
  loadPerformanceReviews: (employeeId?: string) => Promise<void>;
  
  // Filters and State
  setSelectedDepartment: (department: string | null) => void;
  setCurrentEmployee: (employee: Employee | null) => void;
  clearError: () => void;
}

type HRMSAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'SET_LEAVE_REQUESTS'; payload: LeaveRequest[] }
  | { type: 'SET_PERFORMANCE_REVIEWS'; payload: PerformanceReview[] }
  | { type: 'SET_CURRENT_EMPLOYEE'; payload: Employee | null }
  | { type: 'SET_SELECTED_DEPARTMENT'; payload: string | null }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: { id: string; updates: Partial<Employee> } }
  | { type: 'ADD_LEAVE_REQUEST'; payload: LeaveRequest }
  | { type: 'UPDATE_LEAVE_REQUEST'; payload: { id: string; updates: Partial<LeaveRequest> } }
  | { type: 'ADD_PERFORMANCE_REVIEW'; payload: PerformanceReview }
  | { type: 'UPDATE_PERFORMANCE_REVIEW'; payload: { id: string; updates: Partial<PerformanceReview> } };

const initialState: HRMSState = {
  employees: [],
  leaveRequests: [],
  performanceReviews: [],
  currentEmployee: null,
  selectedDepartment: null,
  isLoading: false,
  error: null,
};

function hrmsReducer(state: HRMSState, action: HRMSAction): HRMSState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload, isLoading: false };
    case 'SET_LEAVE_REQUESTS':
      return { ...state, leaveRequests: action.payload, isLoading: false };
    case 'SET_PERFORMANCE_REVIEWS':
      return { ...state, performanceReviews: action.payload, isLoading: false };
    case 'SET_CURRENT_EMPLOYEE':
      return { ...state, currentEmployee: action.payload };
    case 'SET_SELECTED_DEPARTMENT':
      return { ...state, selectedDepartment: action.payload };
    case 'ADD_EMPLOYEE':
      return { 
        ...state, 
        employees: [...state.employees, action.payload],
        isLoading: false 
      };
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(emp =>
          emp.id === action.payload.id 
            ? { ...emp, ...action.payload.updates }
            : emp
        ),
        isLoading: false
      };
    case 'ADD_LEAVE_REQUEST':
      return {
        ...state,
        leaveRequests: [...state.leaveRequests, action.payload],
        isLoading: false
      };
    case 'UPDATE_LEAVE_REQUEST':
      return {
        ...state,
        leaveRequests: state.leaveRequests.map(req =>
          req.id === action.payload.id
            ? { ...req, ...action.payload.updates }
            : req
        ),
        isLoading: false
      };
    case 'ADD_PERFORMANCE_REVIEW':
      return {
        ...state,
        performanceReviews: [...state.performanceReviews, action.payload],
        isLoading: false
      };
    case 'UPDATE_PERFORMANCE_REVIEW':
      return {
        ...state,
        performanceReviews: state.performanceReviews.map(review =>
          review.id === action.payload.id
            ? { ...review, ...action.payload.updates }
            : review
        ),
        isLoading: false
      };
    default:
      return state;
  }
}

const HRMSContext = createContext<HRMSContextType | undefined>(undefined);

export function HRMSProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(hrmsReducer, initialState);

  // Employee Management
  const loadEmployees = async (department?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = new URLSearchParams();
      if (department) params.set('department', department);
      
      const response = await fetch(`/api/hrms/employees?${params}`);
      if (!response.ok) throw new Error('Failed to load employees');
      
      const employees = await response.json();
      dispatch({ type: 'SET_EMPLOYEES', payload: employees });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const createEmployee = async (employee: Omit<Employee, 'id'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/hrms/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });
      
      if (!response.ok) throw new Error('Failed to create employee');
      
      const newEmployee = await response.json();
      dispatch({ type: 'ADD_EMPLOYEE', payload: newEmployee });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const updateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`/api/hrms/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update employee');
      
      dispatch({ type: 'UPDATE_EMPLOYEE', payload: { id: employeeId, updates } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const terminateEmployee = async (employeeId: string, reason: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`/api/hrms/employees/${employeeId}/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) throw new Error('Failed to terminate employee');
      
      dispatch({ 
        type: 'UPDATE_EMPLOYEE', 
        payload: { 
          id: employeeId, 
          updates: { status: 'terminated' } 
        } 
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  // Leave Management
  const submitLeaveRequest = async (request: Omit<LeaveRequest, 'id' | 'status'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/hrms/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) throw new Error('Failed to submit leave request');
      
      const newRequest = await response.json();
      dispatch({ type: 'ADD_LEAVE_REQUEST', payload: newRequest });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const approveLeaveRequest = async (requestId: string, comments?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`/api/hrms/leave-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments }),
      });
      
      if (!response.ok) throw new Error('Failed to approve leave request');
      
      dispatch({ 
        type: 'UPDATE_LEAVE_REQUEST', 
        payload: { 
          id: requestId, 
          updates: { status: 'approved', comments } 
        } 
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const rejectLeaveRequest = async (requestId: string, reason: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`/api/hrms/leave-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) throw new Error('Failed to reject leave request');
      
      dispatch({ 
        type: 'UPDATE_LEAVE_REQUEST', 
        payload: { 
          id: requestId, 
          updates: { status: 'rejected', comments: reason } 
        } 
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const loadLeaveRequests = async (employeeId?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = new URLSearchParams();
      if (employeeId) params.set('employeeId', employeeId);
      
      const response = await fetch(`/api/hrms/leave-requests?${params}`);
      if (!response.ok) throw new Error('Failed to load leave requests');
      
      const requests = await response.json();
      dispatch({ type: 'SET_LEAVE_REQUESTS', payload: requests });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  // Performance Management
  const createPerformanceReview = async (review: Omit<PerformanceReview, 'id'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/hrms/performance-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      
      if (!response.ok) throw new Error('Failed to create performance review');
      
      const newReview = await response.json();
      dispatch({ type: 'ADD_PERFORMANCE_REVIEW', payload: newReview });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const updatePerformanceReview = async (reviewId: string, updates: Partial<PerformanceReview>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`/api/hrms/performance-reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update performance review');
      
      dispatch({ type: 'UPDATE_PERFORMANCE_REVIEW', payload: { id: reviewId, updates } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const loadPerformanceReviews = async (employeeId?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = new URLSearchParams();
      if (employeeId) params.set('employeeId', employeeId);
      
      const response = await fetch(`/api/hrms/performance-reviews?${params}`);
      if (!response.ok) throw new Error('Failed to load performance reviews');
      
      const reviews = await response.json();
      dispatch({ type: 'SET_PERFORMANCE_REVIEWS', payload: reviews });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  // Other functions
  const setSelectedDepartment = (department: string | null) => {
    dispatch({ type: 'SET_SELECTED_DEPARTMENT', payload: department });
  };

  const setCurrentEmployee = (employee: Employee | null) => {
    dispatch({ type: 'SET_CURRENT_EMPLOYEE', payload: employee });
  };

  const clearError = () => dispatch({ type: 'SET_ERROR', payload: null });

  // Load initial data
  useEffect(() => {
    loadEmployees(state.selectedDepartment || undefined);
    loadLeaveRequests();
    loadPerformanceReviews();
  }, [state.selectedDepartment]);

  return (
    <HRMSContext.Provider
      value={{
        ...state,
        loadEmployees,
        createEmployee,
        updateEmployee,
        terminateEmployee,
        submitLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        loadLeaveRequests,
        createPerformanceReview,
        updatePerformanceReview,
        loadPerformanceReviews,
        setSelectedDepartment,
        setCurrentEmployee,
        clearError,
      }}
    >
      {children}
    </HRMSContext.Provider>
  );
}

export function useHRMS() {
  const context = useContext(HRMSContext);
  if (context === undefined) {
    throw new Error('useHRMS must be used within a HRMSProvider');
  }
  return context;
}

export default HRMSContext;