/**
 * 緩動函數類型
 */
export type EasingFunction = (t: number) => number;

/**
 * 緩動函數集合
 */
export class Easing {
  static linear(t: number): number {
    return t;
  }

  static easeInQuad(t: number): number {
    return t * t;
  }

  static easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  static easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  static easeInCubic(t: number): number {
    return t * t * t;
  }

  static easeOutCubic(t: number): number {
    return --t * t * t + 1;
  }

  static easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  static easeInElastic(t: number): number {
    return t === 0 || t === 1
      ? t
      : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
  }

  static easeOutElastic(t: number): number {
    return t === 0 || t === 1
      ? t
      : Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
  }

  static easeInBounce(t: number): number {
    return 1 - Easing.easeOutBounce(1 - t);
  }

  static easeOutBounce(t: number): number {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  }
}

/**
 * 動畫介面
 */
export interface Animation {
  id: string;
  target: any;
  property: string;
  from: number;
  to: number;
  duration: number;
  elapsed: number;
  easing: EasingFunction;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
  loop: boolean;
  yoyo: boolean;
  delay: number;
}

/**
 * 動畫系統
 * 管理和執行動畫
 */
export class AnimationSystem {
  private static instance: AnimationSystem;
  private animations: Map<string, Animation> = new Map();
  private nextId: number = 0;

  private constructor() {}

  /**
   * 取得單例實例
   */
  public static getInstance(): AnimationSystem {
    if (!AnimationSystem.instance) {
      AnimationSystem.instance = new AnimationSystem();
    }
    return AnimationSystem.instance;
  }

  /**
   * 創建動畫
   */
  public animate(config: {
    target: any;
    property: string;
    from: number;
    to: number;
    duration: number;
    easing?: EasingFunction;
    onUpdate?: (value: number) => void;
    onComplete?: () => void;
    loop?: boolean;
    yoyo?: boolean;
    delay?: number;
  }): string {
    const id = `anim_${this.nextId++}`;

    const animation: Animation = {
      id,
      target: config.target,
      property: config.property,
      from: config.from,
      to: config.to,
      duration: config.duration,
      elapsed: 0,
      easing: config.easing || Easing.linear,
      onUpdate: config.onUpdate,
      onComplete: config.onComplete,
      loop: config.loop || false,
      yoyo: config.yoyo || false,
      delay: config.delay || 0,
    };

    this.animations.set(id, animation);
    return id;
  }

  /**
   * 更新所有動畫
   */
  public update(deltaTime: number): void {
    this.animations.forEach((animation, id) => {
      // 處理延遲
      if (animation.delay > 0) {
        animation.delay -= deltaTime;
        return;
      }

      animation.elapsed += deltaTime;

      // 計算進度 (0-1)
      let progress = Math.min(animation.elapsed / animation.duration, 1);

      // 應用緩動函數
      const easedProgress = animation.easing(progress);

      // 計算當前值
      const currentValue =
        animation.from + (animation.to - animation.from) * easedProgress;

      // 更新目標屬性
      if (animation.target && animation.property) {
        animation.target[animation.property] = currentValue;
      }

      // 調用更新回調
      if (animation.onUpdate) {
        animation.onUpdate(currentValue);
      }

      // 檢查是否完成
      if (progress >= 1) {
        if (animation.loop) {
          // 循環動畫
          animation.elapsed = 0;
          if (animation.yoyo) {
            // 來回動畫
            [animation.from, animation.to] = [animation.to, animation.from];
          }
        } else {
          // 調用完成回調
          if (animation.onComplete) {
            animation.onComplete();
          }
          // 移除動畫
          this.animations.delete(id);
        }
      }
    });
  }

  /**
   * 停止動畫
   */
  public stop(id: string): void {
    this.animations.delete(id);
  }

  /**
   * 停止目標的所有動畫
   */
  public stopAll(target: any): void {
    this.animations.forEach((animation, id) => {
      if (animation.target === target) {
        this.animations.delete(id);
      }
    });
  }

  /**
   * 清除所有動畫
   */
  public clear(): void {
    this.animations.clear();
  }

  /**
   * 取得動畫數量
   */
  public getAnimationCount(): number {
    return this.animations.size;
  }

  /**
   * 預設動畫：淡入
   */
  public fadeIn(
    target: any,
    duration: number = 0.5,
    onComplete?: () => void
  ): string {
    return this.animate({
      target,
      property: 'alpha',
      from: 0,
      to: 1,
      duration,
      easing: Easing.easeOutQuad,
      onComplete,
    });
  }

  /**
   * 預設動畫：淡出
   */
  public fadeOut(
    target: any,
    duration: number = 0.5,
    onComplete?: () => void
  ): string {
    return this.animate({
      target,
      property: 'alpha',
      from: 1,
      to: 0,
      duration,
      easing: Easing.easeInQuad,
      onComplete,
    });
  }

  /**
   * 預設動畫：縮放
   */
  public scale(
    target: any,
    from: number,
    to: number,
    duration: number = 0.3,
    onComplete?: () => void
  ): string {
    return this.animate({
      target,
      property: 'scale',
      from,
      to,
      duration,
      easing: Easing.easeOutElastic,
      onComplete,
    });
  }

  /**
   * 預設動畫：彈跳
   */
  public bounce(
    target: any,
    property: string,
    from: number,
    to: number,
    duration: number = 0.6
  ): string {
    return this.animate({
      target,
      property,
      from,
      to,
      duration,
      easing: Easing.easeOutBounce,
    });
  }

  /**
   * 預設動畫：搖晃
   */
  public shake(
    target: any,
    property: string,
    intensity: number = 10,
    duration: number = 0.5
  ): string {
    const originalValue = target[property];
    return this.animate({
      target,
      property,
      from: originalValue - intensity,
      to: originalValue + intensity,
      duration: duration / 4,
      easing: Easing.linear,
      loop: true,
      yoyo: true,
      onComplete: () => {
        target[property] = originalValue;
      },
    });
  }

  /**
   * 預設動畫：脈動
   */
  public pulse(
    target: any,
    property: string,
    from: number,
    to: number,
    duration: number = 1.0
  ): string {
    return this.animate({
      target,
      property,
      from,
      to,
      duration,
      easing: Easing.easeInOutQuad,
      loop: true,
      yoyo: true,
    });
  }

  /**
   * 預設動畫：滑入
   */
  public slideIn(
    target: any,
    from: { x: number; y: number },
    to: { x: number; y: number },
    duration: number = 0.5,
    onComplete?: () => void
  ): string[] {
    const animX = this.animate({
      target,
      property: 'x',
      from: from.x,
      to: to.x,
      duration,
      easing: Easing.easeOutCubic,
    });

    const animY = this.animate({
      target,
      property: 'y',
      from: from.y,
      to: to.y,
      duration,
      easing: Easing.easeOutCubic,
      onComplete,
    });

    return [animX, animY];
  }

  /**
   * 預設動畫：旋轉
   */
  public rotate(
    target: any,
    from: number,
    to: number,
    duration: number = 1.0,
    loop: boolean = false
  ): string {
    return this.animate({
      target,
      property: 'rotation',
      from,
      to,
      duration,
      easing: Easing.linear,
      loop,
    });
  }
}

// Made with Bob
