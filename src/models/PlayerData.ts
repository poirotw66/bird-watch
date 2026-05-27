/**
 * 玩家個人檔案
 */
export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: Date;
  lastPlayed: Date;
}

/**
 * 玩家進度
 */
export interface PlayerProgress {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalPlayTime: number; // 秒
}

/**
 * 玩家技能
 */
export interface PlayerSkills {
  observation: number; // 觀察力 1-100
  identification: number; // 識別力 1-100
  photography: number; // 攝影技巧 1-100
  memory: number; // 記憶力 1-100
}

/**
 * 玩家統計
 */
export interface PlayerStats {
  totalBirdsDiscovered: number;
  totalPhotos: number;
  totalDistance: number; // 公尺
  accuracyRate: number; // 0-1
  perfectIdentifications: number;
  explorationRate: number; // 0-1
  questsCompleted: number;
  achievementsUnlocked: number;
}

/**
 * 物品
 */
export interface InventoryItem {
  id: string;
  quantity: number;
}

/**
 * 裝備
 */
export interface Equipment {
  binoculars: string | null;
  camera: string | null;
  recorder: string | null;
  fieldGuide: string | null;
}

/**
 * 玩家物品欄
 */
export interface PlayerInventory {
  items: InventoryItem[];
  equipment: Equipment;
}

/**
 * 貨幣
 */
export interface PlayerCurrency {
  coins: number;
  gems: number;
}

/**
 * 音訊設定
 */
export interface AudioSettings {
  master: number; // 0-1
  music: number; // 0-1
  sfx: number; // 0-1
  ambient: number; // 0-1
}

/**
 * 圖形設定
 */
export interface GraphicsSettings {
  quality: 'low' | 'medium' | 'high';
  particles: boolean;
  shadows: boolean;
}

/**
 * 遊戲玩法設定
 */
export interface GameplaySettings {
  difficulty: 'easy' | 'normal' | 'hard';
  tutorialCompleted: boolean;
  autoSave: boolean;
  language: string;
}

/**
 * 遊戲設定
 */
export interface GameSettings {
  audio: AudioSettings;
  graphics: GraphicsSettings;
  gameplay: GameplaySettings;
}

/**
 * 完整的玩家資料
 */
export interface PlayerData {
  profile: PlayerProfile;
  progress: PlayerProgress;
  skills: PlayerSkills;
  stats: PlayerStats;
  inventory: PlayerInventory;
  currency: PlayerCurrency;
  settings: GameSettings;
}

/**
 * 玩家類別
 */
export class Player {
  private data: PlayerData;

  constructor(data: PlayerData) {
    this.data = data;
  }

  /**
   * 獲取玩家資料（唯讀）
   */
  public getData(): Readonly<PlayerData> {
    return this.data;
  }

  /**
   * 增加經驗值
   */
  public addExperience(amount: number): void {
    this.data.progress.experience += amount;

    while (this.data.progress.experience >= this.data.progress.experienceToNextLevel) {
      this.levelUp();
    }
  }

  /**
   * 升級
   */
  private levelUp(): void {
    this.data.progress.level++;
    this.data.progress.experience -= this.data.progress.experienceToNextLevel;
    this.data.progress.experienceToNextLevel = this.calculateNextLevelExp();
  }

  /**
   * 計算下一級所需經驗值
   */
  private calculateNextLevelExp(): number {
    const baseExp = 100;
    const level = this.data.progress.level;
    return Math.floor(baseExp * Math.pow(1.5, level - 1));
  }

  /**
   * 提升技能
   */
  public improveSkill(skill: keyof PlayerSkills, amount: number): void {
    this.data.skills[skill] = Math.min(100, this.data.skills[skill] + amount);
  }

  /**
   * 增加貨幣
   */
  public addCurrency(type: 'coins' | 'gems', amount: number): void {
    this.data.currency[type] += amount;
  }

  /**
   * 扣除貨幣
   */
  public spendCurrency(type: 'coins' | 'gems', amount: number): boolean {
    if (this.data.currency[type] >= amount) {
      this.data.currency[type] -= amount;
      return true;
    }
    return false;
  }

  /**
   * 添加物品
   */
  public addItem(itemId: string, quantity: number = 1): void {
    const existingItem = this.data.inventory.items.find((item) => item.id === itemId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.data.inventory.items.push({ id: itemId, quantity });
    }
  }

  /**
   * 移除物品
   */
  public removeItem(itemId: string, quantity: number = 1): boolean {
    const item = this.data.inventory.items.find((item) => item.id === itemId);
    if (item && item.quantity >= quantity) {
      item.quantity -= quantity;
      if (item.quantity === 0) {
        this.data.inventory.items = this.data.inventory.items.filter((i) => i.id !== itemId);
      }
      return true;
    }
    return false;
  }

  /**
   * 裝備物品
   */
  public equipItem(slot: keyof Equipment, itemId: string): void {
    this.data.inventory.equipment[slot] = itemId;
  }

  /**
   * 卸下裝備
   */
  public unequipItem(slot: keyof Equipment): void {
    this.data.inventory.equipment[slot] = null;
  }

  /**
   * 更新統計
   */
  public updateStats(stat: keyof PlayerStats, value: number): void {
    if (typeof this.data.stats[stat] === 'number') {
      (this.data.stats[stat] as number) = value;
    }
  }

  /**
   * 增加統計
   */
  public incrementStat(stat: keyof PlayerStats, amount: number = 1): void {
    if (typeof this.data.stats[stat] === 'number') {
      (this.data.stats[stat] as number) += amount;
    }
  }

  /**
   * 更新設定
   */
  public updateSettings(settings: Partial<GameSettings>): void {
    this.data.settings = { ...this.data.settings, ...settings };
  }

  /**
   * 更新最後遊玩時間
   */
  public updateLastPlayed(): void {
    this.data.profile.lastPlayed = new Date();
  }

  /**
   * 增加遊玩時間
   */
  public addPlayTime(seconds: number): void {
    this.data.progress.totalPlayTime += seconds;
  }

  /**
   * 創建新玩家
   */
  public static createNew(name: string): Player {
    const data: PlayerData = {
      profile: {
        id: `player_${Date.now()}`,
        name,
        avatar: 'default',
        createdAt: new Date(),
        lastPlayed: new Date(),
      },
      progress: {
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        totalPlayTime: 0,
      },
      skills: {
        observation: 1,
        identification: 1,
        photography: 1,
        memory: 1,
      },
      stats: {
        totalBirdsDiscovered: 0,
        totalPhotos: 0,
        totalDistance: 0,
        accuracyRate: 0,
        perfectIdentifications: 0,
        explorationRate: 0,
        questsCompleted: 0,
        achievementsUnlocked: 0,
      },
      inventory: {
        items: [],
        equipment: {
          binoculars: null,
          camera: null,
          recorder: null,
          fieldGuide: null,
        },
      },
      currency: {
        coins: 0,
        gems: 0,
      },
      settings: {
        audio: {
          master: 0.8,
          music: 0.6,
          sfx: 0.8,
          ambient: 0.5,
        },
        graphics: {
          quality: 'medium',
          particles: true,
          shadows: true,
        },
        gameplay: {
          difficulty: 'normal',
          tutorialCompleted: false,
          autoSave: true,
          language: 'zh-TW',
        },
      },
    };

    return new Player(data);
  }
}

// Made with Bob
