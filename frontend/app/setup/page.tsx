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
  Cloud, 
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

export default function CloudEnvironmentSetup() {
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
      name: 'Docker Desktop',
      description: 'Container platform for running cloud-native applications and microservices',
      icon: Terminal,
      downloadUrl: 'https://www.docker.com/products/docker-desktop/',
      category: 'Container Platform'
    },
    {
      name: 'AWS CLI',
      description: 'Command line interface for Amazon Web Services cloud management',
      icon: Cloud,
      downloadUrl: 'https://aws.amazon.com/cli/',
      category: 'Cloud Platform'
    },
    {
      name: 'Kubernetes (K8s)',
      description: 'Container orchestration platform for cloud-native security testing',
      icon: Monitor,
      downloadUrl: 'https://kubernetes.io/docs/tasks/tools/',
      category: 'Orchestration'
    },
    {
      name: 'Terraform',
      description: 'Infrastructure as Code tool for provisioning cloud testing environments',
      icon: Shield,
      downloadUrl: 'https://www.terraform.io/downloads',
      category: 'IaC Tool'
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
      id: 'awscli',
      title: 'Install AWS CLI',
      command: 'curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && sudo ./aws/install',
      description: 'AWS Command Line Interface for cloud service management'
    },
    {
      id: 'kubectl',
      title: 'Install Kubectl',
      command: 'curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl',
      description: 'Kubernetes command-line tool for cluster management'
    },
    {
      id: 'docker',
      title: 'Install Docker',
      command: 'curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh',
      description: 'Container platform for cloud-native applications'
    },
    {
      id: 'terraform',
      title: 'Install Terraform',
      command: 'wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg && sudo apt install terraform -y',
      description: 'Infrastructure as Code tool for cloud provisioning'
    },
    {
      id: 'cloudsec',
      title: 'Install Cloud Security Tools',
      command: 'pip3 install cloudsploit scout-suite prowler-cloud',
      description: 'Cloud security assessment and compliance scanning tools'
    }
  ];

  const cloudConfig = {
    region: 'us-east-1',
    vpc: '10.0.0.0/16',
    publicSubnet: '10.0.1.0/24',
    privateSubnet: '10.0.2.0/24'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="md:pl-64 flex flex-col flex-1">
            <main className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
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
                    <Settings className="h-8 w-8 text-blue-500" />
                    <h1 className="text-2xl font-semibold text-white">Cloud Environment Setup Guide</h1>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    Complete guide for configuring your cloud security testing environment
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
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6 mb-8">
                  <div className="flex">
                    <AlertTriangle className="h-6 w-6 text-blue-400 mt-1" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-blue-300 mb-2">Cloud Security & Compliance Notice</h3>
                      <div className="text-blue-200 space-y-2">
                        <p>• Only test on cloud resources you own or have explicit written permission to assess</p>
                        <p>• Use isolated cloud environments to prevent impact on production workloads</p>
                        <p>• Follow cloud provider terms of service and responsible disclosure practices</p>
                        <p>• Maintain detailed audit logs of all cloud security testing activities</p>
                        <p>• Ensure compliance with data protection regulations and cloud governance policies</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Start Steps */}
                <div className="bg-gray-800 shadow rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-white mb-6">Quick Start Steps</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="bg-blue-700 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <span className="text-white font-bold">1</span>
                      </div>
                      <h3 className="text-white font-medium mb-2">Setup Cloud Tools</h3>
                      <p className="text-sm text-gray-400">Install Docker, AWS CLI, and cloud security tools</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-blue-700 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <span className="text-white font-bold">2</span>
                      </div>
                      <h3 className="text-white font-medium mb-2">Configure Cloud Access</h3>
                      <p className="text-sm text-gray-400">Set up cloud provider credentials and access</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-blue-700 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <span className="text-white font-bold">3</span>
                      </div>
                      <h3 className="text-white font-medium mb-2">Deploy Test Environment</h3>
                      <p className="text-sm text-gray-400">Provision isolated cloud testing infrastructure</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-blue-700 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <span className="text-white font-bold">4</span>
                      </div>
                      <h3 className="text-white font-medium mb-2">Begin Assessment</h3>
                      <p className="text-sm text-gray-400">Start your cloud security assessments</p>
                    </div>
                  </div>
                </div>

                {/* Required Tools */}
                <div className="bg-gray-800 shadow rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-white mb-6">Required Cloud Tools & Software</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tools.map((tool) => (
                      <div key={tool.name} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-700/20 p-2 rounded-lg">
                              <tool.icon className="h-6 w-6 text-blue-400" />
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
                            className="flex items-center px-3 py-1 text-sm bg-blue-700 hover:bg-blue-800 text-white rounded-md transition-colors"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cloud Configuration */}
                <div className="bg-gray-800 shadow rounded-lg p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Cloud Network Configuration</h2>
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
                        <p className="text-xs text-gray-400 mb-1">AWS Region</p>
                        <p className="text-white font-mono">{cloudConfig.region}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-1">VPC CIDR</p>
                        <p className="text-white font-mono">{cloudConfig.vpc}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-1">Public Subnet</p>
                        <p className="text-white font-mono">{cloudConfig.publicSubnet}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-1">Private Subnet</p>
                        <p className="text-white font-mono">{cloudConfig.privateSubnet}</p>
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
                    <BookOpen className="h-6 w-6 text-blue-500" />
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
                  <h2 className="text-xl font-semibold text-white mb-6">Additional Cloud Security Resources</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                      href="https://aws.amazon.com/security/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-5 w-5 text-blue-400 mr-3" />
                      <div>
                        <h3 className="text-white font-medium">AWS Security Hub</h3>
                        <p className="text-sm text-gray-400">AWS cloud security best practices</p>
                      </div>
                    </a>
                    <a
                      href="https://owasp.org/www-project-cloud-security/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-5 w-5 text-blue-400 mr-3" />
                      <div>
                        <h3 className="text-white font-medium">OWASP Cloud Security</h3>
                        <p className="text-sm text-gray-400">Cloud security testing methodology</p>
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