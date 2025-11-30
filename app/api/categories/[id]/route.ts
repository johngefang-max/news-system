import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/categories/[id] - 获取单个分类
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'zh';
    const { id } = params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        locales: {
          where: { language },
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            articles: {
              where: {
                status: 'PUBLISHED'
              }
            }
          }
        }
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
          message: '分类不存在'
        },
        { status: 404 }
      );
    }

    // 如果没有指定语言的名称，尝试获取默认语言
    if (category.locales.length === 0) {
      const categoryWithDefaultLocale = await prisma.category.findUnique({
        where: { id },
        include: {
          locales: {
            select: { name: true },
          },
          _count: {
            select: {
              articles: {
                where: {
                  status: 'PUBLISHED'
                }
              }
            }
          }
        },
      });

      if (categoryWithDefaultLocale) {
        categoryWithDefaultLocale.locales = categoryWithDefaultLocale.locales.slice(0, 1);
        return NextResponse.json({
          success: true,
          data: categoryWithDefaultLocale,
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'No name available',
          message: '分类暂无可用名称'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('GET /api/categories/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: '获取分类失败'
      },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - 更新分类
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);

    // 认证检查 - 只有管理员可以更新分类
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
    const { slug, locales } = body;

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
          message: '分类不存在'
        },
        { status: 404 }
      );
    }

    // 如果提供了新的 slug，检查是否与其他分类冲突
    if (slug && slug !== existingCategory.slug) {
      const duplicateSlug = await prisma.category.findUnique({
        where: { slug: slugify(slug) }
      });

      if (duplicateSlug && duplicateSlug.id !== id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Slug already exists',
            message: '分类标识已存在，请使用其他标识'
          },
          { status: 409 }
        );
      }
    }

    // 构建更新数据
    const updateData: any = {};

    if (slug) updateData.slug = slugify(slug);

    // 更新多语言名称
    if (locales && Array.isArray(locales)) {
      // 先删除现有的多语言名称
      await prisma.categoryLocale.deleteMany({
        where: { categoryId: id }
      });

      // 创建新的多语言名称
      updateData.locales = {
        create: locales.map((locale: any) => ({
          language: locale.language,
          name: locale.name,
        })),
      };
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        locales: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: '分类更新成功'
    });
  } catch (error) {
    console.error('PUT /api/categories/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: '更新分类失败'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);

    // 认证检查 - 只有管理员可以删除分类
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

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
          message: '分类不存在'
        },
        { status: 404 }
      );
    }

    // 检查是否有关联的文章
    if (existingCategory._count.articles > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category has articles',
          message: `该分类下还有 ${existingCategory._count.articles} 篇文章，无法删除`
        },
        { status: 400 }
      );
    }

    // 删除分类（会级联删除相关的多语言名称）
    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: '分类删除成功'
    });
  } catch (error) {
    console.error('DELETE /api/categories/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: '删除分类失败'
      },
      { status: 500 }
    );
  }
}