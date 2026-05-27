# 賞鳥探索冒險遊戲 - 快速開始指南

## 專案概述

這是一個基於神經科學研究的賞鳥探索網頁遊戲，使用 TypeScript 開發，結合認知訓練與娛樂性。

## 前置需求

### 必要工具
- **Node.js**: 18.0 或更高版本
- **npm** 或 **pnpm**: 最新版本
- **Git**: 用於版本控制
- **現代瀏覽器**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### 推薦工具
- **Visual Studio Code**: 推薦的程式碼編輯器
- **VSCode 擴充套件**:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - GitLens

## 快速開始

### 1. 複製專案

```bash
git clone https://github.com/your-username/bird-watch-game.git
cd bird-watch-game
```

### 2. 安裝依賴

使用 npm:
```bash
npm install
```

或使用 pnpm (推薦):
```bash
pnpm install
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

遊戲將在 `http://localhost:3000` 啟動

### 4. 開始開發

編輯 `src/main.ts` 或其他檔案，變更會自動重新載入。

## 專案結構

```
bird-watch-game/
├── src/                    # 原始碼
│   ├── core/              # 核心引擎
│   ├── systems/           # 遊戲系統
│   ├── models/            # 資料模型
│   ├── scenes/            # 遊戲場景
│   ├── components/        # UI 組件
│   ├── minigames/         # 小遊戲
│   ├── data/              # 遊戲資料
│   ├── assets/            # 素材資源
│   └── utils/             # 工具函數
├── public/                # 靜態資源
├── tests/                 # 測試檔案
└── docs/                  # 文件
```

## 開發指令

### 開發模式
```bash
npm run dev
```
啟動開發伺服器，支援熱重載

### 建構專案
```bash
npm run build
```
建構生產版本到 `dist/` 目錄

### 預覽建構結果
```bash
npm run preview
```
預覽建構後的生產版本

### 執行測試
```bash
npm run test
```
執行所有測試

### 測試覆蓋率
```bash
npm run test:coverage
```
產生測試覆蓋率報告

### 程式碼檢查
```bash
npm run lint
```
執行 ESLint 檢查

### 程式碼格式化
```bash
npm run format
```
使用 Prettier 格式化程式碼

### 型別檢查
```bash
npm run type-check
```
執行 TypeScript 型別檢查

## 開發工作流程

### 1. 建立新功能

```bash
# 建立功能分支
git checkout -b feature/your-feature-name

# 開發功能
# 編輯檔案...

# 執行測試
npm run test

# 檢查程式碼品質
npm run lint
npm run type-check

# 提交變更
git add .
git commit -m "feat: add your feature description"

# 推送到遠端
git push origin feature/your-feature-name
```

### 2. 修復 Bug

```bash
# 建立修復分支
git checkout -b fix/bug-description

# 修復 Bug
# 編輯檔案...

# 撰寫測試
# 編輯測試檔案...

# 執行測試確認修復
npm run test

# 提交變更
git add .
git commit -m "fix: bug description"

# 推送到遠端
git push origin fix/bug-description
```

### 3. 程式碼審查

- 建立 Pull Request
- 等待審查
- 根據回饋修改
- 合併到主分支

## 編碼規範

### TypeScript 風格

```typescript
// ✅ 好的做法
export class BirdSystem {
  private birds: Bird[] = [];
  
  public update(deltaTime: number): void {
    for (const bird of this.birds) {
      bird.update(deltaTime);
    }
  }
}

// ❌ 避免的做法
export class BirdSystem {
  birds: any;
  
  update(dt) {
    this.birds.forEach(b => b.update(dt));
  }
}
```

### 命名規範

- **類別**: PascalCase (例如: `BirdSystem`)
- **介面**: PascalCase (例如: `BirdData`)
- **函數**: camelCase (例如: `updateBird`)
- **變數**: camelCase (例如: `birdCount`)
- **常數**: UPPER_SNAKE_CASE (例如: `MAX_BIRDS`)
- **私有成員**: 前綴 `_` 或使用 `private` (例如: `private _birds`)

### 註解規範

```typescript
/**
 * 鳥類系統負責管理所有鳥類的生成、更新和銷毀
 */
export class BirdSystem {
  /**
   * 更新所有鳥類的狀態
   * @param deltaTime 距離上次更新的時間（秒）
   */
  public update(deltaTime: number): void {
    // 實作...
  }
}
```

## 常見問題

### Q: 如何新增一種新的鳥類？

A: 在 `src/data/birds/` 目錄下建立 JSON 檔案：

```json
{
  "id": "bird_001",
  "species": {
    "commonName": "麻雀",
    "scientificName": "Passer montanus"
  },
  "classification": {
    "type": "resident",
    "rarity": "common"
  }
  // ... 其他屬性
}
```

### Q: 如何建立新的場景？

A: 繼承 `Scene` 基類：

```typescript
import { Scene } from '@core/Scene';

export class MyScene extends Scene {
  public onEnter(): void {
    // 場景進入時的初始化
  }
  
  public onExit(): void {
    // 場景離開時的清理
  }
  
  public update(deltaTime: number): void {
    super.update(deltaTime);
    // 自訂更新邏輯
  }
}
```

### Q: 如何新增一個任務？

A: 在 `src/data/quests/` 目錄下建立 JSON 檔案：

```json
{
  "id": "quest_001",
  "title": "初次相遇",
  "description": "在公園發現並識別 5 種常見鳥類",
  "type": "discovery",
  "objectives": [
    {
      "type": "discover",
      "target": 5,
      "birdTypes": ["common"]
    }
  ],
  "rewards": {
    "experience": 100,
    "coins": 50
  }
}
```

### Q: 如何除錯遊戲？

A: 使用瀏覽器開發者工具：

1. 開啟開發者工具 (F12)
2. 在 Console 中查看日誌
3. 使用 Sources 面板設定中斷點
4. 使用 Performance 面板分析效能

### Q: 遊戲執行緩慢怎麼辦？

A: 檢查以下項目：

1. 開啟瀏覽器效能分析工具
2. 檢查是否有過多的物件建立
3. 確認是否正確使用物件池
4. 檢查渲染是否有不必要的重繪
5. 降低圖片解析度或使用壓縮

## 資源連結

### 專案文件
- [遊戲設計文件](./GAME_DESIGN.md)
- [技術架構文件](./TECHNICAL_ARCHITECTURE.md)
- [開發路線圖](./ROADMAP.md)
- [API 參考](./docs/API.md)

### 外部資源
- [TypeScript 官方文件](https://www.typescriptlang.org/)
- [Vite 官方文件](https://vitejs.dev/)
- [Canvas API 參考](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [eBird Taiwan](https://ebird.org/taiwan)

## 貢獻指南

我們歡迎任何形式的貢獻！請參考 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解詳情。

### 貢獻方式

1. **回報 Bug**: 在 Issues 中建立 Bug 報告
2. **建議功能**: 在 Issues 中提出功能建議
3. **提交程式碼**: 透過 Pull Request 貢獻程式碼
4. **改進文件**: 協助改善文件內容
5. **分享回饋**: 提供使用體驗回饋

## 授權

本專案採用 MIT 授權條款。詳見 [LICENSE](./LICENSE) 檔案。

## 聯絡方式

- **專案維護者**: [Your Name]
- **Email**: your.email@example.com
- **GitHub**: https://github.com/your-username/bird-watch-game
- **Issues**: https://github.com/your-username/bird-watch-game/issues

## 致謝

- 感謝 Wing, E. A. 等人的神經科學研究提供靈感
- 感謝 eBird Taiwan 提供鳥類資料
- 感謝所有貢獻者的付出

---

準備好開始你的賞鳥冒險了嗎？讓我們開始吧！🐦✨