import { BirdType, Rarity, TimeOfDay, Weather, Season } from '@/types';

/**
 * 鳥類物理特徵
 */
export interface PhysicalFeatures {
  size: {
    length: { min: number; max: number; unit: 'cm' };
    wingspan: { min: number; max: number; unit: 'cm' };
    weight: { min: number; max: number; unit: 'g' };
  };
  plumage: {
    male: string;
    female: string;
    juvenile?: string;
  };
  distinctiveFeatures: string[];
}

/**
 * 識別資訊
 */
export interface IdentificationInfo {
  difficulty: number; // 1-10
  keyFeatures: string[];
  similarSpecies: string[];
  fieldMarks: {
    head: string;
    body: string;
    wings: string;
    tail: string;
    legs: string;
    beak: string;
  };
}

/**
 * 行為特徵
 */
export interface BehaviorInfo {
  habitat: string[];
  diet: string[];
  feeding: string;
  flightPattern: string;
  vocalization: {
    call: string;
    song: string;
  };
  breeding: {
    season: string;
    nest: string;
    eggs: number;
  };
}

/**
 * 分布資訊
 */
export interface DistributionInfo {
  range: string;
  altitude: { min: number; max: number; unit: 'm' };
  seasonality: {
    spring: boolean;
    summer: boolean;
    autumn: boolean;
    winter: boolean;
  };
}

/**
 * 媒體資源
 */
export interface MediaResources {
  images: {
    url: string;
    source: string;
    license: string;
    author: string;
  }[];
  sounds: {
    url: string;
    type: 'call' | 'song' | 'alarm';
    source: string;
    recordist: string;
  }[];
}

/**
 * 遊戲資料
 */
export interface GameData {
  points: number;
  experienceReward: number;
  spawnWeight: number;
  spawnConditions: {
    habitats: string[];
    timeOfDay: TimeOfDay[];
    weather: Weather[];
    season: Season[];
  };
}

/**
 * 鳥類資料介面
 */
export interface BirdData {
  id: string;
  species: {
    commonName: string;
    scientificName: string;
    family: string;
    order: string;
  };

  classification: {
    type: BirdType;
    rarity: Rarity;
    conservationStatus: string;
  };

  physical: PhysicalFeatures;
  identification: IdentificationInfo;
  behavior: BehaviorInfo;
  distribution: DistributionInfo;
  media: MediaResources;
  gameData: GameData;
}

/**
 * 鳥類觀察記錄
 */
export interface BirdObservation {
  birdId: string;
  timestamp: Date;
  location: string;
  habitat: string;
  weather: Weather;
  timeOfDay: TimeOfDay;
  photoQuality?: 'poor' | 'good' | 'excellent';
  notes: string;
}

/**
 * 圖鑑條目
 */
export interface PokedexEntry {
  birdId: string;
  unlocked: boolean;
  firstSeen: Date | null;
  totalSightings: number;
  observations: BirdObservation[];
  bestPhoto: string | null;
  identificationAccuracy: number; // 0-1
}

// Made with Bob
