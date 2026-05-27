import { Component } from '../core/Component';
import { MapSystem } from '../systems/MapSystem';
import { EventSystem } from '../core/EventSystem';
import { MAP_AREAS } from '../data/maps';
import { getViewport } from '../utils/viewport';
import { drawPanel, roundRectPath } from '../utils/canvasUi';
import { theme } from '../utils/uiTheme';

/**
 * 地圖 UI 組件
 * 顯示小地圖、區域資訊和探索進度
 */
export class MapUI extends Component {
  private mapSystem: MapSystem;
  private eventSystem: EventSystem;
  private isMapOpen: boolean = false;
  private miniMapSize: number = 150;
  private miniMapPadding: number = 10;

  constructor() {
    super();
    this.mapSystem = MapSystem.getInstance();
    this.eventSystem = EventSystem.getInstance();
  }

  public onAttach(): void {
    super.onAttach();

    // 監聽地圖開關按鍵
    this.eventSystem.on('input:toggle_map', this.toggleMap.bind(this));

    // 監聽區域切換
    this.eventSystem.on('area:changed', this.onAreaChanged.bind(this));
  }

  public onDetach(): void {
    this.eventSystem.off('input:toggle_map', this.toggleMap.bind(this));
    this.eventSystem.off('area:changed', this.onAreaChanged.bind(this));
    super.onDetach();
  }

  /**
   * 切換地圖顯示
   */
  private toggleMap(): void {
    this.isMapOpen = !this.isMapOpen;
  }

  /**
   * 區域切換事件處理
   */
  private onAreaChanged(): void {
    // 可以在這裡添加區域切換的動畫效果
  }

  /**
   * 更新組件
   */
  public update(_deltaTime: number): void {
    // UI 不需要更新邏輯
  }

  /**
   * 渲染組件
   */
  public render(ctx: CanvasRenderingContext2D): void {
    if (this.isMapOpen) {
      this.renderFullMap(ctx);
    } else {
      this.renderMiniMap(ctx);
    }

    this.renderAreaInfo(ctx);
  }

  /**
   * 渲染小地圖
   */
  private renderMiniMap(ctx: CanvasRenderingContext2D): void {
    const { width: vw, height: vh } = getViewport(ctx);
    const boxW = this.miniMapSize;
    const boxH = this.miniMapSize + 36;
    const x = vw - boxW - this.miniMapPadding;
    const y = vh - boxH - 64;

    const currentArea = this.mapSystem.getCurrentArea();
    const innerX = x + 8;
    const innerY = y + 44;
    const innerSize = boxW - 16;
    const scale = innerSize / Math.max(currentArea.width, currentArea.height);

    drawPanel(ctx, x, y, boxW, boxH, { title: currentArea.name });

    ctx.fillStyle = currentArea.groundColor;
    roundRectPath(ctx, innerX, innerY, innerSize, innerSize, 8);
    ctx.fill();

    currentArea.connections.forEach((conn) => {
      const connX = innerX + conn.position.x * scale;
      const connY = innerY + conn.position.y * scale;
      ctx.fillStyle = theme.accentWarm;
      ctx.beginPath();
      ctx.arc(connX, connY, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = theme.textMuted;
    ctx.font = `11px ${theme.font}`;
    ctx.textAlign = 'center';
    ctx.fillText('M 世界地圖', x + boxW / 2, y + boxH - 10);
  }

  /**
   * 渲染完整地圖
   */
  private renderFullMap(ctx: CanvasRenderingContext2D): void {
    const { width: vw, height: vh } = getViewport(ctx);
    const width = vw * 0.8;
    const height = vh * 0.8;
    const x = (vw - width) / 2;
    const y = (vh - height) / 2;

    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, vw, vh);

    // 地圖背景
    ctx.fillStyle = 'rgba(40, 40, 40, 0.95)';
    ctx.fillRect(x, y, width, height);

    // 邊框
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    // 標題
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('世界地圖', vw / 2, y + 40);

    // 繪製所有區域
    const gridCols = 3;
    const gridRows = 2;
    const cellWidth = (width - 100) / gridCols;
    const cellHeight = (height - 150) / gridRows;
    const startX = x + 50;
    const startY = y + 80;

    MAP_AREAS.forEach((area, index) => {
      const col = index % gridCols;
      const row = Math.floor(index / gridCols);
      const cellX = startX + col * cellWidth;
      const cellY = startY + row * cellHeight;

      this.renderAreaCell(ctx, area.id, cellX, cellY, cellWidth - 20, cellHeight - 20);
    });

    // 探索統計
    const visitedCount = this.mapSystem.getVisitedAreasCount();
    const totalCount = MAP_AREAS.length;
    const explorationPercent = this.mapSystem.getTotalExplorationProgress().toFixed(1);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(
      `已探索區域：${visitedCount}/${totalCount}`,
      x + 50,
      y + height - 40
    );
    ctx.fillText(
      `總探索進度：${explorationPercent}%`,
      x + 50,
      y + height - 20
    );

    // 關閉提示
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('按 M 或 ESC 關閉', vw / 2, y + height - 20);

    ctx.restore();
  }

  /**
   * 渲染區域格子
   */
  private renderAreaCell(
    ctx: CanvasRenderingContext2D,
    areaId: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const area = MAP_AREAS.find((a) => a.id === areaId);
    if (!area) return;

    const isVisited = this.mapSystem.hasVisited(areaId);
    const isCurrent = this.mapSystem.getCurrentArea().id === areaId;
    const progress = this.mapSystem.getExplorationProgress(areaId);

    ctx.save();

    // 背景
    if (isVisited) {
      ctx.fillStyle = area.groundColor;
      ctx.globalAlpha = 0.3;
    } else {
      ctx.fillStyle = '#333333';
      ctx.globalAlpha = 0.5;
    }
    ctx.fillRect(x, y, width, height);
    ctx.globalAlpha = 1;

    // 邊框
    if (isCurrent) {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 3;
    } else if (isVisited) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
    } else {
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 1;
    }
    ctx.strokeRect(x, y, width, height);

    // 區域名稱
    ctx.fillStyle = isVisited ? '#FFFFFF' : '#666666';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(isVisited ? area.name : '???', x + width / 2, y + 10);

    if (isVisited) {
      // 英文名稱
      ctx.font = '12px Arial';
      ctx.fillStyle = '#CCCCCC';
      ctx.fillText(area.nameEn, x + width / 2, y + 30);

      // 探索進度條
      const barWidth = width - 20;
      const barHeight = 10;
      const barX = x + 10;
      const barY = y + height - 20;

      // 進度條背景
      ctx.fillStyle = '#333333';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // 進度條
      ctx.fillStyle = progress === 100 ? '#00FF00' : '#FFD700';
      ctx.fillRect(barX, barY, (barWidth * progress) / 100, barHeight);

      // 進度文字
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px Arial';
      ctx.fillText(`${progress.toFixed(0)}%`, x + width / 2, barY - 5);

      // 當前位置標記
      if (isCurrent) {
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('● 當前位置', x + width / 2, y + 50);
      }
    }

    ctx.restore();
  }

  /**
   * 渲染區域資訊
   */
  private renderAreaInfo(ctx: CanvasRenderingContext2D): void {
    if (this.isMapOpen) return; // 完整地圖開啟時不顯示

    const currentArea = this.mapSystem.getCurrentArea();
    const x = 12;
    const y = 210;
    const w = 260;
    const h = 88;
    const progress = this.mapSystem.getExplorationProgress(currentArea.id);

    drawPanel(ctx, x, y, w, h);
    ctx.fillStyle = theme.text;
    ctx.font = `bold 16px ${theme.font}`;
    ctx.textAlign = 'left';
    ctx.fillText(currentArea.name, x + 14, y + 18);
    ctx.fillStyle = theme.textMuted;
    ctx.font = `12px ${theme.font}`;
    ctx.fillText(currentArea.nameEn, x + 14, y + 38);
    const barX = x + 14;
    const barY = y + 58;
    const barW = w - 28;
    roundRectPath(ctx, barX, barY, barW, 8, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();
    ctx.fillStyle = theme.accent;
    roundRectPath(ctx, barX, barY, barW * (progress / 100), 8, 4);
    ctx.fill();
    ctx.fillStyle = theme.text;
    ctx.font = `12px ${theme.font}`;
    ctx.fillText(`探索 ${progress.toFixed(0)}%`, x + 14, y + 74);
  }
}

// Made with Bob
