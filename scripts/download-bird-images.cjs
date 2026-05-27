/**
 * 鳥類圖片下載腳本
 * 
 * 此腳本協助從開放資源下載台灣鳥類圖片
 * 使用方式：node scripts/download-bird-images.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 20 種台灣鳥類清單
const BIRDS = [
  {
    id: 'mullers-barbet',
    commonName: '五色鳥',
    scientificName: 'Psilopogon nuchalis',
    searchTerms: ['Muller\'s Barbet', 'Taiwan Barbet', '五色鳥']
  },
  {
    id: 'taiwan-blue-magpie',
    commonName: '台灣藍鵲',
    scientificName: 'Urocissa caerulea',
    searchTerms: ['Taiwan Blue Magpie', 'Formosan Blue Magpie', '台灣藍鵲']
  },
  {
    id: 'black-naped-monarch',
    commonName: '黑枕藍鶲',
    scientificName: 'Hypothymis azurea',
    searchTerms: ['Black-naped Monarch', '黑枕藍鶲']
  },
  {
    id: 'black-bulbul',
    commonName: '紅嘴黑鵯',
    scientificName: 'Hypsipetes leucocephalus',
    searchTerms: ['Black Bulbul', '紅嘴黑鵯']
  },
  {
    id: 'chinese-bulbul',
    commonName: '白頭翁',
    scientificName: 'Pycnonotus sinensis',
    searchTerms: ['Chinese Bulbul', 'Light-vented Bulbul', '白頭翁']
  },
  {
    id: 'japanese-white-eye',
    commonName: '綠繡眼',
    scientificName: 'Zosterops japonicus',
    searchTerms: ['Japanese White-eye', '綠繡眼']
  },
  {
    id: 'taiwan-scimitar-babbler',
    commonName: '小彎嘴',
    scientificName: 'Pomatorhinus musicus',
    searchTerms: ['Taiwan Scimitar Babbler', '小彎嘴']
  },
  {
    id: 'black-necklaced-scimitar-babbler',
    commonName: '大彎嘴',
    scientificName: 'Erythrogenys erythrocnemis',
    searchTerms: ['Black-necklaced Scimitar Babbler', '大彎嘴']
  },
  {
    id: 'rufous-capped-babbler',
    commonName: '山紅頭',
    scientificName: 'Cyanoderma ruficeps',
    searchTerms: ['Rufous-capped Babbler', '山紅頭']
  },
  {
    id: 'taiwan-yuhina',
    commonName: '冠羽畫眉',
    scientificName: 'Yuhina brunneiceps',
    searchTerms: ['Taiwan Yuhina', 'Formosan Yuhina', '冠羽畫眉']
  },
  {
    id: 'white-eared-sibia',
    commonName: '白耳畫眉',
    scientificName: 'Heterophasia auricularis',
    searchTerms: ['White-eared Sibia', '白耳畫眉']
  },
  {
    id: 'black-throated-tit',
    commonName: '紅頭山雀',
    scientificName: 'Aegithalos concinnus',
    searchTerms: ['Black-throated Tit', '紅頭山雀']
  },
  {
    id: 'green-backed-tit',
    commonName: '青背山雀',
    scientificName: 'Parus monticolus',
    searchTerms: ['Green-backed Tit', '青背山雀']
  },
  {
    id: 'rufous-faced-warbler',
    commonName: '棕面鶯',
    scientificName: 'Abroscopus albogularis',
    searchTerms: ['Rufous-faced Warbler', '棕面鶯']
  },
  {
    id: 'yellow-tit',
    commonName: '黃山雀',
    scientificName: 'Machlolophus holsti',
    searchTerms: ['Yellow Tit', 'Taiwan Yellow Tit', '黃山雀']
  },
  {
    id: 'flamecrest',
    commonName: '火冠戴菊鳥',
    scientificName: 'Regulus goodfellowi',
    searchTerms: ['Flamecrest', 'Taiwan Firecrest', '火冠戴菊鳥']
  },
  {
    id: 'taiwan-hwamei',
    commonName: '台灣噪眉',
    scientificName: 'Garrulax taewanus',
    searchTerms: ['Taiwan Hwamei', '台灣噪眉']
  },
  {
    id: 'grey-capped-pygmy-woodpecker',
    commonName: '小啄木',
    scientificName: 'Yungipicus canicapillus',
    searchTerms: ['Grey-capped Pygmy Woodpecker', '小啄木']
  },
  {
    id: 'crested-serpent-eagle',
    commonName: '大冠鷲',
    scientificName: 'Spilornis cheela',
    searchTerms: ['Crested Serpent Eagle', '大冠鷲']
  },
  {
    id: 'collared-bush-robin',
    commonName: '繡眼畫眉',
    scientificName: 'Tarsiger johnstoniae',
    searchTerms: ['Collared Bush Robin', '繡眼畫眉']
  }
];

// 圖片來源 API（使用 Wikimedia Commons）
const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php';

/**
 * 建立目錄結構
 */
function createDirectories() {
  const dirs = [
    'public/images/birds/original',
    'public/images/birds/large',
    'public/images/birds/medium',
    'public/images/birds/thumbnail'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ 建立目錄: ${dir}`);
    }
  });
}

/**
 * 搜尋 Wikimedia Commons 圖片
 */
async function searchWikimediaImage(searchTerm) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      list: 'search',
      srsearch: searchTerm,
      srnamespace: '6', // File namespace
      srlimit: '5'
    });

    const url = `${WIKIMEDIA_API}?${params}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.query?.search || []);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

/**
 * 下載圖片
 */
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

/**
 * 生成圖片來源清單
 */
function generateCreditsFile(credits) {
  const content = `/**
 * 鳥類圖片來源
 * 自動生成於 ${new Date().toISOString()}
 */

export const BIRD_IMAGE_CREDITS = ${JSON.stringify(credits, null, 2)};
`;

  fs.writeFileSync('src/data/birdImageCredits.ts', content);
  console.log('✓ 生成圖片來源檔案: src/data/birdImageCredits.ts');
}

/**
 * 主要執行函數
 */
async function main() {
  console.log('🐦 開始下載台灣鳥類圖片...\n');

  // 建立目錄
  createDirectories();

  const credits = {};
  const downloadList = [];

  console.log('\n📋 圖片來源清單：\n');
  console.log('由於版權限制，此腳本僅提供圖片來源連結。');
  console.log('請手動下載圖片並放置到對應目錄。\n');

  // 為每種鳥類生成搜尋連結
  for (const bird of BIRDS) {
    console.log(`${bird.commonName} (${bird.scientificName})`);
    console.log('─'.repeat(60));
    
    // 推薦的圖片來源
    const sources = [
      {
        name: 'eBird Taiwan',
        url: `https://ebird.org/species/${bird.id}`,
        license: '依攝影師授權'
      },
      {
        name: 'Wikimedia Commons',
        url: `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(bird.scientificName)}`,
        license: 'CC BY / CC BY-SA'
      },
      {
        name: 'iNaturalist',
        url: `https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(bird.scientificName)}`,
        license: 'CC BY / CC BY-NC'
      },
      {
        name: 'TBN 台灣生物多樣性網絡',
        url: `https://www.tbn.org.tw/search?query=${encodeURIComponent(bird.commonName)}`,
        license: 'CC BY-NC'
      }
    ];

    sources.forEach(source => {
      console.log(`  • ${source.name}`);
      console.log(`    ${source.url}`);
      console.log(`    授權: ${source.license}`);
    });

    console.log(`\n  下載後請將圖片命名為: ${bird.id}.png 或 ${bird.id}.jpg`);
    console.log(`  並放置到: public/images/birds/original/\n`);

    downloadList.push({
      id: bird.id,
      commonName: bird.commonName,
      scientificName: bird.scientificName,
      sources
    });
  }

  // 生成下載清單檔案
  const downloadListContent = `# 鳥類圖片下載清單

此檔案列出所有需要下載的鳥類圖片及其來源。

## 下載步驟

1. 點擊下方連結前往圖片來源網站
2. 選擇合適的圖片（建議選擇 CC BY 或 CC BY-SA 授權）
3. 下載圖片
4. 將圖片重新命名為對應的 ID
5. 放置到 \`public/images/birds/original/\` 目錄
6. 執行 \`node scripts/optimize-images.js\` 生成不同尺寸

## 圖片清單

${downloadList.map(bird => `
### ${bird.commonName} (${bird.scientificName})

**檔案名稱**: \`${bird.id}.png\` 或 \`${bird.id}.jpg\`

**圖片來源**:
${bird.sources.map(s => `- [${s.name}](${s.url}) - ${s.license}`).join('\n')}

---
`).join('\n')}

## 版權注意事項

請確保：
1. 選擇的圖片具有適當的授權（建議 CC BY 或 CC BY-SA）
2. 記錄攝影師姓名和來源
3. 在遊戲中適當署名

## 圖片規格

- **格式**: PNG 或 JPG
- **尺寸**: 至少 512x512 像素
- **品質**: 清晰、對焦準確
- **背景**: 最好是純色或可去背

## 優化圖片

下載完成後，執行以下命令優化圖片：

\`\`\`bash
npm install sharp
node scripts/optimize-images.js
\`\`\`

這將自動生成 large (512x512)、medium (256x256) 和 thumbnail (128x128) 三種尺寸。
`;

  fs.writeFileSync('BIRD_IMAGES_DOWNLOAD_LIST.md', downloadListContent);
  console.log('\n✓ 生成下載清單: BIRD_IMAGES_DOWNLOAD_LIST.md');

  console.log('\n📝 下一步：');
  console.log('1. 查看 BIRD_IMAGES_DOWNLOAD_LIST.md 檔案');
  console.log('2. 根據清單下載圖片');
  console.log('3. 將圖片放置到 public/images/birds/original/');
  console.log('4. 執行 node scripts/optimize-images.js 優化圖片');
  console.log('\n✨ 完成！');
}

// 執行主函數
main().catch(console.error);

// Made with Bob
