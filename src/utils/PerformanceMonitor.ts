/**
 * 效能指標
 */
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  updateTime: number;
  renderTime: number;
  memoryUsage: number;
  objectCount: number;
  drawCalls: number;
}

/**
 * 效能監控器
 * 監控和記錄遊戲效能指標
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    updateTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    objectCount: 0,
    drawCalls: 0,
  };

  private frameCount: number = 0;
  private lastTime: number = 0;
  private fpsUpdateInterval: number = 1000; // 毫秒
  private fpsUpdateTime: number = 0;
  private frameTimes: number[] = [];
  private maxFrameTimeSamples: number = 60;
  private updateStartTime: number = 0;
  private renderStartTime: number = 0;
  private enabled: boolean = true;

  private constructor() {
    this.lastTime = performance.now();
    this.fpsUpdateTime = this.lastTime;
  }

  /**
   * 取得單例實例
   */
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 開始幀計時
   */
  public beginFrame(): void {
    if (!this.enabled) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    this.frameTimes.push(deltaTime);
    if (this.frameTimes.length > this.maxFrameTimeSamples) {
      this.frameTimes.shift();
    }

    this.metrics.frameTime = deltaTime;
    this.frameCount++;

    // 更新 FPS
    if (currentTime - this.fpsUpdateTime >= this.fpsUpdateInterval) {
      this.metrics.fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.fpsUpdateTime)
      );
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }

    this.lastTime = currentTime;
  }

  /**
   * 開始更新計時
   */
  public beginUpdate(): void {
    if (!this.enabled) return;
    this.updateStartTime = performance.now();
  }

  /**
   * 結束更新計時
   */
  public endUpdate(): void {
    if (!this.enabled) return;
    this.metrics.updateTime = performance.now() - this.updateStartTime;
  }

  /**
   * 開始渲染計時
   */
  public beginRender(): void {
    if (!this.enabled) return;
    this.renderStartTime = performance.now();
  }

  /**
   * 結束渲染計時
   */
  public endRender(): void {
    if (!this.enabled) return;
    this.metrics.renderTime = performance.now() - this.renderStartTime;
  }

  /**
   * 更新記憶體使用量
   */
  public updateMemoryUsage(): void {
    if (!this.enabled) return;

    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1048576; // 轉換為 MB
    }
  }

  /**
   * 設定物件數量
   */
  public setObjectCount(count: number): void {
    this.metrics.objectCount = count;
  }

  /**
   * 設定繪製呼叫次數
   */
  public setDrawCalls(count: number): void {
    this.metrics.drawCalls = count;
  }

  /**
   * 取得當前指標
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 取得平均幀時間
   */
  public getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    const sum = this.frameTimes.reduce((a, b) => a + b, 0);
    return sum / this.frameTimes.length;
  }

  /**
   * 取得最小幀時間
   */
  public getMinFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    return Math.min(...this.frameTimes);
  }

  /**
   * 取得最大幀時間
   */
  public getMaxFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    return Math.max(...this.frameTimes);
  }

  /**
   * 取得幀時間標準差
   */
  public getFrameTimeStdDev(): number {
    if (this.frameTimes.length === 0) return 0;

    const avg = this.getAverageFrameTime();
    const squareDiffs = this.frameTimes.map((value) => {
      const diff = value - avg;
      return diff * diff;
    });

    const avgSquareDiff =
      squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  /**
   * 檢查是否有效能問題
   */
  public hasPerformanceIssues(): {
    hasIssues: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (this.metrics.fps < 30) {
      issues.push(`FPS 過低: ${this.metrics.fps}`);
    }

    if (this.metrics.frameTime > 33) {
      issues.push(`幀時間過長: ${this.metrics.frameTime.toFixed(2)}ms`);
    }

    if (this.metrics.updateTime > 16) {
      issues.push(`更新時間過長: ${this.metrics.updateTime.toFixed(2)}ms`);
    }

    if (this.metrics.renderTime > 16) {
      issues.push(`渲染時間過長: ${this.metrics.renderTime.toFixed(2)}ms`);
    }

    if (this.metrics.memoryUsage > 500) {
      issues.push(`記憶體使用過高: ${this.metrics.memoryUsage.toFixed(2)}MB`);
    }

    return {
      hasIssues: issues.length > 0,
      issues,
    };
  }

  /**
   * 啟用/停用監控
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 重置統計
   */
  public reset(): void {
    this.frameCount = 0;
    this.frameTimes = [];
    this.metrics = {
      fps: 0,
      frameTime: 0,
      updateTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      objectCount: 0,
      drawCalls: 0,
    };
  }

  /**
   * 列印效能報告
   */
  public printReport(): void {
    console.log('=== 效能報告 ===');
    console.log(`FPS: ${this.metrics.fps}`);
    console.log(`幀時間: ${this.metrics.frameTime.toFixed(2)}ms`);
    console.log(`平均幀時間: ${this.getAverageFrameTime().toFixed(2)}ms`);
    console.log(`最小幀時間: ${this.getMinFrameTime().toFixed(2)}ms`);
    console.log(`最大幀時間: ${this.getMaxFrameTime().toFixed(2)}ms`);
    console.log(`幀時間標準差: ${this.getFrameTimeStdDev().toFixed(2)}ms`);
    console.log(`更新時間: ${this.metrics.updateTime.toFixed(2)}ms`);
    console.log(`渲染時間: ${this.metrics.renderTime.toFixed(2)}ms`);
    console.log(`記憶體使用: ${this.metrics.memoryUsage.toFixed(2)}MB`);
    console.log(`物件數量: ${this.metrics.objectCount}`);
    console.log(`繪製呼叫: ${this.metrics.drawCalls}`);

    const { hasIssues, issues } = this.hasPerformanceIssues();
    if (hasIssues) {
      console.warn('⚠️ 效能問題:');
      issues.forEach((issue) => console.warn(`  - ${issue}`));
    } else {
      console.log('✅ 效能正常');
    }
  }

  /**
   * 渲染效能 HUD
   */
  public renderHUD(ctx: CanvasRenderingContext2D, x: number = 10, y: number = 10): void {
    if (!this.enabled) return;

    ctx.save();

    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, 200, 140);

    // 文字
    ctx.fillStyle = '#00FF00';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    let textY = y + 15;
    const lineHeight = 18;

    ctx.fillText(`FPS: ${this.metrics.fps}`, x + 10, textY);
    textY += lineHeight;

    ctx.fillText(`Frame: ${this.metrics.frameTime.toFixed(1)}ms`, x + 10, textY);
    textY += lineHeight;

    ctx.fillText(`Update: ${this.metrics.updateTime.toFixed(1)}ms`, x + 10, textY);
    textY += lineHeight;

    ctx.fillText(`Render: ${this.metrics.renderTime.toFixed(1)}ms`, x + 10, textY);
    textY += lineHeight;

    ctx.fillText(`Memory: ${this.metrics.memoryUsage.toFixed(1)}MB`, x + 10, textY);
    textY += lineHeight;

    ctx.fillText(`Objects: ${this.metrics.objectCount}`, x + 10, textY);
    textY += lineHeight;

    ctx.fillText(`Draw Calls: ${this.metrics.drawCalls}`, x + 10, textY);

    // 效能警告
    const { hasIssues } = this.hasPerformanceIssues();
    if (hasIssues) {
      ctx.fillStyle = '#FF0000';
      ctx.fillText('⚠️ Performance Issues', x + 10, y + 135);
    }

    ctx.restore();
  }
}

// Made with Bob
