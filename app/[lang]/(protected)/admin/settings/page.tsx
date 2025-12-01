'use client';

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';

export default function SettingsPage() {
  const locale = useLocale();
  const [siteName, setSiteName] = useState('News Portal');
  const [defaultLang, setDefaultLang] = useState(locale);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/settings');
        if (!res.ok) {
          throw new Error('Failed to fetch settings');
        }
        const data = await res.json();
        const s = data.data;
        setSiteName(s.siteName || 'News Portal');
        setDefaultLang(s.defaultLanguage || locale);
        if (s.theme === 'dark' || s.theme === 'light') {
          setTheme(s.theme);
        }
      } catch (_) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [locale]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === 'zh' ? '系统设置' : 'Settings'}
        </h1>
        <p className="text-gray-600">
          {locale === 'zh' ? '配置站点基础信息' : 'Configure site basics'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {locale === 'zh' ? '基本信息' : 'General'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                {locale === 'zh' ? '站点名称' : 'Site name'}
              </label>
              <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                {locale === 'zh' ? '默认语言' : 'Default language'}
              </label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={defaultLang}
                onChange={(e) => setDefaultLang(e.target.value)}
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                {locale === 'zh' ? '主题' : 'Theme'}
              </label>
              <div className="flex items-center gap-3">
                <button
                  className={`px-3 py-2 rounded-md text-sm border ${theme === 'light' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => setTheme('light')}
                >
                  {locale === 'zh' ? '浅色' : 'Light'}
                </button>
                <button
                  className={`px-3 py-2 rounded-md text-sm border ${theme === 'dark' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-gray-300 text-gray-700'}`}
                  onClick={() => setTheme('dark')}
                >
                  {locale === 'zh' ? '深色' : 'Dark'}
                </button>
              </div>
            </div>
            <div>
              <Button
                onClick={async () => {
                  try {
                    setSaving(true);
                    setMessage('');
                    const res = await fetch('/api/settings', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        siteName,
                        defaultLanguage: defaultLang,
                        theme,
                      })
                    });
                    if (!res.ok) {
                      throw new Error('Failed to save');
                    }
                    setMessage(locale === 'zh' ? '设置已保存' : 'Settings saved');
                  } catch (e) {
                    setMessage(locale === 'zh' ? '保存失败' : 'Save failed');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                {saving ? (locale === 'zh' ? '保存中...' : 'Saving...') : (locale === 'zh' ? '保存' : 'Save')}
              </Button>
              {message && (
                <span className="ml-3 text-sm text-gray-600">{message}</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {locale === 'zh' ? '安全' : 'Security'}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {locale === 'zh' ? '启用两步验证' : 'Enable two-factor auth'}
                </p>
                <p className="text-xs text-gray-600">
                  {locale === 'zh' ? '提升管理员账户安全性' : 'Improve admin account security'}
                </p>
              </div>
              <button className="px-3 py-2 rounded-md text-sm border border-gray-300 text-gray-700">
                {locale === 'zh' ? '配置' : 'Configure'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {locale === 'zh' ? '强密码策略' : 'Strong password policy'}
                </p>
                <p className="text-xs text-gray-600">
                  {locale === 'zh' ? '要求至少12位复杂密码' : 'Require 12+ character complex passwords'}
                </p>
              </div>
              <button className="px-3 py-2 rounded-md text-sm border border-gray-300 text-gray-700">
                {locale === 'zh' ? '设置' : 'Set'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
