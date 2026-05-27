# 🐦 Bird Watch - 台灣賞鳥探索冒險遊戲

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Development Status](https://img.shields.io/badge/Status-95%25%20Complete-brightgreen.svg)]()

[繁體中文](readme-tw.md) | English

一款基於神經科學研究的網頁賞鳥遊戲。探索多樣化的棲息地，觀察鳥類，完成任務，建立你的完整鳥類圖鑑！

## 📖 研究背景

本專案靈感來自以下研究論文：

**"The Tuned Cortex: Convergent Expertise-Related Structural and Functional Remodeling across the Adult Lifespan"**  
*Erik A. Wing, Jordan A. Chad, Geneva Mariotti, Jennifer D. Ryan and Asaf Gilboa*

該研究證明鳥類識別專業知識會導致大腦結構和功能的變化，特別是在額頂葉和後皮質區域。本遊戲旨在透過互動式遊戲玩法提供一個引人入勝的平台，以發展類似的專業知識。

## ✨ 功能特色

### 🎮 核心遊戲玩法
- **地圖探索系統**：在 5 個不同的棲息地區域間探索（森林、濕地、草原、山區、海岸）
- **鳥類觀察**：發現並識別 20 種台灣特有鳥類
- **拍照系統**：捕捉高品質的鳥類照片
- **任務系統**：完成 10+ 種多樣化的任務和挑戰
- **成就系統**：解鎖成就並獲得獎勵
- **圖鑑系統**：建立你的完整鳥類百科全書

### 🧠 認知訓練小遊戲
- **記憶配對遊戲**：訓練視覺記憶和模式識別（3 個難度等級）
- **鳥類識別測驗**：測試你的鳥類知識（5-15 題）
- **反應速度遊戲**：訓練注意力和反應時間
- **星級評分系統**：根據表現獲得 1-3 顆星

### 🎨 視覺與音效系統
- **粒子特效系統**：爆炸、閃光、煙霧、愛心、成就特效
- **動畫系統**：淡入淡出、縮放、彈跳、震動、脈衝、滑入、旋轉
- **音效系統**：UI 音效、遊戲事件音效、小遊戲音效
- **背景音樂**：支援淡入淡出轉場

### 🌍 遊戲系統
- **動態天氣**：晴天、多雲、雨天、霧天
- **時間循環**：黎明、早晨、下午、黃昏、夜晚
- **季節變化**：春、夏、秋、冬
- **棲息地區域**：森林、濕地、草原、山區、海岸
- **地圖傳送門**：在不同區域間快速移動
- **探索進度追蹤**：記錄每個區域的探索百分比

### ⚡ 效能優化
- **物件池系統**：重複使用遊戲物件，減少記憶體分配
- **效能監控器**：即時監控 FPS、幀時間、記憶體使用
- **效能 HUD**：開發模式下顯示詳細效能指標

## 🚀 快速開始

### 前置需求
- Node.js 18+ 
- npm 或 yarn

### 安裝

```bash
# 複製儲存庫
git clone https://github.com/yourusername/bird-watch.git
cd bird-watch

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

遊戲將在 `http://localhost:5173/` 可用

### 生產環境建置

```bash
# 建置專案
npm run build

# 預覽生產版本
npm run preview
```

## 🎯 遊戲控制

### 基本控制
- **方向鍵 / WASD**：移動玩家
- **滑鼠**：相機控制
- **左鍵點擊**：互動 / 選擇
- **右鍵點擊**：內容選單
- **空白鍵**：使用望遠鏡
- **C**：拍照
- **Tab**：開啟選單
- **M**：開啟地圖
- **P**：開啟圖鑑
- **Q**：開啟任務日誌
- **F**：切換全螢幕
- **Esc**：暫停 / 返回

### 進階控制
- **Shift + 方向鍵**：快速移動
- **Ctrl + 滑鼠滾輪**：縮放
- **Alt + 點擊**：快速傳送（地圖模式）

## 📊 專案結構

```
bird-watch/
├── public/                 # 靜態資源
│   ├── index.html         # 入口 HTML
│   └── images/            # 圖片資源
├── src/
│   ├── core/              # 遊戲引擎核心
│   │   ├── Engine.ts      # 主遊戲循環
│   │   ├── Scene.ts       # 場景管理
│   │   ├── GameObject.ts  # 遊戲物件
│   │   ├── Component.ts   # 組件系統
│   │   ├── Camera.ts      # 相機系統
│   │   ├── EventSystem.ts # 事件系統
│   │   ├── InputManager.ts # 輸入管理
│   │   └── GameState.ts   # 遊戲狀態
│   ├── systems/           # 遊戲系統
│   │   ├── QuestSystem.ts
│   │   ├── AchievementSystem.ts
│   │   ├── PokedexSystem.ts
│   │   ├── MapSystem.ts
│   │   ├── BirdSpawnSystem.ts
│   │   ├── ObservationSystem.ts
│   │   ├── PhotoSystem.ts
│   │   ├── AudioSystem.ts
│   │   └── MiniGameManager.ts
│   ├── models/            # 資料模型
│   │   ├── BirdData.ts
│   │   ├── PlayerData.ts
│   │   ├── QuestData.ts
│   │   ├── AchievementData.ts
│   │   └── HabitatData.ts
│   ├── components/        # 遊戲組件
│   │   ├── PlayerController.ts
│   │   ├── BirdSprite.ts
│   │   ├── MapRenderer.ts
│   │   ├── MapPortal.ts
│   │   ├── MapUI.ts
│   │   ├── PokedexUI.ts
│   │   ├── QuestUI.ts
│   │   ├── ObservationUI.ts
│   │   └── AchievementNotification.ts
│   ├── minigames/         # 認知訓練小遊戲
│   │   ├── MiniGameBase.ts
│   │   ├── MemoryMatchGame.ts
│   │   ├── BirdIdentificationGame.ts
│   │   └── ReactionSpeedGame.ts
│   ├── effects/           # 視覺特效
│   │   ├── ParticleSystem.ts
│   │   └── AnimationSystem.ts
│   ├── utils/             # 工具函數
│   │   ├── Vector2.ts
│   │   ├── ObjectPool.ts
│   │   └── PerformanceMonitor.ts
│   ├── data/              # 遊戲資料
│   │   ├── extendedBirds.ts  # 20 種台灣鳥類
│   │   ├── maps.ts           # 5 個地圖區域
│   │   └── initialQuests.ts  # 初始任務
│   ├── scenes/            # 遊戲場景
│   │   └── GameScene.ts
│   ├── types/             # TypeScript 類型
│   │   └── index.ts
│   └── main.ts            # 入口點
├── docs/                  # 文檔
│   ├── GAME_GUIDE.md      # 遊戲指南
│   ├── DEVELOPMENT_STATUS.md  # 開發狀態
│   ├── DEPLOYMENT.md      # 部署指南
│   └── BIRD_IMAGES_GUIDE.md  # 圖片整合指南
└── package.json
```

## 🛠️ 技術堆疊

- **語言**：TypeScript 5.3
- **建置工具**：Vite 5.4
- **遊戲引擎**：自訂 ECS（Entity-Component-System）架構
- **儲存**：LocalStorage + IndexedDB
- **音效**：Web Audio API
- **程式碼品質**：ESLint + Prettier

## 📈 開發進度

### 已完成功能（95%）

- ✅ **Phase 1**: 專案初始化與架構設計（100%）
- ✅ **Phase 2**: 核心資料模型（100%）
- ✅ **Phase 3**: 遊戲引擎核心系統（100%）
- ✅ **Phase 4**: 玩家控制與移動系統（100%）
- ✅ **Phase 5**: 鳥類資料與生成系統（100%）
- ✅ **Phase 6**: 鳥類觀察與識別機制（100%）
- ✅ **Phase 7**: 拍照功能（100%）
- ✅ **Phase 8**: 圖鑑解鎖系統（100%）
- ✅ **Phase 9**: UI 系統（100%）
- ✅ **Phase 10**: 任務系統（100%）
- ✅ **Phase 11**: 成就系統（100%）
- ✅ **Phase 12**: 多場景地圖系統（100%）
- ✅ **Phase 13**: 認知訓練小遊戲（100%）
- ✅ **Phase 14**: 音效系統（100%）
- ✅ **Phase 15**: 視覺特效與動畫（100%）
- ✅ **Phase 16**: 效能優化（100%）
- ✅ **Phase 17**: 完整文檔（100%）

### 待完成功能（5%）

- 🔄 **Phase 18**: 整合真實鳥類圖片（進行中）
- ⏳ **Phase 19**: 最終測試與除錯（待開始）

**整體進度**：95% 完成

## 🎨 遊戲設計

### 核心循環
```
探索 → 觀察 → 識別 → 記錄 → 進步 → 解鎖 → 探索
```

### 進度系統
- **經驗值**：透過發現和識別獲得 XP
- **技能發展**：提升觀察、識別、攝影和記憶技能
- **裝備升級**：更好的望遠鏡、相機和野外指南
- **棲息地解鎖**：隨著進度訪問新區域

### 鳥類稀有度系統
- **普通**：容易找到，基本獎勵
- **不常見**：中等挑戰，良好獎勵
- **稀有**：難以找到，優秀獎勵
- **史詩**：非常稀有，卓越獎勵
- **傳說**：極其稀有，非凡獎勵

## 🎮 遊戲特色

### 20 種台灣特有鳥類

1. 五色鳥 (Muller's Barbet)
2. 台灣藍鵲 (Taiwan Blue Magpie)
3. 黑枕藍鶲 (Black-naped Monarch)
4. 紅嘴黑鵯 (Black Bulbul)
5. 白頭翁 (Chinese Bulbul)
6. 綠繡眼 (Japanese White-eye)
7. 小彎嘴 (Taiwan Scimitar Babbler)
8. 大彎嘴 (Black-necklaced Scimitar Babbler)
9. 山紅頭 (Rufous-capped Babbler)
10. 繡眼畫眉 (Taiwan Yuhina)
11. 冠羽畫眉 (Taiwan Yuhina)
12. 白耳畫眉 (White-eared Sibia)
13. 紅頭山雀 (Black-throated Tit)
14. 青背山雀 (Green-backed Tit)
15. 棕面鶯 (Rufous-faced Warbler)
16. 黃山雀 (Yellow Tit)
17. 火冠戴菊鳥 (Flamecrest)
18. 台灣噪眉 (Taiwan Hwamei)
19. 小啄木 (Grey-capped Pygmy Woodpecker)
20. 大冠鷲 (Crested Serpent Eagle)

### 5 個探索區域

1. **森林區域**：茂密的樹林，適合觀察林鳥
2. **濕地區域**：水鳥的天堂
3. **草原區域**：開闊的視野，適合觀察猛禽
4. **山區區域**：高海拔鳥類的棲息地
5. **海岸區域**：海鳥和候鳥的聚集地

### 3 種認知訓練小遊戲

1. **記憶配對遊戲**
   - 訓練視覺記憶
   - 3 個難度等級（6/8/10 對）
   - 計時挑戰

2. **鳥類識別測驗**
   - 測試鳥類知識
   - 3 個難度等級（5/10/15 題）
   - 多選題格式

3. **反應速度遊戲**
   - 訓練注意力和反應
   - 移動目標
   - 計分系統

## 📚 文檔

- [遊戲指南](GAME_GUIDE.md) - 完整的遊戲玩法說明
- [開發狀態](DEVELOPMENT_STATUS.md) - 詳細的開發進度
- [部署指南](DEPLOYMENT.md) - 部署到各種平台的說明
- [圖片整合指南](BIRD_IMAGES_GUIDE.md) - 如何整合真實鳥類圖片

## 🤝 貢獻

歡迎貢獻！請在提交 Pull Request 之前閱讀我們的貢獻指南。

### 開發工作流程
1. Fork 儲存庫
2. 建立功能分支（`git checkout -b feature/amazing-feature`）
3. 提交你的變更（`git commit -m 'Add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 開啟 Pull Request

## 🧪 測試

```bash
# 執行單元測試
npm run test

# 執行整合測試
npm run test:integration

# 執行端對端測試
npm run test:e2e

# 生成覆蓋率報告
npm run test:coverage
```

## 📦 部署

詳細的部署說明請參閱 [DEPLOYMENT.md](DEPLOYMENT.md)

### 快速部署到 Vercel

```bash
npm install -g vercel
vercel
```

### 快速部署到 Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 🔧 效能優化

遊戲內建多項效能優化：

- **物件池系統**：重複使用遊戲物件
- **效能監控**：即時監控遊戲效能
- **程式碼分割**：按需載入資源
- **圖片優化**：使用 WebP 格式
- **快取策略**：智慧快取靜態資源

## 📝 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

- Erik A. Wing 等人的研究論文提供靈感
- [eBird Taiwan](https://ebird.org/taiwan) 提供台灣鳥類資料
- [台灣生物多樣性網絡](https://www.tbn.org.tw/) 提供生態資訊
- [Xeno-canto](https://www.xeno-canto.org/) 提供鳥類聲音錄音

## 📧 聯絡方式

- 專案連結：[https://github.com/yourusername/bird-watch](https://github.com/yourusername/bird-watch)
- 問題回報：[https://github.com/yourusername/bird-watch/issues](https://github.com/yourusername/bird-watch/issues)

## 🌟 Star History

如果你喜歡這個專案，請給我們一個 ⭐！

---

**開發者**：Bob  
**靈感來源**：神經科學研究  
**最後更新**：2026-05-27  
**版本**：1.0.0-beta  
**完成度**：95%

Made with ❤️ and 🧠