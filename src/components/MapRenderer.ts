import { Component } from '../core/Component';
import { Camera } from '../core/Camera';
import { MapArea } from '../data/maps';
import { MapSystem } from '../systems/MapSystem';
import { eventBus } from '../core/EventSystem';

/**
 * Renders the current map area in world space (Scene camera transform applies).
 */
export class MapRenderer extends Component {
  private mapSystem: MapSystem;
  private currentArea: MapArea;
  private boundCamera: Camera | null = null;

  constructor() {
    super();
    this.mapSystem = MapSystem.getInstance();
    this.currentArea = this.mapSystem.getCurrentArea();
    this.setupEventListeners();
  }

  public bindCamera(camera: Camera): void {
    this.boundCamera = camera;
  }

  private setupEventListeners(): void {
    eventBus.on('area:changed', (data: { currentArea: MapArea }) => {
      this.currentArea = data.currentArea;
    });
  }

  public update(_deltaTime: number): void {
    this.currentArea = this.mapSystem.getCurrentArea();
  }

  public setCanvasSize(_width: number, _height: number): void {
    // Reserved for future viewport culling.
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const camera = this.boundCamera ?? this.gameObject?.scene?.camera;
    if (!camera) {
      this.renderWorldFallback(ctx);
      return;
    }

    this.renderBackground(ctx);
    this.renderGround(ctx);
    this.renderObjects(ctx);
    this.renderConnections(ctx);
  }

  private renderWorldFallback(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.currentArea.backgroundColor;
    ctx.fillRect(0, 0, this.currentArea.width, this.currentArea.height);
    ctx.fillStyle = this.currentArea.groundColor;
    ctx.fillRect(0, 0, this.currentArea.width, this.currentArea.height);
  }

  private renderBackground(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.currentArea.backgroundColor;
    ctx.fillRect(0, 0, this.currentArea.width, this.currentArea.height);
  }

  private renderGround(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.currentArea.groundColor;
    ctx.fillRect(0, 0, this.currentArea.width, this.currentArea.height);

    const gridSize = 50;
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.currentArea.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.currentArea.height);
      ctx.stroke();
    }
    for (let y = 0; y <= this.currentArea.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.currentArea.width, y);
      ctx.stroke();
    }
  }

  private renderObjects(ctx: CanvasRenderingContext2D): void {
    this.currentArea.objects.forEach((obj) => {
      switch (obj.type) {
        case 'tree':
          this.renderTree(ctx, obj.x, obj.y, obj.width, obj.height);
          break;
        case 'water':
          ctx.fillStyle = 'rgba(30, 120, 200, 0.55)';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          break;
        case 'grass':
          ctx.fillStyle = 'rgba(60, 140, 60, 0.45)';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          break;
        case 'rock':
          ctx.fillStyle = '#6b6b6b';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          break;
      }
    });
  }

  private renderTree(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x + width * 0.4, y + height * 0.5, width * 0.2, height * 0.5);
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height * 0.35, width * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderConnections(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255, 215, 0, 0.85)';
    this.currentArea.connections.forEach((conn) => {
      ctx.beginPath();
      ctx.arc(conn.position.x, conn.position.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#222';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(conn.direction[0].toUpperCase(), conn.position.x, conn.position.y + 4);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.85)';
    });
  }
}
