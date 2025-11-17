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

type ShuffleOption = 0 | 500 | 1000 | 2000;

const shuffleChoices: { label: string; value: ShuffleOption }[] = [
  { label: "Off", value: 0 },
  { label: "500ms", value: 500 },
  { label: "1000ms", value: 1000 },
  { label: "2000ms", value: 2000 }
];

export default function LiveCameraTileShuffler() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const shuffleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const orderRef = useRef<number[]>([]);

  const [gridSize, setGridSize] = useState(3);
  const [shuffleEvery, setShuffleEvery] = useState<ShuffleOption>(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [status, setStatus] = useState<string>("Camera idle");

  const ensureSourceCanvas = () => {
    if (!sourceCanvasRef.current) {
      sourceCanvasRef.current = document.createElement("canvas");
      sourceCanvasRef.current.width = CANVAS_SIZE;
      sourceCanvasRef.current.height = CANVAS_SIZE;
    }
    return sourceCanvasRef.current;
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setStatus("Camera stopped");
  }, []);

  const requestNewOrder = useCallback(() => {
    orderRef.current = shuffleOrder(gridSize);
  }, [gridSize]);

  const startCamera = async () => {
    if (cameraActive) {
      stopCamera();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      streamRef.current = stream;
      setCameraActive(true);
      requestNewOrder();
      setStatus("Camera live");
    } catch (error) {
      console.error(error);
      setStatus("Camera permission denied");
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (shuffleTimerRef.current) {
        clearInterval(shuffleTimerRef.current);
      }
    };
  }, [stopCamera]);

  useEffect(() => {
    if (!cameraActive) return;
    requestNewOrder();
  }, [gridSize, cameraActive, requestNewOrder]);

  useEffect(() => {
    if (!cameraActive) return;

    if (shuffleTimerRef.current) {
      clearInterval(shuffleTimerRef.current);
    }

    if (shuffleEvery === 0) {
      return;
    }

    shuffleTimerRef.current = setInterval(() => {
      requestNewOrder();
    }, shuffleEvery);

    return () => {
      if (shuffleTimerRef.current) {
        clearInterval(shuffleTimerRef.current);
      }
    };
  }, [cameraActive, shuffleEvery, requestNewOrder]);

  useEffect(() => {
    if (!cameraActive) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const sourceCanvas = ensureSourceCanvas();
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    const sourceCtx = sourceCanvas.getContext("2d");
    if (!ctx || !sourceCtx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    const render = () => {
      if (!cameraActive || !video || video.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }
      drawMediaToCanvas(sourceCtx, video);
      drawShuffledTiles(sourceCanvas, ctx, gridSize, orderRef.current);
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive, gridSize]);

  const handleFreezeAndDownload = () => {
    if (!canvasRef.current) return;
    if (cameraActive) {
      stopCamera();
    }
    downloadCanvas(canvasRef.current, "square-noise-live.png");
    setStatus("Frame frozen & downloaded");
  };

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={startCamera}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            cameraActive ? "bg-rose-500 text-white" : "bg-emerald-500 text-slate-900"
          }`}
        >
          {cameraActive ? "Stop Camera" : "Start Camera"}
        </button>
        <button
          onClick={handleFreezeAndDownload}
          className="rounded-lg border border-emerald-300/60 px-4 py-2 text-sm text-emerald-200"
        >
          Freeze & Download
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-slate-400">Shuffle Every</label>
          <select
            value={shuffleEvery}
            onChange={(event) => setShuffleEvery(Number(event.target.value) as ShuffleOption)}
            className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm"
          >
            {shuffleChoices.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 text-sm text-slate-400">
          <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
          <p className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2">{status}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Live Preview</p>
          <video
            ref={videoRef}
            className="w-full rounded-xl border border-white/10 bg-black/50"
            autoPlay
            muted
            playsInline
          />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Shuffled Output</p>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="h-80 w-80 rounded-xl border border-white/10 bg-slate-950 object-contain md:mx-auto"
          />
        </div>
      </div>
    </section>
  );
}
