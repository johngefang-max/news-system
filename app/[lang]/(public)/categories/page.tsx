'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { NewsCard } from '@/components/news/news-card';
import { CategoryBadge } from '@/components/news/category-badge';
import { Button, Loading, LoadingSkeleton } from '@/components/ui';
import { Grid3X3, List, Filter, ArrowLeft, FolderOpen } from 'lucide-react';
import Link from 'next/link';

interface Article {
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
}

interface Category {
  id: string;
  slug: string;
  locales: Array<{
    language: string;
    name: string;
  }>;
  _count?: {
    articles: number;
  };
}

interface CategoriesPageProps {
  params: {
    lang: string;
  };
}

export default function CategoriesPage({ params: { lang } }: CategoriesPageProps) {
  const locale = lang;
  const t = useTranslations('Category');
  const ct = useTranslations('Common');
  const currentLocale = useLocale();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [locale]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/categories?language=${locale}&includeArticleCount=true`);

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data.data || []);

    } catch (err) {
      setError('Failed to load categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-8">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full md:w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="space-y-4">
                      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">加载失败</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              重新加载
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12 md:py-16">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto">
              <FolderOpen className="w-16 h-16 text-blue-500 mx-auto mb-6" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {t('allCategories')}
              </h1>
              <p className="text-lg text-gray-600">
                {locale === 'zh'
                  ? '浏览我们的文章分类，找到您感兴趣的内容'
                  : 'Browse our article categories to find content that interests you'
                }
              </p>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              {categories.length > 0 ? (
                <>
                  <div className="mb-8">
                    <p className="text-gray-600">
                      {categories.length} {locale === 'zh' ? '个分类' : 'categories'} •{' '}
                      {categories.reduce((sum, cat) => sum + (cat._count?.articles || 0), 0)}{' '}
                      {locale === 'zh' ? '篇文章' : 'articles'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => {
                      const categoryName = category.locales.find(
                        (localeContent) => localeContent.language === locale
                      )?.name || category.locales[0]?.name || category.slug;

                      const articleCount = category._count?.articles || 0;

                      return (
                        <Link
                          key={category.id}
                          href={`/${locale}/categories/${category.slug}`}
                          className="block group"
                        >
                          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
                            {/* Category Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                  <FolderOpen className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {categoryName}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {category.slug}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Article Count */}
                            <div className="mb-4">
                              <div className="text-2xl font-bold text-gray-900">
                                {articleCount}
                              </div>
                              <div className="text-sm text-gray-600">
                                {locale === 'zh' ? '篇文章' : 'articles'}
                              </div>
                            </div>

                            {/* Preview Articles (if any) */}
                            {articleCount > 0 && (
                              <div className="border-t border-gray-100 pt-4">
                                <div className="flex items-center text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                                  <span>
                                    {locale === 'zh' ? '查看文章' : 'View articles'}
                                  </span>
                                  <svg
                                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </div>
                              </div>
                            )}

                            {/* Empty State */}
                            {articleCount === 0 && (
                              <div className="border-t border-gray-100 pt-4">
                                <p className="text-sm text-gray-500">
                                  {locale === 'zh' ? '暂无文章' : 'No articles yet'}
                                </p>
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Statistics */}
                  <div className="mt-12 p-6 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {categories.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          {locale === 'zh' ? '个分类' : 'Categories'}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {categories.reduce((sum, cat) => sum + (cat._count?.articles || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {locale === 'zh' ? '篇文章' : 'Total Articles'}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {categories.filter(cat => (cat._count?.articles || 0) > 0).length}
                        </div>
                        <div className="text-sm text-gray-600">
                          {locale === 'zh' ? '活跃分类' : 'Active Categories'}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {locale === 'zh' ? '暂无分类' : 'No Categories Yet'}
                  </h2>
                  <p className="text-gray-600 mb-8">
                    {locale === 'zh'
                      ? '还没有创建任何分类，请稍后再来查看。'
                      : 'No categories have been created yet. Please check back later.'
                    }
                  </p>
                  <Link href={`/${locale}`}>
                    <Button>
                      {locale === 'zh' ? '返回首页' : 'Back to Home'}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
