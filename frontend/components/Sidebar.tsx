'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Zap, 
  FileText, 
  Shield, 
  Settings, 
  Database,
  Home
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Network Scan', href: '/scan', icon: Search },
  { name: 'Payload Testing', href: '/payload', icon: Zap },
  { name: 'Activity Logs', href: '/logs', icon: FileText },
  { name: 'CVE Database', href: '/cves', icon: Database },
  { name: 'Lab Setup', href: '/setup', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-gray-800 border-r border-gray-700">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <Shield className="h-8 w-8 text-red-500" />
            <span className="ml-2 text-xl font-semibold text-white">RedRecon</span>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5
                      ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}
                    `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-xs text-gray-400">
                RedRecon v1.0.0
              </p>
              <p className="text-xs text-gray-500">
                Red Team Simulation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}