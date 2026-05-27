import { SimpleBirdData } from '@/data/simpleBirds';
import { eventBus, GameEvents } from '@/core/EventSystem';

/**
 * 觀察記錄
 */
export interface ObservationRecord {
  birdId: string;
  birdName: string;
  timestamp: Date;
  distance: number; // 觀察距離
  duration: number; // 觀察時長（秒）
  quality: 'poor' | 'good' | 'excellent'; // 觀察品質
  identified: boolean; // 是否成功識別
  points: number; // 獲得的點數
}

/**
 * 觀察系統
 * 處理鳥類觀察、識別和記錄
 */
export class ObservationSystem {
  private static instance: ObservationSystem;
  private observations: ObservationRecord[] = [];
  private currentObservation: {
    birdId: string;
    birdData: SimpleBirdData;
    startTime: number;
    distance: number;
  } | null = null;

  private constructor() {}

  /**
   * 獲取單例實例
   */
  public static getInstance(): ObservationSystem {
    if (!ObservationSystem.instance) {
      ObservationSystem.instance = new ObservationSystem();
    }
    return ObservationSystem.instance;
  }

  /**
   * 開始觀察鳥類
   */
  public startObservation(birdData: SimpleBirdData, distance: number): void {
    if (this.currentObservation) {
      console.warn('已經在觀察另一隻鳥類');
      return;
    }

    this.currentObservation = {
      birdId: birdData.id,
      birdData,
      startTime: Date.now(),
      distance
    };

    console.log(`🔍 開始觀察: ${birdData.name} (距離: ${Math.floor(distance)}m)`);
    
    eventBus.emit(GameEvents.BIRD_OBSERVED, {
      birdId: birdData.id,
      birdName: birdData.name
    });
  }

  /**
   * 結束觀察
   */
  public endObservation(): ObservationRecord | null {
    if (!this.currentObservation) {
      return null;
    }

    const duration = (Date.now() - this.currentObservation.startTime) / 1000;
    const { birdId, birdData, distance } = this.currentObservation;

    // 計算觀察品質
    const quality = this.calculateQuality(distance, duration);
    
    // 判斷是否成功識別
    const identified = this.checkIdentification(quality, duration);
    
    // 計算獲得的點數
    const points = this.calculatePoints(birdData, quality, identified);

    const record: ObservationRecord = {
      birdId,
      birdName: birdData.name,
      timestamp: new Date(),
      distance,
      duration,
      quality,
      identified,
      points
    };

    this.observations.push(record);
    this.currentObservation = null;

    console.log(`✅ 觀察完成: ${birdData.name}`);
    console.log(`   品質: ${quality}, 識別: ${identified ? '成功' : '失敗'}, 點數: +${points}`);

    // 發送事件
    if (identified) {
      eventBus.emit(GameEvents.BIRD_IDENTIFIED, {
        birdId,
        birdName: birdData.name,
        points
      });
    }

    return record;
  }

  /**
   * 取消觀察
   */
  public cancelObservation(): void {
    if (this.currentObservation) {
      console.log(`❌ 取消觀察: ${this.currentObservation.birdData.name}`);
      this.currentObservation = null;
    }
  }

  /**
   * 計算觀察品質
   */
  private calculateQuality(distance: number, duration: number): 'poor' | 'good' | 'excellent' {
    // 距離越近、時間越長，品質越好
    let score = 0;

    // 距離評分 (0-50分)
    if (distance < 30) {
      score += 50;
    } else if (distance < 60) {
      score += 30;
    } else if (distance < 100) {
      score += 10;
    }

    // 時長評分 (0-50分)
    if (duration >= 5) {
      score += 50;
    } else if (duration >= 3) {
      score += 30;
    } else if (duration >= 1) {
      score += 10;
    }

    if (score >= 70) return 'excellent';
    if (score >= 40) return 'good';
    return 'poor';
  }

  /**
   * 檢查是否成功識別
   */
  private checkIdentification(quality: string, duration: number): boolean {
    // 品質越好、時間越長，識別成功率越高
    let chance = 0;

    switch (quality) {
      case 'excellent':
        chance = 0.95;
        break;
      case 'good':
        chance = 0.7;
        break;
      case 'poor':
        chance = 0.3;
        break;
    }

    // 時長加成
    if (duration >= 5) {
      chance = Math.min(1, chance + 0.1);
    }

    return Math.random() < chance;
  }

  /**
   * 計算獲得的點數
   */
  private calculatePoints(
    birdData: SimpleBirdData,
    quality: string,
    identified: boolean
  ): number {
    let points = birdData.discoveryPoints;

    // 品質加成
    switch (quality) {
      case 'excellent':
        points *= 1.5;
        break;
      case 'good':
        points *= 1.2;
        break;
      case 'poor':
        points *= 0.8;
        break;
    }

    // 識別失敗減半
    if (!identified) {
      points *= 0.5;
    }

    return Math.floor(points);
  }

  /**
   * 獲取當前觀察
   */
  public getCurrentObservation(): {
    birdId: string;
    birdData: SimpleBirdData;
    startTime: number;
    distance: number;
  } | null {
    return this.currentObservation;
  }

  /**
   * 獲取觀察時長
   */
  public getObservationDuration(): number {
    if (!this.currentObservation) return 0;
    return (Date.now() - this.currentObservation.startTime) / 1000;
  }

  /**
   * 是否正在觀察
   */
  public isObserving(): boolean {
    return this.currentObservation !== null;
  }

  /**
   * 獲取所有觀察記錄
   */
  public getObservations(): ObservationRecord[] {
    return [...this.observations];
  }

  /**
   * 獲取特定鳥類的觀察記錄
   */
  public getObservationsByBird(birdId: string): ObservationRecord[] {
    return this.observations.filter(obs => obs.birdId === birdId);
  }

  /**
   * 獲取觀察統計
   */
  public getStats(): {
    totalObservations: number;
    successfulIdentifications: number;
    totalPoints: number;
    averageQuality: number;
  } {
    const total = this.observations.length;
    const successful = this.observations.filter(obs => obs.identified).length;
    const totalPoints = this.observations.reduce((sum, obs) => sum + obs.points, 0);
    
    const qualityScores = this.observations.map(obs => {
      switch (obs.quality) {
        case 'excellent': return 3;
        case 'good': return 2;
        case 'poor': return 1;
        default: return 0;
      }
    });
    const averageQuality = total > 0
      ? qualityScores.reduce((sum: number, score) => sum + score, 0) / total
      : 0;

    return {
      totalObservations: total,
      successfulIdentifications: successful,
      totalPoints,
      averageQuality
    };
  }

  /**
   * 清除所有記錄
   */
  public clear(): void {
    this.observations = [];
    this.currentObservation = null;
  }
}

// 導出單例實例
export const observationSystem = ObservationSystem.getInstance();

// Made with Bob
