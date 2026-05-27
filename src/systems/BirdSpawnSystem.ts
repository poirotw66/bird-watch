import { GameObject } from '@/core/GameObject';
import { Vector2 } from '@/utils/Vector2';
import { BirdData } from '@/models/BirdData';
import { mapSystem } from './MapSystem';
import { eventBus, GameEvents } from '@/core/EventSystem';
import { TimeOfDay, Weather, Season } from '@/types';
import { ObjectPool, PoolManager } from '@/utils/ObjectPool';

/**
 * 鳥類實例
 */
export interface BirdInstance {
  id: string;
  birdData: BirdData;
  gameObject: GameObject;
  state: BirdState;
  spawnTime: Date;
  despawnTime: Date | null;
}

/**
 * 鳥類狀態
 */
export type BirdState = 'idle' | 'flying' | 'feeding' | 'calling' | 'fleeing';

/**
 * 生成條件
 */
export interface SpawnConditions {
  habitatId: string;
  timeOfDay: TimeOfDay;
  weather: Weather;
  season: Season;
}

/**
 * 鳥類生成系統
 * 管理鳥類的生成、行為和移除
 */
export class BirdSpawnSystem {
  private static instance: BirdSpawnSystem;
  private birds: Map<string, BirdInstance> = new Map();
  private birdDatabase: Map<string, BirdData> = new Map();
  private maxBirds: number = 20;
  private spawnInterval: number = 5000; // 毫秒
  private lastSpawnTime: number = 0;
  private currentConditions: SpawnConditions = {
    habitatId: 'forest',
    timeOfDay: 'morning',
    weather: 'sunny',
    season: 'spring',
  };
  private gameObjectPool: ObjectPool<GameObject>;
  private poolManager: PoolManager;

  private constructor() {
    // 初始化物件池管理器
    this.poolManager = PoolManager.getInstance();
    
    // 創建 GameObject 物件池
    this.gameObjectPool = this.poolManager.createPool<GameObject>(
      'bird_gameobject',
      () => new GameObject(0, 0),
      (obj: GameObject) => {
        obj.position = new Vector2(0, 0);
        obj.active = true;
        obj.visible = true;
        obj.destroyed = false;
      },
      30 // 預先創建 30 個物件
    );
  }

  /**
   * 獲取單例實例
   */
  public static getInstance(): BirdSpawnSystem {
    if (!BirdSpawnSystem.instance) {
      BirdSpawnSystem.instance = new BirdSpawnSystem();
    }
    return BirdSpawnSystem.instance;
  }

  /**
   * 載入鳥類資料庫
   */
  public loadBirdDatabase(birdsData: BirdData[]): void {
    this.birdDatabase.clear();

    for (const bird of birdsData) {
      this.birdDatabase.set(bird.id, bird);
    }

    console.log(`鳥類生成系統載入了 ${this.birdDatabase.size} 種鳥類`);
  }

  /**
   * 更新系統
   */
  public update(deltaTime: number): void {
    const currentTime = Date.now();

    // 檢查是否需要生成新鳥類
    if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
      this.trySpawnBird();
      this.lastSpawnTime = currentTime;
    }

    // 更新所有鳥類
    for (const [id, bird] of this.birds) {
      this.updateBird(bird, deltaTime);

      // 檢查是否需要移除
      if (bird.despawnTime && currentTime >= bird.despawnTime.getTime()) {
        this.despawnBird(id);
      }
    }
  }

  /**
   * 嘗試生成鳥類
   */
  private trySpawnBird(): void {
    // 檢查是否達到上限
    if (this.birds.size >= this.maxBirds) {
      return;
    }

    // 獲取符合條件的鳥類
    const eligibleBirds = this.getEligibleBirds();
    if (eligibleBirds.length === 0) {
      return;
    }

    // 根據權重選擇鳥類
    const selectedBird = this.selectBirdByWeight(eligibleBirds);
    if (!selectedBird) {
      return;
    }

    // 生成鳥類
    this.spawnBird(selectedBird);
  }

  /**
   * 獲取符合條件的鳥類
   */
  private getEligibleBirds(): BirdData[] {
    const eligible: BirdData[] = [];

    for (const bird of this.birdDatabase.values()) {
      if (this.checkSpawnConditions(bird)) {
        eligible.push(bird);
      }
    }

    return eligible;
  }

  /**
   * 檢查生成條件
   */
  private checkSpawnConditions(bird: BirdData): boolean {
    const conditions = bird.gameData.spawnConditions;

    // 檢查棲息地
    if (!conditions.habitats.includes(this.currentConditions.habitatId)) {
      return false;
    }

    // 檢查時間
    if (!conditions.timeOfDay.includes(this.currentConditions.timeOfDay)) {
      return false;
    }

    // 檢查天氣
    if (!conditions.weather.includes(this.currentConditions.weather)) {
      return false;
    }

    // 檢查季節
    if (!conditions.season.includes(this.currentConditions.season)) {
      return false;
    }

    return true;
  }

  /**
   * 根據權重選擇鳥類
   */
  private selectBirdByWeight(birds: BirdData[]): BirdData | null {
    if (birds.length === 0) {
      return null;
    }

    // 計算總權重
    const totalWeight = birds.reduce((sum, bird) => sum + bird.gameData.spawnWeight, 0);

    // 隨機選擇
    let random = Math.random() * totalWeight;

    for (const bird of birds) {
      random -= bird.gameData.spawnWeight;
      if (random <= 0) {
        return bird;
      }
    }

    return birds[0];
  }

  /**
   * 生成鳥類
   */
  public spawnBird(birdData: BirdData, position?: Vector2): BirdInstance | null {
    // 獲取生成位置
    let spawnPos: Vector2;
    if (position) {
      spawnPos = position;
    } else {
      const spawnPoint = mapSystem.getRandomSpawnPoint('bird');
      if (!spawnPoint) {
        console.warn('找不到鳥類生成點');
        return null;
      }
      spawnPos = spawnPoint.position;
    }

    // 從物件池獲取遊戲物件
    const gameObject = this.gameObjectPool.acquire();
    if (!gameObject) {
      console.error('無法從物件池獲取遊戲物件');
      return null;
    }

    gameObject.position = new Vector2(spawnPos.x, spawnPos.y);
    gameObject.tag = `bird_${birdData.id}`;

    // 創建鳥類實例
    const instance: BirdInstance = {
      id: gameObject.id,
      birdData,
      gameObject,
      state: 'idle',
      spawnTime: new Date(),
      despawnTime: null,
    };

    this.birds.set(instance.id, instance);

    console.log(`生成鳥類: ${birdData.species.commonName} 於 (${spawnPos.x}, ${spawnPos.y})`);

    // 發送事件
    eventBus.emit(GameEvents.BIRD_DISCOVERED, { birdId: birdData.id });

    return instance;
  }

  /**
   * 移除鳥類
   */
  public despawnBird(birdId: string): void {
    const bird = this.birds.get(birdId);
    if (!bird) {
      return;
    }

    // 將遊戲物件歸還到物件池
    this.gameObjectPool.release(bird.gameObject);

    // 從列表中移除
    this.birds.delete(birdId);

    console.log(`移除鳥類: ${bird.birdData.species.commonName}`);
  }

  /**
   * 更新鳥類
   */
  private updateBird(bird: BirdInstance, deltaTime: number): void {
    // 根據狀態更新行為
    switch (bird.state) {
      case 'idle':
        this.updateIdleBehavior(bird, deltaTime);
        break;
      case 'flying':
        this.updateFlyingBehavior(bird, deltaTime);
        break;
      case 'feeding':
        this.updateFeedingBehavior(bird, deltaTime);
        break;
      case 'calling':
        this.updateCallingBehavior(bird, deltaTime);
        break;
      case 'fleeing':
        this.updateFleeingBehavior(bird, deltaTime);
        break;
    }
  }

  /**
   * 更新閒置行為
   */
  private updateIdleBehavior(bird: BirdInstance, _deltaTime: number): void {
    // 隨機切換狀態
    if (Math.random() < 0.01) {
      const states: BirdState[] = ['flying', 'feeding', 'calling'];
      bird.state = states[Math.floor(Math.random() * states.length)];
    }
  }

  /**
   * 更新飛行行為
   */
  private updateFlyingBehavior(bird: BirdInstance, deltaTime: number): void {
    // 簡單的飛行移動
    const speed = 100; // 像素/秒
    const direction = new Vector2(Math.random() - 0.5, Math.random() - 0.5).normalize();
    const movement = direction.multiply(speed * deltaTime);

    bird.gameObject.position = bird.gameObject.position.add(movement);

    // 隨機停止飛行
    if (Math.random() < 0.02) {
      bird.state = 'idle';
    }
  }

  /**
   * 更新進食行為
   */
  private updateFeedingBehavior(bird: BirdInstance, _deltaTime: number): void {
    // 進食一段時間後回到閒置
    if (Math.random() < 0.05) {
      bird.state = 'idle';
    }
  }

  /**
   * 更新鳴叫行為
   */
  private updateCallingBehavior(bird: BirdInstance, _deltaTime: number): void {
    // 鳴叫一段時間後回到閒置
    if (Math.random() < 0.1) {
      bird.state = 'idle';
    }
  }

  /**
   * 更新逃跑行為
   */
  private updateFleeingBehavior(bird: BirdInstance, deltaTime: number): void {
    // 快速飛離
    const speed = 200; // 像素/秒
    const playerPos = mapSystem.getPlayerPosition();
    const direction = bird.gameObject.position
      .subtract(playerPos)
      .normalize();
    const movement = direction.multiply(speed * deltaTime);

    bird.gameObject.position = bird.gameObject.position.add(movement);

    // 逃離一段距離後移除
    const distance = bird.gameObject.position.distanceTo(playerPos);
    if (distance > 500) {
      this.despawnBird(bird.id);
    }
  }

  /**
   * 驚嚇鳥類
   */
  public scareBird(birdId: string): void {
    const bird = this.birds.get(birdId);
    if (bird) {
      bird.state = 'fleeing';
    }
  }

  /**
   * 驚嚇範圍內的鳥類
   */
  public scareNearbyBirds(position: Vector2, radius: number): void {
    for (const bird of this.birds.values()) {
      const distance = bird.gameObject.position.distanceTo(position);
      if (distance <= radius) {
        bird.state = 'fleeing';
      }
    }
  }

  /**
   * 獲取鳥類實例
   */
  public getBird(birdId: string): BirdInstance | undefined {
    return this.birds.get(birdId);
  }

  /**
   * 獲取所有鳥類
   */
  public getAllBirds(): BirdInstance[] {
    return Array.from(this.birds.values());
  }

  /**
   * 獲取範圍內的鳥類
   */
  public getBirdsInRange(position: Vector2, radius: number): BirdInstance[] {
    const birdsInRange: BirdInstance[] = [];

    for (const bird of this.birds.values()) {
      const distance = bird.gameObject.position.distanceTo(position);
      if (distance <= radius) {
        birdsInRange.push(bird);
      }
    }

    return birdsInRange;
  }

  /**
   * 設定生成條件
   */
  public setSpawnConditions(conditions: Partial<SpawnConditions>): void {
    this.currentConditions = { ...this.currentConditions, ...conditions };
    console.log('更新生成條件:', this.currentConditions);
  }

  /**
   * 獲取生成條件
   */
  public getSpawnConditions(): SpawnConditions {
    return { ...this.currentConditions };
  }

  /**
   * 設定最大鳥類數量
   */
  public setMaxBirds(max: number): void {
    this.maxBirds = Math.max(1, max);
  }

  /**
   * 設定生成間隔
   */
  public setSpawnInterval(interval: number): void {
    this.spawnInterval = Math.max(1000, interval);
  }

  /**
   * 清除所有鳥類
   */
  public clearAllBirds(): void {
    for (const birdId of this.birds.keys()) {
      this.despawnBird(birdId);
    }
  }

  /**
   * 獲取統計資訊
   */
  public getStats(): {
    currentBirds: number;
    maxBirds: number;
    spawnInterval: number;
    eligibleSpecies: number;
  } {
    return {
      currentBirds: this.birds.size,
      maxBirds: this.maxBirds,
      spawnInterval: this.spawnInterval,
      eligibleSpecies: this.getEligibleBirds().length,
    };
  }

  /**
   * 清理系統
   */
  public cleanup(): void {
    this.clearAllBirds();
    this.birdDatabase.clear();
    this.poolManager.clearAll();
  }

  /**
   * 取得物件池統計資訊
   */
  public getPoolStats(): {
    total: number;
    active: number;
    available: number;
  } {
    return {
      total: this.gameObjectPool.getTotalCount(),
      active: this.gameObjectPool.getActiveCount(),
      available: this.gameObjectPool.getAvailableCount(),
    };
  }
}

// 導出單例實例
export const birdSpawnSystem = BirdSpawnSystem.getInstance();

// Made with Bob
