'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderOpen,
  FileText,
  X,
  Globe,
  ChevronDown,
} from 'lucide-react';

interface Category {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  locales: Array<{
    language: string;
    name: string;
  }>;
  _count?: {
    articles: number;
  };
}

interface CategoryFormData {
  slug: string;
  locales: {
    zh: {
      name: string;
    };
    en: {
      name: string;
    };
  };
}

export default function CategoriesPage() {
  const t = useTranslations('AdminCategories');
  const ct = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    slug: '',
    locales: {
      zh: {
        name: '',
      },
      en: {
        name: '',
      },
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        language: locale,
        includeArticleCount: 'true',
      });

      const response = await fetch(`/api/categories?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data.data || []);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError('');
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      const localesArray = (['zh', 'en'] as const)
        .map((lang) => {
          const name = formData.locales[lang].name?.trim();
          if (!name) return null;
          return { language: lang, name };
        })
        .filter(Boolean);

      const submitData = {
        slug: formData.slug?.trim(),
        locales: localesArray,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save category');
      }

      // Reset form and refresh list
      setFormData({
        slug: '',
        locales: {
          zh: {
            name: '',
          },
          en: {
            name: '',
          },
        },
      });
      setShowCreateForm(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
      console.error('Error saving category:', err);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      slug: category.slug,
      locales: {
        zh: {
          name: category.locales.find(l => l.language === 'zh')?.name || '',
        },
        en: {
          name: category.locales.find(l => l.language === 'en')?.name || '',
        },
      },
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }

      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      console.error('Error deleting category:', err);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingCategory(null);
    setFormData({
      slug: '',
      locales: {
        zh: {
          name: '',
        },
        en: {
          name: '',
        },
      },
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocaleChange = (localeKey: 'zh' | 'en', value: string) => {
    setFormData((prev) => ({
      ...prev,
      locales: {
        ...prev.locales,
        [localeKey]: {
          name: value,
        },
      },
    }));
  };

  const getCategoryName = (category: Category) => {
    return category.locales.find(
      (localeContent) => localeContent.language === locale
    )?.name || category.locales[0]?.name || category.slug;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredCategories = categories.filter((category) => {
    const searchLower = searchTerm.toLowerCase();
    const name = getCategoryName(category).toLowerCase();
    const slug = category.slug.toLowerCase();
    return name.includes(searchLower) || slug.includes(searchLower);
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('manageCategories')}</h1>
            <p className="text-gray-600">
              {categories.length} {locale === 'zh' ? '个分类' : 'categories'}
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('createCategory')}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCategory ? t('editCategory') : t('createCategory')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Slug */}
              <div>
                <label className="form-label">Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="category-slug"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {locale === 'zh' ? '用于URL的唯一标识符' : 'Unique identifier for URL'}
                </p>
              </div>

              {/* Chinese Name */}
              <div>
                <label className="form-label flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  中文名称 *
                </label>
                <Input
                  value={formData.locales.zh.name}
                  onChange={(e) => handleLocaleChange('zh', e.target.value)}
                  placeholder="输入中文分类名称"
                  required
                />
              </div>

              {/* English Name */}
              <div>
                <label className="form-label flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  English Name *
                </label>
                <Input
                  value={formData.locales.en.name}
                  onChange={(e) => handleLocaleChange('en', e.target.value)}
                  placeholder="Enter English category name"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading categories...</p>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getCategoryName(category)}
                      </h3>
                      <p className="text-sm text-gray-500">{category.slug}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">{category._count?.articles || 0}</span>{' '}
                      {locale === 'zh' ? '篇文章' : 'articles'}
                    </p>
                    <p>
                      {locale === 'zh' ? '创建于' : 'Created'} {formatDate(category.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Language indicators */}
                <div className="mb-4 flex space-x-2">
                  {category.locales.some(l => l.language === 'zh') && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      中文
                    </span>
                  )}
                  {category.locales.some(l => l.language === 'en') && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      English
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                      disabled={(category._count?.articles || 0) > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {(category._count?.articles || 0) > 0 && (
                    <Link
                      href={`/${locale}/news?category=${category.slug}`}
                      target="_blank"
                      className="text-gray-600 hover:text-blue-600"
                      title="View articles"
                    >
                      <FileText className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                {/* Warning for categories with articles */}
                {(category._count?.articles || 0) > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-700">
                      {locale === 'zh'
                        ? '此分类包含文章，无法删除'
                        : 'This category contains articles and cannot be deleted'
                      }
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {locale === 'zh' ? '没有找到分类' : 'No categories found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {locale === 'zh'
                ? '没有找到匹配的分类，尝试创建一个新分类。'
                : 'No matching categories found. Try creating a new one.'
              }
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('createCategory')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
