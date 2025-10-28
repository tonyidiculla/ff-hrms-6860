'use client';

import { 
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { HRMSLayout, ContentCard } from '@/components/layout/HRMSLayout';
import { TabItem } from '@/types/layout';

const tabs: TabItem[] = [
  { name: 'Overview', href: '/training', icon: AcademicCapIcon },
  { name: 'Programs', href: '/training/programs', icon: DocumentTextIcon },
  { name: 'Certifications', href: '/training/certifications', icon: ClipboardDocumentCheckIcon },
];

const headerProps = {
  title: "Training & Development",
  subtitle: "Manage employee training programs and certifications",
  breadcrumbs: [
    { name: 'Home', href: '/' },
    { name: 'Training' }
  ]
};

export default function TrainingPage() {
  return (
    <HRMSLayout header={headerProps} tabs={tabs}>
      <ContentCard title="Training Overview">
        <p className="text-gray-600 mb-6">
          Manage training programs, track employee certifications, and schedule development activities.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Active Programs</h3>
            <p className="text-2xl font-bold text-blue-600">12</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Completed This Month</h3>
            <p className="text-2xl font-bold text-green-600">28</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900">Certifications Earned</h3>
            <p className="text-2xl font-bold text-purple-600">15</p>
          </div>
        </div>
      </ContentCard>
    </HRMSLayout>
  );
}
