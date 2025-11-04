import { useState, useCallback, useEffect } from 'react';
import { UnifiedRosteringService } from '@/services/UnifiedRosteringService';
import type {
  RosteringEntry,
  StaffProfileEntry,
  WeeklyRosterView,
  RosteringMetrics,
  CreateRosteringEntryRequest,
  UpdateRosteringEntryRequest,
  RosteringQuery
} from '@/types/unified-rostering';

// Singleton service instance
const unifiedRosteringService = new UnifiedRosteringService();

/**
 * Unified Rostering Hook - Single table approach
 */
export function useUnifiedRostering() {
  const [entries, setEntries] = useState<RosteringEntry[]>([]);
  const [staffProfiles, setStaffProfiles] = useState<StaffProfileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsync = useCallback(async (
    operation: () => Promise<void>,
    setLoadingFn: (loading: boolean) => void
  ) => {
    try {
      setError(null);
      setLoadingFn(true);
      await operation();
    } catch (err: any) {
      console.error('[useUnifiedRostering] Operation failed:', err);
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoadingFn(false);
    }
  }, []);

  // ==================== DATA FETCHING ====================

  const refreshStaffProfiles = useCallback(async () => {
    await handleAsync(async () => {
      const profiles = await unifiedRosteringService.getStaffProfiles();
      setStaffProfiles(profiles);
    }, setLoading);
  }, [handleAsync]);

  const refreshEntries = useCallback(async (query?: RosteringQuery) => {
    await handleAsync(async () => {
      const fetchedEntries = await unifiedRosteringService.getEntries(query);
      setEntries(fetchedEntries);
    }, setLoading);
  }, [handleAsync]);

  // ==================== CRUD OPERATIONS ====================

  const createEntry = useCallback(async (request: CreateRosteringEntryRequest) => {
    await handleAsync(async () => {
      const newEntry = await unifiedRosteringService.createEntry(request);
      setEntries(prev => [...prev, newEntry]);
      
      // If it's a staff profile, update staff profiles list
      if (request.entry_type === 'staff_profile') {
        await refreshStaffProfiles();
      }
    }, setLoading);
  }, [handleAsync, refreshStaffProfiles]);

  const updateEntry = useCallback(async (id: string, request: UpdateRosteringEntryRequest) => {
    await handleAsync(async () => {
      const updatedEntry = await unifiedRosteringService.updateEntry(id, request);
      setEntries(prev => prev.map(entry => entry.id === id ? updatedEntry : entry));
      
      // If it's a staff profile, refresh profiles list
      const existingEntry = entries.find(e => e.id === id);
      if (existingEntry?.entry_type === 'staff_profile') {
        await refreshStaffProfiles();
      }
    }, setLoading);
  }, [handleAsync, entries, refreshStaffProfiles]);

  const deleteEntry = useCallback(async (id: string) => {
    await handleAsync(async () => {
      await unifiedRosteringService.deleteEntry(id);
      setEntries(prev => prev.filter(entry => entry.id !== id));
      
      // If it's a staff profile, refresh profiles list
      const existingEntry = entries.find(e => e.id === id);
      if (existingEntry?.entry_type === 'staff_profile') {
        await refreshStaffProfiles();
      }
    }, setLoading);
  }, [handleAsync, entries, refreshStaffProfiles]);

  // ==================== STAFF OPERATIONS ====================

  const createStaffMember = useCallback(async (staffData: {
    staff_name: string;
    staff_email: string;
    role_type: string;
    [key: string]: any;
  }) => {
    await handleAsync(async () => {
      await unifiedRosteringService.createStaffMember(staffData);
      await refreshStaffProfiles();
    }, setLoading);
  }, [handleAsync, refreshStaffProfiles]);

  // ==================== SCHEDULE OPERATIONS ====================

  const createWeeklyPattern = useCallback(async (patternData: {
    staff_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    effective_date?: string;
    expiry_date?: string;
    metadata?: any;
  }) => {
    await handleAsync(async () => {
      await unifiedRosteringService.createWeeklyPattern(patternData);
      await refreshEntries();
    }, setLoading);
  }, [handleAsync, refreshEntries]);

  const createDateSpecific = useCallback(async (entryData: {
    staff_id: string;
    effective_date: string;
    start_time?: string;
    end_time?: string;
    metadata: any;
  }) => {
    await handleAsync(async () => {
      await unifiedRosteringService.createDateSpecificEntry(entryData);
      await refreshEntries();
    }, setLoading);
  }, [handleAsync, refreshEntries]);

  const addExternalBooking = useCallback(async (bookingData: {
    staff_id: string;
    effective_date: string;
    start_time: string;
    end_time: string;
    external_id: string;
    source_system: string;
    metadata?: any;
  }) => {
    await handleAsync(async () => {
      await unifiedRosteringService.addExternalBooking(bookingData);
      await refreshEntries();
    }, setLoading);
  }, [handleAsync, refreshEntries]);

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    refreshStaffProfiles();
  }, [refreshStaffProfiles]);

  return {
    // State
    entries,
    staffProfiles,
    loading,
    error,
    
    // Data operations
    refreshEntries,
    refreshStaffProfiles,
    
    // CRUD operations
    createEntry,
    updateEntry,
    deleteEntry,
    
    // Specialized operations
    createStaffMember,
    createWeeklyPattern,
    createDateSpecific,
    addExternalBooking,
    
    // Service instance for advanced operations
    service: unifiedRosteringService
  };
}

/**
 * Hook for weekly roster management
 */
export function useWeeklyRosterView() {
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday;
  });

  const [weeklyRoster, setWeeklyRoster] = useState<WeeklyRosterView | null>(null);
  const [metrics, setMetrics] = useState<RosteringMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsync = useCallback(async (
    operation: () => Promise<void>,
    setLoadingFn: (loading: boolean) => void
  ) => {
    try {
      setError(null);
      setLoadingFn(true);
      await operation();
    } catch (err: any) {
      console.error('[useWeeklyRosterView] Operation failed:', err);
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoadingFn(false);
    }
  }, []);

  const refreshWeeklyRoster = useCallback(async (staffIds?: string[]) => {
    await handleAsync(async () => {
      const weekStartString = selectedWeek.toISOString().split('T')[0];
      const roster = await unifiedRosteringService.getWeeklyRoster(weekStartString, staffIds);
      setWeeklyRoster(roster);
    }, setLoading);
  }, [selectedWeek, handleAsync]);

  const refreshMetrics = useCallback(async () => {
    await handleAsync(async () => {
      const weekStartString = selectedWeek.toISOString().split('T')[0];
      const weekEndDate = new Date(selectedWeek);
      weekEndDate.setDate(weekEndDate.getDate() + 6);
      const weekEndString = weekEndDate.toISOString().split('T')[0];
      
      const metricsData = await unifiedRosteringService.getRosteringMetrics(weekStartString, weekEndString);
      setMetrics(metricsData);
    }, setLoading);
  }, [selectedWeek, handleAsync]);

  // Week navigation
  const navigateToPreviousWeek = useCallback(() => {
    setSelectedWeek(prev => {
      const newWeek = new Date(prev);
      newWeek.setDate(newWeek.getDate() - 7);
      return newWeek;
    });
  }, []);

  const navigateToNextWeek = useCallback(() => {
    setSelectedWeek(prev => {
      const newWeek = new Date(prev);
      newWeek.setDate(newWeek.getDate() + 7);
      return newWeek;
    });
  }, []);

  const navigateToCurrentWeek = useCallback(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    setSelectedWeek(monday);
  }, []);

  // Auto-refresh when week changes
  useEffect(() => {
    refreshWeeklyRoster();
    refreshMetrics();
  }, [selectedWeek, refreshWeeklyRoster, refreshMetrics]);

  return {
    // State
    selectedWeek,
    weeklyRoster,
    metrics,
    loading,
    error,
    
    // Week navigation
    navigateToPreviousWeek,
    navigateToNextWeek,
    navigateToCurrentWeek,
    setSelectedWeek,
    
    // Data operations
    refreshWeeklyRoster,
    refreshMetrics,
    
    // Service access
    service: unifiedRosteringService
  };
}