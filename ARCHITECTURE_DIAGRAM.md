# 賞鳥探索冒險遊戲 - 架構圖示

本文件使用 Mermaid 圖表展示專案的各種架構關係。

## 系統架構圖

```mermaid
graph TB
    subgraph 使用者層
        A[玩家]
    end
    
    subgraph 展示層
        B[HTML5 Canvas]
        C[UI 組件]
        D[音訊系統]
    end
    
    subgraph 遊戲邏輯層
        E[遊戲引擎]
        F[場景管理]
        G[事件系統]
    end
    
    subgraph 系統層
        H[地圖系統]
        I[鳥類系統]
        J[任務系統]
        K[成就系統]
        L[圖鑑系統]
    end
    
    subgraph 資料層
        M[玩家資料]
        N[鳥類資料]
        O[遊戲設定]
    end
    
    subgraph 儲存層
        P[LocalStorage]
        Q[IndexedDB]
    end
    
    A --> B
    A --> C
    B --> E
    C --> E
    D --> E
    E --> F
    E --> G
    F --> H
    F --> I
    F --> J
    F --> K
    F --> L
    H --> M
    I --> N
    J --> M
    K --> M
    L --> M
    M --> P
    M --> Q
    N --> Q
    O --> P
```

## 遊戲引擎架構

```mermaid
graph LR
    subgraph 核心引擎
        A[Engine] --> B[Scene Manager]
        A --> C[Input Manager]
        A --> D[Time Manager]
        A --> E[Event System]
    end
    
    subgraph 場景系統
        B --> F[Main Menu]
        B --> G[Exploration]
        B --> H[Pokedex]
        B --> I[Mini Games]
    end
    
    subgraph 遊戲物件
        G --> J[GameObject]
        J --> K[Component]
        K --> L[Sprite]
        K --> M[Behavior]
        K --> N[Collider]
    end
```

## 資料流程圖

```mermaid
flowchart TD
    A[使用者輸入] --> B{輸入類型}
    B -->|移動| C[更新玩家位置]
    B -->|觀察| D[啟動觀察模式]
    B -->|識別| E[開始識別挑戰]
    
    C --> F[更新相機]
    D --> G[顯示鳥類資訊]
    E --> H[記錄識別結果]
    
    F --> I[渲染場景]
    G --> I
    H --> J[更新圖鑑]
    J --> K[檢查任務進度]
    K --> L[檢查成就]
    L --> M[給予獎勵]
    M --> N[儲存進度]
```

## 鳥類系統流程

```mermaid
stateDiagram-v2
    [*] --> 生成鳥類
    生成鳥類 --> 閒置
    閒置 --> 飛行: 隨機觸發
    閒置 --> 覓食: 隨機觸發
    閒置 --> 鳴叫: 隨機觸發
    飛行 --> 閒置: 降落
    覓食 --> 閒置: 完成
    鳴叫 --> 閒置: 完成
    飛行 --> 離開場景: 飛出範圍
    離開場景 --> [*]
```

## 識別挑戰流程

```mermaid
flowchart TD
    A[發現鳥類] --> B[開始觀察]
    B --> C[記錄特徵]
    C --> D{是否使用提示}
    D -->|是| E[顯示提示]
    D -->|否| F[進入識別]
    E --> F
    F --> G[選擇答案]
    G --> H{答案正確?}
    H -->|是| I[獲得獎勵]
    H -->|否| J[顯示正確答案]
    I --> K[更新圖鑑]
    J --> K
    K --> L[記錄統計]
    L --> M[完成]
```

## 任務系統架構

```mermaid
graph TB
    subgraph 任務類型
        A[教學任務]
        B[主線任務]
        C[支線任務]
        D[每日任務]
    end
    
    subgraph 任務狀態
        E[鎖定]
        F[可接取]
        G[進行中]
        H[已完成]
    end
    
    subgraph 任務目標
        I[發現鳥類]
        J[拍攝照片]
        K[識別挑戰]
        L[探索區域]
    end
    
    A --> E
    B --> E
    C --> E
    D --> F
    E --> F
    F --> G
    G --> H
    G --> I
    G --> J
    G --> K
    G --> L
```

## 成就系統架構

```mermaid
graph LR
    subgraph 成就類別
        A[收集類]
        B[技能類]
        C[探索類]
        D[特殊類]
    end
    
    subgraph 稀有度
        E[銅牌]
        F[銀牌]
        G[金牌]
        H[白金]
    end
    
    subgraph 獎勵
        I[經驗值]
        J[稱號]
        K[解鎖內容]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    E --> I
    F --> I
    F --> J
    G --> J
    G --> K
    H --> K
```

## 認知訓練小遊戲架構

```mermaid
graph TD
    A[小遊戲選單] --> B[記憶配對]
    A --> C[找不同]
    A --> D[快速識別]
    A --> E[聲音配對]
    A --> F[視覺搜索]
    
    B --> G[計分系統]
    C --> G
    D --> G
    E --> G
    F --> G
    
    G --> H[難度調整]
    H --> I[獎勵發放]
    I --> J[技能提升]
```

## 儲存系統架構

```mermaid
graph TB
    subgraph 遊戲資料
        A[玩家資料]
        B[圖鑑資料]
        C[任務資料]
        D[成就資料]
    end
    
    subgraph 儲存管理
        E[Storage Manager]
    end
    
    subgraph 儲存方式
        F[LocalStorage]
        G[IndexedDB]
    end
    
    subgraph 功能
        H[自動儲存]
        I[手動儲存]
        J[匯出]
        K[匯入]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    E --> F
    E --> G
    E --> H
    E --> I
    E --> J
    E --> K
```

## 開發階段流程

```mermaid
gantt
    title 開發時程甘特圖
    dateFormat YYYY-MM-DD
    section Phase 1-2
    專案初始化           :2026-06-01, 7d
    核心引擎開發         :2026-06-08, 14d
    資料模型設計         :2026-06-22, 14d
    section Phase 3-4
    地圖探索系統         :2026-07-06, 21d
    鳥類系統             :2026-07-27, 14d
    觀察識別機制         :2026-08-10, 21d
    section Phase 5-6
    任務系統             :2026-08-31, 14d
    成就系統             :2026-09-14, 7d
    認知訓練遊戲         :2026-09-21, 14d
    section Phase 7-8
    UI/UX 設計           :2026-10-05, 21d
    內容製作             :2026-10-26, 28d
    section Phase 9-11
    測試優化             :2026-11-23, 21d
    文件撰寫             :2026-12-14, 7d
    發布準備             :2026-12-21, 7d
```

## 玩家進度系統

```mermaid
graph LR
    A[新手] --> B[初級觀鳥者]
    B --> C[中級觀鳥者]
    C --> D[高級觀鳥者]
    D --> E[專家]
    E --> F[大師]
    
    A -->|完成教學| B
    B -->|收集20種鳥類| C
    C -->|收集50種鳥類| D
    D -->|完成所有任務| E
    E -->|完成所有成就| F
```

## 技能提升系統

```mermaid
graph TD
    A[觀察技能] --> B[提升視野範圍]
    A --> C[提升穩定度]
    
    D[識別技能] --> E[減少選項數量]
    D --> F[增加提示次數]
    
    G[攝影技能] --> H[提升照片品質]
    G --> I[增加連拍次數]
    
    J[記憶技能] --> K[增加記憶時間]
    J --> L[提升準確率]
```

## 事件系統流程

```mermaid
sequenceDiagram
    participant P as 玩家
    participant I as Input Manager
    participant E as Event System
    participant S as Game System
    participant U as UI
    
    P->>I: 執行動作
    I->>E: 發送事件
    E->>S: 通知系統
    S->>S: 處理邏輯
    S->>E: 發送結果事件
    E->>U: 更新 UI
    U->>P: 顯示回饋
```

## 資源載入流程

```mermaid
flowchart TD
    A[開始遊戲] --> B[顯示載入畫面]
    B --> C[載入核心資源]
    C --> D[載入鳥類資料]
    D --> E[載入場景資源]
    E --> F[載入音訊資源]
    F --> G{載入完成?}
    G -->|是| H[進入主選單]
    G -->|否| I[顯示錯誤]
    I --> J[重試]
    J --> C
```

## 效能優化策略

```mermaid
mindmap
  root((效能優化))
    渲染優化
      離屏渲染
      視錐剔除
      髒矩形更新
      批次渲染
    記憶體優化
      物件池
      資源釋放
      垃圾回收
      記憶體監控
    載入優化
      延遲載入
      資源壓縮
      快取策略
      預載重要資源
    運算優化
      空間分割
      事件節流
      非同步處理
      Web Worker
```

## 測試策略

```mermaid
graph TB
    A[測試策略] --> B[單元測試]
    A --> C[整合測試]
    A --> D[端對端測試]
    
    B --> E[核心功能]
    B --> F[工具函數]
    B --> G[資料模型]
    
    C --> H[系統互動]
    C --> I[資料流程]
    C --> J[事件處理]
    
    D --> K[完整流程]
    D --> L[使用者場景]
    D --> M[跨瀏覽器]
```

---

這些圖表提供了專案各個層面的視覺化呈現，有助於理解系統架構和開發流程。