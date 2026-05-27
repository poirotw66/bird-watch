import { Habitat } from '../types';

/**
 * 地圖區域資料介面
 */
export interface MapArea {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  habitat: Habitat;
  width: number;
  height: number;
  backgroundColor: string;
  groundColor: string;
  // 可出現的鳥類稀有度權重
  rarityWeights: {
    common: number;
    uncommon: number;
    rare: number;
    legendary: number;
  };
  // 鳥類數量範圍
  birdCountRange: [number, number];
  // 連接的區域
  connections: {
    direction: 'north' | 'south' | 'east' | 'west';
    targetAreaId: string;
    position: { x: number; y: number };
  }[];
  // 特殊物件（樹木、水域等）
  objects: {
    type: 'tree' | 'water' | 'rock' | 'grass';
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

/**
 * 所有地圖區域
 */
export const MAP_AREAS: MapArea[] = [
  {
    id: 'forest',
    name: '森林區',
    nameEn: 'Forest Area',
    description: '茂密的森林，是許多鳥類的棲息地。常見樹棲鳥類和森林鳥類。',
    habitat: 'forest',
    width: 1600,
    height: 1200,
    backgroundColor: '#2d5016',
    groundColor: '#4a7c2c',
    rarityWeights: {
      common: 50,
      uncommon: 30,
      rare: 15,
      legendary: 5,
    },
    birdCountRange: [8, 12],
    connections: [
      {
        direction: 'east',
        targetAreaId: 'wetland',
        position: { x: 1550, y: 600 },
      },
      {
        direction: 'south',
        targetAreaId: 'grassland',
        position: { x: 800, y: 1150 },
      },
    ],
    objects: [
      { type: 'tree', x: 200, y: 200, width: 80, height: 120 },
      { type: 'tree', x: 400, y: 300, width: 80, height: 120 },
      { type: 'tree', x: 600, y: 150, width: 80, height: 120 },
      { type: 'tree', x: 800, y: 400, width: 80, height: 120 },
      { type: 'tree', x: 1000, y: 250, width: 80, height: 120 },
      { type: 'tree', x: 1200, y: 500, width: 80, height: 120 },
      { type: 'tree', x: 300, y: 700, width: 80, height: 120 },
      { type: 'tree', x: 700, y: 800, width: 80, height: 120 },
      { type: 'tree', x: 1100, y: 900, width: 80, height: 120 },
      { type: 'grass', x: 100, y: 500, width: 150, height: 100 },
      { type: 'grass', x: 900, y: 600, width: 150, height: 100 },
      { type: 'rock', x: 500, y: 600, width: 60, height: 40 },
    ],
  },
  {
    id: 'wetland',
    name: '濕地區',
    nameEn: 'Wetland Area',
    description: '水域豐富的濕地，吸引許多水鳥和涉禽。',
    habitat: 'wetland',
    width: 1600,
    height: 1200,
    backgroundColor: '#4a7ba7',
    groundColor: '#6b9dc9',
    rarityWeights: {
      common: 40,
      uncommon: 35,
      rare: 20,
      legendary: 5,
    },
    birdCountRange: [10, 15],
    connections: [
      {
        direction: 'west',
        targetAreaId: 'forest',
        position: { x: 50, y: 600 },
      },
      {
        direction: 'south',
        targetAreaId: 'coast',
        position: { x: 800, y: 1150 },
      },
    ],
    objects: [
      { type: 'water', x: 200, y: 300, width: 400, height: 300 },
      { type: 'water', x: 800, y: 200, width: 500, height: 400 },
      { type: 'water', x: 300, y: 700, width: 600, height: 350 },
      { type: 'grass', x: 100, y: 150, width: 200, height: 100 },
      { type: 'grass', x: 700, y: 100, width: 200, height: 100 },
      { type: 'grass', x: 1200, y: 500, width: 200, height: 100 },
      { type: 'grass', x: 150, y: 650, width: 150, height: 80 },
      { type: 'rock', x: 650, y: 400, width: 80, height: 50 },
      { type: 'rock', x: 1000, y: 700, width: 80, height: 50 },
    ],
  },
  {
    id: 'grassland',
    name: '草原區',
    nameEn: 'Grassland Area',
    description: '開闊的草原，適合觀察地棲鳥類和猛禽。',
    habitat: 'grassland',
    width: 1600,
    height: 1200,
    backgroundColor: '#8b7355',
    groundColor: '#a89968',
    rarityWeights: {
      common: 45,
      uncommon: 30,
      rare: 20,
      legendary: 5,
    },
    birdCountRange: [6, 10],
    connections: [
      {
        direction: 'north',
        targetAreaId: 'forest',
        position: { x: 800, y: 50 },
      },
      {
        direction: 'east',
        targetAreaId: 'mountain',
        position: { x: 1550, y: 600 },
      },
    ],
    objects: [
      { type: 'grass', x: 200, y: 300, width: 200, height: 150 },
      { type: 'grass', x: 600, y: 200, width: 250, height: 180 },
      { type: 'grass', x: 1000, y: 400, width: 200, height: 150 },
      { type: 'grass', x: 300, y: 700, width: 300, height: 200 },
      { type: 'grass', x: 800, y: 800, width: 250, height: 180 },
      { type: 'grass', x: 1200, y: 600, width: 200, height: 150 },
      { type: 'rock', x: 400, y: 500, width: 70, height: 45 },
      { type: 'rock', x: 900, y: 300, width: 70, height: 45 },
      { type: 'rock', x: 1300, y: 900, width: 70, height: 45 },
      { type: 'tree', x: 150, y: 150, width: 60, height: 90 },
      { type: 'tree', x: 1400, y: 200, width: 60, height: 90 },
    ],
  },
  {
    id: 'mountain',
    name: '山區',
    nameEn: 'Mountain Area',
    description: '高海拔山區，可以發現稀有的高山鳥類。',
    habitat: 'mountain',
    width: 1600,
    height: 1200,
    backgroundColor: '#5a5a5a',
    groundColor: '#7a7a7a',
    rarityWeights: {
      common: 20,
      uncommon: 30,
      rare: 35,
      legendary: 15,
    },
    birdCountRange: [5, 8],
    connections: [
      {
        direction: 'west',
        targetAreaId: 'grassland',
        position: { x: 50, y: 600 },
      },
    ],
    objects: [
      { type: 'rock', x: 200, y: 300, width: 150, height: 100 },
      { type: 'rock', x: 500, y: 200, width: 200, height: 150 },
      { type: 'rock', x: 900, y: 400, width: 180, height: 120 },
      { type: 'rock', x: 1200, y: 250, width: 150, height: 100 },
      { type: 'rock', x: 300, y: 700, width: 200, height: 150 },
      { type: 'rock', x: 700, y: 800, width: 180, height: 120 },
      { type: 'rock', x: 1100, y: 900, width: 150, height: 100 },
      { type: 'tree', x: 400, y: 600, width: 50, height: 75 },
      { type: 'tree', x: 1000, y: 700, width: 50, height: 75 },
      { type: 'grass', x: 150, y: 500, width: 100, height: 70 },
      { type: 'grass', x: 800, y: 600, width: 100, height: 70 },
    ],
  },
  {
    id: 'coast',
    name: '海岸區',
    nameEn: 'Coastal Area',
    description: '海岸線區域，可以觀察到海鳥和候鳥。',
    habitat: 'coast',
    width: 1600,
    height: 1200,
    backgroundColor: '#87ceeb',
    groundColor: '#f4a460',
    rarityWeights: {
      common: 35,
      uncommon: 35,
      rare: 25,
      legendary: 5,
    },
    birdCountRange: [8, 12],
    connections: [
      {
        direction: 'north',
        targetAreaId: 'wetland',
        position: { x: 800, y: 50 },
      },
    ],
    objects: [
      { type: 'water', x: 0, y: 0, width: 1600, height: 400 },
      { type: 'rock', x: 200, y: 350, width: 100, height: 60 },
      { type: 'rock', x: 600, y: 320, width: 120, height: 70 },
      { type: 'rock', x: 1000, y: 300, width: 100, height: 60 },
      { type: 'rock', x: 1400, y: 350, width: 80, height: 50 },
      { type: 'grass', x: 300, y: 600, width: 200, height: 150 },
      { type: 'grass', x: 800, y: 700, width: 250, height: 180 },
      { type: 'grass', x: 1200, y: 800, width: 200, height: 150 },
      { type: 'rock', x: 500, y: 900, width: 70, height: 45 },
      { type: 'rock', x: 1000, y: 1000, width: 70, height: 45 },
    ],
  },
];

/**
 * 根據 ID 取得地圖區域
 */
export function getMapAreaById(id: string): MapArea | undefined {
  return MAP_AREAS.find((area) => area.id === id);
}

/**
 * 取得起始地圖區域
 */
export function getStartingArea(): MapArea {
  return MAP_AREAS[0]; // 森林區
}

/**
 * 根據棲息地類型取得地圖區域
 */
export function getMapAreasByHabitat(habitat: Habitat): MapArea[] {
  return MAP_AREAS.filter((area) => area.habitat === habitat);
}

// Made with Bob
