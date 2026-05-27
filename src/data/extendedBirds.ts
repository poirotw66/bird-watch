import { SimpleBirdData } from './simpleBirds';

/**
 * 擴展的台灣鳥類資料
 * 包含更多種類的台灣常見鳥類
 */
export const EXTENDED_TAIWAN_BIRDS: SimpleBirdData[] = [
  // 常見鳥類 (Common) - 6種
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
    behaviors: ['跳躍式移動', '群居性強', '以種子和昆蟲為食'],
    callDescription: '嘰嘰喳喳的叫聲',
    imageUrl: '/assets/birds/sparrow.jpg',
    discoveryPoints: 10
  },
  {
    id: 'bird_002',
    name: '白頭翁',
    scientificName: 'Pycnonotus sinensis',
    description: '台灣特有亞種，頭部有明顯的白色羽冠，是台灣最常見的鳥類之一。',
    rarity: 'common',
    habitats: ['urban', 'forest'],
    size: 18,
    weight: 35,
    characteristics: ['白色頭頂', '黃綠色腹部', '活潑好動'],
    behaviors: ['喜歡在樹枝間跳躍', '以果實和昆蟲為食', '鳴聲清脆'],
    callDescription: '清脆的「巧克力、巧克力」叫聲',
    imageUrl: '/assets/birds/chinese-bulbul.jpg',
    discoveryPoints: 10
  },
  {
    id: 'bird_003',
    name: '綠繡眼',
    scientificName: 'Zosterops japonicus',
    description: '體型嬌小的鳥類，眼睛周圍有明顯的白色眼圈，羽色以黃綠色為主。',
    rarity: 'common',
    habitats: ['forest', 'garden', 'urban'],
    size: 11,
    weight: 10,
    characteristics: ['白色眼圈', '黃綠色羽毛', '體型嬌小'],
    behaviors: ['動作敏捷', '喜歡吸食花蜜', '常在花叢間穿梭'],
    callDescription: '細小的「滋滋」聲',
    imageUrl: '/assets/birds/japanese-white-eye.jpg',
    discoveryPoints: 10
  },
  {
    id: 'bird_004',
    name: '珠頸斑鳩',
    scientificName: 'Spilopelia chinensis',
    description: '中型鳩鴿，頸部有黑白相間的斑紋，像珍珠項鍊。',
    rarity: 'common',
    habitats: ['urban', 'farmland', 'forest'],
    size: 30,
    weight: 150,
    characteristics: ['頸部珍珠斑紋', '粉褐色羽毛', '溫和性格'],
    behaviors: ['地面覓食', '以種子為主食', '飛行時翅膀響亮'],
    callDescription: '低沉的「咕咕咕」叫聲',
    imageUrl: '/assets/birds/spotted-dove.jpg',
    discoveryPoints: 10
  },
  {
    id: 'bird_005',
    name: '紅鳩',
    scientificName: 'Streptopelia tranquebarica',
    description: '小型鳩鴿，雄鳥頭部和胸部呈紅褐色，雌鳥則為灰褐色。',
    rarity: 'common',
    habitats: ['grassland', 'farmland', 'urban'],
    size: 23,
    weight: 90,
    characteristics: ['雄鳥紅褐色', '雌鳥灰褐色', '體型較小'],
    behaviors: ['喜歡在地面覓食', '以種子為主食', '常成對活動'],
    callDescription: '柔和的「咕嚕咕嚕」聲',
    imageUrl: '/assets/birds/red-collared-dove.jpg',
    discoveryPoints: 10
  },
  {
    id: 'bird_006',
    name: '大卷尾',
    scientificName: 'Dicrurus macrocercus',
    description: '全身黑色，尾羽末端分叉如魚尾。性格兇猛，常驅趕其他鳥類。',
    rarity: 'common',
    habitats: ['farmland', 'forest', 'urban'],
    size: 28,
    weight: 50,
    characteristics: ['全身黑色', '魚尾狀尾羽', '性格兇猛'],
    behaviors: ['善於空中捕捉昆蟲', '領域性強', '會模仿其他鳥類'],
    callDescription: '多變的鳴叫聲',
    imageUrl: '/assets/birds/black-drongo.jpg',
    discoveryPoints: 10
  },

  // 不常見鳥類 (Uncommon) - 6種
  {
    id: 'bird_007',
    name: '五色鳥',
    scientificName: 'Psilopogon nuchalis',
    description: '台灣特有種，羽色鮮豔，有綠、藍、紅、黃、黑五種顏色。',
    rarity: 'uncommon',
    habitats: ['forest', 'mountain'],
    size: 20,
    weight: 70,
    characteristics: ['五彩羽毛', '粗壯的嘴', '會啄樹洞'],
    behaviors: ['以果實為主食', '在樹幹上啄洞築巢', '單調的敲木聲'],
    callDescription: '單調的「叩叩叩」敲木聲',
    imageUrl: '/assets/birds/taiwan-barbet.jpg',
    discoveryPoints: 30
  },
  {
    id: 'bird_008',
    name: '台灣藍鵲',
    scientificName: 'Urocissa caerulea',
    description: '台灣特有種，有「長尾山娘」之稱。羽色以藍色為主，尾羽特別長。',
    rarity: 'uncommon',
    habitats: ['forest', 'mountain'],
    size: 65,
    weight: 250,
    characteristics: ['藍色羽毛', '長尾羽', '紅色嘴和腳'],
    behaviors: ['群居性', '會合作育雛', '雜食性'],
    callDescription: '響亮的「嘎嘎嘎」叫聲',
    imageUrl: '/assets/birds/taiwan-blue-magpie.jpg',
    discoveryPoints: 30
  },
  {
    id: 'bird_009',
    name: '小彎嘴',
    scientificName: 'Pomatorhinus musicus',
    description: '台灣特有亞種，嘴部向下彎曲，常在灌叢中活動。',
    rarity: 'uncommon',
    habitats: ['forest', 'mountain', 'grassland'],
    size: 22,
    weight: 45,
    characteristics: ['彎曲的嘴', '褐色羽毛', '白色眉線'],
    behaviors: ['喜歡在地面覓食', '以昆蟲為主食', '鳴聲悅耳'],
    callDescription: '清脆的「吐米酒、吐米酒」叫聲',
    imageUrl: '/assets/birds/taiwan-scimitar-babbler.jpg',
    discoveryPoints: 30
  },
  {
    id: 'bird_010',
    name: '紅嘴黑鵯',
    scientificName: 'Hypsipetes leucocephalus',
    description: '台灣特有亞種，全身黑色，嘴和腳為紅色。',
    rarity: 'uncommon',
    habitats: ['forest', 'mountain'],
    size: 25,
    weight: 75,
    characteristics: ['全身黑色', '紅色嘴和腳', '常成群活動'],
    behaviors: ['喜歡吃果實', '常在果樹上覓食', '叫聲嘈雜'],
    callDescription: '嘈雜的「嘎啦嘎啦」聲',
    imageUrl: '/assets/birds/black-bulbul.jpg',
    discoveryPoints: 30
  },
  {
    id: 'bird_011',
    name: '樹鵲',
    scientificName: 'Dendrocitta formosae',
    description: '台灣特有亞種，體型修長，尾羽長。',
    rarity: 'uncommon',
    habitats: ['forest', 'mountain'],
    size: 40,
    weight: 110,
    characteristics: ['灰褐色羽毛', '長尾羽', '體型修長'],
    behaviors: ['雜食性', '會儲存食物', '常在樹冠層活動'],
    callDescription: '粗啞的「嘎嘎」聲',
    imageUrl: '/assets/birds/grey-treepie.jpg',
    discoveryPoints: 30
  },
  {
    id: 'bird_012',
    name: '冠羽畫眉',
    scientificName: 'Yuhina brunneiceps',
    description: '台灣特有種，頭頂有明顯的羽冠。',
    rarity: 'uncommon',
    habitats: ['forest', 'mountain'],
    size: 13,
    weight: 15,
    characteristics: ['頭頂羽冠', '褐色羽毛', '群居性'],
    behaviors: ['常成群活動', '在樹冠層覓食', '以昆蟲和果實為食'],
    callDescription: '細小的「嘰嘰」聲',
    imageUrl: '/assets/birds/taiwan-yuhina.jpg',
    discoveryPoints: 30
  },

  // 稀有鳥類 (Rare) - 4種
  {
    id: 'bird_013',
    name: '黑面琵鷺',
    scientificName: 'Platalea minor',
    description: '全球瀕危物種，每年冬天會來台灣度冬。嘴部扁平如琵琶。',
    rarity: 'rare',
    habitats: ['wetland', 'coast'],
    size: 75,
    weight: 1800,
    characteristics: ['白色羽毛', '黑色臉部', '琵琶狀嘴'],
    behaviors: ['在淺水區覓食', '左右搖擺嘴部捕魚', '群居性'],
    callDescription: '通常安靜',
    imageUrl: '/assets/birds/black-faced-spoonbill.jpg',
    discoveryPoints: 50
  },
  {
    id: 'bird_014',
    name: '帝雉',
    scientificName: 'Syrmaticus mikado',
    description: '台灣特有種，台灣國鳥。雄鳥羽色華麗，有藍黑色金屬光澤。',
    rarity: 'rare',
    habitats: ['mountain', 'forest'],
    size: 87,
    weight: 1100,
    characteristics: ['藍黑色金屬光澤', '長尾羽', '雄鳥羽色華麗'],
    behaviors: ['生性隱密', '主要在地面活動', '以植物嫩芽為食'],
    callDescription: '響亮的「嘓嘓嘓」叫聲',
    imageUrl: '/assets/birds/mikado-pheasant.jpg',
    discoveryPoints: 50
  },
  {
    id: 'bird_015',
    name: '黃山雀',
    scientificName: 'Machlolophus holsti',
    description: '台灣特有種，羽色鮮豔，頭部有黃色羽冠。',
    rarity: 'rare',
    habitats: ['mountain', 'forest'],
    size: 13,
    weight: 14,
    characteristics: ['黃色羽冠', '藍色翅膀', '活潑好動'],
    behaviors: ['活潑好動', '常倒掛在樹枝上', '以昆蟲為食'],
    callDescription: '清脆的「嘰嘰嘰」聲',
    imageUrl: '/assets/birds/yellow-tit.jpg',
    discoveryPoints: 50
  },
  {
    id: 'bird_016',
    name: '台灣噪眉',
    scientificName: 'Garrulax taewanus',
    description: '台灣特有種，體型較大的畫眉科鳥類。',
    rarity: 'rare',
    habitats: ['mountain', 'forest'],
    size: 27,
    weight: 80,
    characteristics: ['褐色羽毛', '白色眉線', '群居性'],
    behaviors: ['常成群活動', '在地面和灌叢中覓食', '叫聲響亮'],
    callDescription: '嘈雜的「嘎啦嘎啦」聲',
    imageUrl: '/assets/birds/taiwan-hwamei.jpg',
    discoveryPoints: 50
  },

  // 傳說鳥類 (Legendary) - 4種
  {
    id: 'bird_017',
    name: '藍腹鷴',
    scientificName: 'Lophura swinhoii',
    description: '台灣特有種，雄鳥羽色極為華麗，有藍色、白色和紅色。',
    rarity: 'legendary',
    habitats: ['mountain', 'forest'],
    size: 79,
    weight: 1200,
    characteristics: ['藍色羽毛', '白色背部', '紅色臉部'],
    behaviors: ['生性隱密', '清晨和黃昏活動', '以植物果實為食'],
    callDescription: '低沉的「咕咕咕」聲',
    imageUrl: '/assets/birds/swinhoes-pheasant.jpg',
    discoveryPoints: 100
  },
  {
    id: 'bird_018',
    name: '熊鷹',
    scientificName: 'Nisaetus nipalensis',
    description: '大型猛禽，台灣最大的留棲性猛禽之一。',
    rarity: 'legendary',
    habitats: ['mountain', 'forest'],
    size: 72,
    weight: 3000,
    characteristics: ['褐色羽毛', '頭部羽冠', '銳利的爪'],
    behaviors: ['在高空盤旋', '以中小型動物為食', '領域性強'],
    callDescription: '尖銳的「唧唧」聲',
    imageUrl: '/assets/birds/mountain-hawk-eagle.jpg',
    discoveryPoints: 100
  },
  {
    id: 'bird_019',
    name: '黃鸝',
    scientificName: 'Oriolus chinensis',
    description: '夏候鳥，雄鳥全身金黃色，眼部有黑色過眼線。',
    rarity: 'legendary',
    habitats: ['forest', 'mountain'],
    size: 26,
    weight: 70,
    characteristics: ['金黃色羽毛', '黑色過眼線', '鳴聲悅耳'],
    behaviors: ['喜歡在樹冠層活動', '以昆蟲和果實為食', '鳴聲動聽'],
    callDescription: '悅耳的「嘓哩嘓哩」聲',
    imageUrl: '/assets/birds/black-naped-oriole.jpg',
    discoveryPoints: 100
  },
  {
    id: 'bird_020',
    name: '朱鸝',
    scientificName: 'Oriolus traillii',
    description: '台灣稀有的夏候鳥，雄鳥羽色鮮紅，極為罕見。',
    rarity: 'legendary',
    habitats: ['forest', 'mountain'],
    size: 27,
    weight: 75,
    characteristics: ['鮮紅色羽毛', '黑色翅膀', '極為罕見'],
    behaviors: ['生性隱密', '在濃密樹冠層活動', '以昆蟲為食'],
    callDescription: '清脆的鳴叫聲',
    imageUrl: '/assets/birds/maroon-oriole.jpg',
    discoveryPoints: 100
  }
];

/**
 * 根據稀有度獲取鳥類
 */
export function getBirdsByRarity(rarity: 'common' | 'uncommon' | 'rare' | 'legendary'): SimpleBirdData[] {
  return EXTENDED_TAIWAN_BIRDS.filter(bird => bird.rarity === rarity);
}

/**
 * 根據棲息地獲取鳥類
 */
export function getBirdsByHabitat(habitat: string): SimpleBirdData[] {
  return EXTENDED_TAIWAN_BIRDS.filter(bird => bird.habitats.includes(habitat));
}

/**
 * 隨機獲取鳥類
 */
export function getRandomBirds(count: number, rarity?: 'common' | 'uncommon' | 'rare' | 'legendary'): SimpleBirdData[] {
  const pool = rarity ? getBirdsByRarity(rarity) : EXTENDED_TAIWAN_BIRDS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * 獲取所有鳥類數量統計
 */
export function getBirdStats() {
  return {
    total: EXTENDED_TAIWAN_BIRDS.length,
    common: getBirdsByRarity('common').length,
    uncommon: getBirdsByRarity('uncommon').length,
    rare: getBirdsByRarity('rare').length,
    legendary: getBirdsByRarity('legendary').length
  };
}

// Made with Bob
