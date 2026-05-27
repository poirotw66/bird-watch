import { Vector2 } from '@/utils/Vector2';
import { Component } from './Component';
import type { Scene } from './Scene';

/**
 * 遊戲物件類別
 * 所有遊戲中的實體都繼承自此類別
 */
export class GameObject {
  public id: string;
  public tag: string = '';
  public active: boolean = true;
  public visible: boolean = true;
  public destroyed: boolean = false;

  public position: Vector2;
  public rotation: number = 0;
  public scale: Vector2;

  protected components: Component[] = [];
  protected children: GameObject[] = [];
  protected parent: GameObject | null = null;
  public scene: Scene | null = null;
  /** world = affected by camera; screen = HUD overlay */
  public renderLayer: 'world' | 'screen' = 'world';

  constructor(x: number = 0, y: number = 0) {
    this.id = this.generateId();
    this.position = new Vector2(x, y);
    this.scale = new Vector2(1, 1);
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 更新遊戲物件
   * @param deltaTime 距離上次更新的時間（秒）
   */
  public update(deltaTime: number): void {
    if (!this.active) return;

    // 更新所有組件
    for (const component of this.components) {
      if (component.enabled) {
        component.update(deltaTime);
      }
    }

    // 更新所有子物件
    for (const child of this.children) {
      if (child.active) {
        child.update(deltaTime);
      }
    }
  }

  /**
   * 渲染遊戲物件
   * @param ctx Canvas 渲染上下文
   */
  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;

    ctx.save();

    // 應用變換
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale.x, this.scale.y);

    // 渲染所有組件
    for (const component of this.components) {
      if (component.enabled) {
        component.render(ctx);
      }
    }

    // 渲染所有子物件
    for (const child of this.children) {
      if (child.visible) {
        child.render(ctx);
      }
    }

    ctx.restore();
  }

  /**
   * 添加組件
   * @param component 組件實例
   */
  public addComponent<T extends Component>(component: T): T {
    component.gameObject = this;
    this.components.push(component);
    component.onAttach();
    return component;
  }

  /**
   * 獲取組件
   * @param type 組件類型
   */
  public getComponent<T extends Component>(type: new (...args: any[]) => T): T | null {
    return (this.components.find((c) => c instanceof type) as T) || null;
  }

  /**
   * 獲取所有指定類型的組件
   * @param type 組件類型
   */
  public getComponents<T extends Component>(type: new (...args: any[]) => T): T[] {
    return this.components.filter((c) => c instanceof type) as T[];
  }

  /**
   * 移除組件
   * @param component 組件實例
   */
  public removeComponent(component: Component): void {
    const index = this.components.indexOf(component);
    if (index > -1) {
      component.onDetach();
      this.components.splice(index, 1);
    }
  }

  /**
   * 添加子物件
   * @param child 子物件
   */
  public addChild(child: GameObject): void {
    child.parent = this;
    this.children.push(child);
  }

  /**
   * 移除子物件
   * @param child 子物件
   */
  public removeChild(child: GameObject): void {
    const index = this.children.indexOf(child);
    if (index > -1) {
      child.parent = null;
      this.children.splice(index, 1);
    }
  }

  /**
   * 獲取所有子物件
   */
  public getChildren(): GameObject[] {
    return [...this.children];
  }

  /**
   * 獲取父物件
   */
  public getParent(): GameObject | null {
    return this.parent;
  }

  /**
   * 獲取世界座標位置
   */
  public getWorldPosition(): Vector2 {
    if (!this.parent) {
      return this.position.clone();
    }
    const parentPos = this.parent.getWorldPosition();
    return Vector2.add(parentPos, this.position);
  }

  /**
   * 銷毀遊戲物件
   */
  public destroy(): void {
    if (this.destroyed) return;

    this.destroyed = true;

    // 銷毀所有組件
    for (const component of this.components) {
      component.onDetach();
    }
    this.components = [];

    // 銷毀所有子物件
    for (const child of this.children) {
      child.destroy();
    }
    this.children = [];

    // 從父物件中移除
    if (this.parent) {
      this.parent.removeChild(this);
    }
  }

  /**
   * 檢查是否與另一個物件碰撞（簡單的圓形碰撞檢測）
   * @param other 另一個遊戲物件
   * @param radius1 此物件的碰撞半徑
   * @param radius2 另一個物件的碰撞半徑
   */
  public isCollidingWith(other: GameObject, radius1: number, radius2: number): boolean {
    const distance = this.position.distanceTo(other.position);
    return distance < radius1 + radius2;
  }

  /**
   * 轉換為字串
   */
  public toString(): string {
    return `GameObject(id: ${this.id}, tag: ${this.tag}, pos: ${this.position.toString()})`;
  }
}

// Made with Bob
