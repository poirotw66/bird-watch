# 🐦 賞鳥探索冒險遊戲 (Bird Watch)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![開發狀態](https://img.shields.io/badge/狀態-開發中-yellow.svg)]()

繁體中文 | [English](readme.md)

一款基於神經科學研究的網頁賞鳥遊戲，探索多樣化的棲息地、觀察鳥類、完成任務，建立你的完整鳥類圖鑑！

## 📖 研究背景

本專案靈感來自以下研究論文：

**「調諧的大腦皮層：成年期專業知識相關的結構與功能重塑的匯聚」**  
*Erik A. Wing, Jordan A. Chad, Geneva Mariotti, Jennifer D. Ryan and Asaf Gilboa*

該研究證明，鳥類識別專業知識會導致大腦結構和功能的變化，特別是在額頂葉和後皮質區域。本遊戲旨在透過互動式遊戲玩法，提供一個培養類似專業知識的有趣平台。

## ✨ 遊戲特色

### 🎮 核心玩法
- **地圖探索**：在多樣化的棲息地中探索，體驗真實地形
- **鳥類觀察**：發現並識別各種鳥類物種
- **攝影系統**：捕捉高品質的鳥類照片
- **任務系統**：完成多樣化的任務與挑戰
- **成就系統**：解鎖成就並獲得獎勵
- **圖鑑系統**：建立你的完整鳥類百科全書

### 🧠 認知訓練
- **記憶挑戰**：記住鳥類的特徵和行為
- **模式識別**：透過視覺和聽覺線索識別鳥類
- **注意力訓練**：專注於特定的鳥類特徵
- **決策制定**：選擇最佳的觀察策略

### 🌍 遊戲系統
- **動態天氣**：晴天、多雲、雨天、霧天等天氣狀況
- **時間循環**：黎明、早晨、下午、黃昏、夜晚的時間變化
- **季節變化**：春、夏、秋、冬四季更替
- **棲息地區域**：森林、濕地、草原、山區、海岸等多樣環境

## 🚀 快速開始

### 系統需求
- Node.js 18+ 
- npm 或 yarn

### 安裝步驟

```bash
# 複製專案
git clone https://github.com/yourusername/bird-watch.git
cd bird-watch

# 安裝相依套件
npm install

# 啟動開發伺服器
npm run dev
```

遊戲將在 `http://localhost:3000/` 上運行

### 建置正式版本

```bash
# 建置專案
npm run build

# 預覽正式版本
npm run preview
```

## 🎯 遊戲操作

- **方向鍵 / WASD**：移動玩家
- **滑鼠**：控制相機
- **左鍵點擊**：互動 / 選擇
- **右鍵點擊**：開啟選單
- **空白鍵**：使用望遠鏡
- **C 鍵**：拍照
- **Tab 鍵**：開啟選單
- **M 鍵**：開啟地圖
- **P 鍵**：開啟圖鑑
- **Q 鍵**：開啟任務日誌

## 📊 專案結構

```
bird-watch/
├── public/              # 靜態資源
│   └── index.html      # 入口 HTML
├── src/
│   ├── core/           # 遊戲引擎核心
│   │   ├── Engine.ts   # 主遊戲迴圈
│   │   ├── Scene.ts    # 場景管理
│   │   ├── GameObject.ts
│   │   ├── Component.ts
│   │   ├── Camera.ts
│   │   ├── EventSystem.ts
│   │   └── GameState.ts
│   ├── systems/        # 遊戲系統
│   │   ├── QuestSystem.ts
│   │   ├── AchievementSystem.ts
│   │   ├── PokedexSystem.ts
│   │   ├── MapSystem.ts
│   │   └── BirdSpawnSystem.ts
│   ├── models/         # 資料模型
│   │   ├── BirdData.ts
│   │   ├── PlayerData.ts
│   │   ├── QuestData.ts
│   │   ├── AchievementData.ts
│   │   └── HabitatData.ts
│   ├── components/     # 遊戲元件
│   ├── scenes/         # 遊戲場景
│   ├── utils/          # 工具函式
│   ├── types/          # TypeScript 型別
│   └── main.ts         # 程式入口
├── docs/               # 文件
├── tests/              # 測試檔案
└── package.json
```

## 🛠️ 技術架構

- **程式語言**：TypeScript 5.3
- **建置工具**：Vite 5.4
- **遊戲引擎**：自製 ECS (Entity-Component-System)
- **資料儲存**：LocalStorage + IndexedDB
- **程式碼品質**：ESLint + Prettier

## 📈 開發進度

- ✅ 階段 1：專案初始化 (100%)
- ✅ 階段 2：核心資料模型 (100%)
- ✅ 階段 3：遊戲引擎核心 (100%)
- 🔄 階段 3：地圖探索系統 (70%)
- ⏳ 階段 4：觀察與識別系統 (0%)
- ✅ 階段 5：任務與成就系統 (100%)
- ⏳ 階段 6-15：開發中

**整體進度**：40% (6/15 階段)

## 🎨 遊戲設計

### 核心循環
```
探索 → 觀察 → 識別 → 記錄 → 進步 → 解鎖 → 探索
```

### 進度系統
- **經驗值**：透過發現和識別獲得經驗值
- **技能發展**：提升觀察、識別、攝影和記憶技能
- **裝備升級**：更好的望遠鏡、相機和野外指南
- **棲息地解鎖**：隨著進度解鎖新區域

### 鳥類稀有度系統
- **普通**：容易找到，基本獎勵
- **罕見**：中等挑戰，良好獎勵
- **稀有**：難以找到，豐厚獎勵
- **史詩**：非常稀有，優秀獎勵
- **傳說**：極度稀有，卓越獎勵

## 📚 相關文件

- [遊戲設計文件](GAME_DESIGN.md)
- [技術架構文件](TECHNICAL_ARCHITECTURE.md)
- [開發路線圖](ROADMAP.md)
- [入門指南](GETTING_STARTED.md)
- [API 文件](docs/API.md)

## 🤝 參與貢獻

歡迎貢獻！在提交 Pull Request 之前，請先閱讀我們的[貢獻指南](CONTRIBUTING.md)。

### 開發流程
1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的變更 (`git commit -m '新增某個很棒的功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 🧪 測試

```bash
# 執行單元測試
npm run test

# 執行整合測試
npm run test:integration

# 執行端對端測試
npm run test:e2e

# 產生測試覆蓋率報告
npm run test:coverage
```

## 📝 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

- Erik A. Wing 等人的研究論文提供靈感
- 台灣鳥類資料來自 [eBird Taiwan](https://ebird.org/taiwan)
- 鳥類圖片來自 [Macaulay Library](https://www.macaulaylibrary.org/)
- 聲音錄音來自 [Xeno-canto](https://www.xeno-canto.org/)

## 📧 聯絡方式

- 專案連結：[https://github.com/yourusername/bird-watch](https://github.com/yourusername/bird-watch)
- 問題回報：[https://github.com/yourusername/bird-watch/issues](https://github.com/yourusername/bird-watch/issues)

## 🌟 Star 歷史

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/bird-watch&type=Date)](https://star-history.com/#yourusername/bird-watch&Date)

---

用 ❤️ 製作 by Bob | 靈感來自神經科學研究