"use client";

import { useEffect, useRef } from "react";

/**
 * "Neural field" — a quiet grid of points drifting on a cheap sine flow.
 * Points near the pointer are gently pushed aside and warm up to the accent
 * colour — a ripple, not a particle web.
 *
 * Cost control: 2D canvas, DPR capped at 1.5, rects not arcs, rAF paused
 * off-screen / in background tabs, single static frame for reduced motion.
 */
export function NeuralField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    // Touch devices get no pointer interaction, so a calmer 30fps drift is plenty.
    const frameInterval = fine ? 0 : 1000 / 30;
    let last = 0;
    let ready = false;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let gap = 28;
    let raf = 0;
    let running = false;
    let visible = true;

    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
    let dot = "236 232 223";
    let accent = "255 107 61";

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      dot = s.getPropertyValue("--field-dot").trim() || dot;
      accent = s.getPropertyValue("--field-accent").trim() || accent;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = w < 640 ? 32 : 30;
      cols = Math.ceil(w / gap) + 1;
      rows = Math.ceil(h / gap) + 1;
    };

    const RADIUS = 170;
    const R2 = RADIUS * RADIUS;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const time = t * 0.00018;

      // ease pointer toward target for a soft, springy feel
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;

      const ox = (w - (cols - 1) * gap) / 2;
      const oy = (h - (rows - 1) * gap) / 2;

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const bx = ox + i * gap;
          const by = oy + j * gap;

          // layered sine flow — reads as organic drift, costs almost nothing
          const f =
            Math.sin(bx * 0.006 + time * 3.1) * Math.cos(by * 0.007 - time * 2.3) +
            Math.sin((bx + by) * 0.004 + time * 1.7) * 0.6;
          let x = bx + Math.cos(f * 2.2) * 4;
          let y = by + Math.sin(f * 2.2) * 4;

          let heat = 0;
          if (pointer.active) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              const d = Math.sqrt(d2) || 1;
              heat = 1 - d / RADIUS;
              const push = heat * heat * 22;
              x += (dx / d) * push;
              y += (dy / d) * push;
            }
          }

          const base = 0.13 + (f + 1.6) * 0.075; // ~0.13 – 0.37
          if (heat > 0) {
            ctx.fillStyle = `rgb(${accent} / ${Math.min(0.95, base + heat * 0.8)})`;
            const s = 1.4 + heat * 1.6;
            ctx.fillRect(x - s / 2, y - s / 2, s, s);
          } else {
            ctx.fillStyle = `rgb(${dot} / ${base})`;
            ctx.fillRect(x - 0.7, y - 0.7, 1.4, 1.4);
          }
        }
      }
    };

    const loop = (t: number) => {
      if (t - last >= frameInterval) {
        last = t;
        draw(t);
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!ready || running || reduce || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    readColors();
    resize();
    draw(0);

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(performance.now());
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    const mo = new MutationObserver(() => {
      readColors();
      if (!running) draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - r.left;
      pointer.ty = e.clientY - r.top;
      if (!pointer.active) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
      pointer.active = pointer.ty > 0 && pointer.ty < r.height;
    };
    if (fine && !reduce) window.addEventListener("pointermove", onMove, { passive: true });

    // Don't compete with hydration / LCP: begin animating once the main thread is idle.
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const cancelRic = window.cancelIdleCallback ?? window.clearTimeout;
    const idleId = ric(
      () => {
        ready = true;
        start();
      },
      { timeout: 2500 },
    );

    return () => {
      cancelRic(idleId);
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={`block h-full w-full ${className}`} />;
}
