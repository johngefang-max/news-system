'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { locale } from 'next-intl/router';

interface FooterProps {
  currentLocale: string;
}

export function Footer({ currentLocale }: FooterProps) {
  const t = useTranslations('Navigation');

  const footerLinks = [
    { name: t('home'), href: '/' },
    { name: t('news'), href: '/news' },
    { name: t('categories'), href: '/categories' },
  ];

  const legalLinks = [
    { name: currentLocale === 'zh' ? '隐私政策' : 'Privacy Policy', href: '/privacy' },
    { name: currentLocale === 'zh' ? '服务条款' : 'Terms of Service', href: '/terms' },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-bold text-xl text-gray-900">
                {currentLocale === 'zh' ? '新闻门户' : 'News Portal'}
              </span>
            </div>
            <p className="text-gray-600 max-w-md">
              {currentLocale === 'zh'
                ? '为您提供最新、最全面的国际新闻资讯，让您随时了解世界动态。'
                : 'Providing you with the latest and most comprehensive international news and information.'
              }
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              {currentLocale === 'zh' ? '快速链接' : 'Quick Links'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={`/${currentLocale}${link.href}`}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              {currentLocale === 'zh' ? '法律信息' : 'Legal'}
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={`/${currentLocale}${link.href}`}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              {currentLocale === 'zh'
                ? `© ${new Date().getFullYear()} 新闻门户. 保留所有权利.`
                : `© ${new Date().getFullYear()} News Portal. All rights reserved.`
              }
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-gray-500 text-sm">
                Built with Next.js & Tailwind CSS
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}