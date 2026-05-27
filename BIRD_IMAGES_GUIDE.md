# 🖼️ 鳥類圖片資源整合指南

本文檔說明如何為遊戲整合真實的台灣鳥類圖片。

## 📋 目錄

- [圖片需求](#圖片需求)
- [圖片來源](#圖片來源)
- [圖片規格](#圖片規格)
- [整合步驟](#整合步驟)
- [版權注意事項](#版權注意事項)
- [圖片優化](#圖片優化)

## 圖片需求

遊戲需要以下 20 種台灣鳥類的圖片：

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

## 圖片來源

### 推薦來源

1. **台灣生物多樣性網絡（TBN）**
   - 網址：https://www.tbn.org.tw/
   - 授權：CC BY-NC
   - 品質：高

2. **eBird Taiwan**
   - 網址：https://ebird.org/taiwan
   - 授權：依攝影師授權
   - 品質：高

3. **iNaturalist**
   - 網址：https://www.inaturalist.org/
   - 授權：CC BY / CC BY-NC
   - 品質：中至高

4. **Wikimedia Commons**
   - 網址：https://commons.wikimedia.org/
   - 授權：多種開放授權
   - 品質：中至高

5. **Flickr（Creative Commons）**
   - 網址：https://www.flickr.com/creativecommons/
   - 授權：CC BY / CC BY-SA
   - 品質：中至高

### 商業圖庫（需付費）

1. **Shutterstock**
2. **Getty Images**
3. **Adobe Stock**

## 圖片規格

### 基本要求

- **格式**：PNG（支援透明背景）或 JPG
- **尺寸**：至少 512x512 像素
- **解析度**：72-150 DPI
- **色彩模式**：RGB
- **檔案大小**：每張不超過 500KB（優化後）

### 建議規格

- **格式**：WebP（最佳壓縮比）
- **尺寸**：1024x1024 像素
- **背景**：透明或純色
- **視角**：側面或 3/4 視角
- **品質**：清晰、對焦準確

### 多尺寸版本

為了優化效能，建議準備多個尺寸：

```
public/images/birds/
├── original/          # 原始高解析度圖片（1024x1024）
├── large/            # 大尺寸（512x512）
├── medium/           # 中尺寸（256x256）
└── thumbnail/        # 縮圖（128x128）
```

## 整合步驟

### 步驟 1：建立圖片目錄結構

```bash
mkdir -p public/images/birds/{original,large,medium,thumbnail}
```

### 步驟 2：下載並整理圖片

將圖片命名為鳥類的英文學名或 ID：

```
public/images/birds/original/
├── mullers-barbet.png
├── taiwan-blue-magpie.png
├── black-naped-monarch.png
└── ...
```

### 步驟 3：圖片優化

使用圖片優化工具：

#### 使用 ImageMagick

```bash
# 調整大小並優化
for file in public/images/birds/original/*.png; do
  filename=$(basename "$file" .png)
  
  # 大尺寸 (512x512)
  convert "$file" -resize 512x512 -quality 85 "public/images/birds/large/$filename.webp"
  
  # 中尺寸 (256x256)
  convert "$file" -resize 256x256 -quality 85 "public/images/birds/medium/$filename.webp"
  
  # 縮圖 (128x128)
  convert "$file" -resize 128x128 -quality 80 "public/images/birds/thumbnail/$filename.webp"
done
```

#### 使用 Sharp（Node.js）

建立 `scripts/optimize-images.js`：

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  large: 512,
  medium: 256,
  thumbnail: 128,
};

const inputDir = 'public/images/birds/original';
const outputBaseDir = 'public/images/birds';

fs.readdirSync(inputDir).forEach(async (file) => {
  const inputPath = path.join(inputDir, file);
  const filename = path.parse(file).name;

  for (const [size, dimension] of Object.entries(sizes)) {
    const outputPath = path.join(outputBaseDir, size, `${filename}.webp`);

    await sharp(inputPath)
      .resize(dimension, dimension, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    console.log(`✓ ${size}: ${filename}.webp`);
  }
});
```

執行：

```bash
npm install sharp
node scripts/optimize-images.js
```

### 步驟 4：更新鳥類資料

修改 `src/data/extendedBirds.ts`，加入圖片路徑：

```typescript
export const EXTENDED_TAIWAN_BIRDS: BirdData[] = [
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
  },
  // ... 其他鳥類
];
```

### 步驟 5：建立圖片載入器

建立 `src/utils/ImageLoader.ts`：

```typescript
/**
 * 圖片載入器
 */
export class ImageLoader {
  private static cache: Map<string, HTMLImageElement> = new Map();
  private static loading: Map<string, Promise<HTMLImageElement>> = new Map();

  /**
   * 載入圖片
   */
  public static async load(url: string): Promise<HTMLImageElement> {
    // 檢查快取
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // 檢查是否正在載入
    if (this.loading.has(url)) {
      return this.loading.get(url)!;
    }

    // 開始載入
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(url, img);
        this.loading.delete(url);
        resolve(img);
      };
      img.onerror = () => {
        this.loading.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });

    this.loading.set(url, promise);
    return promise;
  }

  /**
   * 預載入多張圖片
   */
  public static async preload(urls: string[]): Promise<void> {
    await Promise.all(urls.map((url) => this.load(url)));
  }

  /**
   * 清除快取
   */
  public static clearCache(): void {
    this.cache.clear();
  }
}
```

### 步驟 6：更新 BirdSprite 組件

修改 `src/components/BirdSprite.ts` 以使用真實圖片：

```typescript
import { ImageLoader } from '@/utils/ImageLoader';

export class BirdSprite extends Component {
  private image: HTMLImageElement | null = null;
  private imageLoaded: boolean = false;

  public async onAttach(): Promise<void> {
    const birdData = this.getBirdData();
    if (birdData?.gameData.sprite?.idle) {
      try {
        this.image = await ImageLoader.load(birdData.gameData.sprite.idle);
        this.imageLoaded = true;
      } catch (error) {
        console.error('Failed to load bird image:', error);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.imageLoaded || !this.image) {
      // 顯示預設圖形
      this.renderPlaceholder(ctx);
      return;
    }

    // 渲染圖片
    const size = 64;
    ctx.drawImage(
      this.image,
      -size / 2,
      -size / 2,
      size,
      size
    );
  }

  private renderPlaceholder(ctx: CanvasRenderingContext2D): void {
    // 預設圖形（圓形）
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

### 步驟 7：預載入圖片

在遊戲啟動時預載入所有鳥類圖片：

```typescript
// src/main.ts
import { ImageLoader } from './utils/ImageLoader';
import { EXTENDED_TAIWAN_BIRDS } from './data/extendedBirds';

async function preloadAssets() {
  const imageUrls = EXTENDED_TAIWAN_BIRDS
    .map((bird) => bird.gameData.sprite?.idle)
    .filter((url): url is string => !!url);

  await ImageLoader.preload(imageUrls);
  console.log('All bird images loaded!');
}

// 在初始化遊戲前呼叫
preloadAssets().then(() => {
  // 啟動遊戲
  engine.start();
});
```

## 版權注意事項

### 授權類型

1. **CC0（公有領域）**
   - 可自由使用
   - 無需署名

2. **CC BY（姓名標示）**
   - 可自由使用
   - 需要署名

3. **CC BY-SA（姓名標示-相同方式分享）**
   - 可自由使用
   - 需要署名
   - 衍生作品需使用相同授權

4. **CC BY-NC（姓名標示-非商業性）**
   - 僅限非商業使用
   - 需要署名

### 署名範例

在遊戲中加入圖片來源說明：

```typescript
// src/data/birdImageCredits.ts
export const BIRD_IMAGE_CREDITS = {
  'mullers-barbet': {
    photographer: 'John Doe',
    source: 'iNaturalist',
    license: 'CC BY 4.0',
    url: 'https://www.inaturalist.org/photos/12345',
  },
  // ... 其他鳥類
};
```

在遊戲設定或關於頁面顯示：

```typescript
// 顯示圖片來源
function renderCredits() {
  for (const [birdId, credit] of Object.entries(BIRD_IMAGE_CREDITS)) {
    console.log(`${birdId}: Photo by ${credit.photographer} (${credit.license})`);
  }
}
```

## 圖片優化

### 1. 格式選擇

- **WebP**：最佳選擇，壓縮比高，品質好
- **PNG**：需要透明背景時使用
- **JPG**：不需要透明背景時使用

### 2. 壓縮工具

- **TinyPNG**：https://tinypng.com/
- **Squoosh**：https://squoosh.app/
- **ImageOptim**（Mac）：https://imageoptim.com/

### 3. 延遲載入

只載入可見區域的圖片：

```typescript
class LazyImageLoader {
  private observer: IntersectionObserver;

  constructor() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          this.observer.unobserve(img);
        }
      });
    });
  }

  public observe(img: HTMLImageElement): void {
    this.observer.observe(img);
  }
}
```

### 4. 響應式圖片

根據螢幕大小載入不同尺寸：

```typescript
function getBirdImageUrl(birdId: string, screenWidth: number): string {
  if (screenWidth < 768) {
    return `/images/birds/medium/${birdId}.webp`;
  } else if (screenWidth < 1920) {
    return `/images/birds/large/${birdId}.webp`;
  } else {
    return `/images/birds/original/${birdId}.webp`;
  }
}
```

## 測試檢查清單

- [ ] 所有 20 種鳥類都有圖片
- [ ] 圖片格式正確（WebP/PNG/JPG）
- [ ] 圖片尺寸符合規格
- [ ] 圖片已優化（檔案大小合理）
- [ ] 圖片載入正常
- [ ] 圖片顯示正確
- [ ] 版權資訊已記錄
- [ ] 署名已加入遊戲

## 故障排除

### 問題 1：圖片無法載入

**解決方案：**
- 檢查檔案路徑是否正確
- 確認檔案名稱大小寫
- 檢查檔案權限

### 問題 2：圖片顯示模糊

**解決方案：**
- 使用更高解析度的原始圖片
- 調整圖片品質設定
- 確保圖片尺寸足夠

### 問題 3：載入速度慢

**解決方案：**
- 進一步壓縮圖片
- 使用 WebP 格式
- 實作延遲載入
- 使用 CDN

## 相關資源

- [WebP 轉換工具](https://developers.google.com/speed/webp)
- [Creative Commons 授權說明](https://creativecommons.org/licenses/)
- [圖片優化最佳實踐](https://web.dev/fast/#optimize-your-images)

---

**最後更新：** 2026-05-27

**維護者：** Bob