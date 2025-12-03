'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { NewsCard, FeaturedNewsCard, CompactNewsCard } from '@/components/news/news-card';
import { CategoryGrid, CategoryBadge } from '@/components/news/category-badge';
import { Button, Loading, CardSkeleton } from '@/components/ui';
import { Search, TrendingUp, Clock, ArrowRight } from 'lucide-react';
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

interface HomePageProps {
  params: {
    lang: string;
  };
}

export default function HomePage({ params: { lang } }: HomePageProps) {
  const locale = lang;
  const t = useTranslations('HomePage');
  const nt = useTranslations('Navigation');
  const currentLocale = useLocale();

  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHomeData();
  }, [locale]);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 并行获取数据
      const [articlesRes, categoriesRes] = await Promise.all([
        fetch(`/api/articles?language=${locale}&status=PUBLISHED&limit=12&sortBy=publishedAt&sortOrder=desc`),
        fetch(`/api/categories?language=${locale}&includeArticleCount=true`)
      ]);

      if (!articlesRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const articlesData = await articlesRes.json();
      const categoriesData = await categoriesRes.json();

      setArticles(articlesData.data.articles || []);

      // 获取精选文章
      const featured = (articlesData.data.articles || []).filter(
        (article: Article) => article.featured
      ).slice(0, 3);

      setFeaturedArticles(featured);
      setCategories(categoriesData.data || []);

    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 分离精选文章
  const featuredMainArticle = featuredArticles[0];
  const featuredSecondaryArticles = featuredArticles.slice(1);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
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

            {/* Categories skeleton */}
            <div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* Articles grid skeleton */}
            <div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <CardSkeleton key={i} />
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">加载失败</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            重新加载
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section with Featured Articles */}
        {featuredMainArticle && (
          <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-12 md:py-16">
            <div className="container-custom">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Featured Article */}
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                    {locale === 'zh' ? '精选文章' : 'Featured Stories'}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
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
                      <CompactNewsCard
                        key={article.id}
                        article={article}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="py-12 bg-card border-y border-border">
            <div className="container-custom">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {locale === 'zh' ? '探索分类' : 'Explore Categories'}
                </h2>
                <p className="text-muted-foreground">
                  {locale === 'zh' ? '按主题浏览您感兴趣的内容' : 'Browse content by topics that interest you'}
                </p>
              </div>

              <CategoryGrid
                categories={categories.slice(0, 8)}
                locale={locale}
                className="mb-6"
              />

              {categories.length > 8 && (
                <div className="text-center">
                  <Link href={`/${locale}/categories`}>
                    <Button variant="outline">
                      {locale === 'zh' ? '查看所有分类' : 'View All Categories'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Latest Articles Section */}
        {articles.length > 0 && (
          <section className="py-12">
            <div className="container-custom">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {t('latestNews')}
                  </h2>
                  <p className="text-muted-foreground">
                    {locale === 'zh' ? `最新的新闻和动态 (${Math.min(articles.length, 3)} 篇文章)` : `The latest news and updates (${Math.min(articles.length, 3)} articles)`}
                  </p>
                </div>

                <Link href={`/${locale}/news`}>
                  <Button variant="outline">
                    {locale === 'zh' ? '查看更多' : 'View More'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.slice(0, 3).map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    locale={locale}
                  />
                ))}
              </div>

              {articles.length > 9 && (
                <div className="text-center mt-8">
                  <Link href={`/${locale}/news`}>
                    <Button size="lg">
                      {locale === 'zh' ? '加载更多文章' : 'Load More Articles'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && (
          <section className="py-16">
            <div className="container-custom text-center">
              <div className="max-w-md mx-auto">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('noNewsFound')}
                </h2>
                <p className="text-gray-600 mb-8">
                  {locale === 'zh' ? '暂时没有发布的文章，请稍后再来查看。' : 'No published articles yet. Please check back later.'}
                </p>
                <Link href={`/${locale}/categories`}>
                  <Button>
                    {locale === 'zh' ? '浏览分类' : 'Browse Categories'}
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
