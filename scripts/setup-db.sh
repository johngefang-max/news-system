#!/bin/bash

# 数据库初始化脚本
# 使用方法: ./scripts/setup-db.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}"
    echo "=================================="
    echo "  新闻管理系统数据库设置脚本"
    echo "=================================="
    echo -e "${NC}"
}

# 默认配置
DB_NAME="news_db"
DB_USER="news_user"
DB_PASSWORD="news_password_2024"
DB_HOST="localhost"
DB_PORT="5432"

# 允许自定义配置
if [ -n "$1" ]; then
    DB_NAME=$1
fi

if [ -n "$2" ]; then
    DB_USER=$2
fi

if [ -n "$3" ]; then
    DB_PASSWORD=$3
fi

print_header

# 检查 PostgreSQL 是否安装
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL 未安装，请先安装 PostgreSQL"
    echo "Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "macOS: brew install postgresql"
    echo "Windows: https://www.postgresql.org/download/windows/"
    exit 1
fi

print_message "PostgreSQL 检查通过"

# 检查 PostgreSQL 服务是否运行
if ! pg_isready -q &> /dev/null; then
    print_warning "PostgreSQL 服务未运行"

    # 尝试启动 PostgreSQL 服务
    if command -v systemctl &> /dev/null; then
        print_message "尝试启动 PostgreSQL 服务..."
        sudo systemctl start postgresql
        sleep 3

        if ! pg_isready -q &> /dev/null; then
            print_error "PostgreSQL 启动失败，请手动启动服务"
            exit 1
        fi
    else
        print_error "请手动启动 PostgreSQL 服务"
        exit 1
    fi
fi

print_message "PostgreSQL 服务运行正常"

# 创建数据库和用户
print_message "创建数据库和用户..."

# 检查是否以 postgres 用户运行
if [ "$(whoami)" != "postgres" ]; then
    print_warning "建议以 postgres 用户运行此脚本"
    print_message "当前用户: $(whoami)"
    echo "使用 sudo -u postgres $0 重新运行"
fi

# 创建用户（如果不存在）
psql -U postgres -c "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" &> /dev/null
if [ $? -ne 0 ]; then
    print_message "创建数据库用户: $DB_USER"
    psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" || {
        print_error "创建用户失败"
        exit 1
    }
else
    print_message "数据库用户 $DB_USER 已存在"
fi

# 创建数据库（如果不存在）
psql -U postgres -lqt | cut -d \| -f 1 | grep -qw $DB_NAME
if [ $? -ne 0 ]; then
    print_message "创建数据库: $DB_NAME"
    psql -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" || {
        print_error "创建数据库失败"
        exit 1
    }
else
    print_message "数据库 $DB_NAME 已存在"
fi

# 授权
print_message "设置数据库权限..."
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" || {
    print_error "设置权限失败"
    exit 1
}

# 测试连接
print_message "测试数据库连接..."
if psql -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
    print_message "数据库连接测试成功"
else
    print_error "数据库连接测试失败"
    exit 1
fi

# 生成环境变量配置
ENV_FILE=".env.local"
ENV_EXAMPLE=".env.example"

print_message "生成环境变量配置..."

DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
    else
        touch "$ENV_FILE"
        echo "# 数据库连接" >> "$ENV_FILE"
        echo "DATABASE_URL=\"$DATABASE_URL\"" >> "$ENV_FILE"
        echo "" >> "$ENV_FILE"
        echo "# NextAuth 配置" >> "$ENV_FILE"
        echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> "$ENV_FILE"
        echo "NEXTAUTH_SECRET=\"your-secret-key-here\"" >> "$ENV_FILE"
    fi
else
    # 更新现有环境文件中的 DATABASE_URL
    if grep -q "DATABASE_URL=" "$ENV_FILE"; then
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" "$ENV_FILE"
    else
        echo "DATABASE_URL=\"$DATABASE_URL\"" >> "$ENV_FILE"
    fi
fi

# 生成随机密钥
if ! grep -q "NEXTAUTH_SECRET=your-secret-key-here" "$ENV_FILE"; then
    print_message "NEXTAUTH_SECRET 已存在，跳过生成"
else
    SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    sed -i "s/NEXTAUTH_SECRET=your-secret-key-here/NEXTAUTH_SECRET=$SECRET/" "$ENV_FILE"
    print_message "已生成 NEXTAUTH_SECRET"
fi

print_message "数据库设置完成！"
echo
echo "数据库连接信息:"
echo "  主机: $DB_HOST"
echo "  端口: $DB_PORT"
echo "  数据库: $DB_NAME"
echo "  用户: $DB_USER"
echo "  连接字符串: $DATABASE_URL"
echo
echo "环境变量已更新到: $ENV_FILE"
echo
print_message "现在可以运行以下命令启动项目:"
echo "  npm run db:push    # 推送数据库模式"
echo "  npm run db:generate # 生成 Prisma 客户端"
echo "  npm run db:seed     # 填充种子数据"
echo "  npm run dev          # 启动开发服务器"

echo
echo "登录信息:"
echo "  管理员邮箱: admin@news.com"
echo "  管理员密码: admin123"
echo
print_message "设置完成！"