import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ArticleStatus, UserRole } from '@/types';

// GET /api/dashboard/stats - 获取仪表板统计数据
export async function GET(request: NextRequest) {
  try {
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
      where: { email: session.user.email! },
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
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      totalCategories,
      recentActivity,
      articlesByMonth,
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
        include: {
          author: {
            select: {
              name: true
            }
          }
        },
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          updatedAt: true,
          author: {
            select: {
              name: true
            }
          }
        }
      }),

      // 按月统计文章数
      prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count
        FROM "articles"
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        ${isAdmin ? '' : `AND "authorId" = ${currentUser.id}`}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
      `,

      // 分类及其文章数量
      prisma.category.findMany({
        include: {
          locales: {
            where: { language: 'zh' },
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
            language: 'zh'
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