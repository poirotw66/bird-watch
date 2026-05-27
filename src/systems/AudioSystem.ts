import { EventSystem } from '../core/EventSystem';

/**
 * 音效類型
 */
export enum SoundType {
  // UI 音效
  UI_CLICK = 'ui_click',
  UI_HOVER = 'ui_hover',
  UI_OPEN = 'ui_open',
  UI_CLOSE = 'ui_close',
  UI_SUCCESS = 'ui_success',
  UI_ERROR = 'ui_error',

  // 遊戲音效
  BIRD_SPOTTED = 'bird_spotted',
  BIRD_PHOTO = 'bird_photo',
  BIRD_CALL = 'bird_call',
  ACHIEVEMENT_UNLOCK = 'achievement_unlock',
  QUEST_COMPLETE = 'quest_complete',
  LEVEL_UP = 'level_up',
  POKEDEX_UNLOCK = 'pokedex_unlock',

  // 小遊戲音效
  MINIGAME_START = 'minigame_start',
  MINIGAME_CORRECT = 'minigame_correct',
  MINIGAME_WRONG = 'minigame_wrong',
  MINIGAME_COMPLETE = 'minigame_complete',

  // 環境音效
  FOOTSTEP = 'footstep',
  PORTAL_ENTER = 'portal_enter',
  AREA_CHANGE = 'area_change',
}

/**
 * 背景音樂類型
 */
export enum MusicType {
  MAIN_MENU = 'main_menu',
  FOREST = 'forest',
  WETLAND = 'wetland',
  GRASSLAND = 'grassland',
  MOUNTAIN = 'mountain',
  COAST = 'coast',
  MINIGAME = 'minigame',
}

/**
 * 音效配置
 */
interface SoundConfig {
  volume: number;
  loop: boolean;
  playbackRate: number;
}

/**
 * 音效系統
 * 管理遊戲中的所有音效和背景音樂
 */
export class AudioSystem {
  private static instance: AudioSystem;
  private eventSystem: EventSystem;
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, AudioBuffer> = new Map();
  private music: Map<MusicType, AudioBuffer> = new Map();
  private currentMusic: AudioBufferSourceNode | null = null;
  private currentMusicType: MusicType | null = null;
  private masterVolume: number = 1.0;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private isMuted: boolean = false;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;

  private constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.initializeAudioContext();
    this.setupEventListeners();
  }

  /**
   * 取得單例實例
   */
  public static getInstance(): AudioSystem {
    if (!AudioSystem.instance) {
      AudioSystem.instance = new AudioSystem();
    }
    return AudioSystem.instance;
  }

  /**
   * 初始化音訊上下文
   */
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 創建增益節點
      this.musicGainNode = this.audioContext.createGain();
      this.musicGainNode.connect(this.audioContext.destination);
      this.musicGainNode.gain.value = this.musicVolume * this.masterVolume;

      this.sfxGainNode = this.audioContext.createGain();
      this.sfxGainNode.connect(this.audioContext.destination);
      this.sfxGainNode.gain.value = this.sfxVolume * this.masterVolume;

      console.log('✅ 音訊系統初始化成功');
    } catch (error) {
      console.error('❌ 音訊系統初始化失敗:', error);
    }
  }

  /**
   * 設置事件監聽器
   */
  private setupEventListeners(): void {
    // UI 事件
    this.eventSystem.on('ui:click', () => this.playSound(SoundType.UI_CLICK));
    this.eventSystem.on('ui:open', () => this.playSound(SoundType.UI_OPEN));
    this.eventSystem.on('ui:close', () => this.playSound(SoundType.UI_CLOSE));

    // 遊戲事件
    this.eventSystem.on('bird:spotted', () => this.playSound(SoundType.BIRD_SPOTTED));
    this.eventSystem.on('photo:taken', () => this.playSound(SoundType.BIRD_PHOTO));
    this.eventSystem.on('achievement:unlocked', () => this.playSound(SoundType.ACHIEVEMENT_UNLOCK));
    this.eventSystem.on('quest:completed', () => this.playSound(SoundType.QUEST_COMPLETE));
    this.eventSystem.on('player:level_up', () => this.playSound(SoundType.LEVEL_UP));
    this.eventSystem.on('pokedex:unlocked', () => this.playSound(SoundType.POKEDEX_UNLOCK));

    // 地圖事件
    this.eventSystem.on('portal:enter_range', () => this.playSound(SoundType.PORTAL_ENTER, { volume: 0.5 }));
    this.eventSystem.on('area:changed', (data: any) => {
      this.playSound(SoundType.AREA_CHANGE);
      this.changeMusic(this.getAreaMusic(data.currentArea?.habitat));
    });

    // 小遊戲事件
    this.eventSystem.on('minigame:start', () => {
      this.playSound(SoundType.MINIGAME_START);
      this.changeMusic(MusicType.MINIGAME);
    });
    this.eventSystem.on('minigame:correct_answer', () => this.playSound(SoundType.MINIGAME_CORRECT));
    this.eventSystem.on('minigame:wrong_answer', () => this.playSound(SoundType.MINIGAME_WRONG));
    this.eventSystem.on('minigame:match_success', () => this.playSound(SoundType.MINIGAME_CORRECT));
    this.eventSystem.on('minigame:match_fail', () => this.playSound(SoundType.MINIGAME_WRONG));
    this.eventSystem.on('minigame:target_hit', () => this.playSound(SoundType.MINIGAME_CORRECT));
    this.eventSystem.on('minigame:wrong_click', () => this.playSound(SoundType.MINIGAME_WRONG));
    this.eventSystem.on('minigame:completed', () => this.playSound(SoundType.MINIGAME_COMPLETE));
  }

  /**
   * 根據棲息地取得對應的背景音樂
   */
  private getAreaMusic(habitat: string): MusicType {
    switch (habitat) {
      case 'forest':
        return MusicType.FOREST;
      case 'wetland':
        return MusicType.WETLAND;
      case 'grassland':
        return MusicType.GRASSLAND;
      case 'mountain':
        return MusicType.MOUNTAIN;
      case 'coast':
        return MusicType.COAST;
      default:
        return MusicType.FOREST;
    }
  }

  /**
   * 載入音效
   */
  public async loadSound(type: SoundType, url: string): Promise<void> {
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds.set(type, audioBuffer);
      console.log(`✅ 音效載入成功: ${type}`);
    } catch (error) {
      console.error(`❌ 音效載入失敗: ${type}`, error);
    }
  }

  /**
   * 載入背景音樂
   */
  public async loadMusic(type: MusicType, url: string): Promise<void> {
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.music.set(type, audioBuffer);
      console.log(`✅ 背景音樂載入成功: ${type}`);
    } catch (error) {
      console.error(`❌ 背景音樂載入失敗: ${type}`, error);
    }
  }

  /**
   * 播放音效
   */
  public playSound(type: SoundType, config?: Partial<SoundConfig>): void {
    if (!this.audioContext || !this.sfxGainNode || this.isMuted) return;

    const buffer = this.sounds.get(type);
    if (!buffer) {
      // 如果音效未載入，使用合成音效
      this.playSynthSound(type, config);
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = (config?.volume ?? 1.0) * this.sfxVolume * this.masterVolume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    if (config?.playbackRate) {
      source.playbackRate.value = config.playbackRate;
    }

    source.start(0);
  }

  /**
   * 播放合成音效（當音效檔案未載入時使用）
   */
  private playSynthSound(type: SoundType, _config?: Partial<SoundConfig>): void {
    if (!this.audioContext || this.isMuted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 根據音效類型設定不同的頻率和波形
    switch (type) {
      case SoundType.UI_CLICK:
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
        break;

      case SoundType.UI_SUCCESS:
      case SoundType.MINIGAME_CORRECT:
        oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
        break;

      case SoundType.UI_ERROR:
      case SoundType.MINIGAME_WRONG:
        oscillator.frequency.value = 200;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
        break;

      case SoundType.ACHIEVEMENT_UNLOCK:
      case SoundType.QUEST_COMPLETE:
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(554, this.audioContext.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.3);
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.45);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.6);
        break;

      default:
        oscillator.frequency.value = 440;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
  }

  /**
   * 播放背景音樂
   */
  public playMusic(type: MusicType, loop: boolean = true): void {
    if (!this.audioContext || !this.musicGainNode || this.isMuted) return;

    // 停止當前音樂
    this.stopMusic();

    const buffer = this.music.get(type);
    if (!buffer) {
      console.warn(`背景音樂未載入: ${type}`);
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(this.musicGainNode);
    source.start(0);

    this.currentMusic = source;
    this.currentMusicType = type;
  }

  /**
   * 停止背景音樂
   */
  public stopMusic(): void {
    if (this.currentMusic) {
      try {
        this.currentMusic.stop();
      } catch (error) {
        // 忽略已停止的音樂
      }
      this.currentMusic = null;
      this.currentMusicType = null;
    }
  }

  /**
   * 切換背景音樂（淡入淡出效果）
   */
  public changeMusic(type: MusicType): void {
    if (this.currentMusicType === type) return;

    if (!this.audioContext || !this.musicGainNode) return;

    // 淡出當前音樂
    if (this.currentMusic) {
      const fadeOutDuration = 1.0;
      this.musicGainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + fadeOutDuration
      );

      setTimeout(() => {
        this.stopMusic();
        // 淡入新音樂
        this.playMusic(type);
        if (this.musicGainNode) {
          this.musicGainNode.gain.setValueAtTime(0.01, this.audioContext!.currentTime);
          this.musicGainNode.gain.exponentialRampToValueAtTime(
            this.musicVolume * this.masterVolume,
            this.audioContext!.currentTime + 1.0
          );
        }
      }, fadeOutDuration * 1000);
    } else {
      this.playMusic(type);
    }
  }

  /**
   * 設定主音量
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  /**
   * 設定音樂音量
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  /**
   * 設定音效音量
   */
  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  /**
   * 更新音量
   */
  private updateVolumes(): void {
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = this.musicVolume * this.masterVolume;
    }
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = this.sfxVolume * this.masterVolume;
    }
  }

  /**
   * 靜音/取消靜音
   */
  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    }
  }

  /**
   * 取得靜音狀態
   */
  public isMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * 取得音量設定
   */
  public getVolumes(): {
    master: number;
    music: number;
    sfx: number;
  } {
    return {
      master: this.masterVolume,
      music: this.musicVolume,
      sfx: this.sfxVolume,
    };
  }
}

// Made with Bob
