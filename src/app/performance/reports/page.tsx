'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  DocumentChartBarIcon, 
  PresentationChartLineIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  FunnelIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { PerformanceReport, DashboardMetric, ChartData } from '@/types/hr';

interface ReportsPageState {
  reports: PerformanceReport[];
  metrics: DashboardMetric[];
  chartData: ChartData[];
  loading: boolean;
  error: string | null;
  filters: {
    dateRange: string;
    reportType: string;
    department: string;
  };
  selectedReport: PerformanceReport | null;
}

export default function PerformanceReportsPage() {
  const [state, setState] = useState<ReportsPageState>({
    reports: [],
    metrics: [],
    chartData: [],
    loading: true,
    error: null,
    filters: {
      dateRange: 'last-quarter',
      reportType: '',
      department: '',
    },
    selectedReport: null,
  });

  useEffect(() => {
    loadReports();
    loadMetrics();
    loadChartData();
  }, [state.filters]);

  const loadReports = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API call - replace with actual API
      const mockReports: PerformanceReport[] = [
        {
          id: '1',
          title: 'Q3 2024 Team Performance Summary',
          type: 'team',
          period: {
            startDate: '2024-07-01',
            endDate: '2024-09-30',
          },
          filters: {
            departmentIds: ['dept1'],
          },
          metrics: [
            {
              name: 'Average Performance Rating',
              value: 4.2,
              trend: 'up',
              previousValue: 3.9,
              target: 4.0,
            },
            {
              name: 'Goal Completion Rate',
              value: 85,
              trend: 'up',
              previousValue: 78,
              target: 80,
            },
            {
              name: 'Employee Satisfaction',
              value: 4.5,
              trend: 'stable',
              previousValue: 4.5,
              target: 4.0,
            },
            {
              name: 'Training Hours Completed',
              value: 120,
              trend: 'up',
              previousValue: 95,
              target: 100,
            }
          ],
          charts: [
            {
              type: 'bar',
              title: 'Performance Ratings by Department',
              data: [
                { department: 'Veterinary', rating: 4.3 },
                { department: 'Surgery', rating: 4.1 },
                { department: 'Emergency', rating: 4.0 },
                { department: 'Administration', rating: 4.2 }
              ]
            },
            {
              type: 'line',
              title: 'Goal Completion Trend',
              data: [
                { month: 'July', completion: 78 },
                { month: 'August', completion: 82 },
                { month: 'September', completion: 85 }
              ]
            }
          ],
          insights: [
            'Performance ratings have improved by 7.7% compared to last quarter',
            'Goal completion rates exceeded targets by 5%',
            'Training participation increased significantly',
            'Employee satisfaction remains consistently high'
          ],
          recommendations: [
            'Continue current performance management practices',
            'Increase focus on professional development programs',
            'Consider expanding successful training initiatives',
            'Implement peer recognition programs'
          ],
          generatedAt: '2024-10-01T08:00:00Z',
          generatedBy: 'system',
        },
        {
          id: '2',
          title: 'Individual Performance Analysis - Dr. Sarah Johnson',
          type: 'individual',
          period: {
            startDate: '2024-01-01',
            endDate: '2024-09-30',
          },
          filters: {
            employeeIds: ['emp1'],
          },
          metrics: [
            {
              name: 'Overall Rating',
              value: 4.5,
              trend: 'up',
              previousValue: 4.2,
            },
            {
              name: 'Goals Achieved',
              value: 4,
              trend: 'stable',
              previousValue: 4,
              target: 3,
            },
            {
              name: '360 Feedback Score',
              value: 4.3,
              trend: 'up',
              previousValue: 4.0,
            }
          ],
          charts: [
            {
              type: 'pie',
              title: 'Goal Categories Distribution',
              data: [
                { category: 'Technical Skills', count: 2 },
                { category: 'Leadership', count: 1 },
                { category: 'Client Service', count: 1 }
              ]
            }
          ],
          insights: [
            'Consistently high performance across all metrics',
            'Strong improvement in 360-degree feedback scores',
            'Exceeded goal targets for the year'
          ],
          recommendations: [
            'Consider for senior veterinarian promotion',
            'Assign mentoring responsibilities',
            'Enroll in advanced leadership training'
          ],
          generatedAt: '2024-10-15T10:00:00Z',
          generatedBy: 'mgr1',
        }
      ];

      setState(prev => ({ 
        ...prev, 
        reports: mockReports, 
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load reports', 
        loading: false 
      }));
    }
  };

  const loadMetrics = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockMetrics: DashboardMetric[] = [
        {
          title: 'Average Performance Rating',
          value: '4.2',
          change: {
            value: 7.7,
            type: 'increase',
            period: 'vs last quarter'
          },
          icon: (
            <ChartBarIcon className="h-6 w-6" />
          ),
          color: 'blue'
        },
        {
          title: 'Goal Completion Rate',
          value: '85%',
          change: {
            value: 9,
            type: 'increase',
            period: 'vs last quarter'
          },
          icon: (
            <PresentationChartLineIcon className="h-6 w-6" />
          ),
          color: 'green'
        },
        {
          title: 'Feedback Requests',
          value: '24',
          change: {
            value: 12,
            type: 'increase',
            period: 'this quarter'
          },
          icon: (
            <DocumentChartBarIcon className="h-6 w-6" />
          ),
          color: 'purple'
        },
        {
          title: 'Reviews Completed',
          value: '18',
          change: {
            value: 2,
            type: 'decrease',
            period: 'vs last quarter'
          },
          icon: (
            <ChartBarIcon className="h-6 w-6" />
          ),
          color: 'indigo'
        }
      ];

      setState(prev => ({ ...prev, metrics: mockMetrics }));
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const loadChartData = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockChartData: ChartData[] = [
        {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
          datasets: [
            {
              label: 'Performance Rating',
              data: [3.8, 3.9, 4.0, 4.1, 4.0, 4.2, 4.1, 4.3, 4.2],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
            }
          ]
        }
      ];

      setState(prev => ({ ...prev, chartData: mockChartData }));
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  };

  const handleFilterChange = (key: keyof typeof state.filters, value: string) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value }
    }));
  };

  const handleViewReport = (report: PerformanceReport) => {
    setState(prev => ({ ...prev, selectedReport: report }));
  };

  const handleCloseModal = () => {
    setState(prev => ({ ...prev, selectedReport: null }));
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMetricColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'purple': return 'text-purple-600';
      case 'indigo': return 'text-indigo-600';
      case 'yellow': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-6 text-gray-900">Performance Reports</h1>
          <p className="mt-2 text-sm text-gray-700">
            Analyze performance metrics and generate insights across your organization.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <DocumentChartBarIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
          
          <select
            value={state.filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="last-week">Last Week</option>
            <option value="last-month">Last Month</option>
            <option value="last-quarter">Last Quarter</option>
            <option value="last-year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>

          <select
            value={state.filters.reportType}
            onChange={(e) => handleFilterChange('reportType', e.target.value)}
            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Report Types</option>
            <option value="individual">Individual</option>
            <option value="team">Team</option>
            <option value="department">Department</option>
            <option value="company">Company</option>
          </select>

          <select
            value={state.filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            <option value="veterinary">Veterinary</option>
            <option value="surgery">Surgery</option>
            <option value="emergency">Emergency</option>
            <option value="administration">Administration</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {state.metrics.map((metric, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className={getMetricColor(metric.color!)}>
                    {metric.icon}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {metric.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {metric.value}
                      </div>
                      {metric.change && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          metric.change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change.type === 'increase' ? (
                            <ArrowTrendingUpIcon className="h-4 w-4 shrink-0 self-center" />
                          ) : (
                            <ArrowTrendingDownIcon className="h-4 w-4 shrink-0 self-center" />
                          )}
                          <span className="sr-only">
                            {metric.change.type === 'increase' ? 'Increased' : 'Decreased'} by
                          </span>
                          {metric.change.value}%
                        </div>
                      )}
                    </dd>
                    {metric.change && (
                      <dd className="text-xs text-gray-500">
                        {metric.change.period}
                      </dd>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Trend Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Performance Trend</h3>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Last 9 months</span>
          </div>
        </div>
        
        {/* Simple chart representation */}
        <div className="h-64 flex items-end justify-between space-x-2">
          {state.chartData[0]?.datasets[0]?.data.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="bg-blue-500 rounded-t"
                style={{ 
                  height: `${(value / 5) * 200}px`, 
                  width: '20px' 
                }}
              ></div>
              <span className="text-xs text-gray-500 mt-2">
                {state.chartData[0]?.labels[index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Reports ({state.reports.length})
          </h3>
        </div>
        
        {state.reports.length === 0 ? (
          <div className="text-center py-12">
            <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate your first performance report to get insights.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <DocumentChartBarIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Generate Report
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {state.reports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {report.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.type === 'individual' ? 'bg-purple-100 text-purple-800' :
                        report.type === 'team' ? 'bg-blue-100 text-blue-800' :
                        report.type === 'department' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-cyan-100 text-cyan-800'
                      }`}>
                        {report.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">Period:</span>
                        <p className="text-sm font-medium">
                          {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Metrics:</span>
                        <p className="text-sm font-medium">{report.metrics.length}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Charts:</span>
                        <p className="text-sm font-medium">{report.charts.length}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Generated:</span>
                        <p className="text-sm font-medium">
                          {new Date(report.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Key Metrics Preview */}
                    <div className="flex flex-wrap gap-4 mb-3">
                      {report.metrics.slice(0, 3).map((metric, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{metric.name}:</span>
                          <span className="text-sm font-medium text-gray-900">{metric.value}</span>
                          {getTrendIcon(metric.trend || 'stable')}
                        </div>
                      ))}
                      {report.metrics.length > 3 && (
                        <span className="text-sm text-gray-500">+{report.metrics.length - 3} more</span>
                      )}
                    </div>

                    {/* Key Insights Preview */}
                    {report.insights.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-900">Key Insights:</span>
                        <ul className="mt-1 text-sm text-gray-600">
                          {report.insights.slice(0, 2).map((insight, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {insight}
                            </li>
                          ))}
                          {report.insights.length > 2 && (
                            <li className="text-gray-500 italic">+{report.insights.length - 2} more insights</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewReport(report)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      {state.selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full sm:p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl leading-6 font-bold text-gray-900">
                    {state.selectedReport.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {state.selectedReport.type} report • {new Date(state.selectedReport.period.startDate).toLocaleDateString()} - {new Date(state.selectedReport.period.endDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-8">
                {/* Metrics Grid */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {state.selectedReport.metrics.map((metric, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{metric.name}</span>
                          {getTrendIcon(metric.trend || 'stable')}
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                          {metric.target && (
                            <span className="text-sm text-gray-500 ml-2">/ {metric.target} target</span>
                          )}
                        </div>
                        {metric.previousValue && (
                          <div className="mt-1 text-sm text-gray-600">
                            vs {metric.previousValue} previous period
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Charts */}
                {state.selectedReport.charts.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Charts & Visualizations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {state.selectedReport.charts.map((chart, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-3">{chart.title}</h5>
                          <div className="h-32 flex items-center justify-center text-gray-500">
                            <span className="text-sm">{chart.type.toUpperCase()} Chart Placeholder</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights and Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Insights */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h4>
                    <ul className="space-y-3">
                      {state.selectedReport.insights.map((insight, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h4>
                    <ul className="space-y-3">
                      {state.selectedReport.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}