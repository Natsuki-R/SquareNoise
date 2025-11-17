"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CANVAS_SIZE,
  drawMediaToCanvas,
  drawShuffledTiles,
  downloadCanvas,
  gridOptions,
  shuffleOrder
} from "./tileUtils";

export default function PhotoTileShuffler() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gridSize, setGridSize] = useState(3);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const ensureSourceCanvas = () => {
    if (!sourceCanvasRef.current) {
      sourceCanvasRef.current = document.createElement("canvas");
      sourceCanvasRef.current.width = CANVAS_SIZE;
      sourceCanvasRef.current.height = CANVAS_SIZE;
    }
    return sourceCanvasRef.current;
  };

  const drawShuffle = useCallback(() => {
    const canvas = canvasRef.current;
    const sourceCanvas = sourceCanvasRef.current;
    if (!canvas || !sourceCanvas) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext("2d");
    const sourceCtx = sourceCanvas.getContext("2d");
    if (!ctx || !sourceCtx) return;

    const order = shuffleOrder(gridSize);
    drawShuffledTiles(sourceCanvas, ctx, gridSize, order);
  }, [gridSize]);

  useEffect(() => {
    if (hasImage) {
      drawShuffle();
    }
  }, [gridSize, hasImage, drawShuffle]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const sourceCanvas = ensureSourceCanvas();
        const sourceCtx = sourceCanvas.getContext("2d");
        if (!sourceCtx) return;
        setIsLoading(false);
        drawMediaToCanvas(sourceCtx, img);
        setHasImage(true);
        setImageSrc(reader.result as string);
        drawShuffle();
      };
      img.src = reader.result as string;
      setIsLoading(true);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    downloadCanvas(canvasRef.current, "square-noise.png");
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm font-semibold uppercase tracking-wide text-slate-400">
            Upload Photo
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileChange}
            className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm"
          />
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">Grid Size</label>
            <select
              value={gridSize}
              onChange={(event) => setGridSize(Number(event.target.value))}
              className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm"
            >
              {gridOptions.map((size) => (
                <option key={size} value={size}>
                  {size} × {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={drawShuffle}
              disabled={!hasImage || isLoading}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400"
            >
              {hasImage ? "Shuffle" : "Shuffle"}
            </button>
            <button
              onClick={drawShuffle}
              disabled={!hasImage || isLoading}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm"
            >
              Reshuffle
            </button>
            <button
              onClick={handleDownload}
              disabled={!hasImage}
              className="rounded-lg border border-emerald-300/60 px-4 py-2 text-sm text-emerald-200"
            >
              Download PNG
            </button>
          </div>
          {isLoading && <p className="text-xs text-amber-300">Loading image…</p>}
          {imageSrc && (
            <figure className="mt-4 space-y-2 text-center text-xs text-slate-400">
              <figcaption>Original Preview</figcaption>
              <img
                src={imageSrc}
                alt="Uploaded preview"
                className="mx-auto max-h-48 rounded-lg border border-white/10 object-contain"
              />
            </figure>
          )}
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Shuffled</p>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="h-80 w-80 rounded-xl border border-white/10 bg-slate-950 object-contain"
          />
        </div>
      </div>
    </section>
  );
}
