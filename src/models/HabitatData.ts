import { TimeOfDay, Weather, Season } from '@/types';

/**
 * 棲息地資料
 */
export interface HabitatData {
  id: string;
  name: string;
  description: string;
  type: 'urban' | 'forest' | 'wetland' | 'mountain' | 'coastal';
  
  // 地理資訊
  location: {
    region: string;
    coordinates?: { lat: number; lng: number };
    altitude: { min: number; max: number; unit: 'm' };
  };
  
  // 環境特徵
  environment: {
    climate: string;
    vegetation: string[];
    waterSources: string[];
    terrain: string;
  };
  
  // 鳥類資訊
  birds: {
    commonSpecies: string[]; // 常見物種 ID
    rareSpecies: string[]; // 稀有物種 ID
    seasonalSpecies: {
      spring: string[];
      summer: string[];
      autumn: string[];
      winter: string[];
    };
  };
  
  // 遊戲資料
  gameData: {
    unlocked: boolean;
    unlockRequirement?: {
      level?: number;
      questId?: string;
      coins?: number;
    };
    difficulty: number; // 1-10
    size: { width: number; height: number }; // 地圖大小
    spawnPoints: { x: number; y: number }[]; // 鳥類生成點
    landmarks: {
      id: string;
      name: string;
      type: 'viewpoint' | 'rest' | 'shop' | 'info';
      position: { x: number; y: number };
    }[];
  };
  
  // 視覺資料
  visual: {
    backgroundImage: string;
    ambientColor: string;
    weatherEffects: Weather[];
    timeEffects: TimeOfDay[];
  };
  
  // 音訊資料
  audio: {
    ambientSound: string;
    musicTrack?: string;
  };
}

/**
 * 棲息地類別
 */
export class Habitat {
  private data: HabitatData;

  constructor(data: HabitatData) {
    this.data = data;
  }

  /**
   * 獲取棲息地資料
   */
  public getData(): Readonly<HabitatData> {
    return this.data;
  }

  /**
   * 檢查是否已解鎖
   */
  public isUnlocked(): boolean {
    return this.data.gameData.unlocked;
  }

  /**
   * 解鎖棲息地
   */
  public unlock(): void {
    this.data.gameData.unlocked = true;
  }

  /**
   * 檢查解鎖需求
   */
  public canUnlock(playerLevel: number, completedQuests: string[], coins: number): boolean {
    if (this.isUnlocked()) {
      return false;
    }

    const req = this.data.gameData.unlockRequirement;
    if (!req) {
      return true;
    }

    if (req.level && playerLevel < req.level) {
      return false;
    }

    if (req.questId && !completedQuests.includes(req.questId)) {
      return false;
    }

    if (req.coins && coins < req.coins) {
      return false;
    }

    return true;
  }

  /**
   * 獲取當前季節的鳥類
   */
  public getBirdsForSeason(season: Season): string[] {
    const common = this.data.birds.commonSpecies;
    const seasonal = this.data.birds.seasonalSpecies[season];
    return [...common, ...seasonal];
  }

  /**
   * 獲取所有可能出現的鳥類
   */
  public getAllBirds(): string[] {
    const allBirds = new Set<string>();
    
    this.data.birds.commonSpecies.forEach((id) => allBirds.add(id));
    this.data.birds.rareSpecies.forEach((id) => allBirds.add(id));
    
    Object.values(this.data.birds.seasonalSpecies).forEach((birds) => {
      birds.forEach((id) => allBirds.add(id));
    });
    
    return Array.from(allBirds);
  }

  /**
   * 檢查鳥類是否在此棲息地出現
   */
  public hasBird(birdId: string): boolean {
    return this.getAllBirds().includes(birdId);
  }

  /**
   * 獲取地標
   */
  public getLandmark(id: string): HabitatData['gameData']['landmarks'][0] | undefined {
    return this.data.gameData.landmarks.find((l) => l.id === id);
  }

  /**
   * 獲取隨機生成點
   */
  public getRandomSpawnPoint(): { x: number; y: number } {
    const points = this.data.gameData.spawnPoints;
    return points[Math.floor(Math.random() * points.length)];
  }
}

// Made with Bob
