'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'Overview', href: '/leave' },
  { name: 'New Request', href: '/leave/requests/new' },
  { name: 'Calendar', href: '/leave/calendar' },
  { name: 'Policies', href: '/leave/policies' },
];

export default function LeavePage() {
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

      {/* Overview Content */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Leave Requests & Approvals</h2>
        <p className="text-gray-600 mb-6">
          This is the leave management section of the HRMS system. Here you can submit leave requests, 
          approve/reject leave applications, and view leave balances.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Pending Requests</h3>
            <p className="text-2xl font-bold text-blue-600">3</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Approved This Month</h3>
            <p className="text-2xl font-bold text-green-600">12</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900">Remaining Leave Days</h3>
            <p className="text-2xl font-bold text-yellow-600">18</p>
          </div>
        </div>
      </div>
    </div>
  );
}