'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  BriefcaseIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  UserPlusIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, formatDate } from '@/lib/utils';
import { HRMSLayout, ContentCard } from '@/components/layout/HRMSLayout';
import { TabItem } from '@/types/layout';

const tabs: TabItem[] = [
  { name: 'Directory', href: '/employees', icon: UserGroupIcon },
  { name: 'Employee Records', href: '/employees/add', icon: UserPlusIcon },
  { name: 'Positions', href: '/employees/positions', icon: BriefcaseIcon },
  { name: 'Departments', href: '/employees/departments', icon: BuildingOfficeIcon },
];

const headerProps = {
  title: "Job Positions",
  subtitle: "Manage employee positions and assignments",
  breadcrumbs: [
    { name: 'Home', href: '/' },
    { name: 'Employees', href: '/employees' },
    { name: 'Positions' }
  ]
};

interface Position {
  unique_seat_id: string;
  employee_job_title: string;
  department: string;
  employment_status: string;
  is_filled: boolean;
  is_active: boolean;
  user_platform_id: string | null;
  entity_platform_id: string | null;
  salary: number | null;
  salary_currency: string | null;
  employment_start_date: string | null;
}

interface SeatRole {
  id: string;
  job_title: string; // Specific job title for this position
  role_search: string; // Search term for platform role dropdown
  platform_role_id?: string;
  department: string; // Department for this position
  count: number;
}

interface PlatformRole {
  role_code: string;
  role_name: string;
  id: string;
}

interface Department {
  id: string;
  department_name: string;
  department_code: string;
  is_active: boolean;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'filled' | 'vacant'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [seatRoles, setSeatRoles] = useState<SeatRole[]>([
    { id: '1', job_title: '', role_search: '', department: '', count: 1 }
  ]);
  const [creating, setCreating] = useState(false);
  const [platformRoles, setPlatformRoles] = useState<PlatformRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roleSearchTerms, setRoleSearchTerms] = useState<Record<string, string>>({});
  const [showRoleDropdown, setShowRoleDropdown] = useState<Record<string, boolean>>({});
  const [entityId, setEntityId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [availablePositions, setAvailablePositions] = useState<Position[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchUserEntity();
    fetchPlatformRoles();
  }, []);

  useEffect(() => {
    if (entityId) {
      fetchPositions();
      fetchDepartments();
    }
  }, [entityId]);

  const fetchUserEntity = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      
      if (!response.ok) {
        console.error('[Positions] Auth API failed:', response.status);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[Positions] Auth API returned non-JSON response');
        return;
      }

      const userData = await response.json();
      const userEntityId = userData.employee_entity_id || userData.entity_platform_id;
      if (userEntityId) {
        setEntityId(userEntityId);
      }
    } catch (err) {
      console.error('[Positions] Failed to fetch user entity:', err);
    }
  };

  const fetchPlatformRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_roles')
        .select('id, role_name, display_name')
        .eq('is_active', true)
        .order('role_name');

      if (error) {
        console.error('Error fetching platform roles:', error);
        throw error;
      }
      
      // Map to include role_code as id for compatibility
      const rolesWithCode = data?.map(role => ({
        role_code: role.id,
        role_name: role.display_name || role.role_name,
        id: role.id
      })) || [];
      
      setPlatformRoles(rolesWithCode);
    } catch (error) {
      console.error('Error fetching platform roles:', error);
    }
  };

  const fetchDepartments = async () => {
    if (!entityId) {
      console.log('[Departments] No entityId available yet, skipping fetch');
      return;
    }

    try {
      console.log('[Departments] Fetching departments for entity:', entityId);
      
      // Fetch active departments from the entity_departments table for this entity
      const { data, error } = await supabase
        .from('entity_departments')
        .select('id, department_name, department_code, is_active')
        .eq('entity_platform_id', entityId)
        .eq('is_active', true)
        .order('department_name', { ascending: true });

      console.log('[Departments] Query result:', { count: data?.length, error });

      if (error) {
        console.error('[Departments] Error fetching departments:', error);
        return;
      }

      setDepartments(data || []);
      console.log('[Departments] Departments loaded:', data?.length || 0);
    } catch (error) {
      console.error('[Departments] Error fetching departments:', error);
    }
  };

  const fetchPositions = async () => {
    if (!entityId) return;
    
    try {
      setLoading(true);

      // Direct Supabase call with anon key - RLS enforced
      const { data, error } = await supabase
        .from('employee_seat_assignment')
        .select('unique_seat_id, employee_job_title, department, employment_status, is_filled, is_active, user_platform_id, entity_platform_id, salary, salary_currency, employment_start_date')
        .eq('entity_platform_id', entityId)
        .order('employee_job_title', { ascending: true });

      if (error) {
        console.error('Error fetching positions:', error);
      } else {
        setPositions(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActiveStatus = async (seatId: string, currentStatus: boolean) => {
    try {
      // Find the position to check if it's filled
      const position = positions.find(pos => pos.unique_seat_id === seatId);
      
      // Prevent deactivating a filled position
      if (currentStatus && position?.is_filled) {
        alert('Cannot deactivate a position with an employee assigned. Please remove the employee first.');
        return;
      }

      // Direct Supabase call with anon key - RLS enforced
      const { error } = await supabase
        .from('employee_seat_assignment')
        .update({ is_active: !currentStatus })
        .eq('unique_seat_id', seatId);

      if (error) throw error;

      // Update local state
      setPositions(positions.map(pos => 
        pos.unique_seat_id === seatId 
          ? { ...pos, is_active: !currentStatus }
          : pos
      ));
    } catch (error) {
      console.error('Error updating seat status:', error);
      alert('Failed to update seat status');
    }
  };

  const addSeatRole = () => {
    setSeatRoles([...seatRoles, { 
      id: Date.now().toString(), 
      job_title: '', 
      role_search: '',
      department: '',
      count: 1 
    }]);
  };

  const removeSeatRole = (id: string) => {
    if (seatRoles.length > 1) {
      setSeatRoles(seatRoles.filter(role => role.id !== id));
    }
  };

  const updateSeatRole = (id: string, field: keyof SeatRole, value: string | number) => {
    console.log('[updateSeatRole] Updating:', { id, field, value });
    setSeatRoles(prevRoles => prevRoles.map(role => {
      if (role.id === id) {
        const updated = { ...role, [field]: value };
        console.log('[updateSeatRole] Updated role:', updated);
        return updated;
      }
      return role;
    }));
  };

  // Position management handlers
  const handleEditPosition = (position: Position) => {
    setEditingPosition(position);
    setIsEditModalOpen(true);
  };

  const handleRemoveEmployee = async (position: Position) => {
    if (!position.is_filled || !position.user_platform_id) {
      alert('This position is already vacant.');
      return;
    }

    const confirmRemove = window.confirm(
      `Are you sure you want to remove the employee from position "${position.employee_job_title}"? This will make the position vacant.`
    );

    if (!confirmRemove) return;

    try {
      setUpdating(true);
      
      // Remove employee from position (vacate the seat)
      const { error } = await supabase
        .from('employee_seat_assignment')
        .update({ 
          user_platform_id: null,
          employee_email: null,
          employee_contact: null,
          employment_start_date: null
          // is_filled will auto-update via generated column
        })
        .eq('unique_seat_id', position.unique_seat_id);

      if (error) throw error;

      // Refresh positions
      await fetchPositions();
      
      // Close edit modal if it's open
      if (isEditModalOpen) {
        setIsEditModalOpen(false);
        setEditingPosition(null);
      }
      
      alert('Employee removed from position successfully!');
    } catch (error) {
      console.error('Error removing employee:', error);
      alert('Failed to remove employee from position');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePosition = async (position: Position) => {
    if (position.is_filled) {
      alert('Cannot delete a position with an employee assigned. Please remove the employee first.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete the position "${position.employee_job_title}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setUpdating(true);
      
      // Delete the position
      const { error } = await supabase
        .from('employee_seat_assignment')
        .delete()
        .eq('unique_seat_id', position.unique_seat_id);

      if (error) throw error;

      // Refresh positions
      await fetchPositions();
      
      alert('Position deleted successfully!');
    } catch (error) {
      console.error('Error deleting position:', error);
      alert('Failed to delete position');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePosition = async () => {
    if (!editingPosition) return;

    if (!editingPosition.employee_job_title.trim() || !editingPosition.department.trim()) {
      alert('Please fill in all required fields (Job Title and Department)');
      return;
    }

    try {
      setUpdating(true);
      
      // Update the position
      const { error } = await supabase
        .from('employee_seat_assignment')
        .update({ 
          employee_job_title: editingPosition.employee_job_title.trim(),
          department: editingPosition.department.trim(),
          employment_status: editingPosition.employment_status,
          is_active: editingPosition.is_active
        })
        .eq('unique_seat_id', editingPosition.unique_seat_id);

      if (error) throw error;

      // Refresh positions
      await fetchPositions();
      
      // Close modal
      setIsEditModalOpen(false);
      setEditingPosition(null);
      
      alert('Position updated successfully!');
    } catch (error) {
      console.error('Error updating position:', error);
      alert('Failed to update position');
    } finally {
      setUpdating(false);
    }
  };

  const handleReassignEmployee = async (position: Position) => {
    if (!position.is_filled || !position.user_platform_id) {
      alert('This position is already vacant.');
      return;
    }

    // Fetch available vacant positions for reassignment
    try {
      const { data: vacantPositions, error } = await supabase
        .from('employee_seat_assignment')
        .select('unique_seat_id, employee_job_title, department, employment_status')
        .eq('entity_platform_id', entityId)
        .eq('is_filled', false)
        .eq('is_active', true)
        .order('employee_job_title', { ascending: true });

      if (error) throw error;

      if (!vacantPositions || vacantPositions.length === 0) {
        alert('No vacant positions available for reassignment. Please create a new position first or wait for another position to become vacant.');
        return;
      }

      setAvailablePositions(vacantPositions as Position[]);
      setIsReassignModalOpen(true);
    } catch (error) {
      console.error('Error fetching vacant positions:', error);
      alert('Failed to load available positions');
    }
  };

  const handleEmployeeAttrition = async (position: Position) => {
    if (!position.is_filled || !position.user_platform_id) {
      alert('This position is already vacant.');
      return;
    }

    const confirmAttrition = window.confirm(
      `⚠️ EMPLOYEE ATTRITION CONFIRMATION\n\n` +
      `Are you sure the employee in position "${position.employee_job_title}" is leaving the company?\n\n` +
      `This will:\n` +
      `• Remove the employee from the system\n` +
      `• Make the position vacant\n` +
      `• This action cannot be undone\n\n` +
      `Only confirm if this is genuine attrition (resignation, termination, etc.)`
    );

    if (!confirmAttrition) return;

    try {
      setUpdating(true);
      
      // Remove employee from position (attrition - no reassignment)
      const { error } = await supabase
        .from('employee_seat_assignment')
        .update({ 
          user_platform_id: null,
          employee_email: null,
          employee_contact: null,
          employment_start_date: null,
          employment_status: 'open' // Position becomes open again
          // is_filled will auto-update via generated column
        })
        .eq('unique_seat_id', position.unique_seat_id);

      if (error) throw error;

      // Refresh positions
      await fetchPositions();
      
      // Close edit modal
      setIsEditModalOpen(false);
      setEditingPosition(null);
      
      alert('Employee attrition processed. Position is now vacant and available for new hires.');
    } catch (error) {
      console.error('Error processing employee attrition:', error);
      alert('Failed to process employee attrition');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmReassignment = async (targetPositionId: string) => {
    if (!editingPosition) return;

    const targetPosition = availablePositions.find(p => p.unique_seat_id === targetPositionId);
    if (!targetPosition) {
      alert('Invalid target position selected');
      return;
    }

    const confirmReassign = window.confirm(
      `Reassign employee from "${editingPosition.employee_job_title}" to "${targetPosition.employee_job_title}" in ${targetPosition.department}?`
    );

    if (!confirmReassign) return;

    try {
      setUpdating(true);

      // Step 1: Clear the current position
      const { error: clearError } = await supabase
        .from('employee_seat_assignment')
        .update({ 
          user_platform_id: null,
          employee_email: null,
          employee_contact: null,
          employment_start_date: null
        })
        .eq('unique_seat_id', editingPosition.unique_seat_id);

      if (clearError) throw clearError;

      // Step 2: Assign employee to new position
      const { error: assignError } = await supabase
        .from('employee_seat_assignment')
        .update({ 
          user_platform_id: editingPosition.user_platform_id,
          employment_start_date: new Date().toISOString(),
          employment_status: 'filled'
        })
        .eq('unique_seat_id', targetPositionId);

      if (assignError) throw assignError;

      // Refresh positions
      await fetchPositions();
      
      // Close modals
      setIsReassignModalOpen(false);
      setIsEditModalOpen(false);
      setEditingPosition(null);
      setAvailablePositions([]);
      
      alert(`Employee successfully reassigned to "${targetPosition.employee_job_title}" position!`);
    } catch (error) {
      console.error('Error reassigning employee:', error);
      alert('Failed to reassign employee');
    } finally {
      setUpdating(false);
    }
  };

  const generateSeatId = (entityId: string, baseIndex: number) => {
    // Generate unique seat ID using timestamp + base index + random chars
    const timestamp = Date.now().toString(36).slice(-4); // Last 4 chars of timestamp in base36
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomPart = Array.from({ length: 3 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
    return `${entityId}.${timestamp}${baseIndex}${randomPart}`;
  };

  const createSeats = async () => {
    try {
      setCreating(true);
      
      // Validate all roles
      const invalidRoles = seatRoles.filter(role => 
        !role.job_title.trim() || !role.platform_role_id || !role.department.trim() || role.count < 1
      );
      
      if (invalidRoles.length > 0) {
        alert('Please fill in the job title, select a department and platform role, and ensure count is at least 1');
        return;
      }

      // Check if we have entityId
      if (!entityId) {
        throw new Error('Entity ID not found. Please refresh the page and try again.');
      }

      // Generate all seat records with unique IDs
      let seatCounter = 0;
      const seatsToCreate = seatRoles.flatMap(role => 
        Array.from({ length: role.count }, () => {
          const seat = {
            unique_seat_id: generateSeatId(entityId, seatCounter++),
            employee_job_title: role.job_title,
            platform_role_id: role.platform_role_id, // Required for NOT NULL constraint
            department: role.department, // Include department in seat creation
            employment_status: 'open',
            // is_filled: false, // Don't set - has DEFAULT constraint
            is_active: true,
            entity_platform_id: entityId,
            user_id: null,
            salary: null,
            salary_currency: null,
            employment_start_date: null
          };
          return seat;
        })
      );

      console.log('[Create Positions] Entity ID:', entityId);
      console.log('[Create Positions] Number of seats to create:', seatsToCreate.length);
      console.log('[Create Positions] Seats data:', JSON.stringify(seatsToCreate, null, 2));

      const { data, error: insertError } = await supabase
        .from('employee_seat_assignment')
        .insert(seatsToCreate)
        .select();

      console.log('[Create Positions] Insert result - data:', data);
      console.log('[Create Positions] Insert result - error:', insertError);

      if (insertError) {
        console.error('[Create Positions] Full error object:', JSON.stringify(insertError, null, 2));
        throw insertError;
      }

      console.log('[Create Positions] Success! Created positions:', data);

      // Close modal and refresh
      setIsCreateModalOpen(false);
      setSeatRoles([{ id: '1', job_title: '', role_search: '', department: '', count: 1 }]);
      setRoleSearchTerms({});
      setShowRoleDropdown({});
      await fetchPositions();
      
      alert(`Successfully created ${seatsToCreate.length} position(s)`);
    } catch (error: any) {
      console.error('[Create Positions] CATCH block - Full error:', error);
      console.error('[Create Positions] Error type:', typeof error);
      console.error('[Create Positions] Error keys:', Object.keys(error || {}));
      const errorMessage = error?.message || error?.error_description || error?.hint || JSON.stringify(error);
      alert(`Failed to create positions: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  const totalSeatsToCreate = seatRoles.reduce((sum, role) => sum + role.count, 0);

  const toggleFilledStatus = async (seatId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('employee_seat_assignment')
        .update({ is_filled: !currentStatus })
        .eq('unique_seat_id', seatId);

      if (error) {
        console.error('Error updating filled status:', error);
        alert('Failed to update filled status. Please try again.');
      } else {
        // Update local state
        setPositions(positions.map(pos => 
          pos.unique_seat_id === seatId 
            ? { ...pos, is_filled: !currentStatus }
            : pos
        ));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const filteredPositions = positions.filter(position => {
    const matchesSearch = position.employee_job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         position.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         position.entity_platform_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'filled' && position.is_filled) ||
                         (statusFilter === 'vacant' && !position.is_filled);

    const matchesDepartment = departmentFilter === 'all' || 
                             position.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const stats = {
    total: positions.length,
    filled: positions.filter(p => p.is_filled).length,
    vacant: positions.filter(p => !p.is_filled).length,
    active: positions.filter(p => p.is_active).length,
  };

  return (
    <HRMSLayout header={headerProps} tabs={tabs}>
      {/* Positions List */}
      <ContentCard 
        title="All Positions"
        headerActions={
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="hrms-btn hrms-btn-primary"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Positions
          </button>
        }
      >
        {/* Filters */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, department, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="hrms-input w-full pl-10"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="hrms-input"
            >
              <option value="all">All Departments</option>
              {departments.length === 0 && (
                <option value="" disabled>Loading departments...</option>
              )}
              {departments.map((dept) => (
                <option key={dept.id} value={dept.department_name}>
                  {dept.department_name}
                </option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'filled' | 'vacant')}
              className="hrms-input"
            >
              <option value="all">All Positions</option>
              <option value="filled">Filled Only</option>
              <option value="vacant">Vacant Only</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading positions...</p>
          </div>
        ) : filteredPositions.length === 0 ? (
          <div className="p-12 text-center">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No positions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No positions available.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seat ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Open From
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPositions.map((position) => (
                  <tr key={position.unique_seat_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-mono text-gray-900">
                        {position.unique_seat_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {position.employee_job_title || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {position.employment_status}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{position.department || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{position.entity_platform_id || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 w-16">Vacant:</span>
                            <button
                              onClick={() => toggleFilledStatus(position.unique_seat_id, position.is_filled)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 ${
                                !position.is_filled ? 'bg-orange-500' : 'bg-gray-300'
                              }`}
                              title={position.is_filled ? 'Position is filled - Click to mark as vacant' : 'Position is vacant - Click to mark as filled'}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  !position.is_filled ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 w-16">Active:</span>
                            <button
                              onClick={() => toggleActiveStatus(position.unique_seat_id, position.is_active)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                                position.is_active ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                              title={position.is_active ? 'Position is active - Click to deactivate' : 'Position is inactive - Click to activate'}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  position.is_active ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {position.is_filled && position.employment_start_date 
                          ? formatDate(position.employment_start_date)
                          : position.is_filled 
                          ? 'N/A' 
                          : 'Open'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditPosition(position)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit position"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleDeletePosition(position)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete position"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredPositions.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredPositions.length} of {positions.length} positions
          </div>
        )}
      </ContentCard>

      {/* Create Positions Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Create Positions</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Debug info */}
              {platformRoles.length === 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  ⚠️ No platform roles loaded. Check console for errors. Total roles: {platformRoles.length}
                </div>
              )}
              
              {departments.length === 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  ℹ️ No departments loaded. Total departments: {departments.length}. EntityId: {entityId}
                </div>
              )}
              
              <div className="space-y-4">
                {seatRoles.map((role, index) => {
                  // Use role_search for filtering platform roles
                  const searchValue = role.role_search || '';
                  const filteredRoles = platformRoles.filter(pr =>
                    pr.role_name.toLowerCase().includes(searchValue.toLowerCase()) ||
                    pr.role_code.toLowerCase().includes(searchValue.toLowerCase())
                  );
                  
                  console.log('[Modal] Role dropdown state:', {
                    roleId: role.id,
                    jobTitle: role.job_title,
                    searchValue,
                    totalPlatformRoles: platformRoles.length,
                    filteredCount: filteredRoles.length,
                    showDropdown: showRoleDropdown[role.id],
                    hasPlatformRoleId: !!role.platform_role_id
                  });
                  
                  return (
                    <div key={role.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 space-y-4">
                        {/* Job Title Field - specific title for this position */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title *
                          </label>
                          <input
                            type="text"
                            value={role.job_title || ''}
                            onChange={(e) => updateSeatRole(role.id, 'job_title', e.target.value)}
                            placeholder="e.g., Senior Veterinarian, Head Nurse, etc."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        {/* Department Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Department *
                          </label>
                          <select
                            value={role.department || ''}
                            onChange={(e) => updateSeatRole(role.id, 'department', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select a department...</option>
                            {departments.length === 0 && (
                              <option value="" disabled>Loading departments...</option>
                            )}
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.department_name}>
                                {dept.department_name} ({dept.department_code})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Platform Role Selection - dropdown search */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Platform Role *
                            </label>
                            <input
                              type="text"
                              value={role.role_search || ''}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                updateSeatRole(role.id, 'role_search', newValue);
                                updateSeatRole(role.id, 'platform_role_id', ''); // Clear role ID when typing
                                setShowRoleDropdown({ ...showRoleDropdown, [role.id]: true });
                              }}
                              onFocus={() => setShowRoleDropdown({ ...showRoleDropdown, [role.id]: true })}
                              placeholder="Search for a platform role..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {showRoleDropdown[role.id] && filteredRoles.length > 0 && (
                              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredRoles.map((pr) => (
                                  <button
                                    key={pr.role_code}
                                    type="button"
                                    onMouseDown={(e) => {
                                      // Use onMouseDown instead of onClick to fire before onBlur
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('[Role Selection] Selected role:', pr.role_name, 'ID:', pr.id);
                                      updateSeatRole(role.id, 'role_search', pr.role_name);
                                      updateSeatRole(role.id, 'platform_role_id', pr.id);
                                      setShowRoleDropdown({ ...showRoleDropdown, [role.id]: false });
                                      console.log('[Role Selection] Dropdown closed, role should be set');
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="font-medium text-gray-900">{pr.role_name}</div>
                                    <div className="text-xs text-gray-500">{pr.role_code}</div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Count *
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={role.count}
                              onChange={(e) => updateSeatRole(role.id, 'count', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                      {seatRoles.length > 1 && (
                        <button
                          onClick={() => removeSeatRole(role.id)}
                          className="mt-7 text-red-500 hover:text-red-700"
                          title="Remove role"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={addSeatRole}
                className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Add Another Role
              </button>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Total positions to create: <span className="font-semibold text-gray-900">{totalSeatsToCreate}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  onClick={createSeats}
                  disabled={creating || totalSeatsToCreate === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>Create {totalSeatsToCreate} Position{totalSeatsToCreate !== 1 ? 's' : ''}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Position Modal */}
      {isEditModalOpen && editingPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingPosition.is_filled ? 'Manage Position & Employee' : 'Edit Position'}
                </h2>
                <p className="text-sm text-gray-600">ID: {editingPosition.unique_seat_id}</p>
                {editingPosition.is_filled && (
                  <p className="text-sm text-blue-600 font-medium">Position is currently filled</p>
                )}
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingPosition(null);
                }}
                className="text-gray-400 hover:text-gray-500 p-2"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {editingPosition.is_filled ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Employee Management Section */}
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-blue-800 mb-2">Employee Management</h3>
                      <p className="text-sm text-blue-700 mb-4">
                        This position is currently filled. Choose an action for the employee:
                      </p>
                      
                      <div className="space-y-3">
                        <button
                          onClick={() => handleReassignEmployee(editingPosition)}
                          className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                          Reassign to Another Position
                        </button>
                        
                        <button
                          onClick={() => handleEmployeeAttrition(editingPosition)}
                          className="w-full px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        >
                          Employee Attrition (Leaving Company)
                        </button>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-600">
                        <strong>Note:</strong> Employees must always be assigned to a position. Only use attrition when they're leaving the company.
                      </div>
                    </div>
                  </div>

                  {/* Position Details Section */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Position Details</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title *
                          </label>
                          <input
                            type="text"
                            value={editingPosition.employee_job_title || ''}
                            onChange={(e) => setEditingPosition({
                              ...editingPosition,
                              employee_job_title: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Department *
                          </label>
                          <select
                            value={editingPosition.department || ''}
                            onChange={(e) => setEditingPosition({
                              ...editingPosition,
                              department: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select a department...</option>
                            {departments.length === 0 ? (
                              <option value="" disabled>No departments available</option>
                            ) : (
                              departments.map((dept) => (
                                <option key={dept.id} value={dept.department_name}>
                                  {dept.department_name} ({dept.department_code})
                                </option>
                              ))
                            )}
                          </select>
                          {departments.length === 0 && (
                            <p className="mt-1 text-xs text-red-600">
                              No departments found. Please create departments first.
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hiring Priority
                          </label>
                          <select
                            value={editingPosition.employment_status || 'standard'}
                            onChange={(e) => setEditingPosition({
                              ...editingPosition,
                              employment_status: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="urgent">Urgent Hire</option>
                            <option value="high">High Priority</option>
                            <option value="standard">Standard Priority</option>
                            <option value="low">Low Priority</option>
                            <option value="on-hold">On Hold</option>
                          </select>
                          <p className="mt-1 text-xs text-gray-500">
                            Priority level for filling this position when vacant
                          </p>
                        </div>

                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingPosition.is_active}
                              onChange={(e) => setEditingPosition({
                                ...editingPosition,
                                is_active: e.target.checked
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-900">Active Position</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Vacant Position - Just Edit Details */
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-800">Position is Vacant</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Edit the position details below. To fill this position, go to Employee Records → Add Employee.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        value={editingPosition.employee_job_title || ''}
                        onChange={(e) => setEditingPosition({
                          ...editingPosition,
                          employee_job_title: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department *
                      </label>
                      <select
                        value={editingPosition.department || ''}
                        onChange={(e) => setEditingPosition({
                          ...editingPosition,
                          department: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a department...</option>
                        {departments.length === 0 ? (
                          <option value="" disabled>No departments available</option>
                        ) : (
                          departments.map((dept) => (
                            <option key={dept.id} value={dept.department_name}>
                              {dept.department_name} ({dept.department_code})
                            </option>
                          ))
                        )}
                      </select>
                      {departments.length === 0 && (
                        <p className="mt-1 text-xs text-red-600">
                          No departments found. Please create departments first.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hiring Priority
                      </label>
                      <select
                        value={editingPosition.employment_status || 'standard'}
                        onChange={(e) => setEditingPosition({
                          ...editingPosition,
                          employment_status: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="urgent">Urgent Hire</option>
                        <option value="high">High Priority</option>
                        <option value="standard">Standard Priority</option>
                        <option value="low">Low Priority</option>
                        <option value="on-hold">On Hold</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Priority level for filling this position when vacant
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingPosition.is_active}
                          onChange={(e) => setEditingPosition({
                            ...editingPosition,
                            is_active: e.target.checked
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-900">Active Position</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingPosition(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePosition}
                disabled={updating || !editingPosition.employee_job_title || !editingPosition.department}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Update Position'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Reassignment Modal */}
      {isReassignModalOpen && editingPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Reassign Employee</h2>
                <p className="text-sm text-gray-600">From: {editingPosition.employee_job_title}</p>
              </div>
              <button
                onClick={() => {
                  setIsReassignModalOpen(false);
                  setAvailablePositions([]);
                }}
                className="text-gray-400 hover:text-gray-500 p-2"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-800">Employee Reassignment</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Select a vacant position to reassign the employee to. The employee will be moved to the new position and their current position will become vacant.
                </p>
              </div>

              {availablePositions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No Available Positions</h3>
                  <p className="text-sm text-gray-500">
                    All positions are currently filled. Create new positions or wait for other positions to become vacant.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Available Positions ({availablePositions.length})
                  </h3>
                  
                  {availablePositions.map((position) => (
                    <div
                      key={position.unique_seat_id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleConfirmReassignment(position.unique_seat_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {position.employee_job_title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {position.department || 'No department'} • {position.employment_status}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            ID: {position.unique_seat_id}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsReassignModalOpen(false);
                  setAvailablePositions([]);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </HRMSLayout>
  );
}
