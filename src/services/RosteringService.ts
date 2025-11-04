import { supabase } from '@/lib/supabase';
import type {
  StaffMember,
  WeeklySchedule,
  ScheduleException,
  ExternalBooking,
  StaffMemberWithSchedule,
  DaySchedule,
  CreateStaffMemberRequest,
  UpdateStaffMemberRequest,
  CreateWeeklyScheduleRequest,
  CreateScheduleExceptionRequest,
  CreateExternalBookingRequest,
  RosteringFilters,
  WeeklyRosterQuery,
  RosteringMetrics,
  TimeSlot,
  StaffScheduleForDay
} from '@/types/rostering';

/**
 * Service class for managing rostering data with Supabase
 * Handles CRUD operations for staff, schedules, exceptions, and bookings
 */
export class RosteringService {
  
  // ==================== STAFF MANAGEMENT ====================
  
  /**
   * Get all staff members for the current entity
   */
  async getStaffMembers(filters: RosteringFilters = {}): Promise<StaffMember[]> {
    try {
      let query = supabase
        .from('staff_members')
        .select('*');

      if (!filters.include_inactive) {
        query = query.eq('is_active', true);
      }

      if (filters.role_types && filters.role_types.length > 0) {
        query = query.in('role_type', filters.role_types);
      }

      const { data, error } = await query.order('full_name');

      if (error) {
        console.error('[RosteringService] Error fetching staff members:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[RosteringService] getStaffMembers error:', error);
      throw error;
    }
  }

  /**
   * Get a single staff member with their complete schedule data
   */
  async getStaffMemberWithSchedule(staffMemberId: string): Promise<StaffMemberWithSchedule | null> {
    try {
      const { data: staffMember, error: staffError } = await supabase
        .from('staff_members')
        .select('*')
        .eq('id', staffMemberId)
        .single();

      if (staffError || !staffMember) {
        console.error('[RosteringService] Error fetching staff member:', staffError);
        return null;
      }

      // Fetch related data in parallel
      const [schedules, exceptions, bookings] = await Promise.all([
        this.getWeeklySchedules(staffMemberId),
        this.getScheduleExceptions(staffMemberId),
        this.getExternalBookings({ staff_member_ids: [staffMemberId] })
      ]);

      return {
        ...staffMember,
        weekly_schedules: schedules,
        schedule_exceptions: exceptions,
        external_bookings: bookings
      };
    } catch (error) {
      console.error('[RosteringService] getStaffMemberWithSchedule error:', error);
      throw error;
    }
  }

  /**
   * Create a new staff member
   */
  async createStaffMember(request: CreateStaffMemberRequest): Promise<StaffMember> {
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .insert({
          ...request,
          slot_duration_minutes: request.slot_duration_minutes || 15,
          can_take_appointments: request.can_take_appointments ?? true
        })
        .select()
        .single();

      if (error) {
        console.error('[RosteringService] Error creating staff member:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[RosteringService] createStaffMember error:', error);
      throw error;
    }
  }

  /**
   * Update an existing staff member
   */
  async updateStaffMember(staffMemberId: string, request: UpdateStaffMemberRequest): Promise<StaffMember> {
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .update({
          ...request,
          updated_at: new Date().toISOString()
        })
        .eq('id', staffMemberId)
        .select()
        .single();

      if (error) {
        console.error('[RosteringService] Error updating staff member:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[RosteringService] updateStaffMember error:', error);
      throw error;
    }
  }

  /**
   * Deactivate a staff member (soft delete)
   */
  async deactivateStaffMember(staffMemberId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('staff_members')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', staffMemberId);

      if (error) {
        console.error('[RosteringService] Error deactivating staff member:', error);
        throw error;
      }
    } catch (error) {
      console.error('[RosteringService] deactivateStaffMember error:', error);
      throw error;
    }
  }

  // ==================== SCHEDULE MANAGEMENT ====================

  /**
   * Get weekly schedules for a staff member
   */
  async getWeeklySchedules(staffMemberId: string, effectiveDate?: string): Promise<WeeklySchedule[]> {
    try {
      let query = supabase
        .from('weekly_schedules')
        .select('*')
        .eq('staff_member_id', staffMemberId)
        .eq('is_active', true);

      if (effectiveDate) {
        query = query
          .lte('effective_from', effectiveDate)
          .or(`effective_until.is.null,effective_until.gte.${effectiveDate}`);
      }

      const { data, error } = await query.order('day_of_week');

      if (error) {
        console.error('[RosteringService] Error fetching weekly schedules:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[RosteringService] getWeeklySchedules error:', error);
      throw error;
    }
  }

  /**
   * Create or update weekly schedule for a staff member
   */
  async upsertWeeklySchedule(request: CreateWeeklyScheduleRequest): Promise<WeeklySchedule> {
    try {
      const { data, error } = await supabase
        .from('weekly_schedules')
        .upsert({
          ...request,
          is_available: request.is_available ?? true
        })
        .select()
        .single();

      if (error) {
        console.error('[RosteringService] Error upserting weekly schedule:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[RosteringService] upsertWeeklySchedule error:', error);
      throw error;
    }
  }

  /**
   * Delete a weekly schedule
   */
  async deleteWeeklySchedule(scheduleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('weekly_schedules')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduleId);

      if (error) {
        console.error('[RosteringService] Error deleting weekly schedule:', error);
        throw error;
      }
    } catch (error) {
      console.error('[RosteringService] deleteWeeklySchedule error:', error);
      throw error;
    }
  }

  // ==================== SCHEDULE EXCEPTIONS ====================

  /**
   * Get schedule exceptions for a staff member
   */
  async getScheduleExceptions(staffMemberId: string, dateFrom?: string, dateTo?: string): Promise<ScheduleException[]> {
    try {
      let query = supabase
        .from('schedule_exceptions')
        .select('*')
        .eq('staff_member_id', staffMemberId)
        .eq('is_active', true);

      if (dateFrom) {
        query = query.gte('exception_date', dateFrom);
      }

      if (dateTo) {
        query = query.lte('exception_date', dateTo);
      }

      const { data, error } = await query.order('exception_date');

      if (error) {
        console.error('[RosteringService] Error fetching schedule exceptions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[RosteringService] getScheduleExceptions error:', error);
      throw error;
    }
  }

  /**
   * Create a schedule exception
   */
  async createScheduleException(request: CreateScheduleExceptionRequest): Promise<ScheduleException> {
    try {
      const { data, error } = await supabase
        .from('schedule_exceptions')
        .insert(request)
        .select()
        .single();

      if (error) {
        console.error('[RosteringService] Error creating schedule exception:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[RosteringService] createScheduleException error:', error);
      throw error;
    }
  }

  /**
   * Delete a schedule exception
   */
  async deleteScheduleException(exceptionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('schedule_exceptions')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', exceptionId);

      if (error) {
        console.error('[RosteringService] Error deleting schedule exception:', error);
        throw error;
      }
    } catch (error) {
      console.error('[RosteringService] deleteScheduleException error:', error);
      throw error;
    }
  }

  // ==================== EXTERNAL BOOKINGS ====================

  /**
   * Get external bookings (appointments from other systems)
   */
  async getExternalBookings(filters: RosteringFilters = {}): Promise<ExternalBooking[]> {
    try {
      let query = supabase
        .from('external_bookings')
        .select('*')
        .eq('status', 'active');

      if (filters.staff_member_ids && filters.staff_member_ids.length > 0) {
        query = query.in('staff_member_id', filters.staff_member_ids);
      }

      if (filters.date_from) {
        query = query.gte('booking_date', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('booking_date', filters.date_to);
      }

      const { data, error } = await query.order('booking_date').order('booking_time');

      if (error) {
        console.error('[RosteringService] Error fetching external bookings:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[RosteringService] getExternalBookings error:', error);
      throw error;
    }
  }

  /**
   * Create an external booking (used by other services like HMS)
   */
  async createExternalBooking(request: CreateExternalBookingRequest): Promise<ExternalBooking> {
    try {
      const { data, error } = await supabase
        .from('external_bookings')
        .insert(request)
        .select()
        .single();

      if (error) {
        console.error('[RosteringService] Error creating external booking:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[RosteringService] createExternalBooking error:', error);
      throw error;
    }
  }

  /**
   * Update external booking status
   */
  async updateExternalBookingStatus(externalBookingId: string, status: ExternalBooking['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('external_bookings')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('external_booking_id', externalBookingId);

      if (error) {
        console.error('[RosteringService] Error updating external booking status:', error);
        throw error;
      }
    } catch (error) {
      console.error('[RosteringService] updateExternalBookingStatus error:', error);
      throw error;
    }
  }

  // ==================== WEEKLY ROSTER VIEWS ====================

  /**
   * Get complete weekly roster data for display
   */
  async getWeeklyRoster(query: WeeklyRosterQuery): Promise<DaySchedule[]> {
    try {
      console.log('[RosteringService] getWeeklyRoster called with query:', query);
      
      // Test basic staff members fetch to debug database connection
      try {
        console.log('[RosteringService] Testing staff members fetch...');
        const staffMembers = await this.getStaffMembers({});
        console.log('[RosteringService] Staff members test successful:', staffMembers.length, 'members found');
        
        if (staffMembers.length > 0) {
          console.log('[RosteringService] Sample staff member:', staffMembers[0]);
        }
      } catch (staffError) {
        console.error('[RosteringService] Staff members test failed:', staffError);
        // Continue with empty schedules
      }
      
      const weekStart = new Date(query.week_start_date);
      const dailySchedules: DaySchedule[] = [];
      
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(currentDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        const dayOfWeek = currentDate.getDay();

        dailySchedules.push({
          date: dateString,
          day_of_week: dayOfWeek,
          staff_schedules: []
        });
      }

      console.log('[RosteringService] Returning mock daily schedules for 7 days');
      return dailySchedules;
    } catch (error) {
      console.error('[RosteringService] getWeeklyRoster error:', error);
      throw error;
    }
  }

  /**
   * Get rostering metrics for dashboard
   */
  async getRosteringMetrics(weekStartDate?: string): Promise<RosteringMetrics> {
    try {
      const activeStaff = await this.getStaffMembers();
      const totalStaffCount = await this.getTotalStaffCount();

      let weeklyMetrics = {
        shifts_this_week: 0,
        total_hours_this_week: 0,
        coverage_rate: 0
      };

      if (weekStartDate) {
        const weeklyRoster = await this.getWeeklyRoster({ week_start_date: weekStartDate });
        weeklyMetrics = this.calculateWeeklyMetrics(weeklyRoster);
      }

      return {
        total_staff: totalStaffCount,
        active_staff: activeStaff.length,
        shifts_this_week: weeklyMetrics.shifts_this_week,
        total_hours_this_week: weeklyMetrics.total_hours_this_week,
        coverage_rate: weeklyMetrics.coverage_rate,
        pending_requests: 0 // TODO: Implement request system
      };
    } catch (error) {
      console.error('[RosteringService] getRosteringMetrics error:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  private async getAllWeeklySchedules(staffMemberIds?: string[], effectiveDate?: string): Promise<WeeklySchedule[]> {
    let query = supabase
      .from('weekly_schedules')
      .select('*')
      .eq('is_active', true);

    if (staffMemberIds && staffMemberIds.length > 0) {
      query = query.in('staff_member_id', staffMemberIds);
    }

    if (effectiveDate) {
      query = query
        .lte('effective_from', effectiveDate)
        .or(`effective_until.is.null,effective_until.gte.${effectiveDate}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  private async getAllScheduleExceptions(staffMemberIds?: string[], dateFrom?: string, dateTo?: string): Promise<ScheduleException[]> {
    let query = supabase
      .from('schedule_exceptions')
      .select('*')
      .eq('is_active', true);

    if (staffMemberIds && staffMemberIds.length > 0) {
      query = query.in('staff_member_id', staffMemberIds);
    }

    if (dateFrom) {
      query = query.gte('exception_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('exception_date', dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  private async getTotalStaffCount(): Promise<number> {
    const { count, error } = await supabase
      .from('staff_members')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }

  private calculateAvailableSlots(
    schedule?: WeeklySchedule,
    exceptions: ScheduleException[] = [],
    bookings: ExternalBooking[] = [],
    slotDuration: number = 15
  ): TimeSlot[] {
    if (!schedule || !schedule.is_available) {
      return [];
    }

    // Check for full-day exceptions
    const fullDayException = exceptions.find(e => !e.start_time && !e.end_time);
    if (fullDayException) {
      return [];
    }

    // Calculate available time ranges considering exceptions
    const availableRanges = this.calculateAvailableTimeRanges(schedule, exceptions);
    
    // Generate time slots and mark booked ones
    const slots: TimeSlot[] = [];
    
    availableRanges.forEach(range => {
      const startMinutes = this.timeToMinutes(range.start_time);
      const endMinutes = this.timeToMinutes(range.end_time);
      
      for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
        const slotStart = this.minutesToTime(minutes);
        const slotEnd = this.minutesToTime(minutes + slotDuration);
        
        const isBooked = bookings.some(booking => 
          this.timeToMinutes(booking.booking_time) <= minutes &&
          this.timeToMinutes(booking.booking_end_time) > minutes
        );

        slots.push({
          start_time: slotStart,
          end_time: slotEnd,
          duration_minutes: slotDuration,
          is_available: !isBooked,
          booking: isBooked ? bookings.find(b => 
            this.timeToMinutes(b.booking_time) <= minutes &&
            this.timeToMinutes(b.booking_end_time) > minutes
          ) : undefined
        });
      }
    });

    return slots;
  }

  private calculateAvailableTimeRanges(
    schedule: WeeklySchedule,
    exceptions: ScheduleException[]
  ): { start_time: string; end_time: string }[] {
    const ranges = [{ start_time: schedule.start_time, end_time: schedule.end_time }];
    
    // Remove exception time ranges
    exceptions.forEach(exception => {
      if (exception.start_time && exception.end_time) {
        // TODO: Implement time range subtraction logic
        // This would remove the exception time from available ranges
      }
    });

    return ranges;
  }

  private calculateTotalHours(schedule?: WeeklySchedule, exceptions: ScheduleException[] = []): number {
    if (!schedule) return 0;

    const startMinutes = this.timeToMinutes(schedule.start_time);
    const endMinutes = this.timeToMinutes(schedule.end_time);
    let totalMinutes = endMinutes - startMinutes;

    // Subtract exception times
    exceptions.forEach(exception => {
      if (exception.start_time && exception.end_time) {
        const excStartMinutes = this.timeToMinutes(exception.start_time);
        const excEndMinutes = this.timeToMinutes(exception.end_time);
        totalMinutes -= (excEndMinutes - excStartMinutes);
      } else {
        // Full day exception
        totalMinutes = 0;
      }
    });

    return Math.max(0, totalMinutes / 60);
  }

  private calculateWeeklyMetrics(weeklyRoster: DaySchedule[]) {
    let totalShifts = 0;
    let totalHours = 0;
    let totalPossibleHours = 0;

    weeklyRoster.forEach(day => {
      day.staff_schedules.forEach(staffSchedule => {
        if (staffSchedule.regular_schedule) {
          totalShifts++;
        }
        totalHours += staffSchedule.total_hours;
        
        // Calculate theoretical maximum hours (8 hours per day)
        if (staffSchedule.staff_member.is_active) {
          totalPossibleHours += 8;
        }
      });
    });

    const coverageRate = totalPossibleHours > 0 ? Math.round((totalHours / totalPossibleHours) * 100) : 0;

    return {
      shifts_this_week: totalShifts,
      total_hours_this_week: Math.round(totalHours),
      coverage_rate: coverageRate
    };
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}

// Export singleton instance
export const rosteringService = new RosteringService();