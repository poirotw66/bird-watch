/**
 * 物件池
 * 用於重複使用物件，減少記憶體分配和垃圾回收
 */
export class ObjectPool<T> {
  private available: T[] = [];
  private active: Set<T> = new Set();
  private factory: () => T;
  private reset: (obj: T) => void;
  private initialSize: number;

  /**
   * 建立物件池
   * @param factory 建立新物件的工廠函數
   * @param reset 重置物件狀態的函數
   * @param initialSize 初始物件數量
   */
  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 10) {
    this.factory = factory;
    this.reset = reset;
    this.initialSize = initialSize;

    // 預先建立物件
    for (let i = 0; i < initialSize; i++) {
      const obj = this.factory();
      this.available.push(obj);
    }
  }

  /**
   * 從池中取得物件
   */
  public acquire(): T {
    let obj: T;

    if (this.available.length > 0) {
      // 從可用池中取出
      obj = this.available.pop()!;
    } else {
      // 建立新物件
      obj = this.factory();
    }

    // 重置物件狀態
    this.reset(obj);

    // 加入活動集合
    this.active.add(obj);

    return obj;
  }

  /**
   * 將物件歸還到池中
   */
  public release(obj: T): void {
    if (!this.active.has(obj)) {
      console.warn('嘗試釋放不在活動集合中的物件');
      return;
    }

    // 從活動集合移除
    this.active.delete(obj);

    // 加入可用池
    this.available.push(obj);
  }

  /**
   * 取得活動物件數量
   */
  public getActiveCount(): number {
    return this.active.size;
  }

  /**
   * 取得可用物件數量
   */
  public getAvailableCount(): number {
    return this.available.length;
  }

  /**
   * 取得總物件數量
   */
  public getTotalCount(): number {
    return this.active.size + this.available.length;
  }

  /**
   * 清空池
   */
  public clear(): void {
    this.available = [];
    this.active.clear();
  }

  /**
   * 預熱池（預先建立物件）
   */
  public prewarm(count: number): void {
    for (let i = 0; i < count; i++) {
      const obj = this.factory();
      this.available.push(obj);
    }
  }

  /**
   * 收縮池（移除多餘的可用物件）
   */
  public shrink(targetSize: number = this.initialSize): void {
    while (this.available.length > targetSize) {
      this.available.pop();
    }
  }

  /**
   * 取得統計資訊
   */
  public getStats(): {
    active: number;
    available: number;
    total: number;
    utilization: number;
  } {
    const total = this.getTotalCount();
    const active = this.getActiveCount();

    return {
      active,
      available: this.getAvailableCount(),
      total,
      utilization: total > 0 ? active / total : 0,
    };
  }
}

/**
 * 物件池管理器
 * 管理多個物件池
 */
export class PoolManager {
  private static instance: PoolManager;
  private pools: Map<string, ObjectPool<any>> = new Map();

  private constructor() {}

  /**
   * 取得單例實例
   */
  public static getInstance(): PoolManager {
    if (!PoolManager.instance) {
      PoolManager.instance = new PoolManager();
    }
    return PoolManager.instance;
  }

  /**
   * 建立物件池
   */
  public createPool<T>(
    name: string,
    factory: () => T,
    reset: (obj: T) => void,
    initialSize: number = 10
  ): ObjectPool<T> {
    if (this.pools.has(name)) {
      console.warn(`物件池 "${name}" 已存在，將返回現有的池`);
      return this.pools.get(name)!;
    }

    const pool = new ObjectPool(factory, reset, initialSize);
    this.pools.set(name, pool);
    return pool;
  }

  /**
   * 取得物件池
   */
  public getPool<T>(name: string): ObjectPool<T> | undefined {
    return this.pools.get(name);
  }

  /**
   * 移除物件池
   */
  public removePool(name: string): void {
    const pool = this.pools.get(name);
    if (pool) {
      pool.clear();
      this.pools.delete(name);
    }
  }

  /**
   * 清空所有物件池
   */
  public clearAll(): void {
    for (const pool of this.pools.values()) {
      pool.clear();
    }
    this.pools.clear();
  }

  /**
   * 取得所有物件池的統計資訊
   */
  public getAllStats(): Map<string, ReturnType<ObjectPool<any>['getStats']>> {
    const stats = new Map();
    for (const [name, pool] of this.pools.entries()) {
      stats.set(name, pool.getStats());
    }
    return stats;
  }

  /**
   * 列印所有物件池的統計資訊
   */
  public printStats(): void {
    console.log('=== 物件池統計 ===');
    for (const [name, pool] of this.pools.entries()) {
      const stats = pool.getStats();
      console.log(`${name}:`);
      console.log(`  活動: ${stats.active}`);
      console.log(`  可用: ${stats.available}`);
      console.log(`  總計: ${stats.total}`);
      console.log(`  使用率: ${(stats.utilization * 100).toFixed(1)}%`);
    }
  }

  /**
   * 收縮所有物件池
   */
  public shrinkAll(): void {
    for (const pool of this.pools.values()) {
      pool.shrink();
    }
  }
}

/**
 * 通用物件池工廠
 */
export class PoolFactory {
  /**
   * 建立陣列物件池
   */
  public static createArrayPool<T>(initialSize: number = 10): ObjectPool<T[]> {
    return new ObjectPool<T[]>(
      () => [],
      (arr) => {
        arr.length = 0;
      },
      initialSize
    );
  }

  /**
   * 建立 Map 物件池
   */
  public static createMapPool<K, V>(initialSize: number = 10): ObjectPool<Map<K, V>> {
    return new ObjectPool<Map<K, V>>(
      () => new Map(),
      (map) => {
        map.clear();
      },
      initialSize
    );
  }

  /**
   * 建立 Set 物件池
   */
  public static createSetPool<T>(initialSize: number = 10): ObjectPool<Set<T>> {
    return new ObjectPool<Set<T>>(
      () => new Set(),
      (set) => {
        set.clear();
      },
      initialSize
    );
  }
}

// Made with Bob
