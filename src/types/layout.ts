// Standard HRMS Layout Components and Styles

export interface TabItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { name: string; href?: string }[];
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  icon?: React.ComponentType<{ className?: string }>;
}

export interface HRMSLayoutProps {
  children: React.ReactNode;
  header: PageHeaderProps;
  tabs?: TabItem[];
  currentPath?: string;
}

// Standard HRMS Colors and Spacing
export const HRMSTheme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a',
    },
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      900: '#7f1d1d',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  },
  spacing: {
    page: 'p-6',
    section: 'mb-8',
    card: 'p-6',
    header: 'mb-6',
    tabs: 'mb-6',
  },
  typography: {
    h1: 'text-3xl font-bold text-gray-900',
    h2: 'text-xl font-semibold text-gray-900',
    h3: 'text-lg font-medium text-gray-900',
    subtitle: 'text-base text-gray-600',
    body: 'text-sm text-gray-700',
    caption: 'text-xs text-gray-500',
  },
  shadows: {
    card: 'shadow-sm',
    hover: 'hover:shadow-md',
    focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  },
  borders: {
    default: 'border border-gray-200',
    rounded: 'rounded-lg',
  }
} as const;