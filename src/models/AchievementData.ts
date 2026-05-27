import { AchievementCategory, AchievementRarity } from '@/types';

/**
 * 成就需求
 */
export interface AchievementRequirement {
  type: string;
  target: number;
  current: number;
  description: string;
}

/**
 * 成就獎勵
 */
export interface AchievementReward {
  points: number;
  title?: string;
  unlock?: string;
  coins?: number;
  gems?: number;
}

/**
 * 成就資料
 */
export interface AchievementData {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: string;
  
  requirement: AchievementRequirement;
  reward: AchievementReward;
  
  rarity: AchievementRarity;
  unlocked: boolean;
  unlockedDate?: Date;
  progress: number; // 0-100
  
  hidden: boolean; // 是否為隱藏成就
  secret: boolean; // 是否為秘密成就（不顯示需求）
}

/**
 * 成就類別
 */
export class Achievement {
  private data: AchievementData;

  constructor(data: AchievementData) {
    this.data = data;
  }

  /**
   * 獲取成就資料
   */
  public getData(): Readonly<AchievementData> {
    return this.data;
  }

  /**
   * 更新進度
   */
  public updateProgress(value: number): void {
    if (this.data.unlocked) {
      return;
    }

    this.data.requirement.current = Math.min(this.data.requirement.target, value);
    this.data.progress = (this.data.requirement.current / this.data.requirement.target) * 100;

    if (this.data.requirement.current >= this.data.requirement.target) {
      this.unlock();
    }
  }

  /**
   * 增加進度
   */
  public incrementProgress(amount: number = 1): void {
    this.updateProgress(this.data.requirement.current + amount);
  }

  /**
   * 解鎖成就
   */
  private unlock(): void {
    if (!this.data.unlocked) {
      this.data.unlocked = true;
      this.data.unlockedDate = new Date();
      this.data.progress = 100;
    }
  }

  /**
   * 檢查是否已解鎖
   */
  public isUnlocked(): boolean {
    return this.data.unlocked;
  }

  /**
   * 獲取進度百分比
   */
  public getProgressPercentage(): number {
    return this.data.progress;
  }

  /**
   * 獲取進度文字
   */
  public getProgressText(): string {
    return `${this.data.requirement.current}/${this.data.requirement.target}`;
  }

  /**
   * 創建新成就
   */
  public static create(config: Omit<AchievementData, 'unlocked' | 'progress'>): Achievement {
    const data: AchievementData = {
      ...config,
      unlocked: false,
      progress: 0,
    };
    return new Achievement(data);
  }
}

/**
 * 成就管理器
 */
export class AchievementManager {
  private achievements: Map<string, Achievement> = new Map();

  /**
   * 添加成就
   */
  public addAchievement(achievement: Achievement): void {
    this.achievements.set(achievement.getData().id, achievement);
  }

  /**
   * 獲取成就
   */
  public getAchievement(id: string): Achievement | undefined {
    return this.achievements.get(id);
  }

  /**
   * 獲取所有成就
   */
  public getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * 獲取已解鎖的成就
   */
  public getUnlockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter((a) => a.isUnlocked());
  }

  /**
   * 獲取未解鎖的成就
   */
  public getLockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter((a) => !a.isUnlocked());
  }

  /**
   * 根據類別獲取成就
   */
  public getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return this.getAllAchievements().filter((a) => a.getData().category === category);
  }

  /**
   * 根據稀有度獲取成就
   */
  public getAchievementsByRarity(rarity: AchievementRarity): Achievement[] {
    return this.getAllAchievements().filter((a) => a.getData().rarity === rarity);
  }

  /**
   * 更新成就進度
   */
  public updateAchievementProgress(id: string, value: number): void {
    const achievement = this.getAchievement(id);
    if (achievement) {
      achievement.updateProgress(value);
    }
  }

  /**
   * 增加成就進度
   */
  public incrementAchievementProgress(id: string, amount: number = 1): void {
    const achievement = this.getAchievement(id);
    if (achievement) {
      achievement.incrementProgress(amount);
    }
  }

  /**
   * 檢查並更新相關成就
   */
  public checkAchievements(type: string, value: number): Achievement[] {
    const unlockedAchievements: Achievement[] = [];

    for (const achievement of this.getAllAchievements()) {
      if (achievement.isUnlocked()) {
        continue;
      }

      const data = achievement.getData();
      if (data.requirement.type === type) {
        const wasUnlocked = achievement.isUnlocked();
        achievement.updateProgress(value);
        
        if (!wasUnlocked && achievement.isUnlocked()) {
          unlockedAchievements.push(achievement);
        }
      }
    }

    return unlockedAchievements;
  }

  /**
   * 獲取總成就點數
   */
  public getTotalPoints(): number {
    return this.getUnlockedAchievements().reduce(
      (total, achievement) => total + achievement.getData().reward.points,
      0
    );
  }

  /**
   * 獲取完成度
   */
  public getCompletionRate(): number {
    const total = this.getAllAchievements().length;
    if (total === 0) return 0;
    
    const unlocked = this.getUnlockedAchievements().length;
    return (unlocked / total) * 100;
  }

  /**
   * 清除所有成就
   */
  public clear(): void {
    this.achievements.clear();
  }
}

// Made with Bob
