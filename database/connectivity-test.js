/**
 * Database Connectivity Debug Script
 * Run this in the browser console to test database operations step by step
 */

// Step 1: Test basic Supabase client
console.log('=== SUPABASE CLIENT TEST ===');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Step 2: Test table existence and basic queries
async function testDatabaseConnectivity() {
  try {
    console.log('\n=== DATABASE CONNECTIVITY TEST ===');
    
    // Test 1: staff_members table
    console.log('\n1. Testing staff_members table...');
    const { data: staffData, error: staffError } = await supabase
      .from('staff_members')
      .select('*')
      .limit(1);
    
    if (staffError) {
      console.error('❌ Staff members error:', staffError);
    } else {
      console.log('✅ Staff members test:', staffData?.length || 0, 'records');
      if (staffData?.[0]) {
        console.log('Sample record columns:', Object.keys(staffData[0]));
      }
    }

    // Test 2: weekly_schedules table
    console.log('\n2. Testing weekly_schedules table...');
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('weekly_schedules')
      .select('*')
      .limit(1);
    
    if (scheduleError) {
      console.error('❌ Weekly schedules error:', scheduleError);
    } else {
      console.log('✅ Weekly schedules test:', scheduleData?.length || 0, 'records');
      if (scheduleData?.[0]) {
        console.log('Sample record columns:', Object.keys(scheduleData[0]));
      }
    }

    // Test 3: schedule_exceptions table
    console.log('\n3. Testing schedule_exceptions table...');
    const { data: exceptionData, error: exceptionError } = await supabase
      .from('schedule_exceptions')
      .select('*')
      .limit(1);
    
    if (exceptionError) {
      console.error('❌ Schedule exceptions error:', exceptionError);
    } else {
      console.log('✅ Schedule exceptions test:', exceptionData?.length || 0, 'records');
      if (exceptionData?.[0]) {
        console.log('Sample record columns:', Object.keys(exceptionData[0]));
      }
    }

    // Test 4: external_bookings table
    console.log('\n4. Testing external_bookings table...');
    const { data: bookingData, error: bookingError } = await supabase
      .from('external_bookings')
      .select('*')
      .limit(1);
    
    if (bookingError) {
      console.error('❌ External bookings error:', bookingError);
    } else {
      console.log('✅ External bookings test:', bookingData?.length || 0, 'records');
      if (bookingData?.[0]) {
        console.log('Sample record columns:', Object.keys(bookingData[0]));
      }
    }

    // Test 5: Check RLS context
    console.log('\n5. Testing RLS context...');
    try {
      const { data: contextData, error: contextError } = await supabase
        .rpc('get_user_organization_id');
      
      if (contextError) {
        console.error('❌ RLS context error:', contextError);
      } else {
        console.log('✅ User organization ID:', contextData);
      }
    } catch (rpcError) {
      console.error('❌ RLS RPC not available:', rpcError);
    }

    console.log('\n=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Step 3: Test RosteringService methods individually
async function testRosteringService() {
  console.log('\n=== ROSTERING SERVICE TEST ===');
  
  try {
    // Import the service
    const { RosteringService } = await import('./src/services/RosteringService');
    const service = new RosteringService();
    
    console.log('\n1. Testing getStaffMembers...');
    const staff = await service.getStaffMembers();
    console.log('✅ Staff members:', staff.length);
    
    console.log('\n2. Testing getWeeklyRoster...');
    const roster = await service.getWeeklyRoster({
      week_start_date: new Date().toISOString().split('T')[0]
    });
    console.log('✅ Weekly roster:', roster.length, 'days');
    
  } catch (serviceError) {
    console.error('❌ RosteringService test failed:', serviceError);
  }
}

// Run tests
console.log('Starting database connectivity tests...');
console.log('Run: await testDatabaseConnectivity()');
console.log('Run: await testRosteringService()');

// Export for manual execution
window.testDatabaseConnectivity = testDatabaseConnectivity;
window.testRosteringService = testRosteringService;