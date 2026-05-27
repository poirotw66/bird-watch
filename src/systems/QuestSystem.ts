import { Quest, QuestData } from '@/models/QuestData';
import { eventBus, GameEvents } from '@/core/EventSystem';
import { gameState } from '@/core/GameState';

/**
 * 任務系統
 * 管理遊戲中的所有任務
 */
export class QuestSystem {
  private static instance: QuestSystem;
  private quests: Map<string, Quest> = new Map();
  private activeQuests: Set<string> = new Set();

  private constructor() {
    this.setupEventListeners();
  }

  /**
   * 獲取單例實例
   */
  public static getInstance(): QuestSystem {
    if (!QuestSystem.instance) {
      QuestSystem.instance = new QuestSystem();
    }
    return QuestSystem.instance;
  }

  /**
   * 設定事件監聽器
   */
  private setupEventListeners(): void {
    // 監聽鳥類發現事件
    eventBus.on(GameEvents.BIRD_DISCOVERED, (data: { birdId: string }) => {
      this.onBirdDiscovered(data.birdId);
    });

    // 監聽鳥類識別事件
    eventBus.on(GameEvents.BIRD_IDENTIFIED, (data: { birdId: string; correct: boolean }) => {
      this.onBirdIdentified(data.birdId, data.correct);
    });

    // 監聽拍照事件
    eventBus.on(GameEvents.BIRD_PHOTOGRAPHED, (data: { birdId: string; quality: string }) => {
      this.onBirdPhotographed(data.birdId, data.quality);
    });

    // 監聽棲息地訪問事件
    eventBus.on(GameEvents.HABITAT_VISITED, (data: { habitatId: string }) => {
      this.onHabitatVisited(data.habitatId);
    });
  }

  /**
   * 載入任務資料
   */
  public async loadQuests(questsData: QuestData[]): Promise<void> {
    this.quests.clear();
    
    for (const data of questsData) {
      const quest = new Quest(data);
      this.quests.set(data.id, quest);
      
      if (data.status === 'active') {
        this.activeQuests.add(data.id);
      }
    }

    console.log(`載入了 ${this.quests.size} 個任務`);
  }

  /**
   * 添加任務
   */
  public addQuest(quest: Quest): void {
    const data = quest.getData();
    this.quests.set(data.id, quest);
    
    // 檢查是否可以解鎖
    this.checkQuestUnlock(data.id);
  }

  /**
   * 獲取任務
   */
  public getQuest(questId: string): Quest | undefined {
    return this.quests.get(questId);
  }

  /**
   * 獲取所有任務
   */
  public getAllQuests(): Quest[] {
    return Array.from(this.quests.values());
  }

  /**
   * 獲取可用任務
   */
  public getAvailableQuests(): Quest[] {
    return this.getAllQuests().filter((q) => q.getData().status === 'available');
  }

  /**
   * 獲取進行中的任務
   */
  public getActiveQuests(): Quest[] {
    return this.getAllQuests().filter((q) => q.getData().status === 'active');
  }

  /**
   * 獲取已完成的任務
   */
  public getCompletedQuests(): Quest[] {
    return this.getAllQuests().filter((q) => q.getData().status === 'completed');
  }

  /**
   * 開始任務
   */
  public startQuest(questId: string): boolean {
    const quest = this.getQuest(questId);
    if (!quest) {
      console.warn(`找不到任務: ${questId}`);
      return false;
    }

    const completedQuestIds = this.getCompletedQuests().map((q) => q.getData().id);
    
    if (!quest.canStart(completedQuestIds)) {
      console.warn(`無法開始任務: ${questId}`);
      return false;
    }

    quest.start();
    this.activeQuests.add(questId);
    
    eventBus.emit(GameEvents.QUEST_STARTED, { questId });
    console.log(`開始任務: ${quest.getData().title}`);
    
    return true;
  }

  /**
   * 更新任務目標
   */
  public updateQuestObjective(questId: string, objectiveId: string, progress: number): void {
    const quest = this.getQuest(questId);
    if (!quest || quest.getData().status !== 'active') {
      return;
    }

    const wasCompleted = quest.isCompleted();
    quest.updateObjective(objectiveId, progress);

    // 發送進度更新事件
    eventBus.emit(GameEvents.QUEST_PROGRESS, {
      questId,
      objectiveId,
      progress: quest.getData().progress,
    });

    // 檢查是否完成
    if (!wasCompleted && quest.isCompleted()) {
      this.completeQuest(questId);
    }
  }

  /**
   * 完成任務
   */
  private completeQuest(questId: string): void {
    const quest = this.getQuest(questId);
    if (!quest) {
      return;
    }

    const data = quest.getData();
    this.activeQuests.delete(questId);

    // 給予獎勵
    this.giveQuestRewards(data);

    // 發送完成事件
    eventBus.emit(GameEvents.QUEST_COMPLETED, {
      questId,
      title: data.title,
      rewards: data.rewards,
    });

    console.log(`完成任務: ${data.title}`);

    // 檢查是否解鎖新任務
    this.checkAllQuestUnlocks();
  }

  /**
   * 給予任務獎勵
   */
  private giveQuestRewards(questData: QuestData): void {
    const player = gameState.getPlayer();
    const rewards = questData.rewards;

    // 經驗值
    if (rewards.experience > 0) {
      player.addExperience(rewards.experience);
    }

    // 金幣
    if (rewards.coins > 0) {
      player.addCurrency('coins', rewards.coins);
    }

    // 寶石
    if (rewards.gems && rewards.gems > 0) {
      player.addCurrency('gems', rewards.gems);
    }

    // 物品
    if (rewards.items) {
      for (const item of rewards.items) {
        player.addItem(item.id, item.quantity);
      }
    }

    // 稱號
    if (rewards.title) {
      // TODO: 實作稱號系統
      console.log(`獲得稱號: ${rewards.title}`);
    }

    // 更新統計
    player.incrementStat('questsCompleted');
  }

  /**
   * Mark a quest as available after external trigger conditions are met.
   */
  public makeQuestAvailable(questId: string): void {
    const quest = this.getQuest(questId);
    if (!quest || quest.getData().status !== 'locked') {
      return;
    }
    (quest as unknown as { data: QuestData }).data.status = 'available';
    eventBus.emit(GameEvents.QUEST_UNLOCKED, { questId });
    console.log(`解鎖任務: ${quest.getData().title}`);
  }

  /**
   * 檢查任務解鎖
   */
  private checkQuestUnlock(questId: string): void {
    const quest = this.getQuest(questId);
    if (!quest || quest.getData().status !== 'locked') {
      return;
    }

    const completedQuestIds = this.getCompletedQuests().map((q) => q.getData().id);
    const data = quest.getData();

    // 檢查前置任務
    const prerequisitesMet = data.prerequisites.every((prereq) =>
      completedQuestIds.includes(prereq)
    );

    if (prerequisitesMet) {
      // 解鎖任務 - 需要修改內部 data，不能透過 readonly getData()
      (quest as any).data.status = 'available';
      
      eventBus.emit(GameEvents.QUEST_UNLOCKED, { questId });
      console.log(`解鎖任務: ${data.title}`);
    }
  }

  /**
   * 檢查所有任務解鎖
   */
  private checkAllQuestUnlocks(): void {
    for (const quest of this.getAllQuests()) {
      this.checkQuestUnlock(quest.getData().id);
    }
  }

  /**
   * 處理鳥類發現事件
   */
  private onBirdDiscovered(birdId: string): void {
    for (const quest of this.getActiveQuests()) {
      const data = quest.getData();
      
      for (const objective of data.objectives) {
        if (objective.type === 'discover') {
          // 檢查是否符合目標
          if (!objective.birdIds || objective.birdIds.includes(birdId)) {
            this.updateQuestObjective(data.id, objective.id, 1);
          }
        }
      }
    }
  }

  /**
   * 處理鳥類識別事件
   */
  private onBirdIdentified(birdId: string, correct: boolean): void {
    if (!correct) return;

    for (const quest of this.getActiveQuests()) {
      const data = quest.getData();
      
      for (const objective of data.objectives) {
        if (objective.type === 'identify') {
          if (!objective.birdIds || objective.birdIds.includes(birdId)) {
            this.updateQuestObjective(data.id, objective.id, 1);
          }
        }
      }
    }
  }

  /**
   * 處理拍照事件
   */
  private onBirdPhotographed(birdId: string, quality: string): void {
    for (const quest of this.getActiveQuests()) {
      const data = quest.getData();
      
      for (const objective of data.objectives) {
        if (objective.type === 'photograph') {
          // 檢查品質要求
          const qualityMet = !objective.photoQuality || objective.photoQuality === quality;
          
          if (qualityMet && (!objective.birdIds || objective.birdIds.includes(birdId))) {
            this.updateQuestObjective(data.id, objective.id, 1);
          }
        }
      }
    }
  }

  /**
   * 處理棲息地訪問事件
   */
  private onHabitatVisited(habitatId: string): void {
    for (const quest of this.getActiveQuests()) {
      const data = quest.getData();
      
      for (const objective of data.objectives) {
        if (objective.type === 'explore') {
          if (!objective.habitatIds || objective.habitatIds.includes(habitatId)) {
            this.updateQuestObjective(data.id, objective.id, 1);
          }
        }
      }
    }
  }

  /**
   * 放棄任務
   */
  public abandonQuest(questId: string): boolean {
    const quest = this.getQuest(questId);
    if (!quest || quest.getData().status !== 'active') {
      return false;
    }

    quest.reset();
    this.activeQuests.delete(questId);
    
    eventBus.emit(GameEvents.QUEST_ABANDONED, { questId });
    console.log(`放棄任務: ${quest.getData().title}`);
    
    return true;
  }

  /**
   * 重置任務（用於測試）
   */
  public resetQuest(questId: string): void {
    const quest = this.getQuest(questId);
    if (quest) {
      quest.reset();
      this.activeQuests.delete(questId);
    }
  }

  /**
   * 獲取任務統計
   */
  public getQuestStats(): {
    total: number;
    available: number;
    active: number;
    completed: number;
    locked: number;
  } {
    const allQuests = this.getAllQuests();
    
    return {
      total: allQuests.length,
      available: allQuests.filter((q) => q.getData().status === 'available').length,
      active: allQuests.filter((q) => q.getData().status === 'active').length,
      completed: allQuests.filter((q) => q.getData().status === 'completed').length,
      locked: allQuests.filter((q) => q.getData().status === 'locked').length,
    };
  }

  /**
   * 清理系統
   */
  public cleanup(): void {
    this.quests.clear();
    this.activeQuests.clear();
  }
}

// 導出單例實例
export const questSystem = QuestSystem.getInstance();

// Made with Bob
