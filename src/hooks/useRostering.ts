import { useState, useEffect, useCallback } from 'react';
import { rosteringService } from '@/services/RosteringService';
import type {
  StaffMember,
  WeeklySchedule,
  ScheduleException,
  ExternalBooking,
  DaySchedule,
  RosteringMetrics,
  RosteringFilters,
  WeeklyRosterQuery,
  CreateStaffMemberRequest,
  UpdateStaffMemberRequest,
  CreateWeeklyScheduleRequest,
  CreateScheduleExceptionRequest
} from '@/types/rostering';

export interface UseRosteringState {
  // Data
  staffMembers: StaffMember[];
  weeklyRoster: DaySchedule[];
  metrics: RosteringMetrics | null;
  
  // Loading states
  loading: boolean;
  loadingStaff: boolean;
  loadingRoster: boolean;
  loadingMetrics: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  refreshStaffMembers: () => Promise<void>;
  refreshWeeklyRoster: (query: WeeklyRosterQuery) => Promise<void>;
  refreshMetrics: (weekStartDate?: string) => Promise<void>;
  
  // Staff management
  createStaffMember: (request: CreateStaffMemberRequest) => Promise<StaffMember>;
  updateStaffMember: (id: string, request: UpdateStaffMemberRequest) => Promise<StaffMember>;
  deactivateStaffMember: (id: string) => Promise<void>;
  
  // Schedule management
  upsertWeeklySchedule: (request: CreateWeeklyScheduleRequest) => Promise<WeeklySchedule>;
  deleteWeeklySchedule: (scheduleId: string) => Promise<void>;
  
  // Exception management
  createScheduleException: (request: CreateScheduleExceptionRequest) => Promise<ScheduleException>;
  deleteScheduleException: (exceptionId: string) => Promise<void>;
}

export function useRostering(initialFilters?: RosteringFilters): UseRosteringState {
  // State
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [weeklyRoster, setWeeklyRoster] = useState<DaySchedule[]>([]);
  const [metrics, setMetrics] = useState<RosteringMetrics | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Helper to handle async operations
  const handleAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    setLoadingFn: (loading: boolean) => void
  ): Promise<T> => {
    try {
      setError(null);
      setLoadingFn(true);
      return await operation();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('[useRostering] Error:', err);
      throw err;
    } finally {
      setLoadingFn(false);
    }
  }, []);

  // ==================== DATA FETCHING ====================

  const refreshStaffMembers = useCallback(async () => {
    await handleAsync(async () => {
      const staff = await rosteringService.getStaffMembers(initialFilters);
      setStaffMembers(staff);
    }, setLoadingStaff);
  }, [initialFilters, handleAsync]);

  const refreshWeeklyRoster = useCallback(async (query: WeeklyRosterQuery) => {
    await handleAsync(async () => {
      const roster = await rosteringService.getWeeklyRoster(query);
      setWeeklyRoster(roster);
    }, setLoadingRoster);
  }, [handleAsync]);

  const refreshMetrics = useCallback(async (weekStartDate?: string) => {
    await handleAsync(async () => {
      const metricsData = await rosteringService.getRosteringMetrics(weekStartDate);
      setMetrics(metricsData);
    }, setLoadingMetrics);
  }, [handleAsync]);

  // ==================== STAFF MANAGEMENT ====================

  const createStaffMember = useCallback(async (request: CreateStaffMemberRequest): Promise<StaffMember> => {
    return handleAsync(async () => {
      const newStaff = await rosteringService.createStaffMember(request);
      
      // Refresh staff list to include new member
      await refreshStaffMembers();
      
      return newStaff;
    }, setLoading);
  }, [handleAsync, refreshStaffMembers]);

  const updateStaffMember = useCallback(async (id: string, request: UpdateStaffMemberRequest): Promise<StaffMember> => {
    return handleAsync(async () => {
      const updatedStaff = await rosteringService.updateStaffMember(id, request);
      
      // Update local state
      setStaffMembers(prev => prev.map(staff => 
        staff.id === id ? updatedStaff : staff
      ));
      
      return updatedStaff;
    }, setLoading);
  }, [handleAsync]);

  const deactivateStaffMember = useCallback(async (id: string): Promise<void> => {
    return handleAsync(async () => {
      await rosteringService.deactivateStaffMember(id);
      
      // Remove from local state or mark as inactive
      setStaffMembers(prev => prev.map(staff => 
        staff.id === id ? { ...staff, is_active: false } : staff
      ));
    }, setLoading);
  }, [handleAsync]);

  // ==================== SCHEDULE MANAGEMENT ====================

  const upsertWeeklySchedule = useCallback(async (request: CreateWeeklyScheduleRequest): Promise<WeeklySchedule> => {
    return handleAsync(async () => {
      const schedule = await rosteringService.upsertWeeklySchedule(request);
      
      // Refresh current roster view if it includes this staff member
      if (weeklyRoster.length > 0) {
        const currentWeekStart = weeklyRoster[0]?.date;
        if (currentWeekStart) {
          const mondayDate = getMondayOfWeek(new Date(currentWeekStart));
          await refreshWeeklyRoster({ week_start_date: mondayDate.toISOString().split('T')[0] });
        }
      }
      
      return schedule;
    }, setLoading);
  }, [handleAsync, weeklyRoster, refreshWeeklyRoster]);

  const deleteWeeklySchedule = useCallback(async (scheduleId: string): Promise<void> => {
    return handleAsync(async () => {
      await rosteringService.deleteWeeklySchedule(scheduleId);
      
      // Refresh current roster view
      if (weeklyRoster.length > 0) {
        const currentWeekStart = weeklyRoster[0]?.date;
        if (currentWeekStart) {
          const mondayDate = getMondayOfWeek(new Date(currentWeekStart));
          await refreshWeeklyRoster({ week_start_date: mondayDate.toISOString().split('T')[0] });
        }
      }
    }, setLoading);
  }, [handleAsync, weeklyRoster, refreshWeeklyRoster]);

  // ==================== EXCEPTION MANAGEMENT ====================

  const createScheduleException = useCallback(async (request: CreateScheduleExceptionRequest): Promise<ScheduleException> => {
    return handleAsync(async () => {
      const exception = await rosteringService.createScheduleException(request);
      
      // Refresh current roster view if the exception affects the displayed week
      if (weeklyRoster.length > 0) {
        const exceptionDate = new Date(request.exception_date);
        const currentWeekStart = new Date(weeklyRoster[0]?.date);
        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
        
        if (exceptionDate >= currentWeekStart && exceptionDate <= currentWeekEnd) {
          const mondayDate = getMondayOfWeek(currentWeekStart);
          await refreshWeeklyRoster({ week_start_date: mondayDate.toISOString().split('T')[0] });
        }
      }
      
      return exception;
    }, setLoading);
  }, [handleAsync, weeklyRoster, refreshWeeklyRoster]);

  const deleteScheduleException = useCallback(async (exceptionId: string): Promise<void> => {
    return handleAsync(async () => {
      await rosteringService.deleteScheduleException(exceptionId);
      
      // Refresh current roster view
      if (weeklyRoster.length > 0) {
        const currentWeekStart = weeklyRoster[0]?.date;
        if (currentWeekStart) {
          const mondayDate = getMondayOfWeek(new Date(currentWeekStart));
          await refreshWeeklyRoster({ week_start_date: mondayDate.toISOString().split('T')[0] });
        }
      }
    }, setLoading);
  }, [handleAsync, weeklyRoster, refreshWeeklyRoster]);

  // ==================== EFFECTS ====================

  // Initial load
  useEffect(() => {
    refreshStaffMembers();
    refreshMetrics();
  }, [refreshStaffMembers, refreshMetrics]);

  // Update loading state
  useEffect(() => {
    setLoading(loadingStaff || loadingRoster || loadingMetrics);
  }, [loadingStaff, loadingRoster, loadingMetrics]);

  return {
    // Data
    staffMembers,
    weeklyRoster,
    metrics,
    
    // Loading states
    loading,
    loadingStaff,
    loadingRoster,
    loadingMetrics,
    
    // Error state
    error,
    
    // Actions
    refreshStaffMembers,
    refreshWeeklyRoster,
    refreshMetrics,
    
    // Staff management
    createStaffMember,
    updateStaffMember,
    deactivateStaffMember,
    
    // Schedule management
    upsertWeeklySchedule,
    deleteWeeklySchedule,
    
    // Exception management
    createScheduleException,
    deleteScheduleException
  };
}

// ==================== UTILITY FUNCTIONS ====================

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(d.setDate(diff));
}

// ==================== SPECIALIZED HOOKS ====================

/**
 * Hook for managing weekly roster view with automatic date navigation
 */
export function useWeeklyRoster(initialWeekStart?: Date) {
  const [selectedWeek, setSelectedWeek] = useState(initialWeekStart || getMondayOfWeek(new Date()));
  const rostering = useRostering();

  // Load roster for selected week
  useEffect(() => {
    const weekStartString = selectedWeek.toISOString().split('T')[0];
    rostering.refreshWeeklyRoster({ week_start_date: weekStartString });
    rostering.refreshMetrics(weekStartString);
  }, [selectedWeek, rostering.refreshWeeklyRoster, rostering.refreshMetrics]);

  const navigateToPreviousWeek = useCallback(() => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
  }, [selectedWeek]);

  const navigateToNextWeek = useCallback(() => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
  }, [selectedWeek]);

  const navigateToCurrentWeek = useCallback(() => {
    setSelectedWeek(getMondayOfWeek(new Date()));
  }, []);

  const navigateToWeek = useCallback((date: Date) => {
    setSelectedWeek(getMondayOfWeek(date));
  }, []);

  return {
    ...rostering,
    selectedWeek,
    navigateToPreviousWeek,
    navigateToNextWeek,
    navigateToCurrentWeek,
    navigateToWeek
  };
}

/**
 * Hook for managing staff member details and schedules
 */
export function useStaffMemberDetail(staffMemberId: string) {
  const [staffMemberWithSchedule, setStaffMemberWithSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStaffMember = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await rosteringService.getStaffMemberWithSchedule(staffMemberId);
      setStaffMemberWithSchedule(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load staff member';
      setError(errorMessage);
      console.error('[useStaffMemberDetail] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [staffMemberId]);

  useEffect(() => {
    if (staffMemberId) {
      refreshStaffMember();
    }
  }, [staffMemberId, refreshStaffMember]);

  return {
    staffMember: staffMemberWithSchedule,
    loading,
    error,
    refresh: refreshStaffMember
  };
}