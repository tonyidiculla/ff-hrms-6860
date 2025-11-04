import { supabase } from '@/lib/supabase';
import type {
  RosteringEntry,
  RosteringEntryType,
  EntryStatus,
  CreateRosteringEntryRequest,
  UpdateRosteringEntryRequest,
  RosteringQuery,
  StaffScheduleForDay,
  WeeklyRosterView,
  RosteringMetrics,
  ScheduleConflict,
  AvailableTimeSlot,
  StaffProfileEntry,
  WeeklyPatternEntry,
  ExternalBookingEntry
} from '@/types/unified-rostering';

/**
 * Unified Rostering Service - Single Table Approach
 * Manages all rostering functionality through one flexible table
 */
export class UnifiedRosteringService {
  
  // ==================== CORE CRUD OPERATIONS ====================
  
  /**
   * Create a new rostering entry
   */
  async createEntry(request: CreateRosteringEntryRequest): Promise<RosteringEntry> {
    try {
      const { data, error } = await supabase
        .from('rostering_entries')
        .insert({
          ...request,
          status: request.status || 'active',
          priority: request.priority || 0,
          metadata: request.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[UnifiedRosteringService] createEntry error:', error);
      throw error;
    }
  }

  /**
   * Update an existing rostering entry
   */
  async updateEntry(id: string, request: UpdateRosteringEntryRequest): Promise<RosteringEntry> {
    try {
      const { data, error } = await supabase
        .from('rostering_entries')
        .update({
          ...request,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[UnifiedRosteringService] updateEntry error:', error);
      throw error;
    }
  }

  /**
   * Delete a rostering entry (soft delete by marking inactive)
   */
  async deleteEntry(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('rostering_entries')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('[UnifiedRosteringService] deleteEntry error:', error);
      throw error;
    }
  }

  /**
   * Get rostering entries with flexible filtering
   */
  async getEntries(query: RosteringQuery = {}): Promise<RosteringEntry[]> {
    try {
      let dbQuery = supabase
        .from('rostering_entries')
        .select('*');

      // Apply filters
      if (query.staff_ids && query.staff_ids.length > 0) {
        dbQuery = dbQuery.in('staff_id', query.staff_ids);
      }

      if (query.entry_types && query.entry_types.length > 0) {
        dbQuery = dbQuery.in('entry_type', query.entry_types);
      }

      if (query.date_from) {
        dbQuery = dbQuery.gte('effective_date', query.date_from);
      }

      if (query.date_to) {
        dbQuery = dbQuery.lte('effective_date', query.date_to);
      }

      if (query.day_of_week !== undefined) {
        dbQuery = dbQuery.eq('day_of_week', query.day_of_week);
      }

      if (query.status && query.status.length > 0) {
        dbQuery = dbQuery.in('status', query.status);
      } else {
        // Default to active entries only
        dbQuery = dbQuery.eq('status', 'active');
      }

      if (!query.include_expired) {
        dbQuery = dbQuery.or('expiry_date.is.null,expiry_date.gte.' + new Date().toISOString().split('T')[0]);
      }

      const { data, error } = await dbQuery.order('priority', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[UnifiedRosteringService] getEntries error:', error);
      throw error;
    }
  }

  // ==================== STAFF MANAGEMENT ====================

  /**
   * Get all staff profiles
   */
  async getStaffProfiles(): Promise<StaffProfileEntry[]> {
    const entries = await this.getEntries({
      entry_types: ['staff_profile']
    });
    return entries as StaffProfileEntry[];
  }

  /**
   * Create a new staff member
   */
  async createStaffMember(staffData: {
    staff_name: string;
    staff_email: string;
    role_type: string;
    [key: string]: any;
  }): Promise<StaffProfileEntry> {
    const entry = await this.createEntry({
      entry_type: 'staff_profile',
      staff_name: staffData.staff_name,
      staff_email: staffData.staff_email,
      metadata: {
        ...staffData,
        role_type: staffData.role_type
      }
    });
    return entry as StaffProfileEntry;
  }

  // ==================== SCHEDULE MANAGEMENT ====================

  /**
   * Create a weekly recurring pattern
   */
  async createWeeklyPattern(patternData: {
    staff_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    effective_date?: string;
    expiry_date?: string;
    metadata?: any;
  }): Promise<WeeklyPatternEntry> {
    const entry = await this.createEntry({
      entry_type: 'weekly_pattern',
      staff_id: patternData.staff_id,
      day_of_week: patternData.day_of_week,
      start_time: patternData.start_time,
      end_time: patternData.end_time,
      effective_date: patternData.effective_date,
      expiry_date: patternData.expiry_date,
      priority: 10, // Standard priority for weekly patterns
      metadata: patternData.metadata || {}
    });
    return entry as WeeklyPatternEntry;
  }

  /**
   * Create a date-specific schedule override
   */
  async createDateSpecificEntry(entryData: {
    staff_id: string;
    effective_date: string;
    start_time?: string;
    end_time?: string;
    metadata: any;
  }) {
    return this.createEntry({
      entry_type: 'date_specific',
      staff_id: entryData.staff_id,
      effective_date: entryData.effective_date,
      start_time: entryData.start_time,
      end_time: entryData.end_time,
      priority: 100, // High priority to override weekly patterns
      metadata: entryData.metadata
    });
  }

  /**
   * Add external booking (from HMS or other systems)
   */
  async addExternalBooking(bookingData: {
    staff_id: string;
    effective_date: string;
    start_time: string;
    end_time: string;
    external_id: string;
    source_system: string;
    metadata?: any;
  }): Promise<ExternalBookingEntry> {
    const entry = await this.createEntry({
      entry_type: 'external_booking',
      staff_id: bookingData.staff_id,
      effective_date: bookingData.effective_date,
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
      priority: 50, // Medium priority
      metadata: {
        external_id: bookingData.external_id,
        source_system: bookingData.source_system,
        ...bookingData.metadata
      }
    });
    return entry as ExternalBookingEntry;
  }

  // ==================== SCHEDULE COMPUTATION ====================

  /**
   * Get complete schedule for a staff member on a specific date
   */
  async getStaffScheduleForDate(staffId: string, date: string): Promise<StaffScheduleForDay> {
    try {
      const dayOfWeek = new Date(date).getDay();
      
      // Get all relevant entries for this staff member and date
      const entries = await this.getEntries({
        staff_ids: [staffId]
      });

      // Filter entries applicable to this date
      const applicableEntries = entries.filter(entry => {
        if (entry.entry_type === 'weekly_pattern') {
          return entry.day_of_week === dayOfWeek &&
                 (!entry.effective_date || entry.effective_date <= date) &&
                 (!entry.expiry_date || entry.expiry_date >= date);
        }
        if (entry.entry_type === 'date_specific' || entry.entry_type === 'external_booking') {
          return entry.effective_date === date;
        }
        return false;
      });

      // Sort by priority (highest first)
      applicableEntries.sort((a, b) => b.priority - a.priority);

      // Compute the actual schedule
      const computedSchedule = this.computeScheduleFromEntries(applicableEntries);

      // Get staff profile
      const staffProfiles = await this.getEntries({
        staff_ids: [staffId],
        entry_types: ['staff_profile']
      });
      const staffProfile = staffProfiles[0];

      return {
        staff_id: staffId,
        staff_name: staffProfile?.staff_name || 'Unknown',
        date,
        day_of_week: dayOfWeek,
        entries: applicableEntries,
        computed_schedule: computedSchedule
      };
    } catch (error) {
      console.error('[UnifiedRosteringService] getStaffScheduleForDate error:', error);
      throw error;
    }
  }

  /**
   * Get weekly roster view for multiple staff members
   */
  async getWeeklyRoster(weekStartDate: string, staffIds?: string[]): Promise<WeeklyRosterView> {
    try {
      console.log('[UnifiedRosteringService] getWeeklyRoster called:', { weekStartDate, staffIds });

      // Get all staff profiles
      const staffProfiles = await this.getStaffProfiles();
      const targetStaff = staffIds ? 
        staffProfiles.filter(s => staffIds.includes(s.staff_id!)) : 
        staffProfiles;

      console.log('[UnifiedRosteringService] Found staff profiles:', targetStaff.length);

      const weekStart = new Date(weekStartDate);
      const staffSchedules = [];

      for (const staff of targetStaff) {
        if (!staff.staff_id) continue;

        const dailySchedules: StaffScheduleForDay[] = [];
        
        for (let i = 0; i < 7; i++) {
          const currentDate = new Date(weekStart);
          currentDate.setDate(currentDate.getDate() + i);
          const dateString = currentDate.toISOString().split('T')[0];
          
          const daySchedule = await this.getStaffScheduleForDate(staff.staff_id, dateString);
          dailySchedules.push(daySchedule);
        }

        staffSchedules.push({
          staff_profile: staff,
          daily_schedules: dailySchedules
        });
      }

      // Compute summary statistics
      const totalHours = staffSchedules.reduce((sum, staff) => 
        sum + staff.daily_schedules.reduce((daySum, day) => 
          daySum + day.computed_schedule.total_hours, 0), 0);

      const totalAppointments = staffSchedules.reduce((sum, staff) =>
        sum + staff.daily_schedules.reduce((daySum, day) =>
          daySum + day.computed_schedule.appointments.length, 0), 0);

      return {
        week_start_date: weekStartDate,
        staff_schedules: staffSchedules,
        summary: {
          total_staff: targetStaff.length,
          total_hours: totalHours,
          total_appointments: totalAppointments,
          coverage_gaps: [] // TODO: Implement gap analysis
        }
      };
    } catch (error) {
      console.error('[UnifiedRosteringService] getWeeklyRoster error:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Compute actual schedule from conflicting entries
   */
  private computeScheduleFromEntries(entries: RosteringEntry[]) {
    const workPeriods: Array<{ start_time: string; end_time: string; type: string }> = [];
    const appointments: ExternalBookingEntry[] = [];
    let isAvailable = false;
    let totalHours = 0;
    const notes: string[] = [];

    // Process entries by priority
    for (const entry of entries) {
      if (entry.entry_type === 'weekly_pattern' && entry.start_time && entry.end_time) {
        workPeriods.push({
          start_time: entry.start_time,
          end_time: entry.end_time,
          type: 'regular'
        });
        isAvailable = true;
        totalHours += this.calculateHours(entry.start_time, entry.end_time);
      } else if (entry.entry_type === 'date_specific') {
        const metadata = entry.metadata as any;
        if (metadata.type === 'day_off') {
          isAvailable = false;
          totalHours = 0;
          workPeriods.length = 0; // Clear work periods
          notes.push(metadata.reason || 'Day off');
        } else if (entry.start_time && entry.end_time) {
          workPeriods.push({
            start_time: entry.start_time,
            end_time: entry.end_time,
            type: 'special'
          });
          isAvailable = true;
          totalHours += this.calculateHours(entry.start_time, entry.end_time);
        }
      } else if (entry.entry_type === 'external_booking') {
        appointments.push(entry as ExternalBookingEntry);
      }
    }

    return {
      is_available: isAvailable,
      work_periods: workPeriods,
      break_periods: [], // TODO: Extract from metadata
      appointments,
      total_hours: totalHours,
      notes
    };
  }

  /**
   * Calculate hours between two time strings
   */
  private calculateHours(startTime: string, endTime: string): number {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  /**
   * Get metrics for dashboard
   */
  async getRosteringMetrics(periodStart?: string, periodEnd?: string): Promise<RosteringMetrics> {
    try {
      const staffProfiles = await this.getStaffProfiles();
      const activeStaff = staffProfiles.filter(s => s.status === 'active');

      // For now, return basic metrics
      // TODO: Implement comprehensive metrics calculation
      return {
        period_start: periodStart || new Date().toISOString().split('T')[0],
        period_end: periodEnd || new Date().toISOString().split('T')[0],
        total_staff: staffProfiles.length,
        active_staff: activeStaff.length,
        total_scheduled_hours: 0,
        total_appointments: 0,
        coverage_rate: 0,
        overtime_hours: 0,
        time_off_requests: 0,
        schedule_conflicts: 0
      };
    } catch (error) {
      console.error('[UnifiedRosteringService] getRosteringMetrics error:', error);
      throw error;
    }
  }
}