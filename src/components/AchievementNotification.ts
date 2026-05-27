import { Component } from '../core/Component';
import { getViewport } from '../utils/viewport';
import { AchievementSystem } from '../systems/AchievementSystem';
import { EventSystem, GameEvents } from '../core/EventSystem';

/**
 * 成就通知
 */
interface Notification {
  id: string;
  title: string;
  description: string;
  icon: string;
  timestamp: number;
  duration: number;
}

/**
 * 成就通知組件
 * 顯示成就解鎖通知
 */
export class AchievementNotification extends Component {
  private achievementSystem: AchievementSystem;
  private eventSystem: EventSystem;
  private notifications: Notification[] = [];
  private readonly maxNotifications = 3;
  private readonly notificationDuration = 5000; // 5 秒
  private readonly notificationHeight = 80;
  private readonly notificationWidth = 350;
  private readonly padding = 10;
  private readonly animationDuration = 300; // 動畫時長（毫秒）

  constructor() {
    super();
    this.achievementSystem = AchievementSystem.getInstance();
    this.eventSystem = EventSystem.getInstance();
    this.setupEventListeners();
  }

  /**
   * 設定事件監聽器
   */
  private setupEventListeners(): void {
    // 監聽成就解鎖事件
    this.eventSystem.on(GameEvents.ACHIEVEMENT_UNLOCKED, (data: { achievementId: string }) => {
      const achievements = this.achievementSystem.getManager().getAllAchievements();
      const achievement = achievements.find(a => a.getData().id === data.achievementId);
      if (achievement) {
        const achievementData = achievement.getData();
        this.addNotification({
          id: achievementData.id,
          title: `🏆 ${achievementData.title}`,
          description: achievementData.description,
          icon: this.getAchievementIcon(achievementData.category),
          timestamp: Date.now(),
          duration: this.notificationDuration
        });
      }
    });

    // 監聽鳥類發現事件
    this.eventSystem.on(GameEvents.BIRD_DISCOVERED, (data: { birdId: string; birdName?: string }) => {
      this.addNotification({
        id: `bird_${data.birdId}_${Date.now()}`,
        title: '🐦 發現新鳥類！',
        description: data.birdName ? `你發現了 ${data.birdName}` : '你發現了新的鳥類',
        icon: '🐦',
        timestamp: Date.now(),
        duration: this.notificationDuration
      });
    });

    // 監聽等級提升事件
    this.eventSystem.on(GameEvents.PLAYER_LEVEL_UP, (data: { level: number }) => {
      this.addNotification({
        id: `levelup_${Date.now()}`,
        title: '⭐ 等級提升！',
        description: `恭喜！你已達到等級 ${data.level}`,
        icon: '⭐',
        timestamp: Date.now(),
        duration: this.notificationDuration
      });
    });
  }

  /**
   * 獲取成就圖示
   */
  private getAchievementIcon(type: string): string {
    const icons: Record<string, string> = {
      discovery: '🔍',
      observation: '👁️',
      photography: '📷',
      identification: '🎯',
      collection: '📚',
      exploration: '🗺️',
      mastery: '👑',
      special: '✨'
    };
    return icons[type] || '🏆';
  }

  /**
   * 添加通知
   */
  private addNotification(notification: Notification): void {
    // 如果已經有相同的通知，不重複添加
    if (this.notifications.some(n => n.id === notification.id)) {
      return;
    }

    this.notifications.push(notification);

    // 限制通知數量
    if (this.notifications.length > this.maxNotifications) {
      this.notifications.shift();
    }

    console.log('📢 新通知:', notification.title);
  }

  /**
   * 更新
   */
  public update(_deltaTime: number): void {
    const now = Date.now();

    // 移除過期的通知
    this.notifications = this.notifications.filter(notification => {
      const age = now - notification.timestamp;
      return age < notification.duration;
    });
  }

  /**
   * 渲染
   */
  public render(ctx: CanvasRenderingContext2D): void {
    if (this.notifications.length === 0) return;

    const now = Date.now();
    const { width: vw } = getViewport(ctx);
    const x = vw - this.notificationWidth - this.padding;
    let y = 200; // 從上方 200px 開始

    for (const notification of this.notifications) {
      const age = now - notification.timestamp;
      const progress = age / notification.duration;

      // 計算透明度（最後 1 秒淡出）
      let alpha = 1;
      if (progress > 0.8) {
        alpha = 1 - (progress - 0.8) / 0.2;
      }

      // 計算滑入動畫
      let slideOffset = 0;
      if (age < this.animationDuration) {
        slideOffset = (1 - age / this.animationDuration) * this.notificationWidth;
      }

      ctx.save();
      ctx.globalAlpha = alpha;

      // 繪製通知背景
      const notificationX = x + slideOffset;
      this.renderNotificationBackground(ctx, notificationX, y);

      // 繪製通知內容
      this.renderNotificationContent(ctx, notificationX, y, notification);

      // 繪製進度條
      this.renderProgressBar(ctx, notificationX, y, progress);

      ctx.restore();

      y += this.notificationHeight + this.padding;
    }
  }

  /**
   * 渲染通知背景
   */
  private renderNotificationBackground(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // 陰影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // 背景
    ctx.fillStyle = 'rgba(40, 40, 40, 0.95)';
    this.roundRect(ctx, x, y, this.notificationWidth, this.notificationHeight, 8);
    ctx.fill();

    // 邊框
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y, this.notificationWidth, this.notificationHeight, 8);
    ctx.stroke();

    // 重置陰影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  /**
   * 渲染通知內容
   */
  private renderNotificationContent(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    notification: Notification
  ): void {
    const contentX = x + 15;
    let contentY = y + 25;

    // 圖示
    ctx.font = '24px Arial';
    ctx.fillText(notification.icon, contentX, contentY);

    // 標題
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(notification.title, contentX + 35, contentY);

    // 描述
    contentY += 22;
    ctx.fillStyle = '#cccccc';
    ctx.font = '13px Arial';
    
    // 文字換行
    const maxWidth = this.notificationWidth - 60;
    const words = notification.description.split('');
    let line = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, contentX + 35, contentY);
        contentY += 18;
        line = words[i];
      } else {
        line = testLine;
      }
    }
    if (line !== '') {
      ctx.fillText(line, contentX + 35, contentY);
    }
  }

  /**
   * 渲染進度條
   */
  private renderProgressBar(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number): void {
    const barHeight = 3;
    const barY = y + this.notificationHeight - barHeight;
    const barWidth = this.notificationWidth * (1 - progress);

    ctx.fillStyle = '#4a9eff';
    ctx.fillRect(x, barY, barWidth, barHeight);
  }

  /**
   * 繪製圓角矩形
   */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * 手動添加通知（用於測試）
   */
  public showNotification(title: string, description: string, icon: string = '📢'): void {
    this.addNotification({
      id: `manual_${Date.now()}`,
      title,
      description,
      icon,
      timestamp: Date.now(),
      duration: this.notificationDuration
    });
  }
}

// Made with Bob
