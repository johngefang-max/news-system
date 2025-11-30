import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { Locale, localePrefix } from './config';

// 为所有路由定义本地化导航
export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({
  locales,
  localePrefix
});

export type { Locale };