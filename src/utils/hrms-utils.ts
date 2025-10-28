// Date and Time Utilities
export function formatDate(date: string | Date, format: 'short' | 'long' | 'iso' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString();
    case 'long':
      return dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'iso':
      return dateObj.toISOString().split('T')[0];
    default:
      return dateObj.toLocaleDateString();
  }
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  return dateObj.toLocaleString();
}

export function calculateDaysBetween(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

export function isWeekend(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
}

export function getWorkingDays(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  let workingDays = 0;
  const current = new Date(start);
  
  while (current <= end) {
    if (!isWeekend(current)) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return workingDays;
}

export function addWorkingDays(startDate: string | Date, days: number): Date {
  const date = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate);
  let addedDays = 0;
  
  while (addedDays < days) {
    date.setDate(date.getDate() + 1);
    if (!isWeekend(date)) {
      addedDays++;
    }
  }
  
  return date;
}

// String Utilities
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatName(firstName: string, lastName: string, format: 'first_last' | 'last_first' | 'initials' = 'first_last'): string {
  switch (format) {
    case 'first_last':
      return `${capitalizeFirstLetter(firstName)} ${capitalizeFirstLetter(lastName)}`;
    case 'last_first':
      return `${capitalizeFirstLetter(lastName)}, ${capitalizeFirstLetter(firstName)}`;
    case 'initials':
      return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
    default:
      return `${capitalizeFirstLetter(firstName)} ${capitalizeFirstLetter(lastName)}`;
  }
}

export function generateEmployeeId(department: string, timestamp?: number): string {
  const deptCode = department.substring(0, 3).toUpperCase();
  const time = timestamp || Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${deptCode}${time.toString().slice(-6)}${randomSuffix}`;
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/[^\w\s-]/gi, '');
}

// Number and Currency Utilities
export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function roundToDecimals(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// Array and Object Utilities
export function groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as { [key: string]: T[] });
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });
}

export function filterBySearchTerm<T>(array: T[], searchTerm: string, searchKeys: (keyof T)[]): T[] {
  if (!searchTerm.trim()) return array;
  
  const term = searchTerm.toLowerCase();
  
  return array.filter(item => 
    searchKeys.some(key => {
      const value = item[key];
      return value && String(value).toLowerCase().includes(term);
    })
  );
}

export function removeDuplicates<T>(array: T[], key?: keyof T): T[] {
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }
  
  return [...new Set(array)];
}

// Validation Utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function isValidDate(date: string): boolean {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// File Utilities
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
}

// URL and Slug Utilities
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function buildQueryString(params: { [key: string]: any }): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}

// Status and Classification Utilities
export function getStatusColor(status: string): string {
  const statusColors: { [key: string]: string } = {
    active: '#10B981',
    inactive: '#6B7280',
    pending: '#F59E0B',
    approved: '#10B981',
    rejected: '#EF4444',
    cancelled: '#6B7280',
    completed: '#10B981',
    in_progress: '#3B82F6',
    overdue: '#EF4444',
    draft: '#6B7280',
  };
  
  return statusColors[status] || '#6B7280';
}

export function getStatusLabel(status: string): string {
  const statusLabels: { [key: string]: string } = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    completed: 'Completed',
    in_progress: 'In Progress',
    overdue: 'Overdue',
    draft: 'Draft',
  };
  
  return statusLabels[status] || capitalizeFirstLetter(status);
}

export function getPriorityLevel(score: number): 'low' | 'medium' | 'high' | 'urgent' {
  if (score >= 90) return 'urgent';
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

// Performance and Analytics Utilities
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 !== 0 
    ? sorted[mid] 
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Local Storage Utilities
export function setLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return defaultValue;
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
}

// Debounce Utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Deep Clone Utility
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as { [key: string]: any };
    Object.keys(obj).forEach(key => {
      clonedObj[key] = deepClone((obj as { [key: string]: any })[key]);
    });
    return clonedObj as T;
  }
  return obj;
}

export default {
  // Date utilities
  formatDate,
  formatDateTime,
  calculateDaysBetween,
  isWeekend,
  getWorkingDays,
  addWorkingDays,
  
  // String utilities
  capitalizeFirstLetter,
  formatName,
  generateEmployeeId,
  sanitizeString,
  
  // Number utilities
  formatCurrency,
  formatPercentage,
  roundToDecimals,
  
  // Array utilities
  groupBy,
  sortBy,
  filterBySearchTerm,
  removeDuplicates,
  
  // Validation utilities
  isValidEmail,
  isValidPhoneNumber,
  isValidDate,
  validateRequired,
  validateRange,
  
  // File utilities
  getFileExtension,
  formatFileSize,
  isImageFile,
  
  // URL utilities
  generateSlug,
  buildQueryString,
  
  // Status utilities
  getStatusColor,
  getStatusLabel,
  getPriorityLevel,
  
  // Analytics utilities
  calculatePercentageChange,
  calculateAverage,
  calculateMedian,
  
  // Storage utilities
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  
  // Other utilities
  debounce,
  deepClone,
};