'use client';

import { useState } from 'react';
import {
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CalendarDaysIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HRMSLayout, ContentCard, MetricsGrid } from '@/components/layout/HRMSLayout';
import { MetricCard } from '@/components/ui/MetricCard';
import { TabItem } from '@/types/layout';

const tabs: TabItem[] = [
  { 
    name: 'Schedule Overview', 
    href: '/rostering',
    icon: CalendarIcon
  },
  { 
    name: 'Employee Requests', 
    href: '/rostering/requests',
    icon: ArrowsRightLeftIcon
  },
  { 
    name: 'Shift Templates', 
    href: '/rostering/templates',
    icon: DocumentTextIcon
  },
  { 
    name: 'Settings', 
    href: '/rostering/settings',
    icon: CogIcon
  },
];

const headerProps = {
  title: "Shift Templates",
  subtitle: "Create and manage reusable shift patterns and weekly templates for efficient scheduling",
  breadcrumbs: [
    { name: 'HRMS', href: '/' },
    { name: 'Rostering', href: '/rostering' },
    { name: 'Shift Templates' }
  ]
};

export default function ShiftTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Standard Veterinarian - Day Shift',
      category: 'veterinarian',
      duration: '8 hours',
      startTime: '08:00',
      endTime: '16:00',
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      breakTime: '1 hour',
      requiredStaff: 2,
      description: 'Standard day shift for veterinarians covering routine appointments and surgeries',
      isActive: true,
      usageCount: 15,
      createdDate: '2025-10-15'
    },
    {
      id: 2,
      name: 'Emergency Night Coverage',
      category: 'emergency',
      duration: '12 hours',
      startTime: '20:00',
      endTime: '08:00',
      daysOfWeek: ['Friday', 'Saturday', 'Sunday'],
      breakTime: '2 hours',
      requiredStaff: 1,
      description: 'Overnight emergency coverage for weekends and holidays',
      isActive: true,
      usageCount: 8,
      createdDate: '2025-09-20'
    },
    {
      id: 3,
      name: 'Receptionist - Morning',
      category: 'administration',
      duration: '8 hours',
      startTime: '07:30',
      endTime: '15:30',
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      breakTime: '1 hour',
      requiredStaff: 2,
      description: 'Morning reception coverage for peak appointment hours',
      isActive: true,
      usageCount: 22,
      createdDate: '2025-08-10'
    },
    {
      id: 4,
      name: 'Vet Tech - Flexible Hours',
      category: 'technician',
      duration: '6 hours',
      startTime: '09:00',
      endTime: '15:00',
      daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
      breakTime: '30 minutes',
      requiredStaff: 3,
      description: 'Flexible part-time schedule for veterinary technicians',
      isActive: false,
      usageCount: 5,
      createdDate: '2025-07-25'
    },
    {
      id: 5,
      name: 'Weekend Surgery Team',
      category: 'veterinarian',
      duration: '10 hours',
      startTime: '08:00',
      endTime: '18:00',
      daysOfWeek: ['Saturday'],
      breakTime: '1.5 hours',
      requiredStaff: 4,
      description: 'Dedicated weekend surgical team for elective procedures',
      isActive: true,
      usageCount: 12,
      createdDate: '2025-09-05'
    }
  ]);

  // Handler functions for template management
  const handleNewTemplate = () => {
    console.log('Creating new template...');
    // Navigate to template creation form or open modal
  };

  const handleImportTemplate = () => {
    console.log('Importing template...');
    // Open file import dialog or navigate to import page
  };

  const handleViewTemplate = (templateId: number) => {
    console.log('Viewing template:', templateId);
    // Navigate to template details view
  };

  const handleEditTemplate = (templateId: number) => {
    console.log('Editing template:', templateId);
    // Navigate to template edit form
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Open edit modal or navigate to edit page
    }
  };

  const handleDuplicateTemplate = (templateId: number) => {
    console.log('Duplicating template:', templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newTemplate = {
        ...template,
        id: Date.now(), // Generate new numeric ID
        name: `${template.name} (Copy)`,
        usageCount: 0,
        createdDate: new Date().toISOString()
      };
      setTemplates([...templates, newTemplate]);
    }
  };

  const handleDeleteTemplate = (templateId: number) => {
    console.log('Deleting template:', templateId);
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  // Quick Actions handlers
  const handleDuplicateExisting = () => {
    console.log('Selecting template to duplicate...');
    // Show modal with template selection
  };

  const handleQuickTemplate = () => {
    console.log('Creating quick template with defaults...');
    // Generate template with smart defaults
  };

  const handleRoleBasedTemplate = () => {
    console.log('Creating role-based template...');
    // Navigate to role-based template creation
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'veterinarian': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'technician': return 'bg-green-100 text-green-800 border-green-200';
      case 'administration': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'veterinarian': return 'Veterinarian';
      case 'technician': return 'Technician';
      case 'administration': return 'Administration';
      case 'emergency': return 'Emergency';
      default: return 'Other';
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (selectedCategory === 'all') return true;
    return template.category === selectedCategory;
  });

  const templateStats = {
    total: templates.length,
    active: templates.filter(t => t.isActive).length,
    mostUsed: Math.max(...templates.map(t => t.usageCount)),
    categories: [...new Set(templates.map(t => t.category))].length
  };

  return (
    <HRMSLayout header={headerProps} tabs={tabs}>
      {/* Template Metrics */}
      <MetricsGrid>
        <MetricCard
          title="Total Templates"
          value={templateStats.total.toString()}
          trend={{ direction: 'up', value: 2 }}
          icon={DocumentTextIcon}
          color="blue"
        />
        <MetricCard
          title="Active Templates"
          value={templateStats.active.toString()}
          trend={{ direction: 'up', value: 1 }}
          icon={CalendarIcon}
          color="green"
        />
        <MetricCard
          title="Categories"
          value={templateStats.categories.toString()}
          trend={{ direction: 'up', value: 0 }}
          icon={UserGroupIcon}
          color="purple"
        />
        <MetricCard
          title="Most Used"
          value={templateStats.mostUsed.toString()}
          trend={{ direction: 'up', value: 3 }}
          icon={DocumentDuplicateIcon}
          color="yellow"
        />
      </MetricsGrid>

      {/* Template Management */}
      <ContentCard 
        title="Shift Templates"
        headerActions={
          <div className="flex gap-3">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="hrms-input text-sm"
            >
              <option value="all">All Categories</option>
              <option value="veterinarian">Veterinarian</option>
              <option value="technician">Technician</option>
              <option value="administration">Administration</option>
              <option value="emergency">Emergency</option>
            </select>
            <button 
              onClick={handleImportTemplate}
              className="hrms-btn hrms-btn-secondary text-sm"
            >
              Import Templates
            </button>
            <button 
              onClick={handleNewTemplate}
              className="hrms-btn hrms-btn-primary text-sm"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              New Template
            </button>
          </div>
        }
      >
        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id} 
              className={`border-2 rounded-lg p-6 ${template.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}
            >
              {/* Template Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(template.category)}`}>
                    {getCategoryLabel(template.category)}
                  </span>
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  {template.isActive ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Template Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  {template.startTime} - {template.endTime} ({template.duration})
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarDaysIcon className="h-4 w-4 mr-2" />
                  {template.daysOfWeek.length === 5 && 
                   template.daysOfWeek.includes('Monday') && 
                   template.daysOfWeek.includes('Friday') ? 
                    'Weekdays' : 
                    template.daysOfWeek.join(', ')
                  }
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  {template.requiredStaff} staff required
                </div>

                <p className="text-sm text-gray-500 line-clamp-2">
                  {template.description}
                </p>
              </div>

              {/* Usage Stats */}
              <div className="border-t pt-3 mb-4">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Used {template.usageCount} times</span>
                  <span>Created {template.createdDate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewTemplate(template.id)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEditTemplate(template.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit Template"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDuplicateTemplate(template.id)}
                    className="text-green-600 hover:text-green-900"
                    title="Duplicate Template"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                </div>
                <button 
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete Template"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No shift templates match the current filter criteria.
            </p>
            <div className="mt-6">
              <button className="hrms-btn hrms-btn-primary">
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Your First Template
              </button>
            </div>
          </div>
        )}
      </ContentCard>

      {/* Quick Template Actions */}
      <ContentCard title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button 
            onClick={() => handleNewTemplate()}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <DocumentTextIcon className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Create Template</h4>
            <p className="text-sm text-gray-500">Build a new shift template from scratch</p>
          </button>
          
          <button 
            onClick={() => handleDuplicateExisting()}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <DocumentDuplicateIcon className="h-6 w-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Duplicate Existing</h4>
            <p className="text-sm text-gray-500">Copy and modify an existing template</p>
          </button>
          
          <button 
            onClick={() => handleQuickTemplate()}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <ClockIcon className="h-6 w-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Quick Template</h4>
            <p className="text-sm text-gray-500">Generate template with smart defaults</p>
          </button>
          
          <button 
            onClick={() => handleRoleBasedTemplate()}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <UserGroupIcon className="h-6 w-6 text-orange-600 mb-2" />
            <h4 className="font-medium text-gray-900">Role-Based Template</h4>
            <p className="text-sm text-gray-500">Design templates for specific job roles</p>
          </button>
        </div>
      </ContentCard>

      {/* Template Guidelines */}
      <ContentCard title="Template Best Practices">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Scheduling Guidelines</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></span>
                Ensure adequate break times based on shift duration
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></span>
                Consider peak hours when setting staff requirements
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></span>
                Plan for shift overlaps during busy periods
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></span>
                Account for specialized skills in role assignments
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Template Optimization</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 shrink-0"></span>
                Review template usage regularly for improvements
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 shrink-0"></span>
                Update templates based on seasonal demand changes
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 shrink-0"></span>
                Create backup templates for emergency coverage
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 shrink-0"></span>
                Consider employee preferences when possible
              </li>
            </ul>
          </div>
        </div>
      </ContentCard>
    </HRMSLayout>
  );
}