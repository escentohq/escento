"use client";

import { useEffect, useRef } from "react";

export function Waveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let startTime = Date.now();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resize);
    resize();

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      // If reduced motion, freeze time at 0
      const time = prefersReducedMotion ? 0 : (Date.now() - startTime) / 1000;

      ctx.clearRect(0, 0, width, height);

      const f1 = 0.15;
      const f2 = 0.22;
      const f3 = 0.11;

      const w1 = f1 * Math.PI * 2;
      const w2 = f2 * Math.PI * 2;
      const w3 = f3 * Math.PI * 2;

      const k1 = 0.005;
      const k2 = 0.008;
      const k3 = 0.003;

      const a1 = 12;
      const a2 = 8;
      const a3 = 6;

      ctx.beginPath();
      
      const points = 256;
      const step = width / (points - 1);
      
      const waveCenterY = height / 2;

      for (let i = 0; i < points; i++) {
        const x = i * step;
        
        const yOffset = 
          a1 * Math.sin(k1 * x + w1 * time) + 
          a2 * Math.sin(k2 * x + w2 * time) + 
          a3 * Math.sin(k3 * x + w3 * time);

        const y = waveCenterY + yOffset;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      // Stroke
      ctx.strokeStyle = "rgba(232, 194, 117, 0.35)"; // accent.warm at 35%
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Fill below the line
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, waveCenterY - 20, 0, waveCenterY + 40);
      gradient.addColorStop(0, "rgba(232, 194, 117, 0.08)");
      gradient.addColorStop(1, "rgba(232, 194, 117, 0)");

      ctx.fillStyle = gradient;
      ctx.fill();

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="w-full h-[120px] relative overflow-hidden flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
