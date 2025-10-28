import { hrmsConfig } from '../config/hrms';

// Employee Management Module
export class EmployeeManager {
  static async createEmployee(employeeData: any) {
    try {
      const employee = {
        id: `EMP-${Date.now()}`,
        employeeNumber: this.generateEmployeeNumber(employeeData.department),
        ...employeeData,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // In real implementation, save to database
      console.log('Creating employee:', employee);
      return employee;
    } catch (error) {
      throw new Error(`Failed to create employee: ${error}`);
    }
  }

  static async updateEmployee(employeeId: string, updates: any) {
    try {
      const updatedEmployee = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // In real implementation, update in database
      console.log('Updating employee:', employeeId, updatedEmployee);
      return updatedEmployee;
    } catch (error) {
      throw new Error(`Failed to update employee: ${error}`);
    }
  }

  static async getEmployee(employeeId: string) {
    try {
      // In real implementation, fetch from database
      const mockEmployee = {
        id: employeeId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@hospital.com',
        department: 'emergency',
        position: 'Nurse',
        hireDate: '2023-01-15',
        status: 'active',
      };
      
      return mockEmployee;
    } catch (error) {
      throw new Error(`Failed to fetch employee: ${error}`);
    }
  }

  static generateEmployeeNumber(department: string): string {
    const deptCode = (hrmsConfig.departments as any)[department] || 'GEN';
    const timestamp = Date.now().toString().slice(-6);
    return `${deptCode}${timestamp}`;
  }

  static async calculateEmployeeMetrics(employeeId: string) {
    // Calculate various employee metrics
    return {
      totalLeavesTaken: 10,
      remainingLeaveBalance: 25,
      performanceScore: 4.2,
      attendanceRate: 95.5,
      trainingCompleted: 8,
      trainingPending: 2,
    };
  }
}

// Leave Management Module
export class LeaveManager {
  static async createLeaveRequest(leaveData: any) {
    try {
      const leaveRequest = {
        id: `LEAVE-${Date.now()}`,
        ...leaveData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Calculate leave days
      const startDate = new Date(leaveData.startDate);
      const endDate = new Date(leaveData.endDate);
      const leaveDays = this.calculateLeaveDays(startDate, endDate);
      
      leaveRequest.totalDays = leaveDays;

      // In real implementation, save to database
      console.log('Creating leave request:', leaveRequest);
      return leaveRequest;
    } catch (error) {
      throw new Error(`Failed to create leave request: ${error}`);
    }
  }

  static async approveLeave(leaveId: string, approverId: string, comments?: string) {
    try {
      const approval = {
        leaveId,
        approverId,
        status: 'approved',
        comments,
        approvedAt: new Date().toISOString(),
      };

      // In real implementation, update database
      console.log('Approving leave:', approval);
      return approval;
    } catch (error) {
      throw new Error(`Failed to approve leave: ${error}`);
    }
  }

  static async rejectLeave(leaveId: string, approverId: string, reason: string) {
    try {
      const rejection = {
        leaveId,
        approverId,
        status: 'rejected',
        reason,
        rejectedAt: new Date().toISOString(),
      };

      // In real implementation, update database
      console.log('Rejecting leave:', rejection);
      return rejection;
    } catch (error) {
      throw new Error(`Failed to reject leave: ${error}`);
    }
  }

  static calculateLeaveDays(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    // Remove weekends (simplified calculation)
    let workDays = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        workDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return workDays;
  }

  static async getLeaveBalance(employeeId: string, leaveType: string) {
    // In real implementation, calculate from database
    const leaveConfig = (hrmsConfig.leaveTypes as any)[leaveType];
    const allocations = leaveConfig?.maxDays || 0;
    const used = 10; // Mock used days
    
    return {
      allocated: allocations,
      used,
      remaining: allocations - used,
      leaveType,
    };
  }
}

// Performance Management Module
export class PerformanceManager {
  static async createReview(reviewData: any) {
    try {
      const review = {
        id: `REV-${Date.now()}`,
        ...reviewData,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // In real implementation, save to database
      console.log('Creating performance review:', review);
      return review;
    } catch (error) {
      throw new Error(`Failed to create performance review: ${error}`);
    }
  }

  static async submitReview(reviewId: string) {
    try {
      // In real implementation, update database
      const submission = {
        reviewId,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      };

      console.log('Submitting review:', submission);
      return submission;
    } catch (error) {
      throw new Error(`Failed to submit review: ${error}`);
    }
  }

  static async calculatePerformanceMetrics(employeeId: string, period: string) {
    // Calculate comprehensive performance metrics
    return {
      overallScore: 4.2,
      goalsAchieved: 8,
      goalsTotal: 10,
      competencyScores: {
        technical: 4.5,
        communication: 4.0,
        teamwork: 4.3,
        leadership: 3.8,
        problemSolving: 4.1,
      },
      improvementAreas: ['Leadership', 'Time Management'],
      strengths: ['Technical Excellence', 'Team Collaboration'],
      reviewPeriod: period,
    };
  }

  static async setGoals(employeeId: string, goals: any[]) {
    try {
      const goalsWithIds = goals.map(goal => ({
        id: `GOAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        employeeId,
        ...goal,
        status: 'active',
        createdAt: new Date().toISOString(),
      }));

      // In real implementation, save to database
      console.log('Setting goals:', goalsWithIds);
      return goalsWithIds;
    } catch (error) {
      throw new Error(`Failed to set goals: ${error}`);
    }
  }
}

// Payroll Management Module
export class PayrollManager {
  static async calculatePayroll(employeeId: string, payPeriod: string) {
    try {
      const employee = await EmployeeManager.getEmployee(employeeId);
      
      // Mock payroll calculation
      const baseSalary = (employee as any).salary || 50000;
      const grossPay = baseSalary / 12; // Monthly
      
      const deductions = this.calculateDeductions(grossPay);
      const netPay = grossPay - deductions.total;
      
      const payroll = {
        id: `PAY-${Date.now()}`,
        employeeId,
        payPeriod,
        baseSalary,
        grossPay,
        deductions,
        netPay,
        calculatedAt: new Date().toISOString(),
      };

      console.log('Calculating payroll:', payroll);
      return payroll;
    } catch (error) {
      throw new Error(`Failed to calculate payroll: ${error}`);
    }
  }

  static calculateDeductions(grossPay: number) {
    const taxRate = hrmsConfig.payroll.deductions.tax.rate / 100;
    const socialSecurityRate = hrmsConfig.payroll.deductions.socialSecurity.rate / 100;
    const healthInsuranceRate = 0.05; // 5% for health insurance
    
    const incomeTax = grossPay * taxRate;
    const socialSecurity = grossPay * socialSecurityRate;
    const healthInsurance = grossPay * healthInsuranceRate;
    
    return {
      incomeTax,
      socialSecurity,
      healthInsurance,
      total: incomeTax + socialSecurity + healthInsurance,
    };
  }

  static async generatePayslip(payrollId: string) {
    try {
      // In real implementation, generate PDF payslip
      const payslip = {
        id: payrollId,
        format: 'PDF',
        generatedAt: new Date().toISOString(),
        downloadUrl: `/api/payslips/${payrollId}.pdf`,
      };

      console.log('Generating payslip:', payslip);
      return payslip;
    } catch (error) {
      throw new Error(`Failed to generate payslip: ${error}`);
    }
  }
}

// Attendance Management Module
export class AttendanceManager {
  static async recordCheckIn(employeeId: string) {
    try {
      const attendance = {
        id: `ATT-${Date.now()}`,
        employeeId,
        date: new Date().toISOString().split('T')[0],
        checkIn: new Date().toISOString(),
        status: 'present',
        createdAt: new Date().toISOString(),
      };

      console.log('Recording check-in:', attendance);
      return attendance;
    } catch (error) {
      throw new Error(`Failed to record check-in: ${error}`);
    }
  }

  static async recordCheckOut(employeeId: string) {
    try {
      // In real implementation, find today's attendance record and update
      const checkOut = {
        employeeId,
        checkOut: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('Recording check-out:', checkOut);
      return checkOut;
    } catch (error) {
      throw new Error(`Failed to record check-out: ${error}`);
    }
  }

  static async getAttendanceReport(employeeId: string, startDate: string, endDate: string) {
    // Mock attendance report
    return {
      employeeId,
      period: { startDate, endDate },
      totalDays: 22,
      presentDays: 20,
      absentDays: 2,
      leaveDays: 1,
      attendanceRate: 90.9,
      averageHours: 8.5,
      overtime: 5,
    };
  }
}

// Training Management Module
export class TrainingManager {
  static async enrollEmployee(employeeId: string, trainingId: string) {
    try {
      const enrollment = {
        id: `TRAIN-${Date.now()}`,
        employeeId,
        trainingId,
        status: 'enrolled',
        enrolledAt: new Date().toISOString(),
        completionTarget: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      };

      console.log('Enrolling employee in training:', enrollment);
      return enrollment;
    } catch (error) {
      throw new Error(`Failed to enroll in training: ${error}`);
    }
  }

  static async completeTraining(enrollmentId: string, score?: number) {
    try {
      const completion = {
        enrollmentId,
        status: 'completed',
        completedAt: new Date().toISOString(),
        score: score || null,
      };

      console.log('Completing training:', completion);
      return completion;
    } catch (error) {
      throw new Error(`Failed to complete training: ${error}`);
    }
  }

  static async getTrainingProgress(employeeId: string) {
    // Mock training progress
    return {
      employeeId,
      completedTrainings: 8,
      requiredTrainings: 10,
      inProgress: 1,
      overdue: 1,
      certifications: [
        { name: 'Basic Life Support', expiryDate: '2024-12-31' },
        { name: 'Fire Safety', expiryDate: '2024-06-30' },
      ],
    };
  }
}

export default {
  EmployeeManager,
  LeaveManager,
  PerformanceManager,
  PayrollManager,
  AttendanceManager,
  TrainingManager,
};