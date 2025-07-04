# 部署指南

本文档介绍如何将 To-Do List 应用免费部署到公网上。

## 🌐 免费托管平台推荐

### 1. GitHub Pages（推荐）
**优势**: 完全免费、稳定可靠、与 GitHub 深度集成
**限制**: 仅支持静态网站
**访问速度**: 国外较快，国内一般

#### 部署步骤：
1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择部署分支（通常是 main 或 gh-pages）
4. 访问 `https://用户名.github.io/仓库名`

### 2. Netlify
**优势**: 部署简单、功能强大、支持自动部署
**限制**: 免费版有带宽限制（100GB/月）
**访问速度**: 全球 CDN，速度较快

#### 部署步骤：
1. 注册 Netlify 账号
2. 连接 GitHub 仓库或直接拖拽文件夹
3. 自动部署完成
4. 获得 `.netlify.app` 域名

### 3. Vercel
**优势**: 部署极快、零配置、优秀的开发体验
**限制**: 免费版有使用限制
**访问速度**: 全球 CDN，国内访问良好

#### 部署步骤：
1. 注册 Vercel 账号
2. 导入 GitHub 仓库
3. 一键部署
4. 获得 `.vercel.app` 域名

### 4. Firebase Hosting
**优势**: Google 提供、免费额度充足、全球 CDN
**限制**: 需要 Google 账号
**访问速度**: 全球较快

### 5. Surge.sh
**优势**: 命令行部署、简单快速
**限制**: 功能相对简单
**访问速度**: 一般

## 📋 部署前准备

### 检查文件结构
确保项目根目录包含以下文件：
```
todolist/
├── index.html          # 入口文件
├── css/
│   └── style.css
├── js/
│   └── app.js
├── assets/             # 资源文件（如有）
├── README.md
└── DEPLOYMENT.md       # 本文件
```

### 验证本地运行
在部署前，确保应用在本地正常运行：
```bash
# 启动本地服务器
python -m http.server 8000
# 或使用 Node.js
npx serve .
```

## 🚀 快速部署指南

### 方案一：GitHub Pages（最推荐）

1. **创建 GitHub 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: To-Do List App"
   git branch -M main
   git remote add origin https://github.com/用户名/todolist.git
   git push -u origin main
   ```

2. **启用 GitHub Pages**
   - 进入仓库设置页面
   - 找到 "Pages" 选项
   - 选择 "Deploy from a branch"
   - 选择 "main" 分支和 "/ (root)" 文件夹
   - 点击 "Save"

3. **访问应用**
   - 等待几分钟部署完成
   - 访问 `https://用户名.github.io/todolist`

### 方案二：Netlify 拖拽部署

1. **准备部署文件**
   - 将整个项目文件夹压缩为 ZIP
   - 或直接准备项目文件夹

2. **部署到 Netlify**
   - 访问 [netlify.com](https://netlify.com)
   - 注册/登录账号
   - 将项目文件夹拖拽到部署区域
   - 等待部署完成

3. **获取访问链接**
   - 部署完成后获得随机域名
   - 可在设置中自定义域名前缀

### 方案三：Vercel 一键部署

1. **连接 GitHub**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录
   - 导入 todolist 仓库

2. **配置部署**
   - 保持默认设置
   - 点击 "Deploy"
   - 等待部署完成

3. **访问应用**
   - 获得 `.vercel.app` 域名
   - 支持自动部署更新

## ⚙️ 部署配置文件

### Netlify 配置（netlify.toml）
```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Vercel 配置（vercel.json）
```json
{
  "version": 2,
  "name": "todolist",
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 🔧 部署优化建议

### 1. 性能优化
- **压缩资源**: 使用工具压缩 CSS 和 JS 文件
- **图片优化**: 使用 WebP 格式，压缩图片大小
- **缓存策略**: 设置适当的缓存头

### 2. SEO 优化
```html
<!-- 在 index.html 的 <head> 中添加 -->
<meta name="description" content="简洁高效的待办事项管理应用">
<meta name="keywords" content="todo, 待办事项, 任务管理, 效率工具">
<meta property="og:title" content="To-Do List - 待办事项管理">
<meta property="og:description" content="简洁高效的待办事项管理应用">
<meta property="og:type" content="website">
```

### 3. 安全配置
- 设置适当的 HTTP 安全头
- 启用 HTTPS（大多数平台默认支持）
- 配置 CSP（内容安全策略）

## 🌍 自定义域名

大多数免费托管平台都支持绑定自定义域名：

### GitHub Pages
1. 在仓库根目录创建 `CNAME` 文件
2. 文件内容为你的域名（如：`todolist.yourdomain.com`）
3. 在域名 DNS 设置中添加 CNAME 记录

### Netlify/Vercel
1. 在平台设置中添加自定义域名
2. 按照提示配置 DNS 记录
3. 等待 SSL 证书自动配置

## 📊 监控和分析

### 添加 Google Analytics
```html
<!-- 在 index.html 的 <head> 中添加 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔄 持续部署

设置自动部署，当代码更新时自动重新部署：

1. **GitHub Actions**（适用于 GitHub Pages）
2. **Netlify/Vercel 自动部署**（连接 GitHub 仓库）
3. **Webhook 触发**（高级用法）

## 💡 部署建议

### 选择建议
- **个人项目**: GitHub Pages（免费、稳定）
- **快速原型**: Netlify（部署简单）
- **商业项目**: Vercel（性能优秀）
- **国内用户**: 考虑国内平台（如码云 Pages）

### 注意事项
1. **备份数据**: 定期备份项目代码
2. **版本管理**: 使用 Git 进行版本控制
3. **测试部署**: 部署前在本地充分测试
4. **监控性能**: 定期检查网站性能和可用性

## 🆘 常见问题

### Q: 部署后页面空白？
A: 检查浏览器控制台错误，通常是路径问题或 CORS 问题。

### Q: 样式没有加载？
A: 确认 CSS 文件路径正确，检查大小写敏感问题。

### Q: 功能在本地正常，部署后异常？
A: 检查是否使用了本地特有的 API，确认所有资源都已上传。

### Q: 如何更新已部署的应用？
A: 推送新代码到 GitHub，或重新上传文件到托管平台。

---

选择最适合你的部署方案，开始将你的 To-Do List 应用分享给全世界吧！ 🚀