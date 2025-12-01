import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const TABLE_NAME = 'site_settings';
const SINGLETON_ID = 'singleton';

async function ensureTable() {
  try {
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "${TABLE_NAME}" (
        id TEXT PRIMARY KEY,
        "siteName" TEXT NOT NULL,
        "defaultLanguage" TEXT NOT NULL,
        theme TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    );
    await prisma.$executeRawUnsafe(
      `CREATE OR REPLACE FUNCTION set_updated_at()
       RETURNS TRIGGER AS $$
       BEGIN
         NEW."updatedAt" = NOW();
         RETURN NEW;
       END;
       $$ LANGUAGE plpgsql;`
    );
    await prisma.$executeRawUnsafe(
      `DO $$
       BEGIN
         IF NOT EXISTS (
           SELECT 1 FROM pg_trigger WHERE tgname = 'site_settings_set_updated_at'
         ) THEN
           CREATE TRIGGER site_settings_set_updated_at
           BEFORE UPDATE ON "${TABLE_NAME}"
           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
         END IF;
       END $$;`
    );
  } catch (_) {}
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: '请先登录' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user?.email ?? '' },
      select: { role: true }
    });
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: '只有管理员可以查看设置' }, { status: 403 });
    }

    await ensureTable();

    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, "siteName", "defaultLanguage", theme FROM "${TABLE_NAME}" WHERE id = '${SINGLETON_ID}'`
    );
    const settings = rows[0] ?? {
      id: SINGLETON_ID,
      siteName: 'News Portal',
      defaultLanguage: 'zh',
      theme: 'light'
    };

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json({ success: false, message: '获取设置失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: '请先登录' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user?.email ?? '' },
      select: { role: true }
    });
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: '只有管理员可以更新设置' }, { status: 403 });
    }

    const body = await request.json();
    const siteName = (body.siteName ?? '').toString().trim();
    const defaultLanguage = (body.defaultLanguage ?? '').toString().trim();
    const theme = (body.theme ?? '').toString().trim();

    if (!siteName || !defaultLanguage || !theme) {
      return NextResponse.json({ success: false, message: '请提供完整设置项' }, { status: 400 });
    }

    await ensureTable();

    await prisma.$executeRawUnsafe(
      `INSERT INTO "${TABLE_NAME}" (id, "siteName", "defaultLanguage", theme)
       VALUES ('${SINGLETON_ID}', '${siteName.replace(/'/g, "''")}', '${defaultLanguage.replace(/'/g, "''")}', '${theme.replace(/'/g, "''")}')
       ON CONFLICT (id) DO UPDATE SET
         "siteName" = EXCLUDED."siteName",
         "defaultLanguage" = EXCLUDED."defaultLanguage",
         theme = EXCLUDED.theme;`
    );

    return NextResponse.json({ success: true, message: '设置已更新' });
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return NextResponse.json({ success: false, message: '更新设置失败' }, { status: 500 });
  }
}
