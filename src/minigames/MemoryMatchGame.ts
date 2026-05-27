import { MiniGameBase, MiniGameConfig, MiniGameResult } from './MiniGameBase';
import { SimpleBirdData } from '../data/simpleBirds';

/**
 * 卡片狀態
 */
enum CardState {
  HIDDEN = 'hidden',
  REVEALED = 'revealed',
  MATCHED = 'matched',
}

/**
 * 卡片介面
 */
interface Card {
  id: number;
  birdData: SimpleBirdData;
  state: CardState;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 記憶配對遊戲
 * 訓練玩家的記憶力和注意力
 */
export class MemoryMatchGame extends MiniGameBase {
  private cards: Card[] = [];
  private revealedCards: Card[] = [];
  private matchedPairs: number = 0;
  private totalPairs: number = 0;
  private canClick: boolean = true;
  private gridCols: number = 4;
  private gridRows: number = 3;
  private cardWidth: number = 100;
  private cardHeight: number = 120;
  private cardPadding: number = 10;
  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor(config: MiniGameConfig, birds: SimpleBirdData[]) {
    super(config);
    this.initializeCards(birds);
  }

  public getName(): string {
    return '記憶配對遊戲';
  }

  public getDescription(): string {
    return '翻開卡片，找出相同的鳥類配對。訓練記憶力和注意力。';
  }

  public initialize(): void {
    // 遊戲已在構造函數中初始化
  }

  /**
   * 初始化卡片
   */
  private initializeCards(birds: SimpleBirdData[]): void {
    // 根據難度決定卡片數量
    let pairCount = 6; // easy
    if (this.config.difficulty === 'medium') {
      pairCount = 8;
      this.gridCols = 4;
      this.gridRows = 4;
    } else if (this.config.difficulty === 'hard') {
      pairCount = 10;
      this.gridCols = 5;
      this.gridRows = 4;
    }

    this.totalPairs = pairCount;

    // 隨機選擇鳥類
    const selectedBirds = this.shuffleArray([...birds]).slice(0, pairCount);

    // 創建卡片對
    const cardList: Card[] = [];
    selectedBirds.forEach((bird, index) => {
      // 每隻鳥創建兩張卡片
      cardList.push({
        id: index * 2,
        birdData: bird,
        state: CardState.HIDDEN,
        x: 0,
        y: 0,
        width: this.cardWidth,
        height: this.cardHeight,
      });
      cardList.push({
        id: index * 2 + 1,
        birdData: bird,
        state: CardState.HIDDEN,
        x: 0,
        y: 0,
        width: this.cardWidth,
        height: this.cardHeight,
      });
    });

    // 洗牌
    this.cards = this.shuffleArray(cardList);

    // 計算卡片位置
    this.calculateCardPositions();
  }

  /**
   * 計算卡片位置
   */
  private calculateCardPositions(): void {
    const totalWidth = this.gridCols * (this.cardWidth + this.cardPadding) - this.cardPadding;
    const totalHeight = this.gridRows * (this.cardHeight + this.cardPadding) - this.cardPadding;
    
    this.offsetX = (800 - totalWidth) / 2; // 假設畫布寬度 800
    this.offsetY = (600 - totalHeight) / 2 + 50; // 假設畫布高度 600，留出頂部空間

    this.cards.forEach((card, index) => {
      const col = index % this.gridCols;
      const row = Math.floor(index / this.gridCols);
      card.x = this.offsetX + col * (this.cardWidth + this.cardPadding);
      card.y = this.offsetY + row * (this.cardHeight + this.cardPadding);
    });
  }

  /**
   * 洗牌演算法
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  protected onStart(): void {
    this.matchedPairs = 0;
    this.revealedCards = [];
    this.canClick = true;
  }

  protected onPause(): void {
    this.canClick = false;
  }

  protected onResume(): void {
    this.canClick = true;
  }

  protected onEnd(result: MiniGameResult): void {
    console.log('記憶配對遊戲結束', result);
  }

  protected onUpdate(_deltaTime: number): void {
    // 檢查是否完成所有配對
    if (this.matchedPairs === this.totalPairs) {
      this.end(true);
    }
  }

  /**
   * 處理卡片點擊
   */
  public handleClick(x: number, y: number): void {
    if (!this.canClick) return;

    // 找到被點擊的卡片
    const clickedCard = this.cards.find(
      (card) =>
        card.state === CardState.HIDDEN &&
        x >= card.x &&
        x <= card.x + card.width &&
        y >= card.y &&
        y <= card.y + card.height
    );

    if (!clickedCard) return;

    // 翻開卡片
    clickedCard.state = CardState.REVEALED;
    this.revealedCards.push(clickedCard);
    this.totalAttempts++;

    // 如果翻開了兩張卡片
    if (this.revealedCards.length === 2) {
      this.canClick = false;

      // 檢查是否配對
      setTimeout(() => {
        this.checkMatch();
      }, 1000);
    }
  }

  /**
   * 檢查配對
   */
  private checkMatch(): void {
    const [card1, card2] = this.revealedCards;

    if (card1.birdData.id === card2.birdData.id) {
      // 配對成功
      card1.state = CardState.MATCHED;
      card2.state = CardState.MATCHED;
      this.matchedPairs++;
      this.correctCount++;
      this.score += 100;

      this.eventSystem.emit('minigame:match_success', {
        birdName: card1.birdData.name,
      });
    } else {
      // 配對失敗
      card1.state = CardState.HIDDEN;
      card2.state = CardState.HIDDEN;

      this.eventSystem.emit('minigame:match_fail', {});
    }

    this.revealedCards = [];
    this.canClick = true;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // 繪製標題
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.getName(), 400, 40);

    // 繪製分數和時間
    ctx.font = '16px Arial';
    ctx.fillText(`分數: ${this.score}`, 200, 40);
    
    const remainingTime = this.getRemainingTime();
    if (remainingTime !== null) {
      ctx.fillText(`剩餘時間: ${Math.ceil(remainingTime)}秒`, 600, 40);
    }

    ctx.fillText(`配對: ${this.matchedPairs}/${this.totalPairs}`, 400, 70);

    ctx.restore();

    // 繪製卡片
    this.cards.forEach((card) => {
      this.renderCard(ctx, card);
    });
  }

  /**
   * 渲染單張卡片
   */
  private renderCard(ctx: CanvasRenderingContext2D, card: Card): void {
    ctx.save();

    // 卡片背景
    if (card.state === CardState.MATCHED) {
      ctx.fillStyle = '#4CAF50';
    } else if (card.state === CardState.REVEALED) {
      ctx.fillStyle = '#FFFFFF';
    } else {
      ctx.fillStyle = '#2196F3';
    }

    // 繪製卡片
    ctx.fillRect(card.x, card.y, card.width, card.height);

    // 邊框
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(card.x, card.y, card.width, card.height);

    // 如果卡片被翻開或已配對，顯示鳥類資訊
    if (card.state === CardState.REVEALED || card.state === CardState.MATCHED) {
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 鳥類名稱
      const lines = this.wrapText(ctx, card.birdData.name, card.width - 10);
      lines.forEach((line, index) => {
        ctx.fillText(
          line,
          card.x + card.width / 2,
          card.y + card.height / 2 - 10 + index * 20
        );
      });

      // 稀有度
      ctx.font = '12px Arial';
      ctx.fillStyle = this.getRarityColor(card.birdData.rarity);
      ctx.fillText(
        this.getRarityText(card.birdData.rarity),
        card.x + card.width / 2,
        card.y + card.height - 20
      );
    } else {
      // 卡片背面顯示問號
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', card.x + card.width / 2, card.y + card.height / 2);
    }

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
