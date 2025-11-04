import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Validation schema for employee creation
const createEmployeeSchema = z.object({
  entity_platform_id: z.string().uuid(),
  user_platform_id: z.string().optional(),
  employee_id: z.string().min(1).max(100),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  department: z.string().max(100).optional(),
  job_title: z.string().max(255),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'intern']).default('full_time'),
  hire_date: z.string().datetime(),
  salary: z.number().positive().optional(),
  manager_id: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive', 'terminated']).default('active'),
})

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Create Supabase client with user's session (respects RLS)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { searchParams } = new URL(request.url)
    const entityId = searchParams.get('entity_id')

    if (!entityId) {
      return NextResponse.json(
        { error: 'entity_id parameter is required' },
        { status: 400 }
      )
    }

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch employee seat assignments - RLS will filter to user's allowed entities
    // Only show filled positions (seats with employees assigned)
    const { data: employeeAssignments, error } = await supabase
      .from('employee_seat_assignment')
      .select(`
        id,
        entity_platform_id,
        user_platform_id,
        platform_role_id,
        employee_job_title,
        department,
        employment_status,
        employment_start_date,
        employee_email,
        employee_contact,
        is_active,
        assigned_at,
        assigned_by
      `)
      .eq('entity_platform_id', entityId)
      .eq('is_active', true)
      .eq('is_filled', true)
      .order('assigned_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch employees', details: error.message },
        { status: 500 }
      )
    }

    // Fetch profiles separately for all user_platform_ids
    const userPlatformIds = employeeAssignments?.map((a: any) => a.user_platform_id).filter(Boolean) || [];
    
    let profilesMap = new Map();
    if (userPlatformIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles_with_auth')
        .select('user_platform_id, first_name, last_name, avatar_storage, phone')
        .in('user_platform_id', userPlatformIds);
      
      profiles?.forEach((p: any) => profilesMap.set(p.user_platform_id, p));
    }

    // Transform the data to match the expected employee structure
    const employees = employeeAssignments?.map((assignment: any) => {
      const profile = profilesMap.get(assignment.user_platform_id);
      
      return {
        id: assignment.id,
        entity_platform_id: assignment.entity_platform_id,
        employee_id: assignment.user_platform_id || '',
        first_name: profile?.first_name || 'Unknown',
        last_name: profile?.last_name || 'User',
        email: assignment.employee_email || assignment.user_platform_id,
        phone: assignment.employee_contact || profile?.phone || '',
        department: assignment.department || 'Unassigned',
        job_title: assignment.employee_job_title || 'Employee',
        employment_type: 'full_time',
        hire_date: assignment.employment_start_date || assignment.assigned_at,
        status: assignment.employment_status || (assignment.is_active ? 'active' : 'inactive'),
        avatar_storage: profile?.avatar_storage,
        role_name: null,
        role_description: null,
        created_at: assignment.assigned_at,
        updated_at: assignment.assigned_at
      };
    }) || []

    return NextResponse.json({
      employees,
      count: employees.length
    })

  } catch (error) {
    console.error('Error in employees GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = createEmployeeSchema.parse(body)

    // Check if employee_id already exists for this entity (RLS enforced)
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('entity_platform_id', validatedData.entity_platform_id)
      .eq('employee_id', validatedData.employee_id)
      .single()

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee ID already exists for this organization' },
        { status: 409 }
      )
    }

    // Create new employee (RLS enforced)
    const { data: employee, error } = await supabase
      .from('employees')
      .insert([validatedData])
      .select()
      .single()

    if (error) {
      console.error('Error creating employee:', error)
      return NextResponse.json(
        { error: 'Failed to create employee' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Employee created successfully',
      employee
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in employees POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}