import { Scene } from '@/core/Scene';
import { GameObject } from '@/core/GameObject';
import { Component } from '@/core/Component';
import { gameState } from '@/core/GameState';
import { questSystem } from '@/systems/QuestSystem';
import { achievementSystem } from '@/systems/AchievementSystem';
import { pokedexSystem } from '@/systems/PokedexSystem';
import { MapSystem } from '@/systems/MapSystem';
import { inputManager } from '@/core/InputManager';
import { PlayerController } from '@/components/PlayerController';
import { BirdSprite } from '@/components/BirdSprite';
import { TAIWAN_BIRD_CATALOG } from '@/data/taiwanBirdCatalog';
import { catalogToBirdData } from '@/data/birdDataAdapter';
import { observationSystem } from '@/systems/ObservationSystem';
import { ObservationUI } from '@/components/ObservationUI';
import { photoSystem } from '@/systems/PhotoSystem';
import { pokedexUnlockSystem } from '@/systems/PokedexUnlockSystem';
import { PokedexUI } from '@/components/PokedexUI';
import { AchievementNotification } from '@/components/AchievementNotification';
import { QuestUI } from '@/components/QuestUI';
import { INITIAL_QUESTS } from '@/data/initialQuests';
import { MapRenderer } from '@/components/MapRenderer';
import { MapPortal } from '@/components/MapPortal';
import { MapUI } from '@/components/MapUI';
import { eventBus, GameEvents } from '@/core/EventSystem';
import type { SimpleBirdData } from '@/data/simpleBirds';

/**
 * UI 組件 - 顯示遊戲資訊
 */
class UIComponent extends Component {
  public update(_deltaTime: number): void {
    // UI 不需要更新邏輯
  }

  public render(ctx: CanvasRenderingContext2D): void {
    try {
      const player = gameState.getPlayer();
      if (!player) {
        // 如果沒有玩家，顯示載入中
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 300, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.fillText('載入中...', 20, 60);
        ctx.restore();
        return;
      }

      const stats = pokedexSystem.getStats();
      const questStats = questSystem.getQuestStats();
      const achievementStats = achievementSystem.getAchievementStats();

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 300, 200);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    let y = 35;

    // 玩家資訊
    ctx.fillText(`玩家: ${player.getData().profile.name}`, 20, y);
    y += 25;
    ctx.fillText(`等級: ${player.getData().progress.level}`, 20, y);
    y += 25;
    ctx.fillText(`經驗: ${player.getData().progress.experience}/${player.getData().progress.experienceToNextLevel}`, 20, y);
    y += 25;

    // 圖鑑統計
    ctx.fillText(`圖鑑: ${stats.unlocked}/${stats.total} (${stats.completionRate.toFixed(1)}%)`, 20, y);
    y += 25;

    // 任務統計
    ctx.fillText(`任務: ${questStats.completed}/${questStats.total}`, 20, y);
    y += 25;

    // 成就統計
    ctx.fillText(`成就: ${achievementStats.unlocked}/${achievementStats.total}`, 20, y);

      ctx.restore();
    } catch (error) {
      console.error('UI 渲染錯誤:', error);
    }
  }
}

/**
 * 控制說明組件
 */
class ControlsComponent extends Component {
  public update(_deltaTime: number): void {
    // 控制說明不需要更新邏輯
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    const x = ctx.canvas.width - 310;
    const y = 10;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, 300, 180);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    
    let textY = y + 25;
    ctx.fillText('遊戲控制:', x + 10, textY);
    textY += 25;
    ctx.fillText('WASD/方向鍵 - 移動', x + 10, textY);
    textY += 25;
    ctx.fillText('E - 傳送/互動', x + 10, textY);
    textY += 25;
    ctx.fillText('滑鼠左鍵/F - 觀察', x + 10, textY);
    textY += 25;
    ctx.fillText('C - 拍照', x + 10, textY);
    textY += 25;
    ctx.fillText('P - 圖鑑', x + 10, textY);
    textY += 25;
    ctx.fillText('Q - 任務', x + 10, textY);
    textY += 25;
    ctx.fillText('M - 地圖', x + 10, textY);

    ctx.restore();
  }
}

/**
 * 系統狀態組件
 */
class SystemStatusComponent extends Component {
  public update(_deltaTime: number): void {
    // 系統狀態不需要更新邏輯
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    const x = 10;
    const y = ctx.canvas.height - 150;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, 300, 140);

    ctx.fillStyle = '#4CAF50';
    ctx.font = '14px monospace';
    
    let textY = y + 25;
    ctx.fillText('系統狀態:', x + 10, textY);
    
    ctx.fillStyle = '#ffffff';
    textY += 25;
    ctx.fillText('✓ 遊戲引擎', x + 10, textY);
    textY += 25;
    ctx.fillText('✓ 任務系統', x + 10, textY);
    textY += 25;
    ctx.fillText('✓ 成就系統', x + 10, textY);
    textY += 25;
    ctx.fillText('✓ 圖鑑系統', x + 10, textY);

    ctx.restore();
  }
}

/**
 * 主遊戲場景
 */
export class GameScene extends Scene {
  private uiObject: GameObject | null = null;
  private controlsObject: GameObject | null = null;
  private statusObject: GameObject | null = null;
  private playerObject: GameObject | null = null;
  private birdObjects: GameObject[] = [];
  private observationUIObject: GameObject | null = null;
  private pokedexUIObject: GameObject | null = null;
  private achievementNotificationObject: GameObject | null = null;
  private questUIObject: GameObject | null = null;
  private mapRendererObject: GameObject | null = null;
  private mapPortalObject: GameObject | null = null;
  private mapUIObject: GameObject | null = null;
  private mapSystem: MapSystem;
  private mapRenderer: MapRenderer | null = null;
  private photoKeyWasDown: boolean = false;

  constructor() {
    super('GameScene');
    this.mapSystem = MapSystem.getInstance();
    eventBus.on('area:changed', () => {
      this.applyPanoramicCamera();
    });
  }

  public onEnter(): void {
    console.log('🎮 進入遊戲場景');

    void pokedexSystem.loadBirdDatabase(catalogToBirdData(TAIWAN_BIRD_CATALOG));
    this.initializeGame();
    const savedEntries = gameState.getAllPokedexEntries();
    if (savedEntries.length > 0) {
      pokedexSystem.loadPokedex(savedEntries);
    }

    // 初始化地圖系統
    this.initializeMapSystem();

    // 創建地圖渲染器（在最底層）
    this.mapRendererObject = new GameObject(0, 0);
    this.mapRenderer = new MapRenderer();
    this.mapRenderer.bindCamera(this.camera);
    this.mapRenderer.setCanvasSize(800, 600);
    this.mapRendererObject.addComponent(this.mapRenderer);
    this.addGameObject(this.mapRendererObject);
    console.log('✅ 地圖渲染器已創建');

    // 創建玩家物件（在地圖中央）
    const currentArea = this.mapSystem.getCurrentArea();
    this.playerObject = new GameObject(currentArea.width / 2, currentArea.height / 2);
    this.playerObject.addComponent(new PlayerController());
    this.addGameObject(this.playerObject);
    console.log('✅ 玩家物件已創建');

    this.applyPanoramicCamera();

    // 創建地圖傳送門組件
    this.mapPortalObject = new GameObject(0, 0);
    this.mapPortalObject.addComponent(new MapPortal());
    this.addGameObject(this.mapPortalObject);
    console.log('✅ 地圖傳送門已創建');

    // 生成一些鳥類
    this.spawnBirds();

    // 創建觀察 UI 物件
    this.observationUIObject = new GameObject(0, 0);
    this.observationUIObject.addComponent(new ObservationUI());
    this.addGameObject(this.observationUIObject);

    // 創建圖鑑 UI 物件
    this.pokedexUIObject = new GameObject(0, 0);
    this.pokedexUIObject.addComponent(new PokedexUI());
    this.addGameObject(this.pokedexUIObject);

    // 創建成就通知物件
    this.achievementNotificationObject = new GameObject(0, 0);
    this.achievementNotificationObject.addComponent(new AchievementNotification());
    this.addGameObject(this.achievementNotificationObject);

    // 創建任務 UI 物件
    this.questUIObject = new GameObject(0, 0);
    this.questUIObject.addComponent(new QuestUI());
    this.addGameObject(this.questUIObject);

    // 創建地圖 UI 物件
    this.mapUIObject = new GameObject(0, 0);
    this.mapUIObject.addComponent(new MapUI());
    this.addGameObject(this.mapUIObject);
    console.log('✅ 地圖 UI 已創建');

    // 創建 UI 物件
    this.uiObject = new GameObject(0, 0);
    this.uiObject.addComponent(new UIComponent());
    this.addGameObject(this.uiObject);

    // 創建控制說明物件
    this.controlsObject = new GameObject(0, 0);
    this.controlsObject.addComponent(new ControlsComponent());
    this.addGameObject(this.controlsObject);

    // 創建系統狀態物件
    this.statusObject = new GameObject(0, 0);
    this.statusObject.addComponent(new SystemStatusComponent());
    this.addGameObject(this.statusObject);

    const screenUiObjects = [
      this.observationUIObject,
      this.pokedexUIObject,
      this.achievementNotificationObject,
      this.questUIObject,
      this.mapUIObject,
      this.uiObject,
      this.controlsObject,
      this.statusObject,
    ];
    for (const obj of screenUiObjects) {
      if (obj) {
        obj.renderLayer = 'screen';
      }
    }
  }

  /**
   * 初始化地圖系統
   */
  private initializeMapSystem(): void {
    console.log('🗺️ 初始化地圖系統...');
    // 地圖系統已經在構造函數中初始化
    console.log('✅ 地圖系統已初始化');
  }

  private initializeGame(): void {
    try {
      // 初始化遊戲狀態
      console.log('初始化遊戲狀態...');
      
      // 檢查是否有玩家
      let player = gameState.getPlayer();
      if (!player) {
        console.log('創建新玩家...');
        gameState.createNewGame('賞鳥玩家');
        player = gameState.getPlayer();
      }

      // 載入初始任務
      questSystem.loadQuests(INITIAL_QUESTS).catch(error => {
        console.error('載入任務資料失敗:', error);
      });

      console.log('✅ 遊戲系統已初始化');
      if (player) {
        console.log('📊 玩家資料:', player.getData());
      }
    } catch (error) {
      console.error('❌ 遊戲初始化錯誤:', error);
      // 即使初始化失敗也繼續運行，只是不顯示玩家資料
    }
  }

  /**
   * 生成鳥類
   */
  private spawnBirds(): void {
    console.log('🐦 生成鳥類...');

    const area = this.mapSystem.getCurrentArea();
    const numBirds = 6 + Math.floor(Math.random() * 4);
    const playerX = this.playerObject?.position.x ?? area.width / 2;
    const playerY = this.playerObject?.position.y ?? area.height / 2;

    for (let i = 0; i < numBirds; i++) {
      const randomBird = TAIWAN_BIRD_CATALOG[Math.floor(Math.random() * TAIWAN_BIRD_CATALOG.length)];

      let x: number;
      let y: number;
      let attempts = 0;
      do {
        x = 80 + Math.random() * (area.width - 160);
        y = 80 + Math.random() * (area.height - 160);
        attempts++;
      } while (attempts < 20 && Math.hypot(x - playerX, y - playerY) < 180);
      
      // 創建鳥類物件
      const birdObject = new GameObject(x, y);
      const birdSprite = new BirdSprite(randomBird);
      birdObject.addComponent(birdSprite);
      this.addGameObject(birdObject);
      this.birdObjects.push(birdObject);
      
      console.log(`  ✓ 生成 ${randomBird.name} 於 (${Math.floor(x)}, ${Math.floor(y)})`);
    }
    
    console.log(`✅ 共生成 ${numBirds} 隻鳥類`);
  }

  public onExit(): void {
    console.log('離開遊戲場景');
    this.clear();
  }

  public onViewportResize(_width: number, _height: number): void {
    this.applyPanoramicCamera();
  }

  private applyPanoramicCamera(): void {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
    const viewW = canvas?.clientWidth ?? 800;
    const viewH = canvas?.clientHeight ?? 600;
    const area = this.mapSystem.getCurrentArea();

    this.camera.setViewSize(viewW, viewH);
    this.camera.setWorldBounds(area.width, area.height);
    this.camera.fitToWorld(0.98);
  }

  public update(deltaTime: number): void {
    super.update(deltaTime);
    this.handleObservation();
  }

  /**
   * 處理鳥類觀察邏輯
   */
  private handleObservation(): void {
    if (!this.playerObject) return;

    const playerPos = this.playerObject.position;
    const photoDown = inputManager.isKeyDown('KeyC');
    if (photoDown && !this.photoKeyWasDown) {
      this.handlePhotoCapture();
    }
    this.photoKeyWasDown = photoDown;

    if (observationSystem.isObserving()) {
      if (!inputManager.isObservePressed()) {
        const record = observationSystem.endObservation();
        if (record) {
          this.onObservationComplete(record.birdId, record.identified, record.points);
        }
      }
    } else if (inputManager.isObservePressed()) {
      const target = this.findNearestBird(playerPos, 160);
      if (target) {
        observationSystem.startObservation(target.bird, target.distance);
      }
    }

    if (inputManager.isKeyJustPressed('Escape') && observationSystem.isObserving()) {
      observationSystem.cancelObservation();
    }
  }

  private findNearestBird(
    playerPos: { x: number; y: number },
    maxDistance: number,
  ): { bird: SimpleBirdData; distance: number } | null {
    let closestBird: GameObject | null = null;
    let closestDistance = Infinity;

    for (const birdObj of this.birdObjects) {
      const dx = birdObj.position.x - playerPos.x;
      const dy = birdObj.position.y - playerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < closestDistance && distance < maxDistance) {
        closestDistance = distance;
        closestBird = birdObj;
      }
    }

    if (!closestBird) {
      return null;
    }
    const birdSprite = closestBird.getComponent(BirdSprite);
    if (!birdSprite) {
      return null;
    }
    return { bird: birdSprite.getBirdData(), distance: closestDistance };
  }

  private onObservationComplete(birdId: string, identified: boolean, points: number): void {
    pokedexSystem.discoverBird(birdId);
    if (identified) {
      pokedexSystem.recordIdentification(birdId, true);
      eventBus.emit(GameEvents.BIRD_IDENTIFIED, { birdId, correct: true, points });
    }
    pokedexUnlockSystem.checkUnlock(birdId);
    gameState.getPlayer().addExperience(Math.max(5, Math.floor(points / 2)));
    this.syncPokedexToGameState();
  }

  private syncPokedexToGameState(): void {
    for (const entry of pokedexSystem.getAllEntries()) {
      gameState.updatePokedexEntry(entry);
    }
  }

  /**
   * 處理拍照
   */
  private handlePhotoCapture(): void {
    if (!this.playerObject) return;

    const playerPos = this.playerObject.position;

    // 尋找最近的鳥類
    let closestBird: GameObject | null = null;
    let closestDistance = Infinity;

    for (const birdObj of this.birdObjects) {
      const dx = birdObj.position.x - playerPos.x;
      const dy = birdObj.position.y - playerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < closestDistance && distance < 200) {
        closestDistance = distance;
        closestBird = birdObj;
      }
    }

    // 如果找到鳥類，拍照
    if (closestBird) {
      const birdSprite = closestBird.getComponent(BirdSprite);
      if (birdSprite) {
        const birdData = birdSprite.getBirdData();
        const photo = photoSystem.takePhoto(birdData, closestDistance, 0);
        pokedexSystem.discoverBird(birdData.id);
        pokedexSystem.photographBird(birdData.id, photo.quality);
        pokedexUnlockSystem.checkUnlock(birdData.id);
        gameState.getPlayer().addExperience(Math.max(5, Math.floor(photo.points / 2)));
        this.syncPokedexToGameState();
        this.showPhotoResult(photo);
      }
    } else {
      console.log('📸 沒有找到可拍攝的鳥類（距離太遠）');
    }
  }

  /**
   * 顯示拍照結果
   */
  private showPhotoResult(photo: any): void {
    // TODO: 創建一個更好的 UI 來顯示拍照結果
    console.log('📸 拍照成功！');
    console.log(`   鳥類: ${photo.birdName}`);
    console.log(`   品質: ${photo.quality}`);
    console.log(`   分數: ${photo.score}`);
    console.log(`   點數: +${photo.points}`);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    super.render(ctx);
  }
}

// Made with Bob
