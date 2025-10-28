import { useState, useEffect } from 'react';
import { useHRMS } from '../context/HRMSContext';

export function useEmployeeManagement() {
  const { 
    employees, 
    createEmployee, 
    updateEmployee, 
    terminateEmployee, 
    loadEmployees,
    selectedDepartment,
    isLoading,
    error 
  } = useHRMS();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || employee.status === statusFilter;
    const matchesDepartment = !selectedDepartment || employee.department === selectedDepartment;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });
  
  const getEmployeesByDepartment = (department: string) => {
    return employees.filter(emp => emp.department === department && emp.status === 'active');
  };
  
  const getEmployeesByManager = (managerId: string) => {
    return employees.filter(emp => emp.manager === managerId && emp.status === 'active');
  };
  
  const getTotalEmployees = () => employees.length;
  const getActiveEmployees = () => employees.filter(emp => emp.status === 'active').length;
  
  return {
    employees: filteredEmployees,
    allEmployees: employees,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    createEmployee,
    updateEmployee,
    terminateEmployee,
    loadEmployees,
    getEmployeesByDepartment,
    getEmployeesByManager,
    getTotalEmployees,
    getActiveEmployees,
    isLoading,
    error,
  };
}

export function useLeaveManagement() {
  const { 
    leaveRequests, 
    submitLeaveRequest, 
    approveLeaveRequest, 
    rejectLeaveRequest,
    loadLeaveRequests,
    currentEmployee,
    isLoading,
    error 
  } = useHRMS();
  
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  
  const filteredLeaveRequests = leaveRequests.filter(request => {
    const matchesStatus = statusFilter === '' || request.status === statusFilter;
    const matchesType = typeFilter === '' || request.leaveType === typeFilter;
    const matchesEmployee = !currentEmployee || request.employeeId === currentEmployee.id;
    
    return matchesStatus && matchesType && matchesEmployee;
  });
  
  const getPendingRequests = () => {
    return leaveRequests.filter(req => req.status === 'pending');
  };
  
  const getEmployeeLeaveBalance = (employeeId: string, leaveType: string) => {
    const approvedLeave = leaveRequests
      .filter(req => 
        req.employeeId === employeeId && 
        req.leaveType === leaveType && 
        req.status === 'approved'
      )
      .reduce((total, req) => total + req.days, 0);
    
    // This would typically come from employee configuration
    const maxDays = getMaxDaysForLeaveType(leaveType);
    return Math.max(0, maxDays - approvedLeave);
  };
  
  const getLeaveHistory = (employeeId: string) => {
    return leaveRequests.filter(req => req.employeeId === employeeId);
  };
  
  const calculateLeaveDays = (startDate: Date, endDate: Date) => {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };
  
  return {
    leaveRequests: filteredLeaveRequests,
    allLeaveRequests: leaveRequests,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    submitLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    loadLeaveRequests,
    getPendingRequests,
    getEmployeeLeaveBalance,
    getLeaveHistory,
    calculateLeaveDays,
    isLoading,
    error,
  };
}

export function usePerformanceManagement() {
  const { 
    performanceReviews, 
    createPerformanceReview, 
    updatePerformanceReview,
    loadPerformanceReviews,
    currentEmployee,
    isLoading,
    error 
  } = useHRMS();
  
  const [periodFilter, setPeriodFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const filteredReviews = performanceReviews.filter(review => {
    const matchesPeriod = periodFilter === '' || review.reviewPeriod === periodFilter;
    const matchesStatus = statusFilter === '' || review.status === statusFilter;
    const matchesEmployee = !currentEmployee || review.employeeId === currentEmployee.id;
    
    return matchesPeriod && matchesStatus && matchesEmployee;
  });
  
  const getDraftReviews = () => {
    return performanceReviews.filter(review => review.status === 'draft');
  };
  
  const getCompletedReviews = () => {
    return performanceReviews.filter(review => review.status === 'completed');
  };
  
  const getEmployeeReviews = (employeeId: string) => {
    return performanceReviews.filter(review => review.employeeId === employeeId);
  };
  
  const getAverageRating = (employeeId?: string) => {
    const reviews = employeeId 
      ? performanceReviews.filter(r => r.employeeId === employeeId && r.status === 'completed')
      : performanceReviews.filter(r => r.status === 'completed');
    
    if (reviews.length === 0) return 0;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.overallRating, 0);
    return totalRating / reviews.length;
  };
  
  const createGoal = (employeeId: string, goal: any) => {
    // This would typically be a separate API call
    return {
      id: `goal_${Date.now()}`,
      employeeId,
      ...goal,
      status: 'active',
      createdAt: new Date(),
    };
  };
  
  return {
    performanceReviews: filteredReviews,
    allPerformanceReviews: performanceReviews,
    periodFilter,
    setPeriodFilter,
    statusFilter,
    setStatusFilter,
    createPerformanceReview,
    updatePerformanceReview,
    loadPerformanceReviews,
    getDraftReviews,
    getCompletedReviews,
    getEmployeeReviews,
    getAverageRating,
    createGoal,
    isLoading,
    error,
  };
}

export function usePayrollManagement() {
  const { employees } = useHRMS();
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [payPeriod, setPayPeriod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const calculateGrossPay = (employee: any, hoursWorked: number = 160) => {
    // Assuming monthly salary or hourly rate
    if (employee.salary) {
      return employee.salary;
    }
    // If hourly, calculate based on hours worked
    return (employee.hourlyRate || 0) * hoursWorked;
  };
  
  const calculateDeductions = (grossPay: number) => {
    const deductions = {
      tax: grossPay * 0.25,
      socialSecurity: grossPay * 0.06,
      healthInsurance: 500,
      retirement: grossPay * 0.05,
    };
    
    const totalDeductions = Object.values(deductions).reduce((sum, amount) => sum + amount, 0);
    
    return {
      ...deductions,
      total: totalDeductions,
    };
  };
  
  const calculateNetPay = (grossPay: number, deductions: any) => {
    return grossPay - deductions.total;
  };
  
  const generatePayroll = async (period: string) => {
    setIsProcessing(true);
    try {
      const activeEmployees = employees.filter(emp => emp.status === 'active');
      
      const payrollEntries = activeEmployees.map(employee => {
        const grossPay = calculateGrossPay(employee);
        const deductions = calculateDeductions(grossPay);
        const netPay = calculateNetPay(grossPay, deductions);
        
        return {
          employeeId: employee.id,
          period,
          grossPay,
          deductions,
          netPay,
          generatedAt: new Date(),
        };
      });
      
      setPayrollData(payrollEntries);
      return payrollEntries;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const exportPayroll = (format: 'csv' | 'xlsx' | 'pdf') => {
    // Implementation would export payroll data
    console.log(`Exporting payroll in ${format} format`);
  };
  
  return {
    payrollData,
    payPeriod,
    setPayPeriod,
    isProcessing,
    calculateGrossPay,
    calculateDeductions,
    calculateNetPay,
    generatePayroll,
    exportPayroll,
  };
}

export function useHRAnalytics() {
  const { employees, leaveRequests, performanceReviews } = useHRMS();
  
  const getDepartmentStats = () => {
    const departmentCounts: Record<string, number> = {};
    employees.forEach(emp => {
      departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
    });
    return departmentCounts;
  };
  
  const getAveragePerformanceByDepartment = () => {
    const departmentRatings: Record<string, { total: number; count: number }> = {};
    
    performanceReviews
      .filter(review => review.status === 'completed')
      .forEach(review => {
        const employee = employees.find(emp => emp.id === review.employeeId);
        if (employee) {
          const dept = employee.department;
          if (!departmentRatings[dept]) {
            departmentRatings[dept] = { total: 0, count: 0 };
          }
          departmentRatings[dept].total += review.overallRating;
          departmentRatings[dept].count += 1;
        }
      });
    
    const averages: Record<string, number> = {};
    Object.entries(departmentRatings).forEach(([dept, data]) => {
      averages[dept] = data.count > 0 ? data.total / data.count : 0;
    });
    
    return averages;
  };
  
  const getLeaveUsageStats = () => {
    const leaveStats: Record<string, number> = {};
    leaveRequests
      .filter(req => req.status === 'approved')
      .forEach(req => {
        leaveStats[req.leaveType] = (leaveStats[req.leaveType] || 0) + req.days;
      });
    return leaveStats;
  };
  
  const getTurnoverRate = (period: 'monthly' | 'quarterly' | 'yearly' = 'yearly') => {
    const terminatedEmployees = employees.filter(emp => emp.status === 'terminated');
    const totalEmployees = employees.length;
    
    if (totalEmployees === 0) return 0;
    
    // Simplified calculation - in real implementation, would consider time periods
    return (terminatedEmployees.length / totalEmployees) * 100;
  };
  
  const getHiringTrends = () => {
    const hiringByMonth: Record<string, number> = {};
    
    employees.forEach(emp => {
      const hireMonth = emp.hireDate.toISOString().substring(0, 7); // YYYY-MM
      hiringByMonth[hireMonth] = (hiringByMonth[hireMonth] || 0) + 1;
    });
    
    return hiringByMonth;
  };
  
  return {
    getDepartmentStats,
    getAveragePerformanceByDepartment,
    getLeaveUsageStats,
    getTurnoverRate,
    getHiringTrends,
  };
}

// Helper function for leave balance calculation
function getMaxDaysForLeaveType(leaveType: string): number {
  const leaveTypeLimits: Record<string, number> = {
    annual: 25,
    sick: 10,
    maternity: 120,
    paternity: 15,
    emergency: 5,
  };
  
  return leaveTypeLimits[leaveType] || 0;
}