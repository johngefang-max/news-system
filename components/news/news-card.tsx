'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { formatRelativeTime } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui';
import { Calendar, Clock, ArrowRight, Star } from 'lucide-react';
import type { NewsCardProps as INewsCardProps } from '@/types';

export interface NewsCardProps {
  article: {
    id: string;
    slug: string;
    status: string;
    featured: boolean;
    createdAt: string;
    publishedAt: string | null;
    locales: Array<{
      language: string;
      title: string;
      excerpt: string | null;
    }>;
    categories: Array<{
      id: string;
      slug: string;
      locales: Array<{
        language: string;
        name: string;
      }>;
    }>;
    author?: {
      name: string | null;
    };
  };
  locale: string;
  showExcerpt?: boolean;
  showCategory?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
  className?: string;
  variant?: 'default' | 'featured' | 'compact';
}

export function NewsCard({
  article,
  locale,
  showExcerpt = true,
  showCategory = true,
  showAuthor = false,
  showDate = true,
  className = '',
  variant = 'default',
}: NewsCardProps) {
  const t = useTranslations('HomePage');
  const dt = useTranslations('DateTime');

  // 获取当前语言的内容
  const currentLocaleContent = article.locales.find(
    (localeContent) => localeContent.language === locale
  ) || article.locales[0];

  // 获取当前语言的分类
  const currentLocaleCategories = article.categories
    .map((category) => ({
      ...category,
      name: category.locales.find(
        (localeContent) => localeContent.language === locale
      )?.name || category.locales[0]?.name || category.slug,
    }))
    .filter(Boolean);

  if (!currentLocaleContent) {
    return null;
  }

  const featured = article.featured;
  const publishDate = article.publishedAt || article.createdAt;

  const cardContent = (
    <Card
      className={`news-card group relative cursor-pointer overflow-hidden ${
        variant === 'featured' ? 'ring-2 ring-blue-500 shadow-lg' : ''
      } ${variant === 'compact' ? 'shadow-sm' : 'shadow-md'} ${className}`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1.5 font-medium flex items-center space-x-1">
          <Star className="w-3 h-3 fill-current" />
          <span>{locale === 'zh' ? '精选' : 'Featured'}</span>
        </div>
      )}

      <CardContent className="relative z-10 p-6">
        {/* Title */}
        <h3 className="news-card-title transition-colors group-hover:text-blue-600">
          {currentLocaleContent.title}
        </h3>

        {/* Excerpt */}
        {showExcerpt && currentLocaleContent.excerpt && (
          <p className="news-card-excerpt">
            {currentLocaleContent.excerpt}
          </p>
        )}

        {/* Categories */}
        {showCategory && currentLocaleCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {currentLocaleCategories.slice(0, 3).map((category) => (
              <Link
                key={category.id}
                href={`/${locale}/categories/${category.slug}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            {/* Date */}
            {showDate && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span
                  className="font-medium"
                  title={new Date(publishDate).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                  })}
                >
                  {formatRelativeTime(publishDate, locale)}
                </span>
              </div>
            )}

            {/* Author */}
            {showAuthor && article.author?.name && (
              <div className="flex items-center space-x-1">
                <span>{article.author.name}</span>
              </div>
            )}
          </div>

          {/* Reading time indicator */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-3 h-3" />
            <span className="text-xs font-medium">
              {locale === 'zh' ? '阅读' : 'Read'}
            </span>
          </div>
        </div>

        
      </CardContent>
      <div className="absolute inset-0 z-0 bg-blue-50 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none rounded-lg" />
    </Card>
  );

  if (variant === 'featured') {
    return (
      <Link href={`/${locale}/news/${article.slug}`} className="block">
        {cardContent}
      </Link>
    );
  }

  return (
    <Link href={`/${locale}/news/${article.slug}`} className="block">
      {cardContent}
    </Link>
  );
}

// Featured News Card Component for homepage hero section
export function FeaturedNewsCard({ article, locale }: NewsCardProps) {
  const currentLocaleContent = article.locales.find(
    (localeContent) => localeContent.language === locale
  ) || article.locales[0];

  if (!currentLocaleContent) return null;

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />

      <div className="relative p-8 md:p-12">
        {/* Featured Badge */}
        <div className="inline-flex items-center space-x-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
          <Star className="w-4 h-4 fill-current" />
          <span>{locale === 'zh' ? '精选文章' : 'Featured Article'}</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          <Link href={`/${locale}/news/${article.slug}`} className="hover:text-blue-600 transition-colors">
            {currentLocaleContent.title}
          </Link>
        </h2>

        {/* Excerpt */}
        {currentLocaleContent.excerpt && (
          <p className="text-gray-700 text-lg mb-6 max-w-3xl leading-relaxed">
            {currentLocaleContent.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="font-medium">
              {formatRelativeTime(article.publishedAt || article.createdAt, locale)}
            </span>
            {article.author?.name && (
              <>
                <span>•</span>
                <span>{article.author.name}</span>
              </>
            )}
          </div>

          <Link
            href={`/${locale}/news/${article.slug}`}
            className="inline-flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <span>{locale === 'zh' ? '阅读全文' : 'Read More'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Compact News Card for sidebar or related articles
export function CompactNewsCard({ article, locale }: Omit<NewsCardProps, 'variant'>) {
  const currentLocaleContent = article.locales.find(
    (localeContent) => localeContent.language === locale
  ) || article.locales[0];

  if (!currentLocaleContent) return null;

  return (
    <Link href={`/${locale}/news/${article.slug}`} className="block">
      <div className="flex space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
        <div className="flex-1 space-y-1">
          <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm">
            {currentLocaleContent.title}
          </h4>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{formatRelativeTime(article.publishedAt || article.createdAt, locale)}</span>
            {article.featured && (
              <>
                <span>•</span>
                <span className="text-blue-500">{locale === 'zh' ? '精选' : 'Featured'}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </Link>
  );
}
