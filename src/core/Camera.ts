import { Vector2 } from '@/utils/Vector2';

/**
 * 相機類別
 * 處理視角和畫面移動
 */
export class Camera {
  public position: Vector2;
  public zoom: number = 1;
  private target: Vector2 | null = null;
  private followSpeed: number = 5;
  private worldWidth: number = 0;
  private worldHeight: number = 0;
  private viewWidth: number = 0;
  private viewHeight: number = 0;
  private followPlayer: boolean = false;

  constructor(x: number = 0, y: number = 0) {
    this.position = new Vector2(x, y);
  }

  /**
   * 設定相機跟隨目標
   */
  public setTarget(target: Vector2): void {
    this.target = target;
  }

  public setFollowEnabled(enabled: boolean): void {
    this.followPlayer = enabled;
  }

  public setViewSize(width: number, height: number): void {
    this.viewWidth = width;
    this.viewHeight = height;
  }

  public setWorldBounds(width: number, height: number): void {
    this.worldWidth = width;
    this.worldHeight = height;
  }

  /**
   * Zoom so the entire world fits in the viewport (panoramic overview).
   */
  public fitToWorld(padding: number = 0.98): void {
    if (this.worldWidth <= 0 || this.worldHeight <= 0) {
      return;
    }
    if (this.viewWidth <= 0 || this.viewHeight <= 0) {
      return;
    }
    const zoomX = this.viewWidth / this.worldWidth;
    const zoomY = this.viewHeight / this.worldHeight;
    this.zoom = Math.min(zoomX, zoomY) * padding;
    this.position.x = this.worldWidth / 2;
    this.position.y = this.worldHeight / 2;
    this.followPlayer = false;
    this.target = null;
  }

  private clampPositionToWorld(): void {
    if (this.worldWidth <= 0 || this.viewWidth <= 0) {
      return;
    }
    const halfW = this.viewWidth / 2 / this.zoom;
    const halfH = this.viewHeight / 2 / this.zoom;

    if (this.worldWidth <= halfW * 2) {
      this.position.x = this.worldWidth / 2;
    } else {
      this.position.x = Math.max(halfW, Math.min(this.worldWidth - halfW, this.position.x));
    }

    if (this.worldHeight <= halfH * 2) {
      this.position.y = this.worldHeight / 2;
    } else {
      this.position.y = Math.max(halfH, Math.min(this.worldHeight - halfH, this.position.y));
    }
  }

  /**
   * 清除跟隨目標
   */
  public clearTarget(): void {
    this.target = null;
  }

  /**
   * 設定跟隨速度
   */
  public setFollowSpeed(speed: number): void {
    this.followSpeed = speed;
  }

  /**
   * 更新相機位置
   */
  public update(deltaTime: number): void {
    if (this.followPlayer && this.target) {
      const dx = this.target.x - this.position.x;
      const dy = this.target.y - this.position.y;

      this.position.x += dx * this.followSpeed * deltaTime;
      this.position.y += dy * this.followSpeed * deltaTime;
      this.clampPositionToWorld();
    }
  }

  /**
   * 應用相機變換到渲染上下文
   */
  public apply(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
    ctx.save();
    
    // 移動到畫面中心
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    
    // 應用縮放
    ctx.scale(this.zoom, this.zoom);
    
    // 應用相機位置（反向移動）
    ctx.translate(-this.position.x, -this.position.y);
  }

  /**
   * 恢復渲染上下文
   */
  public restore(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }

  /**
   * 世界座標轉螢幕座標
   */
  public worldToScreen(worldPos: Vector2, canvasWidth: number, canvasHeight: number): Vector2 {
    return new Vector2(
      (worldPos.x - this.position.x) * this.zoom + canvasWidth / 2,
      (worldPos.y - this.position.y) * this.zoom + canvasHeight / 2
    );
  }

  /**
   * 螢幕座標轉世界座標
   */
  public screenToWorld(screenPos: Vector2, canvasWidth: number, canvasHeight: number): Vector2 {
    return new Vector2(
      (screenPos.x - canvasWidth / 2) / this.zoom + this.position.x,
      (screenPos.y - canvasHeight / 2) / this.zoom + this.position.y
    );
  }
}

// Made with Bob
