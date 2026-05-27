import { PlayerData } from '@/models/PlayerData';
import { PokedexEntry } from '@/models/BirdData';
import { QuestData } from '@/models/QuestData';
import { AchievementData } from '@/models/AchievementData';
import { GameSettings } from '@/models/PlayerData';

/**
 * 存檔資料結構
 */
export interface SaveData {
  version: string;
  timestamp: number;
  player: PlayerData;
  pokedex: PokedexEntry[];
  quests: QuestData[];
  achievements: AchievementData[];
  settings: GameSettings;
}

/**
 * 儲存管理器
 * 處理遊戲資料的儲存和載入
 */
export class StorageManager {
  private static readonly SAVE_KEY = 'bird-watch-save';
  private static readonly SETTINGS_KEY = 'bird-watch-settings';
  private static readonly VERSION = '1.0.0';
  private static readonly DB_NAME = 'BirdWatchGame';
  private static readonly DB_VERSION = 1;
  private static readonly STORE_NAME = 'saves';

  /**
   * 儲存設定到 LocalStorage
   */
  public static saveSettings(settings: GameSettings): void {
    try {
      const data = JSON.stringify(settings);
      localStorage.setItem(this.SETTINGS_KEY, data);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('無法儲存設定');
    }
  }

  /**
   * 從 LocalStorage 載入設定
   */
  public static loadSettings(): GameSettings | null {
    try {
      const data = localStorage.getItem(this.SETTINGS_KEY);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as GameSettings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  }

  /**
   * 開啟 IndexedDB 資料庫
   */
  private static openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(new Error('無法開啟資料庫'));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 創建存檔物件儲存區
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
    });
  }

  /**
   * 儲存遊戲到 IndexedDB
   */
  public static async saveGame(saveData: Omit<SaveData, 'version' | 'timestamp'>): Promise<void> {
    try {
      const db = await this.openDatabase();

      const data: SaveData = {
        ...saveData,
        version: this.VERSION,
        timestamp: Date.now(),
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.put(data, this.SAVE_KEY);

        request.onsuccess = () => {
          console.log('遊戲已儲存');
          resolve();
        };

        request.onerror = () => {
          reject(new Error('儲存遊戲失敗'));
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Failed to save game:', error);
      throw new Error('無法儲存遊戲');
    }
  }

  /**
   * 從 IndexedDB 載入遊戲
   */
  public static async loadGame(): Promise<SaveData | null> {
    try {
      const db = await this.openDatabase();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(this.SAVE_KEY);

        request.onsuccess = () => {
          const data = request.result as SaveData | undefined;

          if (!data) {
            console.log('找不到存檔');
            resolve(null);
            return;
          }

          // 檢查版本
          if (data.version !== this.VERSION) {
            console.warn('存檔版本不符，可能需要遷移');
            // TODO: 實作版本遷移邏輯
          }

          console.log('遊戲已載入');
          resolve(data);
        };

        request.onerror = () => {
          reject(new Error('載入遊戲失敗'));
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * 刪除存檔
   */
  public static async deleteSave(): Promise<void> {
    try {
      const db = await this.openDatabase();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.delete(this.SAVE_KEY);

        request.onsuccess = () => {
          console.log('存檔已刪除');
          resolve();
        };

        request.onerror = () => {
          reject(new Error('刪除存檔失敗'));
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Failed to delete save:', error);
      throw new Error('無法刪除存檔');
    }
  }

  /**
   * 檢查是否有存檔
   */
  public static async hasSave(): Promise<boolean> {
    try {
      const data = await this.loadGame();
      return data !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * 匯出存檔為 JSON
   */
  public static async exportSave(): Promise<string> {
    const saveData = await this.loadGame();
    if (!saveData) {
      throw new Error('找不到存檔');
    }
    return JSON.stringify(saveData, null, 2);
  }

  /**
   * 從 JSON 匯入存檔
   */
  public static async importSave(json: string): Promise<void> {
    try {
      const saveData = JSON.parse(json) as SaveData;

      // 驗證存檔格式
      if (!this.validateSaveData(saveData)) {
        throw new Error('存檔格式無效');
      }

      // 儲存匯入的資料
      await this.saveGame(saveData);
      console.log('存檔已匯入');
    } catch (error) {
      console.error('Failed to import save:', error);
      throw new Error('無法匯入存檔');
    }
  }

  /**
   * 驗證存檔資料格式
   */
  private static validateSaveData(data: any): data is SaveData {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.version === 'string' &&
      typeof data.timestamp === 'number' &&
      data.player &&
      typeof data.player === 'object' &&
      Array.isArray(data.pokedex) &&
      Array.isArray(data.quests) &&
      Array.isArray(data.achievements) &&
      data.settings &&
      typeof data.settings === 'object'
    );
  }

  /**
   * 獲取存檔資訊
   */
  public static async getSaveInfo(): Promise<{
    exists: boolean;
    version?: string;
    timestamp?: number;
    playerName?: string;
    playerLevel?: number;
  }> {
    const saveData = await this.loadGame();

    if (!saveData) {
      return { exists: false };
    }

    return {
      exists: true,
      version: saveData.version,
      timestamp: saveData.timestamp,
      playerName: saveData.player.profile.name,
      playerLevel: saveData.player.progress.level,
    };
  }

  /**
   * 清除所有資料（包括設定）
   */
  public static async clearAll(): Promise<void> {
    try {
      // 刪除存檔
      await this.deleteSave();

      // 清除設定
      localStorage.removeItem(this.SETTINGS_KEY);

      console.log('所有資料已清除');
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw new Error('無法清除資料');
    }
  }

  /**
   * 獲取儲存空間使用情況
   */
  public static async getStorageUsage(): Promise<{
    used: number;
    quota: number;
    percentage: number;
  }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (used / quota) * 100 : 0;

      return { used, quota, percentage };
    }

    return { used: 0, quota: 0, percentage: 0 };
  }

  /**
   * 自動儲存
   */
  public static async autoSave(saveData: Omit<SaveData, 'version' | 'timestamp'>): Promise<void> {
    try {
      await this.saveGame(saveData);
      console.log('自動儲存完成');
    } catch (error) {
      console.error('自動儲存失敗:', error);
      // 自動儲存失敗不應該中斷遊戲
    }
  }
}

// Made with Bob
