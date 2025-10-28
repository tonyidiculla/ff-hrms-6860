'use client';

import React from 'react';
import { HRMSProvider } from '../context/HRMSContext';

interface HRMSAppProviderProps {
  children: React.ReactNode;
}

export function HRMSAppProvider({ children }: HRMSAppProviderProps) {
  return (
    <HRMSProvider>
      {children}
    </HRMSProvider>
  );
}

// Notification Provider for HRMS alerts and messages
interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: NotificationState[];
  addNotification: (notification: Omit<NotificationState, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export function HRMSNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<NotificationState[]>([]);

  const addNotification = React.useCallback((notification: Omit<NotificationState, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: NotificationState = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-remove success notifications after 5 seconds
    if (notification.type === 'success') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    }
  }, []);

  const markAsRead = React.useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const removeNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  const value = React.useMemo(() => ({
    notifications,
    addNotification,
    markAsRead,
    removeNotification,
    clearAll,
  }), [notifications, addNotification, markAsRead, removeNotification, clearAll]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useHRMSNotifications() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useHRMSNotifications must be used within HRMSNotificationProvider');
  }
  return context;
}

// Theme Provider for HRMS UI consistency
interface HRMSTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}

const defaultTheme: HRMSTheme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#1F2937',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
  },
};

const ThemeContext = React.createContext<HRMSTheme>(defaultTheme);

export function HRMSThemeProvider({ 
  children, 
  theme = defaultTheme 
}: { 
  children: React.ReactNode;
  theme?: HRMSTheme;
}) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useHRMSTheme() {
  return React.useContext(ThemeContext);
}

// Loading Provider for HRMS operations
interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  loading: LoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
}

const LoadingContext = React.createContext<LoadingContextType | undefined>(undefined);

export function HRMSLoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoadingState] = React.useState<LoadingState>({});

  const setLoading = React.useCallback((key: string, isLoading: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      [key]: isLoading,
    }));
  }, []);

  const isLoading = React.useCallback((key: string) => {
    return loading[key] || false;
  }, [loading]);

  const isAnyLoading = React.useCallback(() => {
    return Object.values(loading).some(Boolean);
  }, [loading]);

  const value = React.useMemo(() => ({
    loading,
    setLoading,
    isLoading,
    isAnyLoading,
  }), [loading, setLoading, isLoading, isAnyLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useHRMSLoading() {
  const context = React.useContext(LoadingContext);
  if (!context) {
    throw new Error('useHRMSLoading must be used within HRMSLoadingProvider');
  }
  return context;
}

// Combined HRMS Provider that includes all providers
export function ComprehensiveHRMSProvider({ children }: { children: React.ReactNode }) {
  return (
    <HRMSThemeProvider>
      <HRMSLoadingProvider>
        <HRMSNotificationProvider>
          <HRMSAppProvider>
            {children}
          </HRMSAppProvider>
        </HRMSNotificationProvider>
      </HRMSLoadingProvider>
    </HRMSThemeProvider>
  );
}

// Error Boundary for HRMS components
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class HRMSErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('HRMS Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} />;
      }

      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '0.5rem',
          margin: '1rem'
        }}>
          <h2 style={{ color: '#B91C1C', marginBottom: '1rem' }}>
            HRMS Error
          </h2>
          <p style={{ color: '#7F1D1D', marginBottom: '1rem' }}>
            Something went wrong in the HRMS module.
          </p>
          {this.state.error && (
            <details style={{ textAlign: 'left', backgroundColor: '#FFF', padding: '1rem', borderRadius: '0.25rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Error Details
              </summary>
              <pre style={{ fontSize: '0.875rem', marginTop: '0.5rem', overflow: 'auto' }}>
                {this.state.error.message}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default {
  HRMSAppProvider,
  HRMSNotificationProvider,
  HRMSThemeProvider,
  HRMSLoadingProvider,
  ComprehensiveHRMSProvider,
  HRMSErrorBoundary,
  useHRMSNotifications,
  useHRMSTheme,
  useHRMSLoading,
};