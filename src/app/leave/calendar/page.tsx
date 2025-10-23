'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'Overview', href: '/leave' },
  { name: 'New Request', href: '/leave/requests/new' },
  { name: 'Calendar', href: '/leave/calendar' },
  { name: 'Policies', href: '/leave/policies' },
];

export default function LeaveCalendarPage() {
  const pathname = usePathname();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Leave Management</h1>
      
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

      {/* Calendar Content */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Leave Calendar</h2>
        <p className="text-gray-600 mb-6">
          View upcoming leave schedules, holidays, and team availability.
        </p>
        
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-500">Calendar view coming soon...</p>
        </div>
      </div>
    </div>
  );
}