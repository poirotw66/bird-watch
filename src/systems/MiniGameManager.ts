import { EventSystem } from '../core/EventSystem';
import { MiniGameBase, MiniGameConfig, MiniGameResult } from '../minigames/MiniGameBase';
import { MemoryMatchGame } from '../minigames/MemoryMatchGame';
import { BirdIdentificationGame } from '../minigames/BirdIdentificationGame';
import { ReactionSpeedGame } from '../minigames/ReactionSpeedGame';
import { TAIWAN_BIRD_CATALOG } from '../data/taiwanBirdCatalog';

/**
 * 小遊戲類型
 */
export enum MiniGameType {
  MEMORY_MATCH = 'memory_match',
  BIRD_IDENTIFICATION = 'bird_identification',
  REACTION_SPEED = 'reaction_speed',
}

/**
 * 小遊戲資訊
 */
export interface MiniGameInfo {
  type: MiniGameType;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  bestScore: number;
  bestStars: number;
  timesPlayed: number;
}

/**
 * 小遊戲管理器
 * 管理所有小遊戲的創建、執行和記錄
 */
export class MiniGameManager {
  private static instance: MiniGameManager;
  private eventSystem: EventSystem;
  private currentGame: MiniGameBase | null = null;
  private gameInfos: Map<MiniGameType, MiniGameInfo> = new Map();
  private gameHistory: MiniGameResult[] = [];

  private constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.initializeGameInfos();
    this.setupEventListeners();
  }

  /**
   * 取得單例實例
   */
  public static getInstance(): MiniGameManager {
    if (!MiniGameManager.instance) {
      MiniGameManager.instance = new MiniGameManager();
    }
    return MiniGameManager.instance;
  }

  /**
   * 初始化遊戲資訊
   */
  private initializeGameInfos(): void {
    this.gameInfos.set(MiniGameType.MEMORY_MATCH, {
      type: MiniGameType.MEMORY_MATCH,
      name: '記憶配對遊戲',
      description: '翻開卡片，找出相同的鳥類配對。訓練記憶力和注意力。',
      icon: '🧠',
      unlocked: true,
      bestScore: 0,
      bestStars: 0,
      timesPlayed: 0,
    });

    this.gameInfos.set(MiniGameType.BIRD_IDENTIFICATION, {
      type: MiniGameType.BIRD_IDENTIFICATION,
      name: '鳥類辨識遊戲',
      description: '根據鳥類的特徵描述，選出正確的鳥類。訓練辨識能力和決策能力。',
      icon: '🔍',
      unlocked: true,
      bestScore: 0,
      bestStars: 0,
      timesPlayed: 0,
    });

    this.gameInfos.set(MiniGameType.REACTION_SPEED, {
      type: MiniGameType.REACTION_SPEED,
      name: '反應速度遊戲',
      description: '快速點擊目標鳥類，避免點擊其他鳥類。訓練反應速度和注意力。',
      icon: '⚡',
      unlocked: true,
      bestScore: 0,
      bestStars: 0,
      timesPlayed: 0,
    });
  }

  /**
   * 設置事件監聽器
   */
  private setupEventListeners(): void {
    this.eventSystem.on('minigame:end', this.onGameEnd.bind(this));
  }

  /**
   * 創建小遊戲
   */
  public createGame(type: MiniGameType, config: MiniGameConfig): MiniGameBase | null {
    const gameInfo = this.gameInfos.get(type);
    if (!gameInfo || !gameInfo.unlocked) {
      console.warn(`遊戲 ${type} 未解鎖或不存在`);
      return null;
    }

    let game: MiniGameBase;

    switch (type) {
      case MiniGameType.MEMORY_MATCH:
        game = new MemoryMatchGame(config, TAIWAN_BIRD_CATALOG);
        break;
      case MiniGameType.BIRD_IDENTIFICATION:
        game = new BirdIdentificationGame(config, TAIWAN_BIRD_CATALOG);
        break;
      case MiniGameType.REACTION_SPEED:
        game = new ReactionSpeedGame(config, TAIWAN_BIRD_CATALOG);
        break;
      default:
        console.error(`未知的遊戲類型: ${type}`);
        return null;
    }

    game.initialize();
    this.currentGame = game;

    // 更新遊玩次數
    gameInfo.timesPlayed++;

    return game;
  }

  /**
   * 取得當前遊戲
   */
  public getCurrentGame(): MiniGameBase | null {
    return this.currentGame;
  }

  /**
   * 結束當前遊戲
   */
  public endCurrentGame(): void {
    if (this.currentGame) {
      this.currentGame.end(false);
      this.currentGame = null;
    }
  }

  /**
   * 遊戲結束事件處理
   */
  private onGameEnd(data: { name: string; result: MiniGameResult }): void {
    // 記錄遊戲結果
    this.gameHistory.push(data.result);

    // 更新最佳記錄
    this.gameInfos.forEach((info) => {
      if (info.name === data.name) {
        if (data.result.score > info.bestScore) {
          info.bestScore = data.result.score;
        }
        if (data.result.stars > info.bestStars) {
          info.bestStars = data.result.stars;
        }
      }
    });

    // 發送完成事件
    this.eventSystem.emit('minigame:completed', {
      result: data.result,
    });
  }

  /**
   * 取得所有遊戲資訊
   */
  public getAllGameInfos(): MiniGameInfo[] {
    return Array.from(this.gameInfos.values());
  }

  /**
   * 取得遊戲資訊
   */
  public getGameInfo(type: MiniGameType): MiniGameInfo | undefined {
    return this.gameInfos.get(type);
  }

  /**
   * 取得遊戲歷史
   */
  public getGameHistory(): MiniGameResult[] {
    return [...this.gameHistory];
  }

  /**
   * 取得統計資料
   */
  public getStatistics(): {
    totalGamesPlayed: number;
    totalScore: number;
    averageAccuracy: number;
    totalStars: number;
  } {
    const totalGamesPlayed = this.gameHistory.length;
    const totalScore = this.gameHistory.reduce((sum, result) => sum + result.score, 0);
    const totalAccuracy = this.gameHistory.reduce((sum, result) => sum + result.accuracy, 0);
    const averageAccuracy = totalGamesPlayed > 0 ? totalAccuracy / totalGamesPlayed : 0;
    const totalStars = this.gameHistory.reduce((sum, result) => sum + result.stars, 0);

    return {
      totalGamesPlayed,
      totalScore,
      averageAccuracy,
      totalStars,
    };
  }

  /**
   * 解鎖遊戲
   */
  public unlockGame(type: MiniGameType): void {
    const gameInfo = this.gameInfos.get(type);
    if (gameInfo) {
      gameInfo.unlocked = true;
      this.eventSystem.emit('minigame:unlocked', {
        type,
        name: gameInfo.name,
      });
    }
  }

  /**
   * 序列化資料（用於存檔）
   */
  public serialize(): {
    gameInfos: Record<string, MiniGameInfo>;
    gameHistory: MiniGameResult[];
  } {
    const gameInfosObj: Record<string, MiniGameInfo> = {};
    this.gameInfos.forEach((value, key) => {
      gameInfosObj[key] = value;
    });

    return {
      gameInfos: gameInfosObj,
      gameHistory: this.gameHistory,
    };
  }

  /**
   * 反序列化資料（用於讀檔）
   */
  public deserialize(data: {
    gameInfos: Record<string, MiniGameInfo>;
    gameHistory: MiniGameResult[];
  }): void {
    this.gameInfos.clear();
    Object.entries(data.gameInfos).forEach(([key, value]) => {
      this.gameInfos.set(key as MiniGameType, value);
    });

    this.gameHistory = data.gameHistory;
  }
}

// Made with Bob
