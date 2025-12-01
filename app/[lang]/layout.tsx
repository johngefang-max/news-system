import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/ni18n/routing';
// global CSS moved to root layout
import Providers from '../providers';

export const metadata: Metadata = {
  title: '国际新闻门户 - International News Portal',
  description: '获取全球最新资讯 | Get the latest global updates',
};

export default async function LangLayout({
  children,
  params: { lang }
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const locale = lang;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <Providers>
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </Providers>
  );
}
