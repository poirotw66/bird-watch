import { Component } from '@/core/Component';
import { inputManager } from '@/core/InputManager';
import { MapSystem } from '@/systems/MapSystem';

/**
 * Player movement with bounds from the active map area.
 */
export class PlayerController extends Component {
  private speed: number = 220;
  private velocity: { x: number; y: number } = { x: 0, y: 0 };

  public setSpeed(speed: number): void {
    this.speed = speed;
  }

  public getVelocity(): { x: number; y: number } {
    return { ...this.velocity };
  }

  public update(deltaTime: number): void {
    const input = inputManager.getMovementInput();

    this.velocity.x = input.x * this.speed;
    this.velocity.y = input.y * this.speed;

    if (input.x !== 0 && input.y !== 0) {
      const length = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
      this.velocity.x = (this.velocity.x / length) * this.speed;
      this.velocity.y = (this.velocity.y / length) * this.speed;
    }

    this.gameObject.position.x += this.velocity.x * deltaTime;
    this.gameObject.position.y += this.velocity.y * deltaTime;

    const area = MapSystem.getInstance().getCurrentArea();
    const padding = 24;
    this.gameObject.position.x = Math.max(
      padding,
      Math.min(area.width - padding, this.gameObject.position.x),
    );
    this.gameObject.position.y = Math.max(
      padding,
      Math.min(area.height - padding, this.gameObject.position.y),
    );
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      const angle = Math.atan2(this.velocity.y, this.velocity.x);
      const length = 25;
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
      ctx.stroke();
    }

    ctx.restore();
  }
}
