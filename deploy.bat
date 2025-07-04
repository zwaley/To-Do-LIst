@echo off
chcp 65001 >nul
echo ========================================
echo     To-Do List 应用部署助手
echo ========================================
echo.

:menu
echo 请选择部署方式：
echo.
echo 1. GitHub Pages 部署准备
echo 2. Netlify 部署准备
echo 3. Vercel 部署准备
echo 4. 本地预览
echo 5. 创建部署包
echo 6. 退出
echo.
set /p choice=请输入选项 (1-6): 

if "%choice%"=="1" goto github
if "%choice%"=="2" goto netlify
if "%choice%"=="3" goto vercel
if "%choice%"=="4" goto preview
if "%choice%"=="5" goto package
if "%choice%"=="6" goto exit

echo 无效选项，请重新选择。
echo.
goto menu

:github
echo.
echo ========================================
echo     GitHub Pages 部署准备
echo ========================================
echo.
echo 正在检查 Git 状态...
git status >nul 2>&1
if errorlevel 1 (
    echo Git 仓库未初始化，正在初始化...
    git init
    git add .
    git commit -m "Initial commit: To-Do List App"
    echo.
    echo Git 仓库已初始化！
    echo.
    echo 接下来请执行以下步骤：
    echo 1. 在 GitHub 创建新仓库
    echo 2. 执行命令：git remote add origin https://github.com/用户名/仓库名.git
    echo 3. 执行命令：git push -u origin main
    echo 4. 在 GitHub 仓库设置中启用 Pages
) else (
    echo Git 仓库已存在，正在提交更改...
    git add .
    git commit -m "Update: Ready for deployment"
    echo.
    echo 代码已提交！请推送到 GitHub：
    echo git push origin main
)
echo.
echo 部署文档：请查看 DEPLOYMENT.md 获取详细步骤
echo.
pause
goto menu

:netlify
echo.
echo ========================================
echo     Netlify 部署准备
echo ========================================
echo.
echo 检查 netlify.toml 配置文件...
if exist "netlify.toml" (
    echo ✓ netlify.toml 配置文件已存在
) else (
    echo ✗ netlify.toml 配置文件不存在
    echo 请确保项目中包含 netlify.toml 文件
)
echo.
echo Netlify 部署选项：
echo 1. 拖拽部署：将项目文件夹拖拽到 netlify.com
echo 2. Git 部署：连接 GitHub 仓库自动部署
echo 3. CLI 部署：使用 Netlify CLI 命令行部署
echo.
echo 推荐使用 Git 部署方式，支持自动更新
echo.
echo 部署文档：请查看 DEPLOYMENT.md 获取详细步骤
echo.
pause
goto menu

:vercel
echo.
echo ========================================
echo     Vercel 部署准备
echo ========================================
echo.
echo 检查 vercel.json 配置文件...
if exist "vercel.json" (
    echo ✓ vercel.json 配置文件已存在
) else (
    echo ✗ vercel.json 配置文件不存在
    echo 请确保项目中包含 vercel.json 文件
)
echo.
echo Vercel 部署选项：
echo 1. 网页部署：在 vercel.com 导入 GitHub 仓库
echo 2. CLI 部署：使用 Vercel CLI 命令行部署
echo.
echo 推荐使用网页部署方式，简单快捷
echo.
echo 部署文档：请查看 DEPLOYMENT.md 获取详细步骤
echo.
pause
goto menu

:preview
echo.
echo ========================================
echo     启动本地预览
echo ========================================
echo.
echo 正在启动本地服务器...
echo 预览地址：http://localhost:8000
echo 按 Ctrl+C 停止服务器
echo.
python -m http.server 8000
goto menu

:package
echo.
echo ========================================
echo     创建部署包
echo ========================================
echo.
echo 正在创建部署包...

:: 创建临时目录
if exist "deploy_package" rmdir /s /q "deploy_package"
mkdir "deploy_package"

:: 复制必要文件
copy "index.html" "deploy_package\" >nul
xcopy "css" "deploy_package\css\" /e /i /q >nul
xcopy "js" "deploy_package\js\" /e /i /q >nul
if exist "assets" xcopy "assets" "deploy_package\assets\" /e /i /q >nul
copy "README.md" "deploy_package\" >nul 2>nul
copy "netlify.toml" "deploy_package\" >nul 2>nul
copy "vercel.json" "deploy_package\" >nul 2>nul

echo ✓ 部署包已创建在 deploy_package 文件夹中
echo.
echo 包含文件：
dir "deploy_package" /b
echo.
echo 您可以将 deploy_package 文件夹的内容上传到任何静态托管平台
echo.
pause
goto menu

:exit
echo.
echo 感谢使用 To-Do List 部署助手！
echo 如有问题，请查看 DEPLOYMENT.md 文档
echo.
pause
exit /b 0