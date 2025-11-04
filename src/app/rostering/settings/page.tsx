'use client';

import { useState } from 'react';
import {
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { HRMSLayout, ContentCard } from '@/components/layout/HRMSLayout';
import { TabItem } from '@/types/layout';

const tabs: TabItem[] = [
  { 
    name: 'Schedule Overview', 
    href: '/rostering',
    icon: CalendarIcon
  },
  { 
    name: 'Employee Requests', 
    href: '/rostering/requests',
    icon: ArrowsRightLeftIcon
  },
  { 
    name: 'Shift Templates', 
    href: '/rostering/templates',
    icon: DocumentTextIcon
  },
  { 
    name: 'Settings', 
    href: '/rostering/settings',
    icon: CogIcon
  },
];

const headerProps = {
  title: "Rostering Settings",
  subtitle: "Configure scheduling rules, policies, notifications, and system preferences",
  breadcrumbs: [
    { name: 'HRMS', href: '/' },
    { name: 'Rostering', href: '/rostering' },
    { name: 'Settings' }
  ]
};

export default function RosteringSettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    autoApproveSwaps: false,
    requireManagerApproval: true,
    minimumAdvanceNotice: '48',
    maxConsecutiveDays: '7',
    maxWeeklyHours: '40',
    
    // Request Settings
    allowSelfSwaps: true,
    allowPartialShifts: false,
    requireSwapPartner: true,
    emergencyRequestWindow: '24',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    managerNotifications: true,
    employeeConfirmations: true,
    
    // Schedule Settings
    workweekStartDay: 'monday',
    defaultShiftLength: '8',
    breakDuration: '60',
    overtimeThreshold: '40',
    
    // Approval Workflow
    approvalLevels: '2',
    escalationTime: '24',
    autoReject: false,
    
    // System Settings
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    language: 'english',
    region: 'global'
  });

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Handle save functionality
    console.log('Saving settings:', settings);
  };

  const handleReset = () => {
    // Reset to defaults
    console.log('Resetting to defaults');
  };

  return (
    <HRMSLayout header={headerProps} tabs={tabs}>
      {/* Quick Settings Overview */}
      <ContentCard title="Quick Settings Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <ClockIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Advance Notice</h3>
            <p className="text-2xl font-bold text-blue-600">{settings.minimumAdvanceNotice}h</p>
            <p className="text-sm text-gray-500">Required for requests</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <UserGroupIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Max Hours</h3>
            <p className="text-2xl font-bold text-green-600">{settings.maxWeeklyHours}h</p>
            <p className="text-sm text-gray-500">Weekly limit</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <ShieldCheckIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Approval Levels</h3>
            <p className="text-2xl font-bold text-purple-600">{settings.approvalLevels}</p>
            <p className="text-sm text-gray-500">Required approvals</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <BellIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Notifications</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {[settings.emailNotifications, settings.smsNotifications, settings.pushNotifications].filter(Boolean).length}/3
            </p>
            <p className="text-sm text-gray-500">Active channels</p>
          </div>
        </div>
      </ContentCard>

      {/* General Settings */}
      <ContentCard title="General Schedule Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Advance Notice (hours)
              </label>
              <select 
                value={settings.minimumAdvanceNotice}
                onChange={(e) => handleSettingChange('minimumAdvanceNotice', e.target.value)}
                className="hrms-input w-full"
              >
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
                <option value="168">1 week</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Minimum time required before shift changes can be requested
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Consecutive Working Days
              </label>
              <select 
                value={settings.maxConsecutiveDays}
                onChange={(e) => handleSettingChange('maxConsecutiveDays', e.target.value)}
                className="hrms-input w-full"
              >
                <option value="5">5 days</option>
                <option value="6">6 days</option>
                <option value="7">7 days</option>
                <option value="10">10 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Weekly Hours
              </label>
              <input 
                type="number"
                value={settings.maxWeeklyHours}
                onChange={(e) => handleSettingChange('maxWeeklyHours', e.target.value)}
                className="hrms-input w-full"
                min="30"
                max="60"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Week Start Day
              </label>
              <select 
                value={settings.workweekStartDay}
                onChange={(e) => handleSettingChange('workweekStartDay', e.target.value)}
                className="hrms-input w-full"
              >
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Shift Length (hours)
              </label>
              <select 
                value={settings.defaultShiftLength}
                onChange={(e) => handleSettingChange('defaultShiftLength', e.target.value)}
                className="hrms-input w-full"
              >
                <option value="4">4 hours</option>
                <option value="6">6 hours</option>
                <option value="8">8 hours</option>
                <option value="10">10 hours</option>
                <option value="12">12 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standard Break Duration (minutes)
              </label>
              <select 
                value={settings.breakDuration}
                onChange={(e) => handleSettingChange('breakDuration', e.target.value)}
                className="hrms-input w-full"
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
              </select>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* Request Management Settings */}
      <ContentCard title="Request Management">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Auto-approve shift swaps</h4>
                  <p className="text-sm text-gray-500">Automatically approve swaps when partner confirms</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.autoApproveSwaps}
                    onChange={(e) => handleSettingChange('autoApproveSwaps', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Require manager approval</h4>
                  <p className="text-sm text-gray-500">All schedule changes need manager sign-off</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.requireManagerApproval}
                    onChange={(e) => handleSettingChange('requireManagerApproval', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Allow employee self-swaps</h4>
                  <p className="text-sm text-gray-500">Employees can arrange their own shift swaps</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.allowSelfSwaps}
                    onChange={(e) => handleSettingChange('allowSelfSwaps', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Request Window (hours)
                </label>
                <select 
                  value={settings.emergencyRequestWindow}
                  onChange={(e) => handleSettingChange('emergencyRequestWindow', e.target.value)}
                  className="hrms-input w-full"
                >
                  <option value="2">2 hours</option>
                  <option value="4">4 hours</option>
                  <option value="8">8 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Escalation Time (hours)
                </label>
                <select 
                  value={settings.escalationTime}
                  onChange={(e) => handleSettingChange('escalationTime', e.target.value)}
                  className="hrms-input w-full"
                >
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="72">72 hours</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Time before requests are escalated to higher management
                </p>
              </div>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* Notification Settings */}
      <ContentCard title="Notification Preferences">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-4">Notification Channels</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Email Notifications</h5>
                  <p className="text-sm text-gray-500">Send notifications via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BellIcon className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Push Notifications</h5>
                  <p className="text-sm text-gray-500">Browser and mobile app notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <InformationCircleIcon className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <h5 className="text-sm font-medium text-gray-900">SMS Notifications</h5>
                  <p className="text-sm text-gray-500">Text message alerts for urgent items</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-4">System Preferences</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Region
              </label>
              <select 
                value={settings.region}
                onChange={(e) => handleSettingChange('region', e.target.value)}
                className="hrms-input w-full mb-4"
              >
                <option value="global">Global/Multi-Region</option>
                <option value="north_america">North America</option>
                <option value="europe">Europe</option>
                <option value="asia_pacific">Asia Pacific</option>
                <option value="africa_middle_east">Africa & Middle East</option>
                <option value="south_america">South America</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Timezone
              </label>
              <select 
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                className="hrms-input w-full"
              >
                <option value="UTC">UTC - Coordinated Universal Time</option>
                <optgroup label="North America">
                  <option value="America/New_York">United States - Eastern Time (ET)</option>
                  <option value="America/Chicago">United States - Central Time (CT)</option>
                  <option value="America/Denver">United States - Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">United States - Pacific Time (PT)</option>
                  <option value="America/Toronto">Canada - Eastern Time</option>
                  <option value="America/Vancouver">Canada - Pacific Time</option>
                  <option value="America/Mexico_City">Mexico - Central Time</option>
                </optgroup>
                <optgroup label="Europe">
                  <option value="Europe/London">United Kingdom - GMT/BST</option>
                  <option value="Europe/Paris">France - CET/CEST</option>
                  <option value="Europe/Berlin">Germany - CET/CEST</option>
                  <option value="Europe/Rome">Italy - CET/CEST</option>
                  <option value="Europe/Madrid">Spain - CET/CEST</option>
                  <option value="Europe/Amsterdam">Netherlands - CET/CEST</option>
                  <option value="Europe/Stockholm">Sweden - CET/CEST</option>
                  <option value="Europe/Moscow">Russia - MSK</option>
                  <option value="Europe/Dublin">Ireland - GMT/IST</option>
                </optgroup>
                <optgroup label="Asia Pacific">
                  <option value="Asia/Tokyo">Japan - JST</option>
                  <option value="Asia/Shanghai">China - CST</option>
                  <option value="Asia/Hong_Kong">Hong Kong - HKT</option>
                  <option value="Asia/Singapore">Singapore - SGT</option>
                  <option value="Asia/Seoul">South Korea - KST</option>
                  <option value="Asia/Kolkata">India - IST</option>
                  <option value="Asia/Dubai">UAE - GST</option>
                  <option value="Australia/Sydney">Australia - AEST/AEDT</option>
                  <option value="Australia/Melbourne">Australia - AEST/AEDT (Melbourne)</option>
                  <option value="Australia/Perth">Australia - AWST</option>
                  <option value="Pacific/Auckland">New Zealand - NZST/NZDT</option>
                </optgroup>
                <optgroup label="Africa & Middle East">
                  <option value="Africa/Cairo">Egypt - EET</option>
                  <option value="Africa/Johannesburg">South Africa - SAST</option>
                  <option value="Africa/Lagos">Nigeria - WAT</option>
                  <option value="Africa/Nairobi">Kenya - EAT</option>
                  <option value="Asia/Riyadh">Saudi Arabia - AST</option>
                  <option value="Asia/Jerusalem">Israel - IST/IDT</option>
                </optgroup>
                <optgroup label="South America">
                  <option value="America/Sao_Paulo">Brazil - BRT/BRST</option>
                  <option value="America/Argentina/Buenos_Aires">Argentina - ART</option>
                  <option value="America/Lima">Peru - PET</option>
                  <option value="America/Bogota">Colombia - COT</option>
                  <option value="America/Santiago">Chile - CLT/CLST</option>
                </optgroup>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select the timezone for your organization's primary location
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <select 
                value={settings.dateFormat}
                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                className="hrms-input w-full"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (International)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Format
              </label>
              <select 
                value={settings.timeFormat}
                onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                className="hrms-input w-full"
              >
                <option value="12">12-hour (AM/PM)</option>
                <option value="24">24-hour (Military)</option>
              </select>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* Save Actions */}
      <ContentCard title="Save Changes">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            Changes will be applied immediately and affect all future scheduling operations.
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleReset}
              className="hrms-btn hrms-btn-secondary"
            >
              Reset to Defaults
            </button>
            <button 
              onClick={handleSave}
              className="hrms-btn hrms-btn-primary"
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </ContentCard>
    </HRMSLayout>
  );
}