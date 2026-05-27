import { Component } from '@/core/Component';
import { inputManager } from '@/core/InputManager';
import { MapSystem } from '@/systems/MapSystem';
import { drawSoftShadow } from '@/utils/canvasUi';
import { theme } from '@/utils/uiTheme';

/**
 * Player avatar — birder with binoculars (stylized).
 */
export class PlayerController extends Component {
  private speed: number = 220;
  private velocity: { x: number; y: number } = { x: 0, y: 0 };
  private walkPhase: number = 0;

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

    const moving = input.x !== 0 || input.y !== 0;
    if (moving) {
      this.walkPhase += deltaTime * 10;
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
    const bob = Math.sin(this.walkPhase) * 2;
    drawSoftShadow(ctx, 0, 10, 14, 5);

    ctx.save();
    ctx.translate(0, bob);

    const bodyGrad = ctx.createLinearGradient(-12, -8, 12, 20);
    bodyGrad.addColorStop(0, '#4a7c59');
    bodyGrad.addColorStop(1, '#2f5238');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 6, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e8c9a8';
    ctx.beginPath();
    ctx.arc(0, -14, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5a4030';
    ctx.fillRect(-11, -16, 22, 6);

    ctx.strokeStyle = '#1a2a20';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, -12);
    ctx.lineTo(-14, -18);
    ctx.moveTo(8, -12);
    ctx.lineTo(14, -18);
    ctx.stroke();

    ctx.fillStyle = '#3d4f45';
    ctx.fillRect(-16, -6, 10, 8);
    ctx.fillRect(6, -6, 10, 8);
    ctx.fillStyle = theme.accentWarm;
    ctx.beginPath();
    ctx.arc(-11, -2, 3, 0, Math.PI * 2);
    ctx.arc(11, -2, 3, 0, Math.PI * 2);
    ctx.fill();

    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      const angle = Math.atan2(this.velocity.y, this.velocity.x);
      ctx.strokeStyle = 'rgba(110, 207, 138, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 28, Math.sin(angle) * 28);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }
}
