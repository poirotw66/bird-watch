import { Component } from '@/core/Component';
import { SimpleBirdData } from '@/data/simpleBirds';
import { birdImageLoader } from '@/utils/birdImageLoader';
import { drawSoftShadow, roundRectPath } from '@/utils/canvasUi';
import { theme } from '@/utils/uiTheme';

/**
 * Bird sprite with photo, shadow, and name plate.
 */
export class BirdSprite extends Component {
  private birdData: SimpleBirdData;
  private state: 'idle' | 'flying' | 'feeding' = 'idle';
  private animationTime: number = 0;
  private flightPath: { x: number; y: number }[] = [];
  private currentPathIndex: number = 0;
  private speed: number = 50;
  private detectionRadius: number = 120;
  private initialized: boolean = false;

  constructor(birdData: SimpleBirdData) {
    super();
    this.birdData = birdData;
  }

  public onAttach(): void {
    this.generateFlightPath();
    this.initialized = true;
  }

  private generateFlightPath(): void {
    if (!this.gameObject) return;

    const numPoints = 3 + Math.floor(Math.random() * 3);
    this.flightPath = [];

    for (let i = 0; i < numPoints; i++) {
      this.flightPath.push({
        x: this.gameObject.position.x + (Math.random() - 0.5) * 200,
        y: this.gameObject.position.y + (Math.random() - 0.5) * 200,
      });
    }
  }

  public getBirdData(): SimpleBirdData {
    return this.birdData;
  }

  public setState(state: 'idle' | 'flying' | 'feeding'): void {
    this.state = state;
  }

  public isPlayerNearby(playerX: number, playerY: number): boolean {
    const dx = playerX - this.gameObject.position.x;
    const dy = playerY - this.gameObject.position.y;
    return Math.hypot(dx, dy) < this.detectionRadius;
  }

  public update(deltaTime: number): void {
    if (!this.initialized) return;

    this.animationTime += deltaTime;

    if (this.state === 'flying' && this.flightPath.length > 0) {
      const target = this.flightPath[this.currentPathIndex];
      const dx = target.x - this.gameObject.position.x;
      const dy = target.y - this.gameObject.position.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 5) {
        this.currentPathIndex = (this.currentPathIndex + 1) % this.flightPath.length;
      } else {
        const moveDistance = this.speed * deltaTime;
        this.gameObject.position.x += (dx / distance) * moveDistance;
        this.gameObject.position.y += (dy / distance) * moveDistance;
      }
    } else if (Math.random() < 0.001) {
      this.state = 'flying';
      this.generateFlightPath();
    } else if (Math.random() < 0.002) {
      this.state = 'idle';
    }
  }

  private rarityAccent(): string {
    switch (this.birdData.rarity) {
      case 'uncommon':
        return '#6eb5ff';
      case 'rare':
        return '#c49bff';
      case 'legendary':
        return '#ffc266';
      default:
        return theme.accent;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const bob = Math.sin(this.animationTime * 3) * 2;
    const displaySize = Math.max(36, Math.min(64, this.birdData.size * 2.2));
    const photo = birdImageLoader.getMedium(this.birdData.id);

    drawSoftShadow(ctx, 0, 12, displaySize * 0.45, 6);

    ctx.save();
    ctx.translate(0, bob);

    const accent = this.rarityAccent();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, displaySize / 2 + 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, displaySize / 2, 0, Math.PI * 2);
    ctx.clip();
    if (photo) {
      ctx.drawImage(photo, -displaySize / 2, -displaySize / 2, displaySize, displaySize);
    } else {
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.35;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    if (this.state !== 'flying') {
      const label = this.birdData.name;
      ctx.font = `bold 12px ${theme.font}`;
      const tw = ctx.measureText(label).width + 16;
      const th = 22;
      const tx = -tw / 2;
      const ty = -displaySize / 2 - th - 6;
      roundRectPath(ctx, tx, ty, tw, th, 10);
      ctx.fillStyle = 'rgba(18, 28, 24, 0.85)';
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = theme.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 0, ty + th / 2);
    }

    ctx.restore();
  }
}
