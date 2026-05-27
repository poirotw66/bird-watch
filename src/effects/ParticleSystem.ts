/**
 * 粒子介面
 */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
}

/**
 * 粒子發射器配置
 */
export interface ParticleEmitterConfig {
  x: number;
  y: number;
  particleCount: number;
  particleLife: number;
  particleSize: number;
  particleSizeVariation: number;
  speed: number;
  speedVariation: number;
  angle: number;
  angleSpread: number;
  colors: string[];
  gravity: number;
  fadeOut: boolean;
}

/**
 * 粒子系統
 * 管理和渲染粒子效果
 */
export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number = 1000;

  /**
   * 發射粒子
   */
  public emit(config: Partial<ParticleEmitterConfig>): void {
    const defaultConfig: ParticleEmitterConfig = {
      x: 0,
      y: 0,
      particleCount: 10,
      particleLife: 1.0,
      particleSize: 5,
      particleSizeVariation: 2,
      speed: 100,
      speedVariation: 50,
      angle: 0,
      angleSpread: Math.PI * 2,
      colors: ['#FFFFFF'],
      gravity: 0,
      fadeOut: true,
    };

    const finalConfig = { ...defaultConfig, ...config };

    for (let i = 0; i < finalConfig.particleCount; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle =
        finalConfig.angle +
        (Math.random() - 0.5) * finalConfig.angleSpread;
      const speed =
        finalConfig.speed +
        (Math.random() - 0.5) * finalConfig.speedVariation;
      const size =
        finalConfig.particleSize +
        (Math.random() - 0.5) * finalConfig.particleSizeVariation;
      const color =
        finalConfig.colors[
          Math.floor(Math.random() * finalConfig.colors.length)
        ];

      this.particles.push({
        x: finalConfig.x,
        y: finalConfig.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: finalConfig.particleLife,
        maxLife: finalConfig.particleLife,
        size: Math.max(1, size),
        color,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 5,
      });
    }
  }

  /**
   * 更新粒子
   */
  public update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // 更新位置
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;

      // 更新旋轉
      particle.rotation += particle.rotationSpeed * deltaTime;

      // 更新生命值
      particle.life -= deltaTime;

      // 更新透明度（淡出效果）
      particle.alpha = particle.life / particle.maxLife;

      // 移除死亡的粒子
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * 渲染粒子
   */
  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    this.particles.forEach((particle) => {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);

      // 繪製粒子（圓形或方形）
      if (Math.random() > 0.5) {
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(
          -particle.size / 2,
          -particle.size / 2,
          particle.size,
          particle.size
        );
      }

      ctx.restore();
    });

    ctx.restore();
  }

  /**
   * 清除所有粒子
   */
  public clear(): void {
    this.particles = [];
  }

  /**
   * 取得粒子數量
   */
  public getParticleCount(): number {
    return this.particles.length;
  }

  /**
   * 預設效果：爆炸
   */
  public static explosion(x: number, y: number, color: string = '#FFD700'): Partial<ParticleEmitterConfig> {
    return {
      x,
      y,
      particleCount: 30,
      particleLife: 0.8,
      particleSize: 6,
      particleSizeVariation: 3,
      speed: 200,
      speedVariation: 100,
      angle: 0,
      angleSpread: Math.PI * 2,
      colors: [color, '#FFFFFF'],
      gravity: 0,
      fadeOut: true,
    };
  }

  /**
   * 預設效果：星星閃爍
   */
  public static sparkle(x: number, y: number): Partial<ParticleEmitterConfig> {
    return {
      x,
      y,
      particleCount: 15,
      particleLife: 0.6,
      particleSize: 4,
      particleSizeVariation: 2,
      speed: 50,
      speedVariation: 30,
      angle: 0,
      angleSpread: Math.PI * 2,
      colors: ['#FFD700', '#FFF700', '#FFAA00'],
      gravity: 0,
      fadeOut: true,
    };
  }

  /**
   * 預設效果：煙霧
   */
  public static smoke(x: number, y: number): Partial<ParticleEmitterConfig> {
    return {
      x,
      y,
      particleCount: 10,
      particleLife: 1.5,
      particleSize: 10,
      particleSizeVariation: 5,
      speed: 30,
      speedVariation: 20,
      angle: -Math.PI / 2,
      angleSpread: Math.PI / 4,
      colors: ['#888888', '#AAAAAA', '#CCCCCC'],
      gravity: -20,
      fadeOut: true,
    };
  }

  /**
   * 預設效果：心形
   */
  public static heart(x: number, y: number): Partial<ParticleEmitterConfig> {
    return {
      x,
      y,
      particleCount: 20,
      particleLife: 1.0,
      particleSize: 5,
      particleSizeVariation: 2,
      speed: 80,
      speedVariation: 40,
      angle: -Math.PI / 2,
      angleSpread: Math.PI / 3,
      colors: ['#FF69B4', '#FF1493', '#FF6EB4'],
      gravity: 50,
      fadeOut: true,
    };
  }

  /**
   * 預設效果：成就解鎖
   */
  public static achievement(x: number, y: number): Partial<ParticleEmitterConfig> {
    return {
      x,
      y,
      particleCount: 40,
      particleLife: 1.2,
      particleSize: 8,
      particleSizeVariation: 4,
      speed: 150,
      speedVariation: 80,
      angle: 0,
      angleSpread: Math.PI * 2,
      colors: ['#FFD700', '#FFA500', '#FF8C00', '#FFFF00'],
      gravity: 100,
      fadeOut: true,
    };
  }
}

// Made with Bob
