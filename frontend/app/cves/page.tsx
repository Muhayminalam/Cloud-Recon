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
  Cloud,
  Globe,
  Eye
} from 'lucide-react';

interface ThreatIntel {
  id: string;
  description: string;
  severity: string;
  tags: string[];
  reference: string;
  published_date: string;
}

export default function CloudThreatIntelligence() {
  const [threats, setThreats] = useState<ThreatIntel[]>([]);
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
      fetchThreats();
    }
  }, [router, severityFilter]);

  const fetchThreats = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params: any = {};
      if (severityFilter !== 'all') {
        params.severity = severityFilter;
      }
      
      const response = await apiClient.getCVEs(params);
      setThreats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch cloud threat intelligence');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchThreats();
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiClient.searchCVEs(searchTerm);
      setThreats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchThreats();
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

  const filteredThreats = threats.filter(threat => {
    const matchesTag = selectedTag === '' || threat.tags.includes(selectedTag);
    return matchesTag;
  });

  const allTags = Array.from(new Set(threats.flatMap(threat => threat.tags))).sort();

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
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4 mx-auto"></div>
                <p className="text-gray-400">Loading cloud threat intelligence...</p>
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
                      className="h-8 w-8 text-blue-500" 
                      style={{ filter: 'drop-shadow(0 0 10px #3b82f6)' }} 
                    />
                    <h1 
                      className="text-3xl font-bold text-blue-500" 
                      style={{ textShadow: '0 0 10px #3b82f6' }}
                    >
                      Cloud Threat Intelligence
                    </h1>
                  </div>
                  <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                    Access up-to-date cloud-specific threats and security advisories for cloud security assessments, 
                    threat hunting, and cloud infrastructure protection activities.
                  </p>
                </div>

                {/* What is Cloud Threat Intelligence Section */}
                <div className="mb-10 bg-gradient-to-br from-blue-900/20 to-blue-700/10 border-2 border-blue-500/30 rounded-xl p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Cloud className="h-6 w-6 text-blue-400" />
                    <h2 className="text-xl font-bold text-blue-300">What is Cloud Threat Intelligence?</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-blue-200 mb-3 flex items-center">
                          <span className="mr-2">🔍</span>
                          Cloud Threat Research & Discovery:
                        </h3>
                        <div className="space-y-2 text-sm text-blue-100">
                          <p>• Cloud Threat Intelligence aggregates the latest cloud-specific vulnerabilities, misconfigurations, and attack vectors targeting cloud environments.</p>
                          <p>• Our database focuses on cloud platform security issues including AWS, Azure, GCP, and multi-cloud environment threats with actionable intelligence.</p>
                          <p>• Search through cloud-specific threats by keywords, severity levels, affected cloud services, and publication dates.</p>
                          <p>• Each threat entry includes comprehensive details about cloud attack methods, impact assessment, and links to official cloud security advisories.</p>
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
                          <p>• Essential resource for cloud security teams to identify emerging threats targeting cloud infrastructure and services.</p>
                          <p>• Cloud security researchers use threat intel to understand cloud-specific attack patterns and develop cloud defense strategies.</p>
                          <p>• DevSecOps teams leverage cloud threat intelligence to secure CI/CD pipelines and cloud-native applications.</p>
                          <p>• Cloud compliance officers reference threat data for cloud governance reporting and cloud risk management documentation.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-blue-500/20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-semibold text-blue-200 mb-3 flex items-center">
                          <span className="mr-2">🛡️</span>
                          Cloud Threat Classifications:
                        </h3>
                        <div className="space-y-2 text-sm text-blue-100">
                          <p>• <strong>Critical:</strong> Cloud threats that allow immediate infrastructure compromise with minimal cloud access requirements.</p>
                          <p>• <strong>High:</strong> Serious cloud security flaws that could lead to significant data breaches or cloud account takeover.</p>
                          <p>• <strong>Medium:</strong> Moderate cloud vulnerabilities that require specific cloud configurations to exploit effectively.</p>
                          <p>• <strong>Low:</strong> Minor cloud security issues with limited impact or requiring complex multi-cloud attack scenarios.</p>
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
                  {/* Horizontal Statistics with Blue Theme */}
                  <div 
                    className="flex flex-wrap items-center justify-center mb-6" 
                    style={{ gap: '3rem', marginTop: '1rem' }}
                  >
                    <div className="flex items-center space-x-2">
                      <Database className="h-6 w-6 text-blue-500" />
                      <span className="font-semibold text-lg text-blue-500">
                        Total Threats: {filteredThreats.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-6 w-6 text-blue-500" />
                      <span className="font-semibold text-lg text-blue-500">
                        Critical: {filteredThreats.filter(threat => threat.severity.toLowerCase() === 'critical').length}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Shield className="h-6 w-6 text-blue-500" />
                      <span className="font-semibold text-lg text-blue-500">
                        High: {filteredThreats.filter(threat => threat.severity.toLowerCase() === 'high').length}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Eye className="h-6 w-6 text-blue-500" />
                      <span className="font-semibold text-lg text-blue-500">
                        Recent: {filteredThreats.filter(threat => {
                          const date = new Date(threat.published_date);
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

                {/* Threat Intelligence List */}
                <div className="bg-black shadow-xl rounded-xl p-6 mt-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Cloud Threat Advisories</h3>
                  </div>
                  
                  {filteredThreats.length === 0 ? (
                    <div className="text-center py-12">
                      <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No cloud threats found</h3>
                      <p className="text-gray-400">
                        No example cloud threat intelligence data available at the moment.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {filteredThreats.map((threat) => (
                        <div 
                          key={threat.id} 
                          className="bg-black hover:bg-white rounded-lg p-4 border border-gray-700 hover:border-black cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h3 className="text-lg font-medium text-white group-hover:text-black">{threat.id}</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(threat.severity)}`}>
                                  {getSeverityIcon(threat.severity)}
                                  <span className="ml-1">{threat.severity.toUpperCase()}</span>
                                </span>
                                <div className="flex items-center text-sm text-gray-400 group-hover:text-gray-600">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(threat.published_date)}
                                </div>
                              </div>
                              
                              <p className="text-gray-300 group-hover:text-gray-700 mb-4 leading-relaxed">{threat.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                {threat.tags.map((tag) => (
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
                                href={threat.reference}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-blue-700 hover:text-white hover:border-blue-700 group-hover:bg-gray-200 group-hover:text-gray-800 group-hover:border-gray-400 group-hover:hover:bg-blue-700 group-hover:hover:text-white group-hover:hover:border-blue-700 transition-all duration-200"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Advisory
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