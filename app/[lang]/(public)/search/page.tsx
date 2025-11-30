'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { NewsCard } from '@/components/news/news-card';
import { CategoryBadge } from '@/components/news/category-badge';
import { Button, Loading, LoadingSkeleton, Input } from '@/components/ui';
import { Search, Filter, Clock, TrendingUp, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';

interface Article {
  id: string;
  slug: string;
  status: string;
  featured: boolean;
  createdAt: string;
  publishedAt: string | null;
  locales: Array<{
    language: string;
    title: string;
    excerpt: string | null;
  }>;
  categories: Array<{
    id: string;
    slug: string;
    locales: Array<{
      language: string;
      name: string;
    }>;
  }>;
  author?: {
    name: string | null;
  };
}

interface Category {
  id: string;
  slug: string;
  locales: Array<{
    language: string;
    name: string;
  }>;
}

interface SearchPageProps {
  params: {
    locale: string;
  };
}

export default function SearchPage({ params: { locale } }: SearchPageProps) {
  const t = useTranslations('Search');
  const st = useTranslations('HomePage');
  const currentLocale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    // 从localStorage加载搜索历史
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error('Error parsing search history:', err);
      }
    }

    fetchCategories();

    // 如果有查询参数，执行搜索
    if (query) {
      performSearch(query);
    }
  }, [locale]);

  useEffect(() => {
    // 更新URL参数
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.category) params.set('category', filters.category);

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [query, filters]);

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

  const performSearch = async (searchQuery: string, categoryFilter: string = filters.category) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        language: locale,
        status: 'PUBLISHED',
        search: searchQuery.trim(),
        limit: '20',
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      if (categoryFilter) {
        queryParams.append('category', categoryFilter);
      }

      const response = await fetch(`/api/articles?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to search articles');
      }

      const data = await response.json();
      setArticles(data.data.articles || []);

      // 更新搜索历史
      if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
        const newHistory = [searchQuery.trim(), ...searchHistory.slice(0, 9)];
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }

    } catch (err) {
      setError('Failed to search');
      console.error('Error searching:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);

    // 显示搜索建议（这里可以根据需求实现智能建议）
    if (value.trim().length > 0) {
      // 简单的建议逻辑：基于历史搜索
      const filteredSuggestions = searchHistory.filter(
        history => history.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (query) {
      performSearch(query, value);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setArticles([]);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    performSearch(historyItem);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header locale={locale} />

      <main>
        {/* Search Header */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12 md:py-16">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  {t('searchResults')}
                </h1>
                <p className="text-lg text-gray-600">
                  {locale === 'zh' ? '搜索您感兴趣的新闻和资讯' : 'Search for news and information that interests you'}
                </p>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="pl-12 pr-12 h-14 text-lg"
                    autoFocus
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center space-x-2"
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </form>

              {/* Search History */}
              {searchHistory.length > 0 && !query && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      {locale === 'zh' ? '搜索历史' : 'Recent Searches'}
                    </h3>
                    <button
                      onClick={clearHistory}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      {locale === 'zh' ? '清除' : 'Clear'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((historyItem, index) => (
                      <button
                        key={index}
                        onClick={() => handleHistoryClick(historyItem)}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
                      >
                        <Clock className="w-3 h-3" />
                        <span>{historyItem}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Filters */}
        {(articles.length > 0 || query) && (
          <section className="bg-white border-b border-gray-200 py-4">
            <div className="container-custom">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Category Filter */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{t('filters')}:</span>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="h-9 border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{locale === 'zh' ? '所有分类' : 'All Categories'}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.locales.find(l => l.language === locale)?.name || category.locales[0]?.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{t('sortBy')}:</span>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      handleFilterChange('sortBy', sortBy);
                      handleFilterChange('sortOrder', sortOrder);
                    }}
                    className="h-9 border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="publishedAt-desc">{t('latestFirst')}</option>
                    <option value="publishedAt-asc">{t('oldestFirst')}</option>
                    <option value="createdAt-desc">{locale === 'zh' ? '最新创建' : 'Recently Created'}</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Search Results */}
        <section className="py-8">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              {query && (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t('searchFor')} "{query}"
                  </h2>
                  <p className="text-gray-600">
                    {articles.length} {locale === 'zh' ? '个结果' : 'results'}
                  </p>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <LoadingSkeleton key={i} className="h-64" />
                  ))}
                </div>
              ) : query && articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      locale={locale}
                    />
                  ))}
                </div>
              ) : query ? (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('noSearchResults')}
                  </h2>
                  <p className="text-gray-600 mb-8">
                    {locale === 'zh'
                      ? '尝试使用不同的关键词或检查拼写'
                      : 'Try different keywords or check your spelling'
                    }
                  </p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        {locale === 'zh' ? '搜索建议：' : 'Search suggestions:'}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {['人工智能', '商业', '科技', '体育', '娱乐'].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleHistoryClick(suggestion)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Link href={`/${locale}`}>
                      <Button variant="outline">
                        {locale === 'zh' ? '返回首页' : 'Back to Home'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <Search className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {locale === 'zh' ? '开始搜索' : 'Start Searching'}
                    </h2>
                    <p className="text-gray-600 mb-8">
                      {locale === 'zh'
                        ? '在上方输入关键词来搜索新闻和文章'
                        : 'Enter keywords above to search for news and articles'
                      }
                    </p>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        {locale === 'zh' ? '热门搜索：' : 'Popular searches:'}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {['人工智能', '全球化', '科技创新', '经济发展'].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleHistoryClick(suggestion)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100 flex items-center space-x-1"
                          >
                            <TrendingUp className="w-3 h-3" />
                            <span>{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer currentLocale={locale} />
    </div>
  );
}