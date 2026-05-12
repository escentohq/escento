"use client";

import { useEffect, useRef, useState } from "react";

type WaveformProps = {
  variant?: "hero" | "strip";
};

export function Waveform({ variant = "hero" }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5, active: false });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(media.matches);

    sync();
    media.addEventListener("change", sync);

    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    const startTime = performance.now();

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current = {
        x: Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1),
        y: Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1),
        active: true,
      };
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawGrid = (width: number, height: number, spacing: number) => {
      ctx.strokeStyle = "rgba(139,111,255,0.08)";
      ctx.lineWidth = 1;

      for (let x = 0; x <= width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const drawTrace = (
      width: number,
      height: number,
      time: number,
      amplitude: number,
      strokeStyle: string,
      lineWidth: number,
      offset: number,
    ) => {
      const points = variant === "hero" ? 220 : 120;
      const step = width / (points - 1);
      const pointerInfluence = pointerRef.current.active
        ? (pointerRef.current.x - 0.5) * 0.5
        : 0;
      const verticalBias = pointerRef.current.active
        ? (pointerRef.current.y - 0.5) * 18
        : 0;

      ctx.beginPath();

      for (let index = 0; index < points; index += 1) {
        const x = index * step;
        const phase = x * 0.012 + time * 1.6 + offset;
        const harmonics =
          Math.sin(phase) * amplitude +
          Math.sin(phase * 0.6 + time * 0.7) * amplitude * 0.55 +
          Math.cos(phase * 1.9 - time * 0.35) * amplitude * 0.18;

        const y =
          height * 0.5 +
          harmonics +
          Math.sin(index * 0.08 + time * 0.45) * amplitude * 0.2 +
          pointerInfluence * 30 * Math.sin(index * 0.14) +
          verticalBias;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const elapsedSeconds = (performance.now() - startTime) / 1000;
      const time = prefersReducedMotion ? 0 : elapsedSeconds;

      ctx.clearRect(0, 0, width, height);

      const background = ctx.createLinearGradient(0, 0, 0, height);
      background.addColorStop(0, "rgba(11,13,20,0.98)");
      background.addColorStop(1, "rgba(8,9,14,0.98)");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      drawGrid(width, height, variant === "hero" ? 32 : 28);

      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.strokeStyle = "rgba(217,193,138,0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      drawTrace(width, height, time, variant === "hero" ? 24 : 12, "rgba(139,111,255,0.95)", 2.2, 0);
      drawTrace(width, height, time + 0.35, variant === "hero" ? 16 : 8, "rgba(94,226,160,0.7)", 1.4, 0.8);
      drawTrace(width, height, time + 0.65, variant === "hero" ? 10 : 5, "rgba(217,193,138,0.85)", 1.1, 1.6);

      const sweepX = ((time * (variant === "hero" ? 90 : 120)) % width) || 0;
      const sweep = ctx.createLinearGradient(sweepX - 40, 0, sweepX + 40, 0);
      sweep.addColorStop(0, "rgba(139,111,255,0)");
      sweep.addColorStop(0.5, "rgba(139,111,255,0.2)");
      sweep.addColorStop(1, "rgba(139,111,255,0)");
      ctx.fillStyle = sweep;
      ctx.fillRect(Math.max(0, sweepX - 40), 0, 80, height);

      if (!prefersReducedMotion) {
        animationFrameId = window.requestAnimationFrame(draw);
      }
    };

    window.addEventListener("resize", resize);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion, variant]);

  if (variant === "strip") {
    return (
      <div ref={containerRef} className="relative h-[110px] w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-[340px] overflow-hidden rounded-[24px] border border-[#171A24] bg-[#090B11] sm:h-[400px]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-[#252937] bg-[#0D1018]/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#D9C18A]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#5EE2A0]" />
        live analyzer
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#757A8B]">
            Input / channel bus
          </p>
          <p className="mt-2 text-sm text-[#F5F7FB]">Reactive scope for a darker, engineered landing.</p>
        </div>
        <div className="rounded-2xl border border-[#252937] bg-[#0D1018]/85 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8D90A0]">
          pointer mod / enabled
        </div>
      </div>
    </div>
  );
}
