'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  UserPlusIcon, 
  BuildingOfficeIcon, 
  BriefcaseIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HRMSLayout, ContentCard } from '@/components/layout/HRMSLayout';
import { TabItem } from '@/types/layout';
import { createBrowserClient } from '@supabase/ssr';

const tabs: TabItem[] = [
  { name: 'Directory', href: '/employees', icon: UserGroupIcon },
  { name: 'Employee Records', href: '/employees/add', icon: UserPlusIcon },
  { name: 'Positions', href: '/employees/positions', icon: BriefcaseIcon },
  { name: 'Departments', href: '/employees/departments', icon: BuildingOfficeIcon },
];

const headerProps = {
  title: "Departments",
  subtitle: "Manage organizational departments and structure",
  breadcrumbs: [
    { name: 'Home', href: '/' },
    { name: 'Employees', href: '/employees' },
    { name: 'Departments' }
  ]
};

interface Department {
  id: string;
  entity_platform_id: string;
  department_name: string;
  department_code: string;
  description: string | null;
  manager_entity_employee_id: string | null;
  budget_code: string | null;
  cost_center: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employee_count?: number;
}

interface Employee {
  unique_seat_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    department_name: '',
    department_code: '',
    description: '',
    budget_code: '',
    cost_center: '',
    manager_entity_employee_id: ''
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [entityPlatformId, setEntityPlatformId] = useState<string | null>(null);
  const [currentUserEmployeeId, setCurrentUserEmployeeId] = useState<string | null>(null);



  useEffect(() => {
    console.log('[Departments] Component mounted, fetching entity...');
    fetchUserEntity();
  }, []);

  useEffect(() => {
    if (entityPlatformId) {
      console.log('[Departments] Fetching departments for entity:', entityPlatformId);
      fetchDepartments();
      fetchEmployees();
    }
  }, [entityPlatformId]);

  // Update form default manager when currentUserEmployeeId is available
  useEffect(() => {
    console.log('[Departments] useEffect triggered - currentUserEmployeeId:', currentUserEmployeeId, 'isEditModalOpen:', isEditModalOpen);
    if (currentUserEmployeeId && !isEditModalOpen) {
      console.log('[Departments] Setting default manager in form via useEffect');
      setFormData(prev => ({
        ...prev,
        manager_entity_employee_id: currentUserEmployeeId
      }));
    }
  }, [currentUserEmployeeId, isEditModalOpen]);

  const fetchUserEntity = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      
      if (!response.ok) {
        console.error('[Departments] Auth API failed:', response.status);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[Departments] Auth API returned non-JSON response');
        return;
      }

      const userData = await response.json();
      const userEntityId = userData.employee_entity_id || userData.entity_platform_id;
      if (userEntityId) {
        setEntityPlatformId(userEntityId);
        
        // Fetch current user's employee_id from employee_seat_assignment
        const { data: userEmployee } = await supabase
          .from('employee_seat_assignment')
          .select('employee_id')
          .eq('user_platform_id', userData.user_platform_id)
          .eq('entity_platform_id', userEntityId)
          .eq('is_active', true)
          .single();
        
        if (userEmployee?.employee_id) {
          console.log('[Departments] Setting current user employee ID:', userEmployee.employee_id);
          setCurrentUserEmployeeId(userEmployee.employee_id);
          // Set as default manager in form
          setFormData(prev => {
            const newFormData = {
              ...prev,
              manager_entity_employee_id: userEmployee.employee_id
            };
            console.log('[Departments] Updated form data with manager:', newFormData);
            return newFormData;
          });
        } else {
          console.log('[Departments] No employee found for user:', userData.user_platform_id);
        }
      }
    } catch (err) {
      console.error('[Departments] Failed to fetch user entity:', err);
    }
  };

  const fetchDepartments = async () => {
    if (!entityPlatformId) return;

    try {
      setLoading(true);
      console.log('[Departments] Fetching departments for entity:', entityPlatformId);

      // Direct Supabase call with anon key - RLS enforced
      const { data, error } = await supabase
        .from('entity_departments')
        .select('*')
        .eq('entity_platform_id', entityPlatformId)
        .order('department_name', { ascending: true });

      console.log('[Departments] Query result:', { count: data?.length, error });

      if (error) {
        console.error('[Departments] Error:', error);
        throw error;
      }

      // Get employee counts for each department
      const departmentsWithCounts = await Promise.all(
        (data || []).map(async (dept) => {
          const { count } = await supabase
            .from('employee_seat_assignment')
            .select('*', { count: 'exact', head: true })
            .eq('entity_platform_id', entityPlatformId)
            .eq('department', dept.department_name)
            .eq('is_active', true);

          return {
            ...dept,
            employee_count: count || 0
          };
        })
      );

      setDepartments(departmentsWithCounts);
    } catch (error) {
      console.error('[Departments] Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    console.log('[Departments] fetchEmployees called with entityPlatformId:', entityPlatformId);
    
    if (!entityPlatformId) {
      console.log('[Departments] No entityPlatformId, skipping employee fetch');
      return;
    }

    try {
      console.log('[Departments] Fetching employees for entity:', entityPlatformId);
      
      // Use the exact same query pattern that works in the main employee directory
      const { data: assignments, error: assignError } = await supabase
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
          assigned_at
        `)
        .eq('entity_platform_id', entityPlatformId)
        .eq('is_active', true)
        .eq('is_filled', true)
        .order('assigned_at', { ascending: false });

      if (assignError) {
        console.error('[Departments] Error fetching employee assignments:', assignError);
        setEmployees([]);
        return;
      }

      console.log('[Departments] Found employee assignments:', assignments?.length || 0);

      // Fetch profiles for all user_platform_ids
      const userPlatformIds = assignments?.map(a => a.user_platform_id).filter(Boolean) || [];
      
      let profilesMap = new Map();
      if (userPlatformIds.length > 0) {
        console.log(`[Departments] Fetching ${userPlatformIds.length} user profiles...`);
        const { data: profiles } = await supabase
          .from('profiles_with_auth')
          .select('user_platform_id, first_name, last_name, avatar_storage, phone')
          .in('user_platform_id', userPlatformIds);
        
        console.log(`[Departments] Found ${profiles?.length || 0} profiles`);
        
        profiles?.forEach((p: any) => profilesMap.set(p.user_platform_id, p));
      }

      // Transform to match expected Employee structure for the dropdowns
      const employeeData = assignments?.filter(a => a.user_platform_id).map((assignment: any) => {
        const profile = profilesMap.get(assignment.user_platform_id);
        
        return {
          unique_seat_id: assignment.id.toString(), // Use assignment id as unique_seat_id
          employee_id: assignment.id.toString(), // Use assignment id as employee_id for dropdowns
          first_name: profile?.first_name || 'Unknown',
          last_name: profile?.last_name || 'User'
        };
      }) || [];

      console.log('[Departments] Processed employees:', employeeData);
      setEmployees(employeeData);
      
    } catch (error) {
      console.error('[Departments] Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const handleCreateDepartment = async () => {
    console.log('[Departments] Creating department with form data:', formData);
    
    if (!formData.department_name || !formData.department_code) {
      alert('Please fill in department name and code');
      return;
    }

    if (!entityPlatformId) {
      alert('Entity information not loaded. Please refresh the page.');
      return;
    }

    try {
      setCreating(true);
      console.log('[Departments] Creating department...');

      // Direct Supabase call with anon key - RLS enforced
      const { data, error } = await supabase
        .from('entity_departments')
        .insert({
          entity_platform_id: entityPlatformId,
          department_name: formData.department_name,
          department_code: formData.department_code.toUpperCase(),
          description: formData.description || null,
          budget_code: formData.budget_code || null,
          cost_center: formData.cost_center || null,
          manager_entity_employee_id: formData.manager_entity_employee_id || null,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('[Departments] Error:', error);
        throw error;
      }

      console.log('[Departments] Department created:', data);
      alert('Department created successfully!');
      setIsCreateModalOpen(false);
      setFormData({
        department_name: '',
        department_code: '',
        description: '',
        budget_code: '',
        cost_center: '',
        manager_entity_employee_id: currentUserEmployeeId || ''
      });
      fetchDepartments();
    } catch (error: any) {
      console.error('[Departments] Error creating department:', error);
      alert(error.message || 'Failed to create department');
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      department_name: department.department_name,
      department_code: department.department_code,
      description: department.description || '',
      budget_code: department.budget_code || '',
      cost_center: department.cost_center || '',
      manager_entity_employee_id: department.manager_entity_employee_id || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment) return;
    
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('entity_departments')
        .update({
          department_name: formData.department_name,
          department_code: formData.department_code,
          description: formData.description || null,
          budget_code: formData.budget_code || null,
          cost_center: formData.cost_center || null,
          manager_entity_employee_id: formData.manager_entity_employee_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingDepartment.id);

      if (error) throw error;

      setIsEditModalOpen(false);
      setEditingDepartment(null);
      setFormData({
        department_name: '',
        department_code: '',
        description: '',
        budget_code: '',
        cost_center: '',
        manager_entity_employee_id: ''
      });
      fetchDepartments();
    } catch (error: any) {
      console.error('[Departments] Error updating department:', error);
      alert(error.message || 'Failed to update department');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = async (department: Department) => {
    // Check if department has employees
    if (department.employee_count && department.employee_count > 0) {
      alert(
        `Cannot delete department "${department.department_name}" because it has ${department.employee_count} employee(s) assigned. ` +
        `Please reassign or remove all employees from this department first.`
      );
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the department "${department.department_name}"?\n\n` +
      `This action cannot be undone. The department and all its associated data will be permanently removed.`
    );

    if (!confirmDelete) return;

    try {
      setUpdating(true);

      const { error } = await supabase
        .from('entity_departments')
        .delete()
        .eq('id', department.id);

      if (error) throw error;

      // Refresh departments list
      await fetchDepartments();
      
      alert(`Department "${department.department_name}" has been successfully deleted.`);
    } catch (error: any) {
      console.error('[Departments] Error deleting department:', error);
      alert(error.message || 'Failed to delete department');
    } finally {
      setUpdating(false);
    }
  };
  
  const filteredDepartments = departments.filter(dept =>
    dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.department_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <HRMSLayout header={headerProps} tabs={tabs}>
      {/* Entity Status Alert */}
      {!entityPlatformId && !loading && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Entity Not Assigned</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your account is not associated with an entity. Please contact your administrator to assign you to an entity before managing departments.
              </p>
            </div>
          </div>
        </div>
      )}

      <ContentCard 
        title="Department Management"
        headerActions={
          <button 
            onClick={() => {
              // Reset form with current user as default manager
              setFormData({
                department_name: '',
                department_code: '',
                description: '',
                budget_code: '',
                cost_center: '',
                manager_entity_employee_id: currentUserEmployeeId || ''
              });
              setIsCreateModalOpen(true);
            }}
            className="hrms-btn hrms-btn-primary"
            disabled={!entityPlatformId}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Department
          </button>
        }
      >
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading departments...</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria' : 'Click "Add Department" to create your first department'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employees
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Center
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDepartments.map((department) => (
                  <tr key={department.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-5 w-5 text-blue-500 mr-3 shrink-0" />
                        <div className="text-sm font-medium text-gray-900">
                          {department.department_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{department.department_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {department.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {department.manager_entity_employee_id ? (() => {
                          const manager = employees.find(emp => emp.employee_id === department.manager_entity_employee_id);
                          return manager 
                            ? `${manager.first_name} ${manager.last_name}`
                            : `${department.manager_entity_employee_id} (Not Found)`;
                        })() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{department.employee_count || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{department.budget_code || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{department.cost_center || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        department.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {department.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleEditClick(department)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit department"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteClick(department)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete department"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ContentCard>

      {/* Create Department Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Department</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateDepartment();
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                  className="hrms-input w-full"
                  placeholder="e.g., Veterinary Services"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Code *
                </label>
                <input
                  type="text"
                  value={formData.department_code}
                  onChange={(e) => setFormData({ ...formData, department_code: e.target.value.toUpperCase() })}
                  className="hrms-input w-full"
                  placeholder="e.g., VET-SRVS"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="hrms-input w-full"
                  rows={3}
                  placeholder="Brief description of the department"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Manager
                </label>
                <select
                  value={formData.manager_entity_employee_id}
                  onChange={(e) => setFormData({ ...formData, manager_entity_employee_id: e.target.value })}
                  className="hrms-input w-full"
                >
                  <option value="">-- Select Manager (Optional) --</option>
                  {employees.map((emp) => (
                    <option key={emp.unique_seat_id} value={emp.employee_id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Code
                  </label>
                  <input
                    type="text"
                    value={formData.budget_code}
                    onChange={(e) => setFormData({ ...formData, budget_code: e.target.value })}
                    className="hrms-input w-full"
                    placeholder="e.g., BUD-VET-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Center
                  </label>
                  <input
                    type="text"
                    value={formData.cost_center}
                    onChange={(e) => setFormData({ ...formData, cost_center: e.target.value })}
                    className="hrms-input w-full"
                    placeholder="e.g., CC-1001"
                  />
                </div>
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="hrms-btn hrms-btn-secondary"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateDepartment}
                className="hrms-btn hrms-btn-primary"
                disabled={creating || !formData.department_name || !formData.department_code}
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Department'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {isEditModalOpen && editingDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Department</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingDepartment(null);
                }}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateDepartment();
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                  className="hrms-input w-full"
                  placeholder="e.g., Veterinary Services"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Code *
                </label>
                <input
                  type="text"
                  value={formData.department_code}
                  onChange={(e) => setFormData({ ...formData, department_code: e.target.value.toUpperCase() })}
                  className="hrms-input w-full"
                  placeholder="e.g., VET-SRVS"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="hrms-input w-full"
                  rows={3}
                  placeholder="Brief description of the department"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Manager
                </label>
                <select
                  value={formData.manager_entity_employee_id}
                  onChange={(e) => setFormData({ ...formData, manager_entity_employee_id: e.target.value })}
                  className="hrms-input w-full"
                >
                  <option value="">-- Select Manager (Optional) --</option>
                  {employees.map((emp) => (
                    <option key={emp.unique_seat_id} value={emp.employee_id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Code
                  </label>
                  <input
                    type="text"
                    value={formData.budget_code}
                    onChange={(e) => setFormData({ ...formData, budget_code: e.target.value })}
                    className="hrms-input w-full"
                    placeholder="e.g., BUD-VET-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Center
                  </label>
                  <input
                    type="text"
                    value={formData.cost_center}
                    onChange={(e) => setFormData({ ...formData, cost_center: e.target.value })}
                    className="hrms-input w-full"
                    placeholder="e.g., CC-1001"
                  />
                </div>
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingDepartment(null);
                }}
                className="hrms-btn hrms-btn-secondary"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateDepartment}
                className="hrms-btn hrms-btn-primary"
                disabled={updating || !formData.department_name || !formData.department_code}
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Department'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </HRMSLayout>
  );
}
