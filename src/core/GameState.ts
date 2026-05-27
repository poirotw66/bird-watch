import { Player } from '@/models/PlayerData';
import { PokedexEntry } from '@/models/BirdData';
import { Quest } from '@/models/QuestData';
import { Achievement, AchievementManager } from '@/models/AchievementData';
import { StorageManager, SaveData } from '@/utils/StorageManager';
import { eventBus, GameEvents } from './EventSystem';
import { pokedexSystem } from '@/systems/PokedexSystem';

/**
 * 遊戲狀態管理器
 * 管理遊戲的全域狀態
 */
export class GameState {
  private static instance: GameState;

  private player: Player | null = null;
  private pokedex: Map<string, PokedexEntry> = new Map();
  private quests: Map<string, Quest> = new Map();
  private achievementManager: AchievementManager = new AchievementManager();
  private autoSaveInterval: number | null = null;
  private autoSaveEnabled: boolean = true;
  private autoSaveIntervalMs: number = 60000; // 1 分鐘

  private constructor() {}

  /**
   * 獲取單例實例
   */
  public static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  /**
   * 初始化遊戲狀態
   */
  public async initialize(): Promise<void> {
    console.log('初始化遊戲狀態...');

    // 嘗試載入存檔
    const hasSave = await StorageManager.hasSave();

    if (hasSave) {
      await this.loadGame();
    } else {
      this.createNewGame('玩家');
    }

    // 啟動自動儲存
    if (this.autoSaveEnabled) {
      this.startAutoSave();
    }
  }

  /**
   * 創建新遊戲
   */
  public createNewGame(playerName: string): void {
    console.log('創建新遊戲...');

    // 創建新玩家
    this.player = Player.createNew(playerName);

    this.pokedex.clear();
    pokedexSystem.loadPokedex([]);

    // 清空任務
    this.quests.clear();

    // 清空成就
    this.achievementManager.clear();

    eventBus.emit(GameEvents.GAME_RESET);
  }

  /**
   * 儲存遊戲
   */
  public async saveGame(): Promise<void> {
    if (!this.player) {
      throw new Error('沒有玩家資料可以儲存');
    }

    console.log('儲存遊戲...');

    const saveData: Omit<SaveData, 'version' | 'timestamp'> = {
      player: this.player.getData(),
      pokedex: pokedexSystem.getAllEntries(),
      quests: Array.from(this.quests.values()).map((q) => q.getData()),
      achievements: this.achievementManager
        .getAllAchievements()
        .map((a) => a.getData()),
      settings: this.player.getData().settings,
    };

    await StorageManager.saveGame(saveData);
    eventBus.emit(GameEvents.GAME_SAVE);
  }

  /**
   * 載入遊戲
   */
  public async loadGame(): Promise<void> {
    console.log('載入遊戲...');

    const saveData = await StorageManager.loadGame();

    if (!saveData) {
      throw new Error('找不到存檔');
    }

    // 載入玩家資料
    this.player = new Player(saveData.player);

    this.pokedex.clear();
    saveData.pokedex.forEach((entry) => {
      this.pokedex.set(entry.birdId, entry);
    });
    pokedexSystem.loadPokedex(saveData.pokedex);

    // 載入任務
    this.quests.clear();
    saveData.quests.forEach((questData) => {
      this.quests.set(questData.id, new Quest(questData));
    });

    // 載入成就
    this.achievementManager.clear();
    saveData.achievements.forEach((achievementData) => {
      this.achievementManager.addAchievement(new Achievement(achievementData));
    });

    eventBus.emit(GameEvents.GAME_LOAD);
  }

  /**
   * 獲取玩家
   */
  public getPlayer(): Player {
    if (!this.player) {
      throw new Error('玩家尚未初始化');
    }
    return this.player;
  }

  /**
   * 獲取圖鑑條目
   */
  public getPokedexEntry(birdId: string): PokedexEntry | undefined {
    return this.pokedex.get(birdId);
  }

  /**
   * 獲取所有圖鑑條目
   */
  public getAllPokedexEntries(): PokedexEntry[] {
    return Array.from(this.pokedex.values());
  }

  /**
   * 添加或更新圖鑑條目
   */
  public updatePokedexEntry(entry: PokedexEntry): void {
    this.pokedex.set(entry.birdId, entry);
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
   * 添加任務
   */
  public addQuest(quest: Quest): void {
    this.quests.set(quest.getData().id, quest);
  }

  /**
   * 獲取成就管理器
   */
  public getAchievementManager(): AchievementManager {
    return this.achievementManager;
  }

  /**
   * 啟動自動儲存
   */
  private startAutoSave(): void {
    if (this.autoSaveInterval !== null) {
      return;
    }

    this.autoSaveInterval = window.setInterval(() => {
      if (this.player && this.autoSaveEnabled) {
        StorageManager.autoSave({
          player: this.player.getData(),
          pokedex: pokedexSystem.getAllEntries(),
          quests: Array.from(this.quests.values()).map((q) => q.getData()),
          achievements: this.achievementManager
            .getAllAchievements()
            .map((a) => a.getData()),
          settings: this.player.getData().settings,
        });
      }
    }, this.autoSaveIntervalMs);

    console.log(`自動儲存已啟動（間隔：${this.autoSaveIntervalMs / 1000}秒）`);
  }

  /**
   * 停止自動儲存
   */
  private stopAutoSave(): void {
    if (this.autoSaveInterval !== null) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('自動儲存已停止');
    }
  }

  /**
   * 設定自動儲存
   */
  public setAutoSave(enabled: boolean, intervalMs?: number): void {
    this.autoSaveEnabled = enabled;

    if (intervalMs !== undefined) {
      this.autoSaveIntervalMs = intervalMs;
    }

    if (enabled) {
      this.stopAutoSave();
      this.startAutoSave();
    } else {
      this.stopAutoSave();
    }
  }

  /**
   * 重置遊戲狀態
   */
  public reset(): void {
    this.player = null;
    this.pokedex.clear();
    this.quests.clear();
    this.achievementManager.clear();
    this.stopAutoSave();
  }

  /**
   * 銷毀遊戲狀態
   */
  public destroy(): void {
    this.stopAutoSave();
    this.reset();
  }
}

/**
 * 全域遊戲狀態實例
 */
export const gameState = GameState.getInstance();

// Made with Bob
