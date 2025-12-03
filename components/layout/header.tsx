'use client';

import { useState, useEffect } from 'react';
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
  const safePathname = pathname || '/';
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // 强制设置浅色模式
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }
  }, []);

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
    const currentPath = safePathname.replace(/^\/[^\/]+/, `/${newLocale}`);
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
    return safePathname === `/${locale}${path}`;
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
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
            <span className="font-bold text-xl text-foreground">
              {locale === 'zh' ? '新闻门户' : 'News Portal'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={`/${locale}${item.href}`}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-foreground'
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
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t('search')}
            >
              <Search className="w-5 h-5" />
            </button>

          {/* Language Switcher */}
          <div className="relative group">
              <button
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t('language')}
              >
                <Globe className="w-5 h-5" />
              </button>
              <div className="absolute right-0 mt-2 w-24 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <button
                  onClick={() => handleLanguageChange('zh')}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-t-lg transition-colors ${
                    locale === 'zh' ? 'bg-primary text-primary-foreground' : 'text-popover-foreground'
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-b-lg transition-colors ${
                    locale === 'en' ? 'bg-primary text-primary-foreground' : 'text-popover-foreground'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="relative group">
              <button
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="p-2 text-muted-foreground cursor-not-allowed opacity-50"
                aria-label="Theme toggle disabled"
                title="该功能未上线"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-3 py-2 text-sm text-popover-foreground">
                  该功能未上线
                </div>
              </div>
            </div>

            {/* User Menu */}
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <User className="w-5 h-5" />
                  <span className="hidden md:block text-sm font-medium">
                    {session.user?.name || 'Admin'}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    href={`/${locale}/admin/dashboard`}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground rounded-t-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{t('admin')}</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground rounded-b-lg transition-colors"
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
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar - Expandable */}
        {isSearchOpen && (
          <div className="py-4 border-t border-border">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                name="search"
                placeholder={t('search') || '搜索...'}
                className="w-full px-4 py-2 pl-10 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="px-4 py-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={`/${locale}${item.href}`}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground hover:text-foreground hover:bg-accent'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {session && (
              <Link
                href={`/${locale}/admin/dashboard`}
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-foreground hover:bg-accent"
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
