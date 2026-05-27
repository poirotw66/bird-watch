import { MiniGameBase, MiniGameConfig, MiniGameResult } from './MiniGameBase';
import { SimpleBirdData } from '../data/simpleBirds';

/**
 * 問題介面
 */
interface Question {
  bird: SimpleBirdData;
  options: SimpleBirdData[];
  correctIndex: number;
}

/**
 * 鳥類辨識遊戲
 * 訓練玩家的辨識能力和決策能力
 */
export class BirdIdentificationGame extends MiniGameBase {
  private birds: SimpleBirdData[];
  private currentQuestion: Question | null = null;
  private questionNumber: number = 0;
  private totalQuestions: number = 10;
  private selectedOption: number = -1;
  private showingResult: boolean = false;
  private resultTimer: number = 0;
  private readonly RESULT_DISPLAY_TIME = 1.5; // 秒

  constructor(config: MiniGameConfig, birds: SimpleBirdData[]) {
    super(config);
    this.birds = birds;

    // 根據難度調整問題數量
    if (config.difficulty === 'easy') {
      this.totalQuestions = 5;
    } else if (config.difficulty === 'medium') {
      this.totalQuestions = 10;
    } else {
      this.totalQuestions = 15;
    }
  }

  public getName(): string {
    return '鳥類辨識遊戲';
  }

  public getDescription(): string {
    return '根據鳥類的特徵描述，選出正確的鳥類。訓練辨識能力和決策能力。';
  }

  public initialize(): void {
    // 遊戲已在構造函數中初始化
  }

  protected onStart(): void {
    this.questionNumber = 0;
    this.selectedOption = -1;
    this.showingResult = false;
    this.generateQuestion();
  }

  protected onPause(): void {
    // 暫停時不需要特別處理
  }

  protected onResume(): void {
    // 恢復時不需要特別處理
  }

  protected onEnd(result: MiniGameResult): void {
    console.log('鳥類辨識遊戲結束', result);
  }

  protected onUpdate(deltaTime: number): void {
    // 如果正在顯示結果，倒數計時
    if (this.showingResult) {
      this.resultTimer += deltaTime;
      if (this.resultTimer >= this.RESULT_DISPLAY_TIME) {
        this.nextQuestion();
      }
    }
  }

  /**
   * 生成問題
   */
  private generateQuestion(): void {
    // 隨機選擇一隻鳥作為正確答案
    const correctBird = this.birds[Math.floor(Math.random() * this.birds.length)];

    // 根據難度決定選項數量
    let optionCount = 3; // easy
    if (this.config.difficulty === 'medium') {
      optionCount = 4;
    } else if (this.config.difficulty === 'hard') {
      optionCount = 5;
    }

    // 選擇其他鳥類作為錯誤選項
    const wrongBirds = this.birds
      .filter((bird) => bird.id !== correctBird.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, optionCount - 1);

    // 組合選項並洗牌
    const options = [correctBird, ...wrongBirds].sort(() => Math.random() - 0.5);
    const correctIndex = options.findIndex((bird) => bird.id === correctBird.id);

    this.currentQuestion = {
      bird: correctBird,
      options,
      correctIndex,
    };
  }

  /**
   * 處理選項點擊
   */
  public handleOptionClick(optionIndex: number): void {
    if (this.showingResult || !this.currentQuestion) return;

    this.selectedOption = optionIndex;
    this.showingResult = true;
    this.resultTimer = 0;
    this.totalAttempts++;

    // 檢查答案
    if (optionIndex === this.currentQuestion.correctIndex) {
      this.correctCount++;
      this.score += 100;

      this.eventSystem.emit('minigame:correct_answer', {
        birdName: this.currentQuestion.bird.name,
      });
    } else {
      this.eventSystem.emit('minigame:wrong_answer', {
        correctBird: this.currentQuestion.bird.name,
        selectedBird: this.currentQuestion.options[optionIndex].name,
      });
    }
  }

  /**
   * 下一題
   */
  private nextQuestion(): void {
    this.questionNumber++;
    this.selectedOption = -1;
    this.showingResult = false;

    if (this.questionNumber >= this.totalQuestions) {
      this.end(true);
    } else {
      this.generateQuestion();
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.currentQuestion) return;

    ctx.save();

    // 繪製標題
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.getName(), 400, 40);

    // 繪製進度
    ctx.font = '16px Arial';
    ctx.fillText(
      `問題 ${this.questionNumber + 1}/${this.totalQuestions}`,
      400,
      70
    );
    ctx.fillText(`分數: ${this.score}`, 200, 40);

    const remainingTime = this.getRemainingTime();
    if (remainingTime !== null) {
      ctx.fillText(`剩餘時間: ${Math.ceil(remainingTime)}秒`, 600, 40);
    }

    // 繪製問題區域
    this.renderQuestion(ctx);

    // 繪製選項
    this.renderOptions(ctx);

    ctx.restore();
  }

  /**
   * 渲染問題
   */
  private renderQuestion(ctx: CanvasRenderingContext2D): void {
    if (!this.currentQuestion) return;

    const questionY = 120;
    const boxWidth = 700;
    const boxHeight = 200;
    const boxX = (800 - boxWidth) / 2;

    // 問題背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(boxX, questionY, boxWidth, boxHeight);

    // 邊框
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, questionY, boxWidth, boxHeight);

    // 問題文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('請根據以下特徵，選出正確的鳥類：', 400, questionY + 30);

    // 特徵描述
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    let textY = questionY + 60;

    // 顯示鳥類特徵
    const characteristics = this.currentQuestion.bird.characteristics.slice(0, 3);
    characteristics.forEach((char, index) => {
      ctx.fillText(`${index + 1}. ${char}`, boxX + 50, textY);
      textY += 30;
    });

    // 顯示棲息地
    ctx.fillText(
      `棲息地: ${this.currentQuestion.bird.habitats.join('、')}`,
      boxX + 50,
      textY
    );
  }

  /**
   * 渲染選項
   */
  private renderOptions(ctx: CanvasRenderingContext2D): void {
    if (!this.currentQuestion) return;

    const optionsY = 350;
    const optionWidth = 150;
    const optionHeight = 180;
    const optionPadding = 20;
    const totalWidth =
      this.currentQuestion.options.length * optionWidth +
      (this.currentQuestion.options.length - 1) * optionPadding;
    const startX = (800 - totalWidth) / 2;

    this.currentQuestion.options.forEach((option, index) => {
      const x = startX + index * (optionWidth + optionPadding);
      this.renderOption(ctx, option, index, x, optionsY, optionWidth, optionHeight);
    });
  }

  /**
   * 渲染單個選項
   */
  private renderOption(
    ctx: CanvasRenderingContext2D,
    bird: SimpleBirdData,
    index: number,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    ctx.save();

    // 選項背景
    let bgColor = '#2196F3';
    if (this.showingResult) {
      if (index === this.currentQuestion!.correctIndex) {
        bgColor = '#4CAF50'; // 正確答案顯示綠色
      } else if (index === this.selectedOption) {
        bgColor = '#F44336'; // 錯誤答案顯示紅色
      }
    } else if (index === this.selectedOption) {
      bgColor = '#1976D2'; // 選中但未確認
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, width, height);

    // 邊框
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // 選項編號
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(String.fromCharCode(65 + index), x + width / 2, y + 30);

    // 鳥類名稱
    ctx.font = 'bold 16px Arial';
    const nameLines = this.wrapText(ctx, bird.name, width - 20);
    nameLines.forEach((line, lineIndex) => {
      ctx.fillText(line, x + width / 2, y + 60 + lineIndex * 20);
    });

    // 學名
    ctx.font = '12px Arial';
    ctx.fillStyle = '#CCCCCC';
    const scientificLines = this.wrapText(ctx, bird.scientificName, width - 20);
    scientificLines.forEach((line, lineIndex) => {
      ctx.fillText(line, x + width / 2, y + 110 + lineIndex * 16);
    });

    // 稀有度
    ctx.fillStyle = this.getRarityColor(bird.rarity);
    ctx.fillText(this.getRarityText(bird.rarity), x + width / 2, y + height - 20);

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

  /**
   * 處理點擊事件
   */
  public handleClick(x: number, y: number): void {
    if (this.showingResult || !this.currentQuestion) return;

    const optionsY = 350;
    const optionWidth = 150;
    const optionHeight = 180;
    const optionPadding = 20;
    const totalWidth =
      this.currentQuestion.options.length * optionWidth +
      (this.currentQuestion.options.length - 1) * optionPadding;
    const startX = (800 - totalWidth) / 2;

    // 檢查點擊了哪個選項
    this.currentQuestion.options.forEach((_, index) => {
      const optionX = startX + index * (optionWidth + optionPadding);
      if (
        x >= optionX &&
        x <= optionX + optionWidth &&
        y >= optionsY &&
        y <= optionsY + optionHeight
      ) {
        this.handleOptionClick(index);
      }
    });
  }
}

// Made with Bob
