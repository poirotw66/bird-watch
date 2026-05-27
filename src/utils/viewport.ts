/**
 * Logical viewport size in CSS pixels (matches Engine canvas scaling).
 */
export function getViewport(ctx: CanvasRenderingContext2D): { width: number; height: number } {
  const width = ctx.canvas.clientWidth;
  const height = ctx.canvas.clientHeight;
  return {
    width: width > 0 ? width : 800,
    height: height > 0 ? height : 600,
  };
}
