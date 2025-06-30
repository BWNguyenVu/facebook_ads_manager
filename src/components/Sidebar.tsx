'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Upload, 
  Eye, 
  Settings, 
  BarChart3, 
  Facebook,
  FileText,
  Activity,
  DollarSign,
  BookOpen
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Upload CSV', href: '/upload', icon: Upload },
  { name: 'Campaigns', href: '/campaigns', icon: Activity },
  { name: 'Campaign Logs', href: '/logs', icon: FileText },
  { name: 'Account Spend', href: '/spend', icon: DollarSign },
  { name: 'Statistics', href: '/stats', icon: BarChart3 },
  { name: 'Hướng Dẫn Sử Dụng', href: '/documentation', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-slate-50 to-blue-50/30 backdrop-blur-lg border-r border-white/20 shadow-xl">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Facebook className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Facebook Ads
            </span>
            <span className="text-sm text-gray-500 font-medium">Manager Pro</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-[1.02]',
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-700 hover:bg-white/70 hover:text-gray-900 hover:shadow-lg backdrop-blur-sm'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200',
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-500 group-hover:text-gray-700 group-hover:scale-110'
                )}
              />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-80"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/20 p-4 bg-white/30 backdrop-blur-sm">
        <div className="text-xs text-gray-600 text-center leading-relaxed">
          <div className="font-semibold text-gray-800 mb-1">Facebook Ads Manager v2.0</div>
          <div className="flex items-center justify-center space-x-1 text-gray-500">
            <span>Built with</span>
            <span className="font-medium text-blue-600">Next.js</span>
            <span>&</span>
            <span className="font-medium text-green-600">MongoDB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
