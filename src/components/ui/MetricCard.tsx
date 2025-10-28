'use client';

import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';
import { MetricCardProps } from '@/types/layout';

export function MetricCard({ 
  title, 
  value, 
  trend, 
  color = 'gray', 
  icon: Icon 
}: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900',
  };

  const valueColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600',
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
    purple: 'text-purple-500',
    gray: 'text-gray-500',
  };

  return (
    <div className={`relative overflow-hidden rounded-lg border ${colorClasses[color]} p-6 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">{title}</h3>
          <div className="mt-2 flex items-baseline space-x-2">
            <p className={`text-2xl font-bold ${valueColorClasses[color]}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {trend && (
              <div className={`flex items-center text-sm ${
                trend.direction === 'up' 
                  ? 'text-green-600' 
                  : trend.direction === 'down' 
                    ? 'text-red-600' 
                    : 'text-gray-500'
              }`}>
                {trend.direction === 'up' && <ArrowUpIcon className="h-4 w-4" />}
                {trend.direction === 'down' && <ArrowDownIcon className="h-4 w-4" />}
                <span className="ml-1 font-medium">
                  {Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        {Icon && (
          <div className="shrink-0">
            <Icon className={`h-8 w-8 ${iconColorClasses[color]} opacity-75`} />
          </div>
        )}
      </div>
    </div>
  );
}