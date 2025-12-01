'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

interface PublicLayoutProps {
  children: ReactNode;
  params: {
    lang: string;
  };
}

export default function PublicLayout({
  children,
  params: { lang },
}: PublicLayoutProps) {
  const locale = lang;
  return (
    <div className="min-h-screen bg-background">
      <Header locale={locale} />
      <main>{children}</main>
      <Footer currentLocale={locale} />
    </div>
  );
}
