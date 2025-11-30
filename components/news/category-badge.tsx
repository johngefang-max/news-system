'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface CategoryBadgeProps {
  category: {
    id: string;
    slug: string;
    locales: Array<{
      language: string;
      name: string;
    }>;
  };
  locale: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'solid';
  showCount?: boolean;
  count?: number;
  className?: string;
}

export function CategoryBadge({
  category,
  locale,
  size = 'md',
  variant = 'default',
  showCount = false,
  count,
  className = '',
}: CategoryBadgeProps) {
  // 获取当前语言的分类名称
  const currentLocaleName = category.locales.find(
    (localeContent) => localeContent.language === locale
  )?.name || category.locales[0]?.name || category.slug;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    solid: 'bg-blue-500 text-white hover:bg-blue-600',
  };

  return (
    <Link
      href={`/${locale}/categories/${category.slug}`}
      className={`
        inline-flex items-center space-x-1 rounded-full transition-colors font-medium
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <span>{currentLocaleName}</span>
      {showCount && count !== undefined && count > 0 && (
        <span className="opacity-75">({count})</span>
      )}
    </Link>
  );
}

// Category List Component
interface CategoryListProps {
  categories: Array<{
    id: string;
    slug: string;
    locales: Array<{
      language: string;
      name: string;
    }>;
    _count?: {
      articles: number;
    };
  }>;
  locale: string;
  showCount?: boolean;
  className?: string;
}

export function CategoryList({
  categories,
  locale,
  showCount = false,
  className = '',
}: CategoryListProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map((category) => (
        <CategoryBadge
          key={category.id}
          category={category}
          locale={locale}
          showCount={showCount}
          count={category._count?.articles}
        />
      ))}
    </div>
  );
}

// Category Grid Component for sidebar
export function CategoryGrid({
  categories,
  locale,
  className = '',
}: CategoryListProps) {
  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/${locale}/categories/${category.slug}`}
          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center group"
        >
          <div className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
            {category.locales.find(
              (localeContent) => localeContent.language === locale
            )?.name || category.locales[0]?.name || category.slug}
          </div>
          {category._count?.articles && (
            <div className="text-xs text-gray-500 mt-1">
              {category._count.articles} {locale === 'zh' ? '篇文章' : 'articles'}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}