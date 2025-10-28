'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TabNavigation } from '@/components/layout/TabNavigation';
import { HRMSLayoutProps } from '@/types/layout';
import { ContentArea, VStack } from '@/components/layout/PageLayout';

export function HRMSLayout({ children, header, tabs, currentPath }: HRMSLayoutProps) {
  return (
    <ContentArea>
      {/* Page Header */}
      <PageHeader {...header} />
      
      {/* Tab Navigation */}
      {tabs && tabs.length > 0 && (
        <TabNavigation tabs={tabs} />
      )}
      
      {/* Main Content */}
      <VStack>
        {children}
      </VStack>
    </ContentArea>
  );
}

// Re-export shared components from centralized PageLayout
export { ContentCard, MetricsGrid } from '@/components/layout/PageLayout';