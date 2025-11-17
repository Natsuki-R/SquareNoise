"use client";

import { useState } from "react";
import PhotoTileShuffler from "./components/PhotoTileShuffler";
import LiveCameraTileShuffler from "./components/LiveCameraTileShuffler";

const modes = [
  { id: "photo", label: "Photo Mode" },
  { id: "live", label: "Live Camera Mode" }
] as const;

export default function HomePage() {
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("photo");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl space-y-8 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Square Noise</p>
          <h1 className="text-3xl font-semibold">Shuffle photos or glitch your live camera feed.</h1>
          <div className="flex justify-center gap-3">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  mode === m.id
                    ? "bg-emerald-500 text-slate-900"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </header>

        {mode === "photo" ? <PhotoTileShuffler /> : <LiveCameraTileShuffler />}
      </div>
    </main>
  );
}
