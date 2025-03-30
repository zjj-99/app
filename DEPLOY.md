# 飞机大战游戏部署指南

本文档提供将飞机大战游戏部署为可安装PWA的步骤。

## 准备工作

在部署之前，请确保：

1. 已生成游戏图标
   - 打开`generate-icons.html`文件
   - 下载两个尺寸的图标(192x192和512x512)
   - 将图标放入`img`文件夹，命名为`icon-192.png`和`icon-512.png`

2. 已测试游戏在本地正常运行

## 部署选项

### 选项1：GitHub Pages（免费）

1. 创建GitHub账号（如果没有）
2. 创建新仓库，例如`airplane-war`
3. 上传所有游戏文件到仓库
4. 前往仓库设置 -> Pages -> 选择main分支 -> 点击保存
5. 等待几分钟，GitHub Pages会自动部署网站
6. 访问`https://[你的用户名].github.io/airplane-war`
7. 生成安装二维码并分享给用户

### 选项2：Netlify（免费）

1. 创建Netlify账号
2. 点击"New site from Git"
3. 选择GitHub并授权
4. 选择你的游戏仓库
5. 点击"Deploy site"
6. 几分钟后，网站将部署完成
7. 可以选择自定义域名
8. 生成安装二维码并分享给用户

### 选项3：Vercel（免费）

1. 创建Vercel账号
2. 导入项目
3. 选择游戏仓库
4. 点击"Deploy"
5. 生成安装二维码并分享给用户

## 生成安装二维码

部署完成后，可以生成安装二维码以便用户快速安装：

1. 访问已部署的游戏网站
2. 点击"分享游戏"按钮
3. 在新页面中输入游戏的完整URL（例如：`https://yourusername.github.io/airplane-war`）
4. 点击"生成二维码"按钮
5. 下载生成的二维码图片
6. 通过社交媒体、即时通讯软件等方式分享二维码

用户扫描二维码后，将直接打开游戏，并可以将其安装到主屏幕。

## 注意事项

### 1. 关于Service Worker路径

如果网站不是部署在根目录，请修改以下文件：

1. `service-worker.js` - 更新缓存资源路径
   ```javascript
   const ASSETS = [
     '/your-path/',
     '/your-path/index.html',
     // ...其他文件
   ];
   ```

2. `index.html` - 更新Service Worker注册路径
   ```javascript
   navigator.serviceWorker.register('/your-path/service-worker.js')
   ```

### 2. HTTPS要求

PWA要求网站通过HTTPS提供服务。GitHub Pages、Netlify和Vercel默认提供HTTPS。

### 3. 测试安装

部署完成后：
1. 在手机Chrome或Safari浏览器中访问网站
2. 确认"添加到主屏幕"选项可用
3. 安装应用并测试离线功能
4. 测试二维码扫描安装功能

## 故障排除

如果PWA安装选项未显示：

1. 确认网站使用HTTPS
2. 检查浏览器控制台是否有错误
3. 验证`manifest.json`文件是否正确
4. 确认Service Worker是否正确注册

如果二维码无法正常工作：

1. 确认URL是否完整且正确
2. 确认网站可以正常访问
3. 检查二维码图片是否清晰可辨

## 更新应用

要更新已部署的应用：

1. 修改Service Worker的缓存名称（如：'airplane-war-v2'）
2. 重新部署网站
3. 用户下次访问网站时将自动更新
4. 如有必要，重新生成安装二维码 