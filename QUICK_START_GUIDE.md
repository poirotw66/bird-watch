# 🚀 快速入門指南

本指南將協助您完成專案的最後步驟，讓遊戲可以正式運行。

## 📋 待完成工作清單

- [ ] 1. 下載鳥類圖片
- [ ] 2. 優化圖片
- [ ] 3. 更新鳥類資料
- [ ] 4. 測試遊戲

---

## 步驟 1：下載鳥類圖片 🖼️

### 方法 A：使用提供的下載清單（推薦）

1. **開啟下載清單**
   ```bash
   open BIRD_IMAGES_DOWNLOAD_LIST.md
   # 或在編輯器中開啟該檔案
   ```

2. **逐一下載圖片**
   - 清單中列出了 20 種鳥類
   - 每種鳥類提供 4 個圖片來源
   - 建議優先使用 Wikimedia Commons（CC BY/CC BY-SA 授權）

3. **圖片要求**
   - 格式：PNG 或 JPG
   - 尺寸：至少 512x512 像素
   - 品質：清晰、對焦準確
   - 背景：最好是純色或可去背

4. **命名規則**
   下載後請按照以下格式命名：
   ```
   mullers-barbet.png          # 五色鳥
   taiwan-blue-magpie.png      # 台灣藍鵲
   black-naped-monarch.png     # 黑枕藍鶲
   ... 等等
   ```

5. **放置位置**
   將所有圖片放入：
   ```
   public/images/birds/original/
   ```

### 方法 B：使用範例圖片（快速測試）

如果您想先測試遊戲，可以暫時使用佔位圖片：

```bash
# 建立測試圖片腳本
cat > scripts/create-placeholder-images.cjs << 'EOF'
const fs = require('fs');
const path = require('path');

const birds = [
  'mullers-barbet', 'taiwan-blue-magpie', 'black-naped-monarch',
  'black-bulbul', 'chinese-bulbul', 'japanese-white-eye',
  'taiwan-scimitar-babbler', 'black-necklaced-scimitar-babbler',
  'rufous-capped-babbler', 'taiwan-yuhina', 'white-eared-sibia',
  'black-throated-tit', 'green-backed-tit', 'rufous-faced-warbler',
  'yellow-tit', 'flamecrest', 'taiwan-hwamei',
  'grey-capped-pygmy-woodpecker', 'crested-serpent-eagle',
  'collared-bush-robin'
];

const dir = 'public/images/birds/original';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// 建立簡單的 SVG 佔位圖
birds.forEach(bird => {
  const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#4CAF50"/>
    <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="24" font-family="Arial">
      ${bird}
    </text>
  </svg>`;
  
  fs.writeFileSync(path.join(dir, `${bird}.svg`), svg);
  console.log(`✓ 建立 ${bird}.svg`);
});

console.log('\n✨ 完成！建立了 20 個佔位圖片');
EOF

# 執行腳本
node scripts/create-placeholder-images.cjs
```

---

## 步驟 2：優化圖片 ⚡

下載完圖片後，執行優化腳本：

```bash
# 1. 安裝 sharp（如果尚未安裝）
npm install sharp

# 2. 執行優化腳本
node scripts/optimize-images.cjs
```

**腳本會自動：**
- 讀取 `public/images/birds/original/` 中的所有圖片
- 生成三種尺寸：
  - large (512x512) - 用於詳細檢視
  - medium (256x256) - 用於遊戲中顯示
  - thumbnail (128x128) - 用於圖鑑縮圖
- 轉換為 WebP 格式（更好的壓縮比）
- 生成 `manifest.json` 圖片清單
- 生成 `UPDATE_BIRD_DATA.txt` 更新說明

**預期輸出：**
```
🖼️  鳥類圖片優化工具
============================================================

找到 20 張圖片

處理: mullers-barbet.png
────────────────────────────────────────────────────────────
  原始尺寸: 1024x1024
  格式: png
  大小: 245.67 KB
  ✓ large (512x512): 89.23 KB
  ✓ medium (256x256): 34.56 KB
  ✓ thumbnail (128x128): 12.34 KB
  ✅ 完成

... (其他 19 張圖片)

============================================================
📊 優化報告
============================================================
總計: 20 張圖片
成功: 20 張
失敗: 0 張

large 目錄總大小: 1.75 MB
medium 目錄總大小: 0.68 MB
thumbnail 目錄總大小: 0.24 MB

✨ 優化完成！
```

---

## 步驟 3：更新鳥類資料 📝

### 自動更新（推薦）

優化腳本會生成 `UPDATE_BIRD_DATA.txt`，其中包含所有圖片路徑。

### 手動更新

開啟 `src/data/extendedBirds.ts`，為每個鳥類加入 `sprite` 設定：

```typescript
{
  id: 'mullers-barbet',
  // ... 其他資料
  gameData: {
    // ... 其他遊戲資料
    sprite: {
      idle: '/images/birds/medium/mullers-barbet.webp',
      flying: '/images/birds/medium/mullers-barbet.webp',
      thumbnail: '/images/birds/thumbnail/mullers-barbet.webp',
      large: '/images/birds/large/mullers-barbet.webp',
    },
  },
}
```

**快速更新腳本：**

```bash
# 建立更新腳本
cat > scripts/update-bird-data.cjs << 'EOF'
const fs = require('fs');

const birds = [
  'mullers-barbet', 'taiwan-blue-magpie', 'black-naped-monarch',
  'black-bulbul', 'chinese-bulbul', 'japanese-white-eye',
  'taiwan-scimitar-babbler', 'black-necklaced-scimitar-babbler',
  'rufous-capped-babbler', 'taiwan-yuhina', 'white-eared-sibia',
  'black-throated-tit', 'green-backed-tit', 'rufous-faced-warbler',
  'yellow-tit', 'flamecrest', 'taiwan-hwamei',
  'grey-capped-pygmy-woodpecker', 'crested-serpent-eagle',
  'collared-bush-robin'
];

console.log('為每個鳥類加入以下 sprite 設定：\n');

birds.forEach(bird => {
  console.log(`    sprite: {
      idle: '/images/birds/medium/${bird}.webp',
      flying: '/images/birds/medium/${bird}.webp',
      thumbnail: '/images/birds/thumbnail/${bird}.webp',
      large: '/images/birds/large/${bird}.webp',
    },\n`);
});
EOF

node scripts/update-bird-data.cjs
```

---

## 步驟 4：測試遊戲 🎮

### 啟動開發伺服器

```bash
npm run dev
```

遊戲將在 `http://localhost:5173` 啟動

### 測試檢查清單

#### 基本功能
- [ ] 遊戲正常載入
- [ ] 玩家可以移動（WASD 或方向鍵）
- [ ] 相機跟隨玩家
- [ ] UI 正常顯示

#### 鳥類系統
- [ ] 鳥類圖片正確顯示
- [ ] 可以觀察鳥類（空白鍵）
- [ ] 可以拍照（C 鍵）
- [ ] 圖鑑正常解鎖（P 鍵開啟）

#### 地圖系統
- [ ] 可以開啟地圖（M 鍵）
- [ ] 小地圖正常顯示
- [ ] 可以使用傳送門切換區域
- [ ] 探索進度正常追蹤

#### 任務與成就
- [ ] 任務列表正常顯示（Q 鍵）
- [ ] 任務進度正常更新
- [ ] 成就通知正常彈出
- [ ] 經驗值和等級正常增加

#### 小遊戲
- [ ] 記憶配對遊戲可以玩
- [ ] 鳥類識別測驗可以玩
- [ ] 反應速度遊戲可以玩
- [ ] 星級評分正常顯示

#### 音效與特效
- [ ] 背景音樂播放
- [ ] UI 音效正常
- [ ] 粒子特效正常顯示
- [ ] 動畫流暢

#### 效能
- [ ] FPS 穩定在 60
- [ ] 沒有明顯卡頓
- [ ] 記憶體使用正常
- [ ] 效能 HUD 顯示正常（開發模式）

### 常見問題排除

#### 問題 1：圖片無法顯示
**解決方案：**
- 檢查圖片路徑是否正確
- 確認檔案名稱大小寫
- 檢查 `public/images/birds/` 目錄結構
- 重新啟動開發伺服器

#### 問題 2：遊戲載入緩慢
**解決方案：**
- 確認圖片已優化為 WebP 格式
- 檢查圖片檔案大小
- 使用瀏覽器開發者工具檢查網路請求

#### 問題 3：TypeScript 錯誤
**解決方案：**
```bash
# 檢查類型錯誤
npm run type-check

# 清除快取並重新安裝
rm -rf node_modules dist
npm install
```

---

## 🎉 完成後的下一步

### 1. 生產建置
```bash
npm run build
npm run preview
```

### 2. 部署
參考 `DEPLOYMENT.md` 選擇部署平台：
- Vercel（推薦）
- Netlify
- GitHub Pages
- 自架伺服器

### 3. 分享
- 將專案推送到 GitHub
- 撰寫部落格文章
- 分享給朋友測試

---

## 📚 相關文檔

- **README.md** - 專案概述
- **GAME_GUIDE.md** - 遊戲玩法
- **BIRD_IMAGES_GUIDE.md** - 圖片整合詳細指南
- **BIRD_IMAGES_DOWNLOAD_LIST.md** - 圖片下載清單
- **DEPLOYMENT.md** - 部署指南

---

## 💡 提示

### 快速測試流程
如果您想快速測試遊戲而不下載真實圖片：

```bash
# 1. 建立佔位圖片
node scripts/create-placeholder-images.cjs

# 2. 優化圖片
node scripts/optimize-images.cjs

# 3. 啟動遊戲
npm run dev
```

### 效能監控
開發模式下按 `F12` 開啟瀏覽器開發者工具：
- Console：查看日誌
- Network：檢查資源載入
- Performance：分析效能

遊戲左上角會顯示效能 HUD：
- FPS
- 幀時間
- 記憶體使用
- 物件數量

---

## ✅ 完成確認

當您完成所有步驟後，應該能夠：

✅ 看到 20 種鳥類的真實圖片  
✅ 流暢地探索 5 個地圖區域  
✅ 完成任務並解鎖成就  
✅ 玩 3 種認知訓練小遊戲  
✅ 聽到背景音樂和音效  
✅ 看到粒子特效和動畫  
✅ FPS 穩定在 60  

**恭喜！您的台灣賞鳥遊戲已經完成！** 🎉

---

**需要協助？**
- 查看文檔：`docs/` 目錄
- 檢查問題：GitHub Issues
- 聯絡開發者：Bob

**祝您遊戲愉快！** 🐦