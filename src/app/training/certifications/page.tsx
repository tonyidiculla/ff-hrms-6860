'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'Overview', href: '/training' },
  { name: 'Programs', href: '/training/programs' },
  { name: 'Certifications', href: '/training/certifications' },
];

export default function CertificationsPage() {
  const pathname = usePathname();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Training & Development</h1>
      
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

      {/* Certifications Content */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Employee Certifications</h2>
        <p className="text-gray-600 mb-6">
          Track professional certifications, licenses, and continuing education requirements.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Active Certifications</h3>
            <p className="text-2xl font-bold text-green-600">42</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900">Expiring Soon</h3>
            <p className="text-2xl font-bold text-yellow-600">6</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">In Progress</h3>
            <p className="text-2xl font-bold text-blue-600">12</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900">Completed This Year</h3>
            <p className="text-2xl font-bold text-purple-600">18</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium text-gray-900">Certification Status</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
              Add Certification
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">Veterinary License</h4>
                  <p className="text-sm text-gray-600 mt-1">Dr. Sarah Wilson</p>
                  <p className="text-sm text-gray-500">Expires: March 2025</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">Veterinary Technician Certification</h4>
                  <p className="text-sm text-gray-600 mt-1">Emily Adams</p>
                  <p className="text-sm text-gray-500">Expires: January 2025</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Expiring Soon
                </span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">Animal Behavior Specialist</h4>
                  <p className="text-sm text-gray-600 mt-1">Mike Brown</p>
                  <p className="text-sm text-gray-500">In Progress - 75% Complete</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  In Progress
                </span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">CPR & First Aid</h4>
                  <p className="text-sm text-gray-600 mt-1">Lisa Anderson</p>
                  <p className="text-sm text-gray-500">Completed: October 2024</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Recently Completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}