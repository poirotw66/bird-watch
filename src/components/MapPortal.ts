import { Component } from '../core/Component';
import { MapSystem } from '../systems/MapSystem';
import { EventSystem } from '../core/EventSystem';
import { Vector2 } from '../utils/Vector2';

/**
 * 地圖傳送門組件
 * 處理玩家與傳送門的互動，實現場景切換
 */
export class MapPortal extends Component {
  private mapSystem: MapSystem;
  private eventSystem: EventSystem;
  private playerPosition: Vector2 = new Vector2(0, 0);
  private isNearPortal: boolean = false;
  private nearestPortalId: string | null = null;
  private portalInteractionDistance: number = 50;

  constructor() {
    super();
    this.mapSystem = MapSystem.getInstance();
    this.eventSystem = EventSystem.getInstance();
  }

  public onAttach(): void {
    super.onAttach();

    // 監聽玩家位置更新
    this.eventSystem.on('player:position_update', this.onPlayerPositionUpdate.bind(this));

    // 監聽互動按鍵
    this.eventSystem.on('input:interact', this.onInteract.bind(this));
  }

  public onDetach(): void {
    this.eventSystem.off('player:position_update', this.onPlayerPositionUpdate.bind(this));
    this.eventSystem.off('input:interact', this.onInteract.bind(this));
    super.onDetach();
  }

  /**
   * 玩家位置更新事件處理
   */
  private onPlayerPositionUpdate(data: { position: Vector2 }): void {
    this.playerPosition = data.position;
  }

  /**
   * 更新組件
   */
  public update(_deltaTime: number): void {
    this.checkPortalProximity();
  }

  /**
   * 檢查玩家是否靠近傳送門
   */
  private checkPortalProximity(): void {
    const currentArea = this.mapSystem.getCurrentArea();
    let nearestDistance = Infinity;
    let nearestPortal: string | null = null;

    currentArea.connections.forEach((conn) => {
      const distance = Math.sqrt(
        Math.pow(this.playerPosition.x - conn.position.x, 2) +
          Math.pow(this.playerPosition.y - conn.position.y, 2)
      );

      if (distance < this.portalInteractionDistance && distance < nearestDistance) {
        nearestDistance = distance;
        nearestPortal = conn.targetAreaId;
      }
    });

    const wasNearPortal = this.isNearPortal;
    this.isNearPortal = nearestPortal !== null;
    this.nearestPortalId = nearestPortal;

    // 發送提示事件
    if (this.isNearPortal && !wasNearPortal) {
      const targetArea = currentArea.connections.find(
        (c) => c.targetAreaId === nearestPortal
      );
      if (targetArea) {
        this.eventSystem.emit('portal:enter_range', {
          targetAreaId: nearestPortal,
          direction: targetArea.direction,
        });
      }
    } else if (!this.isNearPortal && wasNearPortal) {
      this.eventSystem.emit('portal:exit_range', {});
    }
  }

  /**
   * 互動事件處理
   */
  private onInteract(): void {
    if (this.isNearPortal && this.nearestPortalId) {
      this.teleportToArea(this.nearestPortalId);
    }
  }

  /**
   * 傳送到指定區域
   */
  private teleportToArea(areaId: string): void {
    const success = this.mapSystem.switchToArea(areaId);

    if (success) {
      // 發送傳送成功事件
      this.eventSystem.emit('portal:teleport', {
        targetAreaId: areaId,
      });

      // 重置玩家位置到新區域的中心
      const newArea = this.mapSystem.getCurrentArea();
      const newPosition = new Vector2(newArea.width / 2, newArea.height / 2);

      this.eventSystem.emit('player:teleport', {
        position: newPosition,
      });
    }
  }

  /**
   * 渲染組件
   */
  public render(ctx: CanvasRenderingContext2D): void {
    // 傳送門由 MapRenderer 渲染，這裡只渲染提示
    if (this.isNearPortal) {
      this.renderPortalHint(ctx);
    }
  }

  /**
   * 渲染傳送門提示
   */
  private renderPortalHint(ctx: CanvasRenderingContext2D): void {
    const currentArea = this.mapSystem.getCurrentArea();
    const connection = currentArea.connections.find(
      (c) => c.targetAreaId === this.nearestPortalId
    );

    if (!connection) return;

    // 從場景取得相機
    const camera = (this.gameObject as any).scene?.camera;
    if (!camera) return;

    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    const screenPos = camera.worldToScreen(
      new Vector2(connection.position.x, connection.position.y),
      canvasWidth,
      canvasHeight
    );

    // 繪製提示框
    ctx.save();

    const hintText = '按 E 鍵傳送';
    const targetAreaName = this.getAreaName(this.nearestPortalId || '');
    const targetText = `前往：${targetAreaName}`;

    ctx.font = 'bold 16px Arial';
    const hintWidth = Math.max(
      ctx.measureText(hintText).width,
      ctx.measureText(targetText).width
    );

    const boxWidth = hintWidth + 20;
    const boxHeight = 60;
    const boxX = screenPos.x - boxWidth / 2;
    const boxY = screenPos.y - 80;

    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // 邊框
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // 文字
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(hintText, screenPos.x, boxY + 20);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(targetText, screenPos.x, boxY + 40);

    ctx.restore();
  }

  /**
   * 取得區域名稱
   */
  private getAreaName(areaId: string): string {
    const areas: Record<string, string> = {
      forest: '森林區',
      wetland: '濕地區',
      grassland: '草原區',
      mountain: '山區',
      coast: '海岸區',
    };
    return areas[areaId] || areaId;
  }
}

// Made with Bob
