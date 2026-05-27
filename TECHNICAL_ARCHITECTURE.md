# 賞鳥探索冒險遊戲 - 技術架構文件

## 技術棧概覽

### 核心技術
- **語言**: TypeScript 5.0+
- **建構工具**: Vite 5.0+
- **渲染**: HTML5 Canvas API
- **音訊**: Web Audio API
- **儲存**: IndexedDB + LocalStorage
- **測試**: Vitest + Testing Library

### 開發工具
- **程式碼品質**: ESLint + Prettier
- **型別檢查**: TypeScript strict mode
- **版本控制**: Git
- **套件管理**: npm/pnpm

## 專案結構

詳細的專案結構請參考 `PROJECT_STRUCTURE.md`

## 核心架構設計

### 1. 遊戲引擎架構

採用 Entity-Component-System (ECS) 架構的簡化版本：

- **Engine**: 主遊戲循環管理
- **Scene**: 場景管理系統
- **GameObject**: 遊戲物件基類
- **Component**: 組件系統
- **EventSystem**: 事件驅動架構

### 2. 資料流架構

```
User Input → Input Manager → Event System → Game Systems → State Update → Render
```

### 3. 模組化設計

每個系統都是獨立的模組，透過事件系統進行通訊：

- **MapSystem**: 地圖探索
- **BirdSystem**: 鳥類行為
- **QuestSystem**: 任務管理
- **ProgressSystem**: 進度追蹤
- **AchievementSystem**: 成就系統

## 核心系統實作

### 遊戲引擎 (Engine)

主要職責：
- 管理遊戲循環 (60 FPS)
- 場景切換
- 資源管理
- 輸入處理

關鍵特性：
- 固定時間步長更新
- 可變渲染頻率
- 自動調整解析度

### 場景系統 (Scene)

場景類型：
- MainMenuScene: 主選單
- ExplorationScene: 探索場景
- PokedexScene: 圖鑑
- MiniGameScene: 小遊戲

場景生命週期：
1. onEnter(): 進入場景
2. update(): 更新邏輯
3. render(): 渲染畫面
4. onExit(): 離開場景

### 遊戲物件系統 (GameObject)

特性：
- 位置、旋轉、縮放變換
- 父子關係管理
- 組件系統
- 標籤系統

### 組件系統 (Component)

常用組件：
- SpriteComponent: 精靈渲染
- AnimationComponent: 動畫控制
- ColliderComponent: 碰撞檢測
- BehaviorComponent: 行為邏輯

### 事件系統 (EventSystem)

事件類型：
- 遊戲事件: bird:discovered, quest:completed
- 系統事件: scene:changed, player:levelUp
- UI 事件: button:clicked, modal:opened

## 資料模型設計

### 鳥類資料 (BirdData)

包含：
- 基本資訊（學名、俗名、科別）
- 物理特徵（大小、羽色、特徵）
- 識別資訊（難度、關鍵特徵）
- 行為特徵（棲息地、食性、鳴叫）
- 分布資訊（範圍、海拔、季節性）
- 媒體資源（圖片、聲音）
- 遊戲數據（點數、出現條件）

### 玩家資料 (PlayerData)

包含：
- 個人檔案
- 進度資訊（等級、經驗值）
- 技能數值（觀察、識別、攝影、記憶）
- 統計數據
- 物品清單
- 遊戲設定

### 任務資料 (QuestData)

任務類型：
- discovery: 發現任務
- photography: 攝影任務
- collection: 收集任務
- identification: 識別任務
- exploration: 探索任務

### 成就資料 (AchievementData)

成就類別：
- collection: 收集類
- skill: 技能類
- exploration: 探索類
- special: 特殊類

## 儲存系統

### LocalStorage
用途：遊戲設定、偏好設定
優點：快速存取、簡單易用
限制：容量約 5-10MB

### IndexedDB
用途：遊戲存檔、大量資料
優點：大容量、非同步操作
特性：支援匯出/匯入 JSON

### 存檔結構

```typescript
interface SaveData {
  version: string;
  timestamp: number;
  player: PlayerData;
  pokedex: PokedexData;
  quests: QuestData[];
  achievements: AchievementData[];
  settings: GameSettings;
}
```

## 效能優化

### 1. 物件池 (Object Pool)
- 減少記憶體分配
- 重複使用物件
- 適用於頻繁建立/銷毀的物件

### 2. 空間分割 (Spatial Partitioning)
- QuadTree 實作
- 優化碰撞檢測
- 減少不必要的計算

### 3. 資源管理
- 延遲載入 (Lazy Loading)
- 資源快取
- 預載重要資源

### 4. 渲染優化
- 離屏渲染 (Off-screen Canvas)
- 髒矩形更新
- 視錐剔除 (Frustum Culling)

## 建構與部署

### 開發環境
```bash
npm install
npm run dev
```

### 生產建構
```bash
npm run build
npm run preview
```

### 部署選項
- GitHub Pages
- Netlify
- Vercel
- 自架伺服器

## 測試策略

### 單元測試
- 測試個別函數和類別
- 使用 Vitest
- 覆蓋率目標：80%+

### 整合測試
- 測試系統間互動
- 測試資料流
- 測試事件處理

### 端對端測試
- 測試完整遊戲流程
- 測試使用者互動
- 測試存檔/讀檔

## 開發工作流程

### 1. 功能開發
- 建立功能分支
- 實作功能
- 撰寫測試
- 程式碼審查

### 2. 程式碼品質
- ESLint 檢查
- Prettier 格式化
- TypeScript 型別檢查
- 單元測試通過

### 3. 版本發布
- 更新版本號
- 撰寫更新日誌
- 建構生產版本
- 部署到伺服器

## 擴充性考量

### 模組化設計
- 每個系統獨立
- 透過介面通訊
- 易於新增功能

### 資料驅動
- 遊戲內容以 JSON 定義
- 易於新增鳥類、任務
- 支援多語言

### 插件系統
- 預留插件接口
- 支援第三方擴充
- 模組化載入

## 技術債務管理

### 已知限制
1. Canvas 渲染效能限制
2. 音訊同步問題
3. 移動裝置支援

### 改進計劃
1. 考慮使用 WebGL
2. 優化音訊系統
3. 響應式設計改進

## 安全性考量

### 資料安全
- 本地儲存加密
- 防止作弊機制
- 輸入驗證

### 隱私保護
- 不收集個人資料
- 本地儲存優先
- 透明的資料使用

## 相容性

### 瀏覽器支援
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 裝置支援
- 桌面電腦 (主要)
- 平板電腦 (支援)
- 手機 (未來支援)

## 參考資源

### 技術文件
- TypeScript: https://www.typescriptlang.org/
- Vite: https://vitejs.dev/
- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

### 遊戲開發
- Game Programming Patterns
- HTML5 Game Development
- TypeScript Game Development

---

更多詳細的程式碼範例和實作細節，請參考：
- `CODE_EXAMPLES.md` - 程式碼範例
- `API_REFERENCE.md` - API 參考文件
- `DEVELOPMENT_GUIDE.md` - 開發指南