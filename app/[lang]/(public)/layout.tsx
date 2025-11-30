'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

interface PublicLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export default function PublicLayout({
  children,
  params: { locale },
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header locale={locale} />
      <main>{children}</main>
      <Footer currentLocale={locale} />
    </div>
  );
}