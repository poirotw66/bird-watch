/**
 * 遊戲核心型別定義
 */

/**
 * 鳥類類型
 */
export type BirdType = 'resident' | 'migratory' | 'endemic' | 'vagrant';

/**
 * 稀有度
 */
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

/**
 * 任務類型
 */
export type QuestType =
  | 'tutorial'
  | 'main'
  | 'side'
  | 'daily'
  | 'event'
  | 'discovery'
  | 'photography'
  | 'collection'
  | 'identification'
  | 'exploration'
  | 'seasonal'
  | 'story';

/**
 * 任務狀態
 */
export type QuestStatus = 'locked' | 'available' | 'active' | 'completed';

/**
 * 成就類別
 */
export type AchievementCategory = 'collection' | 'skill' | 'exploration' | 'social' | 'special';

/**
 * 成就稀有度
 */
export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'platinum';

/**
 * 時段
 */
export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';

/**
 * 天氣
 */
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'foggy';

/**
 * 季節
 */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * 難度等級
 */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'beginner' | 'intermediate';

/**
 * 照片品質
 */
export type PhotoQuality = 'poor' | 'good' | 'excellent';

/**
 * 棲息地類型
 */
export type Habitat = 'forest' | 'wetland' | 'grassland' | 'mountain' | 'coast' | 'urban' | 'farmland';

// Made with Bob
