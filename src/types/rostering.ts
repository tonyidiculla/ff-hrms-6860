// Database types for the rostering system
// Based on the scheduling-tables.sql schema

export interface StaffMember {
  id: string;
  entity_platform_id: string;
  user_platform_id?: string;
  employee_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  role_type: string;
  job_title?: string;
  slot_duration_minutes: number;
  can_take_appointments: boolean;
  hire_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeeklySchedule {
  id: string;
  staff_member_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string; // HH:MM format
  end_time: string;   // HH:MM format
  is_available: boolean;
  effective_from: string; // YYYY-MM-DD format
  effective_until?: string; // YYYY-MM-DD format, null means indefinite
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleException {
  id: string;
  staff_member_id: string;
  exception_date: string; // YYYY-MM-DD format
  exception_type: 'holiday' | 'sick_leave' | 'vacation' | 'special_hours' | 'unavailable';
  start_time?: string; // HH:MM format, null for full day exceptions
  end_time?: string;   // HH:MM format, null for full day exceptions
  reason?: string;
  created_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExternalBooking {
  id: string;
  entity_platform_id: string;
  staff_member_id: string;
  external_booking_id: string;
  source_service: string;
  booking_date: string; // YYYY-MM-DD format
  booking_time: string; // HH:MM format
  booking_end_time: string; // HH:MM format
  duration_minutes: number;
  status: 'active' | 'cancelled' | 'completed' | 'no_show';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Extended types for UI components
export interface StaffMemberWithSchedule extends StaffMember {
  weekly_schedules: WeeklySchedule[];
  schedule_exceptions: ScheduleException[];
  external_bookings: ExternalBooking[];
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD format
  day_of_week: number;
  staff_schedules: StaffScheduleForDay[];
}

export interface StaffScheduleForDay {
  staff_member: StaffMember;
  regular_schedule?: WeeklySchedule;
  exceptions: ScheduleException[];
  bookings: ExternalBooking[];
  available_slots: TimeSlot[];
  total_hours: number;
}

export interface TimeSlot {
  start_time: string; // HH:MM format
  end_time: string;   // HH:MM format
  duration_minutes: number;
  is_available: boolean;
  booking?: ExternalBooking;
}

// Request/Response types for API
export interface CreateStaffMemberRequest {
  full_name: string;
  email?: string;
  phone?: string;
  role_type: string;
  job_title?: string;
  slot_duration_minutes?: number;
  can_take_appointments?: boolean;
  hire_date?: string;
  employee_id?: string;
}

export interface UpdateStaffMemberRequest extends Partial<CreateStaffMemberRequest> {
  is_active?: boolean;
}

export interface CreateWeeklyScheduleRequest {
  staff_member_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  effective_from: string;
  effective_until?: string;
  is_available?: boolean;
}

export interface CreateScheduleExceptionRequest {
  staff_member_id: string;
  exception_date: string;
  exception_type: ScheduleException['exception_type'];
  start_time?: string;
  end_time?: string;
  reason?: string;
}

export interface CreateExternalBookingRequest {
  staff_member_id: string;
  external_booking_id: string;
  source_service: string;
  booking_date: string;
  booking_time: string;
  booking_end_time: string;
  duration_minutes: number;
  metadata?: Record<string, any>;
}

// Filter and query types
export interface RosteringFilters {
  staff_member_ids?: string[];
  role_types?: string[];
  date_from?: string;
  date_to?: string;
  include_inactive?: boolean;
}

export interface WeeklyRosterQuery {
  week_start_date: string; // Monday of the week
  staff_member_ids?: string[];
  role_types?: string[];
}

// UI state types
export interface RosteringState {
  staff_members: StaffMember[];
  weekly_schedules: WeeklySchedule[];
  schedule_exceptions: ScheduleException[];
  external_bookings: ExternalBooking[];
  loading: boolean;
  error: string | null;
}

export interface RosteringMetrics {
  total_staff: number;
  active_staff: number;
  shifts_this_week: number;
  total_hours_this_week: number;
  coverage_rate: number;
  pending_requests: number;
}

// Constants
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const ROLE_TYPES = [
  'veterinarian',
  'veterinary_technician',
  'veterinary_assistant', 
  'receptionist',
  'practice_manager',
  'kennel_attendant',
  'groomer',
  'other'
] as const;

export const EXCEPTION_TYPES = [
  'holiday',
  'sick_leave', 
  'vacation',
  'special_hours',
  'unavailable'
] as const;

export type RoleType = typeof ROLE_TYPES[number];
export type ExceptionType = typeof EXCEPTION_TYPES[number];