# 新闻管理系统 - 部署和启动指南

## 📋 目录
1. [环境准备](#环境准备)
2. [本地开发启动](#本地开发启动)
3. [环境变量配置](#环境变量配置)
4. [数据库设置](#数据库设置)
5. [生产环境部署](#生产环境部署)
6. [常见问题解决](#常见问题解决)
7. [维护指南](#维护指南)

---

## 🛠️ 环境准备

### 系统要求
- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本 (或 yarn/pnpm)
- **PostgreSQL**: 14.0 或更高版本
- **Git**: 用于代码管理

### 必需软件安装

#### 1. 安装 Node.js
```bash
# 使用 nvm (推荐)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 或者直接从官网下载
# https://nodejs.org/
```

#### 2. 安装 PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (使用 Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# 从官网下载安装: https://www.postgresql.org/download/windows/
```

#### 3. 安装 Git
```bash
# Ubuntu/Debian
sudo apt install git

# macOS
brew install git

# Windows
# 从官网下载: https://git-scm.com/download/win
```

---

## 🚀 本地开发启动

### 步骤 1: 克隆项目
```bash
git clone <your-repository-url>
cd news-management-system
```

### 步骤 2: 安装依赖
```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

### 步骤 3: 配置环境变量
创建环境变量文件：
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：
```env
# 数据库连接 - 必填
DATABASE_URL="postgresql://username:password@localhost:5432/news_db"

# NextAuth 配置 - 必填
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-please-change-this"

# 文件上传 (可选)
# BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

### 步骤 4: 数据库设置

#### 4.1 创建数据库
```bash
# 连接到 PostgreSQL
sudo -u postgres psql

# 在 PostgreSQL 命令行中执行
CREATE DATABASE news_db;
CREATE USER news_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE news_db TO news_user;
\q
```

#### 4.2 更新数据库连接
根据上面的设置，更新 `.env.local`：
```env
DATABASE_URL="postgresql://news_user:your_password@localhost:5432/news_db"
```

#### 4.3 初始化数据库
```bash
# 推送数据库模式到 PostgreSQL
npm run db:push

# 生成 Prisma 客户端
npm run db:generate

# 填充初始数据 (管理员账户和示例文章)
npm run db:seed
```

### 步骤 5: 启动开发服务器
```bash
npm run dev
```

### 步骤 6: 访问应用
- **用户端**: http://localhost:3000/zh
- **管理后台**: http://localhost:3000/zh/admin
- **英文版**: http://localhost:3000/en

### 默认登录账户
- **邮箱**: admin@news.com
- **密码**: admin123

---

## ⚙️ 环境变量配置详解

### 必需环境变量

#### `DATABASE_URL`
数据库连接字符串，格式：
```
postgresql://[username]:[password]@[host]:[port]/[database]
```

示例：
```env
DATABASE_URL="postgresql://news_user:mypassword123@localhost:5432/news_db"
```

#### `NEXTAUTH_URL`
应用的完整URL，用于认证回调。

**本地开发**:
```env
NEXTAUTH_URL="http://localhost:3000"
```

**生产环境**:
```env
NEXTAUTH_URL="https://your-domain.com"
```

#### `NEXTAUTH_SECRET`
用于加密会话的随机字符串，必须是至少32个字符的字符串。

**生成密钥**:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -base64 32

# 或在线生成工具
# https://generate-secret.vercel.app/32
```

### 可选环境变量

#### `BLOB_READ_WRITE_TOKEN`
如果你使用 Vercel Blob 进行文件上传：
```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxxxxxx=="
```

---

## 🗄️ 数据库设置详解

### PostgreSQL 安装和配置

#### Ubuntu/Debian
```bash
# 安装 PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 设置密码
sudo -u postgres psql
\password postgres
\q
```

#### macOS
```bash
# 安装 PostgreSQL
brew install postgresql
brew services start postgresql

# 创建用户和数据库
createdb
createuser -s postgres
```

#### Windows
1. 下载 PostgreSQL 安装包
2. 运行安装程序，记住设置的密码
3. 使用 pgAdmin 或命令行创建数据库

### 数据库连接问题解决

#### 连接被拒绝
```bash
# 检查 PostgreSQL 服务状态
sudo systemctl status postgresql

# 启动服务
sudo systemctl start postgresql

# 检查端口占用
sudo netstat -tlnp | grep :5432
```

#### 权限问题
```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建用户和数据库
CREATE USER news_user WITH PASSWORD 'your_password';
CREATE DATABASE news_db OWNER news_user;
GRANT ALL PRIVILEGES ON DATABASE news_db TO news_user;
```

### 数据库迁移和备份

#### 备份数据库
```bash
pg_dump news_db > backup.sql
```

#### 恢复数据库
```bash
psql news_db < backup.sql
```

#### 重置数据库
```bash
# 删除所有表
npx prisma db push --force-reset

# 重新填充数据
npm run db:seed
```

---

## 🌐 生产环境部署

### Vercel 部署 (推荐)

#### 步骤 1: 准备 GitHub 仓库
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/news-management-system.git
git push -u origin main
```

#### 步骤 2: 部署到 Vercel
1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. Vercel 会自动检测 Next.js 项目

#### 步骤 3: 配置环境变量
在 Vercel 项目设置中添加：
```
DATABASE_URL=your_production_database_url
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_production_secret
```

#### 步骤 4: 设置数据库
**选项 A: Vercel Postgres (推荐)**
1. 在 Vercel 项目中点击 "Storage"
2. 创建 PostgreSQL 数据库
3. 复制连接字符串到环境变量
4. 运行数据库迁移

**选项 B: 外部 PostgreSQL**
1. 使用云服务 (AWS RDS, DigitalOcean, Railway 等)
2. 获取连接字符串
3. 配置环境变量
4. 手动运行迁移

#### 步骤 5: 运行数据库迁移
```bash
# 本地运行生产迁移
npx prisma db push

# 或通过 Vercel CLI
vercel env pull
npx prisma db push
```

### 其他平台部署

#### Netlify
```bash
# 构建项目
npm run build

# 部署到 Netlify
# 需要配置适配器处理 API 路由
```

#### Docker 部署
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/news_db
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=news_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 🔧 常见问题解决

### 开发环境问题

#### 1. 端口被占用
```bash
# 查找占用 3000 端口的进程
lsof -ti:3000

# 杀死进程
kill -9 <PID>

# 或使用其他端口
npm run dev -- -p 3001
```

#### 2. 依赖安装失败
```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 3. Prisma 生成失败
```bash
# 重新生成客户端
npx prisma generate
npx prisma db push
```

#### 4. 数据库连接失败
```bash
# 测试数据库连接
psql $DATABASE_URL

# 检查数据库服务
sudo systemctl status postgresql

# 重启数据库服务
sudo systemctl restart postgresql
```

### 生产环境问题

#### 1. 环境变量未生效
```bash
# Vercel CLI
vercel env ls
vercel env pull

# 检查部署日志
vercel logs
```

#### 2. 数据库连接超时
- 检查防火墙设置
- 确认数据库允许外部连接
- 验证连接字符串格式

#### 3. 认证问题
- 确保 `NEXTAUTH_URL` 设置正确
- 检查 `NEXTAUTH_SECRET` 长度
- 验证回调 URL 配置

### 构建问题

#### 1. TypeScript 错误
```bash
# 检查类型错误
npx tsc --noEmit

# 更新类型
npx prisma generate
```

#### 2. 内存不足
```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

## 📋 维护指南

### 日常维护

#### 1. 数据备份
```bash
# 每日备份脚本
#!/bin/bash
pg_dump $DATABASE_URL > "backup_$(date +%Y%m%d_%H%M%S).sql"
```

#### 2. 日志监控
```bash
# 查看应用日志
pm2 logs
# 或 Docker 日志
docker-compose logs -f
```

#### 3. 性能监控
- 设置应用监控 (如 Vercel Analytics)
- 监控数据库性能
- 定期检查错误日志

### 更新和维护

#### 1. 更新依赖
```bash
# 检查过期依赖
npm outdated

# 更新依赖
npm update

# 安全更新
npm audit fix
```

#### 2. 数据库维护
```bash
# 分析查询性能
npx prisma studio

# 更新数据库模式
npx prisma db push
```

### 用户管理

#### 1. 创建管理员账户
```typescript
// 在数据库中直接创建
INSERT INTO "users" (id, email, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'new-admin@yourdomain.com',
  'New Admin',
  'ADMIN',
  NOW(),
  NOW()
);
```

#### 2. 重置密码
由于使用 NextAuth.js 的 credentials provider，密码需要在代码中设置。建议实现密码重置功能。

### 扩展开发

#### 1. 添加新功能
1. 更新数据库模型 (`prisma/schema.prisma`)
2. 创建 API 路由
3. 添加前端组件
4. 更新国际化翻译

#### 2. 自定义样式
修改 `tailwind.config.js` 和 `app/globals.css`

#### 3. 添加新页面
1. 在 `app/[lang]/(public)` 或 `app/[lang]/(protected)` 中添加
2. 更新导航菜单

---

## 🆘 技术支持

如果遇到问题：

1. **检查日志**: 查看应用和数据库日志
2. **查阅文档**: 参考 Next.js、Prisma、NextAuth.js 官方文档
3. **GitHub Issues**: 提交问题到项目仓库
4. **社区支持**: 查看相关技术社区

### 有用的命令
```bash
# 项目命令
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 代码检查
npm run db:push      # 推送数据库模式
npm run db:generate  # 生成 Prisma 客户端
npm run db:seed      # 填充种子数据

# Prisma 命令
npx prisma studio     # 打开数据库可视化工具
npx prisma migrate   # 运行数据库迁移
npx prisma generate  # 重新生成客户端
```

---

## 📞 联系方式

如有任何问题，请通过以下方式联系：

- **GitHub Issues**: 项目仓库中的 Issues 页面
- **邮件**: 发送邮件至项目维护者
- **文档**: 查看项目 README 和代码注释

---

**🎉 恭喜！您的新闻管理系统现在已经成功部署和运行！**