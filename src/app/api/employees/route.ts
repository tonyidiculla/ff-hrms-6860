import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { validateHRAccess, extractEntityPlatformId } from '@/lib/subscription'
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
    const { searchParams } = new URL(request.url)
    const entityId = searchParams.get('entity_id')
    const department = searchParams.get('department')
    const status = searchParams.get('status') || 'active'

    console.log('[HRMS Employees API] Fetching employees for entity:', entityId);

    if (!entityId) {
      return NextResponse.json(
        { error: 'entity_id parameter is required' },
        { status: 400 }
      )
    }

    // Check subscription access
    const accessCheck = await validateHRAccess(entityId)
    console.log('[HRMS Employees API] Access check result:', accessCheck);
    
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Access denied to HR module',
          reason: accessCheck.error,
          subscription: accessCheck.subscription 
        },
        { status: 403 }
      )
    }

    // Fetch employees from employee_seat_assignment with profile data
    let query = supabaseAdmin
      .from('employee_seat_assignment')
      .select(`
        id,
        employee_entity_id,
        user_platform_id,
        entity_role_id,
        is_active,
        assigned_at,
        assigned_by,
        profiles_with_auth (
          user_id,
          user_platform_id,
          first_name,
          last_name,
          email,
          phone_number,
          avatar_storage
        )
      `)
      .eq('employee_entity_id', entityId)
      .eq('is_active', true)

    const { data: employeeAssignments, error } = await query.order('assigned_at', { ascending: false })

    console.log('[HRMS Employees API] Query result:', { 
      count: employeeAssignments?.length, 
      error: error?.message,
      entityId 
    });

    if (error) {
      console.error('[HRMS Employees API] Error fetching employees:', error)
      return NextResponse.json(
        { error: 'Failed to fetch employees', details: error.message },
        { status: 500 }
      )
    }

    console.log('[HRMS Employees API] Raw employee assignments:', JSON.stringify(employeeAssignments, null, 2));

    // Transform the data to match the expected employee structure
    const employees = employeeAssignments?.map((assignment: any) => ({
      id: assignment.id,
      entity_platform_id: assignment.employee_entity_id,
      employee_id: assignment.user_platform_id || '',
      first_name: assignment.profiles_with_auth?.first_name || '',
      last_name: assignment.profiles_with_auth?.last_name || '',
      email: assignment.profiles_with_auth?.email || '',
      phone: assignment.profiles_with_auth?.phone_number || '',
      department: 'General', // Default department until we fix role relationship
      job_title: 'Employee', // Default job title until we fix role relationship
      employment_type: 'full_time',
      hire_date: assignment.assigned_at,
      status: assignment.is_active ? 'active' : 'inactive',
      avatar_storage: assignment.profiles_with_auth?.avatar_storage,
      role_name: null,
      role_description: null,
      created_at: assignment.assigned_at,
      updated_at: assignment.assigned_at
    })) || []

    if (error) {
      console.error('[HRMS Employees API] Error after transformation:', error)
      return NextResponse.json(
        { error: 'Failed to fetch employees' },
        { status: 500 }
      )
    }

    console.log('[HRMS Employees API] Returning employees:', { 
      count: employees.length,
      sample: employees[0] 
    });

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
    const body = await request.json()
    
    // Validate input
    const validatedData = createEmployeeSchema.parse(body)

    // Check subscription access
    const accessCheck = await validateHRAccess(validatedData.entity_platform_id)
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Access denied to HR module',
          reason: accessCheck.error,
          subscription: accessCheck.subscription 
        },
        { status: 403 }
      )
    }

    // Check if employee_id already exists for this entity
    const { data: existingEmployee } = await supabaseAdmin
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

    // Create new employee
    const { data: employee, error } = await supabaseAdmin
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