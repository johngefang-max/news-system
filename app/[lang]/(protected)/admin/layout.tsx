'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import {
  Home,
  FileText,
  FolderOpen,
  Settings,
  Users,
  BarChart3,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  User,
  Globe,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: {
    lang: string;
  };
}

export default function AdminLayout({
  children,
  params: { lang },
}: AdminLayoutProps) {
  const locale = lang;
  const t = useTranslations('Admin');
  const nt = useTranslations('Navigation');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/${locale}/login?callbackUrl=/${locale}/admin/dashboard`);
    }
  }, [status, locale, router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${locale}/login` });
  };

  const navigation = [
    {
      name: t('dashboard'),
      href: 'dashboard',
      icon: BarChart3,
      current: false,
    },
    {
      name: t('manageArticles'),
      href: 'articles',
      icon: FileText,
      current: false,
    },
    {
      name: t('manageCategories'),
      href: 'categories',
      icon: FolderOpen,
      current: false,
    },
    {
      name: t('manageUsers'),
      href: 'users',
      icon: Users,
      current: false,
    },
    {
      name: nt('settings'),
      href: 'settings',
      icon: Settings,
      current: false,
    },
  ];

  // 获取当前路径来确定哪个导航项是活跃的
  const getCurrentPath = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const segments = path.split('/');
      const adminIndex = segments.indexOf('admin');
      if (adminIndex !== -1 && segments[adminIndex + 1]) {
        return segments[adminIndex + 1];
      }
    }
    return 'dashboard';
  };

  const currentPath = getCurrentPath();
  const updatedNavigation = navigation.map((item) => ({
    ...item,
    current: item.href === currentPath,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-gray-600 transition-opacity ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`relative flex w-64 flex-1 flex-col bg-white transform transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Sidebar content for mobile */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link href={`/${locale}/admin/dashboard`} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {updatedNavigation.map((item) => (
              <Link
                key={item.name}
                href={`/${locale}/admin/${item.href}`}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href={`/${locale}`}
                target="_blank"
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <Globe className="mr-2 h-4 w-4" />
                {nt('home')}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {nt('logout')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex items-center p-6 border-b border-gray-200">
          <Link href={`/${locale}/admin/dashboard`} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Admin Panel</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {updatedNavigation.map((item) => (
            <Link
              key={item.name}
              href={`/${locale}/admin/${item.href}`}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                item.current
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User section - Desktop */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              href={`/${locale}`}
              target="_blank"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
            >
              <Globe className="mr-2 h-4 w-4" />
              {nt('home')}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {nt('logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User menu */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
