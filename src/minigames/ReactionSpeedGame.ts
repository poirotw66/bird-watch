import { MiniGameBase, MiniGameConfig, MiniGameResult } from './MiniGameBase';
import { SimpleBirdData } from '../data/simpleBirds';

/**
 * 目標鳥類介面
 */
interface TargetBird {
  bird: SimpleBirdData;
  x: number;
  y: number;
  size: number;
  velocity: { x: number; y: number };
  isTarget: boolean;
  clicked: boolean;
}

/**
 * 反應速度遊戲
 * 訓練玩家的反應速度和注意力
 */
export class ReactionSpeedGame extends MiniGameBase {
  private birds: SimpleBirdData[];
  private targetBirds: TargetBird[] = [];
  private currentTargetBird: SimpleBirdData | null = null;
  private spawnTimer: number = 0;
  private spawnInterval: number = 2; // 秒
  private maxBirds: number = 5;
  private canvasWidth: number = 800;
  private canvasHeight: number = 600;
  private targetHits: number = 0;
  private targetMisses: number = 0;
  private wrongClicks: number = 0;

  constructor(config: MiniGameConfig, birds: SimpleBirdData[]) {
    super(config);
    this.birds = birds;

    // 根據難度調整參數
    if (config.difficulty === 'easy') {
      this.spawnInterval = 2.5;
      this.maxBirds = 3;
    } else if (config.difficulty === 'medium') {
      this.spawnInterval = 2;
      this.maxBirds = 5;
    } else {
      this.spawnInterval = 1.5;
      this.maxBirds = 7;
    }
  }

  public getName(): string {
    return '反應速度遊戲';
  }

  public getDescription(): string {
    return '快速點擊目標鳥類，避免點擊其他鳥類。訓練反應速度和注意力。';
  }

  public initialize(): void {
    // 遊戲已在構造函數中初始化
  }

  protected onStart(): void {
    this.targetBirds = [];
    this.spawnTimer = 0;
    this.targetHits = 0;
    this.targetMisses = 0;
    this.wrongClicks = 0;
    this.selectNewTarget();
  }

  protected onPause(): void {
    // 暫停時不需要特別處理
  }

  protected onResume(): void {
    // 恢復時不需要特別處理
  }

  protected onEnd(result: MiniGameResult): void {
    console.log('反應速度遊戲結束', result);
  }

  protected onUpdate(deltaTime: number): void {
    // 更新生成計時器
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnBird();
    }

    // 更新所有鳥類位置
    this.targetBirds.forEach((bird) => {
      bird.x += bird.velocity.x * deltaTime * 60;
      bird.y += bird.velocity.y * deltaTime * 60;

      // 邊界反彈
      if (bird.x < 0 || bird.x > this.canvasWidth - bird.size) {
        bird.velocity.x *= -1;
        bird.x = Math.max(0, Math.min(this.canvasWidth - bird.size, bird.x));
      }
      if (bird.y < 100 || bird.y > this.canvasHeight - bird.size) {
        bird.velocity.y *= -1;
        bird.y = Math.max(100, Math.min(this.canvasHeight - bird.size, bird.y));
      }
    });

    // 移除已點擊的鳥類
    this.targetBirds = this.targetBirds.filter((bird) => !bird.clicked);

    // 檢查目標鳥類是否消失（未被點擊）
    const targetBird = this.targetBirds.find((b) => b.isTarget);
    if (!targetBird && this.currentTargetBird) {
      // 目標鳥類消失了，計為失誤
      this.targetMisses++;
      this.selectNewTarget();
    }
  }

  /**
   * 選擇新的目標鳥類
   */
  private selectNewTarget(): void {
    // 從現有鳥類中隨機選擇一隻作為目標
    if (this.targetBirds.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.targetBirds.length);
      this.targetBirds.forEach((bird, index) => {
        bird.isTarget = index === randomIndex;
      });
      this.currentTargetBird = this.targetBirds[randomIndex].bird;
    } else {
      this.currentTargetBird = null;
    }
  }

  /**
   * 生成鳥類
   */
  private spawnBird(): void {
    if (this.targetBirds.length >= this.maxBirds) return;

    // 隨機選擇一隻鳥
    const randomBird = this.birds[Math.floor(Math.random() * this.birds.length)];

    // 隨機位置和速度
    const size = 60;
    const x = Math.random() * (this.canvasWidth - size);
    const y = 100 + Math.random() * (this.canvasHeight - 100 - size);
    const speed = 1 + Math.random() * 2;
    const angle = Math.random() * Math.PI * 2;

    const newBird: TargetBird = {
      bird: randomBird,
      x,
      y,
      size,
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      },
      isTarget: false,
      clicked: false,
    };

    this.targetBirds.push(newBird);

    // 如果沒有目標鳥類，選擇一個
    if (!this.currentTargetBird) {
      this.selectNewTarget();
    }
  }

  /**
   * 處理點擊事件
   */
  public handleClick(x: number, y: number): void {
    // 檢查是否點擊了某隻鳥
    for (const bird of this.targetBirds) {
      if (
        x >= bird.x &&
        x <= bird.x + bird.size &&
        y >= bird.y &&
        y <= bird.y + bird.size
      ) {
        bird.clicked = true;
        this.totalAttempts++;

        if (bird.isTarget) {
          // 點擊了目標鳥類
          this.targetHits++;
          this.correctCount++;
          this.score += 100;

          this.eventSystem.emit('minigame:target_hit', {
            birdName: bird.bird.name,
          });

          // 選擇新的目標
          this.selectNewTarget();
        } else {
          // 點擊了錯誤的鳥類
          this.wrongClicks++;
          this.score = Math.max(0, this.score - 50);

          this.eventSystem.emit('minigame:wrong_click', {
            birdName: bird.bird.name,
          });
        }

        return;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 繪製標題
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.getName(), 400, 40);

    // 繪製分數和統計
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`分數: ${this.score}`, 50, 40);
    ctx.fillText(`命中: ${this.targetHits}`, 50, 65);
    ctx.fillText(`失誤: ${this.targetMisses}`, 50, 90);

    ctx.textAlign = 'right';
    const remainingTime = this.getRemainingTime();
    if (remainingTime !== null) {
      ctx.fillText(`剩餘時間: ${Math.ceil(remainingTime)}秒`, 750, 40);
    }

    // 繪製目標提示
    if (this.currentTargetBird) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
      ctx.fillRect(250, 10, 300, 80);

      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.strokeRect(250, 10, 300, 80);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('目標鳥類:', 400, 35);

      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = '#FF0000';
      ctx.fillText(this.currentTargetBird.name, 400, 65);

      ctx.restore();
    }

    // 繪製所有鳥類
    this.targetBirds.forEach((bird) => {
      this.renderBird(ctx, bird);
    });

    ctx.restore();
  }

  /**
   * 渲染單隻鳥類
   */
  private renderBird(ctx: CanvasRenderingContext2D, targetBird: TargetBird): void {
    ctx.save();

    // 如果是目標鳥類，繪製高亮邊框
    if (targetBird.isTarget) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 4;
      ctx.strokeRect(
        targetBird.x - 5,
        targetBird.y - 5,
        targetBird.size + 10,
        targetBird.size + 10
      );

      // 繪製閃爍效果
      const alpha = 0.3 + Math.sin(Date.now() / 200) * 0.3;
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.fillRect(targetBird.x - 5, targetBird.y - 5, targetBird.size + 10, targetBird.size + 10);
    }

    // 鳥類背景
    ctx.fillStyle = targetBird.isTarget ? '#FFE082' : '#90CAF9';
    ctx.fillRect(targetBird.x, targetBird.y, targetBird.size, targetBird.size);

    // 邊框
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(targetBird.x, targetBird.y, targetBird.size, targetBird.size);

    // 鳥類名稱
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = this.wrapText(ctx, targetBird.bird.name, targetBird.size - 10);
    lines.forEach((line, index) => {
      ctx.fillText(
        line,
        targetBird.x + targetBird.size / 2,
        targetBird.y + targetBird.size / 2 - 10 + index * 14
      );
    });

    // 稀有度指示
    ctx.font = '10px Arial';
    ctx.fillStyle = this.getRarityColor(targetBird.bird.rarity);
    ctx.fillText(
      this.getRarityText(targetBird.bird.rarity),
      targetBird.x + targetBird.size / 2,
      targetBird.y + targetBird.size - 10
    );

    ctx.restore();
  }

  /**
   * 文字換行
   */
  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split('');
    const lines: string[] = [];
    let currentLine = '';

    for (const char of words) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * 取得稀有度顏色
   */
  private getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common':
        return '#808080';
      case 'uncommon':
        return '#00FF00';
      case 'rare':
        return '#0080FF';
      case 'legendary':
        return '#FF00FF';
      default:
        return '#FFFFFF';
    }
  }

  /**
   * 取得稀有度文字
   */
  private getRarityText(rarity: string): string {
    switch (rarity) {
      case 'common':
        return '常見';
      case 'uncommon':
        return '不常見';
      case 'rare':
        return '稀有';
      case 'legendary':
        return '傳說';
      default:
        return '';
    }
  }
}

// Made with Bob
