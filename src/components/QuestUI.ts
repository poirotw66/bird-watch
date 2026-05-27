import { Component } from '../core/Component';
import { QuestSystem } from '../systems/QuestSystem';
import { InputManager } from '../core/InputManager';
import { EventSystem, GameEvents } from '../core/EventSystem';
import { getViewport } from '../utils/viewport';

/**
 * 任務 UI 組件
 * 顯示任務列表和詳細資訊
 */
export class QuestUI extends Component {
  private questSystem: QuestSystem;
  private inputManager: InputManager;
  private eventSystem: EventSystem;
  private isOpen: boolean = false;
  private selectedIndex: number = 0;
  private scrollOffset: number = 0;
  private currentTab: 'active' | 'completed' | 'available' = 'active';
  
  // 按鍵狀態追蹤
  private previousKeys: Set<string> = new Set();
  
  // UI 配置
  private readonly panelWidth = 700;
  private readonly panelHeight = 550;
  private readonly itemHeight = 80;
  private readonly itemsPerPage = 5;
  private readonly padding = 20;

  constructor() {
    super();
    this.questSystem = QuestSystem.getInstance();
    this.inputManager = InputManager.getInstance();
    this.eventSystem = EventSystem.getInstance();
    this.setupEventListeners();
  }

  /**
   * 設定事件監聽器
   */
  private setupEventListeners(): void {
    // 監聽任務完成事件
    this.eventSystem.on(GameEvents.QUEST_COMPLETED, () => {
      // 任務完成時可以添加特效或聲音
    });

    // 監聽任務解鎖事件
    this.eventSystem.on(GameEvents.QUEST_UNLOCKED, () => {
      // 任務解鎖時可以添加通知
    });
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
    const keys = ['KeyQ', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
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
    // 按 Q 鍵切換任務列表顯示
    if (this.isKeyJustPressed('KeyQ')) {
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

    // 左右鍵切換分頁
    if (this.isKeyJustPressed('ArrowLeft')) {
      this.switchTab(-1);
    }
    if (this.isKeyJustPressed('ArrowRight')) {
      this.switchTab(1);
    }

    // 上下鍵選擇任務
    const quests = this.getCurrentQuests();
    if (quests.length > 0) {
      if (this.isKeyJustPressed('ArrowUp')) {
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        this.updateScroll();
      }
      if (this.isKeyJustPressed('ArrowDown')) {
        this.selectedIndex = Math.min(quests.length - 1, this.selectedIndex + 1);
        this.updateScroll();
      }

      // Enter 鍵接受/放棄任務
      if (this.isKeyJustPressed('Enter')) {
        this.handleQuestAction();
      }
    }

    this.updateKeyStates();
  }

  /**
   * 切換分頁
   */
  private switchTab(direction: number): void {
    const tabs: Array<'active' | 'completed' | 'available'> = ['active', 'available', 'completed'];
    const currentIndex = tabs.indexOf(this.currentTab);
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) newIndex = tabs.length - 1;
    if (newIndex >= tabs.length) newIndex = 0;
    
    this.currentTab = tabs[newIndex];
    this.selectedIndex = 0;
    this.scrollOffset = 0;
  }

  /**
   * 處理任務操作
   */
  private handleQuestAction(): void {
    const quests = this.getCurrentQuests();
    if (quests.length === 0) return;

    const quest = quests[this.selectedIndex];
    const questData = quest.getData();
    
    if (this.currentTab === 'available') {
      // 接受任務
      this.questSystem.startQuest(questData.id);
      console.log(`✅ 接受任務: ${questData.title}`);
    } else if (this.currentTab === 'active') {
      // 放棄任務（如果系統支援）
      // this.questSystem.abandonQuest(questData.id);
      console.log(`❌ 無法放棄任務: ${questData.title}`);
    }
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

    // 半透明背景
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
    ctx.fillText('📋 任務列表', x + this.panelWidth / 2, y + 35);

    // 分頁標籤
    this.renderTabs(ctx, x, y + 50);

    // 統計資訊
    this.renderStats(ctx, x, y + 90);

    // 分隔線
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + this.padding, y + 105);
    ctx.lineTo(x + this.panelWidth - this.padding, y + 105);
    ctx.stroke();

    // 任務列表
    this.renderQuestList(ctx, x, y + 115);

    // 任務詳細資訊
    this.renderQuestDetails(ctx, x, y);

    // 控制提示
    this.renderControls(ctx, x, y + this.panelHeight - 30);
  }

  /**
   * 渲染提示
   */
  private renderHint(_ctx: CanvasRenderingContext2D): void {
    // Hint shown in GameScene HUD bar.
  }

  /**
   * 渲染分頁標籤
   */
  private renderTabs(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const tabs = [
      { id: 'active' as const, label: '進行中', icon: '⚡' },
      { id: 'available' as const, label: '可接取', icon: '📌' },
      { id: 'completed' as const, label: '已完成', icon: '✅' }
    ];

    const tabWidth = 200;
    const startX = x + (this.panelWidth - tabWidth * tabs.length) / 2;

    tabs.forEach((tab, index) => {
      const tabX = startX + index * tabWidth;
      const isActive = this.currentTab === tab.id;

      // 標籤背景
      ctx.fillStyle = isActive ? 'rgba(74, 158, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(tabX, y, tabWidth, 30);

      // 標籤邊框
      if (isActive) {
        ctx.strokeStyle = '#4a9eff';
        ctx.lineWidth = 2;
        ctx.strokeRect(tabX, y, tabWidth, 30);
      }

      // 標籤文字
      ctx.fillStyle = isActive ? '#ffffff' : '#888888';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${tab.icon} ${tab.label}`, tabX + tabWidth / 2, y + 20);
    });
  }

  /**
   * 渲染統計資訊
   */
  private renderStats(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const stats = this.questSystem.getQuestStats();
    
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '13px Arial';
    ctx.textAlign = 'center';
    
    let text = '';
    if (this.currentTab === 'active') {
      const completionRate = stats.total > 0 ? (stats.completed / stats.total * 100) : 0;
      text = `進行中: ${stats.active} | 完成率: ${completionRate.toFixed(1)}%`;
    } else if (this.currentTab === 'available') {
      text = `可接取: ${stats.available}`;
    } else {
      text = `已完成: ${stats.completed} / ${stats.total}`;
    }
    
    ctx.fillText(text, x + this.panelWidth / 2, y);
  }

  /**
   * 渲染任務列表
   */
  private renderQuestList(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const quests = this.getCurrentQuests();
    const listWidth = 320;
    const listHeight = this.panelHeight - 220;

    // 列表背景
    ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
    ctx.fillRect(x + this.padding, y, listWidth, listHeight);

    if (quests.length === 0) {
      ctx.fillStyle = '#888888';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('沒有任務', x + this.padding + listWidth / 2, y + listHeight / 2);
      return;
    }

    // 繪製可見的任務項目
    const startIndex = this.scrollOffset;
    const endIndex = Math.min(startIndex + this.itemsPerPage, quests.length);

    for (let i = startIndex; i < endIndex; i++) {
      const quest = quests[i];
      const questData = quest.getData();
      const itemY = y + (i - startIndex) * this.itemHeight;
      const isSelected = i === this.selectedIndex;

      // 選中背景
      if (isSelected) {
        ctx.fillStyle = 'rgba(74, 158, 255, 0.3)';
        ctx.fillRect(x + this.padding, itemY, listWidth, this.itemHeight);
      }

      // 任務圖示
      const difficultyColors: Record<string, string> = {
        easy: '#4CAF50',
        medium: '#FFC107',
        hard: '#FF5722',
        expert: '#9C27B0'
      };
      ctx.fillStyle = difficultyColors[questData.difficulty] || '#888888';
      ctx.beginPath();
      ctx.arc(x + this.padding + 25, itemY + 40, 15, 0, Math.PI * 2);
      ctx.fill();

      // 任務標題
      ctx.fillStyle = isSelected ? '#ffffff' : '#cccccc';
      ctx.font = 'bold 15px Arial';
      ctx.textAlign = 'left';
      const maxTitleWidth = listWidth - 70;
      const title = this.truncateText(ctx, questData.title, maxTitleWidth);
      ctx.fillText(title, x + this.padding + 50, itemY + 30);

      // 任務類型和難度
      ctx.fillStyle = isSelected ? '#aaaaaa' : '#888888';
      ctx.font = '12px Arial';
      const typeText = this.getQuestTypeText(questData.type);
      const difficultyText = this.getDifficultyText(questData.difficulty);
      ctx.fillText(`${typeText} | ${difficultyText}`, x + this.padding + 50, itemY + 48);

      // 進度條（僅進行中的任務）
      if (this.currentTab === 'active' && questData.progress !== undefined) {
        const barWidth = listWidth - 70;
        const barHeight = 4;
        const barX = x + this.padding + 50;
        const barY = itemY + 58;

        // 背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 進度
        ctx.fillStyle = '#4a9eff';
        ctx.fillRect(barX, barY, barWidth * (questData.progress / 100), barHeight);

        // 進度文字
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '11px Arial';
        ctx.fillText(`${questData.progress.toFixed(0)}%`, barX + barWidth + 5, barY + 4);
      }
    }

    // 滾動條
    if (quests.length > this.itemsPerPage) {
      const scrollBarHeight = (this.itemsPerPage / quests.length) * listHeight;
      const scrollBarY = (this.scrollOffset / quests.length) * listHeight;
      
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
   * 渲染任務詳細資訊
   */
  private renderQuestDetails(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const quests = this.getCurrentQuests();
    if (quests.length === 0) return;

    const quest = quests[this.selectedIndex];
    const questData = quest.getData();
    const detailX = x + 360;
    const detailY = y + 115;
    const detailWidth = this.panelWidth - 380;
    const detailHeight = this.panelHeight - 220;

    // 詳細資訊背景
    ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
    ctx.fillRect(detailX, detailY, detailWidth, detailHeight);

    let currentY = detailY + 20;

    // 任務標題
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(questData.title, detailX + 15, currentY);
    currentY += 30;

    // 任務描述
    ctx.fillStyle = '#cccccc';
    ctx.font = '14px Arial';
    currentY = this.renderWrappedText(
      ctx,
      questData.description,
      detailX + 15,
      currentY,
      detailWidth - 30,
      18
    );
    currentY += 20;

    // 任務目標
    ctx.fillStyle = '#4a9eff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('任務目標:', detailX + 15, currentY);
    currentY += 20;

    ctx.fillStyle = '#cccccc';
    ctx.font = '13px Arial';
    for (const objective of questData.objectives) {
      const status = objective.completed ? '✅' : '⏳';
      const text = `${status} ${objective.description} (${objective.current}/${objective.target})`;
      ctx.fillText(text, detailX + 15, currentY);
      currentY += 20;
    }

    currentY += 10;

    // 任務獎勵
    ctx.fillStyle = '#FFC107';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('獎勵:', detailX + 15, currentY);
    currentY += 20;

    ctx.fillStyle = '#cccccc';
    ctx.font = '13px Arial';
    ctx.fillText(`經驗值: +${questData.rewards.experience}`, detailX + 15, currentY);
    currentY += 18;
    ctx.fillText(`金幣: +${questData.rewards.coins}`, detailX + 15, currentY);
    
    if (questData.rewards.items && questData.rewards.items.length > 0) {
      currentY += 18;
      const itemNames = questData.rewards.items.map(item => `${item.id} x${item.quantity}`).join(', ');
      ctx.fillText(`物品: ${itemNames}`, detailX + 15, currentY);
    }
  }

  /**
   * 渲染控制提示
   */
  private renderControls(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#888888';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    let controlText = '↑↓ 選擇 | ←→ 切換分頁 | Q/ESC 關閉';
    if (this.currentTab === 'available') {
      controlText += ' | Enter 接受任務';
    }
    
    ctx.fillText(controlText, x + this.panelWidth / 2, y);
  }

  /**
   * 獲取當前分頁的任務列表
   */
  private getCurrentQuests() {
    if (this.currentTab === 'active') {
      return this.questSystem.getActiveQuests();
    } else if (this.currentTab === 'available') {
      return this.questSystem.getAvailableQuests();
    } else {
      return this.questSystem.getCompletedQuests();
    }
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

  /**
   * 截斷文字
   */
  private truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    const metrics = ctx.measureText(text);
    if (metrics.width <= maxWidth) {
      return text;
    }

    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
  }

  /**
   * 渲染換行文字
   */
  private renderWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): number {
    const words = text.split('');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, x, currentY);
        currentY += lineHeight;
        line = words[i];
      } else {
        line = testLine;
      }
    }
    if (line !== '') {
      ctx.fillText(line, x, currentY);
      currentY += lineHeight;
    }

    return currentY;
  }

  /**
   * 獲取任務類型文字
   */
  private getQuestTypeText(type: string): string {
    const typeMap: Record<string, string> = {
      main: '主線',
      side: '支線',
      daily: '每日',
      event: '活動',
      tutorial: '教學'
    };
    return typeMap[type] || type;
  }

  /**
   * 獲取難度文字
   */
  private getDifficultyText(difficulty: string): string {
    const difficultyMap: Record<string, string> = {
      easy: '簡單',
      medium: '普通',
      hard: '困難',
      expert: '專家'
    };
    return difficultyMap[difficulty] || difficulty;
  }
}

// Made with Bob
