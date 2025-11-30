@echo off
REM 新闻管理系统 Windows 快速启动脚本
REM 使用方法: setup.bat [环境名称]

setlocal enabledelayedexpansion

REM 环境名称 (development, production)
set "ENVIRONMENT=%~1"
if "%ENVIRONMENT%"=="" set "ENVIRONMENT=development"

echo ==================================
echo   新闻管理系统快速启动脚本
echo   环境: %ENVIRONMENT%
echo ==================================
echo.

REM 检查 Node.js
echo [INFO] 检查系统环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js 未安装，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查 Node.js 版本
for /f "tokens=*" %%i in ('node -v') do set "NODE_VERSION=%%i"
echo [INFO] Node.js 版本: %NODE_VERSION%

REM 安装依赖
echo [INFO] 正在安装项目依赖...
if exist "pnpm-lock.yaml" (
    pnpm install
) else if exist "yarn.lock" (
    yarn install
) else (
    npm install
)
echo [INFO] 依赖安装完成

REM 环境变量配置
if not exist ".env.local" (
    echo [INFO] 创建环境变量文件...
    copy ".env.example" ".env.local"

    echo [WARNING] 请编辑 .env.local 文件，配置正确的数据库连接信息
    echo 当前配置:
    echo   DATABASE_URL: 需要手动配置
    echo   NEXTAUTH_URL: http://localhost:3000
    echo   NEXTAUTH_SECRET: 需要手动配置

    echo.
    echo 是否现在编辑环境变量文件？(y/n)
    set /p edit_env=
    if /i "!edit_env!"=="y" (
        notepad .env.local
    )
) else (
    echo [INFO] 环境变量文件已存在
)

REM 数据库设置
if "%ENVIRONMENT%"=="development" (
    echo [INFO] 设置数据库...

    REM 检查 PostgreSQL
    psql --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARNING] 未检测到 PostgreSQL，请确保已安装 PostgreSQL
        echo PostgreSQL 安装指南: https://www.postgresql.org/download/windows/
        pause
        exit /b 1
    )

    REM 推送数据库模式
    echo [INFO] 推送数据库模式...
    npm run db:push

    REM 生成 Prisma 客户端
    echo [INFO] 生成 Prisma 客户端...
    npm run db:generate

    REM 填充种子数据
    echo [INFO] 填充种子数据...
    npm run db:seed

    echo [INFO] 数据库设置完成

    REM 启动开发服务器
    echo [INFO] 启动开发服务器...
    echo 服务器将在 http://localhost:3000 启动
    echo  管理后台: http://localhost:3000/zh/admin
    echo  默认账户: admin@news.com / admin123
    echo.
    npm run dev
) else (
    echo [INFO] 构建生产版本...
    npm run build
    echo [INFO] 构建完成
    echo 请配置正确的环境变量后部署到生产环境
)

pause