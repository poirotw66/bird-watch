import { eventBus } from './EventSystem';

/**
 * 輸入管理器
 * 處理鍵盤和滑鼠輸入
 */
export class InputManager {
  private static instance: InputManager;
  private keys: Map<string, boolean> = new Map();
  private previousKeys: Map<string, boolean> = new Map();
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private mouseButtons: Map<number, boolean> = new Map();
  private canvas: HTMLCanvasElement | null = null;

  private constructor() {
    this.setupEventListeners();
  }

  /**
   * 獲取單例實例
   */
  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  /**
   * 設定 Canvas 元素（用於滑鼠座標轉換）
   */
  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  /**
   * 設定事件監聽器
   */
  private setupEventListeners(): void {
    // 鍵盤事件
    window.addEventListener('keydown', (e) => {
      this.keys.set(e.code, true);
      // 防止方向鍵滾動頁面
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.set(e.code, false);
    });

    // 滑鼠事件
    window.addEventListener('mousemove', (e) => {
      if (this.canvas) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition.x = e.clientX - rect.left;
        this.mousePosition.y = e.clientY - rect.top;
      }
    });

    window.addEventListener('mousedown', (e) => {
      this.mouseButtons.set(e.button, true);
    });

    window.addEventListener('mouseup', (e) => {
      this.mouseButtons.set(e.button, false);
    });

    // 失去焦點時清除所有按鍵狀態
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.mouseButtons.clear();
    });
  }

  /**
   * 檢查按鍵是否被按下
   */
  public isKeyDown(keyCode: string): boolean {
    return this.keys.get(keyCode) || false;
  }

  /**
   * 檢查滑鼠按鈕是否被按下
   * @param button 0: 左鍵, 1: 中鍵, 2: 右鍵
   */
  public isMouseButtonDown(button: number): boolean {
    return this.mouseButtons.get(button) || false;
  }

  /**
   * 獲取滑鼠位置
   */
  public getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition };
  }

  /**
   * 檢查是否按下 WASD 或方向鍵
   */
  public getMovementInput(): { x: number; y: number } {
    const movement = { x: 0, y: 0 };

    // 左右移動
    if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) {
      movement.x -= 1;
    }
    if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) {
      movement.x += 1;
    }

    // 上下移動
    if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) {
      movement.y -= 1;
    }
    if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) {
      movement.y += 1;
    }

    return movement;
  }

  /**
   * 檢查是否按下互動鍵（空白鍵或 E）
   */
  public isInteractPressed(): boolean {
    return this.isKeyDown('Space') || this.isKeyDown('KeyE');
  }

  /**
   * 檢查是否按下觀察鍵（滑鼠左鍵或 F）
   */
  public isObservePressed(): boolean {
    return this.isMouseButtonDown(0) || this.isKeyDown('KeyF');
  }

  /**
   * 更新輸入狀態（每幀調用）
   */
  public update(): void {
    // 保存上一幀的按鍵狀態
    this.previousKeys.clear();
    this.keys.forEach((value, key) => {
      this.previousKeys.set(key, value);
    });
  }

  /**
   * 檢查按鍵是否剛被按下（單次觸發）
   */
  public isKeyJustPressed(keyCode: string): boolean {
    return this.isKeyDown(keyCode) && !this.previousKeys.get(keyCode);
  }

  /**
   * 發送輸入事件到事件系統
   */
  public emitInputEvents(): void {
    // 檢查互動鍵
    if (this.isKeyJustPressed('KeyE')) {
      eventBus.emit('input:interact', {});
    }

    if (this.isKeyJustPressed('KeyM')) {
      eventBus.emit('input:toggle_map', {});
    }
  }

  /**
   * 清除所有輸入狀態
   */
  public clear(): void {
    this.keys.clear();
    this.previousKeys.clear();
    this.mouseButtons.clear();
  }
}

// 導出單例實例
export const inputManager = InputManager.getInstance();

// Made with Bob
