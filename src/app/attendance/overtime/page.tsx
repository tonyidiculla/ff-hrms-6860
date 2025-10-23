'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'Overview', href: '/attendance' },
  { name: 'Tracking', href: '/attendance/tracking' },
  { name: 'Time Off', href: '/attendance/time-off' },
  { name: 'Overtime', href: '/attendance/overtime' },
  { name: 'Reports', href: '/attendance/reports' },
];

export default function OvertimePage() {
  const pathname = usePathname();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Attendance Management</h1>
      
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

      {/* Overtime Content */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Overtime Management</h2>
        <p className="text-gray-600 mb-6">
          Track and manage employee overtime hours, approvals, and compensation.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Total Overtime (Week)</h3>
            <p className="text-2xl font-bold text-blue-600">142</p>
            <p className="text-sm text-blue-700">hours</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Approved Overtime</h3>
            <p className="text-2xl font-bold text-green-600">128</p>
            <p className="text-sm text-green-700">hours</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900">Pending Approval</h3>
            <p className="text-2xl font-bold text-yellow-600">14</p>
            <p className="text-sm text-yellow-700">hours</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900">Compensation Due</h3>
            <p className="text-2xl font-bold text-purple-600">$4,560</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900">Overtime Summary</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Overtime tracking and approval system coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}