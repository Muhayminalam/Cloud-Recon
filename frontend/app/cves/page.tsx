'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { 
  Database, 
  Search, 
  Filter, 
  ExternalLink, 
  AlertTriangle,
  Shield,
  Calendar,
  Tag,
  Bug,
  Globe,
  Eye
} from 'lucide-react';

interface CVE {
  id: string;
  description: string;
  severity: string;
  tags: string[];
  reference: string;
  published_date: string;
}

export default function CVEDatabase() {
  const [cves, setCves] = useState<CVE[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    } else {
      fetchCVEs();
    }
  }, [router, severityFilter]);

  const fetchCVEs = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params: any = {};
      if (severityFilter !== 'all') {
        params.severity = severityFilter;
      }
      
      const response = await apiClient.getCVEs(params);
      setCves(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch CVEs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCVEs();
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiClient.searchCVEs(searchTerm);
      setCves(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchCVEs();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'high':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
      case 'low':
        return <Shield className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredCVEs = cves.filter(cve => {
    const matchesTag = selectedTag === '' || cve.tags.includes(selectedTag);
    return matchesTag;
  });

  const allTags = Array.from(new Set(cves.flatMap(cve => cve.tags))).sort();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
                <p className="text-gray-400">Loading CVE database...</p>
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
                    <Database 
                      className="h-8 w-8" 
                      style={{ color: '#dc2626', filter: 'drop-shadow(0 0 10px #dc2626)' }} 
                    />
                    <h1 
                      className="text-3xl font-bold" 
                      style={{ color: '#dc2626', textShadow: '0 0 10px #dc2626' }}
                    >
                      CVE Database
                    </h1>
                  </div>
                  <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                    Access the most comprehensive database of Common Vulnerabilities and Exposures (CVEs) for penetration testing, 
                    security research, and vulnerability assessment activities.
                  </p>
                </div>

                {/* What is CVE Database Section */}
                <div className="mb-10 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-2 border-blue-500/30 rounded-xl p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Bug className="h-6 w-6 text-blue-400" />
                    <h2 className="text-xl font-bold text-blue-300">What is the CVE Database?</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-blue-200 mb-3 flex items-center">
                          <span className="mr-2">🔍</span>
                          CVE Research & Discovery:
                        </h3>
                        <div className="space-y-2 text-sm text-blue-100">
                          <p>• CVE (Common Vulnerabilities and Exposures) is a standardized database that provides unique identifiers for publicly known cybersecurity vulnerabilities.</p>
                          <p>• Our database aggregates the latest CVEs with severity ratings, detailed descriptions, and actionable information for security professionals.</p>
                          <p>• Search through thousands of vulnerabilities by keywords, severity levels, affected technologies, and publication dates.</p>
                          <p>• Each CVE entry includes comprehensive details about the vulnerability, impact assessment, and links to official references.</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-blue-200 mb-3 flex items-center">
                          <span className="mr-2">⚡</span>
                          Professional Applications:
                        </h3>
                        <div className="space-y-2 text-sm text-blue-100">
                          <p>• Essential tool for penetration testers to identify known vulnerabilities in target systems and applications.</p>
                          <p>• Security researchers use CVE data to understand attack vectors and develop defensive strategies.</p>
                          <p>• Vulnerability assessment teams leverage CVE information to prioritize patching and remediation efforts.</p>
                          <p>• Compliance officers reference CVEs for regulatory reporting and risk management documentation.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-blue-500/20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-semibold text-blue-200 mb-3 flex items-center">
                          <span className="mr-2">🛡️</span>
                          Severity Classifications:
                        </h3>
                        <div className="space-y-2 text-sm text-blue-100">
                          <p>• <strong>Critical:</strong> Vulnerabilities that allow immediate system compromise with minimal user interaction.</p>
                          <p>• <strong>High:</strong> Serious security flaws that could lead to significant data breaches or system access.</p>
                          <p>• <strong>Medium:</strong> Moderate vulnerabilities that require specific conditions to exploit effectively.</p>
                          <p>• <strong>Low:</strong> Minor security issues with limited impact or requiring complex attack scenarios.</p>
                        </div>
                      </div>
                      
                      <div>
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
                      <Database className="h-6 w-6" style={{ color: '#ef4444' }} />
                      <span className="font-semibold text-lg" style={{ color: '#ef4444' }}>
                        Total CVEs: {filteredCVEs.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-6 w-6" style={{ color: '#ef4444' }} />
                      <span className="font-semibold text-lg" style={{ color: '#ef4444' }}>
                        Critical: {filteredCVEs.filter(cve => cve.severity.toLowerCase() === 'critical').length}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Shield className="h-6 w-6" style={{ color: '#ef4444' }} />
                      <span className="font-semibold text-lg" style={{ color: '#ef4444' }}>
                        High: {filteredCVEs.filter(cve => cve.severity.toLowerCase() === 'high').length}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Eye className="h-6 w-6" style={{ color: '#ef4444' }} />
                      <span className="font-semibold text-lg" style={{ color: '#ef4444' }}>
                        Recent: {filteredCVEs.filter(cve => {
                          const date = new Date(cve.published_date);
                          const thirtyDaysAgo = new Date();
                          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                          return date >= thirtyDaysAgo;
                        }).length}
                      </span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/50 border border-red-500 rounded-md p-4 mb-8">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <p className="text-sm text-red-300">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* CVE List */}
                <div className="bg-black shadow-xl rounded-xl p-6 mt-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">CVE Entries</h3>
                  </div>
                  
                  {filteredCVEs.length === 0 ? (
                    <div className="text-center py-12">
                      <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No CVEs found</h3>
                      <p className="text-gray-400">
                        No example CVE data available at the moment.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {filteredCVEs.map((cve) => (
                        <div 
                          key={cve.id} 
                          className="bg-black hover:bg-white rounded-lg p-4 border border-gray-700 hover:border-black cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h3 className="text-lg font-medium text-white group-hover:text-black">{cve.id}</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(cve.severity)}`}>
                                  {getSeverityIcon(cve.severity)}
                                  <span className="ml-1">{cve.severity.toUpperCase()}</span>
                                </span>
                                <div className="flex items-center text-sm text-gray-400 group-hover:text-gray-600">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(cve.published_date)}
                                </div>
                              </div>
                              
                              <p className="text-gray-300 group-hover:text-gray-700 mb-4 leading-relaxed">{cve.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                {cve.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 group-hover:bg-gray-200 group-hover:text-gray-700"
                                  >
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="ml-4">
                              <a
                                href={cve.reference}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-red-600 hover:text-white hover:border-red-600 group-hover:bg-gray-200 group-hover:text-gray-800 group-hover:border-gray-400 group-hover:hover:bg-red-600 group-hover:hover:text-white group-hover:hover:border-red-600 transition-all duration-200"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Details
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}