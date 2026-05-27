import { GameObject } from './GameObject';
import { Camera } from './Camera';

/**
 * 場景基類
 * 所有遊戲場景都繼承自此類別
 */
export abstract class Scene {
  public name: string;
  protected gameObjects: GameObject[] = [];
  public camera: Camera;
  protected isInitialized: boolean = false;

  constructor(name: string) {
    this.name = name;
    this.camera = new Camera();
  }

  /**
   * 場景進入時調用
   */
  public abstract onEnter(): void;

  /**
   * 場景離開時調用
   */
  public abstract onExit(): void;

  /**
   * 初始化場景（僅調用一次）
   */
  protected initialize(): void {
    // 子類可以覆寫此方法進行初始化
    this.isInitialized = true;
  }

  /**
   * 更新場景
   * @param deltaTime 距離上次更新的時間（秒）
   */
  public update(deltaTime: number): void {
    if (!this.isInitialized) {
      this.initialize();
    }

    // 更新相機
    this.camera.update(deltaTime);

    // 更新所有遊戲物件
    for (const obj of this.gameObjects) {
      if (obj.active && !obj.destroyed) {
        obj.update(deltaTime);
      }
    }

    // 移除已標記為銷毀的物件
    this.gameObjects = this.gameObjects.filter((obj) => !obj.destroyed);
  }

  /**
   * 渲染場景
   * @param ctx Canvas 渲染上下文
   */
  public render(ctx: CanvasRenderingContext2D): void {
    const w = ctx.canvas.clientWidth;
    const h = ctx.canvas.clientHeight;
    this.camera.setViewSize(w, h);

    ctx.save();
    this.camera.apply(ctx, w, h);
    for (const obj of this.gameObjects) {
      if (obj.renderLayer === 'screen') continue;
      if (obj.visible && !obj.destroyed) {
        obj.render(ctx);
      }
    }
    ctx.restore();

    ctx.save();
    for (const obj of this.gameObjects) {
      if (obj.renderLayer !== 'screen') continue;
      if (obj.visible && !obj.destroyed) {
        obj.render(ctx);
      }
    }
    ctx.restore();
  }

  /**
   * 添加遊戲物件到場景
   * @param obj 遊戲物件
   */
  public addGameObject(obj: GameObject): void {
    obj.scene = this;
    this.gameObjects.push(obj);
  }

  /**
   * 從場景移除遊戲物件
   * @param obj 遊戲物件
   */
  public removeGameObject(obj: GameObject): void {
    const index = this.gameObjects.indexOf(obj);
    if (index > -1) {
      this.gameObjects.splice(index, 1);
    }
  }

  /**
   * 根據標籤查找遊戲物件
   * @param tag 標籤
   */
  public findGameObjectByTag(tag: string): GameObject | null {
    return this.gameObjects.find((obj) => obj.tag === tag) || null;
  }

  /**
   * 根據標籤查找所有遊戲物件
   * @param tag 標籤
   */
  public findGameObjectsByTag(tag: string): GameObject[] {
    return this.gameObjects.filter((obj) => obj.tag === tag);
  }

  /**
   * 根據 ID 查找遊戲物件
   * @param id ID
   */
  public findGameObjectById(id: string): GameObject | null {
    return this.gameObjects.find((obj) => obj.id === id) || null;
  }

  /**
   * 獲取所有遊戲物件
   */
  public getAllGameObjects(): GameObject[] {
    return [...this.gameObjects];
  }

  /**
   * 獲取相機
   */
  public getCamera(): Camera {
    return this.camera;
  }

  /** Called when the browser viewport / canvas size changes. */
  public onViewportResize(_width: number, _height: number): void {
    // Optional override in subclasses (e.g. refit map camera).
  }

  /**
   * 清除場景中的所有遊戲物件
   */
  public clear(): void {
    for (const obj of this.gameObjects) {
      obj.scene = null;
      obj.destroy();
    }
    this.gameObjects = [];
  }

  /**
   * 獲取場景中的遊戲物件數量
   */
  public getObjectCount(): number {
    return this.gameObjects.length;
  }
}

// Made with Bob
