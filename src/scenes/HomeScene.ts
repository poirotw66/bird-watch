import { Scene } from '@/core/Scene';
import { getViewport } from '@/utils/viewport';
import { drawPanel, roundRectPath } from '@/utils/canvasUi';
import { theme } from '@/utils/uiTheme';
import { inputManager } from '@/core/InputManager';
import { eventBus, GameEvents } from '@/core/EventSystem';
import { GameScene } from '@/scenes/GameScene';

type GameMode = {
  id: string;
  name: string;
};

export class HomeScene extends Scene {
  private modes: GameMode[] = [
    { id: 'ecology_explore', name: '生態探索' },
  ];

  private selectedIndex: number = 0;

  constructor() {
    super('HomeScene');
  }

  public onEnter(): void {
    this.selectedIndex = 0;
  }

  public onExit(): void {
    this.clear();
  }

  public update(deltaTime: number): void {
    super.update(deltaTime);

    if (this.modes.length <= 1) {
      this.handleConfirm();
      return;
    }

    if (
      inputManager.isKeyJustPressed('ArrowUp') ||
      inputManager.isKeyJustPressed('KeyW')
    ) {
      this.selectedIndex =
        (this.selectedIndex - 1 + this.modes.length) % this.modes.length;
    }

    if (
      inputManager.isKeyJustPressed('ArrowDown') ||
      inputManager.isKeyJustPressed('KeyS')
    ) {
      this.selectedIndex = (this.selectedIndex + 1) % this.modes.length;
    }

    this.handleConfirm();
  }

  private handleConfirm(): void {
    if (!inputManager.isKeyJustPressed('Enter')) return;
    const selectedMode = this.modes[this.selectedIndex];
    if (!selectedMode) return;

    // Mode ID is currently informational; GameScene will start the existing gameplay flow.
    eventBus.emit(GameEvents.SCENE_LOAD_REQUEST, { scene: new GameScene() });
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const { width: vw, height: vh } = getViewport(ctx);

    // Background gradient
    const grd = ctx.createLinearGradient(0, 0, 0, vh);
    grd.addColorStop(0, '#1a2e24');
    grd.addColorStop(0.5, '#0f1a16');
    grd.addColorStop(1, '#1a2838');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, vw, vh);

    // Title
    ctx.fillStyle = theme.text;
    ctx.font = `bold 30px ${theme.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('賞鳥探索冒險', vw / 2, vh * 0.22);

    // Panel
    const panelW = Math.min(560, vw - 60);
    const panelH = Math.min(380, vh - 160);
    const panelX = (vw - panelW) / 2;
    const panelY = vh / 2 - panelH / 2;
    drawPanel(ctx, panelX, panelY, panelW, panelH, { title: '遊戲模式' });

    // Mode list
    const contentX = panelX + 16;
    let contentY = panelY + 70;
    const rowH = 54;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < this.modes.length; i++) {
      const mode = this.modes[i];
      const isSelected = i === this.selectedIndex;

      const rowX = contentX;
      const rowW = panelW - 32;
      const rowY = contentY + i * (rowH + 10);

      ctx.save();
      roundRectPath(ctx, rowX, rowY, rowW, rowH, 12);
      ctx.fillStyle = isSelected
        ? 'rgba(110, 207, 138, 0.22)'
        : 'rgba(255, 255, 255, 0.06)';
      ctx.fill();
      ctx.strokeStyle = isSelected
        ? 'rgba(110, 207, 138, 0.75)'
        : 'rgba(143, 196, 160, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = theme.text;
      ctx.font = `bold 18px ${theme.font}`;
      ctx.fillText(mode.name, rowX + 18, rowY + rowH / 2);

      if (this.modes.length > 1) {
        ctx.fillStyle = theme.textMuted;
        ctx.font = `14px ${theme.font}`;
        const hint = isSelected ? '已選擇' : '選擇';
        ctx.fillText(hint, rowX + rowW - 110, rowY + rowH / 2);
      }
    }

    // Instructions
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = theme.textMuted;
    ctx.font = `16px ${theme.font}`;
    const hintY = panelY + panelH - 46;
    const keysHint =
      this.modes.length > 1
        ? '使用方向鍵 / W S 選擇，按 Enter 開始'
        : '按 Enter 開始';
    ctx.fillText(keysHint, vw / 2, hintY);
  }
}

// Made with Bob

