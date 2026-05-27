import { Scene } from './Scene';
import { eventBus, GameEvents } from './EventSystem';
import { inputManager } from './InputManager';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

/**
 * 遊戲引擎類別
 * 管理遊戲循環、場景切換和渲染
 */
export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentScene: Scene | null = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private lastTime: number = 0;
  private fps: number = 60;
  private frameTime: number = 1000 / this.fps;
  private actualFPS: number = 0;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;
  private performanceMonitor: PerformanceMonitor;
  private showPerformanceHUD: boolean = false;
  private viewportWidth: number = 0;
  private viewportHeight: number = 0;

  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }

    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    this.ctx = ctx;
    this.setupCanvas();
    this.setupEventListeners();
    
    // 設置 InputManager 的 canvas
    inputManager.setCanvas(this.canvas);
    
    // 初始化效能監控器
    this.performanceMonitor = PerformanceMonitor.getInstance();
    
    // 開發模式下顯示效能 HUD
    if (process.env.NODE_ENV === 'development') {
      this.showPerformanceHUD = true;
    }
  }

  /**
   * 設定 Canvas 尺寸和解析度
   */
  private setupCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.viewportWidth = rect.width;
    this.viewportHeight = rect.height;

    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    // 設定渲染品質
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  /**
   * 設定事件監聽器
   */
  private setupEventListeners(): void {
    // 視窗大小改變時重新設定 Canvas
    window.addEventListener('resize', () => {
      this.setupCanvas();
      inputManager.setCanvas(this.canvas);
      if (this.currentScene) {
        this.currentScene.onViewportResize(this.viewportWidth, this.viewportHeight);
      }
    });

    // 頁面可見性改變時暫停/恢復遊戲
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  /**
   * 啟動遊戲引擎
   */
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.fpsUpdateTime = this.lastTime;

    eventBus.emit(GameEvents.ENGINE_START);
    this.gameLoop(this.lastTime);
  }

  /**
   * 停止遊戲引擎
   */
  public stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    eventBus.emit(GameEvents.ENGINE_STOP);
  }

  /**
   * 暫停遊戲
   */
  public pause(): void {
    if (!this.isRunning || this.isPaused) return;
    this.isPaused = true;
    eventBus.emit(GameEvents.ENGINE_PAUSE);
  }

  /**
   * 恢復遊戲
   */
  public resume(): void {
    if (!this.isRunning || !this.isPaused) return;
    this.isPaused = false;
    this.lastTime = performance.now(); // 重置時間以避免大的 deltaTime
    eventBus.emit(GameEvents.ENGINE_RESUME);
  }

  /**
   * 遊戲主循環
   * @param currentTime 當前時間戳
   */
  private gameLoop(currentTime: number): void {
    if (!this.isRunning) return;

    // 開始幀計時
    this.performanceMonitor.beginFrame();

    const deltaTime = currentTime - this.lastTime;

    // 固定時間步長更新
    if (deltaTime >= this.frameTime) {
      // 計算實際 FPS
      this.frameCount++;
      if (currentTime - this.fpsUpdateTime >= 1000) {
        this.actualFPS = this.frameCount;
        this.frameCount = 0;
        this.fpsUpdateTime = currentTime;
        
        // 更新記憶體使用量
        this.performanceMonitor.updateMemoryUsage();
      }

      // 更新和渲染
      if (!this.isPaused) {
        this.performanceMonitor.beginUpdate();
        this.update(deltaTime / 1000); // 轉換為秒
        this.performanceMonitor.endUpdate();
      }
      
      this.performanceMonitor.beginRender();
      this.render();
      this.performanceMonitor.endRender();

      this.lastTime = currentTime - (deltaTime % this.frameTime);
    }

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  /**
   * 更新遊戲邏輯
   * @param deltaTime 距離上次更新的時間（秒）
   */
  private update(deltaTime: number): void {
    // 更新輸入管理器
    inputManager.update();
    inputManager.emitInputEvents();

    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }
  }

  /**
   * 渲染遊戲畫面
   */
  private render(): void {
    // 清除畫布
    this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

    // 渲染當前場景
    if (this.currentScene) {
      this.currentScene.render(this.ctx);
    }

    // 渲染效能 HUD（開發模式）
    if (this.showPerformanceHUD) {
      this.performanceMonitor.renderHUD(this.ctx, 10, 10);
    }
  }

  /**
   * 切換效能 HUD 顯示
   */
  public togglePerformanceHUD(): void {
    this.showPerformanceHUD = !this.showPerformanceHUD;
  }

  /**
   * 取得效能監控器
   */
  public getPerformanceMonitor(): PerformanceMonitor {
    return this.performanceMonitor;
  }

  public getViewportSize(): { width: number; height: number } {
    return { width: this.viewportWidth, height: this.viewportHeight };
  }

  /**
   * 載入場景
   * @param scene 場景實例
   */
  public loadScene(scene: Scene): void {
    // 離開當前場景
    if (this.currentScene) {
      this.currentScene.onExit();
      eventBus.emit(GameEvents.SCENE_EXIT, { scene: this.currentScene.name });
    }

    // 進入新場景
    this.currentScene = scene;
    this.currentScene.onEnter();
    eventBus.emit(GameEvents.SCENE_ENTER, { scene: this.currentScene.name });
    eventBus.emit(GameEvents.SCENE_CHANGE, {
      from: this.currentScene?.name,
      to: scene.name,
    });
  }

  /**
   * 獲取當前場景
   */
  public getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  /**
   * 獲取 Canvas 渲染上下文
   */
  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * 獲取 Canvas 元素
   */
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 獲取當前 FPS
   */
  public getFPS(): number {
    return this.actualFPS;
  }

  /**
   * 設定目標 FPS
   * @param fps 目標 FPS
   */
  public setTargetFPS(fps: number): void {
    this.fps = Math.max(1, Math.min(144, fps)); // 限制在 1-144 之間
    this.frameTime = 1000 / this.fps;
  }

  /**
   * 檢查引擎是否正在運行
   */
  public isEngineRunning(): boolean {
    return this.isRunning;
  }

  /**
   * 檢查遊戲是否暫停
   */
  public isGamePaused(): boolean {
    return this.isPaused;
  }

  /**
   * 截圖
   * @returns 圖片的 Data URL
   */
  public screenshot(): string {
    return this.canvas.toDataURL('image/png');
  }

  /**
   * 銷毀引擎
   */
  public destroy(): void {
    this.stop();
    if (this.currentScene) {
      this.currentScene.onExit();
      this.currentScene = null;
    }
    // 移除事件監聽器
    window.removeEventListener('resize', () => this.setupCanvas());
  }
}

// Made with Bob
