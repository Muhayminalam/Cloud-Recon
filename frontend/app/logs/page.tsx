'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { 
  FileText, 
  Search, 
  Zap, 
  Trash2, 
  Filter, 
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Shield,
  Clock,
  Activity
} from 'lucide-react';

interface LogEntry {
  id: string;
  user_id: string;
  tool: string;
  input_data: string;
  result: any;
  timestamp: string;
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    } else {
      fetchLogs();
    }
  }, [router, filter]);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = filter !== 'all' ? { tool: filter } : {};
      const response = await apiClient.getLogs(params);
      setLogs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this log entry?')) {
      return;
    }

    try {
      await apiClient.deleteLog(logId);
      setLogs(logs.filter(log => log.id !== logId));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete log');
    }
  };

  const toggleLogExpansion = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'scan':
        return <Search className="h-5 w-5" />;
      case 'payload':
        return <Zap className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getToolColor = (tool: string) => {
    switch (tool) {
      case 'scan':
        return 'text-blue-700 bg-blue-700/10';
      case 'payload':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredLogs = logs.filter(log => 
    searchTerm === '' || 
    log.input_data.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.tool.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderResult = (result: any, tool: string) => {
    if (tool === 'scan') {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Target:</span>
            <span className="text-white">{result.target}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Status:</span>
            <span className="text-green-400">{result.status}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Open Ports:</span>
            <span className="text-white">
              {result.ports?.filter((p: any) => p.state === 'open').length || 0}
            </span>
          </div>
          {result.os_info && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">OS:</span>
              <span className="text-white">{result.os_info.name} {result.os_info.version}</span>
            </div>
          )}
        </div>
      );
    } else if (tool === 'payload') {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Type:</span>
            <span className="text-white">{result.payload_type}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Success:</span>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-blue-700" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Status:</span>
            <span className="text-white">{result.response?.status_code}</span>
          </div>
          {result.response?.risk_level && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Risk:</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                result.response.risk_level === 'critical' ? 'bg-blue-700/10 text-blue-700' :
                result.response.risk_level === 'high' ? 'bg-orange-400/10 text-orange-400' :
                result.response.risk_level === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                'bg-green-400/10 text-green-400'
              }`}>
                {result.response.risk_level.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <pre className="text-sm text-gray-300 whitespace-pre-wrap">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="md:pl-64 flex flex-col flex-1">
            <main className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mb-4 mx-auto"></div>
                <p className="text-gray-400">Loading activity logs...</p>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Header */}
                <div className="mb-8 text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <FileText 
                      className="h-8 w-8" 
                      style={{ color: '#dc2626', filter: 'drop-shadow(0 0 10px #dc2626)' }} 
                    />
                    <h1 
                      className="text-3xl font-bold" 
                      style={{ color: '#dc2626', textShadow: '0 0 10px #dc2626' }}
                    >
                      Activity Logs
                    </h1>
                  </div>
                  <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                    Monitor and analyze all your penetration testing activities, including network scans, 
                    payload tests, and security assessments for comprehensive audit trails.
                  </p>
                </div>

                {/* How to Use Section - Improved Layout */}
                <div className="mb-10 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-2 border-blue-500/30 rounded-xl p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Shield className="h-6 w-6 text-blue-400" />
                    <h2 className="text-xl font-bold text-blue-300">What Are Activity Logs?</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-blue-200 mb-3 flex items-center">
                          <span className="mr-2">📊</span>
                          What Gets Logged:
                        </h3>
                        <div className="space-y-2 text-sm text-blue-100">
                          <p>• Our system automatically records all network scan attempts and their detailed results, including open ports and service information.</p>
                          <p>• Every payload testing activity is logged with complete outcomes, response codes, and success indicators.</p>
                          <p>• Target systems are tracked with precise timestamps to maintain a chronological audit trail.</p>
                          <p>• Success and failure statuses are documented for each penetration test to evaluate effectiveness.</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-blue-200 mb-3 flex items-center">
                          <span className="mr-2">🔍</span>
                          Why Logs Matter:
                        </h3>
                        <div className="space-y-2 text-sm text-blue-100">
                          <p>• Track your testing progress and coverage across multiple target systems to ensure comprehensive assessments.</p>
                          <p>• Maintain detailed audit trails that meet compliance requirements for professional security testing.</p>
                          <p>• Identify successful attack vectors and vulnerability patterns to improve your testing methodology.</p>
                          <p>• Document all findings systematically to create professional penetration testing reports for clients.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-blue-500/20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-semibold text-blue-200 mb-3 flex items-center">
                          <span className="mr-2">🎯</span>
                          Professional Use:
                        </h3>
                        <div className="space-y-2 text-sm text-blue-100">
                          <p>• Generate evidence-backed penetration test reports with detailed proof of testing activities and findings.</p>
                          <p>• Create comprehensive timelines of security assessments for client presentations and documentation.</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-blue-200 mb-3 flex items-center">
                          <span className="mr-2">🛠️</span>
                          Log Management:
                        </h3>
                        <div className="space-y-2 text-sm text-blue-100">
                          <p>• Filter logs by tool type (network scans or payload tests) to focus on specific testing activities.</p>
                          <p>• Search through test targets and expand entries to view detailed results and delete outdated records.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div 
                  className="bg-gray-800 shadow-xl rounded-xl p-6 mb-6" 
                  style={{ marginTop: '2rem' }}
                >
                  {/* Horizontal Statistics with Red Theme */}
                  <div 
                    className="flex flex-wrap items-center justify-center mb-6" 
                    style={{ gap: '3rem', marginTop: '1rem' }}
                  >
                    <div className="flex items-center space-x-2">
                      <Activity className="h-6 w-6" style={{ color: '#ef4444' }} />
                      <span className="font-semibold text-lg" style={{ color: '#ef4444' }}>
                        Total Logs: {filteredLogs.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Search className="h-6 w-6" style={{ color: '#ef4444' }} />
                      <span className="font-semibold text-lg" style={{ color: '#ef4444' }}>
                        Network Scans: {filteredLogs.filter(log => log.tool === 'scan').length}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Zap className="h-6 w-6" style={{ color: '#ef4444' }} />
                      <span className="font-semibold text-lg" style={{ color: '#ef4444' }}>
                        Payload Tests: {filteredLogs.filter(log => log.tool === 'payload').length}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-6 w-6" style={{ color: '#ef4444' }} />
                      <span className="font-semibold text-lg" style={{ color: '#ef4444' }}>
                        Last Activity: {filteredLogs.length > 0 ? 'Recent' : 'None'}
                      </span>
                    </div>
                  </div>

                  {/* Filter and Search - Extended Search Field */}
                  <div className="flex justify-start">
                    {/* Filter - keeping same size */}
                    <div style={{ width: '128px', flexShrink: 0 }}>
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full h-12 appearance-none bg-gray-700 border border-gray-600 text-white px-4 rounded-l-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="all">All Tools</option>
                        <option value="scan">Network Scans</option>
                        <option value="payload">Payload Tests</option>
                      </select>
                    </div>

                    {/* Search - Extended much further to the right */}
                    <div style={{ flex: 1, maxWidth: '672px' }}>
                      <div className="relative">
                        {/* Clear button for search - moved further right */}
                        {searchTerm && (
                          <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute flex items-center justify-center rounded-full bg-gray-600 hover:bg-gray-500 transition-colors duration-200"
                            style={{
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '20px',
                              height: '20px',
                              zIndex: 10
                            }}
                          >
                            <span className="text-white text-xs font-bold">×</span>
                          </button>
                        )}
                        
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full h-12 border border-gray-600 rounded-r-md border-l-0 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                          style={{
                            paddingLeft: '16px',
                            paddingRight: searchTerm ? '48px' : '16px'
                          }}
                          placeholder="Search logs by target or tool..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/50 border border-red-500 rounded-md p-4 mb-8">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-blue-700" />
                      <div className="ml-3">
                        <p className="text-sm text-red-300">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Logs List */}
                <div className="bg-black shadow-xl rounded-xl p-6 mt-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                    <div className="text-sm text-gray-400">
                      Showing {Math.min(4, filteredLogs.length)} of {filteredLogs.length} logs
                    </div>
                  </div>
                  
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No logs found</h3>
                      <p className="text-gray-400">
                        {searchTerm || filter !== 'all' 
                          ? 'Try adjusting your search or filter criteria.'
                          : 'Start using the tools to see your activity logs here.'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="h-96 overflow-y-auto pr-2 space-y-4">
                      {filteredLogs.map((log) => (
                        <div 
                          key={log.id} 
                          className="bg-black hover:bg-white rounded-lg p-4 border border-gray-700 hover:border-black cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`p-2 rounded-lg ${getToolColor(log.tool)} flex-shrink-0`}>
                                {getToolIcon(log.tool)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getToolColor(log.tool)}`}>
                                    {log.tool.toUpperCase()}
                                  </span>
                                  <span className="text-gray-400 group-hover:text-gray-600 flex items-center text-sm">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatTimestamp(log.timestamp)}
                                  </span>
                                </div>
                                <p className="text-white group-hover:text-black font-medium mb-2 break-words">{log.input_data}</p>
                                
                                {/* Quick result summary with red highlights and proper spacing */}
                                <div className="text-sm text-gray-300 group-hover:text-gray-700">
                                  {log.tool === 'scan' && log.result && (
                                    <div className="flex items-center flex-wrap" style={{ gap: '16px' }}>
                                      <span>Target: <span style={{ color: '#ef4444', fontWeight: '600' }} className="group-hover:!text-red-600">{log.result.target}</span></span>
                                      <span>Status: <span style={{ color: '#ef4444', fontWeight: '600' }} className="group-hover:!text-red-600">{log.result.status}</span></span>
                                      {log.result.ports && (
                                        <span>Open Ports: <span style={{ color: '#ef4444', fontWeight: '600' }} className="group-hover:!text-red-600">
                                          {log.result.ports.filter((p: any) => p.state === 'open').length}
                                        </span></span>
                                      )}
                                    </div>
                                  )}
                                  {log.tool === 'payload' && log.result && (
                                    <div className="flex items-center flex-wrap" style={{ gap: '16px' }}>
                                      <span>Type: <span style={{ color: '#ef4444', fontWeight: '600' }} className="group-hover:!text-red-600">{log.result.payload_type}</span></span>
                                      <span className="flex items-center">
                                        Success: {log.result.success ? (
                                          <CheckCircle className="h-3 w-3 text-green-400 ml-1" />
                                        ) : (
                                          <AlertCircle className="h-3 w-3 text-blue-700 ml-1" />
                                        )}
                                      </span>
                                      {log.result.response?.risk_level && (
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                          log.result.response.risk_level === 'critical' ? 'bg-blue-700/10 text-blue-700' :
                                          log.result.response.risk_level === 'high' ? 'bg-orange-400/10 text-orange-400' :
                                          log.result.response.risk_level === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                                          'bg-green-400/10 text-green-400'
                                        }`}>
                                          {log.result.response.risk_level.toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                              <button
                                onClick={() => toggleLogExpansion(log.id)}
                                className="text-gray-400 hover:text-blue-700 group-hover:text-gray-600 group-hover:hover:text-red-600 p-2 rounded-md transition-colors"
                                title="Toggle details"
                              >
                                {expandedLog === log.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteLog(log.id)}
                                className="text-gray-400 hover:text-blue-700 group-hover:text-gray-600 group-hover:hover:text-red-600 p-2 rounded-md transition-colors"
                                title="Delete log"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {expandedLog === log.id && (
                            <div className="mt-4 pt-4 border-t border-gray-600 group-hover:border-gray-400">
                              <h4 className="text-sm font-medium text-white group-hover:text-black mb-3">Detailed Results</h4>
                              <div className="bg-gray-800 group-hover:bg-gray-100 rounded-lg p-4">
                                {renderResult(log.result, log.tool)}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Load More Button */}
                {filteredLogs.length > 4 && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={fetchLogs}
                      className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Load More Logs
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}