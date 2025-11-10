import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entity_id');

    if (!entityId) {
      return NextResponse.json(
        { error: 'entity_id is required' },
        { status: 400 }
      );
    }

    const { data: positions, error } = await supabaseAdmin
      .from('employee_seat_assignment')
      .select('*')
      .eq('entity_platform_id', entityId)
      .order('employee_job_title', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch positions', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      positions,
      count: positions?.length || 0
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entityId = body.entity_platform_id || 'E019nC8m3';

    // Generate a unique seat ID
    const uniqueSeatId = `${entityId}.${Math.random().toString(36).substring(2, 10)}`;

    // Use RPC to bypass triggers if they exist
    const { data, error } = await supabaseAdmin.rpc('create_position', {
      p_entity_platform_id: entityId,
      p_unique_seat_id: uniqueSeatId,
      p_employee_job_title: body.employee_job_title,
      p_department: body.department,
      p_platform_role_name: body.platform_role_name || null,
      p_entity_address: body.address || null,
      p_employment_status: 'open',
      p_is_active: body.is_active ?? true,
      p_job_grade: body.job_grade || null,
      p_is_manager: body.is_manager ?? false,
    });

    if (error) {
      // If RPC doesn't exist, fall back to direct insert
      if (error.message.includes('function') || error.code === '42883') {
        const positionData: any = {
          entity_platform_id: entityId,
          unique_seat_id: uniqueSeatId,
          employee_job_title: body.employee_job_title,
          department: body.department,
          employment_status: 'open',
          is_active: body.is_active ?? true,
          job_grade: body.job_grade || null,
          is_manager: body.is_manager ?? false,
        };

        if (body.platform_role_name) {
          positionData.platform_role_name = body.platform_role_name;
        }

        if (body.address) {
          positionData.work_address = body.address;
        }

        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('employee_seat_assignment')
          .insert(positionData)
          .select()
          .single();

        if (insertError) {
          return NextResponse.json(
            { error: 'Failed to create position', details: insertError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({ position: insertData }, { status: 201 });
      }

      return NextResponse.json(
        { error: 'Failed to create position', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ position: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('position_id');

    if (!positionId) {
      return NextResponse.json(
        { error: 'position_id is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updateData: any = {};
    if (body.employee_job_title !== undefined) updateData.employee_job_title = body.employee_job_title;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.platform_role_name !== undefined) updateData.platform_role_name = body.platform_role_name;
    if (body.address !== undefined) updateData.work_address = body.address;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.job_grade !== undefined) updateData.job_grade = body.job_grade;
    if (body.is_manager !== undefined) updateData.is_manager = body.is_manager;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('employee_seat_assignment')
      .update(updateData)
      .eq('id', positionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update position', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ position: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('position_id');

    if (!positionId) {
      return NextResponse.json(
        { error: 'position_id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('employee_seat_assignment')
      .delete()
      .eq('id', positionId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete position', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
