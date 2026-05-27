# 🚀 部署指南

本文檔說明如何將「台灣賞鳥遊戲」部署到各種環境。

## 📋 目錄

- [前置需求](#前置需求)
- [本地開發](#本地開發)
- [生產環境建置](#生產環境建置)
- [部署選項](#部署選項)
  - [Vercel 部署](#vercel-部署)
  - [Netlify 部署](#netlify-部署)
  - [GitHub Pages 部署](#github-pages-部署)
  - [自架伺服器部署](#自架伺服器部署)
- [環境變數設定](#環境變數設定)
- [效能優化](#效能優化)
- [故障排除](#故障排除)

## 前置需求

- Node.js 18.x 或更高版本
- npm 或 yarn 套件管理器
- Git（用於版本控制）

## 本地開發

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

開發伺服器將在 `http://localhost:5173` 啟動。

### 3. 開發模式功能

開發模式下會啟用以下功能：

- 熱模組替換（HMR）
- 效能監控 HUD
- 詳細的控制台日誌
- Source Maps

## 生產環境建置

### 1. 建置專案

```bash
npm run build
```

這會在 `dist/` 目錄中生成優化後的生產版本。

### 2. 預覽生產版本

```bash
npm run preview
```

在本地預覽生產版本，確保一切正常運作。

### 3. 建置輸出

建置後的檔案結構：

```
dist/
├── index.html          # 主 HTML 檔案
├── assets/            # 靜態資源
│   ├── index-[hash].js    # 主要 JavaScript 檔案
│   ├── index-[hash].css   # 樣式檔案
│   └── ...                # 其他資源
└── ...
```

## 部署選項

### Vercel 部署

Vercel 是最簡單的部署選項，提供自動化 CI/CD。

#### 方法 1：透過 Vercel CLI

1. 安裝 Vercel CLI：

```bash
npm install -g vercel
```

2. 登入 Vercel：

```bash
vercel login
```

3. 部署：

```bash
vercel
```

4. 生產部署：

```bash
vercel --prod
```

#### 方法 2：透過 GitHub 整合

1. 將專案推送到 GitHub
2. 前往 [Vercel](https://vercel.com)
3. 點擊「Import Project」
4. 選擇你的 GitHub 儲存庫
5. Vercel 會自動偵測 Vite 專案並設定建置命令
6. 點擊「Deploy」

#### Vercel 設定

在 `vercel.json` 中（如果需要自訂設定）：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### Netlify 部署

#### 方法 1：透過 Netlify CLI

1. 安裝 Netlify CLI：

```bash
npm install -g netlify-cli
```

2. 登入 Netlify：

```bash
netlify login
```

3. 初始化專案：

```bash
netlify init
```

4. 部署：

```bash
netlify deploy --prod
```

#### 方法 2：透過 Git 整合

1. 將專案推送到 GitHub/GitLab/Bitbucket
2. 前往 [Netlify](https://netlify.com)
3. 點擊「New site from Git」
4. 選擇你的儲存庫
5. 設定建置命令：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 點擊「Deploy site」

#### Netlify 設定

在 `netlify.toml` 中：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### GitHub Pages 部署

#### 1. 設定 vite.config.ts

更新 `vite.config.ts` 以設定正確的 base path：

```typescript
export default defineConfig({
  base: '/bird-watch/', // 替換為你的儲存庫名稱
  // ... 其他設定
});
```

#### 2. 建立部署腳本

在 `package.json` 中新增：

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

#### 3. 安裝 gh-pages

```bash
npm install --save-dev gh-pages
```

#### 4. 部署

```bash
npm run deploy
```

#### 5. 啟用 GitHub Pages

1. 前往 GitHub 儲存庫設定
2. 找到「Pages」區段
3. 選擇 `gh-pages` 分支
4. 儲存設定

### 自架伺服器部署

#### 使用 Nginx

1. 建置專案：

```bash
npm run build
```

2. 將 `dist/` 目錄複製到伺服器

3. Nginx 設定範例（`/etc/nginx/sites-available/bird-watch`）：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/bird-watch/dist;
    index index.html;

    # Gzip 壓縮
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 快取靜態資源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由支援
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全標頭
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

4. 啟用站點並重新載入 Nginx：

```bash
sudo ln -s /etc/nginx/sites-available/bird-watch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 使用 Apache

Apache 設定範例（`.htaccess`）：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# 啟用 Gzip 壓縮
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# 快取設定
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

## 環境變數設定

### 開發環境

建立 `.env.development`：

```env
VITE_APP_TITLE=台灣賞鳥遊戲（開發）
VITE_API_URL=http://localhost:3000
VITE_ENABLE_DEBUG=true
```

### 生產環境

建立 `.env.production`：

```env
VITE_APP_TITLE=台灣賞鳥遊戲
VITE_API_URL=https://api.your-domain.com
VITE_ENABLE_DEBUG=false
```

### 在程式碼中使用

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const isDebug = import.meta.env.VITE_ENABLE_DEBUG === 'true';
```

## 效能優化

### 1. 程式碼分割

Vite 自動進行程式碼分割，但你可以手動優化：

```typescript
// 動態匯入
const MiniGame = () => import('./minigames/MemoryMatchGame');
```

### 2. 資源優化

- 壓縮圖片（使用 WebP 格式）
- 使用 SVG 圖示
- 延遲載入非關鍵資源

### 3. 快取策略

在 `vite.config.ts` 中設定：

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['phaser'],
          utils: ['./src/utils/Vector2', './src/utils/ObjectPool'],
        },
      },
    },
  },
});
```

### 4. 啟用 Gzip/Brotli 壓縮

安裝壓縮外掛：

```bash
npm install --save-dev vite-plugin-compression
```

更新 `vite.config.ts`：

```typescript
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
});
```

## 故障排除

### 問題 1：白屏或載入失敗

**解決方案：**

1. 檢查瀏覽器控制台錯誤
2. 確認 `base` 路徑設定正確
3. 檢查資源路徑是否正確

### 問題 2：路由不工作（404 錯誤）

**解決方案：**

確保伺服器設定了 SPA 回退（fallback）到 `index.html`。

### 問題 3：效能問題

**解決方案：**

1. 啟用效能監控 HUD（開發模式）
2. 檢查物件池使用情況
3. 減少同時顯示的鳥類數量
4. 優化圖片大小

### 問題 4：記憶體洩漏

**解決方案：**

1. 確保正確清理事件監聽器
2. 使用物件池重複使用物件
3. 定期清理未使用的資源

### 問題 5：建置失敗

**解決方案：**

1. 清除快取：`rm -rf node_modules dist && npm install`
2. 檢查 TypeScript 錯誤：`npm run type-check`
3. 更新依賴：`npm update`

## 監控與分析

### 1. 效能監控

遊戲內建效能監控系統，在開發模式下自動啟用。

### 2. 錯誤追蹤

建議整合錯誤追蹤服務（如 Sentry）：

```bash
npm install @sentry/browser
```

```typescript
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: import.meta.env.MODE,
});
```

### 3. 分析工具

使用 Vite 的建置分析：

```bash
npm run build -- --mode analyze
```

## 安全性考量

1. **HTTPS**：始終在生產環境使用 HTTPS
2. **CSP**：設定內容安全政策標頭
3. **CORS**：正確設定跨域資源共享
4. **環境變數**：不要在前端暴露敏感資訊

## 持續整合/持續部署（CI/CD）

### GitHub Actions 範例

建立 `.github/workflows/deploy.yml`：

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 備份與還原

### 備份遊戲資料

玩家資料儲存在 localStorage 中，可以匯出：

```typescript
const gameData = localStorage.getItem('bird-watch-save');
// 儲存到檔案或雲端
```

### 還原遊戲資料

```typescript
localStorage.setItem('bird-watch-save', gameData);
```

## 版本管理

使用語意化版本（Semantic Versioning）：

- MAJOR：不相容的 API 變更
- MINOR：向後相容的功能新增
- PATCH：向後相容的問題修正

更新 `package.json` 中的版本號：

```json
{
  "version": "1.0.0"
}
```

## 支援與維護

- 定期更新依賴套件
- 監控效能指標
- 收集使用者回饋
- 修復已知問題

## 相關資源

- [Vite 文檔](https://vitejs.dev/)
- [TypeScript 文檔](https://www.typescriptlang.org/)
- [Vercel 文檔](https://vercel.com/docs)
- [Netlify 文檔](https://docs.netlify.com/)

---

**最後更新：** 2026-05-27

**維護者：** Bob

如有問題或建議，請開啟 Issue 或 Pull Request。