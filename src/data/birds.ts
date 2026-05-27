import { BirdData, BirdRarity, BirdHabitat } from '@/models/BirdData';

/**
 * 台灣常見鳥類資料
 * 基於 eBird Taiwan 和特有生物研究保育中心的資料
 */
export const TAIWAN_BIRDS: BirdData[] = [
  // 常見鳥類
  {
    id: 'bird_001',
    name: '麻雀',
    scientificName: 'Passer montanus',
    description: '台灣最常見的鳥類之一，體型小巧，羽色以褐色為主，臉頰有黑色斑點。常在人類居住區活動，喜歡群聚。',
    rarity: BirdRarity.COMMON,
    habitats: [BirdHabitat.URBAN, BirdHabitat.FARMLAND],
    size: 14, // 公分
    weight: 25, // 公克
    characteristics: [
      '臉頰有黑色斑點',
      '褐色羽毛',
      '喜歡群聚',
      '常在地面覓食'
    ],
    behaviors: [
      '跳躍式移動',
      '喜歡在樹枝上鳴叫',
      '以穀物和昆蟲為食'
    ],
    callDescription: '嘰嘰喳喳的叫聲',
    imageUrl: '/assets/birds/sparrow.jpg',
    discoveryPoints: 10
  },
  {
    id: 'bird_002',
    name: '白頭翁',
    scientificName: 'Pycnonotus sinensis',
    description: '台灣特有亞種，頭部有明顯的白色羽毛，是台灣最常見的鳥類之一。性格活潑，叫聲清脆悅耳。',
    rarity: BirdRarity.COMMON,
    habitats: [BirdHabitat.URBAN, BirdHabitat.FOREST],
    size: 18,
    weight: 35,
    characteristics: [
      '頭頂白色',
      '黑色頭部',
      '黃綠色腹部',
      '尾羽末端白色'
    ],
    behaviors: [
      '喜歡在樹枝間跳躍',
      '以果實和昆蟲為食',
      '常單獨或成對活動'
    ],
    callDescription: '清脆的「巧克力、巧克力」叫聲',
    imageUrl: '/assets/birds/chinese-bulbul.jpg',
    discoveryPoints: 10
  },
  {
    id: 'bird_003',
    name: '綠繡眼',
    scientificName: 'Zosterops japonicus',
    description: '小型鳥類，眼睛周圍有明顯的白色眼圈，背部黃綠色。喜歡在花叢間活動，以花蜜和小昆蟲為食。',
    rarity: BirdRarity.COMMON,
    habitats: [BirdHabitat.URBAN, BirdHabitat.FOREST],
    size: 11,
    weight: 10,
    characteristics: [
      '白色眼圈',
      '黃綠色羽毛',
      '體型嬌小',
      '嘴喙細長'
    ],
    behaviors: [
      '喜歡群聚',
      '在花叢間快速移動',
      '以花蜜為主食'
    ],
    callDescription: '細碎的「滋滋」聲',
    imageUrl: '/assets/birds/japanese-white-eye.jpg',
    discoveryPoints: 10
  },

  // 不常見鳥類
  {
    id: 'bird_004',
    name: '五色鳥',
    scientificName: 'Psilopogon nuchalis',
    description: '台灣特有種，羽色鮮豔，有綠、藍、黃、紅、黑五種顏色。喜歡在樹洞中築巢，叫聲如敲木魚。',
    rarity: BirdRarity.UNCOMMON,
    habitats: [BirdHabitat.FOREST],
    size: 20,
    weight: 70,
    characteristics: [
      '五彩羽毛',
      '粗壯的嘴喙',
      '綠色背部',
      '藍色臉頰'
    ],
    behaviors: [
      '在樹幹上鑿洞',
      '以果實為主食',
      '單獨或成對活動'
    ],
    callDescription: '「叩叩叩」如敲木魚的聲音',
    imageUrl: '/assets/birds/taiwan-barbet.jpg',
    discoveryPoints: 25
  },
  {
    id: 'bird_005',
    name: '台灣藍鵲',
    scientificName: 'Urocissa caerulea',
    description: '台灣特有種，有「長尾山娘」之稱。羽色以藍色為主，尾羽特別長。性格兇猛，會保護領域。',
    rarity: BirdRarity.UNCOMMON,
    habitats: [BirdHabitat.FOREST, BirdHabitat.MOUNTAIN],
    size: 64,
    weight: 250,
    characteristics: [
      '藍色羽毛',
      '長尾羽',
      '紅色嘴喙',
      '黑色頭部'
    ],
    behaviors: [
      '群體行動',
      '會保護領域',
      '雜食性',
      '飛行時尾羽飄逸'
    ],
    callDescription: '響亮的「嘎嘎」聲',
    imageUrl: '/assets/birds/taiwan-blue-magpie.jpg',
    discoveryPoints: 30
  },

  // 稀有鳥類
  {
    id: 'bird_006',
    name: '黑面琵鷺',
    scientificName: 'Platalea minor',
    description: '瀕危物種，每年冬天會來台灣度冬。嘴喙扁平如琵琶，臉部黑色。主要棲息在濕地。',
    rarity: BirdRarity.RARE,
    habitats: [BirdHabitat.WETLAND],
    size: 74,
    weight: 1600,
    characteristics: [
      '黑色臉部',
      '琵琶狀嘴喙',
      '白色羽毛',
      '長腿'
    ],
    behaviors: [
      '在淺水區覓食',
      '左右搖擺嘴喙',
      '群體活動',
      '冬候鳥'
    ],
    callDescription: '低沉的「咕咕」聲',
    imageUrl: '/assets/birds/black-faced-spoonbill.jpg',
    discoveryPoints: 50
  },
  {
    id: 'bird_007',
    name: '帝雉',
    scientificName: 'Syrmaticus mikado',
    description: '台灣特有種，又稱「黑長尾雉」。雄鳥羽色華麗，有藍色光澤。棲息在高海拔山區，是台灣的國鳥候選之一。',
    rarity: BirdRarity.RARE,
    habitats: [BirdHabitat.MOUNTAIN],
    size: 87,
    weight: 1200,
    characteristics: [
      '藍黑色羽毛',
      '長尾羽',
      '白色橫紋',
      '紅色臉部'
    ],
    behaviors: [
      '在地面覓食',
      '警戒時會豎起尾羽',
      '以植物種子為食',
      '晨昏活動'
    ],
    callDescription: '響亮的「嘓嘓」聲',
    imageUrl: '/assets/birds/mikado-pheasant.jpg',
    discoveryPoints: 100
  },

  // 極稀有鳥類
  {
    id: 'bird_008',
    name: '黃山雀',
    scientificName: 'Machlolophus holsti',
    description: '台灣特有種，體型小巧，羽色鮮黃。主要棲息在中高海拔山區，數量稀少。',
    rarity: BirdRarity.EPIC,
    habitats: [BirdHabitat.MOUNTAIN, BirdHabitat.FOREST],
    size: 13,
    weight: 14,
    characteristics: [
      '鮮黃色羽毛',
      '黑色頭冠',
      '白色臉頰',
      '體型嬌小'
    ],
    behaviors: [
      '在樹枝間快速移動',
      '以昆蟲為食',
      '喜歡混群',
      '活潑好動'
    ],
    callDescription: '清脆的「嘰嘰」聲',
    imageUrl: '/assets/birds/yellow-tit.jpg',
    discoveryPoints: 150
  },
  {
    id: 'bird_009',
    name: '藍腹鷴',
    scientificName: 'Lophura swinhoii',
    description: '台灣特有種，雄鳥羽色華麗，有藍色、白色和紅色。是台灣最美麗的雉科鳥類之一，棲息在中低海拔山區。',
    rarity: BirdRarity.LEGENDARY,
    habitats: [BirdHabitat.MOUNTAIN, BirdHabitat.FOREST],
    size: 79,
    weight: 1100,
    characteristics: [
      '藍色腹部',
      '白色背部',
      '紅色臉部',
      '長尾羽'
    ],
    behaviors: [
      '在地面覓食',
      '警戒時會展開尾羽',
      '晨昏活動',
      '以果實和昆蟲為食'
    ],
    callDescription: '低沉的「咕咕」聲',
    imageUrl: '/assets/birds/swinhoes-pheasant.jpg',
    discoveryPoints: 200
  },
  {
    id: 'bird_010',
    name: '熊鷹',
    scientificName: 'Nisaetus nipalensis',
    description: '大型猛禽，又稱「赫氏角鷹」。是台灣最大的留棲性猛禽，數量極為稀少。主要棲息在原始森林。',
    rarity: BirdRarity.LEGENDARY,
    habitats: [BirdHabitat.MOUNTAIN, BirdHabitat.FOREST],
    size: 72,
    weight: 3000,
    characteristics: [
      '褐色羽毛',
      '頭部有冠羽',
      '黃色眼睛',
      '強壯的爪子'
    ],
    behaviors: [
      '在高空盤旋',
      '以小型哺乳動物為食',
      '單獨活動',
      '領域性強'
    ],
    callDescription: '尖銳的「啾啾」聲',
    imageUrl: '/assets/birds/mountain-hawk-eagle.jpg',
    discoveryPoints: 300
  }
];

/**
 * 根據 ID 獲取鳥類資料
 */
export function getBirdById(id: string): BirdData | undefined {
  return TAIWAN_BIRDS.find(bird => bird.id === id);
}

/**
 * 根據棲息地獲取鳥類列表
 */
export function getBirdsByHabitat(habitat: BirdHabitat): BirdData[] {
  return TAIWAN_BIRDS.filter(bird => bird.habitats.includes(habitat));
}

/**
 * 根據稀有度獲取鳥類列表
 */
export function getBirdsByRarity(rarity: BirdRarity): BirdData[] {
  return TAIWAN_BIRDS.filter(bird => bird.rarity === rarity);
}

/**
 * 獲取所有鳥類資料
 */
export function getAllBirds(): BirdData[] {
  return [...TAIWAN_BIRDS];
}

// Made with Bob
