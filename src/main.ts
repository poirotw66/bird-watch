
import { Engine } from '@/core/Engine';
import { HomeScene } from '@/scenes/HomeScene';
import { eventBus, GameEvents } from '@/core/EventSystem';
import { GameState } from '@/core/GameState';
import { birdImageLoader } from '@/utils/birdImageLoader';
import { birdCallLoader } from '@/utils/birdCallLoader';

/**
 * 遊戲主程式
 */
class Game {
  private engine: Engine | null = null;
  private loadingElement: HTMLElement | null = null;
  private progressBar: HTMLElement | null = null;

  constructor() {
    this.loadingElement = document.getElementById('loading');
    this.progressBar = document.getElementById('progress-bar');
  }

  /**
   * 初始化遊戲
   */
  public async init(): Promise<void> {
    try {
      console.log('🎮 初始化賞鳥探索冒險遊戲...');

      // 更新載入進度
      this.updateProgress(20, '初始化引擎...');

      // 創建遊戲引擎
      this.engine = new Engine('game-canvas');
      console.log('✅ 引擎創建成功');

      this.updateProgress(40, '載入資源...');

      // 模擬資源載入
      await this.loadAssets();
      console.log('✅ 資源載入完成');

      this.updateProgress(60, '初始化遊戲狀態...');

      // 初始化遊戲狀態
      try {
        await GameState.getInstance().initialize();
        console.log('✅ 遊戲狀態初始化完成');
      } catch (error) {
        console.error('❌ 遊戲狀態初始化失敗:', error);
        throw error;
      }

      this.updateProgress(70, '準備場景...');

      // 設定事件監聽
      this.setupEventListeners();
      console.log('✅ 事件監聽器設定完成');

      this.updateProgress(85, '啟動遊戲...');

      // 載入遊戲場景
      try {
        const homeScene = new HomeScene();
        console.log('✅ 首頁場景創建成功');

        this.engine.loadScene(homeScene);
        console.log('✅ 場景載入完成');
      } catch (error) {
        console.error('❌ 場景載入失敗:', error);
        throw error;
      }

      this.updateProgress(100, '完成！');

      // 延遲一下再隱藏載入畫面
      await this.delay(500);

      // 隱藏載入畫面
      this.hideLoading();

      // 啟動引擎
      this.engine.start();
      console.log('✅ 遊戲啟動成功！');
      
      // 顯示成功訊息
      this.showSuccessMessage();
      
    } catch (error) {
      console.error('❌ 遊戲初始化失敗:', error);
      console.error('錯誤堆疊:', (error as Error).stack);
      this.showError('遊戲初始化失敗，請重新整理頁面');
    }
  }

  /**
   * 載入遊戲資源
   */
  private async loadAssets(): Promise<void> {
    await birdImageLoader.loadManifest();
    await birdImageLoader.preloadAll();
    await birdCallLoader.loadManifest();
  }

  /**
   * 設定事件監聽器
   */
  private setupEventListeners(): void {
    eventBus.on(GameEvents.ENGINE_START, () => {
      console.log('🎮 引擎已啟動');
    });

    eventBus.on(GameEvents.ENGINE_STOP, () => {
      console.log('🛑 引擎已停止');
    });

    eventBus.on(GameEvents.ENGINE_PAUSE, () => {
      console.log('⏸️  遊戲已暫停');
    });

    eventBus.on(GameEvents.ENGINE_RESUME, () => {
      console.log('▶️  遊戲已恢復');
    });

    eventBus.on(GameEvents.SCENE_ENTER, (data) => {
      console.log(`🎬 進入場景: ${data.scene}`);
    });

    eventBus.on(GameEvents.SCENE_EXIT, (data) => {
      console.log(`🚪 離開場景: ${data.scene}`);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.engine?.isGamePaused()) {
          this.engine.resume();
        } else {
          this.engine?.pause();
        }
      }
    });
  }

  private showSuccessMessage(): void {
    console.log('🐦 歡迎來到賞鳥探索冒險！');
  }

  /**
   * 更新載入進度
   */
  private updateProgress(percent: number, text: string): void {
    if (this.progressBar) {
      this.progressBar.style.width = `${percent}%`;
    }
    if (this.loadingElement) {
      const textElement = this.loadingElement.querySelector('.loading-text');
      if (textElement) {
        textElement.textContent = text;
      }
    }
  }

  /**
   * 隱藏載入畫面
   */
  private hideLoading(): void {
    if (this.loadingElement) {
      this.loadingElement.classList.add('hidden');
    }
  }

  /**
   * 顯示錯誤訊息
   */
  private showError(message: string): void {
    if (this.loadingElement) {
      const textElement = this.loadingElement.querySelector('.loading-text') as HTMLElement;
      if (textElement) {
        textElement.textContent = message;
        textElement.style.color = '#ff5252';
      }
    }
  }

  /**
   * 延遲函數
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 銷毀遊戲
   */
  public destroy(): void {
    if (this.engine) {
      this.engine.destroy();
      this.engine = null;
    }
    eventBus.clear();
  }
}

// 當 DOM 載入完成後初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.init();

  // 將遊戲實例掛載到 window 以便在控制台中訪問
  (window as any).game = game;
});

// 處理頁面卸載
window.addEventListener('beforeunload', () => {
  const game = (window as any).game;
  if (game) {
    game.destroy();
  }
});

// Made with Bob
