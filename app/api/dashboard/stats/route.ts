import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ArticleStatus, UserRole } from '@/types';
export const dynamic = 'force-dynamic';

// GET /api/dashboard/stats - 获取仪表板统计数据
export async function GET(request: NextRequest) {
  try {
    const langParam = request.nextUrl.searchParams.get('lang');
    const lang = (langParam && typeof langParam === 'string') ? langParam : 'zh';
    const session = await getServerSession(authOptions);

    // 认证检查
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: '请先登录'
        },
        { status: 401 }
      );
    }

    // 获取当前用户信息
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user?.email ?? '' },
      select: { role: true, id: true }
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          message: '用户不存在'
        },
        { status: 404 }
      );
    }

    const isAdmin = currentUser.role === UserRole.ADMIN;

    // 构建查询条件
    const articleWhere = isAdmin ? {} : { authorId: currentUser.id };

    // 并行获取各种统计数据
    const sinceDate = new Date();
    sinceDate.setMonth(sinceDate.getMonth() - 12);

    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      totalCategories,
      recentActivity,
      articlesCreatedDates,
      categoriesWithCount
    ] = await Promise.all([
      // 总文章数
      prisma.article.count({
        where: articleWhere
      }),

      // 已发布文章数
      prisma.article.count({
        where: {
          ...articleWhere,
          status: ArticleStatus.PUBLISHED
        }
      }),

      // 草稿文章数
      prisma.article.count({
        where: {
          ...articleWhere,
          status: ArticleStatus.DRAFT
        }
      }),

      // 总分类数
      prisma.category.count(),

      // 最近活动
      prisma.article.findMany({
        where: articleWhere,
        take: 10,
        orderBy: {
          updatedAt: 'desc'
        },
        select: {
          id: true,
          slug: true,
          status: true,
          updatedAt: true,
          author: {
            select: {
              name: true
            }
          }
        }
      }),

      prisma.article.findMany({
        where: {
          ...articleWhere,
          createdAt: {
            gte: sinceDate
          }
        },
        select: {
          createdAt: true
        }
      }),

      // 分类及其文章数量
      prisma.category.findMany({
        include: {
          locales: {
            where: { language: lang },
            select: { name: true }
          },
          _count: {
            select: {
              articles: {
                where: {
                  status: ArticleStatus.PUBLISHED
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    ]);

    // 处理最近活动数据，添加标题信息
    const recentActivityWithTitles = await Promise.all(
      recentActivity.map(async (activity) => {
        const locale = await prisma.articleLocale.findFirst({
          where: {
            articleId: activity.id,
            language: lang
          },
          select: { title: true }
        });

        return {
          id: activity.id,
          slug: activity.slug,
          title: locale?.title || activity.slug,
          status: activity.status,
          updatedAt: activity.updatedAt,
          authorName: activity.author?.name || '未知',
        };
      })
    );

    const articlesByMonthMap = new Map<string, number>();
    for (const item of articlesCreatedDates) {
      const d = item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt as any);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      articlesByMonthMap.set(key, (articlesByMonthMap.get(key) ?? 0) + 1);
    }
    const articlesByMonth = Array.from(articlesByMonthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const stats = {
      overview: {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalCategories
      },
      recentActivity: recentActivityWithTitles,
      articlesByMonth,
      categoriesWithCount: categoriesWithCount.filter(cat => cat.locales.length > 0)
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('GET /api/dashboard/stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: '获取统计数据失败'
      },
      { status: 500 }
    );
  }
}
