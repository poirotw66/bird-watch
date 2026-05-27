import { Component } from '../core/Component';
import { PokedexSystem } from '../systems/PokedexSystem';
import { InputManager } from '../core/InputManager';
import { BirdData } from '../models/BirdData';
import { birdImageLoader } from '../utils/birdImageLoader';
import { getTaiwanBirdById } from '../data/taiwanBirdCatalog';
import { getViewport } from '../utils/viewport';

/**
 * 圖鑑 UI 組件
 * 顯示已解鎖的鳥類資訊
 */
export class PokedexUI extends Component {
  private pokedexSystem: PokedexSystem;
  private inputManager: InputManager;
  private isOpen: boolean = false;
  private selectedIndex: number = 0;
  private scrollOffset: number = 0;
  
  // 按鍵狀態追蹤（用於檢測按鍵剛按下）
  private previousKeys: Set<string> = new Set();
  
  // UI 配置
  private readonly panelWidth = 600;
  private readonly panelHeight = 500;
  private readonly itemHeight = 60;
  private readonly itemsPerPage = 7;
  private readonly padding = 20;

  constructor() {
    super();
    this.pokedexSystem = PokedexSystem.getInstance();
    this.inputManager = InputManager.getInstance();
  }

  /**
   * 檢查按鍵是否剛按下
   */
  private isKeyJustPressed(keyCode: string): boolean {
    const isDown = this.inputManager.isKeyDown(keyCode);
    const wasDown = this.previousKeys.has(keyCode);
    return isDown && !wasDown;
  }

  /**
   * 更新按鍵狀態
   */
  private updateKeyStates(): void {
    this.previousKeys.clear();
    const keys = ['KeyP', 'Escape', 'ArrowUp', 'ArrowDown'];
    for (const key of keys) {
      if (this.inputManager.isKeyDown(key)) {
        this.previousKeys.add(key);
      }
    }
  }

  /**
   * 更新
   */
  public update(_deltaTime: number): void {
    // 按 P 鍵切換圖鑑顯示
    if (this.isKeyJustPressed('KeyP')) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.selectedIndex = 0;
        this.scrollOffset = 0;
      }
    }

    if (!this.isOpen) {
      this.updateKeyStates();
      return;
    }

    // 按 ESC 關閉
    if (this.isKeyJustPressed('Escape')) {
      this.isOpen = false;
      this.updateKeyStates();
      return;
    }

    // 上下鍵選擇
    const unlockedBirds = this.getUnlockedBirds();
    if (unlockedBirds.length > 0) {
      if (this.isKeyJustPressed('ArrowUp')) {
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        this.updateScroll();
      }
      if (this.isKeyJustPressed('ArrowDown')) {
        this.selectedIndex = Math.min(unlockedBirds.length - 1, this.selectedIndex + 1);
        this.updateScroll();
      }
    }

    this.updateKeyStates();
  }

  /**
   * 渲染
   */
  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isOpen) {
      // 顯示提示
      this.renderHint(ctx);
      return;
    }

    const { width: vw, height: vh } = getViewport(ctx);
    const panelWidth = Math.min(this.panelWidth, vw - 40);
    const panelHeight = Math.min(this.panelHeight, vh - 40);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, vw, vh);

    const x = (vw - panelWidth) / 2;
    const y = (vh - panelHeight) / 2;

    // 繪製面板背景
    ctx.fillStyle = 'rgba(40, 40, 40, 0.95)';
    ctx.fillRect(x, y, panelWidth, panelHeight);
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, panelWidth, panelHeight);

    // 標題
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🦜 鳥類圖鑑', x + panelWidth / 2, y + 35);

    // 統計資訊
    const stats = this.pokedexSystem.getStats();
    ctx.font = '14px Arial';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(
      `已解鎖：${stats.unlocked} / ${stats.total} (${stats.completionRate.toFixed(1)}%)`,
      x + panelWidth / 2,
      y + 60
    );

    // 分隔線
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + this.padding, y + 75);
    ctx.lineTo(x + panelWidth - this.padding, y + 75);
    ctx.stroke();

    // 鳥類列表
    this.renderBirdList(ctx, x, y + 85);

    // 詳細資訊
    this.renderBirdDetails(ctx, x, y);

    // 控制提示
    this.renderControls(ctx, x, y + this.panelHeight - 30);
  }

  /**
   * 渲染提示
   */
  private renderHint(_ctx: CanvasRenderingContext2D): void {
    // Compact hint is drawn by GameScene HUD bar; avoid overlapping UI.
  }

  /**
   * 渲染鳥類列表
   */
  private renderBirdList(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const unlockedBirds = this.getUnlockedBirds();
    const listWidth = 250;
    const listHeight = this.panelHeight - 180;

    // 列表背景
    ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
    ctx.fillRect(x + this.padding, y, listWidth, listHeight);

    // 繪製可見的鳥類項目
    const startIndex = this.scrollOffset;
    const endIndex = Math.min(startIndex + this.itemsPerPage, unlockedBirds.length);

    for (let i = startIndex; i < endIndex; i++) {
      const bird = unlockedBirds[i];
      const itemY = y + (i - startIndex) * this.itemHeight;
      const isSelected = i === this.selectedIndex;

      // 選中背景
      if (isSelected) {
        ctx.fillStyle = 'rgba(74, 158, 255, 0.3)';
        ctx.fillRect(x + this.padding, itemY, listWidth, this.itemHeight);
      }

      const thumb = birdImageLoader.getThumbnail(bird.id);
      const iconX = x + this.padding + 25;
      const iconY = itemY + 30;
      if (thumb) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(iconX, iconY, 18, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(thumb, iconX - 18, iconY - 18, 36, 36);
        ctx.restore();
      } else {
        const rarityColors: Record<string, string> = {
          common: '#888888',
          uncommon: '#4a9eff',
          rare: '#9b59b6',
          legendary: '#f39c12',
        };
        ctx.fillStyle = rarityColors[bird.classification.rarity] || '#888888';
        ctx.beginPath();
        ctx.arc(iconX, iconY, 15, 0, Math.PI * 2);
        ctx.fill();
      }

      // 鳥類名稱
      ctx.fillStyle = isSelected ? '#ffffff' : '#cccccc';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(bird.species.commonName, x + this.padding + 50, itemY + 25);

      // 稀有度
      const rarityText: Record<string, string> = {
        common: '常見',
        uncommon: '不常見',
        rare: '稀有',
        legendary: '傳說'
      };
      ctx.fillStyle = isSelected ? '#aaaaaa' : '#888888';
      ctx.font = '12px Arial';
      ctx.fillText(rarityText[bird.classification.rarity], x + this.padding + 50, itemY + 42);
    }

    // 滾動條
    if (unlockedBirds.length > this.itemsPerPage) {
      const scrollBarHeight = (this.itemsPerPage / unlockedBirds.length) * listHeight;
      const scrollBarY = (this.scrollOffset / unlockedBirds.length) * listHeight;
      
      ctx.fillStyle = 'rgba(74, 158, 255, 0.5)';
      ctx.fillRect(
        x + this.padding + listWidth - 5,
        y + scrollBarY,
        5,
        scrollBarHeight
      );
    }
  }

  /**
   * 渲染鳥類詳細資訊
   */
  private renderBirdDetails(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const unlockedBirds = this.getUnlockedBirds();
    if (unlockedBirds.length === 0) {
      ctx.fillStyle = '#888888';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('尚未解鎖任何鳥類', x + this.panelWidth / 2, y + this.panelHeight / 2);
      return;
    }

    const bird = unlockedBirds[this.selectedIndex];
    const entry = this.pokedexSystem.getEntry(bird.id);
    if (!entry) return;

    const detailX = x + 290;
    const detailY = y + 85;
    const detailWidth = this.panelWidth - 310;

    // 詳細資訊背景
    ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
    ctx.fillRect(detailX, detailY, detailWidth, this.panelHeight - 180);

    let currentY = detailY + 20;

    const largePhoto = birdImageLoader.getLarge(bird.id);
    if (largePhoto) {
      const imgW = detailWidth - 30;
      const imgH = 140;
      ctx.drawImage(largePhoto, detailX + 15, currentY, imgW, imgH);
      currentY += imgH + 12;
    }

    // 鳥類名稱
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(bird.species.commonName, detailX + 15, currentY);
    currentY += 30;

    // 學名
    ctx.fillStyle = '#aaaaaa';
    ctx.font = 'italic 14px Arial';
    ctx.fillText(bird.species.scientificName, detailX + 15, currentY);
    currentY += 30;

    ctx.fillStyle = '#cccccc';
    ctx.font = '14px Arial';
    const catalogBird = getTaiwanBirdById(bird.id);
    const description =
      catalogBird?.description ?? `棲息地：${bird.behavior.habitat.join('、')}`;
    const maxWidth = detailWidth - 30;
    const words = description.split('');
    let line = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, detailX + 15, currentY);
        currentY += 20;
        line = words[i];
      } else {
        line = testLine;
      }
    }
    if (line !== '') {
      ctx.fillText(line, detailX + 15, currentY);
      currentY += 30;
    }

    // 統計資訊
    ctx.fillStyle = '#4a9eff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('觀察記錄', detailX + 15, currentY);
    currentY += 20;

    ctx.fillStyle = '#cccccc';
    ctx.font = '13px Arial';
    ctx.fillText(`觀察次數：${entry.observations.length}`, detailX + 15, currentY);
    currentY += 18;
    
    const photoCount = entry.observations.filter(o => o.photoQuality).length;
    ctx.fillText(`拍照次數：${photoCount}`, detailX + 15, currentY);
    currentY += 18;
    
    ctx.fillText(`總目擊數：${entry.totalSightings}`, detailX + 15, currentY);
    currentY += 18;
    
    ctx.fillText(`識別準確率：${(entry.identificationAccuracy * 100).toFixed(1)}%`, detailX + 15, currentY);
    currentY += 18;
    
    if (entry.bestPhoto) {
      const qualityText: Record<string, string> = {
        poor: '差',
        good: '良好',
        excellent: '優秀'
      };
      ctx.fillText(`最佳照片：${qualityText[entry.bestPhoto] || entry.bestPhoto}`, detailX + 15, currentY);
      currentY += 18;
    }

    // 首次發現時間
    if (entry.firstSeen) {
      currentY += 10;
      ctx.fillStyle = '#888888';
      ctx.font = '12px Arial';
      const date = new Date(entry.firstSeen);
      ctx.fillText(
        `首次發現：${date.toLocaleDateString('zh-TW')}`,
        detailX + 15,
        currentY
      );
    }
  }

  /**
   * 渲染控制提示
   */
  private renderControls(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#888888';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      '↑↓ 選擇 | P/ESC 關閉',
      x + this.panelWidth / 2,
      y
    );
  }

  /**
   * 獲取已解鎖的鳥類列表
   */
  private getUnlockedBirds(): BirdData[] {
    const unlockedEntries = this.pokedexSystem.getAllEntries()
      .filter(entry => entry.unlocked);
    
    const birds: BirdData[] = [];
    for (const entry of unlockedEntries) {
      const bird = this.pokedexSystem.getBirdData(entry.birdId);
      if (bird) {
        birds.push(bird);
      }
    }
    
    // 按稀有度排序
    return birds.sort((a, b) => {
      const rarityOrder: Record<string, number> = {
        common: 0,
        uncommon: 1,
        rare: 2,
        legendary: 3
      };
      const rarityA = rarityOrder[a.classification.rarity] || 0;
      const rarityB = rarityOrder[b.classification.rarity] || 0;
      return rarityA - rarityB;
    });
  }

  /**
   * 更新滾動位置
   */
  private updateScroll(): void {
    if (this.selectedIndex < this.scrollOffset) {
      this.scrollOffset = this.selectedIndex;
    } else if (this.selectedIndex >= this.scrollOffset + this.itemsPerPage) {
      this.scrollOffset = this.selectedIndex - this.itemsPerPage + 1;
    }
  }
}

// Made with Bob
