'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import {
  FileText,
  TrendingUp,
  Users,
  Eye,
  Calendar,
  Clock,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';

interface DashboardStats {
  overview: {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    totalCategories: number;
  };
  recentActivity: Array<{
    id: string;
    slug: string;
    title: string;
    status: string;
    updatedAt: string;
    authorName: string;
  }>;
  articlesByMonth: Array<{
    month: string;
    count: number;
  }>;
  categoriesWithCount: Array<{
    id: string;
    slug: string;
    locales: Array<{
      language: string;
      name: string;
    }>;
    _count: {
      articles: number;
    };
  }>;
}

export default function DashboardPage() {
  const t = useTranslations('Admin');
  const at = useTranslations('AdminArticles');
  const dt = useTranslations('DateTime');
  const locale = useLocale();
  const { data: session } = useSession();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return at('published');
      case 'DRAFT':
        return at('draft');
      case 'ARCHIVED':
        return at('archived');
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-full bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-full bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchStats} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('welcome')}, {session?.user?.name || 'Admin'}!
        </h1>
        <p className="text-gray-600">
          {locale === 'zh' ? '这是您的管理面板概览' : 'Here\'s what\'s happening with your site today'}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('totalArticles')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalArticles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('publishedArticles')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.publishedArticles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Edit className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('draftArticles')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.draftArticles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('totalCategories')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalCategories}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{t('recentActivity')}</h2>
              <Link href={`/${locale}/admin/articles`}>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/${locale}/admin/articles/${activity.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
                      >
                        {activity.title}
                      </Link>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {getStatusText(activity.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          by {activity.authorName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(activity.updatedAt)}
                      </span>
                      <Link
                        href={`/${locale}/admin/articles/${activity.id}`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                {locale === 'zh' ? '暂无最近活动' : 'No recent activity'}
              </p>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {locale === 'zh' ? '热门分类' : 'Top Categories'}
              </h2>
              <Link href={`/${locale}/admin/categories`}>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            {stats.categoriesWithCount.length > 0 ? (
              <div className="space-y-3">
                {stats.categoriesWithCount
                  .sort((a, b) => b._count.articles - a._count.articles)
                  .slice(0, 6)
                  .map((category) => {
                    const categoryName = category.locales.find(
                      (localeContent) => localeContent.language === locale
                    )?.name || category.locales[0]?.name || category.slug;

                    return (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/${locale}/categories/${category.slug}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600"
                            target="_blank"
                          >
                            {categoryName}
                          </Link>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (category._count.articles / Math.max(...stats.categoriesWithCount.map(c => c._count.articles))) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="ml-4 text-sm text-gray-600">
                          {category._count.articles} {locale === 'zh' ? '篇文章' : 'articles'}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                {locale === 'zh' ? '暂无分类' : 'No categories yet'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {locale === 'zh' ? '快速操作' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href={`/${locale}/admin/articles/new`}>
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {at('createArticle')}
            </Button>
          </Link>
          <Link href={`/${locale}/admin/categories`}>
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {locale === 'zh' ? '创建分类' : 'Create Category'}
            </Button>
          </Link>
          <Link href={`/${locale}`} target="_blank">
            <Button variant="outline" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              {locale === 'zh' ? '查看网站' : 'View Site'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}