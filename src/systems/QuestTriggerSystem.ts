import { questSystem } from '@/systems/QuestSystem';
import { pokedexSystem } from '@/systems/PokedexSystem';
import { achievementSystem } from '@/systems/AchievementSystem';
import { gameState } from '@/core/GameState';
import { eventBus, GameEvents } from '@/core/EventSystem';

/**
 * 任務觸發條件
 */
export interface QuestTrigger {
  questId: string;
  conditions: {
    minLevel?: number; // 最低等級
    requiredQuests?: string[]; // 前置任務
    discoveredBirds?: number; // 發現鳥類數量
    totalObservations?: number; // 總觀察次數
    totalPhotos?: number; // 總拍照次數
    unlockedAchievements?: string[]; // 解鎖的成就
  };
  autoAccept?: boolean; // 是否自動接受
}

/**
 * 任務觸發系統
 * 根據遊戲進度自動觸發任務
 */
export class QuestTriggerSystem {
  private static instance: QuestTriggerSystem;
  private triggers: Map<string, QuestTrigger> = new Map();
  private checkedTriggers: Set<string> = new Set();

  private constructor() {
    this.setupDefaultTriggers();
    this.setupEventListeners();
  }

  /**
   * 獲取單例實例
   */
  public static getInstance(): QuestTriggerSystem {
    if (!QuestTriggerSystem.instance) {
      QuestTriggerSystem.instance = new QuestTriggerSystem();
    }
    return QuestTriggerSystem.instance;
  }

  /**
   * 設定預設觸發器
   */
  private setupDefaultTriggers(): void {
    // 新手任務：第一次觀察
    this.addTrigger({
      questId: 'quest_tutorial_observe',
      conditions: {
        minLevel: 1
      },
      autoAccept: true
    });

    // 新手任務：第一次拍照
    this.addTrigger({
      questId: 'quest_tutorial_photo',
      conditions: {
        minLevel: 1,
        totalObservations: 1
      },
      autoAccept: true
    });

    // 進階任務：發現 5 種鳥類
    this.addTrigger({
      questId: 'quest_discover_5_birds',
      conditions: {
        minLevel: 2,
        discoveredBirds: 3
      },
      autoAccept: false
    });

    // 進階任務：拍攝 10 張照片
    this.addTrigger({
      questId: 'quest_take_10_photos',
      conditions: {
        minLevel: 3,
        totalPhotos: 5
      },
      autoAccept: false
    });

    // 專家任務：發現所有常見鳥類
    this.addTrigger({
      questId: 'quest_all_common_birds',
      conditions: {
        minLevel: 5,
        discoveredBirds: 5
      },
      autoAccept: false
    });
  }

  /**
   * 添加觸發器
   */
  public addTrigger(trigger: QuestTrigger): void {
    this.triggers.set(trigger.questId, trigger);
  }

  /**
   * 設定事件監聽器
   */
  private setupEventListeners(): void {
    // 監聽等級提升
    eventBus.on(GameEvents.PLAYER_LEVEL_UP, () => {
      this.checkAllTriggers();
    });

    // 監聽鳥類發現
    eventBus.on(GameEvents.BIRD_DISCOVERED, () => {
      this.checkAllTriggers();
    });

    // 監聽任務完成
    eventBus.on(GameEvents.QUEST_COMPLETED, () => {
      this.checkAllTriggers();
    });

    // 監聽成就解鎖
    eventBus.on(GameEvents.ACHIEVEMENT_UNLOCKED, () => {
      this.checkAllTriggers();
    });
  }

  /**
   * 檢查所有觸發器
   */
  public checkAllTriggers(): void {
    for (const [questId, trigger] of this.triggers) {
      // 跳過已檢查的觸發器
      if (this.checkedTriggers.has(questId)) {
        continue;
      }

      // 檢查任務是否已存在
      const quest = questSystem.getQuest(questId);
      if (quest) {
        this.checkedTriggers.add(questId);
        continue;
      }

      // 檢查觸發條件
      if (this.checkTriggerConditions(trigger)) {
        this.triggerQuest(questId, trigger);
      }
    }
  }

  /**
   * 檢查觸發條件
   */
  private checkTriggerConditions(trigger: QuestTrigger): boolean {
    const player = gameState.getPlayer();
    if (!player) return false;

    const conditions = trigger.conditions;

    // 檢查等級
    if (conditions.minLevel && player.getData().progress.level < conditions.minLevel) {
      return false;
    }

    // 檢查前置任務
    if (conditions.requiredQuests) {
      for (const reqQuestId of conditions.requiredQuests) {
        const reqQuest = questSystem.getQuest(reqQuestId);
        if (!reqQuest || reqQuest.getData().status !== 'completed') {
          return false;
        }
      }
    }

    // 檢查發現鳥類數量
    if (conditions.discoveredBirds) {
      const stats = pokedexSystem.getStats();
      if (stats.unlocked < conditions.discoveredBirds) {
        return false;
      }
    }

    // 檢查觀察次數
    if (conditions.totalObservations) {
      const playerData = player.getData();
      if (playerData.stats.totalBirdsDiscovered < conditions.totalObservations) {
        return false;
      }
    }

    // 檢查拍照次數
    if (conditions.totalPhotos) {
      const playerData = player.getData();
      if ((playerData.stats.totalPhotos || 0) < conditions.totalPhotos) {
        return false;
      }
    }

    // 檢查成就
    if (conditions.unlockedAchievements) {
      for (const achievementId of conditions.unlockedAchievements) {
        const achievement = achievementSystem.getAchievement(achievementId);
        if (!achievement || !achievement.isUnlocked()) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 觸發任務
   */
  private triggerQuest(questId: string, trigger: QuestTrigger): void {
    console.log(`🎯 觸發任務: ${questId}`);

    // 標記為已檢查
    this.checkedTriggers.add(questId);

    // 解鎖任務
    questSystem.makeQuestAvailable(questId);

    // 如果設定為自動接受，則自動接受任務
    if (trigger.autoAccept) {
      questSystem.startQuest(questId);
      console.log(`✅ 自動接受任務: ${questId}`);
    } else {
      console.log(`📋 任務已解鎖，可以接受: ${questId}`);
      
      // 發送通知事件
      eventBus.emit(GameEvents.QUEST_UNLOCKED, {
        questId
      });
    }
  }

  /**
   * 重置觸發器（用於測試）
   */
  public reset(): void {
    this.checkedTriggers.clear();
  }

  /**
   * 獲取可用任務列表
   */
  public getAvailableQuests(): string[] {
    const available: string[] = [];

    for (const [questId, trigger] of this.triggers) {
      // 跳過已檢查的
      if (this.checkedTriggers.has(questId)) {
        continue;
      }

      // 檢查條件
      if (this.checkTriggerConditions(trigger)) {
        available.push(questId);
      }
    }

    return available;
  }
}

// 導出單例實例
export const questTriggerSystem = QuestTriggerSystem.getInstance();

// Made with Bob
