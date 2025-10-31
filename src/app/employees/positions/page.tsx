'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  BriefcaseIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, formatDate } from '@/lib/utils';

const tabs = [
  { name: 'Directory', href: '/employees' },
  { name: 'Add Employee', href: '/employees/add' },
  { name: 'Departments', href: '/employees/departments' },
  { name: 'Positions', href: '/employees/positions' },
];

interface Position {
  unique_seat_id: string;
  employee_job_title: string;
  department: string;
  employment_status: string;
  is_filled: boolean;
  is_active: boolean;
  user_platform_id: string | null;
  employee_entity_id: string | null;
  salary: number | null;
  salary_currency: string | null;
  employment_start_date: string | null;
}

interface SeatRole {
  id: string;
  job_title: string;
  count: number;
}

interface PlatformRole {
  role_code: string;
  role_name: string;
  id: string;
}

export default function PositionsPage() {
  const pathname = usePathname();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'filled' | 'vacant'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [seatRoles, setSeatRoles] = useState<SeatRole[]>([
    { id: '1', job_title: '', count: 1 }
  ]);
  const [creating, setCreating] = useState(false);
  const [platformRoles, setPlatformRoles] = useState<PlatformRole[]>([]);
  const [roleSearchTerms, setRoleSearchTerms] = useState<Record<string, string>>({});
  const [showRoleDropdown, setShowRoleDropdown] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPositions();
    fetchPlatformRoles();
  }, []);

  const fetchPlatformRoles = async () => {
    try {
      console.log('[Positions] Fetching platform roles...');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('platform_roles')
        .select('id, role_name, display_name')
        .order('role_name');

      console.log('[Positions] Platform roles result:', { 
        count: data?.length, 
        error: error?.message,
        data: data?.slice(0, 3) // Show first 3 for debugging
      });

      if (error) {
        console.error('[Positions] Error details:', error);
        alert(`Failed to load job roles: ${error.message}`);
        throw error;
      }
      
      // Map to include role_code as id for compatibility
      const rolesWithCode = data?.map(role => ({
        role_code: role.id,
        role_name: role.display_name || role.role_name,
        id: role.id
      })) || [];
      
      setPlatformRoles(rolesWithCode);
      console.log('[Positions] Platform roles loaded:', rolesWithCode.length);
    } catch (error) {
      console.error('[Positions] Exception fetching platform roles:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('employee_seat_assignment')
        .select('unique_seat_id, employee_job_title, department, employment_status, is_filled, is_active, user_platform_id, employee_entity_id, salary, salary_currency, employment_start_date')
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
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

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
      count: 1 
    }]);
  };

  const removeSeatRole = (id: string) => {
    if (seatRoles.length > 1) {
      setSeatRoles(seatRoles.filter(role => role.id !== id));
    }
  };

  const updateSeatRole = (id: string, field: keyof SeatRole, value: string | number) => {
    setSeatRoles(seatRoles.map(role => 
      role.id === id ? { ...role, [field]: value } : role
    ));
  };

  const generateSeatId = (entityId: string, index: number) => {
    // Generate 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomPart = Array.from({ length: 6 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
    return `${entityId}.${randomPart}`;
  };

  const createSeats = async () => {
    try {
      setCreating(true);
      
      // Validate all roles
      const invalidRoles = seatRoles.filter(role => 
        !role.job_title.trim() || role.count < 1
      );
      
      if (invalidRoles.length > 0) {
        alert('Please select a job role and ensure count is at least 1');
        return;
      }

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get current user's entity_platform_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: seatData, error: seatError } = await supabase
        .from('employee_seat_assignment')
        .select('employee_entity_id')
        .eq('user_platform_id', user.id)
        .single();

      if (seatError || !seatData) throw new Error('Could not find entity ID');

      const entityId = seatData.employee_entity_id;

      // Generate all seat records
      const seatsToCreate = seatRoles.flatMap(role => 
        Array.from({ length: role.count }, (_, index) => ({
          unique_seat_id: generateSeatId(entityId, index),
          employee_job_title: role.job_title,
          department: null,
          employment_status: 'open',
          is_filled: false,
          is_active: true,
          employee_entity_id: entityId,
          user_platform_id: null,
          salary: null,
          salary_currency: null,
          employment_start_date: null
        }))
      );

      const { error: insertError } = await supabase
        .from('employee_seat_assignment')
        .insert(seatsToCreate);

      if (insertError) throw insertError;

      // Close modal and refresh
      setIsCreateModalOpen(false);
      setSeatRoles([{ id: '1', job_title: '', count: 1 }]);
      setRoleSearchTerms({});
      setShowRoleDropdown({});
      await fetchPositions();
      
      alert(`Successfully created ${seatsToCreate.length} position(s)`);
    } catch (error) {
      console.error('Error creating seats:', error);
      alert('Failed to create positions');
    } finally {
      setCreating(false);
    }
  };

  const totalSeatsToCreate = seatRoles.reduce((sum, role) => sum + role.count, 0);

  const toggleFilledStatus = async (seatId: string, currentStatus: boolean) => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

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
                         position.employee_entity_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'filled' && position.is_filled) ||
                         (statusFilter === 'vacant' && !position.is_filled);
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: positions.length,
    filled: positions.filter(p => p.is_filled).length,
    vacant: positions.filter(p => !p.is_filled).length,
    active: positions.filter(p => p.is_active).length,
  };

  return (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BriefcaseIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Positions</h1>
              <p className="text-gray-600">Manage employee positions and assignments</p>
            </div>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Positions
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Positions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <BriefcaseIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Filled Positions</p>
              <p className="text-2xl font-bold text-green-600">{stats.filled}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Vacant Positions</p>
              <p className="text-2xl font-bold text-orange-600">{stats.vacant}</p>
            </div>
            <XCircleIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-purple-600">{stats.active}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, department, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'filled' | 'vacant')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Positions</option>
            <option value="filled">Filled Only</option>
            <option value="vacant">Vacant Only</option>
          </select>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                      <div className="text-sm text-gray-900">{position.employee_entity_id || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 w-12">Open:</span>
                            <button
                              onClick={() => toggleFilledStatus(position.unique_seat_id, position.is_filled)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 ${
                                !position.is_filled ? 'bg-orange-500' : 'bg-gray-300'
                              }`}
                              title={position.is_filled ? 'Filled - Click to mark as open' : 'Open - Click to mark as filled'}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  !position.is_filled ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 w-12">Active:</span>
                            <button
                              onClick={() => toggleActiveStatus(position.unique_seat_id, position.is_active)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                                position.is_active ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                              title={position.is_active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Count */}
      {!loading && filteredPositions.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {filteredPositions.length} of {positions.length} positions
        </div>
      )}

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
              
              <div className="space-y-4">
                {seatRoles.map((role, index) => {
                  const searchTerm = roleSearchTerms[role.id] || '';
                  const filteredRoles = platformRoles.filter(pr =>
                    pr.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    pr.role_code.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  
                  console.log('[Modal] Role dropdown state:', {
                    roleId: role.id,
                    searchTerm,
                    totalPlatformRoles: platformRoles.length,
                    filteredCount: filteredRoles.length,
                    showDropdown: showRoleDropdown[role.id],
                    selectedJobTitle: role.job_title
                  });
                  
                  return (
                    <div key={role.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Job Role *
                          </label>
                          <input
                            type="text"
                            value={role.job_title || roleSearchTerms[role.id] || ''}
                            onChange={(e) => {
                              setRoleSearchTerms({ ...roleSearchTerms, [role.id]: e.target.value });
                              setShowRoleDropdown({ ...showRoleDropdown, [role.id]: true });
                              if (!e.target.value) {
                                updateSeatRole(role.id, 'job_title', '');
                              }
                            }}
                            onFocus={() => setShowRoleDropdown({ ...showRoleDropdown, [role.id]: true })}
                            placeholder="Search for a role..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {showRoleDropdown[role.id] && filteredRoles.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {filteredRoles.map((pr) => (
                                <button
                                  key={pr.role_code}
                                  type="button"
                                  onClick={() => {
                                    updateSeatRole(role.id, 'job_title', pr.role_name);
                                    setRoleSearchTerms({ ...roleSearchTerms, [role.id]: '' });
                                    setShowRoleDropdown({ ...showRoleDropdown, [role.id]: false });
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
    </div>
  );
}
