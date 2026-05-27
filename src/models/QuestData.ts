import { QuestType, QuestStatus, Difficulty } from '@/types';

/**
 * 任務目標
 */
export interface QuestObjective {
  id: string;
  type: 'discover' | 'identify' | 'photograph' | 'collect' | 'explore' | 'custom';
  description: string;
  target: number;
  current: number;
  completed: boolean;
  optional: boolean;
  
  // 目標特定參數
  birdIds?: string[];
  birdTypes?: string[];
  habitatIds?: string[];
  photoQuality?: 'poor' | 'good' | 'excellent';
  accuracy?: number; // 識別準確率要求
}

/**
 * 任務獎勵
 */
export interface QuestReward {
  experience: number;
  coins: number;
  gems?: number;
  items?: { id: string; quantity: number }[];
  unlocks?: string[]; // 解鎖的內容 ID
  title?: string; // 稱號
}

/**
 * 任務資料
 */
export interface QuestData {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: Difficulty;
  
  objectives: QuestObjective[];
  rewards: QuestReward;
  prerequisites: string[]; // 前置任務 ID
  timeLimit?: number; // 時間限制（分鐘）
  
  status: QuestStatus;
  progress: number; // 0-100
  startedAt?: Date;
  completedAt?: Date;
  
  // 任務特定資料
  story?: {
    intro: string;
    completion: string;
    npcDialogue?: string[];
  };
  
  repeatable: boolean;
  dailyReset?: boolean;
}

/**
 * 任務類別
 */
export class Quest {
  private data: QuestData;

  constructor(data: QuestData) {
    this.data = data;
  }

  /**
   * 獲取任務資料
   */
  public getData(): Readonly<QuestData> {
    return this.data;
  }

  /**
   * 檢查是否可以開始
   */
  public canStart(completedQuests: string[]): boolean {
    if (this.data.status !== 'available') {
      return false;
    }

    // 檢查前置任務
    return this.data.prerequisites.every((prereq) => completedQuests.includes(prereq));
  }

  /**
   * 開始任務
   */
  public start(): void {
    if (this.data.status === 'available') {
      this.data.status = 'active';
      this.data.startedAt = new Date();
      this.data.progress = 0;
    }
  }

  /**
   * 更新目標進度
   */
  public updateObjective(objectiveId: string, progress: number): void {
    const objective = this.data.objectives.find((obj) => obj.id === objectiveId);
    if (objective) {
      objective.current = Math.min(objective.target, objective.current + progress);
      objective.completed = objective.current >= objective.target;
      this.updateProgress();
    }
  }

  /**
   * 更新整體進度
   */
  private updateProgress(): void {
    const requiredObjectives = this.data.objectives.filter((obj) => !obj.optional);
    const completedRequired = requiredObjectives.filter((obj) => obj.completed).length;
    
    if (requiredObjectives.length > 0) {
      this.data.progress = (completedRequired / requiredObjectives.length) * 100;
    }

    // 檢查是否完成
    if (this.isCompleted()) {
      this.complete();
    }
  }

  /**
   * 檢查是否完成
   */
  public isCompleted(): boolean {
    const requiredObjectives = this.data.objectives.filter((obj) => !obj.optional);
    return requiredObjectives.every((obj) => obj.completed);
  }

  /**
   * 完成任務
   */
  private complete(): void {
    this.data.status = 'completed';
    this.data.completedAt = new Date();
    this.data.progress = 100;
  }

  /**
   * 檢查是否超時
   */
  public isExpired(): boolean {
    if (!this.data.timeLimit || !this.data.startedAt) {
      return false;
    }

    const now = new Date();
    const elapsed = (now.getTime() - this.data.startedAt.getTime()) / 1000 / 60; // 分鐘
    return elapsed > this.data.timeLimit;
  }

  /**
   * 獲取剩餘時間（分鐘）
   */
  public getRemainingTime(): number | null {
    if (!this.data.timeLimit || !this.data.startedAt) {
      return null;
    }

    const now = new Date();
    const elapsed = (now.getTime() - this.data.startedAt.getTime()) / 1000 / 60;
    return Math.max(0, this.data.timeLimit - elapsed);
  }

  /**
   * 重置任務（用於可重複任務）
   */
  public reset(): void {
    if (this.data.repeatable) {
      this.data.status = 'available';
      this.data.progress = 0;
      this.data.startedAt = undefined;
      this.data.completedAt = undefined;
      
      // 重置所有目標
      this.data.objectives.forEach((obj) => {
        obj.current = 0;
        obj.completed = false;
      });
    }
  }

  /**
   * 獲取目標進度文字
   */
  public getObjectiveProgressText(objectiveId: string): string {
    const objective = this.data.objectives.find((obj) => obj.id === objectiveId);
    if (!objective) {
      return '';
    }
    return `${objective.current}/${objective.target}`;
  }

  /**
   * 創建新任務
   */
  public static create(config: Omit<QuestData, 'status' | 'progress'>): Quest {
    const data: QuestData = {
      ...config,
      status: 'locked',
      progress: 0,
    };
    return new Quest(data);
  }
}

// Made with Bob
