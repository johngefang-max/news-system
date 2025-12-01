'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { CategoryBadge } from '@/components/news/category-badge';
import { Button, Loading, LoadingSkeleton } from '@/components/ui';
import { ArrowLeft, Calendar, Clock, User, Share2, Bookmark, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
    content: string;
    excerpt: string | null;
    metaDescription: string | null;
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

interface NewsDetailPageProps {
  params: {
    lang: string;
    slug: string;
  };
}

export default function NewsDetailPage({ params: { lang, slug: paramSlug } }: NewsDetailPageProps) {
  const locale = lang;
  const t = useTranslations('NewsDetail');
  const nt = useTranslations('Navigation');
  const currentLocale = useLocale();
  const params = useParams();
  const router = useRouter();
  const slugParam = (params as any)?.slug;
  const slug = Array.isArray(slugParam) ? (slugParam as string[])[0] : (slugParam as string | undefined);

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchArticle();
      fetchRelatedArticles();
    }
  }, [slug, locale]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);

      // 首先通过slug查找文章ID
      const listResponse = await fetch(`/api/articles?language=${locale}&status=PUBLISHED&limit=100`);
      if (!listResponse.ok) {
        throw new Error('Failed to fetch articles');
      }

      const listData = await listResponse.json();
      const foundArticle = (listData.data.articles || []).find(
        (article: Article) => article.slug === slug
      );

      if (!foundArticle) {
        throw new Error('Article not found');
      }

      // 获取完整的文章详情
      const response = await fetch(`/api/articles/${foundArticle.id}?language=${locale}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }

      const data = await response.json();
      setArticle(data.data);

    } catch (err) {
      setError('Failed to load article');
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async () => {
    try {
      // 获取相关文章（同分类的最新文章）
      const response = await fetch(`/api/articles?language=${locale}&status=PUBLISHED&limit=6&sortBy=publishedAt&sortOrder=desc`);
      if (response.ok) {
        const data = await response.json();
        // 过滤掉当前文章，只显示相关文章
        const related = (data.data.articles || []).filter(
          (article: Article) => article.slug !== slug
        ).slice(0, 4);
        setRelatedArticles(related);
      }
    } catch (err) {
      console.error('Error fetching related articles:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share && article) {
      const title = article.locales.find(l => l.language === locale)?.title || '';
      const url = window.location.href;

      navigator.share({
        title,
        url,
      });
    } else {
      // 回退到复制链接
      navigator.clipboard.writeText(window.location.href);
      // 这里可以添加一个toast提示
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = locale === 'zh' ? 500 : 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return locale === 'zh' ? `${minutes} 分钟阅读` : `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-96 w-full bg-gray-200 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-16">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {locale === 'zh' ? '文章未找到' : 'Article Not Found'}
            </h1>
            <p className="text-gray-600 mb-8">
              {locale === 'zh' ? '抱歉，您访问的文章不存在或已被删除。' : 'Sorry, the article you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Link href={`/${locale}/news`}>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToList')}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const currentLocaleContent = article.locales.find(
    (localeContent) => localeContent.language === locale
  ) || article.locales[0];

  const publishDate = article.publishedAt || article.createdAt;
  const readingTime = calculateReadingTime(currentLocaleContent.content || '');

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container-custom py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href={`/${locale}`} className="hover:text-blue-600">
                {nt('home')}
              </Link>
              <span>/</span>
              <Link href={`/${locale}/news`} className="hover:text-blue-600">
                {nt('news')}
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate max-w-xs">
                {currentLocaleContent.title}
              </span>
            </nav>
          </div>
        </div>

        {/* Article Header */}
        <article className="bg-white border-b border-gray-200">
          <div className="container-custom py-8">
            <div className="max-w-4xl mx-auto">
              {/* Back button */}
              <Link href={`/${locale}/news`} className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToList')}
              </Link>

              {/* Categories */}
              {article.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.categories.map((category) => (
                    <CategoryBadge
                      key={category.id}
                      category={category}
                      locale={locale}
                    />
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {currentLocaleContent.title}
              </h1>

              {/* Article Meta */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-600 mb-8">
                <div className="flex items-center space-x-6 mb-4 md:mb-0">
                  {/* Author */}
                  {article.author?.name && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{article.author.name}</span>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(publishDate)}</span>
                  </div>

                  {/* Reading Time */}
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{readingTime}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{t('shareArticle')}</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    <Bookmark className="w-4 h-4" />
                    <span>{locale === 'zh' ? '收藏' : 'Save'}</span>
                  </button>
                </div>
              </div>

              {/* Featured Image (if available) */}
              {/* Note: Add image implementation when you have image uploads */}
            </div>
          </div>
        </article>

        {/* Article Content */}
        <section className="py-12">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                {/* Content - assuming Markdown or HTML */}
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: currentLocaleContent.content?.replace(/\n/g, '<br>') || ''
                  }}
                />
              </div>

              {/* Article Tags */}
              {/* Note: Add tags implementation when you have tags feature */}
            </div>
          </div>
        </section>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="bg-white border-t border-gray-200 py-12">
            <div className="container-custom">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {t('relatedNews')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedArticles.map((relatedArticle) => {
                    const relatedContent = relatedArticle.locales.find(
                      (localeContent) => localeContent.language === locale
                    ) || relatedArticle.locales[0];

                    return (
                      <Link
                        key={relatedArticle.id}
                        href={`/${locale}/news/${relatedArticle.slug}`}
                        className="block group"
                      >
                        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {relatedContent.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {relatedContent.excerpt}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>
                              {formatDate(relatedArticle.publishedAt || relatedArticle.createdAt)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* View All Articles */}
                <div className="text-center mt-8">
                  <Link href={`/${locale}/news`}>
                    <Button variant="outline">
                      {locale === 'zh' ? '查看所有文章' : 'View All Articles'}
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
