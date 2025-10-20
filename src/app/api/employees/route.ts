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

    if (!entityId) {
      return NextResponse.json(
        { error: 'entity_id parameter is required' },
        { status: 400 }
      )
    }

    // Check subscription access
    const accessCheck = await validateHRAccess(entityId)
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

    let query = supabaseAdmin
      .from('employees')
      .select(`
        id,
        entity_platform_id,
        employee_id,
        first_name,
        last_name,
        email,
        phone,
        department,
        job_title,
        employment_type,
        hire_date,
        status,
        created_at,
        updated_at
      `)
      .eq('entity_platform_id', entityId)

    if (department) {
      query = query.eq('department', department)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: employees, error } = await query.order('last_name', { ascending: true })

    if (error) {
      console.error('Error fetching employees:', error)
      return NextResponse.json(
        { error: 'Failed to fetch employees' },
        { status: 500 }
      )
    }

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