import { Scene } from '@/core/Scene';
import { GameObject } from '@/core/GameObject';
import { Component } from '@/core/Component';

/**
 * 簡單的測試組件 - 顯示一個圓形
 */
class CircleComponent extends Component {
  private radius: number;
  private color: string;

  constructor(radius: number = 50, color: string = '#4CAF50') {
    super();
    this.radius = radius;
    this.color = color;
  }

  public update(_deltaTime: number): void {
    // 簡單的旋轉動畫
    this.gameObject.rotation += 0.01;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // 繪製一條線表示旋轉
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.radius, 0);
    ctx.stroke();
  }
}

/**
 * 測試場景
 * 用於驗證引擎基本功能
 */
export class TestScene extends Scene {
  constructor() {
    super('TestScene');
  }

  public onEnter(): void {
    console.log('進入測試場景');

    // 創建一個測試物件
    const testObject = new GameObject(0, 0);
    testObject.tag = 'test';
    testObject.addComponent(new CircleComponent(50, '#4CAF50'));
    this.addGameObject(testObject);

    // 創建第二個測試物件
    const testObject2 = new GameObject(100, 100);
    testObject2.addComponent(new CircleComponent(30, '#2196F3'));
    this.addGameObject(testObject2);

    // 創建第三個測試物件
    const testObject3 = new GameObject(-100, -100);
    testObject3.addComponent(new CircleComponent(40, '#FF5722'));
    this.addGameObject(testObject3);
  }

  public onExit(): void {
    console.log('離開測試場景');
    this.clear();
  }

  public update(deltaTime: number): void {
    super.update(deltaTime);

    // 可以在這裡添加場景特定的更新邏輯
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // 繪製背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 繪製標題
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('賞鳥探索冒險 - 測試場景', ctx.canvas.width / 2, 50);
    ctx.font = '16px sans-serif';
    ctx.fillText('引擎運行正常！', ctx.canvas.width / 2, 80);
    ctx.restore();

    // 渲染遊戲物件
    super.render(ctx);

    // 繪製物件數量
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillText(`物件數量: ${this.getObjectCount()}`, 10, ctx.canvas.height - 10);
    ctx.restore();
  }
}

// Made with Bob
