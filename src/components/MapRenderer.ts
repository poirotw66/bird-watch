import { Component } from '../core/Component';
import { MapArea } from '../data/maps';
import { MapSystem } from '../systems/MapSystem';
import { eventBus } from '../core/EventSystem';
import { theme } from '../utils/uiTheme';
import { roundRectPath } from '../utils/canvasUi';

/**
 * Renders the current map area in world space (Scene camera transform applies).
 */
export class MapRenderer extends Component {
  private mapSystem: MapSystem;
  private currentArea: MapArea;
  private time: number = 0;

  constructor() {
    super();
    this.mapSystem = MapSystem.getInstance();
    this.currentArea = this.mapSystem.getCurrentArea();
    this.setupEventListeners();
  }

  public bindCamera(_camera: unknown): void {
    // Reserved for future culling.
  }

  private setupEventListeners(): void {
    eventBus.on('area:changed', (data: { currentArea: MapArea }) => {
      this.currentArea = data.currentArea;
    });
  }

  public update(deltaTime: number): void {
    this.currentArea = this.mapSystem.getCurrentArea();
    this.time += deltaTime;
  }

  public setCanvasSize(_width: number, _height: number): void {}

  public render(ctx: CanvasRenderingContext2D): void {
    this.renderSky(ctx);
    this.renderGround(ctx);
    this.renderObjects(ctx);
    this.renderConnections(ctx);
    this.renderVignette(ctx);
  }

  private renderSky(ctx: CanvasRenderingContext2D): void {
    const w = this.currentArea.width;
    const h = this.currentArea.height;
    const grad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    grad.addColorStop(0, theme.skyTop);
    grad.addColorStop(1, theme.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  private renderGround(ctx: CanvasRenderingContext2D): void {
    const w = this.currentArea.width;
    const h = this.currentArea.height;
    const groundGrad = ctx.createLinearGradient(0, h * 0.35, 0, h);
    groundGrad.addColorStop(0, this.currentArea.groundColor);
    groundGrad.addColorStop(1, '#3d6b32');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, h * 0.32, w, h);

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i < 120; i++) {
      const px = (i * 97) % w;
      const py = h * 0.4 + ((i * 53) % Math.floor(h * 0.6));
      ctx.beginPath();
      ctx.arc(px, py, 1.2 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderObjects(ctx: CanvasRenderingContext2D): void {
    this.currentArea.objects.forEach((obj) => {
      switch (obj.type) {
        case 'tree':
          this.renderTree(ctx, obj.x, obj.y, obj.width, obj.height);
          break;
        case 'water':
          this.renderWater(ctx, obj.x, obj.y, obj.width, obj.height);
          break;
        case 'grass':
          this.renderGrassPatch(ctx, obj.x, obj.y, obj.width, obj.height);
          break;
        case 'rock':
          this.renderRock(ctx, obj.x, obj.y, obj.width, obj.height);
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
    const cx = x + width / 2;
    const baseY = y + height;
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, baseY - 4, width * 0.35, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const trunkW = width * 0.18;
    const trunkGrad = ctx.createLinearGradient(x, y, x + width, y);
    trunkGrad.addColorStop(0, '#4a3728');
    trunkGrad.addColorStop(1, '#6d4c35');
    ctx.fillStyle = trunkGrad;
    ctx.fillRect(cx - trunkW / 2, y + height * 0.45, trunkW, height * 0.55);

    const foliageGrad = ctx.createRadialGradient(cx, y + height * 0.35, 4, cx, y + height * 0.35, width * 0.5);
    foliageGrad.addColorStop(0, '#5cab4a');
    foliageGrad.addColorStop(1, '#2d6b28');
    ctx.fillStyle = foliageGrad;
    ctx.beginPath();
    ctx.arc(cx, y + height * 0.32, width * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - width * 0.2, y + height * 0.38, width * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + width * 0.18, y + height * 0.4, width * 0.26, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderWater(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const wave = Math.sin(this.time * 2 + x * 0.02) * 3;
    const g = ctx.createLinearGradient(x, y, x, y + height);
    g.addColorStop(0, 'rgba(70, 160, 220, 0.75)');
    g.addColorStop(1, 'rgba(35, 90, 140, 0.85)');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y + wave, width, height, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private renderGrassPatch(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    ctx.fillStyle = 'rgba(90, 160, 70, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderRock(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    ctx.fillStyle = '#7a7f78';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.ellipse(x + width * 0.35, y + height * 0.35, width * 0.15, height * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderConnections(ctx: CanvasRenderingContext2D): void {
    const pulse = 0.85 + Math.sin(this.time * 4) * 0.15;
    this.currentArea.connections.forEach((conn) => {
      const { x, y } = conn.position;
      ctx.fillStyle = `rgba(232, 184, 109, ${0.25 * pulse})`;
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      const ring = ctx.createRadialGradient(x, y, 4, x, y, 14);
      ring.addColorStop(0, '#fff4d6');
      ring.addColorStop(1, '#c9a227');
      ctx.fillStyle = ring;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2a3d2e';
      ctx.font = `bold 11px ${theme.font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('E', x, y);
    });
  }

  private renderVignette(ctx: CanvasRenderingContext2D): void {
    const w = this.currentArea.width;
    const h = this.currentArea.height;
    const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.85);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(10,20,15,0.12)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }
}
