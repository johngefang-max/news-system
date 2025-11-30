'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Textarea, Select } from '@/components/ui';
import {
  ArrowLeft,
  Save,
  Eye,
  Globe,
  Plus,
  X,
  FileText,
  Calendar,
  Star,
  Settings,
} from 'lucide-react';

interface ArticleFormData {
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  locales: {
    zh: {
      title: string;
      content: string;
      excerpt: string;
      metaDescription: string;
    };
    en: {
      title: string;
      content: string;
      excerpt: string;
      metaDescription: string;
    };
  };
  categoryIds: string[];
  publishedAt: string | null;
}

interface Category {
  id: string;
  slug: string;
  locales: Array<{
    language: string;
    name: string;
  }>;
}

export default function ArticleEditorPage() {
  const t = useTranslations('AdminArticles');
  const ct = useTranslations('Common');
  const at = useTranslations('Auth');
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const isEditing = !!params.id;

  const [formData, setFormData] = useState<ArticleFormData>({
    slug: '',
    status: 'DRAFT',
    featured: false,
    locales: {
      zh: {
        title: '',
        content: '',
        excerpt: '',
        metaDescription: '',
      },
      en: {
        title: '',
        content: '',
        excerpt: '',
        metaDescription: '',
      },
    },
    categoryIds: [],
    publishedAt: null,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'zh' | 'en'>('zh');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchArticle();
    }
  }, [isEditing, params.id]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?language=${locale}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }

      const data = await response.json();
      const article = data.data;

      // Transform the article data to form data format
      const locales = {
        zh: {
          title: '',
          content: '',
          excerpt: '',
          metaDescription: '',
        },
        en: {
          title: '',
          content: '',
          excerpt: '',
          metaDescription: '',
        },
      };

      article.locales.forEach((localeContent: any) => {
        if (locales[localeContent.language as keyof typeof locales]) {
          locales[localeContent.language as keyof typeof locales] = {
            title: localeContent.title,
            content: localeContent.content,
            excerpt: localeContent.excerpt || '',
            metaDescription: localeContent.metaDescription || '',
          };
        }
      });

      setFormData({
        slug: article.slug,
        status: article.status,
        featured: article.featured,
        locales,
        categoryIds: article.categories.map((cat: any) => cat.id),
        publishedAt: article.publishedAt,
      });
    } catch (err) {
      setError('Failed to load article');
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (publish: boolean = false) => {
    try {
      setSaving(true);
      setError('');

      const submitData = {
        ...formData,
        status: publish ? 'PUBLISHED' : 'DRAFT',
        publishedAt: publish && !formData.publishedAt ? new Date().toISOString() : formData.publishedAt,
      };

      const url = isEditing ? `/api/articles/${params.id}` : '/api/articles';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save article');
      }

      const result = await response.json();

      if (publish) {
        // Redirect to articles list on successful publish
        router.push(`/${locale}/admin/articles`);
      } else {
        // Redirect to edit page if creating new article
        if (!isEditing) {
          router.push(`/${locale}/admin/articles/${result.data.id}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article');
      console.error('Error saving article:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocaleChange = (localeKey: 'zh' | 'en', field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      locales: {
        ...prev.locales,
        [localeKey]: {
          ...prev.locales[localeKey],
          [field]: value,
        },
      },
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const getCategoryName = (category: Category) => {
    return category.locales.find(
      (localeContent) => localeContent.language === locale
    )?.name || category.locales[0]?.name || category.slug;
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-10 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-10 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-32 w-full bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
              <div className="h-10 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded"></div>
                <div className="h-3 w-full bg-gray-200 rounded"></div>
                <div className="h-3 w-full bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/${locale}/admin/articles`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Articles
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? t('editArticle') : t('createArticle')}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Edit your article content and settings' : 'Create a new article'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Language Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {(['zh', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === lang
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Globe className="w-4 h-4 inline mr-2" />
                    {lang === 'zh' ? '中文' : 'English'}
                    {formData.locales[lang].title && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({getWordCount(formData.locales[lang].content)} words)
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Title */}
              <div className="mb-6">
                <label className="form-label">
                  {activeTab === 'zh' ? '中文标题' : 'English Title'} *
                </label>
                <Input
                  value={formData.locales[activeTab].title}
                  onChange={(e) => handleLocaleChange(activeTab, 'title', e.target.value)}
                  placeholder={activeTab === 'zh' ? '请输入文章标题' : 'Enter article title'}
                />
              </div>

              {/* Excerpt */}
              <div className="mb-6">
                <label className="form-label">
                  {activeTab === 'zh' ? '文章摘要' : 'Article Excerpt'}
                </label>
                <Textarea
                  value={formData.locales[activeTab].excerpt}
                  onChange={(e) => handleLocaleChange(activeTab, 'excerpt', e.target.value)}
                  rows={3}
                  placeholder={activeTab === 'zh' ? '请输入文章摘要（可选）' : 'Enter article excerpt (optional)'}
                />
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="form-label">
                  {activeTab === 'zh' ? '文章内容' : 'Article Content'} *
                </label>
                <Textarea
                  value={formData.locales[activeTab].content}
                  onChange={(e) => handleLocaleChange(activeTab, 'content', e.target.value)}
                  rows={15}
                  placeholder={activeTab === 'zh' ? '请输入文章内容（支持Markdown）' : 'Enter article content (Markdown supported)'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {activeTab === 'zh' ? '支持Markdown格式' : 'Markdown format supported'}
                </p>
              </div>

              {/* Advanced SEO Settings */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced SEO Settings
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="form-label">
                        {activeTab === 'zh' ? 'SEO描述' : 'SEO Meta Description'}
                      </label>
                      <Textarea
                        value={formData.locales[activeTab].metaDescription}
                        onChange={(e) => handleLocaleChange(activeTab, 'metaDescription', e.target.value)}
                        rows={2}
                        placeholder={activeTab === 'zh' ? '请输入SEO描述' : 'Enter SEO meta description'}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Link href={`/${locale}/admin/articles`}>
              <Button variant="outline">
                Cancel
              </Button>
            </Link>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => handleSubmit(false)}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : t('saveDraft')}
              </Button>
              <Button
                onClick={() => handleSubmit(true)}
                disabled={saving || !formData.locales.zh.title || !formData.locales.zh.content}
              >
                <Eye className="w-4 h-4 mr-2" />
                {saving ? 'Publishing...' : t('publishNow')}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {locale === 'zh' ? '发布设置' : 'Publishing Settings'}
            </h3>

            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="form-label">{t('publishStatus')}</label>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="DRAFT">{t('draft')}</option>
                  <option value="PUBLISHED">{t('published')}</option>
                  <option value="ARCHIVED">{t('archived')}</option>
                </Select>
              </div>

              {/* Featured */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  {t('setAsFeatured')}
                </label>
              </div>

              {/* Published At */}
              {formData.publishedAt && (
                <div>
                  <label className="form-label">
                    {locale === 'zh' ? '发布时间' : 'Published At'}
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('publishedAt', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              {locale === 'zh' ? '文章分类' : 'Article Categories'}
            </h3>

            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    {getCategoryName(category)}
                  </span>
                </label>
              ))}

              {categories.length === 0 && (
                <p className="text-sm text-gray-500">
                  {locale === 'zh' ? '暂无分类' : 'No categories available'}
                </p>
              )}
            </div>
          </div>

          {/* Article Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {locale === 'zh' ? '文章设置' : 'Article Settings'}
            </h3>

            <div className="space-y-4">
              {/* Slug */}
              <div>
                <label className="form-label">
                  {locale === 'zh' ? '文章标识' : 'Article Slug'}
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder={locale === 'zh' ? '文章URL标识符' : 'Article URL identifier'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {locale === 'zh' ? '用于生成URL的唯一标识符' : 'Unique identifier for URL generation'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}