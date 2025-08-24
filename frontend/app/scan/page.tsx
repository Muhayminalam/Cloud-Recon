'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Search, Globe, Shield, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface ScanResult {
  target: string;
  status: 'completed' | 'running' | 'failed';
  ports: Array<{
    port: number;
    service: string;
    state: 'open' | 'closed' | 'filtered';
    version: string;
  }>;
  os_info: {
    name: string;
    version: string;
    accuracy: string;
  };
  services: Array<{
    port: number;
    service: string;
    product: string;
    extrainfo: string;
  }>;
  scan_time: string;
  host_status: string;
  latency: string;
}

export default function NetworkScan() {
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
    
    // Load previous scan results from localStorage on component mount
    const savedResult = localStorage.getItem('lastScanResult');
    if (savedResult) {
      try {
        const parsedResult = JSON.parse(savedResult);
        setScanResult(parsedResult);
      } catch (e) {
        console.error('Error loading saved scan result:', e);
      }
    }
  }, [router]);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validation check
    if (!target.trim()) {
      setValidationError('Please enter a target IP address or hostname');
      setError('');
      return;
    }

    setError('');
    setValidationError('');
    setIsScanning(true);
    setScanResult(null);

    try {
      const response = await apiClient.performScan(target);
      const result = response.data;
      setScanResult(result);
      
      // Save scan result to localStorage
      localStorage.setItem('lastScanResult', JSON.stringify(result));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleClearInput = () => {
    setTarget('');
    setValidationError('');
    setError('');
  };

  const getPortStateColor = (state: string) => {
    switch (state) {
      case 'open':
        return 'text-green-400 bg-green-400/10';
      case 'closed':
        return 'text-blue-700 bg-blue-700/10';
      case 'filtered':
        return 'text-yellow-400 bg-yellow-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

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
                    <Search 
                      className="h-8 w-8" 
                      style={{ color: '#dc2626', filter: 'drop-shadow(0 0 10px #dc2626)' }} 
                    />
                    <h1 
                      className="text-3xl font-bold" 
                      style={{ color: '#dc2626', textShadow: '0 0 10px #dc2626' }}
                    >
                      Network Scanner
                    </h1>
                  </div>
                  <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                    Perform comprehensive network reconnaissance and port scanning to discover open services, 
                    identify operating systems, and map network infrastructure for security assessment.
                  </p>
                </div>

                {/* How to Use Section */}
                <div className="mb-10 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="h-6 w-6 text-blue-400" />
                    <h2 className="text-xl font-bold text-blue-300">How to Use Network Scanner</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-100">
                    <div>
                      <h3 className="font-semibold text-blue-200 mb-2">📍 Target Input:</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Enter an IP address (e.g., 192.168.1.1)</li>
                        <li>• Or use a hostname (e.g., example.com)</li>
                        <li>• Single targets only for focused scanning</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-200 mb-2">🔍 What It Does:</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Discovers open/closed/filtered ports</li>
                        <li>• Identifies running services and versions</li>
                        <li>• Detects operating system information</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-200 mb-2">⚠️ Legal Notice:</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Only scan systems you own</li>
                        <li>• Get explicit permission first</li>
                        <li>• Follow responsible disclosure</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-200 mb-2">📊 Results Include:</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Port status and service details</li>
                        <li>• OS fingerprinting results</li>
                        <li>• Response times and host status</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Scan Form */}
                <div className="bg-gray-800 shadow-xl rounded-xl p-8 mb-10">
                  <div className="flex flex-col items-center space-y-0">
                    <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="target" className="block text-2xl font-bold text-white text-center" style={{ marginBottom: '16px' }}>
                        Target (IP Address or Hostname)
                      </label>
                      <div 
                        className="relative rounded-xl bg-gray-700 focus-within:ring-2 focus-within:ring-red-500 transition-all duration-300"
                        style={{ 
                          width: '320px',
                          height: '60px',
                          margin: '0 auto',
                          border: '2px solid #4b5563'
                        }}
                      >
                        <div 
                          className="absolute flex items-center pointer-events-none"
                          style={{
                            top: '50%',
                            left: '16px',
                            transform: 'translateY(-50%)'
                          }}
                        >
                          <Globe className="h-6 w-6 text-gray-400" />
                        </div>
                        
                        {/* Clear button - only show when there's text */}
                        {target && (
                          <button
                            type="button"
                            onClick={handleClearInput}
                            className="absolute flex items-center justify-center rounded-full bg-gray-600 hover:bg-gray-500 transition-colors duration-200"
                            style={{
                              top: '50%',
                              right: '12px',
                              transform: 'translateY(-50%)',
                              width: '24px',
                              height: '24px'
                            }}
                          >
                            <span className="text-white text-lg font-bold" style={{ lineHeight: '1' }}>×</span>
                          </button>
                        )}
                        
                        <input
                          type="text"
                          id="target"
                          value={target}
                          onChange={(e) => {
                            setTarget(e.target.value);
                            setValidationError('');
                            setError('');
                          }}
                          className="text-white placeholder-gray-400 focus:outline-none bg-transparent rounded-xl transition-all duration-300"
                          style={{ 
                            width: '320px',
                            height: '60px',
                            paddingLeft: '50px',
                            paddingRight: target ? '48px' : '16px',
                            fontSize: '18px',
                            textAlign: 'center',
                            border: 'none',
                            backgroundColor: 'transparent'
                          }}
                          placeholder="192.168.1.1 or example.com"
                        />
                      </div>
                    </div>

                    {/* Validation Error */}
                    {validationError && (
                      <div 
                        className="bg-orange-900/50 border border-orange-500 rounded-xl p-4"
                        style={{ 
                          width: '320px',
                          marginBottom: '12px'
                        }}
                      >
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-orange-400 mr-3" />
                          <p className="text-sm text-orange-300">{validationError}</p>
                        </div>
                      </div>
                    )}

                    {/* API Error */}
                    {error && (
                      <div 
                        className="bg-red-900/50 border border-red-500 rounded-xl p-4"
                        style={{ 
                          width: '320px',
                          marginBottom: '12px'
                        }}
                      >
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-blue-700 mr-3" />
                          <p className="text-sm text-red-300">{error}</p>
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: '12px' }}>
                      <button
                        type="submit"
                        disabled={isScanning}
                        onClick={handleScan}
                        className="inline-flex items-center justify-center font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '16px 32px',
                          fontSize: '18px',
                          minWidth: '192px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isScanning) e.currentTarget.style.backgroundColor = '#b91c1c';
                        }}
                        onMouseLeave={(e) => {
                          if (!isScanning) e.currentTarget.style.backgroundColor = '#dc2626';
                        }}
                      >
                        {isScanning ? (
                          <>
                            <Loader className="animate-spin -ml-1 mr-3 h-6 w-6" />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <Search className="-ml-1 mr-3 h-6 w-6" />
                            Start Scan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scan Results */}
                {scanResult && (
                  <div className="space-y-8">
                    {/* Scan Summary */}
                    <div className="bg-gray-800 shadow-xl rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Scan Summary</h2>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-6 w-6 text-green-400" />
                          <span className="text-green-400 font-semibold">
                            {scanResult.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gray-700 rounded-xl p-4">
                          <div className="flex items-center">
                            <Globe className="h-6 w-6 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-400">Target</p>
                              <p className="font-semibold text-white">{scanResult.target}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-xl p-4">
                          <div className="flex items-center">
                            <Shield className="h-6 w-6 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-400">Host Status</p>
                              <p className="font-semibold text-white">{scanResult.host_status}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-xl p-4">
                          <div className="flex items-center">
                            <Clock className="h-6 w-6 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-400">Latency</p>
                              <p className="font-semibold text-white">{scanResult.latency}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-xl p-4">
                          <div className="flex items-center">
                            <Search className="h-6 w-6 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-400">Open Ports</p>
                              <p className="font-semibold text-white">
                                {scanResult.ports.filter(p => p.state === 'open').length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* OS Information */}
                    <div className="bg-gray-800 shadow-xl rounded-xl p-6">
                      <h2 className="text-2xl font-bold text-white mb-6">Operating System</h2>
                      <div className="bg-gray-700 rounded-xl p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xl font-semibold text-white">{scanResult.os_info.name}</p>
                            <p className="text-gray-400">{scanResult.os_info.version}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-400">{scanResult.os_info.accuracy}</p>
                            <p className="text-gray-400 text-sm">Accuracy</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Port Scan Results */}
                    <div className="bg-gray-800 shadow-xl rounded-xl p-6">
                      <h2 className="text-2xl font-bold text-white mb-6">Port Scan Results</h2>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                Port
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                State
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                Service
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                Version
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {scanResult.ports.map((port, index) => (
                              <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                  {port.port}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPortStateColor(port.state)}`}>
                                    {port.state}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                  {port.service}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                  {port.version || 'Unknown'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Services */}
                    {scanResult.services.length > 0 && (
                      <div className="bg-gray-800 shadow-xl rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Detected Services</h2>
                        <div className="space-y-4">
                          {scanResult.services.map((service, index) => (
                            <div key={index} className="bg-gray-700 rounded-xl p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-lg font-semibold text-white">
                                    {service.service} (Port {service.port})
                                  </p>
                                  <p className="text-gray-400">{service.product}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-gray-300 text-sm">{service.extrainfo}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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