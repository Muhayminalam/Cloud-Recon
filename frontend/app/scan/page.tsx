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
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsScanning(true);
    setScanResult(null);

    try {
      const response = await apiClient.performScan(target);
      setScanResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const getPortStateColor = (state: string) => {
    switch (state) {
      case 'open':
        return 'text-green-400 bg-green-400/10';
      case 'closed':
        return 'text-red-400 bg-red-400/10';
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
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center space-x-3">
                    <Search className="h-8 w-8 text-red-500" />
                    <h1 className="text-2xl font-semibold text-white">Network Scanner</h1>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    Perform comprehensive network reconnaissance and port scanning
                  </p>
                </div>

                {/* Scan Form */}
                <div className="bg-gray-800 shadow rounded-lg p-6 mb-8">
                  <form onSubmit={handleScan} className="space-y-4">
                    <div>
                      <label htmlFor="target" className="block text-sm font-medium text-gray-300 mb-2">
                        Target (IP Address or Hostname)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="target"
                          value={target}
                          onChange={(e) => setTarget(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                          placeholder="192.168.1.1 or example.com"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-900/50 border border-red-500 rounded-md p-4">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                          <div className="ml-3">
                            <p className="text-sm text-red-300">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isScanning}
                      className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isScanning ? (
                        <>
                          <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Search className="-ml-1 mr-2 h-5 w-5" />
                          Start Scan
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Scan Results */}
                {scanResult && (
                  <div className="space-y-6">
                    {/* Scan Summary */}
                    <div className="bg-gray-800 shadow rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-white">Scan Summary</h2>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          <span className="text-green-400 text-sm font-medium">
                            {scanResult.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <Globe className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-xs text-gray-400">Target</p>
                              <p className="text-sm font-medium text-white">{scanResult.target}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <Shield className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-xs text-gray-400">Host Status</p>
                              <p className="text-sm font-medium text-white">{scanResult.host_status}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-xs text-gray-400">Latency</p>
                              <p className="text-sm font-medium text-white">{scanResult.latency}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <Search className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-xs text-gray-400">Open Ports</p>
                              <p className="text-sm font-medium text-white">
                                {scanResult.ports.filter(p => p.state === 'open').length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* OS Information */}
                    <div className="bg-gray-800 shadow rounded-lg p-6">
                      <h2 className="text-lg font-medium text-white mb-4">Operating System</h2>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-medium">{scanResult.os_info.name}</p>
                            <p className="text-gray-400 text-sm">{scanResult.os_info.version}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-medium">{scanResult.os_info.accuracy}</p>
                            <p className="text-gray-400 text-sm">Accuracy</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Port Scan Results */}
                    <div className="bg-gray-800 shadow rounded-lg p-6">
                      <h2 className="text-lg font-medium text-white mb-4">Port Scan Results</h2>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Port
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                State
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Service
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Version
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {scanResult.ports.map((port, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                  {port.port}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPortStateColor(port.state)}`}>
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
                      <div className="bg-gray-800 shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-white mb-4">Detected Services</h2>
                        <div className="space-y-3">
                          {scanResult.services.map((service, index) => (
                            <div key={index} className="bg-gray-700 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-white font-medium">
                                    {service.service} (Port {service.port})
                                  </p>
                                  <p className="text-gray-400 text-sm">{service.product}</p>
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