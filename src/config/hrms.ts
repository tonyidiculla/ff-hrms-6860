// Human Resources Management System Configuration
export const hrmsConfig = {
  // Service Configuration
  service: {
    name: 'Human Resources Management System',
    version: '1.0.0',
    port: 6860,
    description: 'Employee management, payroll, and HR operations system',
  },
  
  // Employee Management Configuration
  employment: {
    probationPeriod: 90, // days
    noticePeriod: 30, // days
    contractTypes: ['permanent', 'temporary', 'contract', 'internship'],
    workingHoursPerDay: 8,
    workingDaysPerWeek: 5,
    maxAnnualLeave: 25, // days
    maxSickLeave: 10, // days
  },
  
  // Department Configuration
  departments: {
    administration: 'Administration',
    medical: 'Medical Staff',
    nursing: 'Nursing',
    pharmacy: 'Pharmacy',
    laboratory: 'Laboratory',
    radiology: 'Radiology',
    finance: 'Finance',
    hr: 'Human Resources',
    it: 'Information Technology',
    maintenance: 'Maintenance',
    security: 'Security',
  },
  
  // Position Levels
  positions: {
    executive: {
      level: 5,
      title: 'Executive',
      salaryRange: { min: 150000, max: 300000 },
    },
    manager: {
      level: 4,
      title: 'Manager',
      salaryRange: { min: 100000, max: 200000 },
    },
    supervisor: {
      level: 3,
      title: 'Supervisor',
      salaryRange: { min: 70000, max: 120000 },
    },
    senior: {
      level: 2,
      title: 'Senior Staff',
      salaryRange: { min: 50000, max: 90000 },
    },
    junior: {
      level: 1,
      title: 'Junior Staff',
      salaryRange: { min: 30000, max: 60000 },
    },
  },
  
  // Leave Types Configuration
  leaveTypes: {
    annual: {
      name: 'Annual Leave',
      maxDays: 25,
      carryOver: true,
      requiresApproval: true,
    },
    sick: {
      name: 'Sick Leave',
      maxDays: 10,
      carryOver: false,
      requiresApproval: false,
      documentRequired: true,
    },
    maternity: {
      name: 'Maternity Leave',
      maxDays: 120,
      carryOver: false,
      requiresApproval: true,
      documentRequired: true,
    },
    paternity: {
      name: 'Paternity Leave',
      maxDays: 15,
      carryOver: false,
      requiresApproval: true,
    },
    emergency: {
      name: 'Emergency Leave',
      maxDays: 5,
      carryOver: false,
      requiresApproval: true,
    },
  },
  
  // Performance Management
  performance: {
    reviewCycles: ['quarterly', 'semi-annual', 'annual'],
    ratingScale: {
      excellent: { score: 5, label: 'Excellent (90-100%)' },
      good: { score: 4, label: 'Good (80-89%)' },
      satisfactory: { score: 3, label: 'Satisfactory (70-79%)' },
      improvement: { score: 2, label: 'Needs Improvement (60-69%)' },
      unsatisfactory: { score: 1, label: 'Unsatisfactory (<60%)' },
    },
    goals: {
      maxPerEmployee: 10,
      categories: ['professional', 'technical', 'behavioral', 'leadership'],
    },
  },
  
  // Payroll Configuration
  payroll: {
    payPeriod: 'monthly', // weekly, bi-weekly, monthly
    payDate: 25, // day of month
    currency: 'USD',
    deductions: {
      tax: { rate: 0.25, cap: null },
      socialSecurity: { rate: 0.06, cap: 147000 },
      healthInsurance: { amount: 500, type: 'fixed' },
      retirement: { rate: 0.05, cap: null },
    },
    benefits: {
      healthInsurance: true,
      dentalInsurance: true,
      visionInsurance: true,
      retirementPlan: true,
      lifeInsurance: true,
    },
  },
  
  // Training & Development
  training: {
    categories: ['onboarding', 'compliance', 'technical', 'leadership', 'safety'],
    mandatoryTraining: [
      'workplace_safety',
      'data_protection',
      'anti_harassment',
      'emergency_procedures',
    ],
    certificationTracking: true,
    continuingEducation: {
      requiredHours: 40, // per year
      reimbursementLimit: 5000, // per year
    },
  },
  
  // Role Permissions
  permissions: {
    admin: [
      'view_all_employees',
      'create_employee',
      'edit_employee',
      'delete_employee',
      'manage_payroll',
      'approve_leave',
      'view_reports',
      'system_config',
    ],
    hr_manager: [
      'view_all_employees',
      'create_employee',
      'edit_employee',
      'manage_performance',
      'approve_leave',
      'view_reports',
    ],
    department_manager: [
      'view_department_employees',
      'approve_leave',
      'manage_performance',
      'view_department_reports',
    ],
    supervisor: [
      'view_team_employees',
      'request_leave_approval',
      'manage_team_performance',
    ],
    employee: [
      'view_own_profile',
      'request_leave',
      'view_payroll',
      'update_personal_info',
    ],
  },
  
  // Compliance & Audit
  compliance: {
    dataRetention: {
      employeeRecords: 7, // years
      payrollRecords: 7, // years
      performanceRecords: 5, // years
      trainingRecords: 3, // years
    },
    auditLog: true,
    dataEncryption: true,
    accessLogging: true,
  },
  
  // Integration Configuration
  services: {
    gateway: process.env.HMS_GATEWAY_URL || 'http://localhost:6900',
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:6800',
    roster: process.env.ROSTER_SERVICE_URL || 'http://localhost:6840',
    finance: process.env.FINANCE_SERVICE_URL || 'http://localhost:6850',
    schema: process.env.SCHEMA_SERVICE_URL || 'http://localhost:6790',
  },
  
  // Notification Configuration
  notifications: {
    leaveRequests: true,
    performanceReviews: true,
    birthdayReminders: true,
    contractExpirations: true,
    trainingDue: true,
    payrollGenerated: true,
  },
};

export default hrmsConfig;