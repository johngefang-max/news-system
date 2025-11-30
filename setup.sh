#!/bin/bash

# 新闻管理系统快速启动脚本
# 使用方法: ./setup.sh [环境名称]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 环境名称 (development, production)
ENVIRONMENT=${1:-development}

# 打印带颜色的消息
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
    echo "  新闻管理系统快速启动脚本"
    echo "  环境: $ENVIRONMENT"
    echo "=================================="
    echo -e "${NC}"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 检查 Node.js 版本
check_node_version() {
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_NODE_VERSION="18.0.0"

    if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE_VERSION" ]; then
        print_error "Node.js 版本过低，当前版本: $NODE_VERSION，需要: $REQUIRED_NODE_VERSION+"
        exit 1
    fi
    print_message "Node.js 版本检查通过: $NODE_VERSION"
}

# 安装依赖
install_dependencies() {
    print_message "正在安装项目依赖..."
    if command -v pnpm &> /dev/null; then
        pnpm install
    elif command -v yarn &> /dev/null; then
        yarn install
    else
        npm install
    fi
    print_message "依赖安装完成"
}

# 环境变量配置
setup_env() {
    if [ ! -f ".env.local" ]; then
        print_message "创建环境变量文件..."
        cp .env.example .env.local

        # 生成随机的 NEXTAUTH_SECRET
        SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
        sed -i "s/your-secret-key-here/$SECRET/g" .env.local

        print_warning "请编辑 .env.local 文件，配置正确的数据库连接信息"
        print_warning "当前配置:"
        echo "  DATABASE_URL: 需要手动配置"
        echo "  NEXTAUTH_URL: http://localhost:3000"
        echo "  NEXTAUTH_SECRET: 已自动生成"

        read -p "是否现在编辑环境变量文件？(y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env.local
        fi
    else
        print_message "环境变量文件已存在"
    fi
}

# 数据库设置
setup_database() {
    print_message "设置数据库..."

    # 检查 PostgreSQL 是否运行
    if ! pg_isready -q &> /dev/null; then
        print_warning "PostgreSQL 未运行，请先启动 PostgreSQL 服务"
        print_message "启动 PostgreSQL 的方法:"
        echo "  Ubuntu/Debian: sudo systemctl start postgresql"
        echo "  macOS: brew services start postgresql"
        echo "  Windows: 启动 PostgreSQL 服务"
        exit 1
    fi

    # 推送数据库模式
    print_message "推送数据库模式..."
    npm run db:push

    # 生成 Prisma 客户端
    print_message "生成 Prisma 客户端..."
    npm run db:generate

    # 填充种子数据
    print_message "填充种子数据..."
    npm run db:seed

    print_message "数据库设置完成"
}

# 启动开发服务器
start_dev_server() {
    print_message "启动开发服务器..."
    print_message "服务器将在 http://localhost:3000 启动"
    print_message "管理后台: http://localhost:3000/zh/admin"
    print_message "默认账户: admin@news.com / admin123"
    echo
    npm run dev
}

# 生产构建
build_production() {
    print_message "构建生产版本..."
    npm run build
    print_message "构建完成"
}

# 主函数
main() {
    print_header

    # 检查必要的命令
    print_message "检查系统环境..."
    check_command node
    check_command npm
    check_node_version

    # 如果使用 Git，检查是否在 Git 仓库中
    if [ -d ".git" ]; then
        print_message "Git 仓库检测通过"
    else
        print_warning "未检测到 Git 仓库，建议初始化 Git"
    fi

    # 检查 PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_warning "未检测到 PostgreSQL，请确保已安装 PostgreSQL"
        print_message "PostgreSQL 安装指南: https://www.postgresql.org/download/"
    fi

    # 根据环境执行不同操作
    case $ENVIRONMENT in
        "development")
            install_dependencies
            setup_env
            setup_database
            start_dev_server
            ;;
        "production")
            install_dependencies
            build_production
            print_message "生产版本构建完成"
            print_message "请配置正确的环境变量后部署到生产环境"
            ;;
        *)
            print_error "无效的环境名称，使用: development 或 production"
            exit 1
            ;;
    esac
}

# 错误处理
trap 'print_error "脚本执行失败，请检查错误信息"' ERR

# 执行主函数
main "$@"