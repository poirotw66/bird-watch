import { theme } from './uiTheme';

export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function drawPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  options?: { radius?: number; title?: string },
): void {
  const radius = options?.radius ?? 14;
  ctx.save();
  ctx.shadowColor = theme.shadow;
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  roundRectPath(ctx, x, y, w, h, radius);
  ctx.fillStyle = theme.panelBg;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  roundRectPath(ctx, x, y, w, h, radius);
  ctx.strokeStyle = theme.panelBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (options?.title) {
    roundRectPath(ctx, x, y, w, 40, radius);
    ctx.fillStyle = theme.panelHeader;
    ctx.fill();
    ctx.fillStyle = theme.accent;
    ctx.font = `bold 16px ${theme.font}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(options.title, x + 16, y + 22);
  }
  ctx.restore();
}

export function drawChip(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
): number {
  ctx.font = `12px ${theme.font}`;
  const padX = 10;
  const w = ctx.measureText(text).width + padX * 2;
  const h = 24;
  roundRectPath(ctx, x, y, w, h, 12);
  ctx.fillStyle = 'rgba(110, 207, 138, 0.2)';
  ctx.fill();
  ctx.strokeStyle = theme.panelBorder;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = theme.text;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, y + h / 2);
  return w + 8;
}

export function drawSoftShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
