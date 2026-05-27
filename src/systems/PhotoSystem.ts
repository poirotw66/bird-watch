import { SimpleBirdData } from '@/data/simpleBirds';
import { eventBus, GameEvents } from '@/core/EventSystem';

/**
 * 照片品質
 */
export type PhotoQuality = 'poor' | 'good' | 'excellent';

/**
 * 照片記錄
 */
export interface PhotoRecord {
  id: string;
  birdId: string;
  birdName: string;
  timestamp: Date;
  quality: PhotoQuality;
  distance: number;
  angle: number; // 拍攝角度
  lighting: number; // 光線品質 (0-1)
  focus: number; // 對焦品質 (0-1)
  composition: number; // 構圖品質 (0-1)
  score: number; // 總分 (0-100)
  points: number; // 獲得的點數
}

/**
 * 拍照系統
 * 處理鳥類拍照和照片管理
 */
export class PhotoSystem {
  private static instance: PhotoSystem;
  private photos: PhotoRecord[] = [];
  private nextPhotoId: number = 1;

  private constructor() {}

  /**
   * 獲取單例實例
   */
  public static getInstance(): PhotoSystem {
    if (!PhotoSystem.instance) {
      PhotoSystem.instance = new PhotoSystem();
    }
    return PhotoSystem.instance;
  }

  /**
   * 拍攝照片
   */
  public takePhoto(
    birdData: SimpleBirdData,
    distance: number,
    playerAngle: number = 0
  ): PhotoRecord {
    // 計算各項品質指標
    const lighting = this.calculateLighting();
    const focus = this.calculateFocus(distance);
    const composition = this.calculateComposition(distance, playerAngle);
    
    // 計算總分
    const score = this.calculateScore(distance, lighting, focus, composition);
    
    // 判斷品質等級
    const quality = this.determineQuality(score);
    
    // 計算獲得的點數
    const points = this.calculatePoints(birdData, quality, score);

    const photo: PhotoRecord = {
      id: `photo_${this.nextPhotoId++}`,
      birdId: birdData.id,
      birdName: birdData.name,
      timestamp: new Date(),
      quality,
      distance,
      angle: playerAngle,
      lighting,
      focus,
      composition,
      score,
      points
    };

    this.photos.push(photo);

    console.log(`📸 拍攝照片: ${birdData.name}`);
    console.log(`   品質: ${quality}, 分數: ${score}, 點數: +${points}`);

    // 發送事件
    eventBus.emit(GameEvents.BIRD_PHOTOGRAPHED, {
      birdId: birdData.id,
      birdName: birdData.name,
      quality,
      score,
      points
    });

    return photo;
  }

  /**
   * 計算光線品質
   */
  private calculateLighting(): number {
    // 簡化版：隨機生成，實際應該根據遊戲時間和天氣
    return 0.6 + Math.random() * 0.4;
  }

  /**
   * 計算對焦品質
   */
  private calculateFocus(distance: number): number {
    // 距離越近，對焦越好
    if (distance < 30) {
      return 0.9 + Math.random() * 0.1;
    } else if (distance < 60) {
      return 0.7 + Math.random() * 0.2;
    } else if (distance < 100) {
      return 0.5 + Math.random() * 0.3;
    } else {
      return 0.3 + Math.random() * 0.3;
    }
  }

  /**
   * 計算構圖品質
   */
  private calculateComposition(distance: number, angle: number): number {
    let score = 0.5;

    // 距離適中加分
    if (distance >= 40 && distance <= 80) {
      score += 0.3;
    }

    // 角度適中加分（正面或側面）
    const normalizedAngle = Math.abs(angle % 180);
    if (normalizedAngle < 30 || normalizedAngle > 150) {
      score += 0.2;
    }

    return Math.min(1, score);
  }

  /**
   * 計算總分
   */
  private calculateScore(
    distance: number,
    lighting: number,
    focus: number,
    composition: number
  ): number {
    // 距離評分 (0-30分)
    let distanceScore = 0;
    if (distance < 30) {
      distanceScore = 30;
    } else if (distance < 60) {
      distanceScore = 25;
    } else if (distance < 100) {
      distanceScore = 15;
    } else {
      distanceScore = 5;
    }

    // 各項品質評分
    const lightingScore = lighting * 20;
    const focusScore = focus * 30;
    const compositionScore = composition * 20;

    const total = distanceScore + lightingScore + focusScore + compositionScore;
    return Math.round(total);
  }

  /**
   * 判斷品質等級
   */
  private determineQuality(score: number): PhotoQuality {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'poor';
  }

  /**
   * 計算獲得的點數
   */
  private calculatePoints(
    birdData: SimpleBirdData,
    quality: PhotoQuality,
    score: number
  ): number {
    let points = birdData.discoveryPoints;

    // 品質加成
    switch (quality) {
      case 'excellent':
        points *= 2;
        break;
      case 'good':
        points *= 1.5;
        break;
      case 'poor':
        points *= 1;
        break;
    }

    // 分數加成
    points *= (score / 100);

    return Math.floor(points);
  }

  /**
   * 獲取所有照片
   */
  public getPhotos(): PhotoRecord[] {
    return [...this.photos];
  }

  /**
   * 獲取特定鳥類的照片
   */
  public getPhotosByBird(birdId: string): PhotoRecord[] {
    return this.photos.filter(photo => photo.birdId === birdId);
  }

  /**
   * 獲取最佳照片
   */
  public getBestPhoto(birdId?: string): PhotoRecord | null {
    const photos = birdId 
      ? this.getPhotosByBird(birdId)
      : this.photos;

    if (photos.length === 0) return null;

    return photos.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }

  /**
   * 獲取照片統計
   */
  public getStats(): {
    totalPhotos: number;
    excellentPhotos: number;
    goodPhotos: number;
    poorPhotos: number;
    averageScore: number;
    totalPoints: number;
  } {
    const total = this.photos.length;
    const excellent = this.photos.filter(p => p.quality === 'excellent').length;
    const good = this.photos.filter(p => p.quality === 'good').length;
    const poor = this.photos.filter(p => p.quality === 'poor').length;
    
    const averageScore = total > 0
      ? this.photos.reduce((sum, p) => sum + p.score, 0) / total
      : 0;
    
    const totalPoints = this.photos.reduce((sum, p) => sum + p.points, 0);

    return {
      totalPhotos: total,
      excellentPhotos: excellent,
      goodPhotos: good,
      poorPhotos: poor,
      averageScore: Math.round(averageScore),
      totalPoints
    };
  }

  /**
   * 刪除照片
   */
  public deletePhoto(photoId: string): boolean {
    const index = this.photos.findIndex(p => p.id === photoId);
    if (index > -1) {
      this.photos.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 清除所有照片
   */
  public clear(): void {
    this.photos = [];
    this.nextPhotoId = 1;
  }
}

// 導出單例實例
export const photoSystem = PhotoSystem.getInstance();

// Made with Bob
