'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { Eye, EyeOff, Lock, Mail, Shield, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('Auth');
  const ft = useTranslations('Forms');
  const et = useTranslations('Errors');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const callbackUrl = searchParams?.get('callbackUrl') || `/${locale}/admin/dashboard`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError(t('invalidCredentials'));
      } else if (result?.ok) {
        router.push(callbackUrl);
      } else {
        setError(t('loginError'));
      }
    } catch (err) {
      setError(t('loginError'));
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 清除错误信息
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {locale === 'zh' ? '管理员登录' : 'Admin Login'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {locale === 'zh' ? '请使用管理员账户登录' : 'Please sign in with your admin account'}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="form-label">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder={locale === 'zh' ? '请输入邮箱地址' : 'Enter your email'}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="form-label">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  placeholder={locale === 'zh' ? '请输入密码' : 'Enter your password'}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {locale === 'zh' ? '记住我' : 'Remember me'}
                </span>
              </label>
              <Link
                href={`/${locale}/forgot-password`}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {locale === 'zh' ? '忘记密码？' : 'Forgot password?'}
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {locale === 'zh' ? '登录中...' : 'Signing in...'}
                </div>
              ) : (
                t('login')
              )}
            </Button>
          </form>

          {/* Demo Account Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">
              {locale === 'zh' ? '演示账户' : 'Demo Account'}
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>{locale === 'zh' ? '邮箱：' : 'Email:'} admin@news.com</p>
              <p>{locale === 'zh' ? '密码：' : 'Password:'} admin123</p>
            </div>
          </div>
        </div>

        {/* Back to Site */}
        <div className="text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {locale === 'zh' ? '返回网站首页' : 'Back to website'}
          </Link>
        </div>
      </div>
    </div>
  );
}
