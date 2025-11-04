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
      <ContentCard title="Training & Development">
        <p className="text-gray-600 mb-6">
          Organize and manage employee training programs, track certifications, and monitor professional development progress.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <DocumentTextIcon className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-blue-900 mb-2">Training Programs</h3>
            <p className="text-sm text-blue-700 mb-4">Create and manage comprehensive training curricula</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-600">12 active programs</span>
              <span className="text-xs text-blue-600">28 completed</span>
            </div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <ClipboardDocumentCheckIcon className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-green-900 mb-2">Certifications</h3>
            <p className="text-sm text-green-700 mb-4">Track professional certifications and credentials</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-green-600">15 earned</span>
              <span className="text-xs text-green-600">8 in progress</span>
            </div>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <AcademicCapIcon className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-purple-900 mb-2">Development Plans</h3>
            <p className="text-sm text-purple-700 mb-4">Individual and team development roadmaps</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-purple-600">24 active plans</span>
              <span className="text-xs text-purple-600">95% engagement</span>
            </div>
          </div>
        </div>
      </ContentCard>
    </HRMSLayout>
  );
}
