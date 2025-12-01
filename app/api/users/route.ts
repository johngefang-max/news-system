import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

// GET /api/users - 获取用户列表（仅管理员）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 认证检查 - 只有管理员可以查看用户列表
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

    // 检查用户角色
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user?.email ?? '' },
      select: { role: true }
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: '只有管理员可以查看用户列表'
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const searchQuery = searchParams.get('search');

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { email: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
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
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: '获取用户列表失败'
      },
      { status: 500 }
    );
  }
}

// POST /api/users - 创建用户（仅管理员）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 认证检查 - 只有管理员可以创建用户
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

    // 检查用户角色
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user?.email ?? '' },
      select: { role: true }
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: '只有管理员可以创建用户'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, name, role = 'EDITOR' } = body;

    // 基本验证
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          message: '请提供邮箱地址'
        },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already exists',
          message: '该邮箱已被使用'
        },
        { status: 409 }
      );
    }

    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || null,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: '用户创建成功'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: '创建用户失败'
      },
      { status: 500 }
    );
  }
}
