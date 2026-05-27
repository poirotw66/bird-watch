import { Component } from '@/core/Component';
import { observationSystem } from '@/systems/ObservationSystem';
import { getViewport } from '@/utils/viewport';
import { drawPanel, roundRectPath } from '@/utils/canvasUi';
import { theme } from '@/utils/uiTheme';

/**
 * Observation progress overlay.
 */
export class ObservationUI extends Component {
  public update(_deltaTime: number): void {}

  public render(ctx: CanvasRenderingContext2D): void {
    if (!observationSystem.isObserving()) {
      return;
    }

    const observation = observationSystem.getCurrentObservation();
    if (!observation) return;

    const duration = observationSystem.getObservationDuration();
    const birdName = observation.birdData.name;
    const distance = Math.floor(observation.distance);
    const progress = Math.min(duration / 5, 1);

    const { width: vw } = getViewport(ctx);
    const panelWidth = Math.min(420, vw - 40);
    const panelHeight = 130;
    const panelX = (vw - panelWidth) / 2;
    const panelY = 48;

    drawPanel(ctx, panelX, panelY, panelWidth, panelHeight, { title: '觀察中' });

    ctx.fillStyle = theme.text;
    ctx.font = `bold 18px ${theme.font}`;
    ctx.textAlign = 'center';
    ctx.fillText(birdName, panelX + panelWidth / 2, panelY + 58);

    ctx.font = `13px ${theme.font}`;
    ctx.fillStyle = theme.textMuted;
    ctx.textAlign = 'left';
    ctx.fillText(`距離 ${distance}m · ${duration.toFixed(1)} 秒`, panelX + 20, panelY + 82);

    const barX = panelX + 20;
    const barY = panelY + 96;
    const barW = panelWidth - 40;
    const barH = 14;
    roundRectPath(ctx, barX, barY, barW, barH, 7);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fill();
    const fillColor =
      progress < 0.3 ? '#e57373' : progress < 0.6 ? theme.accentWarm : theme.accent;
    ctx.fillStyle = fillColor;
    roundRectPath(ctx, barX, barY, barW * progress, barH, 7);
    ctx.fill();
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'right';
    ctx.font = `12px ${theme.font}`;
    ctx.fillText(`${Math.floor(progress * 100)}%`, panelX + panelWidth - 20, barY - 6);

    ctx.textAlign = 'center';
    ctx.fillStyle = theme.textMuted;
    ctx.font = `12px ${theme.font}`;
    const hint =
      duration < 1
        ? '保持對準鳥類…'
        : duration < 5
          ? '再放開 F 或滑鼠左鍵以完成觀察'
          : '可放開鍵完成觀察';
    ctx.fillText(hint, panelX + panelWidth / 2, panelY + panelHeight + 18);
  }
}
