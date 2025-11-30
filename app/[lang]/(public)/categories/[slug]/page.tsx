'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { NewsCard } from '@/components/news/news-card';
import { Button, Loading, LoadingSkeleton } from '@/components/ui';
import { ArrowLeft, Calendar, Grid3X3, List, Filter } from 'lucide-react';
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

interface CategoryPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export default function CategoryPage({ params: { locale, slug: paramSlug } }: CategoryPageProps) {
  const t = useTranslations('Category');
  const st = useTranslations('Search');
  const nt = useTranslations('Navigation');
  const currentLocale = useLocale();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 0,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (slug) {
      fetchCategory();
      fetchArticles(1);
    }
  }, [slug, locale, sortBy, sortOrder]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/categories?language=${locale}`);
      if (response.ok) {
        const data = await response.json();
        const foundCategory = (data.data || []).find(
          (cat: Category) => cat.slug === slug
        );
        setCategory(foundCategory || null);
      }
    } catch (err) {
      console.error('Error fetching category:', err);
    }
  };

  const fetchArticles = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        language: locale,
        status: 'PUBLISHED',
        category: slug,
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/articles?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await response.json();

      setArticles(data.data.articles || []);
      setPagination(data.data.pagination || pagination);

    } catch (err) {
      setError('Failed to load articles');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    fetchArticles(1); // 重置到第一页
  };

  const handlePageChange = (page: number) => {
    fetchArticles(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const categoryName = category?.locales.find(
    (localeContent) => localeContent.language === locale
  )?.name || category?.locales[0]?.name || slug;

  if (loading && !articles.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header locale={locale} />
        <main className="container-custom py-8">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full md:w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <LoadingSkeleton key={i} className="h-64" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer currentLocale={locale} />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header locale={locale} />
        <main className="container-custom py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {locale === 'zh' ? '分类未找到' : 'Category Not Found'}
            </h1>
            <p className="text-gray-600 mb-8">
              {locale === 'zh' ? '抱歉，您访问的分类不存在。' : 'Sorry, the category you\'re looking for doesn\'t exist.'}
            </p>
            <Link href={`/${locale}/categories`}>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {locale === 'zh' ? '返回分类' : 'Back to Categories'}
              </Button>
            </Link>
          </div>
        </main>
        <Footer currentLocale={locale} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header locale={locale} />

      <main>
        {/* Category Header */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12 md:py-16">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <Link
                href={`/${locale}/categories`}
                className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {locale === 'zh' ? '返回分类' : 'Back to Categories'}
              </Link>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {categoryName}
              </h1>

              <p className="text-lg text-gray-600 mb-8">
                {locale === 'zh' ? '该分类下的所有文章' : 'All articles in this category'}
              </p>

              <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {category._count?.articles || 0} {locale === 'zh' ? '篇文章' : 'articles'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Controls */}
        <section className="bg-white border-b border-gray-200 py-4">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {pagination.totalCount} {locale === 'zh' ? '篇文章' : 'articles'}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort Options */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {st('sortBy')}:
                  </span>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-');
                      handleSortChange(newSortBy, newSortOrder);
                    }}
                    className="h-9 border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="publishedAt-desc">{st('latestFirst')}</option>
                    <option value="publishedAt-asc">{st('oldestFirst')}</option>
                    <option value="createdAt-desc">{locale === 'zh' ? '最新创建' : 'Recently Created'}</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section className="py-8">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              {loading ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {[...Array(6)].map((_, i) => (
                    viewMode === 'grid' ? <LoadingSkeleton key={i} className="h-64" /> : <LoadingSkeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : articles.length > 0 ? (
                <>
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                    {articles.map((article) => (
                      <NewsCard
                        key={article.id}
                        article={article}
                        locale={locale}
                        variant={viewMode === 'list' ? 'compact' : 'default'}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        显示 {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} 共 {pagination.totalCount} 篇文章
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page <= 1}
                          className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          上一页
                        </button>
                        <span className="px-3 py-1">
                          第 {pagination.page} 页，共 {pagination.totalPages} 页
                        </span>
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page >= pagination.totalPages}
                          className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          下一页
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Filter className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {t('noArticlesInCategory')}
                    </h2>
                    <p className="text-gray-600 mb-8">
                      {locale === 'zh'
                        ? '该分类下暂时还没有发布的文章。'
                        : 'No published articles in this category yet.'
                      }
                    </p>
                    <Link href={`/${locale}/categories`}>
                      <Button>
                        {locale === 'zh' ? '查看其他分类' : 'Browse Other Categories'}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer currentLocale={locale} />
    </div>
  );
}