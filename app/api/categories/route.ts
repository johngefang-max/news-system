import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

// GET /api/categories - 获取分类列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'zh';
    const includeArticleCount = searchParams.get('includeArticleCount') === 'true';

    const categories = await prisma.category.findMany({
      include: {
        locales: {
          where: { language },
          select: {
            name: true,
          },
        },
        ...(includeArticleCount && {
          _count: {
            select: {
              articles: {
                where: {
                  status: 'PUBLISHED'
                }
              }
            }
          }
        })
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // 过滤没有指定语言名称的分类
    const filteredCategories = categories.filter(category =>
      category.locales.length > 0
    );

    return NextResponse.json({
      success: true,
      data: filteredCategories,
    });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'zh';

    const mockCategories = [
      {
        id: 'cat-tech',
        slug: 'technology',
        locales: [
          { name: language === 'zh' ? '科技' : 'Technology' }
        ],
        _count: { articles: 12 }
      },
      {
        id: 'cat-business',
        slug: 'business',
        locales: [
          { name: language === 'zh' ? '商业' : 'Business' }
        ],
        _count: { articles: 8 }
      },
      {
        id: 'cat-politics',
        slug: 'politics',
        locales: [
          { name: language === 'zh' ? '政治' : 'Politics' }
        ],
        _count: { articles: 10 }
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockCategories,
    });
  }
}

// POST /api/categories - 创建分类
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 认证检查 - 只有管理员可以创建分类
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

    const body = await request.json();
    const { slug, locales } = body;

    // 基本验证
    if (!slug || !locales || !Array.isArray(locales) || locales.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          message: '请提供分类标识和至少一种语言的名称'
        },
        { status: 400 }
      );
    }

    // 验证每种语言的名称
    for (const locale of locales) {
      if (!locale.language || !locale.name) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid locale data',
            message: '每种语言都需要提供名称'
          },
          { status: 400 }
        );
      }
    }

    // 检查 slug 是否已存在
    const existingCategory = await prisma.category.findUnique({
      where: { slug: slugify(slug) }
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug already exists',
          message: '分类标识已存在，请使用其他标识'
        },
        { status: 409 }
      );
    }

    const newCategory = await prisma.category.create({
      data: {
        slug: slugify(slug),
        locales: {
          create: locales.map((locale: any) => ({
            language: locale.language,
            name: locale.name,
          })),
        },
      },
      include: {
        locales: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newCategory,
        message: '分类创建成功'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: '创建分类失败'
      },
      { status: 500 }
    );
  }
}
