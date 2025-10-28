'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TabItem } from '@/types/layout';

interface TabNavigationProps {
  tabs: TabItem[];
  className?: string;
}

export function TabNavigation({ tabs, className = '' }: TabNavigationProps) {
  const pathname = usePathname();

  return (
    <div className={`border-b border-gray-200 mb-8 ${className}`}>
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || 
            (pathname.startsWith(tab.href) && tab.href !== '/');
          
          const TabIcon = tab.icon;
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {TabIcon && (
                <TabIcon 
                  className={`-ml-0.5 mr-2 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} 
                />
              )}
              <span>{tab.name}</span>
              {tab.badge && tab.badge > 0 && (
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isActive 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}