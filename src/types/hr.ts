// FF-HR Types - Performance Management & HR System Types

// Base Types
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  positionId: string;
  managerId?: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'terminated';
  profilePicture?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  code: string;
  budgetCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  title: string;
  description?: string;
  departmentId: string;
  level: string;
  salaryRange?: {
    min: number;
    max: number;
  };
  requirements?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Performance Management Types
export interface PerformanceGoal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  category: 'individual' | 'team' | 'departmental' | 'company';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'overdue';
  targetDate: string;
  startDate: string;
  completionDate?: string;
  progress: number; // 0-100
  metrics?: {
    type: 'numeric' | 'percentage' | 'boolean' | 'milestone';
    target: number | string;
    current: number | string;
    unit?: string;
  };
  managerId: string;
  reviewerId?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewPeriod: {
    startDate: string;
    endDate: string;
  };
  type: 'annual' | 'mid-year' | 'quarterly' | 'probation' | 'project-based';
  status: 'draft' | 'in-progress' | 'pending-approval' | 'completed' | 'cancelled';
  overallRating: number; // 1-5
  sections: PerformanceReviewSection[];
  goals: {
    goalId: string;
    achievementRating: number;
    comments?: string;
  }[];
  strengths?: string[];
  areasForImprovement?: string[];
  developmentPlan?: string;
  managerComments?: string;
  employeeComments?: string;
  hrComments?: string;
  nextReviewDate?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
}

export interface PerformanceReviewSection {
  id: string;
  name: string;
  description?: string;
  weight: number; // percentage weight in overall score
  rating: number; // 1-5
  comments?: string;
  criteria: {
    name: string;
    description?: string;
    rating: number;
    comments?: string;
  }[];
}

export interface Feedback {
  id: string;
  type: '360' | 'peer' | 'upward' | 'downward' | 'self' | 'customer';
  requesterId: string; // Who requested the feedback
  providerId: string; // Who is providing the feedback
  subjectId: string; // Who the feedback is about
  status: 'pending' | 'completed' | 'declined' | 'expired';
  isAnonymous: boolean;
  questions: FeedbackQuestion[];
  responses?: FeedbackResponse[];
  overallRating?: number;
  submittedAt?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackQuestion {
  id: string;
  question: string;
  type: 'rating' | 'text' | 'multiple-choice' | 'yes-no';
  required: boolean;
  options?: string[]; // For multiple choice
  category?: string;
}

export interface FeedbackResponse {
  questionId: string;
  response: string | number;
  comments?: string;
}

export interface PerformanceReport {
  id: string;
  title: string;
  type: 'individual' | 'team' | 'department' | 'company';
  period: {
    startDate: string;
    endDate: string;
  };
  filters: {
    departmentIds?: string[];
    positionIds?: string[];
    employeeIds?: string[];
    tags?: string[];
  };
  metrics: {
    name: string;
    value: number;
    trend?: 'up' | 'down' | 'stable';
    previousValue?: number;
    target?: number;
  }[];
  charts: {
    type: 'bar' | 'line' | 'pie' | 'scatter';
    title: string;
    data: any[];
  }[];
  insights: string[];
  recommendations: string[];
  generatedAt: string;
  generatedBy: string;
}

// Leave Management Types
export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'personal' | 'emergency' | 'unpaid';
  startDate: string;
  endDate: string;
  days: number;
  halfDay?: 'morning' | 'afternoon';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approverId?: string;
  approvedAt?: string;
  rejectionReason?: string;
  attachments?: string[];
  coveringEmployeeId?: string;
  handoverNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  year: number;
  type: string;
  entitled: number;
  used: number;
  pending: number;
  remaining: number;
  carriedForward?: number;
  updatedAt: string;
}

export interface LeavePolicy {
  id: string;
  name: string;
  type: string;
  description?: string;
  entitlement: number; // days per year
  maxCarryForward?: number;
  accrualRate?: number; // days per month
  eligibilityMonths?: number; // months before eligible
  requiresApproval: boolean;
  advanceNoticeMinDays?: number;
  maxConsecutiveDays?: number;
  isActive: boolean;
  applicableToAll: boolean;
  applicableDepartments?: string[];
  applicablePositions?: string[];
  createdAt: string;
  updatedAt: string;
}

// Training Management Types
export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'internal' | 'external' | 'online' | 'certification';
  duration: number; // hours
  maxParticipants?: number;
  cost?: number;
  provider?: string;
  prerequisites?: string[];
  objectives: string[];
  materials?: string[];
  isActive: boolean;
  isMandatory: boolean;
  validityPeriod?: number; // months
  createdAt: string;
  updatedAt: string;
}

export interface TrainingSession {
  id: string;
  programId: string;
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  virtualLink?: string;
  instructorId?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  maxParticipants?: number;
  enrolledParticipants: number;
  materials?: string[];
  feedback?: {
    rating: number;
    comments: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface TrainingEnrollment {
  id: string;
  sessionId: string;
  employeeId: string;
  status: 'enrolled' | 'attended' | 'completed' | 'failed' | 'cancelled';
  enrollmentDate: string;
  completionDate?: string;
  score?: number;
  certificateUrl?: string;
  feedback?: {
    rating: number;
    comments?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours?: number;
  overtimeHours?: number;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'leave';
  notes?: string;
  location?: string;
  ipAddress?: string;
  deviceInfo?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard & Analytics Types
export interface DashboardMetric {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// Form Types
export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  positionId: string;
  managerId?: string;
  hireDate: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface GoalFormData {
  title: string;
  description: string;
  category: string;
  priority: string;
  targetDate: string;
  startDate: string;
  metrics?: {
    type: string;
    target: number | string;
    unit?: string;
  };
  tags?: string[];
  notes?: string;
}

export interface ReviewFormData {
  reviewPeriod: {
    startDate: string;
    endDate: string;
  };
  type: string;
  sections: {
    name: string;
    weight: number;
    rating: number;
    comments?: string;
    criteria: {
      name: string;
      rating: number;
      comments?: string;
    }[];
  }[];
  strengths?: string[];
  areasForImprovement?: string[];
  developmentPlan?: string;
  managerComments?: string;
}
