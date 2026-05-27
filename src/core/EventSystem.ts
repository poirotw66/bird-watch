/**
 * 事件回調函數類型
 */
type EventCallback = (data?: any) => void;

/**
 * 事件系統
 * 提供發布-訂閱模式的事件管理
 */
export class EventSystem {
  private static instance: EventSystem;
  private listeners: Map<string, EventCallback[]> = new Map();

  private constructor() {}

  /**
   * 獲取單例實例
   */
  public static getInstance(): EventSystem {
    if (!EventSystem.instance) {
      EventSystem.instance = new EventSystem();
    }
    return EventSystem.instance;
  }

  /**
   * 訂閱事件
   * @param event 事件名稱
   * @param callback 回調函數
   */
  public on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * 訂閱事件（僅觸發一次）
   * @param event 事件名稱
   * @param callback 回調函數
   */
  public once(event: string, callback: EventCallback): void {
    const wrappedCallback: EventCallback = (data) => {
      callback(data);
      this.off(event, wrappedCallback);
    };
    this.on(event, wrappedCallback);
  }

  /**
   * 取消訂閱事件
   * @param event 事件名稱
   * @param callback 回調函數
   */
  public off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      // 如果沒有監聽器了，刪除該事件
      if (callbacks.length === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * 發布事件
   * @param event 事件名稱
   * @param data 事件數據
   */
  public emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      // 複製陣列以避免在回調中修改監聽器列表時出現問題
      [...callbacks].forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  /**
   * 清除事件監聽器
   * @param event 事件名稱（可選，不提供則清除所有）
   */
  public clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * 獲取事件監聽器數量
   * @param event 事件名稱
   */
  public listenerCount(event: string): number {
    const callbacks = this.listeners.get(event);
    return callbacks ? callbacks.length : 0;
  }

  /**
   * 獲取所有事件名稱
   */
  public eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * 檢查是否有監聽器
   * @param event 事件名稱
   */
  public hasListeners(event: string): boolean {
    return this.listenerCount(event) > 0;
  }
}

/**
 * 全域事件總線實例
 */
export const eventBus = EventSystem.getInstance();

/**
 * 常用事件名稱常數
 */
export const GameEvents = {
  // 引擎事件
  ENGINE_START: 'engine:start',
  ENGINE_STOP: 'engine:stop',
  ENGINE_PAUSE: 'engine:pause',
  ENGINE_RESUME: 'engine:resume',

  // 場景事件
  SCENE_ENTER: 'scene:enter',
  SCENE_EXIT: 'scene:exit',
  SCENE_CHANGE: 'scene:change',

  // 玩家事件
  PLAYER_LEVEL_UP: 'player:levelUp',
  PLAYER_SKILL_UP: 'player:skillUp',
  PLAYER_MOVE: 'player:move',

  // 鳥類事件
  BIRD_DISCOVERED: 'bird:discovered',
  BIRD_OBSERVED: 'bird:observed',
  BIRD_IDENTIFIED: 'bird:identified',
  BIRD_PHOTOGRAPHED: 'bird:photographed',

  // 棲息地事件
  HABITAT_VISITED: 'habitat:visited',
  HABITAT_UNLOCKED: 'habitat:unlocked',

  // 任務事件
  QUEST_STARTED: 'quest:started',
  QUEST_COMPLETED: 'quest:completed',
  QUEST_FAILED: 'quest:failed',
  QUEST_PROGRESS: 'quest:progress',
  QUEST_UNLOCKED: 'quest:unlocked',
  QUEST_ABANDONED: 'quest:abandoned',

  // 成就事件
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  ACHIEVEMENT_PROGRESS: 'achievement:progress',

  // UI 事件
  BUTTON_CLICKED: 'ui:buttonClicked',
  MODAL_OPENED: 'ui:modalOpened',
  MODAL_CLOSED: 'ui:modalClosed',

  // 遊戲狀態事件
  GAME_SAVE: 'game:save',
  GAME_LOAD: 'game:load',
  GAME_RESET: 'game:reset',
} as const;

// Made with Bob
