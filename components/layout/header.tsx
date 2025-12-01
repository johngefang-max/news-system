'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { Search, Menu, X, Globe, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('Navigation');
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query)}`);
      setIsSearchOpen(false);
    }
  };

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = pathname.replace(/^\/[^\/]+/, `/${newLocale}`);
    const isAdmin = !!(session && (session.user as any)?.role === 'ADMIN');
    if (isAdmin) {
      (async () => {
        try {
          const res = await fetch('/api/settings');
          if (res.ok) {
            const data = await res.json();
            const siteName = data?.data?.siteName ?? 'News Portal';
            const themeValue = data?.data?.theme ?? (
              document.documentElement.classList.contains('dark') ? 'dark' : 'light'
            );
            await fetch('/api/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                siteName,
                defaultLanguage: newLocale,
                theme: themeValue,
              })
            });
          }
        } catch (_) {}
        router.push(currentPath);
      })();
    } else {
      router.push(currentPath);
    }
  };

  const isActive = (path: string) => {
    return pathname === `/${locale}${path}`;
  };

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('news'), href: '/news' },
    { name: t('categories'), href: '/categories' },
  ];

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    }
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        const siteName = data?.data?.siteName ?? 'News Portal';
        const defaultLanguage = data?.data?.defaultLanguage ?? locale;
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteName, defaultLanguage, theme: nextTheme })
        });
      }
    } catch (_) {}
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              {locale === 'zh' ? '新闻门户' : 'News Portal'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={`/${locale}${item.href}`}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive(item.href)
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label={t('search')}
            >
              <Search className="w-5 h-5" />
            </button>

          {/* Language Switcher */}
          <div className="relative group">
              <button
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label={t('language')}
              >
                <Globe className="w-5 h-5" />
              </button>
              <div className="absolute right-0 mt-2 w-24 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <button
                  onClick={() => handleLanguageChange('zh')}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-t-lg ${
                    locale === 'zh' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-b-lg ${
                    locale === 'en' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* User Menu */}
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <User className="w-5 h-5" />
                  <span className="hidden md:block text-sm font-medium">
                    {session.user?.name || 'Admin'}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    href={`/${locale}/admin/dashboard`}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{t('admin')}</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link href={`/${locale}/login`}>
                <Button variant="outline" size="sm">
                  {t('login')}
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Theme Toggle (admin) */}
          {session && (session.user as any)?.role === 'ADMIN' && (
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Search Bar - Expandable */}
        {isSearchOpen && (
          <div className="py-4 border-t border-gray-200">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                name="search"
                placeholder={t('search') || '搜索...'}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={`/${locale}${item.href}`}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {session && (
              <Link
                href={`/${locale}/admin/dashboard`}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('admin')}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
