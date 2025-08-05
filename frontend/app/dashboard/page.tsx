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
  TrendingUp,
  Users,
  Clock,
  AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // First check if user is authenticated without making API call
      if (!auth.isAuthenticated()) {
        router.push('/login');
        return;
      }

      // Get user from cookies first (faster)
      const cachedUser = auth.getCurrentUser();
      if (cachedUser) {
        setUser(cachedUser);
        setIsLoading(false);
      }

      // Then verify with backend in background
      try {
        const currentUser = await auth.verifyToken();
        if (currentUser) {
          setUser(currentUser);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        // Only redirect on auth failure if we don't have cached user
        if (!cachedUser) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mb-4 mx-auto"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
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
      color: 'red' as const,
      gradient: 'from-red-500 to-red-600'
    },
    {
      title: 'Payload Testing',
      description: 'Test various attack payloads including XSS, SQLi, CSRF and more',
      icon: Zap,
      href: '/payload',
      color: 'blue' as const,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Activity Logs',
      description: 'View and manage your penetration testing activity logs',
      icon: FileText,
      href: '/logs',
      color: 'green' as const,
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'CVE Database',
      description: 'Access up-to-date vulnerability information and exploits',
      icon: Database,
      href: '/cves',
      color: 'purple' as const,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Lab Setup',
      description: 'Get guidance on setting up your penetration testing lab',
      icon: Settings,
      href: '/setup',
      color: 'yellow' as const,
      gradient: 'from-yellow-500 to-yellow-600'
    }
  ];

  const stats = [
    {
      name: 'Total Scans',
      value: '24',
      icon: Search,
      change: '+12%',
      changeType: 'increase',
      color: 'red',
      bgGradient: 'from-red-500/20 to-red-600/10'
    },
    {
      name: 'Payloads Tested',
      value: '156',
      icon: Zap,
      change: '+8%',
      changeType: 'increase',
      color: 'blue',
      bgGradient: 'from-blue-500/20 to-blue-600/10'
    },
    {
      name: 'Vulnerabilities Found',
      value: '18',
      icon: AlertTriangle,
      change: '+3%',
      changeType: 'increase',
      color: 'orange',
      bgGradient: 'from-orange-500/20 to-orange-600/10'
    },
    {
      name: 'Success Rate',
      value: '73%',
      icon: TrendingUp,
      change: '+5%',
      changeType: 'increase',
      color: 'green',
      bgGradient: 'from-green-500/20 to-green-600/10'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Performed network scan on',
      target: '192.168.1.1',
      icon: Search,
      time: '2 hours ago',
      status: 'completed',
      color: 'red'
    },
    {
      id: 2,
      action: 'Tested XSS payload on',
      target: 'example.com',
      icon: Zap,
      time: '4 hours ago',
      status: 'success',
      color: 'blue'
    },
    {
      id: 3,
      action: 'Searched CVE database for',
      target: 'Apache vulnerabilities',
      icon: Database,
      time: '1 day ago',
      status: 'completed',
      color: 'purple'
    }
  ];

  const getStatColor = (color: string) => {
    const colors = {
      red: 'text-red-400',
      blue: 'text-blue-400',
      orange: 'text-orange-400',
      green: 'text-green-400'
    };
    return colors[color as keyof typeof colors] || 'text-gray-400';
  };

  const getActivityColor = (color: string) => {
    const colors = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500';
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
                <div className="mb-6">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <Shield className="h-7 w-7" style={{ color: '#dc2626', filter: 'drop-shadow(0 0 10px #dc2626)' }} />
                    <h1 className="text-2xl font-bold" style={{ color: '#dc2626', textShadow: '0 0 10px #dc2626' }}>Security Dashboard</h1>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white">
                      Welcome back, <span className="font-semibold text-white">{user.email}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <p className="text-xs text-white">
                      Last login: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="mx-8 my-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
                  {stats.map((item) => (
                    <div 
                      key={item.name} 
                      className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                      style={{ 
                        backgroundColor: '#dc2626',
                        border: '2px solid #000000'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#b91c1c';
                        e.currentTarget.style.border = '2px solid transparent';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                        e.currentTarget.style.border = '2px solid #000000';
                      }}
                    >
                      <div className="p-6 text-center">
                        <div className="flex justify-center mb-3">
                          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                            <item.icon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white mb-2">
                            {item.name}
                          </p>
                          <div className="flex items-center justify-center space-x-2">
                            <p className="text-xl font-bold text-white">
                              {item.value}
                            </p>
                            <span className="text-sm font-semibold text-white">
                              {item.change}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tools Grid */}
                <div className="mb-8">
                  <div className="flex flex-col items-center space-y-4">
                    {tools.map((tool) => (
                      <a
                        key={tool.title}
                        href={tool.href}
                        className="w-full max-w-2xl rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer"
                        style={{ 
                          backgroundColor: '#000000',
                          border: '2px solid #000000',
                          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#111111';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#000000';
                        }}
                      >
                        <div className="p-6 text-center">
                          <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                              <tool.icon className="h-8 w-8" style={{ color: '#dc2626' }} />
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-bold mb-3 transition-colors duration-300" style={{ color: '#dc2626' }}>
                            {tool.title}
                          </h3>
                          
                          <p className="text-sm leading-relaxed opacity-90 hover:opacity-100 transition-opacity duration-300 text-white">
                            {tool.description}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-lg shadow-lg">
                  <div className="px-4 py-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Activity className="h-5 w-5 text-red-500" />
                      <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                    </div>
                    
                    <div className="space-y-2">
                      {recentActivities.map((activity, index) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-700/50 to-gray-800/30 rounded-lg hover:from-gray-700/70 hover:to-gray-800/50 transition-all duration-300">
                          <div className={`flex-shrink-0 w-8 h-8 ${getActivityColor(activity.color)} rounded-full flex items-center justify-center shadow-md`}>
                            <activity.icon className="h-4 w-4 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-300 truncate">
                              {activity.action}{' '}
                              <span className="font-semibold text-white">{activity.target}</span>
                            </p>
                          </div>
                          
                          <div className="flex-shrink-0 text-xs text-gray-500">
                            {activity.time}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* View All Button */}
                    <div className="mt-4 text-center">
                      <a
                        href="/logs"
                        className="inline-flex items-center px-4 py-2 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm text-white"
                        style={{ backgroundColor: '#dc2626' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#b91c1c';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc2626';
                        }}
                      >
                        <FileText className="mr-2 h-6 w-4 text-white" />
                        View All Logs
                      </a>
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