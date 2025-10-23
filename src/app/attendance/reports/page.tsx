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

export default function ReportsPage() {
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

      {/* Reports Content */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Attendance Reports</h2>
        <p className="text-gray-600 mb-6">
          Generate and view comprehensive attendance reports, analytics, and insights.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Monthly Report</h3>
            <p className="text-sm text-gray-600 mb-4">Complete attendance summary for the current month</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
              Generate Report
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Weekly Summary</h3>
            <p className="text-sm text-gray-600 mb-4">Weekly attendance patterns and statistics</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
              Generate Report
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Employee Report</h3>
            <p className="text-sm text-gray-600 mb-4">Individual employee attendance records</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700">
              Generate Report
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Department Analysis</h3>
            <p className="text-sm text-gray-600 mb-4">Department-wise attendance analytics</p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700">
              Generate Report
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900">Recent Reports</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Report history and downloads coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}