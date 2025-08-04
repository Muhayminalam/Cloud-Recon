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
  Tag
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
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
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
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center space-x-3">
                    <Database className="h-8 w-8 text-red-500" />
                    <h1 className="text-2xl font-semibold text-white">CVE Database</h1>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    Browse and search the latest vulnerability information and exploits
                  </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-gray-800 shadow rounded-lg p-6 mb-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-6">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                          placeholder="Search CVEs by description or tags..."
                        />
                      </div>
                    </div>

                    {/* Search Button */}
                    <div className="lg:col-span-2">
                      <button
                        onClick={handleSearch}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </button>
                    </div>

                    {/* Severity Filter */}
                    <div className="lg:col-span-2">
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          value={severityFilter}
                          onChange={(e) => setSeverityFilter(e.target.value)}
                          className="appearance-none bg-gray-700 border border-gray-600 text-white py-2 pl-10 pr-8 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 w-full"
                        >
                          <option value="all">All Severities</option>
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>

                    {/* Tag Filter */}
                    <div className="lg:col-span-2">
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          value={selectedTag}
                          onChange={(e) => setSelectedTag(e.target.value)}
                          className="appearance-none bg-gray-700 border border-gray-600 text-white py-2 pl-10 pr-8 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 w-full"
                        >
                          <option value="">All Tags</option>
                          {allTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                          ))}
                        </select>
                      </div>
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

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <Database className="h-8 w-8 text-gray-400" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-white">{filteredCVEs.length}</p>
                        <p className="text-gray-400 text-sm">Total CVEs</p>
                      </div>
                    </div>
                  </div>
                  
                  {['critical', 'high', 'medium', 'low'].map(severity => (
                    <div key={severity} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${getSeverityColor(severity)}`}>
                          {getSeverityIcon(severity)}
                        </div>
                        <div className="ml-4">
                          <p className="text-2xl font-bold text-white">
                            {filteredCVEs.filter(cve => cve.severity.toLowerCase() === severity).length}
                          </p>
                          <p className="text-gray-400 text-sm capitalize">{severity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CVE List */}
                <div className="space-y-4">
                  {filteredCVEs.length === 0 ? (
                    <div className="bg-gray-800 shadow rounded-lg p-8 text-center">
                      <Database className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-white">No CVEs found</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {searchTerm || severityFilter !== 'all' || selectedTag
                          ? 'Try adjusting your search or filter criteria.'
                          : 'No CVE data available at the moment.'
                        }
                      </p>
                    </div>
                  ) : (
                    filteredCVEs.map((cve) => (
                      <div key={cve.id} className="bg-gray-800 shadow rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-lg font-medium text-white">{cve.id}</h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(cve.severity)}`}>
                                {getSeverityIcon(cve.severity)}
                                <span className="ml-1">{cve.severity.toUpperCase()}</span>
                              </span>
                              <div className="flex items-center text-sm text-gray-400">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(cve.published_date)}
                              </div>
                            </div>
                            
                            <p className="text-gray-300 mb-4">{cve.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {cve.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300"
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
                              className="inline-flex items-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Load More */}
                {filteredCVEs.length > 0 && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={fetchCVEs}
                      className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Load More CVEs
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