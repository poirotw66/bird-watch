import { PokedexEntry, BirdData, BirdObservation } from '@/models/BirdData';
import { eventBus, GameEvents } from '@/core/EventSystem';
import { gameState } from '@/core/GameState';

/**
 * 圖鑑系統
 * 管理鳥類圖鑑資料
 */
export class PokedexSystem {
  private static instance: PokedexSystem;
  private entries: Map<string, PokedexEntry> = new Map();
  private birdDatabase: Map<string, BirdData> = new Map();

  private constructor() {
    this.setupEventListeners();
  }

  /**
   * 獲取單例實例
   */
  public static getInstance(): PokedexSystem {
    if (!PokedexSystem.instance) {
      PokedexSystem.instance = new PokedexSystem();
    }
    return PokedexSystem.instance;
  }

  /**
   * 設定事件監聽器
   */
  private setupEventListeners(): void {
    // 監聽鳥類發現事件
    eventBus.on(GameEvents.BIRD_DISCOVERED, (data: { birdId: string }) => {
      this.discoverBird(data.birdId);
    });

    // 監聽鳥類識別事件
    eventBus.on(GameEvents.BIRD_IDENTIFIED, (data: { birdId: string; correct: boolean }) => {
      if (data.correct) {
        this.recordIdentification(data.birdId, true);
      }
    });

    // 監聽拍照事件
    eventBus.on(
      GameEvents.BIRD_PHOTOGRAPHED,
      (data: { birdId: string; quality: 'poor' | 'good' | 'excellent' }) => {
        this.photographBird(data.birdId, data.quality);
      }
    );
  }

  /**
   * 載入鳥類資料庫
   */
  public async loadBirdDatabase(birdsData: BirdData[]): Promise<void> {
    this.birdDatabase.clear();

    for (const bird of birdsData) {
      this.birdDatabase.set(bird.id, bird);
    }

    console.log(`載入了 ${this.birdDatabase.size} 種鳥類資料`);
  }

  /**
   * 載入圖鑑資料
   */
  public loadPokedex(entries: PokedexEntry[]): void {
    this.entries.clear();

    for (const entry of entries) {
      this.entries.set(entry.birdId, entry);
    }

    console.log(`載入了 ${this.entries.size} 筆圖鑑記錄`);
  }

  /**
   * 獲取鳥類資料
   */
  public getBirdData(birdId: string): BirdData | undefined {
    return this.birdDatabase.get(birdId);
  }

  /**
   * 獲取圖鑑條目
   */
  public getEntry(birdId: string): PokedexEntry | undefined {
    return this.entries.get(birdId);
  }

  /**
   * 獲取所有圖鑑條目
   */
  public getAllEntries(): PokedexEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * 發現鳥類
   */
  public discoverBird(birdId: string): boolean {
    const bird = this.birdDatabase.get(birdId);
    if (!bird) {
      console.warn(`找不到鳥類資料: ${birdId}`);
      return false;
    }

    let entry = this.entries.get(birdId);

    if (!entry) {
      // 創建新的圖鑑條目
      entry = {
        birdId,
        unlocked: true,
        firstSeen: new Date(),
        totalSightings: 1,
        observations: [],
        bestPhoto: null,
        identificationAccuracy: 0,
      };
      this.entries.set(birdId, entry);

      console.log(`🐦 發現新鳥類: ${bird.species.commonName}`);

      const player = gameState.getPlayer();
      player.incrementStat('totalBirdsDiscovered');
      gameState.updatePokedexEntry(entry);
      eventBus.emit(GameEvents.BIRD_DISCOVERED, { birdId });

      return true;
    } else if (!entry.unlocked) {
      // 更新為已解鎖
      entry.unlocked = true;
      entry.firstSeen = new Date();
      entry.totalSightings = 1;

      console.log(`🐦 發現鳥類: ${bird.species.commonName}`);

      const player = gameState.getPlayer();
      player.incrementStat('totalBirdsDiscovered');
      gameState.updatePokedexEntry(entry);
      eventBus.emit(GameEvents.BIRD_DISCOVERED, { birdId });

      return true;
    } else {
      entry.totalSightings++;
      gameState.updatePokedexEntry(entry);
      return false;
    }
  }

  /**
   * 記錄識別結果
   */
  public recordIdentification(birdId: string, correct: boolean): void {
    const entry = this.entries.get(birdId);
    if (!entry) {
      console.warn(`找不到圖鑑條目: ${birdId}`);
      return;
    }

    // 更新識別準確率
    const totalAttempts = entry.observations.length + 1;
    const correctAttempts = entry.observations.filter((o) => o.photoQuality).length + (correct ? 1 : 0);
    entry.identificationAccuracy = correctAttempts / totalAttempts;

    if (correct) {
      const bird = this.birdDatabase.get(birdId);
      if (bird) {
        console.log(`✅ 識別鳥類: ${bird.species.commonName}`);
      }

      // 更新玩家統計
      const player = gameState.getPlayer();
      player.incrementStat('perfectIdentifications');
    }
  }

  /**
   * 拍攝鳥類照片
   */
  public photographBird(birdId: string, quality: 'poor' | 'good' | 'excellent'): void {
    if (!this.entries.get(birdId)) {
      this.discoverBird(birdId);
    }
    const entry = this.entries.get(birdId);
    if (!entry) {
      console.warn(`找不到圖鑑條目: ${birdId}`);
      return;
    }

    // 創建觀察記錄
    const observation: BirdObservation = {
      birdId,
      timestamp: new Date(),
      location: '', // TODO: 從當前位置獲取
      habitat: '', // TODO: 從當前棲息地獲取
      weather: 'sunny', // TODO: 從當前天氣獲取
      timeOfDay: 'morning', // TODO: 從當前時間獲取
      photoQuality: quality,
      notes: '',
    };

    entry.observations.push(observation);

    // 更新最佳照片
    if (!entry.bestPhoto || this.comparePhotoQuality(quality, entry.bestPhoto) > 0) {
      entry.bestPhoto = quality;
    }

    // 更新玩家統計
    const player = gameState.getPlayer();
    player.incrementStat('totalPhotos');

    const bird = this.birdDatabase.get(birdId);
    if (bird) {
      console.log(`📷 拍攝 ${bird.species.commonName} (品質: ${quality})`);
    }
    gameState.updatePokedexEntry(entry);
  }

  /**
   * 比較照片品質
   */
  private comparePhotoQuality(quality1: string, quality2: string): number {
    const qualityMap: Record<string, number> = {
      poor: 1,
      good: 2,
      excellent: 3,
    };
    return qualityMap[quality1] - qualityMap[quality2];
  }

  /**
   * 添加觀察記錄
   */
  public addObservation(observation: BirdObservation): void {
    const entry = this.entries.get(observation.birdId);
    if (!entry) {
      console.warn(`找不到圖鑑條目: ${observation.birdId}`);
      return;
    }

    entry.observations.push(observation);
    entry.totalSightings++;
  }

  /**
   * 獲取已解鎖的鳥類數量
   */
  public getUnlockedCount(): number {
    return this.getAllEntries().filter((e) => e.unlocked).length;
  }

  /**
   * 獲取總鳥類數量
   */
  public getTotalBirdCount(): number {
    return this.birdDatabase.size;
  }

  /**
   * 獲取完成度
   */
  public getCompletionRate(): number {
    const total = this.getTotalBirdCount();
    if (total === 0) return 0;

    const unlocked = this.getUnlockedCount();
    return (unlocked / total) * 100;
  }

  /**
   * 根據類型篩選鳥類
   */
  public getBirdsByType(type: string): BirdData[] {
    return Array.from(this.birdDatabase.values()).filter(
      (bird) => bird.classification.type === type
    );
  }

  /**
   * 根據稀有度篩選鳥類
   */
  public getBirdsByRarity(rarity: string): BirdData[] {
    return Array.from(this.birdDatabase.values()).filter(
      (bird) => bird.classification.rarity === rarity
    );
  }

  /**
   * 根據棲息地篩選鳥類
   */
  public getBirdsByHabitat(habitatId: string): BirdData[] {
    return Array.from(this.birdDatabase.values()).filter((bird) =>
      bird.gameData.spawnConditions.habitats.includes(habitatId)
    );
  }

  /**
   * 搜尋鳥類
   */
  public searchBirds(query: string): BirdData[] {
    const lowerQuery = query.toLowerCase();

    return Array.from(this.birdDatabase.values()).filter((bird) => {
      return (
        bird.species.commonName.toLowerCase().includes(lowerQuery) ||
        bird.species.scientificName.toLowerCase().includes(lowerQuery) ||
        bird.species.family.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * 獲取已解鎖的鳥類
   */
  public getUnlockedBirds(): BirdData[] {
    const unlockedIds = this.getAllEntries()
      .filter((e) => e.unlocked)
      .map((e) => e.birdId);

    return unlockedIds
      .map((id) => this.birdDatabase.get(id))
      .filter((bird): bird is BirdData => bird !== undefined);
  }

  /**
   * 獲取未解鎖的鳥類
   */
  public getLockedBirds(): BirdData[] {
    const unlockedIds = new Set(
      this.getAllEntries()
        .filter((e) => e.unlocked)
        .map((e) => e.birdId)
    );

    return Array.from(this.birdDatabase.values()).filter((bird) => !unlockedIds.has(bird.id));
  }

  /**
   * 獲取圖鑑統計
   */
  public getStats(): {
    total: number;
    unlocked: number;
    photographed: number;
    completionRate: number;
    averageAccuracy: number;
  } {
    const total = this.getTotalBirdCount();
    const unlocked = this.getUnlockedCount();
    const photographed = this.getAllEntries().filter((e) => e.bestPhoto !== null).length;

    // 計算平均識別準確率
    const entries = this.getAllEntries().filter((e) => e.unlocked);
    const totalAccuracy = entries.reduce((sum, e) => sum + e.identificationAccuracy, 0);
    const averageAccuracy = entries.length > 0 ? totalAccuracy / entries.length : 0;

    return {
      total,
      unlocked,
      photographed,
      completionRate: this.getCompletionRate(),
      averageAccuracy: Math.round(averageAccuracy * 100),
    };
  }

  /**
   * 檢查是否已解鎖
   */
  public isUnlocked(birdId: string): boolean {
    const entry = this.entries.get(birdId);
    return entry ? entry.unlocked : false;
  }

  /**
   * 獲取最近發現的鳥類
   */
  public getRecentlyDiscovered(limit: number = 5): BirdData[] {
    const recentEntries = this.getAllEntries()
      .filter((e) => e.unlocked && e.firstSeen)
      .sort((a, b) => {
        const dateA = a.firstSeen?.getTime() || 0;
        const dateB = b.firstSeen?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, limit);

    return recentEntries
      .map((e) => this.birdDatabase.get(e.birdId))
      .filter((bird): bird is BirdData => bird !== undefined);
  }

  /**
   * 獲取觀察記錄
   */
  public getObservations(birdId: string): BirdObservation[] {
    const entry = this.entries.get(birdId);
    return entry ? entry.observations : [];
  }

  /**
   * 獲取所有觀察記錄
   */
  public getAllObservations(): BirdObservation[] {
    const allObservations: BirdObservation[] = [];
    for (const entry of this.getAllEntries()) {
      allObservations.push(...entry.observations);
    }
    return allObservations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 清理系統
   */
  public cleanup(): void {
    this.entries.clear();
    this.birdDatabase.clear();
  }
}

// 導出單例實例
export const pokedexSystem = PokedexSystem.getInstance();

// Made with Bob
