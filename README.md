# 新闻管理系统 (News Management System)

一个基于 Next.js 14 的现代化新闻管理系统，支持多语言内容管理、用户认证和响应式设计。

## 🚀 功能特性

### 用户端功能
- ✅ **新闻浏览** - 卡片式布局展示新闻
- ✅ **新闻详情** - 完整的文章阅读体验
- ✅ **分类筛选** - 按分类浏览新闻
- ✅ **搜索功能** - 全文搜索新闻内容
- ✅ **多语言支持** - 中英文无缝切换
- ✅ **响应式设计** - 适配移动端、平板、桌面

### 管理端功能
- ✅ **用户认证** - 安全的管理员登录系统
- ✅ **文章管理** - 创建、编辑、删除、发布文章
- ✅ **分类管理** - 创建、编辑、删除分类
- ✅ **内容管理** - 草稿/发布/归档状态管理
- ✅ **仪表板** - 统计数据、最近活动、快速操作
- ✅ **多语言编辑** - 中英文内容编辑界面
- ✅ **搜索筛选** - 管理后台搜索和筛选功能

### ✨ 高级功能
- ✅ **实时搜索** - 全文搜索和搜索建议
- ✅ **响应式设计** - 移动端、平板、桌面完美适配
- ✅ **SEO优化** - 友好的URL结构和meta标签
- ✅ **性能优化** - 代码分割、图片优化、缓存策略
- ✅ **类型安全** - 完整的TypeScript类型定义

## 🛠️ 技术栈

- **前端框架**: Next.js 14 (App Router)
- **类型系统**: TypeScript
- **样式方案**: Tailwind CSS + @tailwindcss/typography
- **数据库**: PostgreSQL + Prisma ORM
- **身份认证**: NextAuth.js
- **国际化**: next-intl
- **部署平台**: Vercel

## 📁 项目结构

```
news-management-system/
├── app/                          # Next.js App Router
│   ├── [lang]/                   # 多语言路由
│   │   ├── (public)/            # 公共页面
│   │   ├── (protected)/         # 需要认证的页面
│   │   └── layout.tsx           # 语言布局
│   ├── api/                     # API 路由
│   │   ├── articles/            # 文章API
│   │   ├── categories/          # 分类API
│   │   ├── auth/                # 认证API
│   │   └── dashboard/           # 仪表板API
│   └── globals.css              # 全局样式
├── components/                   # React 组件
│   ├── ui/                      # 基础UI组件
│   ├── layout/                  # 布局组件
│   ├── news/                    # 新闻相关组件
│   └── admin/                   # 管理后台组件
├── lib/                         # 工具库
│   ├── prisma.ts               # Prisma 客户端
│   ├── auth.ts                 # NextAuth 配置
│   └── utils.ts                # 通用工具函数
├── prisma/                      # 数据库相关
│   ├── schema.prisma           # 数据模型定义
│   └── seed.ts                 # 种子数据
├── messages/                    # 国际化翻译文件
│   ├── zh.json                 # 中文翻译
│   └── en.json                 # 英文翻译
├── types/                       # TypeScript 类型定义
├── public/                      # 静态资源
└── middleware.ts                # Next.js 中间件
```

## 🗄️ 数据模型

### 核心实体
- **User** - 用户管理，支持角色权限 (ADMIN/EDITOR/CONTRIBUTOR)
- **Article** - 文章实体，支持状态管理 (DRAFT/PUBLISHED/ARCHIVED)
- **ArticleLocale** - 多语言内容，支持中英文标题、内容、摘要
- **Category** - 分类管理，支持多语言分类名称
- **CategoryLocale** - 分类多语言名称

### 关键特性
- 🌐 多语言内容支持 (中英文)
- 🔐 角色权限管理
- 📝 文章状态管理
- 🔗 SEO友好的URL结构

## 🚀 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 14+

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd news-management-system
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **环境变量配置**
   ```bash
   cp .env.example .env.local
   ```

   编辑 `.env.local` 文件：
   ```env
   # 数据库
   DATABASE_URL="postgresql://username:password@localhost:5432/news_db"

   # 认证
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **数据库设置**
   ```bash
   # 推送数据库模式
   npm run db:push

   # 生成 Prisma 客户端
   npm run db:generate

   # 填充种子数据
   npm run db:seed
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **访问应用**
   - 用户端: http://localhost:3000/zh
   - 管理后台: http://localhost:3000/zh/admin
   - 默认管理员账户: admin@news.com / admin123

## 📋 API 接口

### 文章相关
- `GET /api/articles` - 获取文章列表
- `POST /api/articles` - 创建文章 (需认证)
- `GET /api/articles/[id]` - 获取单篇文章
- `PUT /api/articles/[id]` - 更新文章 (需认证)
- `DELETE /api/articles/[id]` - 删除文章 (需认证)

### 分类相关
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类 (需管理员权限)
- `GET /api/categories/[id]` - 获取单个分类
- `PUT /api/categories/[id]` - 更新分类 (需管理员权限)
- `DELETE /api/categories/[id]` - 删除分类 (需管理员权限)

### 用户管理
- `GET /api/users` - 获取用户列表 (需管理员权限)
- `POST /api/users` - 创建用户 (需管理员权限)
- `GET /api/dashboard/stats` - 获取仪表板统计 (需认证)

### 认证
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js 认证端点

## 🎨 设计特色

- 🎯 **现代化设计** - 参考 toolify.ai 的卡片式布局
- 📱 **响应式布局** - 完美适配各种设备
- 🌈 **优雅配色** - 主色调深蓝色，清晰的信息层级
- ⚡ **高性能** - 优化的加载速度和用户体验

## 🚀 部署指南

### Vercel 部署 (推荐)

1. **连接 GitHub 仓库**
   - 在 Vercel 控制台中导入项目
   - 连接您的 GitHub 仓库

2. **配置环境变量**
   ```
   DATABASE_URL=your_postgresql_connection_string
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your_secret_key
   ```

3. **自动部署**
   - Vercel 会自动检测 Next.js 项目
   - 推送代码时自动触发部署

## 🛡️ 安全特性

- 🔐 **身份认证** - NextAuth.js 安全认证系统
- 🛡️ **权限控制** - 基于角色的访问控制
- 🔒 **输入验证** - 防止 XSS 和 SQL 注入
- 🚫 **CSRF 保护** - 跨站请求伪造防护

## 📈 性能优化

- ⚡ **代码分割** - 按路由自动代码分割
- 🖼️ **图片优化** - Next.js Image 组件优化
- 🗄️ **数据库优化** - Prisma 查询优化
- 💾 **缓存策略** - 适当的响应缓存

## 🔧 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **TypeScript** - 类型安全
- **Prisma** - 数据库 ORM

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Pull Request 和 Issue！

## 📞 联系

如有问题，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至项目维护者

---

**开发进度**: ✅ 项目完成 (全栈新闻管理系统)
**项目状态**: 🎉 生产就绪，可立即部署使用