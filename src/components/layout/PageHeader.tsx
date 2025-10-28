'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { PageHeaderProps } from '@/types/layout';

export function PageHeader({ title, subtitle, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.name} className="flex items-center">
                {index > 0 && (
                  <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {crumb.name}
                  </Link>
                ) : (
                  <span className="text-sm text-gray-900 font-medium">{crumb.name}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header Content */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-base text-gray-600 max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}