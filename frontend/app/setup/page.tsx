'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { 
  Settings, 
  Download, 
  Server, 
  Monitor, 
  Shield, 
  Terminal,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LabSetup() {
  const [setupContent, setSetupContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCommand, setCopiedCommand] = useState('');
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    } else {
      fetchSetupGuide();
    }
  }, [router]);

  const fetchSetupGuide = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiClient.getSetupGuide();
      setSetupContent(response.data.content);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch setup guide');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, commandId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(commandId);
      setTimeout(() => setCopiedCommand(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const tools = [
    {
      name: 'Kali Linux',
      description: 'Complete penetration testing distribution with pre-installed tools',
      icon: Terminal,
      downloadUrl: 'https://www.kali.org/get-kali/',
      category: 'Operating System'
    },
    {
      name: 'Metasploitable 2',
      description: 'Intentionally vulnerable Linux distribution for practice',
      icon: Server,
      downloadUrl: 'https://sourceforge.net/projects/metasploitable/',
      category: 'Target System'
    },
    {
      name: 'DVWA',
      description: 'Damn Vulnerable Web Application for web security testing',
      icon: Monitor,
      downloadUrl: 'https://github.com/digininja/DVWA',
      category: 'Web Application'
    },
    {
      name: 'VirtualBox',
      description: 'Free virtualization platform for running virtual machines',
      icon: Shield,
      downloadUrl: 'https://www.virtualbox.org/wiki/Downloads',
      category: 'Virtualization'
    }
  ];

  const commands = [
    {
      id: 'update',
      title: 'System Update',
      command: 'sudo apt update && sudo apt upgrade -y',
      description: 'Update package lists and upgrade system packages'
    },
    {
      id: 'nmap',
      title: 'Install Nmap',
      command: 'sudo apt install nmap -y',
      description: 'Network discovery and security auditing tool'
    },
    {
      id: 'nikto',
      title: 'Install Nikto',
      command: 'sudo apt install nikto -y',
      description: 'Web server scanner for vulnerabilities'
    },
    {
      id: 'dirb',
      title: 'Install Dirb',
      command: 'sudo apt install dirb -y',
      description: 'Web content scanner for hidden directories'
    },
    {
      id: 'burpsuite',
      title: 'Install Burp Suite',
      command: 'sudo apt install burpsuite -y',
      description: 'Web application security testing platform'
    },
    {
      id: 'sqlmap',
      title: 'Install SQLMap',
      command: 'sudo apt install sqlmap -y',
      description: 'Automatic SQL injection and database takeover tool'
    }
  ];

  const networkConfig = {
    attackerIP: '192.168.100.10',
    targetIP: '192.168.100.20',
    gateway: '192.168.100.1',
    subnet: '192.168.100.0/24'
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
                    <Settings className="h-8 w-8 text-red-500" />
                    <h1 className="text-2xl font-semibold text-white">Lab Setup Guide</h1>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    Complete guide for setting up your penetration testing laboratory
                  </p>
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

                {/* Safety Warning */}
                <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-6 mb-8">
                  <div className="flex">
                    <AlertTriangle className="h-6 w-6 text-yellow-400 mt-1" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-yellow-300 mb-2">⚠️ Legal & Safety Notice</h3>
                      <div className="text-yellow-200 space-y-2">
                        <p>• Only test on systems you own or have explicit written permission to test</p>
                        <p>• Use isolated networks to prevent accidental damage to production systems</p>
                        <p>• Follow responsible disclosure practices for any vulnerabilities found</p>
                        <p>• Keep detailed logs of all testing activities</p>
                        <p>• Ensure compliance with local laws and regulations</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Start Steps */}
                <div className="bg-gray-800 shadow rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-white mb-6">Quick Start Steps</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="bg-red-600 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <span className="text-white font-bold">1</span>
                      </div>
                      <h3 className="text-white font-medium mb-2">Download Tools</h3>
                      <p className="text-sm text-gray-400">Get VirtualBox, Kali Linux, and target systems</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-red-600 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <span className="text-white font-bold">2</span>
                      </div>
                      <h3 className="text-white font-medium mb-2">Setup Network</h3>
                      <p className="text-sm text-gray-400">Configure isolated virtual network</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-red-600 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <span className="text-white font-bold">3</span>
                      </div>
                      <h3 className="text-white font-medium mb-2">Install Tools</h3>
                      <p className="text-sm text-gray-400">Set up penetration testing tools</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-red-600 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <span className="text-white font-bold">4</span>
                      </div>
                      <h3 className="text-white font-medium mb-2">Start Testing</h3>
                      <p className="text-sm text-gray-400">Begin your security assessments</p>
                    </div>
                  </div>
                </div>

                {/* Required Tools */}
                <div className="bg-gray-800 shadow rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-white mb-6">Required Tools & Software</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tools.map((tool) => (
                      <div key={tool.name} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="bg-red-600/20 p-2 rounded-lg">
                              <tool.icon className="h-6 w-6 text-red-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-medium">{tool.name}</h3>
                              <p className="text-sm text-gray-400 mb-2">{tool.description}</p>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-400/10 text-blue-400">
                                {tool.category}
                              </span>
                            </div>
                          </div>
                          <a
                            href={tool.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Network Configuration */}
                <div className="bg-gray-800 shadow rounded-lg p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Network Configuration</h2>
                    <button
                      onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                      className="flex items-center px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
                    >
                      {showSensitiveInfo ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Show Details
                        </>
                      )}
                    </button>
                  </div>
                  
                  {showSensitiveInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-1">Network Range</p>
                        <p className="text-white font-mono">{networkConfig.subnet}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-1">Gateway</p>
                        <p className="text-white font-mono">{networkConfig.gateway}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-1">Attacker IP</p>
                        <p className="text-white font-mono">{networkConfig.attackerIP}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-1">Target IP</p>
                        <p className="text-white font-mono">{networkConfig.targetIP}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Installation Commands */}
                <div className="bg-gray-800 shadow rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-white mb-6">Installation Commands</h2>
                  <div className="space-y-4">
                    {commands.map((cmd) => (
                      <div key={cmd.id} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white font-medium">{cmd.title}</h3>
                          <button
                            onClick={() => copyToClipboard(cmd.command, cmd.id)}
                            className="flex items-center px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 rounded transition-colors"
                          >
                            {copiedCommand === cmd.id ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{cmd.description}</p>
                        <div className="bg-gray-900 rounded p-3">
                          <code className="text-green-400 text-sm font-mono">{cmd.command}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Setup Guide Content */}
                <div className="bg-gray-800 shadow rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <BookOpen className="h-6 w-6 text-red-500" />
                    <h2 className="text-xl font-semibold text-white">Detailed Setup Guide</h2>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                      {setupContent}
                    </pre>
                  </div>
                </div>

                {/* Additional Resources */}
                <div className="bg-gray-800 shadow rounded-lg p-6 mt-8">
                  <h2 className="text-xl font-semibold text-white mb-6">Additional Resources</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                      href="https://www.offensive-security.com/metasploit-unleashed/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-5 w-5 text-red-400 mr-3" />
                      <div>
                        <h3 className="text-white font-medium">Metasploit Unleashed</h3>
                        <p className="text-sm text-gray-400">Free Metasploit course</p>
                      </div>
                    </a>
                    <a
                      href="https://owasp.org/www-project-webgoat/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-5 w-5 text-red-400 mr-3" />
                      <div>
                        <h3 className="text-white font-medium">OWASP WebGoat</h3>
                        <p className="text-sm text-gray-400">Vulnerable web application</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}