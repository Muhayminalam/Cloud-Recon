'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, User } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ToolCard from '@/components/ToolCard';
import { 
  Search, 
  Zap, 
  FileText, 
  Database, 
  Settings,
  Activity,
  Shield,
  TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!auth.isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const currentUser = await auth.verifyToken();
        if (currentUser) {
          setUser(currentUser);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tools = [
    {
      title: 'Network Scan',
      description: 'Perform comprehensive network reconnaissance and port scanning',
      icon: Search,
      href: '/scan',
      color: 'red' as const
    },
    {
      title: 'Payload Testing',
      description: 'Test various attack payloads including XSS, SQLi, and more',
      icon: Zap,
      href: '/payload',
      color: 'blue' as const
    },
    {
      title: 'Activity Logs',
      description: 'View and manage your penetration testing activity logs',
      icon: FileText,
      href: '/logs',
      color: 'green' as const
    },
    {
      title: 'CVE Database',
      description: 'Access up-to-date vulnerability information and exploits',
      icon: Database,
      href: '/cves',
      color: 'purple' as const
    },
    {
      title: 'Lab Setup',
      description: 'Get guidance on setting up your penetration testing lab',
      icon: Settings,
      href: '/setup',
      color: 'yellow' as const
    }
  ];

  const stats = [
    {
      name: 'Total Scans',
      value: '24',
      icon: Search,
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Payloads Tested',
      value: '156',
      icon: Zap,
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Vulnerabilities Found',
      value: '18',
      icon: Shield,
      change: '+3%',
      changeType: 'increase'
    },
    {
      name: 'Success Rate',
      value: '73%',
      icon: TrendingUp,
      change: '+5%',
      changeType: 'increase'
    }
  ];

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
                  <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
                  <p className="mt-1 text-sm text-gray-400">
                    Welcome back, {user.email}. Here's what's happening with your security testing.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  {stats.map((item) => (
                    <div key={item.name} className="bg-gray-800 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <item.icon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-400 truncate">
                                {item.name}
                              </dt>
                              <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-white">
                                  {item.value}
                                </div>
                                <div className="ml-2 flex items-baseline text-sm font-semibold text-green-400">
                                  {item.change}
                                </div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tools Grid */}
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-white mb-4">Security Testing Tools</h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {tools.map((tool) => (
                      <ToolCard
                        key={tool.title}
                        title={tool.title}
                        description={tool.description}
                        icon={tool.icon}
                        href={tool.href}
                        color={tool.color}
                      />
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800 shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-white mb-4">
                      Recent Activity
                    </h3>
                    <div className="flow-root">
                      <ul className="-mb-8">
                        <li>
                          <div className="relative pb-8">
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center ring-8 ring-gray-800">
                                  <Search className="h-4 w-4 text-white" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-300">
                                    Performed network scan on <span className="font-medium text-white">192.168.1.1</span>
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-400">
                                  2 hours ago
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="relative pb-8">
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-gray-800">
                                  <Zap className="h-4 w-4 text-white" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-300">
                                    Tested XSS payload on <span className="font-medium text-white">example.com</span>
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-400">
                                  4 hours ago
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="relative">
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-gray-800">
                                  <Database className="h-4 w-4 text-white" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-300">
                                    Searched CVE database for <span className="font-medium text-white">Apache vulnerabilities</span>
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-400">
                                  1 day ago
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
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