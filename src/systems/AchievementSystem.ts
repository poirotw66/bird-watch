import { Achievement, AchievementData, AchievementManager } from '@/models/AchievementData';
import { eventBus, GameEvents } from '@/core/EventSystem';
import { gameState } from '@/core/GameState';

/**
 * 成就系統
 * 管理遊戲中的所有成就
 */
export class AchievementSystem {
  private static instance: AchievementSystem;
  private manager: AchievementManager;

  private constructor() {
    this.manager = new AchievementManager();
    this.setupEventListeners();
  }

  /**
   * 獲取單例實例
   */
  public static getInstance(): AchievementSystem {
    if (!AchievementSystem.instance) {
      AchievementSystem.instance = new AchievementSystem();
    }
    return AchievementSystem.instance;
  }

  /**
   * 設定事件監聽器
   */
  private setupEventListeners(): void {
    // 監聽鳥類發現事件
    eventBus.on(GameEvents.BIRD_DISCOVERED, (data: { birdId: string }) => {
      this.checkAchievements('discover', { birdId: data.birdId });
    });

    // 監聽鳥類識別事件
    eventBus.on(GameEvents.BIRD_IDENTIFIED, (data: { birdId: string; correct: boolean }) => {
      if (data.correct) {
        this.checkAchievements('identify', { birdId: data.birdId });
      }
    });

    // 監聽拍照事件
    eventBus.on(GameEvents.BIRD_PHOTOGRAPHED, (data: { birdId: string; quality: string }) => {
      this.checkAchievements('photograph', { birdId: data.birdId, quality: data.quality });
    });

    // 監聽任務完成事件
    eventBus.on(GameEvents.QUEST_COMPLETED, (data: { questId: string }) => {
      this.checkAchievements('quest', { questId: data.questId });
    });

    // 監聽玩家升級事件
    eventBus.on(GameEvents.PLAYER_LEVEL_UP, (data: { level: number }) => {
      this.checkAchievements('level', { level: data.level });
    });

    // 監聽棲息地訪問事件
    eventBus.on(GameEvents.HABITAT_VISITED, (data: { habitatId: string }) => {
      this.checkAchievements('explore', { habitatId: data.habitatId });
    });
  }

  /**
   * 載入成就資料
   */
  public async loadAchievements(achievementsData: AchievementData[]): Promise<void> {
    for (const data of achievementsData) {
      const achievement = new Achievement(data);
      this.manager.addAchievement(achievement);
    }

    console.log(`載入了 ${this.manager.getAllAchievements().length} 個成就`);
  }

  /**
   * 獲取成就管理器
   */
  public getManager(): AchievementManager {
    return this.manager;
  }

  /**
   * 檢查成就條件
   */
  private checkAchievements(
    type: string,
    context: {
      birdId?: string;
      quality?: string;
      questId?: string;
      level?: number;
      habitatId?: string;
    }
  ): void {
    const player = gameState.getPlayer();
    const achievements = this.manager.getLockedAchievements();

    for (const achievement of achievements) {
      const data = achievement.getData();

      // 檢查成就類型是否匹配
      if (!this.matchesAchievementType(data, type)) {
        continue;
      }

      // 根據不同類型檢查條件
      let shouldUpdate = false;
      let progress = 0;

      switch (type) {
        case 'discover':
          if (data.requirement.type === 'discover_birds') {
            progress = player.getData().stats.totalBirdsDiscovered;
            shouldUpdate = true;
          } else if (data.requirement.type === 'discover_species' && context.birdId) {
            // 檢查是否是特定種類
            shouldUpdate = true;
            progress = 1;
          }
          break;

        case 'identify':
          if (data.requirement.type === 'identify_birds') {
            progress = player.getData().stats.perfectIdentifications;
            shouldUpdate = true;
          } else if (data.requirement.type === 'identify_accuracy') {
            const accuracy = this.calculateIdentificationAccuracy();
            progress = accuracy;
            shouldUpdate = true;
          }
          break;

        case 'photograph':
          if (data.requirement.type === 'photograph_birds') {
            progress = player.getData().stats.totalPhotos;
            shouldUpdate = true;
          } else if (data.requirement.type === 'photograph_quality' && context.quality) {
            if (context.quality === 'excellent') {
              progress = player.getData().stats.totalPhotos;
              shouldUpdate = true;
            }
          }
          break;

        case 'quest':
          if (data.requirement.type === 'complete_quests') {
            progress = player.getData().stats.questsCompleted;
            shouldUpdate = true;
          }
          break;

        case 'level':
          if (data.requirement.type === 'reach_level' && context.level) {
            progress = context.level;
            shouldUpdate = true;
          }
          break;

        case 'explore':
          if (data.requirement.type === 'visit_habitats') {
            // 使用探索率作為進度
            progress = Math.round(player.getData().stats.explorationRate * 100);
            shouldUpdate = true;
          }
          break;
      }

      // 更新成就進度
      if (shouldUpdate) {
        const wasUnlocked = achievement.isUnlocked();
        achievement.updateProgress(progress);

        // 發送進度更新事件
        eventBus.emit(GameEvents.ACHIEVEMENT_PROGRESS, {
          achievementId: data.id,
          progress: achievement.getData().progress,
        });

        // 檢查是否完成
        if (!wasUnlocked && achievement.isUnlocked()) {
          this.unlockAchievement(data.id);
        }
      }
    }
  }

  /**
   * 檢查成就類型是否匹配
   */
  private matchesAchievementType(data: AchievementData, type: string): boolean {
    const typeMap: Record<string, string[]> = {
      discover: ['discover_birds', 'discover_species', 'discover_rare'],
      identify: ['identify_birds', 'identify_accuracy', 'identify_species'],
      photograph: ['photograph_birds', 'photograph_quality', 'photograph_species'],
      quest: ['complete_quests', 'complete_daily_quests'],
      level: ['reach_level'],
      explore: ['visit_habitats', 'explore_all'],
    };

    const validTypes = typeMap[type] || [];
    return validTypes.includes(data.requirement.type);
  }


  /**
   * 計算識別準確率
   */
  private calculateIdentificationAccuracy(): number {
    const player = gameState.getPlayer();
    const accuracyRate = player.getData().stats.accuracyRate;
    return Math.round(accuracyRate * 100);
  }

  /**
   * 解鎖成就
   */
  private unlockAchievement(achievementId: string): void {
    const achievement = this.manager.getAchievement(achievementId);
    if (!achievement) {
      return;
    }

    const data = achievement.getData();

    // 給予獎勵
    this.giveAchievementRewards(data);

    // 發送解鎖事件
    eventBus.emit(GameEvents.ACHIEVEMENT_UNLOCKED, {
      achievementId,
      title: data.title,
      reward: data.reward,
    });

    console.log(`🏆 解鎖成就: ${data.title}`);
  }

  /**
   * 給予成就獎勵
   */
  private giveAchievementRewards(achievementData: AchievementData): void {
    const player = gameState.getPlayer();
    const reward = achievementData.reward;

    // 金幣
    if (reward.coins && reward.coins > 0) {
      player.addCurrency('coins', reward.coins);
    }

    // 寶石
    if (reward.gems && reward.gems > 0) {
      player.addCurrency('gems', reward.gems);
    }

    // 稱號
    if (reward.title) {
      // TODO: 實作稱號系統
      console.log(`獲得稱號: ${reward.title}`);
    }

    // 更新統計
    player.incrementStat('achievementsUnlocked');
  }

  /**
   * Get achievement by id (for quest triggers and UI).
   */
  public getAchievement(achievementId: string): Achievement | undefined {
    return this.manager.getAchievement(achievementId);
  }

  /**
   * 手動更新成就進度
   */
  public updateAchievementProgress(achievementId: string, progress: number): void {
    const achievement = this.manager.getAchievement(achievementId);
    if (!achievement) {
      console.warn(`找不到成就: ${achievementId}`);
      return;
    }

    const wasUnlocked = achievement.isUnlocked();
    achievement.updateProgress(progress);

    // 發送進度更新事件
    eventBus.emit(GameEvents.ACHIEVEMENT_PROGRESS, {
      achievementId,
      progress: achievement.getData().progress,
    });

    // 檢查是否完成
    if (!wasUnlocked && achievement.isUnlocked()) {
      this.unlockAchievement(achievementId);
    }
  }

  /**
   * 獲取成就統計
   */
  public getAchievementStats(): {
    total: number;
    unlocked: number;
    inProgress: number;
    locked: number;
    completionRate: number;
  } {
    const all = this.manager.getAllAchievements();
    const unlocked = this.manager.getUnlockedAchievements();
    const inProgress = this.manager.getLockedAchievements().filter(a => a.getData().progress > 0);
    const locked = this.manager.getLockedAchievements();

    return {
      total: all.length,
      unlocked: unlocked.length,
      inProgress: inProgress.length,
      locked: locked.length,
      completionRate: all.length > 0 ? Math.round((unlocked.length / all.length) * 100) : 0,
    };
  }

  /**
   * 獲取最近解鎖的成就
   */
  public getRecentlyUnlocked(limit: number = 5): Achievement[] {
    return this.manager
      .getUnlockedAchievements()
      .sort((a, b) => {
        const dateA = a.getData().unlockedDate?.getTime() || 0;
        const dateB = b.getData().unlockedDate?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  /**
   * 清理系統
   */
  public cleanup(): void {
    this.manager = new AchievementManager();
  }
}

// 導出單例實例
export const achievementSystem = AchievementSystem.getInstance();

// Made with Bob
