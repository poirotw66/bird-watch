/**
 * 圖片優化腳本
 * 
 * 將 original 目錄中的圖片優化並生成多種尺寸
 * 使用方式：node scripts/optimize-images.js
 * 
 * 需要先安裝 sharp：npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 尺寸設定
const SIZES = {
  large: 512,
  medium: 256,
  thumbnail: 128
};

// 目錄設定
const INPUT_DIR = 'public/images/birds/original';
const OUTPUT_BASE_DIR = 'public/images/birds';

/**
 * 確保目錄存在
 */
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 取得所有圖片檔案
 */
function getImageFiles() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ 找不到目錄: ${INPUT_DIR}`);
    console.log('\n請先建立目錄並放入圖片：');
    console.log(`  mkdir -p ${INPUT_DIR}`);
    console.log(`  # 然後將圖片放入該目錄`);
    return [];
  }

  const files = fs.readdirSync(INPUT_DIR);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });
}

/**
 * 優化單張圖片
 */
async function optimizeImage(filename) {
  const inputPath = path.join(INPUT_DIR, filename);
  const baseName = path.parse(filename).name;

  console.log(`\n處理: ${filename}`);
  console.log('─'.repeat(60));

  try {
    // 讀取圖片資訊
    const metadata = await sharp(inputPath).metadata();
    console.log(`  原始尺寸: ${metadata.width}x${metadata.height}`);
    console.log(`  格式: ${metadata.format}`);
    console.log(`  大小: ${(fs.statSync(inputPath).size / 1024).toFixed(2)} KB`);

    // 生成各種尺寸
    for (const [sizeName, dimension] of Object.entries(SIZES)) {
      const outputDir = path.join(OUTPUT_BASE_DIR, sizeName);
      ensureDirectoryExists(outputDir);

      const outputPath = path.join(outputDir, `${baseName}.webp`);

      await sharp(inputPath)
        .resize(dimension, dimension, {
          fit: 'cover',
          position: 'center'
        })
        .webp({
          quality: sizeName === 'thumbnail' ? 80 : 85,
          effort: 6
        })
        .toFile(outputPath);

      const outputSize = fs.statSync(outputPath).size;
      console.log(`  ✓ ${sizeName} (${dimension}x${dimension}): ${(outputSize / 1024).toFixed(2)} KB`);
    }

    console.log('  ✅ 完成');
    return true;
  } catch (error) {
    console.error(`  ❌ 錯誤: ${error.message}`);
    return false;
  }
}

/**
 * 生成圖片清單
 */
function generateImageManifest(processedFiles) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalImages: processedFiles.length,
    images: processedFiles.map(filename => {
      const baseName = path.parse(filename).name;
      return {
        id: baseName,
        original: `/images/birds/original/${filename}`,
        large: `/images/birds/large/${baseName}.webp`,
        medium: `/images/birds/medium/${baseName}.webp`,
        thumbnail: `/images/birds/thumbnail/${baseName}.webp`
      };
    })
  };

  const manifestPath = 'public/images/birds/manifest.json';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ 生成圖片清單: ${manifestPath}`);

  return manifest;
}

/**
 * 更新鳥類資料檔案
 */
function updateBirdData(manifest) {
  const updateInstructions = `
/**
 * 更新鳥類資料中的圖片路徑
 * 
 * 在 src/data/extendedBirds.ts 中，為每個鳥類加入以下結構：
 * 
 * gameData: {
 *   // ... 其他設定
 *   sprite: {
 *     idle: '/images/birds/medium/鳥類ID.webp',
 *     flying: '/images/birds/medium/鳥類ID.webp',
 *     thumbnail: '/images/birds/thumbnail/鳥類ID.webp',
 *     large: '/images/birds/large/鳥類ID.webp',
 *   }
 * }
 * 
 * 可用的圖片：
 */

${manifest.images.map(img => `// ${img.id}
//   medium: '${img.medium}'
//   thumbnail: '${img.thumbnail}'
//   large: '${img.large}'`).join('\n\n')}
`;

  fs.writeFileSync('UPDATE_BIRD_DATA.txt', updateInstructions);
  console.log('✓ 生成更新說明: UPDATE_BIRD_DATA.txt');
}

/**
 * 生成統計報告
 */
function generateReport(results) {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n' + '='.repeat(60));
  console.log('📊 優化報告');
  console.log('='.repeat(60));
  console.log(`總計: ${results.length} 張圖片`);
  console.log(`成功: ${successful} 張`);
  console.log(`失敗: ${failed} 張`);

  if (failed > 0) {
    console.log('\n失敗的圖片：');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  ❌ ${r.filename}`);
    });
  }

  // 計算總大小
  const sizes = ['large', 'medium', 'thumbnail'];
  sizes.forEach(size => {
    const dir = path.join(OUTPUT_BASE_DIR, size);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      const totalSize = files.reduce((sum, file) => {
        const filePath = path.join(dir, file);
        return sum + fs.statSync(filePath).size;
      }, 0);
      console.log(`\n${size} 目錄總大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    }
  });

  console.log('\n✨ 優化完成！');
}

/**
 * 主要執行函數
 */
async function main() {
  console.log('🖼️  鳥類圖片優化工具');
  console.log('='.repeat(60));

  // 檢查 sharp 是否已安裝
  try {
    require.resolve('sharp');
  } catch (e) {
    console.error('\n❌ 找不到 sharp 套件');
    console.log('\n請先安裝：');
    console.log('  npm install sharp');
    process.exit(1);
  }

  // 取得圖片檔案
  const imageFiles = getImageFiles();

  if (imageFiles.length === 0) {
    console.log('\n⚠️  沒有找到圖片檔案');
    console.log('\n請將圖片放入以下目錄：');
    console.log(`  ${INPUT_DIR}`);
    console.log('\n支援的格式：.jpg, .jpeg, .png, .webp');
    process.exit(0);
  }

  console.log(`\n找到 ${imageFiles.length} 張圖片\n`);

  // 確保輸出目錄存在
  Object.keys(SIZES).forEach(size => {
    ensureDirectoryExists(path.join(OUTPUT_BASE_DIR, size));
  });

  // 處理所有圖片
  const results = [];
  for (const filename of imageFiles) {
    const success = await optimizeImage(filename);
    results.push({ filename, success });
  }

  // 生成清單和報告
  const processedFiles = results.filter(r => r.success).map(r => r.filename);
  if (processedFiles.length > 0) {
    const manifest = generateImageManifest(processedFiles);
    updateBirdData(manifest);
  }

  generateReport(results);

  console.log('\n📝 下一步：');
  console.log('1. 查看 UPDATE_BIRD_DATA.txt 了解如何更新鳥類資料');
  console.log('2. 在 src/data/extendedBirds.ts 中加入圖片路徑');
  console.log('3. 重新啟動開發伺服器查看效果');
}

// 執行主函數
main().catch(error => {
  console.error('\n❌ 發生錯誤:', error);
  process.exit(1);
});

// Made with Bob
