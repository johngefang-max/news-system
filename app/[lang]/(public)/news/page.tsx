'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { NewsCard, FeaturedNewsCard } from '@/components/news/news-card';
import { CategoryBadge } from '@/components/news/category-badge';
import { Button, Loading, LoadingSkeleton, Input } from '@/components/ui';
import { Search, Filter, ChevronDown, Grid, List, ArrowRight } from 'lucide-react';
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
}

interface NewsPageProps {
  params: {
    lang: string;
  };
}

export default function NewsPage({ params: { lang } }: NewsPageProps) {
  const locale = lang;
  const t = useTranslations('HomePage');
  const st = useTranslations('Search');
  const nt = useTranslations('Navigation');
  const currentLocale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 0,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  // 从URL参数获取分页信息
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchNewsData(currentPage);
    fetchCategories();
  }, [locale, currentPage, filters]);

  const fetchNewsData = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        language: locale,
        status: 'PUBLISHED',
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      if (filters.category) {
        queryParams.append('category', filters.category);
      }

      if (filters.search) {
        queryParams.append('search', filters.search);
      }

      const response = await fetch(`/api/articles?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await response.json();

      setArticles(data.data.articles || []);
      setPagination(data.data.pagination || pagination);

      // 获取精选文章（只在第一页显示）
      if (page === 1) {
        const featured = (data.data.articles || [])
          .filter((article: Article) => article.featured)
          .slice(0, 3);
        setFeaturedArticles(featured);
      } else {
        setFeaturedArticles([]);
      }

    } catch (err) {
      setError('Failed to load articles');
      console.error('Error fetching news data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?language=${locale}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // 更新URL参数
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    params.set('page', '1');

    router.push(`/${locale}/news?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/${locale}/news?${params.toString()}`);
  };

  const nonFeaturedArticles = articles.filter(article => !article.featured);
  const featuredMainArticle = featuredArticles[0];
  const featuredSecondaryArticles = featuredArticles.slice(1);

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-8">
          <div className="space-y-8">
            {/* Featured skeleton */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden">
              <div className="relative p-8 md:p-12">
                <div className="space-y-4">
                  <div className="h-4 w-24 bg-white/50 rounded-full animate-pulse" />
                  <div className="h-8 md:h-12 w-full md:w-3/4 bg-white/50 rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-full md:w-2/3 bg-white/30 rounded animate-pulse" />
                    <div className="h-4 w-full md:w-1/2 bg-white/30 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Articles grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <LoadingSkeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-8">
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
        {/* Hero Section with Featured Articles */}
        {featuredMainArticle && currentPage === 1 && (
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12 md:py-16">
            <div className="container-custom">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Featured Article */}
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                    {locale === 'zh' ? '精选文章' : 'Featured Stories'}
                  </h1>
                  <p className="text-lg text-gray-600 mb-8">
                    {locale === 'zh' ? '发现我们为您精心挑选的最新资讯' : 'Discover carefully selected stories from around the world'}
                  </p>
                  <FeaturedNewsCard article={featuredMainArticle} locale={locale} />
                </div>

                {/* Secondary Featured Articles */}
                {featuredSecondaryArticles.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {locale === 'zh' ? '更多精选' : 'More Featured'}
                    </h2>
                    {featuredSecondaryArticles.map((article) => (
                      <div key={article.id} className="bg-white rounded-lg p-4 shadow-sm">
                        <Link href={`/${locale}/news/${article.slug}`}>
                          <h3 className="font-medium text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                            {article.locales.find(l => l.language === locale)?.title || article.locales[0]?.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                          </p>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Filters and Search Section */}
        <section className="bg-white border-b border-gray-200 py-6">
          <div className="container-custom">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={st('searchPlaceholder')}
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="lg:w-48">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{locale === 'zh' ? '所有分类' : 'All Categories'}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.locales.find(l => l.language === locale)?.name || category.locales[0]?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div className="lg:w-48">
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                  className="w-full h-10 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(filters.category || filters.search) && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-gray-600">{st('filters')}:</span>
                {filters.category && (
                  <CategoryBadge
                    category={{
                      id: filters.category,
                      slug: filters.category,
                      locales: categories
                        .find(c => c.slug === filters.category)?.locales || []
                    }}
                    locale={locale}
                  />
                )}
                {filters.search && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    &quot;{filters.search}&quot;
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setFilters({
                      category: '',
                      search: '',
                      sortBy: 'publishedAt',
                      sortOrder: 'desc',
                    });
                    router.push(`/${locale}/news`);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {locale === 'zh' ? '清除筛选' : 'Clear filters'}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Articles Section */}
        <section className="py-8">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {filters.search ? (
                    <>
                      {st('searchFor')}&quot;{filters.search}&quot;
                    </>
                  ) : t('latestNews')}
                </h1>
                <p className="text-gray-600">
                  {pagination.totalCount} {locale === 'zh' ? '篇文章' : 'articles'}
                </p>
              </div>
            </div>

            {loading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {[...Array(6)].map((_, i) => (
                  viewMode === 'grid' ? <LoadingSkeleton key={i} className="h-64" /> : <LoadingSkeleton key={i} className="h-32" />
                ))}
              </div>
            ) : nonFeaturedArticles.length > 0 ? (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {nonFeaturedArticles.map((article) => (
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
                      显示 {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.totalCount)} 共 {pagination.totalCount} 篇文章
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        上一页
                      </button>
                      <span className="px-3 py-1">
                        第 {currentPage} 页，共 {pagination.totalPages} 页
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= pagination.totalPages}
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
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {st('noSearchResults')}
                </h2>
                <p className="text-gray-600 mb-8">
                  {locale === 'zh' ? '尝试使用不同的关键词或筛选条件' : 'Try different keywords or filters'}
                </p>
                <Link href={`/${locale}/news`}>
                  <Button>
                    {locale === 'zh' ? '查看所有文章' : 'View All Articles'}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
