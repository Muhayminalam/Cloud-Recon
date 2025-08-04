'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
}

export default function ToolCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color = 'red' 
}: ToolCardProps) {
  const colorClasses = {
    red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  };

  return (
    <Link href={href}>
      <div className="group cursor-pointer">
        <div className={`
          relative p-6 bg-gradient-to-br ${colorClasses[color]} 
          rounded-lg shadow-lg transition-all duration-200 
          group-hover:shadow-xl group-hover:scale-105
        `}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                {title}
              </h3>
              <p className="text-white/80 text-sm">
                {description}
              </p>
            </div>
            <div className="ml-4">
              <Icon className="h-8 w-8 text-white/90 group-hover:text-white transition-colors" />
            </div>
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </div>
    </Link>
  );
}