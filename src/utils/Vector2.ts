/**
 * 2D 向量類別
 * 用於表示位置、速度、方向等
 */
export class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}

  /**
   * 設定向量值
   */
  set(x: number, y: number): Vector2 {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * 複製向量
   */
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  /**
   * 向量加法
   */
  add(v: Vector2): Vector2 {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  /**
   * 向量減法
   */
  subtract(v: Vector2): Vector2 {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  /**
   * 向量乘法（標量）
   */
  multiply(scalar: number): Vector2 {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /**
   * 向量除法（標量）
   */
  divide(scalar: number): Vector2 {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
    }
    return this;
  }

  /**
   * 計算向量長度
   */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * 計算向量長度的平方（避免開根號運算）
   */
  lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * 正規化向量（單位向量）
   */
  normalize(): Vector2 {
    const len = this.length();
    if (len > 0) {
      this.divide(len);
    }
    return this;
  }

  /**
   * 計算兩向量距離
   */
  distanceTo(v: Vector2): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 計算兩向量距離的平方
   */
  distanceToSquared(v: Vector2): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  /**
   * 點積
   */
  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * 叉積（2D 中返回標量）
   */
  cross(v: Vector2): number {
    return this.x * v.y - this.y * v.x;
  }

  /**
   * 線性插值
   */
  lerp(v: Vector2, t: number): Vector2 {
    this.x += (v.x - this.x) * t;
    this.y += (v.y - this.y) * t;
    return this;
  }

  /**
   * 限制向量長度
   */
  clamp(maxLength: number): Vector2 {
    const len = this.length();
    if (len > maxLength) {
      this.normalize().multiply(maxLength);
    }
    return this;
  }

  /**
   * 旋轉向量
   */
  rotate(angle: number): Vector2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * 計算向量角度
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * 靜態方法：創建零向量
   */
  static zero(): Vector2 {
    return new Vector2(0, 0);
  }

  /**
   * 靜態方法：創建單位向量
   */
  static one(): Vector2 {
    return new Vector2(1, 1);
  }

  /**
   * 靜態方法：向量加法
   */
  static add(v1: Vector2, v2: Vector2): Vector2 {
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
  }

  /**
   * 靜態方法：向量減法
   */
  static subtract(v1: Vector2, v2: Vector2): Vector2 {
    return new Vector2(v1.x - v2.x, v1.y - v2.y);
  }

  /**
   * 靜態方法：向量乘法
   */
  static multiply(v: Vector2, scalar: number): Vector2 {
    return new Vector2(v.x * scalar, v.y * scalar);
  }

  /**
   * 靜態方法：計算距離
   */
  static distance(v1: Vector2, v2: Vector2): number {
    return v1.distanceTo(v2);
  }

  /**
   * 轉換為字串
   */
  toString(): string {
    return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }
}

// Made with Bob
