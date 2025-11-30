import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

// 支持的语言
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

// 默认语言
export const defaultLocale: Locale = 'zh';

// 定义路由配置
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always' // always, as-needed, never
});

// 为所有路由创建本地化导航
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);