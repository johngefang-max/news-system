// 用户相关类型
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  CONTRIBUTOR = 'CONTRIBUTOR',
}

// 文章相关类型
export interface Article {
  id: string;
  slug: string;
  status: ArticleStatus;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  authorId: string;
  author?: Pick<User, 'id' | 'name'>;
  locales?: ArticleLocale[];
  categories?: Category[];
}

export interface ArticleLocale {
  id: string;
  language: string;
  title: string;
  content: string;
  excerpt: string | null;
  metaDescription: string | null;
  articleId: string;
  article?: Article;
  createdAt: Date;
  updatedAt: Date;
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

// 分类相关类型
export interface Category {
  id: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  articles?: Article[];
  locales?: CategoryLocale[];
}

export interface CategoryLocale {
  id: string;
  name: string;
  language: string;
  categoryId: string;
  category?: Category;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

// 文章列表查询参数
export interface ArticleQueryParams {
  page?: number;
  limit?: number;
  language?: string;
  category?: string;
  status?: ArticleStatus;
  search?: string;
  featured?: boolean;
  sortBy?: 'createdAt' | 'publishedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// 表单类型
export interface ArticleFormData {
  slug: string;
  status: ArticleStatus;
  featured: boolean;
  locales: {
    [language: string]: {
      title: string;
      content: string;
      excerpt: string;
      metaDescription: string;
    };
  };
  categoryIds: string[];
}

export interface CategoryFormData {
  slug: string;
  locales: {
    [language: string]: {
      name: string;
    };
  };
}

// 认证相关类型
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// 搜索结果类型
export interface SearchResult {
  article: Article & { locales: ArticleLocale[] };
  highlights: {
    title?: string[];
    content?: string[];
  };
}

// 组件 Props 类型
export interface NewsCardProps {
  article: Article & {
    locales: ArticleLocale[];
    categories: (Category & { locales: CategoryLocale[] })[];
  };
  locale: string;
  showExcerpt?: boolean;
  showCategory?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
  className?: string;
}

export interface CategoryBadgeProps {
  category: Category & { locales: CategoryLocale[] };
  locale: string;
  className?: string;
}

// 管理后台类型
export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalCategories: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'publish';
  entityType: 'article' | 'category';
  entityId: string;
  entityTitle: string;
  userId: string;
  createdAt: Date;
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// 配置类型
export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  logo: string;
  defaultLanguage: string;
  supportedLanguages: string[];
}

// SEO 相关类型
export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  locale?: string;
}

// 主题相关类型
export type Theme = 'light' | 'dark' | 'system';

// 语言相关类型
export type SupportedLocale = 'en' | 'zh';