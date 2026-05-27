import { Component } from '@/core/Component';
import { observationSystem } from '@/systems/ObservationSystem';

/**
 * 觀察 UI 組件
 * 顯示當前觀察狀態和進度
 */
export class ObservationUI extends Component {
  public update(_deltaTime: number): void {
    // UI 不需要更新邏輯
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!observationSystem.isObserving()) {
      return;
    }

    const observation = observationSystem.getCurrentObservation();
    if (!observation) return;

    const duration = observationSystem.getObservationDuration();
    const birdName = observation.birdData.name;
    const distance = Math.floor(observation.distance);

    ctx.save();

    // 繪製觀察面板
    const panelX = ctx.canvas.width / 2 - 200;
    const panelY = 50;
    const panelWidth = 400;
    const panelHeight = 120;

    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    // 邊框
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    // 標題
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔍 觀察中', panelX + panelWidth / 2, panelY + 30);

    // 鳥類名稱
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText(birdName, panelX + panelWidth / 2, panelY + 55);

    // 距離和時間
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`距離: ${distance}m`, panelX + 20, panelY + 80);
    ctx.fillText(`時長: ${duration.toFixed(1)}s`, panelX + 20, panelY + 100);

    // 進度條
    const progressBarX = panelX + 150;
    const progressBarY = panelY + 70;
    const progressBarWidth = 220;
    const progressBarHeight = 30;

    // 進度條背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

    // 進度條填充（基於時長，5秒為滿）
    const progress = Math.min(duration / 5, 1);
    const fillWidth = progressBarWidth * progress;
    
    // 根據進度改變顏色
    if (progress < 0.3) {
      ctx.fillStyle = '#f44336'; // 紅色
    } else if (progress < 0.6) {
      ctx.fillStyle = '#FF9800'; // 橙色
    } else {
      ctx.fillStyle = '#4CAF50'; // 綠色
    }
    ctx.fillRect(progressBarX, progressBarY, fillWidth, progressBarHeight);

    // 進度條邊框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

    // 進度百分比
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${Math.floor(progress * 100)}%`,
      progressBarX + progressBarWidth / 2,
      progressBarY + progressBarHeight / 2 + 5
    );

    // 提示文字
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#aaaaaa';
    
    if (duration < 1) {
      ctx.fillText('保持觀察...', panelX + panelWidth / 2, panelY + panelHeight + 20);
    } else if (duration < 3) {
      ctx.fillText('繼續觀察以提高識別率', panelX + panelWidth / 2, panelY + panelHeight + 20);
    } else if (duration < 5) {
      ctx.fillText('觀察品質良好！', panelX + panelWidth / 2, panelY + panelHeight + 20);
    } else {
      ctx.fillText('完美的觀察！按 F 或點擊結束', panelX + panelWidth / 2, panelY + panelHeight + 20);
    }

    ctx.restore();
  }
}

// Made with Bob
