import { EventSystem } from '../core/EventSystem';

/**
 * 小遊戲狀態
 */
export enum MiniGameState {
  READY = 'ready',
  PLAYING = 'playing',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * 小遊戲結果
 */
export interface MiniGameResult {
  score: number;
  accuracy: number;
  timeElapsed: number;
  completed: boolean;
  stars: number; // 1-3 星評價
  rewards: {
    experience: number;
    points: number;
  };
}

/**
 * 小遊戲配置
 */
export interface MiniGameConfig {
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // 秒，undefined 表示無時間限制
  targetScore?: number; // 目標分數
}

/**
 * 小遊戲基類
 */
export abstract class MiniGameBase {
  protected eventSystem: EventSystem;
  protected state: MiniGameState = MiniGameState.READY;
  protected config: MiniGameConfig;
  protected score: number = 0;
  protected startTime: number = 0;
  protected elapsedTime: number = 0;
  protected correctCount: number = 0;
  protected totalAttempts: number = 0;

  constructor(config: MiniGameConfig) {
    this.eventSystem = EventSystem.getInstance();
    this.config = config;
  }

  /**
   * 取得遊戲名稱
   */
  public abstract getName(): string;

  /**
   * 取得遊戲描述
   */
  public abstract getDescription(): string;

  /**
   * 初始化遊戲
   */
  public abstract initialize(): void;

  /**
   * 開始遊戲
   */
  public start(): void {
    if (this.state !== MiniGameState.READY) {
      console.warn('遊戲必須在 READY 狀態才能開始');
      return;
    }

    this.state = MiniGameState.PLAYING;
    this.startTime = Date.now();
    this.score = 0;
    this.correctCount = 0;
    this.totalAttempts = 0;

    this.eventSystem.emit('minigame:start', {
      name: this.getName(),
    });

    this.onStart();
  }

  /**
   * 暫停遊戲
   */
  public pause(): void {
    if (this.state !== MiniGameState.PLAYING) return;

    this.state = MiniGameState.PAUSED;
    this.eventSystem.emit('minigame:pause', {
      name: this.getName(),
    });

    this.onPause();
  }

  /**
   * 恢復遊戲
   */
  public resume(): void {
    if (this.state !== MiniGameState.PAUSED) return;

    this.state = MiniGameState.PLAYING;
    this.eventSystem.emit('minigame:resume', {
      name: this.getName(),
    });

    this.onResume();
  }

  /**
   * 結束遊戲
   */
  public end(completed: boolean): void {
    if (this.state !== MiniGameState.PLAYING && this.state !== MiniGameState.PAUSED) {
      return;
    }

    this.state = completed ? MiniGameState.COMPLETED : MiniGameState.FAILED;
    this.elapsedTime = (Date.now() - this.startTime) / 1000;

    const result = this.calculateResult(completed);

    this.eventSystem.emit('minigame:end', {
      name: this.getName(),
      result,
    });

    this.onEnd(result);
  }

  /**
   * 更新遊戲邏輯
   */
  public update(deltaTime: number): void {
    if (this.state !== MiniGameState.PLAYING) return;

    this.elapsedTime = (Date.now() - this.startTime) / 1000;

    // 檢查時間限制
    if (this.config.timeLimit && this.elapsedTime >= this.config.timeLimit) {
      this.end(false);
      return;
    }

    this.onUpdate(deltaTime);
  }

  /**
   * 渲染遊戲
   */
  public abstract render(ctx: CanvasRenderingContext2D): void;

  /**
   * 計算遊戲結果
   */
  protected calculateResult(completed: boolean): MiniGameResult {
    const accuracy = this.totalAttempts > 0 ? (this.correctCount / this.totalAttempts) * 100 : 0;
    
    // 計算星級（1-3 星）
    let stars = 1;
    if (accuracy >= 90 && completed) {
      stars = 3;
    } else if (accuracy >= 70 && completed) {
      stars = 2;
    }

    // 計算獎勵
    const baseExp = 50;
    const basePoints = 100;
    const difficultyMultiplier = this.config.difficulty === 'hard' ? 1.5 : this.config.difficulty === 'medium' ? 1.2 : 1.0;
    
    const experience = Math.floor(baseExp * stars * difficultyMultiplier);
    const points = Math.floor(basePoints * stars * difficultyMultiplier);

    return {
      score: this.score,
      accuracy,
      timeElapsed: this.elapsedTime,
      completed,
      stars,
      rewards: {
        experience,
        points,
      },
    };
  }

  /**
   * 取得當前狀態
   */
  public getState(): MiniGameState {
    return this.state;
  }

  /**
   * 取得當前分數
   */
  public getScore(): number {
    return this.score;
  }

  /**
   * 取得經過時間
   */
  public getElapsedTime(): number {
    return this.elapsedTime;
  }

  /**
   * 取得剩餘時間
   */
  public getRemainingTime(): number | null {
    if (!this.config.timeLimit) return null;
    return Math.max(0, this.config.timeLimit - this.elapsedTime);
  }

  /**
   * 子類實作：遊戲開始時調用
   */
  protected abstract onStart(): void;

  /**
   * 子類實作：遊戲暫停時調用
   */
  protected abstract onPause(): void;

  /**
   * 子類實作：遊戲恢復時調用
   */
  protected abstract onResume(): void;

  /**
   * 子類實作：遊戲結束時調用
   */
  protected abstract onEnd(result: MiniGameResult): void;

  /**
   * 子類實作：每幀更新時調用
   */
  protected abstract onUpdate(deltaTime: number): void;
}

// Made with Bob
