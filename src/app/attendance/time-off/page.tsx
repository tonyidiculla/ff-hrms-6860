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

export default function TimeOffPage() {
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

      {/* Time Off Content */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Time Off Management</h2>
        <p className="text-gray-600 mb-6">
          Manage employee time off requests, vacation days, sick leave, and other absence types.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Pending Requests</h3>
            <p className="text-2xl font-bold text-blue-600">8</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Approved This Week</h3>
            <p className="text-2xl font-bold text-green-600">15</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900">Days Off Today</h3>
            <p className="text-2xl font-bold text-yellow-600">7</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900">Recent Time Off Requests</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Time off request management coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}