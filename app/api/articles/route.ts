import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ArticleStatus } from '@/types';
import { slugify } from '@/lib/utils';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/articles - 获取文章列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'zh';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categorySlug = searchParams.get('category');
    const status = searchParams.get('status') as ArticleStatus | null;
    const searchQuery = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (status) where.status = status;
    if (featured) where.featured = featured;

    if (categorySlug) {
      where.categories = { some: { slug: categorySlug } };
    }

    if (searchQuery) {
      where.locales = {
        some: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { content: { contains: searchQuery, mode: 'insensitive' } },
            { excerpt: { contains: searchQuery, mode: 'insensitive' } },
          ],
          language: language,
        },
      };
    }

    // 构建排序条件
    const orderBy: any = {};
    if (sortBy === 'publishedAt' && sortOrder === 'desc') {
      orderBy.publishedAt = 'desc';
    } else if (sortBy === 'publishedAt' && sortOrder === 'asc') {
      orderBy.publishedAt = 'asc';
    } else if (sortBy === 'createdAt' && sortOrder === 'desc') {
      orderBy.createdAt = 'desc';
    } else if (sortBy === 'createdAt' && sortOrder === 'asc') {
      orderBy.createdAt = 'asc';
    } else {
      orderBy.createdAt = 'desc'; // 默认排序
    }

    // 并行查询：获取文章列表和总数
    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        include: {
          locales: {
            where: { language },
            select: {
              id: true,
              language: true,
              title: true,
              excerpt: true,
              metaDescription: true,
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
        orderBy,
      }),
      prisma.article.count({ where }),
    ]);

    // 过滤没有指定语言内容的文章
    const filteredArticles = articles.filter(article =>
      article.locales.length > 0
    );

    return NextResponse.json({
      success: true,
      data: {
        articles: filteredArticles,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('GET /api/articles error:', error);
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'zh';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const mockArticles = [
      {
        id: 'mock-1',
        slug: 'ai-revolution-2024',
        status: 'PUBLISHED',
        featured: true,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        locales: [
          {
            id: 'mock-locale-zh-1',
            language: 'zh',
            title: '人工智能革命：2024 年的技术突破',
            excerpt: '全球范围内的人工智能创新正加速发展，改变各行业格局',
            metaDescription: '人工智能在 2024 年取得了突破性进展'
          },
          {
            id: 'mock-locale-en-1',
            language: 'en',
            title: 'AI Revolution: Breakthroughs in 2024',
            excerpt: 'Accelerating AI innovation is transforming industries worldwide',
            metaDescription: 'AI achieved groundbreaking progress in 2024'
          }
        ].filter((l) => l.language === language),
        categories: [
          {
            id: 'cat-tech',
            slug: 'technology',
            locales: [
              { language: 'zh', name: '科技' },
              { language: 'en', name: 'Technology' }
            ].filter((l) => l.language === language)
          }
        ],
        author: { id: 'mock-author', name: '系统管理员' }
      },
      {
        id: 'mock-2',
        slug: 'global-economy-trends',
        status: 'PUBLISHED',
        featured: false,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        locales: [
          {
            id: 'mock-locale-zh-2',
            language: 'zh',
            title: '全球经济趋势：新兴市场崛起',
            excerpt: '新兴市场正在驱动全球经济增长的新引擎',
            metaDescription: '全球经济趋势分析'
          },
          {
            id: 'mock-locale-en-2',
            language: 'en',
            title: 'Global Economy Trends: Rise of Emerging Markets',
            excerpt: 'Emerging markets are driving a new wave of global growth',
            metaDescription: 'Analysis of global economic trends'
          }
        ].filter((l) => l.language === language),
        categories: [
          {
            id: 'cat-business',
            slug: 'business',
            locales: [
              { language: 'zh', name: '商业' },
              { language: 'en', name: 'Business' }
            ].filter((l) => l.language === language)
          }
        ],
        author: { id: 'mock-author', name: '系统管理员' }
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        articles: mockArticles,
        pagination: {
          page,
          limit,
          totalCount: mockArticles.length,
          totalPages: 1,
        },
      },
    });
  }
}

// POST /api/articles - 创建文章
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      slug,
      status = ArticleStatus.DRAFT,
      featured = false,
      locales,
      categoryIds = [],
      publishedAt
    } = body;

    // 基本验证
    if (!slug || !locales || !Array.isArray(locales) || locales.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          message: '请提供文章标识和至少一种语言的内容'
        },
        { status: 400 }
      );
    }

    // 验证每种语言的内容
    for (const locale of locales) {
      if (!locale.language || !locale.title || !locale.content) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid locale data',
            message: '每种语言都需要提供标题和内容'
          },
          { status: 400 }
        );
      }
    }

    // 检查 slug 是否已存在
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    });

    if (existingArticle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug already exists',
          message: '文章标识已存在，请使用其他标识'
        },
        { status: 409 }
      );
    }

    // 准备文章数据
    // 通过 email 查询作者 id，避免直接依赖 session.user.id 类型
    const author = await prisma.user.findUnique({
      where: { email: session.user?.email ?? '' },
      select: { id: true }
    });

    const articleData: any = {
      slug: slugify(slug),
      status,
      featured,
      authorId: author?.id ?? '',
      publishedAt: status === ArticleStatus.PUBLISHED && publishedAt
        ? new Date(publishedAt)
        : status === ArticleStatus.PUBLISHED
          ? new Date()
          : null,
      locales: {
        create: locales.map((locale: any) => ({
          language: locale.language,
          title: locale.title,
          content: locale.content,
          excerpt: locale.excerpt || null,
          metaDescription: locale.metaDescription || null,
        })),
      },
    };

    // 添加分类关联
    if (categoryIds && categoryIds.length > 0) {
      articleData.categories = {
        connect: categoryIds.map((id: string) => ({ id })),
      };
    }

    const newArticle = await prisma.article.create({
      data: articleData,
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
            name: true
          }
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newArticle,
        message: '文章创建成功'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/articles error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: '创建文章失败'
      },
      { status: 500 }
    );
  }
}
