import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function Index() {
  let defaultLanguage = 'zh';
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, "defaultLanguage" FROM "site_settings" WHERE id = 'singleton'`
    );
    defaultLanguage = (rows[0]?.defaultLanguage as string) || defaultLanguage;
  } catch (_) {}
  redirect(`/${defaultLanguage}`);
}
export const dynamic = 'force-dynamic';
