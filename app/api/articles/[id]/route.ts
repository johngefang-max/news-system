import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ArticleStatus } from '@/types';
import { slugify } from '@/lib/utils';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/articles/[id] - 获取单篇文章
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'zh';
    const { id } = params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        locales: {
          where: { language },
          select: {
            id: true,
            language: true,
            title: true,
            content: true,
            excerpt: true,
            metaDescription: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        categories: {
          include: {
            locales: {
              where: { language },
              select: { name: true },
            },
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
          message: '文章不存在'
        },
        { status: 404 }
      );
    }

    // 如果没有指定语言的内容，尝试获取默认语言
    if (article.locales.length === 0) {
      const articleWithDefaultLocale = await prisma.article.findUnique({
        where: { id },
        include: {
          locales: {
            select: {
              id: true,
              language: true,
              title: true,
              content: true,
              excerpt: true,
              metaDescription: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          categories: {
            include: {
              locales: {
                select: { name: true },
              },
            },
          },
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (articleWithDefaultLocale) {
        articleWithDefaultLocale.locales = articleWithDefaultLocale.locales.slice(0, 1);
        return NextResponse.json({
          success: true,
          data: articleWithDefaultLocale,
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'No content available',
          message: '文章暂无可用内容'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('GET /api/articles/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: '获取文章失败'
      },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[id] - 更新文章
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id } = params;
    const body = await request.json();
    const {
      slug,
      status,
      featured,
      locales,
      categoryIds,
      publishedAt
    } = body;

    // 检查文章是否存在
    const existingArticle = await prisma.article.findUnique({
      where: { id }
    });

    if (!existingArticle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
          message: '文章不存在'
        },
        { status: 404 }
      );
    }

    // 如果提供了新的 slug，检查是否与其他文章冲突
    if (slug && slug !== existingArticle.slug) {
      const duplicateSlug = await prisma.article.findUnique({
        where: { slug: slugify(slug) }
      });

      if (duplicateSlug && duplicateSlug.id !== id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Slug already exists',
            message: '文章标识已存在，请使用其他标识'
          },
          { status: 409 }
        );
      }
    }

    // 构建更新数据
    const updateData: any = {};

    if (slug) updateData.slug = slugify(slug);
    if (status !== undefined) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured;

    if (status === ArticleStatus.PUBLISHED && !existingArticle.publishedAt) {
      updateData.publishedAt = publishedAt ? new Date(publishedAt) : new Date();
    } else if (status === ArticleStatus.PUBLISHED && publishedAt) {
      updateData.publishedAt = new Date(publishedAt);
    } else if (status !== ArticleStatus.PUBLISHED) {
      updateData.publishedAt = null;
    }

    // 更新多语言内容
    if (locales && Array.isArray(locales)) {
      // 先删除现有的多语言内容
      await prisma.articleLocale.deleteMany({
        where: { articleId: id }
      });

      // 创建新的多语言内容
      updateData.locales = {
        create: locales.map((locale: any) => ({
          language: locale.language,
          title: locale.title,
          content: locale.content,
          excerpt: locale.excerpt || null,
          metaDescription: locale.metaDescription || null,
        })),
      };
    }

    // 更新分类关联
    if (categoryIds && Array.isArray(categoryIds)) {
      // 先移除所有现有的分类关联
      await prisma.article.update({
        where: { id },
        data: {
          categories: {
            set: []
          }
        }
      });

      // 添加新的分类关联
      if (categoryIds.length > 0) {
        updateData.categories = {
          connect: categoryIds.map((categoryId: string) => ({ id: categoryId })),
        };
      }
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: updateData,
      include: {
        locales: true,
        categories: {
          include: {
            locales: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedArticle,
      message: '文章更新成功'
    });
  } catch (error) {
    console.error('PUT /api/articles/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: '更新文章失败'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id] - 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id } = params;

    // 检查文章是否存在
    const existingArticle = await prisma.article.findUnique({
      where: { id }
    });

    if (!existingArticle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
          message: '文章不存在'
        },
        { status: 404 }
      );
    }

    // 删除文章（会级联删除相关的多语言内容和分类关联）
    await prisma.article.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: '文章删除成功'
    });
  } catch (error) {
    console.error('DELETE /api/articles/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: '删除文章失败'
      },
      { status: 500 }
    );
  }
}
