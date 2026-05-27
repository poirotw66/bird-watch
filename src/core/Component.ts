import { GameObject } from './GameObject';

/**
 * 組件基類
 * 所有組件都繼承自此類別
 */
export abstract class Component {
  public enabled: boolean = true;
  public gameObject!: GameObject;

  /**
   * 更新組件
   * @param deltaTime 距離上次更新的時間（秒）
   */
  public abstract update(deltaTime: number): void;

  /**
   * 渲染組件
   * @param ctx Canvas 渲染上下文
   */
  public abstract render(ctx: CanvasRenderingContext2D): void;

  /**
   * 組件附加到遊戲物件時調用
   */
  public onAttach(): void {
    // 子類可以覆寫此方法
  }

  /**
   * 組件從遊戲物件分離時調用
   */
  public onDetach(): void {
    // 子類可以覆寫此方法
  }
}

// Made with Bob
