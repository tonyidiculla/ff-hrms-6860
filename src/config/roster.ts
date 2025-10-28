// Roster Management Configuration
export const rosterConfig = {
  // Service Configuration
  service: {
    name: 'Roster Management',
    version: '1.0.0',
    port: 6840,
    description: 'Workforce scheduling and roster management system',
  },
  
  // Scheduling Configuration
  scheduling: {
    defaultShiftDuration: 8, // hours
    maxShiftsPerWeek: 5,
    minBreakBetweenShifts: 12, // hours
    advanceNoticeRequired: 48, // hours
    maxConsecutiveDays: 7,
  },
  
  // Shift Types Configuration
  shiftTypes: {
    morning: {
      name: 'Morning Shift',
      startTime: '06:00',
      endTime: '14:00',
      duration: 8,
    },
    afternoon: {
      name: 'Afternoon Shift', 
      startTime: '14:00',
      endTime: '22:00',
      duration: 8,
    },
    night: {
      name: 'Night Shift',
      startTime: '22:00',
      endTime: '06:00',
      duration: 8,
    },
    emergency: {
      name: 'Emergency Shift',
      startTime: 'flexible',
      endTime: 'flexible',
      duration: 'variable',
    },
  },
  
  // Department Configuration
  departments: {
    emergency: 'Emergency Department',
    icu: 'Intensive Care Unit',
    surgery: 'Surgery Department',
    pediatrics: 'Pediatrics',
    cardiology: 'Cardiology',
    neurology: 'Neurology',
    oncology: 'Oncology',
    radiology: 'Radiology',
    pharmacy: 'Pharmacy',
    administration: 'Administration',
  },
  
  // Role Permissions
  permissions: {
    admin: ['view_all', 'create_roster', 'edit_roster', 'delete_roster', 'manage_staff', 'approve_requests'],
    manager: ['view_department', 'create_roster', 'edit_roster', 'approve_requests'],
    supervisor: ['view_team', 'edit_own_roster', 'submit_requests'],
    staff: ['view_own', 'submit_requests', 'swap_shifts'],
  },
  
  // Notification Configuration
  notifications: {
    rosterChanges: true,
    shiftReminders: true,
    swapRequests: true,
    emergencyCalls: true,
    reminderHours: [24, 4, 1], // hours before shift
  },
  
  // Compliance Rules
  compliance: {
    maxHoursPerWeek: 40,
    minRestPeriod: 11, // hours
    weekendRotation: true,
    holidayRotation: true,
    specialtyRotation: true,
  },
  
  // HMS Service Integration
  services: {
    gateway: process.env.HMS_GATEWAY_URL || 'http://localhost:6900',
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:6800',
    hrms: process.env.HRMS_SERVICE_URL || 'http://localhost:6860',
    schema: process.env.SCHEMA_SERVICE_URL || 'http://localhost:6790',
  },
};

export default rosterConfig;