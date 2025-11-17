export const CANVAS_SIZE = 512;

export const gridOptions = [2, 3, 4, 8];

export function shuffleOrder(gridSize: number): number[] {
  const order = Array.from({ length: gridSize * gridSize }, (_, index) => index);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function drawShuffledTiles(
  source: HTMLCanvasElement,
  targetCtx: CanvasRenderingContext2D,
  gridSize: number,
  order: number[]
) {
  const tileSize = CANVAS_SIZE / gridSize;
  for (let destIndex = 0; destIndex < gridSize * gridSize; destIndex += 1) {
    const sourceIndex = order[destIndex] ?? destIndex;
    const destX = (destIndex % gridSize) * tileSize;
    const destY = Math.floor(destIndex / gridSize) * tileSize;
    const sourceX = (sourceIndex % gridSize) * tileSize;
    const sourceY = Math.floor(sourceIndex / gridSize) * tileSize;

    targetCtx.drawImage(
      source,
      sourceX,
      sourceY,
      tileSize,
      tileSize,
      destX,
      destY,
      tileSize,
      tileSize
    );
  }
}

export function drawMediaToCanvas(
  ctx: CanvasRenderingContext2D,
  media: HTMLImageElement | HTMLVideoElement
) {
  const width = "videoWidth" in media && media.videoWidth ? media.videoWidth : media.width;
  const height = "videoHeight" in media && media.videoHeight ? media.videoHeight : media.height;
  const ratio = Math.min(CANVAS_SIZE / width, CANVAS_SIZE / height);
  const drawWidth = width * ratio;
  const drawHeight = height * ratio;
  const offsetX = (CANVAS_SIZE - drawWidth) / 2;
  const offsetY = (CANVAS_SIZE - drawHeight) / 2;

  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.drawImage(media, offsetX, offsetY, drawWidth, drawHeight);
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = filename;
  link.click();
}
