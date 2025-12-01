import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import './globals.css';

export const metadata: Metadata = {
  title: '国际新闻门户 - International News Portal',
  description: '获取全球最新资讯 | Get the latest global updates',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let defaultLanguage = 'zh';
  let theme = 'light';
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, "defaultLanguage", theme FROM "site_settings" WHERE id = 'singleton'`
    );
    defaultLanguage = rows[0]?.defaultLanguage ?? defaultLanguage;
    theme = rows[0]?.theme ?? theme;
  } catch (_) {}

  return (
    <html lang={defaultLanguage} suppressHydrationWarning className={theme === 'dark' ? 'dark' : ''}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
