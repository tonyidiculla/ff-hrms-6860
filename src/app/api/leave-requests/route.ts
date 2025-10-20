import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { validateHRAccess } from '@/lib/subscription'
import { z } from 'zod'

const createLeaveRequestSchema = z.object({
  entity_platform_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  leave_type: z.enum(['annual', 'sick', 'maternity', 'paternity', 'personal', 'emergency']),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  days_requested: z.number().positive(),
  reason: z.string().min(1).max(500),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).default('pending'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entityId = searchParams.get('entity_id')
    const employeeId = searchParams.get('employee_id')
    const status = searchParams.get('status')

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
      .from('employee_leave_requests')
      .select(`
        id,
        employee_id,
        leave_type,
        start_date,
        end_date,
        days_requested,
        reason,
        status,
        approved_by,
        approved_at,
        created_at,
        employees!inner (
          employee_id,
          first_name,
          last_name,
          department
        )
      `)
      .eq('entity_platform_id', entityId)

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: leaveRequests, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching leave requests:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leave requests' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      leave_requests: leaveRequests,
      count: leaveRequests.length
    })

  } catch (error) {
    console.error('Error in leave requests GET:', error)
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
    const validatedData = createLeaveRequestSchema.parse(body)

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

    // Verify employee exists and belongs to this entity
    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('id', validatedData.employee_id)
      .eq('entity_platform_id', validatedData.entity_platform_id)
      .eq('status', 'active')
      .single()

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found or inactive' },
        { status: 404 }
      )
    }

    // Create leave request
    const { data: leaveRequest, error } = await supabaseAdmin
      .from('employee_leave_requests')
      .insert([validatedData])
      .select()
      .single()

    if (error) {
      console.error('Error creating leave request:', error)
      return NextResponse.json(
        { error: 'Failed to create leave request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Leave request created successfully',
      leave_request: leaveRequest
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in leave requests POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}