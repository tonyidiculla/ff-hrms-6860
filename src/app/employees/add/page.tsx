'use client';

import { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  UserPlusIcon, 
  BuildingOfficeIcon, 
  BriefcaseIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HRMSLayout, ContentCard } from '@/components/layout/HRMSLayout';
import { TabItem } from '@/types/layout';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createBrowserClient } from '@supabase/ssr';

const tabs: TabItem[] = [
  { 
    name: 'Directory', 
    href: '/employees',
    icon: UserGroupIcon
  },
  { 
    name: 'Employee Records', 
    href: '/employees/add',
    icon: UserPlusIcon
  },
  { 
    name: 'Positions', 
    href: '/employees/positions',
    icon: BriefcaseIcon
  },
  { 
    name: 'Departments', 
    href: '/employees/departments',
    icon: BuildingOfficeIcon
  },
];

interface EmployeeDocument {
  id: string;
  label: string;
  fileName: string;
  file?: File;
  url?: string;
  uploading?: boolean;
}

export default function EmployeeRecordsPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityId, setEntityId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const [employeeDocs, setEmployeeDocs] = useState<EmployeeDocument[]>([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [availableSeats, setAvailableSeats] = useState<any[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchUserEntity();
  }, []);

  const fetchUserEntity = async () => {
    try {
      const response = await fetch('/api/auth/me');
      
      if (!response.ok) {
        setError('Failed to fetch user information');
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setError('Authentication service returned invalid response');
        return;
      }

      const userData = await response.json();
      const userEntityId = userData.employee_entity_id || userData.entity_platform_id;
      
      if (userEntityId) {
        setEntityId(userEntityId);
      } else {
        setError('No entity assignment found for this user');
      }
    } catch (err) {
      console.error('[Employee Records] Auth error:', err);
      setError('Failed to authenticate user');
    }
  };

  useEffect(() => {
    if (entityId) {
      fetchEmployees();
    }
  }, [entityId]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employees?entity_id=${entityId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch employees');
      }

      const data = await response.json();
      setEmployees(data.employees || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSeats = async () => {
    if (!entityId) return;
    
    try {
      const { data, error } = await supabase
        .from('employee_seat_assignment')
        .select('unique_seat_id, employee_job_title, department')
        .eq('entity_platform_id', entityId)
        .eq('is_filled', false)
        .eq('is_active', true)
        .order('employee_job_title', { ascending: true });

      if (error) throw error;
      setAvailableSeats(data || []);
    } catch (error: any) {
      console.error('Error fetching available seats:', error);
    }
  };

  const handleAddNewClick = async () => {
    // Fetch available seats first
    await fetchAvailableSeats();
    
    // Create a new empty employee object
    setEditingEmployee({
      unique_seat_id: '', // User must select an available seat
      employee_id: '', // Will be generated on save
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      employee_job_title: '',
      department: '',
      date_of_joining: '',
      qualification: '',
      salary: null,
      employment_status: 'active',
      entity_platform_id: entityId,
    });
    setEmployeeDocs([]); // Clear any existing docs
    setIsEditModalOpen(true);
  };

  const handleEditClick = async (employee: any) => {
    // Fetch available seats for position change
    await fetchAvailableSeats();
    
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
    // Load existing employee documents
    await fetchEmployeeDocs(employee.employee_id);
  };

  const fetchEmployeeDocs = async (employeeId: string) => {
    if (!entityId) return;
    
    try {
      const folderPath = `${entityId}/employees/${employeeId}`;
      const { data: files, error } = await supabase.storage
        .from('entities')
        .list(folderPath, {
          limit: 100,
          offset: 0,
        });

      if (error) throw error;

      if (files && files.length > 0) {
        const docs: EmployeeDocument[] = files.map(file => {
          // Extract label from filename (format: label_originalname.ext)
          const nameParts = file.name.split('_');
          const label = nameParts.length > 1 ? nameParts[0] : 'Document';
          const fileName = nameParts.length > 1 ? nameParts.slice(1).join('_') : file.name;
          
          return {
            id: file.id,
            label: label,
            fileName: fileName,
            url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/entities/${folderPath}/${file.name}`
          };
        });
        setEmployeeDocs(docs);
      } else {
        setEmployeeDocs([]);
      }
    } catch (error) {
      console.error('Error fetching employee docs:', error);
      setEmployeeDocs([]);
    }
  };

  const addDocumentRow = () => {
    setEmployeeDocs([
      ...employeeDocs,
      {
        id: `new-${Date.now()}`,
        label: '',
        fileName: '',
      }
    ]);
  };

  const removeDocumentRow = (id: string) => {
    setEmployeeDocs(employeeDocs.filter(doc => doc.id !== id));
  };

    const handleFileSelect = (id: string, file: File | null) => {
    if (!file) return;
    setEmployeeDocs(prev => prev.map(doc =>
      doc.id === id ? { ...doc, file, fileName: file.name } : doc
    ));
  };

    const handleLabelChange = (id: string, label: string) => {
    setEmployeeDocs(prev => prev.map(doc =>
      doc.id === id ? { ...doc, label } : doc
    ));
  };

  const uploadDocument = async (doc: EmployeeDocument) => {
    if (!doc.file || !editingEmployee || !entityId || !doc.label.trim()) {
      throw new Error('Missing required fields: label and file are required');
    }

    try {
      // Create filename with label prefix: label_originalfilename.ext
      const sanitizedLabel = doc.label.trim().replace(/[^a-zA-Z0-9-_]/g, '_');
      const prefixedFileName = `${sanitizedLabel}_${doc.file.name}`;
      
      const folderPath = `${entityId}/employees/${editingEmployee.employee_id}`;
      const filePath = `${folderPath}/${prefixedFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('entities')
        .upload(filePath, doc.file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      return {
        ...doc,
        fileName: prefixedFileName,
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/entities/${filePath}`,
        file: undefined
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  const handleUploadAllDocuments = async () => {
    const docsToUpload = employeeDocs.filter(doc => doc.file && !doc.url);
    
    // Validate all documents have labels
    const missingLabels = docsToUpload.filter(doc => !doc.label || doc.label.trim() === '');
    if (missingLabels.length > 0) {
      alert('Please provide labels for all documents before uploading.');
      return;
    }

    if (docsToUpload.length === 0) {
      alert('No documents to upload.');
      return;
    }

    setUploadingDocs(true);
    try {
      await Promise.all(docsToUpload.map(doc => uploadDocument(doc)));
      alert('All documents uploaded successfully!');
      
      // Refresh the documents list
      if (editingEmployee?.employee_id) {
        await fetchEmployeeDocs(editingEmployee.employee_id);
      }
    } catch (error) {
      alert('Error uploading some documents. Please try again.');
    } finally {
      setUploadingDocs(false);
    }
  };

  const deleteDocument = async (doc: EmployeeDocument) => {
    if (!editingEmployee || !doc.url || !entityId) return;
    
    if (!confirm(`Are you sure you want to delete ${doc.label}?`)) return;

    try {
      const folderPath = `${entityId}/employees/${editingEmployee.employee_id}`;
      // Extract the actual filename from the URL or use fileName
      const filename = doc.fileName;
      const filePath = `${folderPath}/${filename}`;

      const { error } = await supabase.storage
        .from('entities')
        .remove([filePath]);

      if (error) throw error;

      await fetchEmployeeDocs(editingEmployee.employee_id);
      alert('Document deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document: ' + error.message);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;
    
    // Validation
    if (!editingEmployee.unique_seat_id) {
      alert('Please select a position for this employee');
      return;
    }
    
    if (!editingEmployee.first_name || !editingEmployee.last_name) {
      alert('Please provide at least first name and last name');
      return;
    }
    
    try {
      setUpdating(true);
      
      // Check if this is a new employee or position change
      const isNewEmployee = !editingEmployee.employee_id;
      const originalSeatId = employees.find(e => e.employee_id === editingEmployee.employee_id)?.unique_seat_id;
      const isPositionChange = !isNewEmployee && originalSeatId && originalSeatId !== editingEmployee.unique_seat_id;
      
      // Generate employee_id if this is a new employee
      const employeeId = editingEmployee.employee_id || `EMP-${Date.now()}`;
      
      // If position is changing, mark the old seat as vacant first
      if (isPositionChange) {
        // Clear employee data from old seat - is_filled will automatically become false via DEFAULT
        const { error: vacateError } = await supabase
          .from('employee_seat_assignment')
          .update({
            user_platform_id: null,
            employee_email: null,
            employee_contact: null,
            employment_status: null,
            employment_start_date: null,
          })
          .eq('unique_seat_id', originalSeatId);
        
        if (vacateError) {
          console.error('Error vacating old seat:', vacateError);
          throw new Error('Failed to vacate old position');
        }
      }
      
      // Update the new/current seat with employee data
      // Note: is_filled is updated via database trigger/function when user_platform_id is set
      const { error } = await supabase
        .from('employee_seat_assignment')
        .update({
          user_platform_id: employeeId,
          employee_email: editingEmployee.email,
          employee_contact: editingEmployee.phone,
          employment_status: editingEmployee.employment_status || 'active',
          employment_start_date: editingEmployee.date_of_joining || new Date().toISOString(),
        })
        .eq('unique_seat_id', editingEmployee.unique_seat_id);

      if (error) throw error;

      setIsEditModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
      
      if (isPositionChange) {
        alert('Employee position changed successfully!');
      } else if (isNewEmployee) {
        alert('Employee added successfully!');
      } else {
        alert('Employee updated successfully!');
      }
    } catch (error: any) {
      console.error('[Employee Records] Error updating employee:', error);
      alert(error.message || 'Failed to update employee');
    } finally {
      setUpdating(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    searchTerm === '' || 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headerActions = (
    <button 
      className="hrms-btn hrms-btn-primary"
      onClick={handleAddNewClick}
    >
      <PlusIcon className="h-4 w-4 mr-2" />
      Add New Employee
    </button>
  );

  return (
    <HRMSLayout
      header={{
        title: 'Employee Records',
        subtitle: 'View detailed employee information including salary, qualifications, and more',
        actions: headerActions,
        breadcrumbs: [
          { name: 'HRMS', href: '/' },
          { name: 'Employees', href: '/employees' },
          { name: 'Employee Records' },
        ],
      }}
      tabs={tabs}
    >
      {/* Employee List */}
      <ContentCard title="Employee Records">
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading employees...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No employees match your search criteria.' : 'No employees have been assigned to this entity yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date of Joining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qualification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                              {employee.first_name?.[0]}{employee.last_name?.[0]}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.employee_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                          <span className="break-all">{employee.email || 'N/A'}</span>
                        </div>
                        {employee.phone && (
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            {employee.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.job_title || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{employee.department || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.qualification || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.salary ? `$${Number(employee.salary).toLocaleString()}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEditClick(employee)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ContentCard>

      {/* Edit Employee Modal */}
      {isEditModalOpen && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Employee</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingEmployee(null);
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
                handleUpdateEmployee();
              }}
              className="p-6 space-y-4"
            >
              {/* Seat Selection - Show for both new and existing employees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {editingEmployee.employee_id ? 'Change Position' : 'Select Position'} *
                </label>
                <select
                  value={editingEmployee.unique_seat_id}
                  onChange={(e) => {
                    const selectedSeat = availableSeats.find(s => s.unique_seat_id === e.target.value);
                    setEditingEmployee({ 
                      ...editingEmployee, 
                      unique_seat_id: e.target.value,
                      employee_job_title: selectedSeat?.employee_job_title || editingEmployee.employee_job_title,
                      department: selectedSeat?.department || editingEmployee.department,
                    });
                  }}
                  className="hrms-input w-full"
                  required
                >
                  {editingEmployee.employee_id ? (
                    <>
                      {/* Show current position first for existing employees */}
                      <option value={editingEmployee.unique_seat_id}>
                        {editingEmployee.unique_seat_id} - {editingEmployee.employee_job_title} ({editingEmployee.department}) - Current
                      </option>
                      {availableSeats.length > 0 && (
                        <option disabled>──────────</option>
                      )}
                      {availableSeats.map(seat => (
                        <option key={seat.unique_seat_id} value={seat.unique_seat_id}>
                          {seat.unique_seat_id} - {seat.employee_job_title} ({seat.department})
                        </option>
                      ))}
                    </>
                  ) : (
                    <>
                      <option value="">-- Select an available position --</option>
                      {availableSeats.map(seat => (
                        <option key={seat.unique_seat_id} value={seat.unique_seat_id}>
                          {seat.unique_seat_id} - {seat.employee_job_title} ({seat.department})
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {!editingEmployee.employee_id && availableSeats.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    No available positions. Please create positions first in the Positions tab.
                  </p>
                )}
                {editingEmployee.employee_id && availableSeats.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No other vacant positions available. Employee will remain in current position.
                  </p>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={editingEmployee.first_name}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, first_name: e.target.value })}
                    className="hrms-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={editingEmployee.last_name}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, last_name: e.target.value })}
                    className="hrms-input w-full"
                    required
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingEmployee.email || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    className="hrms-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editingEmployee.phone || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                    className="hrms-input w-full"
                  />
                </div>
              </div>

              {/* Department and Job Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editingEmployee.department || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                    className="hrms-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={editingEmployee.employee_job_title || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, employee_job_title: e.target.value })}
                    className="hrms-input w-full"
                  />
                </div>
              </div>

              {/* Date of Joining and Qualification */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    value={editingEmployee.date_of_joining || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, date_of_joining: e.target.value })}
                    className="hrms-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={editingEmployee.qualification || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, qualification: e.target.value })}
                    className="hrms-input w-full"
                  />
                </div>
              </div>

              {/* Salary and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary
                  </label>
                  <input
                    type="number"
                    value={editingEmployee.salary || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, salary: e.target.value })}
                    className="hrms-input w-full"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editingEmployee.employment_status || 'active'}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, employment_status: e.target.value })}
                    className="hrms-input w-full"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>

              {/* Employee Documentation Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Documentation</h3>
                  <button
                    type="button"
                    onClick={addDocumentRow}
                    className="hrms-btn hrms-btn-secondary text-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Document
                  </button>
                </div>

                <div className="space-y-3">
                  {employeeDocs.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No documents uploaded yet. Click "Add Document" to upload.
                    </p>
                  ) : (
                    employeeDocs.map((doc) => (
                      <div key={doc.id} className="flex flex-col gap-2 p-3 border border-gray-200 rounded-lg">
                        {doc.url ? (
                          // Existing document
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 mb-1">{doc.label}</div>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                {doc.fileName}
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteDocument(doc)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          // New document to upload
                          <>
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                value={doc.label}
                                onChange={(e) => handleLabelChange(doc.id, e.target.value)}
                                placeholder="Document Label (e.g., Degree, Certificate)"
                                className="flex-1 hrms-input text-sm"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => removeDocumentRow(doc.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                            <input
                              type="file"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileSelect(doc.id, e.target.files[0]);
                                }
                              }}
                              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              required
                            />
                            {doc.fileName && (
                              <span className="text-xs text-gray-600">Selected: {doc.fileName}</span>
                            )}
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {employeeDocs.some(doc => doc.file) && (
                  <button
                    type="button"
                    onClick={handleUploadAllDocuments}
                    disabled={uploadingDocs}
                    className="mt-4 hrms-btn hrms-btn-primary w-full"
                  >
                    {uploadingDocs ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      'Upload Documents'
                    )}
                  </button>
                )}
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingEmployee(null);
                }}
                className="hrms-btn hrms-btn-secondary"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateEmployee}
                className="hrms-btn hrms-btn-primary"
                disabled={updating || !editingEmployee.first_name || !editingEmployee.last_name}
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Employee'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </HRMSLayout>
  );
}
