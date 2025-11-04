// Unified Rostering System - TypeScript Definitions
// Single table approach with flexible JSON metadata

export type RosteringEntryType = 
  | 'staff_profile'     // Staff member profile and defaults
  | 'weekly_pattern'    // Recurring weekly schedule pattern  
  | 'date_specific'     // Specific date assignment/exception
  | 'external_booking'  // Appointment from external system
  | 'availability_rule' // Availability constraints
  | 'time_off_request'; // Leave/vacation requests

export type EntryStatus = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'cancelled';

// Core unified rostering entry
export interface RosteringEntry {
  id: string;
  entity_platform_id: string;
  entry_type: RosteringEntryType;
  staff_id?: string;
  staff_name?: string;
  staff_email?: string;
  effective_date?: string; // ISO date
  expiry_date?: string;    // ISO date
  day_of_week?: number;    // 0-6 (Sunday=0)
  start_time?: string;     // HH:MM:SS
  end_time?: string;       // HH:MM:SS
  status: EntryStatus;
  priority: number;
  metadata: Record<string, any>; // Flexible JSON data
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Metadata type definitions for different entry types
export interface StaffProfileMetadata {
  role_type: 'veterinarian' | 'nurse' | 'receptionist' | 'technician' | 'manager';
  department?: string;
  default_slot_duration?: number; // minutes
  qualifications?: string[];
  phone?: string;
  hire_date?: string;
  full_time_hours?: number;
  employee_id?: string;
  can_take_appointments?: boolean;
}

export interface WeeklyPatternMetadata {
  pattern_name?: string;
  break_times?: Array<{ start: string; end: string }>;
  location?: string;
  notes?: string;
  max_appointments?: number;
}

export interface DateSpecificMetadata {
  reason?: string;
  type?: 'day_off' | 'special_hours' | 'unavailable' | 'holiday';
  approved_by?: string;
  notes?: string;
  replacement_staff_id?: string;
}

export interface ExternalBookingMetadata {
  external_id: string;
  source_system: string; // 'ff-hms-6900', 'ff-pa-6890', etc.
  client_name?: string;
  appointment_type?: string;
  client_phone?: string;
  notes?: string;
  duration_minutes?: number;
}

export interface AvailabilityRuleMetadata {
  rule_type: 'max_hours_per_day' | 'max_days_per_week' | 'required_break' | 'no_back_to_back';
  rule_value: number;
  description?: string;
}

export interface TimeOffRequestMetadata {
  request_type: 'vacation' | 'sick_leave' | 'personal' | 'emergency';
  request_date?: string;
  approved_by?: string;
  approval_date?: string;
  notes?: string;
  replacement_arranged?: boolean;
}

// Typed rostering entries for different use cases
export interface StaffProfileEntry extends Omit<RosteringEntry, 'entry_type' | 'metadata'> {
  entry_type: 'staff_profile';
  metadata: StaffProfileMetadata;
}

export interface WeeklyPatternEntry extends Omit<RosteringEntry, 'entry_type' | 'metadata'> {
  entry_type: 'weekly_pattern';
  day_of_week: number;
  start_time: string;
  end_time: string;
  metadata: WeeklyPatternMetadata;
}

export interface DateSpecificEntry extends Omit<RosteringEntry, 'entry_type' | 'metadata'> {
  entry_type: 'date_specific';
  effective_date: string;
  metadata: DateSpecificMetadata;
}

export interface ExternalBookingEntry extends Omit<RosteringEntry, 'entry_type' | 'metadata'> {
  entry_type: 'external_booking';
  effective_date: string;
  start_time: string;
  end_time: string;
  metadata: ExternalBookingMetadata;
}

// Request/Response types for API operations
export interface CreateRosteringEntryRequest {
  entry_type: RosteringEntryType;
  staff_id?: string;
  staff_name?: string;
  staff_email?: string;
  effective_date?: string;
  expiry_date?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  status?: EntryStatus;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface UpdateRosteringEntryRequest {
  effective_date?: string;
  expiry_date?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  status?: EntryStatus;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface RosteringQuery {
  staff_ids?: string[];
  entry_types?: RosteringEntryType[];
  date_from?: string;
  date_to?: string;
  day_of_week?: number;
  status?: EntryStatus[];
  include_expired?: boolean;
}

// Computed/derived types for UI display
export interface StaffScheduleForDay {
  staff_id: string;
  staff_name: string;
  date: string;
  day_of_week: number;
  entries: RosteringEntry[];
  computed_schedule: {
    is_available: boolean;
    work_periods: Array<{ start_time: string; end_time: string; type: string }>;
    break_periods: Array<{ start_time: string; end_time: string }>;
    appointments: ExternalBookingEntry[];
    total_hours: number;
    notes: string[];
  };
}

export interface WeeklyRosterView {
  week_start_date: string;
  staff_schedules: Array<{
    staff_profile: StaffProfileEntry;
    daily_schedules: StaffScheduleForDay[];
  }>;
  summary: {
    total_staff: number;
    total_hours: number;
    total_appointments: number;
    coverage_gaps: Array<{
      date: string;
      time_period: string;
      required_roles: string[];
    }>;
  };
}

export interface RosteringMetrics {
  period_start: string;
  period_end: string;
  total_staff: number;
  active_staff: number;
  total_scheduled_hours: number;
  total_appointments: number;
  coverage_rate: number; // percentage
  overtime_hours: number;
  time_off_requests: number;
  schedule_conflicts: number;
}

// Utility functions type definitions
export interface ScheduleConflict {
  staff_id: string;
  date: string;
  conflicting_entries: RosteringEntry[];
  conflict_type: 'time_overlap' | 'double_booking' | 'availability_rule_violation';
  suggested_resolution?: string;
}

export interface AvailableTimeSlot {
  start_time: string;
  end_time: string;
  duration_minutes: number;
  slot_type: 'available' | 'booked' | 'break' | 'unavailable';
}

// Form validation schemas (for use with Zod or similar)
export const ROSTERING_ENTRY_TYPES: RosteringEntryType[] = [
  'staff_profile',
  'weekly_pattern', 
  'date_specific',
  'external_booking',
  'availability_rule',
  'time_off_request'
];

export const ENTRY_STATUSES: EntryStatus[] = [
  'active',
  'inactive', 
  'pending',
  'approved',
  'rejected',
  'cancelled'
];

export const ROLE_TYPES = [
  'veterinarian',
  'nurse', 
  'receptionist',
  'technician',
  'manager'
] as const;

export type RoleType = typeof ROLE_TYPES[number];

// Helper type guards
export function isStaffProfile(entry: RosteringEntry): entry is StaffProfileEntry {
  return entry.entry_type === 'staff_profile';
}

export function isWeeklyPattern(entry: RosteringEntry): entry is WeeklyPatternEntry {
  return entry.entry_type === 'weekly_pattern';
}

export function isDateSpecific(entry: RosteringEntry): entry is DateSpecificEntry {
  return entry.entry_type === 'date_specific';
}

export function isExternalBooking(entry: RosteringEntry): entry is ExternalBookingEntry {
  return entry.entry_type === 'external_booking';
}