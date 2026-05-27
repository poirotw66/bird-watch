/**
 * 簡化版台灣鳥類資料
 * 用於快速開發和測試
 */

import { getTaiwanBirdById } from './taiwanBirdCatalog';

export interface SimpleBirdData {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  habitats: string[];
  size: number; // 公分
  weight: number; // 公克
  characteristics: string[];
  behaviors: string[];
  callDescription: string;
  imageUrl: string;
  discoveryPoints: number;
}

/**
 * 台灣常見鳥類資料（簡化版）
 */
export const SIMPLE_TAIWAN_BIRDS: SimpleBirdData[] = [
  // 常見鳥類
  {
    id: 'bird_001',
    name: '麻雀',
    scientificName: 'Passer montanus',
    description: '台灣最常見的鳥類之一，體型小巧，羽色以褐色為主，臉頰有黑色斑點。',
    rarity: 'common',
    habitats: ['urban', 'farmland'],
    size: 14,
    weight: 25,
    characteristics: ['臉頰有黑色斑點', '褐色羽毛', '喜歡群聚'],
    behaviors: ['跳躍式移動', '喜歡在樹枝上鳴叫', '以穀物和昆蟲為食'],
    callDescription: '嘰嘰喳喳的叫聲',
    imageUrl: '/assets/birds/sparrow.jpg',
    discoveryPoints: 10
  },
  {
    id: 'bird_002',
    name: '白頭翁',
    scientificName: 'Pycnonotus sinensis',
    description: '台灣特有亞種，頭部有明顯的白色羽毛，是台灣最常見的鳥類之一。',
    rarity: 'common',
    habitats: ['urban', 'forest'],
    size: 18,
    weight: 35,
    characteristics: ['頭頂白色', '黑色頭部', '黃綠色腹部'],
    behaviors: ['喜歡在樹枝間跳躍', '以果實和昆蟲為食'],
    callDescription: '清脆的「巧克力、巧克力」叫聲',
    imageUrl: '/assets/birds/chinese-bulbul.jpg',
    discoveryPoints: 10
  },
  {
    id: 'bird_003',
    name: '綠繡眼',
    scientificName: 'Zosterops japonicus',
    description: '小型鳥類，眼睛周圍有明顯的白色眼圈，背部黃綠色。',
    rarity: 'common',
    habitats: ['urban', 'forest'],
    size: 11,
    weight: 10,
    characteristics: ['白色眼圈', '黃綠色羽毛', '體型嬌小'],
    behaviors: ['喜歡群聚', '在花叢間快速移動', '以花蜜為主食'],
    callDescription: '細碎的「滋滋」聲',
    imageUrl: '/assets/birds/japanese-white-eye.jpg',
    discoveryPoints: 10
  },

  // 不常見鳥類
  {
    id: 'bird_004',
    name: '五色鳥',
    scientificName: 'Psilopogon nuchalis',
    description: '台灣特有種，羽色鮮豔，有綠、藍、黃、紅、黑五種顏色。',
    rarity: 'uncommon',
    habitats: ['forest'],
    size: 20,
    weight: 70,
    characteristics: ['五彩羽毛', '粗壯的嘴喙', '綠色背部'],
    behaviors: ['在樹幹上鑿洞', '以果實為主食'],
    callDescription: '「叩叩叩」如敲木魚的聲音',
    imageUrl: '/assets/birds/taiwan-barbet.jpg',
    discoveryPoints: 25
  },
  {
    id: 'bird_005',
    name: '台灣藍鵲',
    scientificName: 'Urocissa caerulea',
    description: '台灣特有種，有「長尾山娘」之稱。羽色以藍色為主，尾羽特別長。',
    rarity: 'uncommon',
    habitats: ['forest', 'mountain'],
    size: 64,
    weight: 250,
    characteristics: ['藍色羽毛', '長尾羽', '紅色嘴喙'],
    behaviors: ['群體行動', '會保護領域', '雜食性'],
    callDescription: '響亮的「嘎嘎」聲',
    imageUrl: '/assets/birds/taiwan-blue-magpie.jpg',
    discoveryPoints: 30
  },

  // 稀有鳥類
  {
    id: 'bird_006',
    name: '黑面琵鷺',
    scientificName: 'Platalea minor',
    description: '瀕危物種，每年冬天會來台灣度冬。嘴喙扁平如琵琶，臉部黑色。',
    rarity: 'rare',
    habitats: ['wetland'],
    size: 74,
    weight: 1600,
    characteristics: ['黑色臉部', '琵琶狀嘴喙', '白色羽毛'],
    behaviors: ['在淺水區覓食', '左右搖擺嘴喙', '群體活動'],
    callDescription: '低沉的「咕咕」聲',
    imageUrl: '/assets/birds/black-faced-spoonbill.jpg',
    discoveryPoints: 50
  },
  {
    id: 'bird_007',
    name: '帝雉',
    scientificName: 'Syrmaticus mikado',
    description: '台灣特有種，又稱「黑長尾雉」。雄鳥羽色華麗，有藍色光澤。',
    rarity: 'rare',
    habitats: ['mountain'],
    size: 87,
    weight: 1200,
    characteristics: ['藍黑色羽毛', '長尾羽', '白色橫紋'],
    behaviors: ['在地面覓食', '警戒時會豎起尾羽'],
    callDescription: '響亮的「嘓嘓」聲',
    imageUrl: '/assets/birds/mikado-pheasant.jpg',
    discoveryPoints: 100
  },

  // 傳說級鳥類
  {
    id: 'bird_008',
    name: '藍腹鷴',
    scientificName: 'Lophura swinhoii',
    description: '台灣特有種，雄鳥羽色華麗，有藍色、白色和紅色。',
    rarity: 'legendary',
    habitats: ['mountain', 'forest'],
    size: 79,
    weight: 1100,
    characteristics: ['藍色腹部', '白色背部', '紅色臉部'],
    behaviors: ['在地面覓食', '警戒時會展開尾羽'],
    callDescription: '低沉的「咕咕」聲',
    imageUrl: '/assets/birds/swinhoes-pheasant.jpg',
    discoveryPoints: 200
  }
];

/**
 * 根據 ID 獲取鳥類資料
 */
export function getSimpleBirdById(id: string): SimpleBirdData | undefined {
  return getTaiwanBirdById(id) ?? SIMPLE_TAIWAN_BIRDS.find((bird) => bird.id === id);
}

/**
 * 根據棲息地獲取鳥類列表
 */
export function getSimpleBirdsByHabitat(habitat: string): SimpleBirdData[] {
  return SIMPLE_TAIWAN_BIRDS.filter(bird => bird.habitats.includes(habitat));
}

/**
 * 根據稀有度獲取鳥類列表
 */
export function getSimpleBirdsByRarity(rarity: string): SimpleBirdData[] {
  return SIMPLE_TAIWAN_BIRDS.filter(bird => bird.rarity === rarity);
}

/**
 * 獲取所有鳥類資料
 */
export function getAllSimpleBirds(): SimpleBirdData[] {
  return [...SIMPLE_TAIWAN_BIRDS];
}

// Made with Bob
