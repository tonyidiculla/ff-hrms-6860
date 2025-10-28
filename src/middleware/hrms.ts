import { NextRequest, NextResponse } from 'next/server';
import { hrmsConfig } from '../config/hrms';

interface HRMSRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    department?: string;
    employeeId?: string;
  };
}

export async function validateHRMSAccess(
  request: NextRequest,
  requiredPermission: string
): Promise<NextResponse | null> {
  try {
    // Get user from auth middleware (would be set by auth service)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // In a real implementation, validate JWT token and get user info
    const user = await getUserFromToken(authHeader.replace('Bearer ', ''));
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Check if user has required permission
    const userPermissions = hrmsConfig.permissions[user.role as keyof typeof hrmsConfig.permissions] || [];
    
    if (!userPermissions.includes(requiredPermission)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Attach user to request
    (request as HRMSRequest).user = user;
    return null; // No error, proceed
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 401 }
    );
  }
}

export function withHRMSAuth(
  handler: (req: HRMSRequest) => Promise<NextResponse> | NextResponse,
  requiredPermission: string
) {
  return async (request: NextRequest) => {
    const authError = await validateHRMSAccess(request, requiredPermission);
    if (authError) return authError;

    return handler(request as HRMSRequest);
  };
}

export function validateEmployeeData(employeeData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!employeeData.firstName) errors.push('First name is required');
  if (!employeeData.lastName) errors.push('Last name is required');
  if (!employeeData.email) errors.push('Email is required');
  if (!employeeData.department) errors.push('Department is required');
  if (!employeeData.position) errors.push('Position is required');
  if (!employeeData.hireDate) errors.push('Hire date is required');
  if (!employeeData.contractType) errors.push('Contract type is required');
  
  // Email validation
  if (employeeData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeData.email)) {
    errors.push('Invalid email format');
  }
  
  // Date validation
  if (employeeData.hireDate && isNaN(Date.parse(employeeData.hireDate))) {
    errors.push('Invalid hire date');
  }
  
  // Department validation
  if (employeeData.department && !Object.keys(hrmsConfig.departments).includes(employeeData.department)) {
    errors.push('Invalid department');
  }
  
  // Contract type validation
  if (employeeData.contractType && !hrmsConfig.employment.contractTypes.includes(employeeData.contractType)) {
    errors.push('Invalid contract type');
  }
  
  // Salary validation
  if (employeeData.salary && (isNaN(employeeData.salary) || employeeData.salary < 0)) {
    errors.push('Invalid salary amount');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateLeaveRequest(leaveData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!leaveData.employeeId) errors.push('Employee ID is required');
  if (!leaveData.leaveType) errors.push('Leave type is required');
  if (!leaveData.startDate) errors.push('Start date is required');
  if (!leaveData.endDate) errors.push('End date is required');
  if (!leaveData.reason) errors.push('Reason is required');
  
  // Date validation
  if (leaveData.startDate && isNaN(Date.parse(leaveData.startDate))) {
    errors.push('Invalid start date');
  }
  
  if (leaveData.endDate && isNaN(Date.parse(leaveData.endDate))) {
    errors.push('Invalid end date');
  }
  
  // Date range validation
  if (leaveData.startDate && leaveData.endDate) {
    const startDate = new Date(leaveData.startDate);
    const endDate = new Date(leaveData.endDate);
    
    if (endDate < startDate) {
      errors.push('End date must be after start date');
    }
    
    // Check if dates are in the past (except for sick leave)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (leaveData.leaveType !== 'sick' && startDate < today) {
      errors.push('Leave cannot be requested for past dates (except sick leave)');
    }
    
    // Check advance notice requirement
    const daysNotice = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (leaveData.leaveType !== 'sick' && leaveData.leaveType !== 'emergency' && daysNotice < 2) {
      errors.push('Leave requests require at least 2 days advance notice');
    }
  }
  
  // Leave type validation
  if (leaveData.leaveType && !Object.keys(hrmsConfig.leaveTypes).includes(leaveData.leaveType)) {
    errors.push('Invalid leave type');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePerformanceReview(reviewData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!reviewData.employeeId) errors.push('Employee ID is required');
  if (!reviewData.reviewPeriod) errors.push('Review period is required');
  if (!reviewData.reviewerId) errors.push('Reviewer ID is required');
  if (reviewData.overallRating === undefined || reviewData.overallRating === null) {
    errors.push('Overall rating is required');
  }
  
  // Rating validation
  if (reviewData.overallRating !== undefined) {
    const rating = Number(reviewData.overallRating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.push('Overall rating must be between 1 and 5');
    }
  }
  
  // Review period validation
  const validPeriods = hrmsConfig.performance.reviewCycles;
  if (reviewData.reviewPeriod && !validPeriods.includes(reviewData.reviewPeriod)) {
    errors.push(`Review period must be one of: ${validPeriods.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function checkDataAccess(
  user: any,
  targetEmployeeId: string,
  action: string
): boolean {
  // Admin can access all data
  if (user.role === 'admin') {
    return true;
  }
  
  // HR Manager can access all employee data
  if (user.role === 'hr_manager') {
    return true;
  }
  
  // Department managers can access their department's data
  if (user.role === 'department_manager') {
    // Would need to check if target employee is in the same department
    return true; // Simplified for now
  }
  
  // Employees can only access their own data
  if (user.role === 'employee') {
    return user.employeeId === targetEmployeeId;
  }
  
  return false;
}

export function sanitizeEmployeeData(employee: any, userRole: string): any {
  const sensitiveFields = ['salary', 'personalInfo', 'emergencyContacts'];
  
  // Admin and HR can see all data
  if (userRole === 'admin' || userRole === 'hr_manager') {
    return employee;
  }
  
  // Department managers can see most data but not salary details
  if (userRole === 'department_manager') {
    const sanitized = { ...employee };
    delete sanitized.salary;
    return sanitized;
  }
  
  // Regular employees can only see basic information
  const publicFields = ['id', 'firstName', 'lastName', 'email', 'department', 'position'];
  const sanitized: any = {};
  publicFields.forEach(field => {
    if (employee[field] !== undefined) {
      sanitized[field] = employee[field];
    }
  });
  
  return sanitized;
}

export function logHRMSActivity(
  action: string,
  userId: string,
  targetEmployeeId?: string,
  details?: Record<string, any>
) {
  // In a real implementation, this would log to a proper logging/audit system
  console.log(`[HRMS] ${action}`, {
    userId,
    targetEmployeeId,
    timestamp: new Date().toISOString(),
    details,
  });
}

export function rateLimitByUser(userId: string, action: string): boolean {
  // Simple in-memory rate limiting (in production, use Redis or similar)
  const rateLimits: Record<string, { count: number; resetTime: number }> = {};
  
  const key = `${userId}:${action}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;
  
  if (!rateLimits[key] || rateLimits[key].resetTime < now) {
    rateLimits[key] = { count: 1, resetTime: now + windowMs };
    return true;
  }
  
  if (rateLimits[key].count >= maxRequests) {
    return false;
  }
  
  rateLimits[key].count++;
  return true;
}

// Mock function - in real implementation, this would validate JWT and return user
async function getUserFromToken(token: string): Promise<any> {
  // This would integrate with the authentication service
  return {
    id: 'user-123',
    email: 'hr@example.com',
    role: 'hr_manager',
    department: 'hr',
    employeeId: 'EMP-123',
  };
}

export default {
  validateHRMSAccess,
  withHRMSAuth,
  validateEmployeeData,
  validateLeaveRequest,
  validatePerformanceReview,
  checkDataAccess,
  sanitizeEmployeeData,
  logHRMSActivity,
  rateLimitByUser,
};