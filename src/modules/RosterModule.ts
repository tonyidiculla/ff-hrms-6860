import { rosterConfig } from '../config/roster';

export class RosterModule {
  static generateShiftId(): string {
    return `shift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static calculateShiftDuration(startTime: string, endTime: string): number {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  static isWithinShiftLimits(
    staffId: string,
    weekStart: Date,
    existingShifts: any[]
  ): { isValid: boolean; weeklyHours: number; shiftCount: number } {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weeklyShifts = existingShifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shift.staffId === staffId &&
             shiftDate >= weekStart &&
             shiftDate <= weekEnd;
    });

    const weeklyHours = weeklyShifts.reduce((total, shift) => {
      return total + this.calculateShiftDuration(shift.startTime, shift.endTime);
    }, 0);

    return {
      isValid: weeklyHours <= rosterConfig.compliance.maxHoursPerWeek &&
               weeklyShifts.length <= rosterConfig.scheduling.maxShiftsPerWeek,
      weeklyHours,
      shiftCount: weeklyShifts.length,
    };
  }

  static checkConsecutiveDays(
    staffId: string,
    newShiftDate: Date,
    existingShifts: any[]
  ): { consecutiveDays: number; exceedsLimit: boolean } {
    const sortedShifts = existingShifts
      .filter(shift => shift.staffId === staffId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let consecutiveDays = 1; // Including the new shift
    let currentDate = new Date(newShiftDate);

    // Check backward
    for (let i = 1; i <= rosterConfig.scheduling.maxConsecutiveDays; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - i);
      
      const hasShift = sortedShifts.some(shift => {
        const shiftDate = new Date(shift.date);
        return shiftDate.toDateString() === checkDate.toDateString();
      });

      if (hasShift) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    // Check forward
    for (let i = 1; i <= rosterConfig.scheduling.maxConsecutiveDays; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() + i);
      
      const hasShift = sortedShifts.some(shift => {
        const shiftDate = new Date(shift.date);
        return shiftDate.toDateString() === checkDate.toDateString();
      });

      if (hasShift) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    return {
      consecutiveDays,
      exceedsLimit: consecutiveDays > rosterConfig.scheduling.maxConsecutiveDays,
    };
  }

  static generateWeeklyRoster(
    weekStart: Date,
    staff: any[],
    shiftRequirements: Record<string, number> // department -> shifts needed per day
  ): any[] {
    const roster: any[] = [];
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date;
    });

    for (const date of weekDays) {
      for (const [department, shiftsNeeded] of Object.entries(shiftRequirements)) {
        const availableStaff = staff.filter(staffMember => 
          staffMember.department === department && 
          staffMember.isActive &&
          this.checkStaffAvailability(staffMember, date)
        );

        // Distribute shifts among available staff
        const shiftTypes = ['morning', 'afternoon', 'night'];
        let assignedShifts = 0;

        for (const shiftType of shiftTypes) {
          if (assignedShifts >= shiftsNeeded) break;

          const staffForShift = availableStaff
            .filter(staff => !this.hasShiftOnDate(staff.id, date, roster))
            .slice(0, Math.ceil(shiftsNeeded / shiftTypes.length));

          for (const staffMember of staffForShift) {
            if (assignedShifts >= shiftsNeeded) break;

            const shiftConfig = rosterConfig.shiftTypes[shiftType as keyof typeof rosterConfig.shiftTypes];
            roster.push({
              id: this.generateShiftId(),
              staffId: staffMember.id,
              date: date.toISOString().split('T')[0],
              startTime: shiftConfig.startTime,
              endTime: shiftConfig.endTime,
              shiftType,
              department,
              status: 'scheduled',
            });
            assignedShifts++;
          }
        }
      }
    }

    return roster;
  }

  private static checkStaffAvailability(staffMember: any, date: Date): boolean {
    const dayOfWeek = date.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    return staffMember.availability?.[dayName] === true;
  }

  private static hasShiftOnDate(staffId: string, date: Date, roster: any[]): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return roster.some(shift => 
      shift.staffId === staffId && 
      shift.date === dateStr
    );
  }

  static optimizeRosterDistribution(
    shifts: any[],
    staff: any[]
  ): { optimizedRoster: any[]; metrics: any } {
    const optimizedRoster = [...shifts];
    const metrics = {
      totalShifts: shifts.length,
      staffUtilization: {} as Record<string, number>,
      departmentCoverage: {} as Record<string, number>,
      shiftDistribution: {} as Record<string, number>,
    };

    // Calculate staff utilization
    for (const staffMember of staff) {
      const staffShifts = shifts.filter(shift => shift.staffId === staffMember.id);
      metrics.staffUtilization[staffMember.id] = staffShifts.length;
    }

    // Calculate department coverage
    const departments = Object.keys(rosterConfig.departments);
    for (const department of departments) {
      const departmentShifts = shifts.filter(shift => shift.department === department);
      metrics.departmentCoverage[department] = departmentShifts.length;
    }

    // Calculate shift type distribution
    const shiftTypes = Object.keys(rosterConfig.shiftTypes);
    for (const shiftType of shiftTypes) {
      const typeShifts = shifts.filter(shift => shift.shiftType === shiftType);
      metrics.shiftDistribution[shiftType] = typeShifts.length;
    }

    return {
      optimizedRoster,
      metrics,
    };
  }

  static processShiftSwapRequest(
    fromShiftId: string,
    toShiftId: string,
    shifts: any[]
  ): { success: boolean; updatedShifts?: any[]; error?: string } {
    const fromShift = shifts.find(shift => shift.id === fromShiftId);
    const toShift = shifts.find(shift => shift.id === toShiftId);

    if (!fromShift || !toShift) {
      return { success: false, error: 'One or both shifts not found' };
    }

    if (fromShift.department !== toShift.department) {
      return { success: false, error: 'Cannot swap shifts between different departments' };
    }

    if (fromShift.shiftType !== toShift.shiftType) {
      return { success: false, error: 'Cannot swap shifts of different types' };
    }

    // Create updated shifts with swapped staff assignments
    const updatedShifts = shifts.map(shift => {
      if (shift.id === fromShiftId) {
        return { ...shift, staffId: toShift.staffId };
      }
      if (shift.id === toShiftId) {
        return { ...shift, staffId: fromShift.staffId };
      }
      return shift;
    });

    return {
      success: true,
      updatedShifts,
    };
  }

  static calculateRosterMetrics(
    shifts: any[],
    staff: any[]
  ): {
    totalHours: number;
    averageHoursPerStaff: number;
    departmentDistribution: Record<string, number>;
    shiftTypeDistribution: Record<string, number>;
    coverageGaps: any[];
  } {
    const totalHours = shifts.reduce((sum, shift) => {
      return sum + this.calculateShiftDuration(shift.startTime, shift.endTime);
    }, 0);

    const activeStaff = staff.filter(s => s.isActive);
    const averageHoursPerStaff = activeStaff.length > 0 ? totalHours / activeStaff.length : 0;

    const departmentDistribution: Record<string, number> = {};
    const shiftTypeDistribution: Record<string, number> = {};

    for (const shift of shifts) {
      departmentDistribution[shift.department] = (departmentDistribution[shift.department] || 0) + 1;
      shiftTypeDistribution[shift.shiftType] = (shiftTypeDistribution[shift.shiftType] || 0) + 1;
    }

    // Identify coverage gaps (simplified)
    const coverageGaps: any[] = [];
    // This would contain logic to identify periods with insufficient staffing

    return {
      totalHours,
      averageHoursPerStaff,
      departmentDistribution,
      shiftTypeDistribution,
      coverageGaps,
    };
  }
}

export default RosterModule;