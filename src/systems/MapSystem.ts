import { EventSystem } from '../core/EventSystem';
import { MapArea, getMapAreaById, getStartingArea } from '../data/maps';
import { Vector2 } from '@/utils/Vector2';

/**
 * 地圖系統
 * 管理地圖區域切換和探索進度
 */
export class MapSystem {
  private static instance: MapSystem;
  private currentArea: MapArea;
  private visitedAreas: Set<string> = new Set();
  private explorationProgress: Map<string, number> = new Map(); // 區域探索進度 (0-100)

  private constructor() {
    this.currentArea = getStartingArea();
    this.visitedAreas.add(this.currentArea.id);
    this.explorationProgress.set(this.currentArea.id, 0);
  }

  /**
   * Random spawn point inside the current map area (for bird spawn system).
   */
  public getRandomSpawnPoint(_spawnType: string): { position: Vector2 } | null {
    const margin = 80;
    const w = this.currentArea.width - margin * 2;
    const h = this.currentArea.height - margin * 2;
    if (w <= 0 || h <= 0) {
      return null;
    }
    return {
      position: new Vector2(margin + Math.random() * w, margin + Math.random() * h),
    };
  }

  /**
   * Player world position stub until MapSystem tracks the player entity.
   */
  public getPlayerPosition(): Vector2 {
    return new Vector2(this.currentArea.width / 2, this.currentArea.height / 2);
  }

  /**
   * 取得單例實例
   */
  public static getInstance(): MapSystem {
    if (!MapSystem.instance) {
      MapSystem.instance = new MapSystem();
    }
    return MapSystem.instance;
  }

  /**
   * 重置系統
   */
  public static reset(): void {
    MapSystem.instance = new MapSystem();
  }

  /**
   * 取得當前區域
   */
  public getCurrentArea(): MapArea {
    return this.currentArea;
  }

  /**
   * 切換到指定區域
   */
  public switchToArea(areaId: string): boolean {
    const targetArea = getMapAreaById(areaId);
    if (!targetArea) {
      console.error(`Area not found: ${areaId}`);
      return false;
    }

    // 檢查是否可以從當前區域到達目標區域
    const canReach = this.currentArea.connections.some(
      (conn) => conn.targetAreaId === areaId
    );

    if (!canReach && this.currentArea.id !== areaId) {
      console.warn(`Cannot reach area ${areaId} from ${this.currentArea.id}`);
      return false;
    }

    const previousArea = this.currentArea;
    this.currentArea = targetArea;

    // 標記為已訪問
    if (!this.visitedAreas.has(areaId)) {
      this.visitedAreas.add(areaId);
      this.explorationProgress.set(areaId, 0);

      // 發送首次訪問事件
      EventSystem.getInstance().emit('area:first_visit', {
        areaId,
        areaName: targetArea.name,
      });
    }

    // 發送區域切換事件
    EventSystem.getInstance().emit('area:changed', {
      previousAreaId: previousArea.id,
      currentAreaId: areaId,
      currentArea: targetArea,
    });

    return true;
  }

  /**
   * 檢查區域是否已訪問
   */
  public hasVisited(areaId: string): boolean {
    return this.visitedAreas.has(areaId);
  }

  /**
   * 取得已訪問的區域數量
   */
  public getVisitedAreasCount(): number {
    return this.visitedAreas.size;
  }

  /**
   * 取得所有已訪問的區域 ID
   */
  public getVisitedAreas(): string[] {
    return Array.from(this.visitedAreas);
  }

  /**
   * 更新區域探索進度
   */
  public updateExplorationProgress(areaId: string, progress: number): void {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    const currentProgress = this.explorationProgress.get(areaId) || 0;

    if (clampedProgress > currentProgress) {
      this.explorationProgress.set(areaId, clampedProgress);

      // 發送探索進度更新事件
      EventSystem.getInstance().emit('area:exploration_progress', {
        areaId,
        progress: clampedProgress,
      });

      // 如果達到 100%，發送完全探索事件
      if (clampedProgress === 100 && currentProgress < 100) {
        EventSystem.getInstance().emit('area:fully_explored', {
          areaId,
          areaName: this.currentArea.id === areaId ? this.currentArea.name : '',
        });
      }
    }
  }

  /**
   * 取得區域探索進度
   */
  public getExplorationProgress(areaId: string): number {
    return this.explorationProgress.get(areaId) || 0;
  }

  /**
   * 取得總探索進度
   */
  public getTotalExplorationProgress(): number {
    if (this.explorationProgress.size === 0) return 0;

    let total = 0;
    this.explorationProgress.forEach((progress) => {
      total += progress;
    });

    return total / this.explorationProgress.size;
  }

  /**
   * 檢查是否可以到達指定區域
   */
  public canReachArea(areaId: string): boolean {
    if (this.currentArea.id === areaId) return true;

    return this.currentArea.connections.some(
      (conn) => conn.targetAreaId === areaId
    );
  }

  /**
   * 取得可到達的區域
   */
  public getReachableAreas(): MapArea[] {
    const reachableIds = this.currentArea.connections.map(
      (conn) => conn.targetAreaId
    );
    return reachableIds
      .map((id) => getMapAreaById(id))
      .filter((area): area is MapArea => area !== undefined);
  }

  /**
   * 取得到達指定區域的連接點
   */
  public getConnectionTo(areaId: string): { x: number; y: number } | null {
    const connection = this.currentArea.connections.find(
      (conn) => conn.targetAreaId === areaId
    );
    return connection ? connection.position : null;
  }

  /**
   * 序列化資料（用於存檔）
   */
  public serialize(): {
    currentAreaId: string;
    visitedAreas: string[];
    explorationProgress: Record<string, number>;
  } {
    const progressObj: Record<string, number> = {};
    this.explorationProgress.forEach((value, key) => {
      progressObj[key] = value;
    });

    return {
      currentAreaId: this.currentArea.id,
      visitedAreas: Array.from(this.visitedAreas),
      explorationProgress: progressObj,
    };
  }

  /**
   * 反序列化資料（用於讀檔）
   */
  public deserialize(data: {
    currentAreaId: string;
    visitedAreas: string[];
    explorationProgress: Record<string, number>;
  }): void {
    const area = getMapAreaById(data.currentAreaId);
    if (area) {
      this.currentArea = area;
    }

    this.visitedAreas = new Set(data.visitedAreas);

    this.explorationProgress = new Map();
    Object.entries(data.explorationProgress).forEach(([key, value]) => {
      this.explorationProgress.set(key, value);
    });
  }
}

export const mapSystem = MapSystem.getInstance();

// Made with Bob
