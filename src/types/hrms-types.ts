// Employee-related types
export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  hireDate: string;
  contractType: 'permanent' | 'contract' | 'temporary' | 'intern';
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  salary?: number;
  manager?: string;
  emergencyContact?: EmergencyContact;
  personalInfo?: PersonalInfo;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalInfo {
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  nationality?: string;
  address?: Address;
  identificationNumber?: string;
  passportNumber?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: Address;
}

// Leave-related types
export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approverId?: string;
  approverComments?: string;
  documents?: string[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface LeaveBalance {
  employeeId: string;
  leaveType: string;
  allocated: number;
  used: number;
  remaining: number;
  carryOver?: number;
  year: number;
}

export interface LeaveType {
  id: string;
  name: string;
  maxDays: number;
  carryOver: boolean;
  requiresApproval: boolean;
  documentRequired?: boolean;
  description?: string;
}

// Performance-related types
export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewPeriod: string;
  overallRating: number;
  competencyRatings: CompetencyRating[];
  goals: Goal[];
  achievements: Achievement[];
  improvementAreas: string[];
  reviewerComments?: string;
  employeeComments?: string;
  status: 'draft' | 'submitted' | 'completed' | 'acknowledged';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  acknowledgedAt?: string;
}

export interface CompetencyRating {
  competency: string;
  rating: number;
  comments?: string;
}

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'active' | 'completed' | 'cancelled' | 'overdue';
  progress: number;
  category: 'performance' | 'development' | 'behavioral';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
}

// Payroll-related types
export interface PayrollRecord {
  id: string;
  employeeId: string;
  payPeriod: string;
  baseSalary: number;
  grossPay: number;
  deductions: PayrollDeductions;
  netPay: number;
  payDate: string;
  status: 'draft' | 'processed' | 'paid';
  calculatedAt: string;
  processedAt?: string;
  paidAt?: string;
}

export interface PayrollDeductions {
  incomeTax: number;
  socialSecurity: number;
  healthInsurance: number;
  retirement?: number;
  other?: { [key: string]: number };
  total: number;
}

export interface Payslip {
  id: string;
  payrollId: string;
  format: 'PDF' | 'HTML';
  generatedAt: string;
  downloadUrl: string;
}

// Attendance-related types
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
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceReport {
  employeeId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateDays: number;
  overtimeHours: number;
  attendanceRate: number;
  averageHours: number;
}

// Training-related types
export interface Training {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number; // in hours
  format: 'online' | 'classroom' | 'workshop' | 'seminar';
  provider: string;
  cost?: number;
  maxParticipants?: number;
  prerequisites?: string[];
  certificationProvided: boolean;
  validityPeriod?: number; // in months
  createdAt: string;
  updatedAt: string;
}

export interface TrainingEnrollment {
  id: string;
  employeeId: string;
  trainingId: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'cancelled';
  enrolledAt: string;
  startedAt?: string;
  completedAt?: string;
  completionTarget: string;
  score?: number;
  certificateUrl?: string;
  feedback?: string;
}

export interface TrainingProgress {
  employeeId: string;
  completedTrainings: number;
  requiredTrainings: number;
  inProgress: number;
  overdue: number;
  certifications: Certification[];
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
  issuedDate: string;
  expiryDate?: string;
  certificateNumber?: string;
  status: 'valid' | 'expired' | 'expiring_soon';
}

// Department and Position types
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  parentDepartment?: string;
  budgetCode?: string;
  costCenter?: string;
}

export interface Position {
  id: string;
  title: string;
  department: string;
  level: 'junior' | 'senior' | 'lead' | 'manager' | 'director';
  description?: string;
  requirements: string[];
  responsibilities: string[];
  salaryRange?: {
    min: number;
    max: number;
  };
}

// System types
export interface HRMSUser {
  id: string;
  email: string;
  role: 'admin' | 'hr_manager' | 'department_manager' | 'employee';
  permissions: string[];
  employeeId?: string;
  department?: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface HRMSPermission {
  id: string;
  name: string;
  description: string;
  module: string;
  actions: string[];
}

// API Response types
export interface HRMSApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

// Filter and Query types
export interface EmployeeFilters {
  department?: string;
  position?: string;
  status?: string;
  contractType?: string;
  hireDate?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface LeaveFilters {
  employeeId?: string;
  department?: string;
  leaveType?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface PerformanceFilters {
  employeeId?: string;
  department?: string;
  reviewPeriod?: string;
  rating?: {
    min: number;
    max: number;
  };
}

// Analytics and Reporting types
export interface HRAnalytics {
  employeeCount: {
    total: number;
    active: number;
    byDepartment: { [department: string]: number };
    byContractType: { [type: string]: number };
  };
  turnover: {
    rate: number;
    period: string;
    departures: number;
    newHires: number;
  };
  attendance: {
    averageRate: number;
    totalAbsences: number;
    leaveUtilization: number;
  };
  performance: {
    averageRating: number;
    goalsCompleted: number;
    trainingCompliance: number;
  };
  payroll: {
    totalCost: number;
    averageSalary: number;
    deductionSummary: PayrollDeductions;
  };
}

// Form and Validation types
export interface FormValidation {
  isValid: boolean;
  errors: string[];
  fieldErrors?: { [field: string]: string };
}

export interface HRMSFormData {
  [key: string]: any;
}

// Notification types
export interface HRMSNotification {
  id: string;
  type: 'leave_request' | 'performance_review' | 'training_due' | 'birthday' | 'anniversary' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetUsers: string[];
  targetRoles?: string[];
  scheduledFor?: string;
  expiresAt?: string;
  data?: { [key: string]: any };
  createdAt: string;
  readBy: string[];
}

// Audit and Logging types
export interface HRMSAuditLog {
  id: string;
  action: string;
  module: string;
  userId: string;
  targetEmployeeId?: string;
  oldValues?: { [key: string]: any };
  newValues?: { [key: string]: any };
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export default {
  // Re-export all types for easy importing
};