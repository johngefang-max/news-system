import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始数据库种子数据初始化...');

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@news.com' },
    update: {},
    create: {
      email: 'admin@news.com',
      name: '系统管理员',
      role: 'ADMIN',
    },
  });

  console.log('✅ 管理员用户已创建:', adminUser);

  // 创建分类（中英文）
  const categories = [
    {
      slug: 'technology',
      locales: [
        { language: 'zh', name: '科技' },
        { language: 'en', name: 'Technology' }
      ]
    },
    {
      slug: 'business',
      locales: [
        { language: 'zh', name: '商业' },
        { language: 'en', name: 'Business' }
      ]
    },
    {
      slug: 'politics',
      locales: [
        { language: 'zh', name: '政治' },
        { language: 'en', name: 'Politics' }
      ]
    },
    {
      slug: 'sports',
      locales: [
        { language: 'zh', name: '体育' },
        { language: 'en', name: 'Sports' }
      ]
    },
    {
      slug: 'entertainment',
      locales: [
        { language: 'zh', name: '娱乐' },
        { language: 'en', name: 'Entertainment' }
      ]
    },
  ];

  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: {
        slug: categoryData.slug,
        locales: {
          create: categoryData.locales
        }
      },
      include: {
        locales: true
      }
    });

    console.log(`✅ 分类已创建: ${category.slug}`);
  }

  // 获取创建的分类ID
  const techCategory = await prisma.category.findUnique({ where: { slug: 'technology' } });
  const businessCategory = await prisma.category.findUnique({ where: { slug: 'business' } });

  // 创建示例文章
  const sampleArticles = [
    {
      slug: 'ai-revolution-2024',
      status: 'PUBLISHED' as const,
      featured: true,
      locales: [
        {
          language: 'zh',
          title: '人工智能革命：2024年的技术突破与未来展望',
          content: `# 人工智能革命：2024年的技术突破与未来展望

人工智能技术在过去一年中取得了令人瞩目的进展。从大型语言模型到计算机视觉，从自动驾驶到医疗诊断，AI正在改变我们的生活方式。

## 主要技术突破

### 1. 大型语言模型的进化
2024年，我们看到了更加智能和高效的模型出现，这些模型不仅能够理解和生成自然语言，还能够进行复杂的推理和创造。

### 2. 多模态AI的崛起
现在的AI系统能够同时处理文本、图像、音频和视频，实现了真正的多模态理解。

## 未来展望

专家预测，在接下来的几年里，AI将在更多领域发挥重要作用，包括教育、医疗、金融等。`,
          excerpt: '探索2024年人工智能领域的重要技术突破，包括大型语言模型的进化和多模态AI的崛起。',
          metaDescription: '2024年AI技术突破，大型语言模型，多模态AI，人工智能未来发展趋势'
        },
        {
          language: 'en',
          title: 'AI Revolution: Technological Breakthroughs and Future Outlook in 2024',
          content: `# AI Revolution: Technological Breakthroughs and Future Outlook in 2024

Artificial intelligence technology has made remarkable progress over the past year. From large language models to computer vision, from autonomous driving to medical diagnosis, AI is changing our way of life.

## Major Technological Breakthroughs

### 1. Evolution of Large Language Models
In 2024, we've seen the emergence of more intelligent and efficient models that can not only understand and generate natural language but also perform complex reasoning and creation.

### 2. Rise of Multimodal AI
Today's AI systems can simultaneously process text, images, audio, and video, achieving true multimodal understanding.

## Future Outlook

Experts predict that in the coming years, AI will play an important role in more fields, including education, healthcare, finance, and more.`,
          excerpt: 'Exploring important AI technology breakthroughs in 2024, including the evolution of large language models and the rise of multimodal AI.',
          metaDescription: 'AI technology breakthroughs 2024, large language models, multimodal AI, artificial intelligence future trends'
        }
      ],
      categoryIds: techCategory ? [techCategory.id] : []
    },
    {
      slug: 'global-economy-trends',
      status: 'PUBLISHED' as const,
      featured: false,
      locales: [
        {
          language: 'zh',
          title: '2024年全球经济趋势分析：挑战与机遇并存',
          content: `# 2024年全球经济趋势分析：挑战与机遇并存

随着全球经济的不断发展，我们面临着许多新的挑战和机遇。本文将分析当前的经济形势，并探讨未来的发展趋势。

## 主要经济趋势

### 1. 数字化转型加速
疫情后，全球企业数字化转型速度显著加快，远程办公、电子商务等成为新常态。

### 2. 绿色经济发展
可持续发展理念深入人心，各国政府和企业都在加大对绿色技术的投资。

## 投资机会

在当前经济环境下，新能源、人工智能、生物科技等领域展现出巨大的投资潜力。`,
          excerpt: '分析2024年全球经济发展趋势，探讨数字化转型和绿色经济带来的机遇与挑战。',
          metaDescription: '2024年全球经济趋势，数字化转型，绿色经济，投资机会分析'
        },
        {
          language: 'en',
          title: 'Global Economic Trends 2024: Challenges and Opportunities',
          content: `# Global Economic Trends 2024: Challenges and Opportunities

With the continuous development of the global economy, we face many new challenges and opportunities. This article will analyze the current economic situation and discuss future development trends.

## Major Economic Trends

### 1. Accelerated Digital Transformation
Post-pandemic, the pace of digital transformation for global enterprises has significantly accelerated, with remote work and e-commerce becoming the new normal.

### 2. Development of Green Economy
The concept of sustainable development has gained popularity, with governments and enterprises worldwide increasing investment in green technologies.

## Investment Opportunities

In the current economic environment, renewable energy, artificial intelligence, and biotechnology show tremendous investment potential.`,
          excerpt: 'Analysis of 2024 global economic development trends, exploring opportunities and challenges brought by digital transformation and green economy.',
          metaDescription: '2024 global economic trends, digital transformation, green economy, investment opportunity analysis'
        }
      ],
      categoryIds: businessCategory ? [businessCategory.id] : []
    }
  ];

  for (const articleData of sampleArticles) {
    const article = await prisma.article.upsert({
      where: { slug: articleData.slug },
      update: {},
      create: {
        slug: articleData.slug,
        status: articleData.status,
        featured: articleData.featured,
        authorId: adminUser.id,
        publishedAt: new Date(),
        locales: {
          create: articleData.locales
        },
        categories: {
          connect: articleData.categoryIds.map((id) => ({ id }))
        }
      }
    });

    console.log(`✅ 示例文章已创建: ${article.slug}`);
  }

  console.log('🎉 数据库种子数据初始化完成！');
}

main()
  .then(async () => {
    try {
      await prisma.siteSetting.upsert({
        where: { id: 'singleton' },
        update: {},
        create: {
          id: 'singleton',
          siteName: 'News Portal',
          defaultLanguage: 'zh',
          theme: 'light',
        }
      });
    } catch (e) {
      console.warn('跳过站点设置初始化', e as any);
    }
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 数据库种子数据初始化失败:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
