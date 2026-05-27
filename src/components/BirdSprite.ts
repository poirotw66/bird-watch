import { Component } from '@/core/Component';
import { SimpleBirdData } from '@/data/simpleBirds';
import { birdImageLoader } from '@/utils/birdImageLoader';

/**
 * Bird sprite: draws catalog photo when loaded, otherwise a simple placeholder.
 */
export class BirdSprite extends Component {
  private birdData: SimpleBirdData;
  private state: 'idle' | 'flying' | 'feeding' = 'idle';
  private animationTime: number = 0;
  private flightPath: { x: number; y: number }[] = [];
  private currentPathIndex: number = 0;
  private speed: number = 50;
  private detectionRadius: number = 100;
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
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.detectionRadius;
  }

  public update(deltaTime: number): void {
    if (!this.initialized) return;

    this.animationTime += deltaTime;

    if (this.state === 'flying' && this.flightPath.length > 0) {
      const target = this.flightPath[this.currentPathIndex];
      const dx = target.x - this.gameObject.position.x;
      const dy = target.y - this.gameObject.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

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

  private drawPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    let color = '#8BC34A';
    switch (this.birdData.rarity) {
      case 'uncommon':
        color = '#2196F3';
        break;
      case 'rare':
        color = '#9C27B0';
        break;
      case 'legendary':
        color = '#FF9800';
        break;
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y - size * 0.3, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const x = 0;
    const y = 0;
    const displaySize = Math.max(28, Math.min(56, this.birdData.size * 2));
    const photo = birdImageLoader.getMedium(this.birdData.id);

    if (photo) {
      const w = displaySize;
      const h = displaySize;
      ctx.drawImage(photo, x - w / 2, y - h / 2, w, h);
    } else {
      const size = Math.max(8, this.birdData.size / 3);
      this.drawPlaceholder(ctx, x, y, size);
    }

    if (this.state !== 'flying') {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText(this.birdData.name, x, y - displaySize / 2 - 8);
      ctx.fillText(this.birdData.name, x, y - displaySize / 2 - 8);
    }

    ctx.restore();
  }
}
