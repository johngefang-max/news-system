'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Button, Input } from '@/components/ui';

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    articles: number;
  };
}

export default function UsersPage() {
  const locale = useLocale();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (role) params.set('role', role);
      params.set('limit', '20');
      const res = await fetch(`/api/users?${params.toString()}`);
      if (res.status === 401) {
        setError(locale === 'zh' ? '请先登录' : 'Please sign in');
        return;
      }
      if (res.status === 403) {
        setError(locale === 'zh' ? '只有管理员可以查看用户列表' : 'Only admins can view users');
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data.data?.users || []);
    } catch (e) {
      setError(locale === 'zh' ? '加载用户失败' : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === 'zh' ? '用户管理' : 'User Management'}
          </h1>
          <p className="text-gray-600">
            {locale === 'zh' ? '查看与管理站点用户' : 'View and manage site users'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchUsers}>
            {locale === 'zh' ? '刷新' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder={locale === 'zh' ? '搜索姓名或邮箱' : 'Search name or email'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">{locale === 'zh' ? '全部角色' : 'All roles'}</option>
            <option value="ADMIN">ADMIN</option>
            <option value="EDITOR">EDITOR</option>
          </select>
          <Button onClick={fetchUsers}>
            {locale === 'zh' ? '搜索' : 'Search'}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="animate-pulse h-4 w-32 bg-gray-200 rounded" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'zh' ? '姓名' : 'Name'}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'zh' ? '发布文章数' : 'Published Articles'}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'zh' ? '创建时间' : 'Created'}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{u.name || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{u.email}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">{u._count?.articles ?? 0}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{new Date(u.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={5}>
                    {locale === 'zh' ? '暂无用户' : 'No users yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
