import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ArticleStatus } from '@/types';
import { slugify } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const articleId = Array.isArray(id) ? id[0] : id;
  if (!articleId) {
    return res.status(400).json({ success: false, error: 'Missing id', message: '缺少文章ID' });
  }

  if (req.method === 'GET') {
    try {
      const language = (req.query.language as string) || 'zh';
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: {
          locales: {
            where: { language },
            select: { id: true, language: true, title: true, content: true, excerpt: true, metaDescription: true, createdAt: true, updatedAt: true },
          },
          categories: { include: { locales: { where: { language }, select: { name: true } } } },
          author: { select: { id: true, name: true } },
        },
      });

      if (!article) {
        return res.status(404).json({ success: false, error: 'Article not found', message: '文章不存在' });
      }

      if (article.locales.length === 0) {
        const articleWithDefaultLocale = await prisma.article.findUnique({
          where: { id: articleId },
          include: {
            locales: { select: { id: true, language: true, title: true, content: true, excerpt: true, metaDescription: true, createdAt: true, updatedAt: true } },
            categories: { include: { locales: { select: { name: true } } } },
            author: { select: { id: true, name: true } },
          },
        });
        if (articleWithDefaultLocale) {
          articleWithDefaultLocale.locales = articleWithDefaultLocale.locales.slice(0, 1);
          return res.status(200).json({ success: true, data: articleWithDefaultLocale });
        }
        return res.status(404).json({ success: false, error: 'No content available', message: '文章暂无可用内容' });
      }

      return res.status(200).json({ success: true, data: article });
    } catch (error) {
      console.error('GET /api/articles/[id] error:', error);
      return res.status(500).json({ success: false, error: 'Internal Server Error', message: '获取文章失败' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ success: false, error: 'Unauthorized', message: '请先登录' });
      }

      const { slug, status, featured, locales, categoryIds, publishedAt } = req.body ?? {};

      const existingArticle = await prisma.article.findUnique({ where: { id: articleId } });
      if (!existingArticle) {
        return res.status(404).json({ success: false, error: 'Article not found', message: '文章不存在' });
      }

      if (slug && slug !== existingArticle.slug) {
        const duplicateSlug = await prisma.article.findUnique({ where: { slug: slugify(slug) } });
        if (duplicateSlug && duplicateSlug.id !== articleId) {
          return res.status(409).json({ success: false, error: 'Slug already exists', message: '文章标识已存在，请使用其他标识' });
        }
      }

      const updateData: any = {};
      if (slug) updateData.slug = slugify(slug);
      if (status !== undefined) updateData.status = status;
      if (featured !== undefined) updateData.featured = featured;

      if (status === ArticleStatus.PUBLISHED && !existingArticle.publishedAt) {
        updateData.publishedAt = publishedAt ? new Date(publishedAt) : new Date();
      } else if (status === ArticleStatus.PUBLISHED && publishedAt) {
        updateData.publishedAt = new Date(publishedAt);
      } else if (status !== ArticleStatus.PUBLISHED) {
        updateData.publishedAt = null;
      }

      if (locales && Array.isArray(locales)) {
        await prisma.articleLocale.deleteMany({ where: { articleId } });
        updateData.locales = {
          create: locales.map((locale: any) => ({
            language: locale.language,
            title: locale.title,
            content: locale.content,
            excerpt: locale.excerpt || null,
            metaDescription: locale.metaDescription || null,
          })),
        };
      }

      if (categoryIds && Array.isArray(categoryIds)) {
        await prisma.article.update({ where: { id: articleId }, data: { categories: { set: [] } } });
        if (categoryIds.length > 0) {
          updateData.categories = { connect: categoryIds.map((categoryId: string) => ({ id: categoryId })) };
        }
      }

      const updatedArticle = await prisma.article.update({
        where: { id: articleId },
        data: updateData,
        include: {
          locales: true,
          categories: { include: { locales: true } },
          author: { select: { id: true, name: true } },
        },
      });

      return res.status(200).json({ success: true, data: updatedArticle, message: '文章更新成功' });
    } catch (error) {
      console.error('PUT /api/articles/[id] error:', error);
      return res.status(500).json({ success: false, error: 'Internal Server Error', message: '更新文章失败' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ success: false, error: 'Unauthorized', message: '请先登录' });
      }

      const existingArticle = await prisma.article.findUnique({ where: { id: articleId } });
      if (!existingArticle) {
        return res.status(404).json({ success: false, error: 'Article not found', message: '文章不存在' });
      }

      await prisma.article.delete({ where: { id: articleId } });
      return res.status(200).json({ success: true, message: '文章删除成功' });
    } catch (error) {
      console.error('DELETE /api/articles/[id] error:', error);
      return res.status(500).json({ success: false, error: 'Internal Server Error', message: '删除文章失败' });
    }
  }

  res.setHeader('Allow', 'GET,PUT,DELETE');
  return res.status(405).json({ success: false, error: 'Method Not Allowed', message: '不支持的请求方法' });
}
