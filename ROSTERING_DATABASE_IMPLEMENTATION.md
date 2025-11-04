# HRMS Rostering System - Database Integration Implementation Guide

This guide explains how to implement the actual database integration for the HRMS rostering system, replacing mock data with real Supabase database operations.

## 🗃️ Database Schema Overview

The rostering system uses four main tables:

### Core Tables
- **`staff_members`** - Staff information and settings
- **`weekly_schedules`** - Regular weekly working hours 
- **`schedule_exceptions`** - Holidays, sick days, special hours
- **`external_bookings`** - Appointments from other systems (HMS, PA)

## 🚀 Implementation Steps

### 1. Database Migration

Apply the database migration to create all required tables:

```sql
-- Run this in your Supabase SQL editor
\i database/migrations/rostering-system-migration.sql
```

Or copy and paste the contents of `database/migrations/rostering-system-migration.sql` into the Supabase SQL editor.

### 2. Files Created/Updated

The following files implement the complete database integration:

#### New Files:
- **`src/types/rostering.ts`** - TypeScript types for all rostering entities
- **`src/services/RosteringService.ts`** - Service class for all database operations
- **`src/hooks/useRostering.ts`** - React hooks for state management
- **`database/migrations/rostering-system-migration.sql`** - Database setup

#### Updated Files:
- **`src/app/rostering/page.tsx`** - Updated to use database integration

### 3. Key Features Implemented

#### 🏥 Multi-tenant Support
- All data isolated by `entity_platform_id`
- Row Level Security (RLS) policies enforce data separation
- Automatic entity filtering based on authenticated user

#### 👥 Staff Management
- Complete CRUD operations for staff members
- Role-based categorization (veterinarian, technician, etc.)
- Active/inactive status management

#### 📅 Schedule Management
- Weekly recurring schedules with effective date ranges
- Time slot calculations for appointment availability
- Overlap prevention and validation

#### 🚫 Exception Handling
- Holiday and vacation tracking
- Sick leave management
- Special hours (early close, late start)
- Full-day or partial-day exceptions

#### 🔗 External Integration
- Appointment bookings from HMS system
- Metadata storage for external system data
- Status tracking (active, completed, cancelled)

### 4. Usage Examples

#### Basic Staff Management
```typescript
import { useRostering } from '@/hooks/useRostering';

function StaffManagement() {
  const { 
    staffMembers, 
    createStaffMember, 
    updateStaffMember,
    loading 
  } = useRostering();

  const handleCreateStaff = async () => {
    await createStaffMember({
      full_name: 'Dr. John Doe',
      email: 'john@clinic.com',
      role_type: 'veterinarian',
      job_title: 'Senior Veterinarian'
    });
  };

  return (
    <div>
      {loading ? 'Loading...' : staffMembers.map(staff => (
        <div key={staff.id}>{staff.full_name}</div>
      ))}
    </div>
  );
}
```

#### Weekly Roster View
```typescript
import { useWeeklyRoster } from '@/hooks/useRostering';

function WeeklyView() {
  const {
    selectedWeek,
    weeklyRoster,
    navigateToNextWeek,
    navigateToPreviousWeek
  } = useWeeklyRoster();

  return (
    <div>
      <h2>Week of {selectedWeek.toDateString()}</h2>
      {weeklyRoster.map(day => (
        <div key={day.date}>
          <h3>{day.date}</h3>
          {day.staff_schedules.map(schedule => (
            <div key={schedule.staff_member.id}>
              {schedule.staff_member.full_name}: 
              {schedule.regular_schedule ? 
                `${schedule.regular_schedule.start_time} - ${schedule.regular_schedule.end_time}` : 
                'No schedule'
              }
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

#### Schedule Management
```typescript
const { upsertWeeklySchedule } = useRostering();

// Create a weekly schedule
await upsertWeeklySchedule({
  staff_member_id: 'staff-uuid',
  day_of_week: 1, // Monday
  start_time: '08:00',
  end_time: '16:00',
  effective_from: '2025-01-01'
});
```

### 5. Data Flow

```
User Action → Hook → Service → Supabase → RLS → Database
     ↓
UI Update ← State ← Response ← Auth Check ← Query Result
```

1. User interacts with UI components
2. React hooks manage state and call service methods
3. Service layer handles business logic and API calls
4. Supabase client processes requests with RLS
5. Database returns filtered results
6. UI updates with new data

### 6. Security Features

#### Row Level Security (RLS)
All tables use RLS policies that filter data by `entity_platform_id`:

```sql
-- Example RLS policy
CREATE POLICY "staff_members_entity_isolation" ON staff_members
  FOR ALL USING (
    auth.jwt() ->> 'entity_platform_id' = entity_platform_id::text
  );
```

#### Data Validation
- Time range validation (start < end)
- Date range validation for effective periods
- Unique constraints prevent conflicts
- Foreign key constraints maintain referential integrity

### 7. Performance Optimizations

#### Database Indexes
- Entity platform ID indexes for tenant isolation
- Staff member indexes for schedule lookups
- Date indexes for time-based queries
- Composite indexes for common query patterns

#### Query Optimization
- Parallel data fetching for weekly roster views
- Efficient filtering at database level
- Pagination support for large datasets
- Caching strategies for frequently accessed data

### 8. Error Handling

#### Service Layer
```typescript
try {
  const staff = await rosteringService.getStaffMembers();
  return staff;
} catch (error) {
  console.error('[RosteringService] Error:', error);
  throw error;
}
```

#### Hook Layer
```typescript
const [error, setError] = useState<string | null>(null);

const handleAsync = async (operation) => {
  try {
    setError(null);
    return await operation();
  } catch (err) {
    setError(err.message);
    throw err;
  }
};
```

### 9. Testing

#### Sample Data
The migration includes sample data for testing:
- 3 staff members with different roles
- Weekly schedules for different staff types
- Demonstrates veterinarian and receptionist patterns

#### Test Scenarios
1. **Staff Management**: Create, update, deactivate staff
2. **Schedule Creation**: Weekly recurring patterns
3. **Exception Handling**: Holidays and sick days
4. **Multi-tenant**: Verify data isolation
5. **Performance**: Large dataset handling

### 10. Next Steps

#### Immediate
1. Apply database migration
2. Test basic functionality
3. Remove sample data in production
4. Configure proper authentication

#### Future Enhancements
1. **Advanced Scheduling**:
   - Shift templates and patterns
   - Automated schedule generation
   - Conflict resolution

2. **Request Management**:
   - Employee time-off requests
   - Shift swap requests
   - Approval workflows

3. **Integration Expansion**:
   - HMS appointment synchronization
   - Payroll system integration
   - Time tracking integration

4. **Analytics**:
   - Coverage reports
   - Staff utilization metrics
   - Cost analysis

### 11. Troubleshooting

#### Common Issues

**Authentication Errors**:
- Ensure `entity_platform_id` is set in JWT token
- Verify RLS policies are enabled
- Check user permissions

**Data Not Loading**:
- Verify migration applied successfully
- Check browser network tab for errors
- Validate Supabase connection

**Performance Issues**:
- Monitor query execution times
- Check index usage
- Optimize date range queries

**Timezone Issues**:
- Ensure consistent timezone handling
- Use UTC for storage, local for display
- Validate time calculations

## 🎯 Success Criteria

The implementation is successful when:

1. ✅ Staff members can be created, updated, and managed
2. ✅ Weekly schedules display correctly from database
3. ✅ Schedule exceptions override regular schedules
4. ✅ External bookings integrate properly
5. ✅ Data isolation works between entities
6. ✅ Performance is acceptable for expected load
7. ✅ Error handling provides useful feedback

## 🔗 Related Documentation

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [TypeScript Type Safety](https://www.typescriptlang.org/docs/)

---

**Note**: This implementation provides a solid foundation for the rostering system. Additional features and optimizations can be added based on specific requirements and user feedback.