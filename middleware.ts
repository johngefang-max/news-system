import createMiddleware from 'next-intl/middleware';
import { routing } from './ni18n/routing';

export default createMiddleware(routing);

export const config = {
  // 匹配所有除了静态文件、API 路由等的路径
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};