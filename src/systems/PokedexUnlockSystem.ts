import { SimpleBirdData } from '@/data/simpleBirds';
import { pokedexSystem } from '@/systems/PokedexSystem';
import { observationSystem } from '@/systems/ObservationSystem';
import { photoSystem } from '@/systems/PhotoSystem';
import { getTaiwanBirdById } from '@/data/taiwanBirdCatalog';
import { eventBus, GameEvents } from '@/core/EventSystem';
import { gameState } from '@/core/GameState';

/**
 * 圖鑑解鎖條件
 */
export interface UnlockCondition {
  minObservations: number; // 最少觀察次數
  minPhotos: number; // 最少拍照次數
  minPhotoQuality: 'poor' | 'good' | 'excellent'; // 最低照片品質
  requireIdentification: boolean; // 是否需要成功識別
}

/**
 * 圖鑑解鎖系統
 * 根據觀察和拍照記錄自動解鎖圖鑑
 */
export class PokedexUnlockSystem {
  private static instance: PokedexUnlockSystem;
  private unlockConditions: Map<string, UnlockCondition> = new Map();

  private constructor() {
    this.setupDefaultConditions();
    this.setupEventListeners();
  }

  /**
   * 獲取單例實例
   */
  public static getInstance(): PokedexUnlockSystem {
    if (!PokedexUnlockSystem.instance) {
      PokedexUnlockSystem.instance = new PokedexUnlockSystem();
    }
    return PokedexUnlockSystem.instance;
  }

  /**
   * 設定預設解鎖條件
   */
  private setupDefaultConditions(): void {
    // 常見鳥類：只需觀察一次
    this.setUnlockCondition('common', {
      minObservations: 1,
      minPhotos: 0,
      minPhotoQuality: 'poor',
      requireIdentification: false
    });

    // 不常見鳥類：需要觀察並拍照
    this.setUnlockCondition('uncommon', {
      minObservations: 1,
      minPhotos: 1,
      minPhotoQuality: 'poor',
      requireIdentification: true
    });

    // 稀有鳥類：需要多次觀察和良好照片
    this.setUnlockCondition('rare', {
      minObservations: 2,
      minPhotos: 1,
      minPhotoQuality: 'good',
      requireIdentification: true
    });

    // 傳說鳥類：需要多次觀察和優秀照片
    this.setUnlockCondition('legendary', {
      minObservations: 3,
      minPhotos: 2,
      minPhotoQuality: 'excellent',
      requireIdentification: true
    });
  }

  /**
   * 設定解鎖條件
   */
  public setUnlockCondition(rarity: string, condition: UnlockCondition): void {
    this.unlockConditions.set(rarity, condition);
  }

  /**
   * 設定事件監聽器
   */
  private setupEventListeners(): void {
    // 監聽鳥類識別事件
    eventBus.on(GameEvents.BIRD_IDENTIFIED, (data) => {
      this.checkUnlock(data.birdId);
    });

    // 監聽拍照事件
    eventBus.on(GameEvents.BIRD_PHOTOGRAPHED, (data) => {
      this.checkUnlock(data.birdId);
    });
  }

  /**
   * 檢查是否可以解鎖圖鑑
   */
  public checkUnlock(birdId: string): boolean {
    // 如果已經解鎖，直接返回
    const entry = pokedexSystem.getEntry(birdId);
    if (entry && entry.unlocked) {
      return false;
    }

    // 獲取鳥類資料（這裡需要從某處獲取，暫時返回 false）
    // TODO: 需要一個全局的鳥類資料管理器
    const birdData = this.getBirdData(birdId);
    if (!birdData) {
      return false;
    }

    // 獲取解鎖條件
    const condition = this.unlockConditions.get(birdData.rarity);
    if (!condition) {
      return false;
    }

    // 檢查觀察記錄
    const observations = observationSystem.getObservationsByBird(birdId);
    const identifiedObservations = observations.filter(obs => obs.identified);

    if (observations.length < condition.minObservations) {
      return false;
    }

    if (condition.requireIdentification && identifiedObservations.length === 0) {
      return false;
    }

    // 檢查照片記錄
    const photos = photoSystem.getPhotosByBird(birdId);
    if (photos.length < condition.minPhotos) {
      return false;
    }

    // 檢查照片品質
    if (condition.minPhotos > 0) {
      const qualityPhotos = photos.filter(photo => {
        switch (condition.minPhotoQuality) {
          case 'excellent':
            return photo.quality === 'excellent';
          case 'good':
            return photo.quality === 'good' || photo.quality === 'excellent';
          case 'poor':
            return true;
          default:
            return false;
        }
      });

      if (qualityPhotos.length === 0) {
        return false;
      }
    }

    // 解鎖圖鑑
    this.unlockPokedex(birdId, birdData);
    return true;
  }

  /**
   * 解鎖圖鑑
   */
  private unlockPokedex(birdId: string, birdData: SimpleBirdData): void {
    // 記錄發現
    pokedexSystem.discoverBird(birdId);

    // 獲取最佳照片
    const bestPhoto = photoSystem.getBestPhoto(birdId);

    // 更新玩家經驗值
    const player = gameState.getPlayer();
    if (player) {
      const expGain = birdData.discoveryPoints;
      player.addExperience(expGain);
      
      console.log(`🎉 圖鑑解鎖: ${birdData.name}`);
      console.log(`   經驗值: +${expGain}`);
      if (bestPhoto) {
        console.log(`   最佳照片分數: ${bestPhoto.score}`);
      }
    }

    // 發送解鎖事件
    eventBus.emit(GameEvents.BIRD_DISCOVERED, {
      birdId,
      birdName: birdData.name,
      rarity: birdData.rarity
    });
  }

  /**
   * 獲取鳥類資料
   * TODO: 這應該從全局資料管理器獲取
   */
  private getBirdData(birdId: string): SimpleBirdData | null {
    return getTaiwanBirdById(birdId) ?? null;
  }

  /**
   * 獲取解鎖進度
   */
  public getUnlockProgress(birdId: string): {
    observations: number;
    requiredObservations: number;
    identifications: number;
    photos: number;
    requiredPhotos: number;
    bestPhotoQuality: string;
    requiredPhotoQuality: string;
    canUnlock: boolean;
  } | null {
    const birdData = this.getBirdData(birdId);
    if (!birdData) return null;

    const condition = this.unlockConditions.get(birdData.rarity);
    if (!condition) return null;

    const observations = observationSystem.getObservationsByBird(birdId);
    const identifiedObservations = observations.filter(obs => obs.identified);
    const photos = photoSystem.getPhotosByBird(birdId);
    const bestPhoto = photoSystem.getBestPhoto(birdId);

    return {
      observations: observations.length,
      requiredObservations: condition.minObservations,
      identifications: identifiedObservations.length,
      photos: photos.length,
      requiredPhotos: condition.minPhotos,
      bestPhotoQuality: bestPhoto?.quality || 'none',
      requiredPhotoQuality: condition.minPhotoQuality,
      canUnlock: this.checkUnlock(birdId)
    };
  }
}

// 導出單例實例
export const pokedexUnlockSystem = PokedexUnlockSystem.getInstance();

// Made with Bob
