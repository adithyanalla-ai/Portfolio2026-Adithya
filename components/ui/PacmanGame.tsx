"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A compact Pac-Man. Tile-based movement with interpolation, three ghosts that chase,
 * scatter and flee, power pellets, lives, levels and a saved high score.
 * Controls: arrow keys / WASD, swipe on the board, or the on-screen D-pad. Space pauses.
 * Colours come from the site's theme tokens, so it matches light and dark mode.
 */

// # wall · . pellet · o power pellet · - ghost door · G ghost house · P start · space = empty
const MAZE = [
  "###################",
  "#........#........#",
  "#o##.###.#.###.##o#",
  "#.................#",
  "#.##.#.#####.#.##.#",
  "#....#...#...#....#",
  "####.### # ###.####",
  "   #.#       #.#   ",
  "####.# ##-## #.####",
  "    .  #GGG#  .    ",
  "####.# ##### #.####",
  "   #.#       #.#   ",
  "####.# ##### #.####",
  "#........#........#",
  "#.##.###.#.###.##.#",
  "#o.#.....P.....#.o#",
  "##.#.#.#####.#.#.##",
  "#....#...#...#....#",
  "#.######.#.######.#",
  "#.................#",
  "###################",
];
const COLS = MAZE[0].length;
const ROWS = MAZE.length;

type Dir = { x: number; y: number };
const DIRS: Record<"up" | "down" | "left" | "right", Dir> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const NONE: Dir = { x: 0, y: 0 };
const same = (a: Dir, b: Dir) => a.x === b.x && a.y === b.y;
const opposite = (a: Dir, b: Dir) => a.x === -b.x && a.y === -b.y && (a.x !== 0 || a.y !== 0);

type GhostState = "house" | "leaving" | "chase" | "frightened" | "eaten";
type Actor = { x: number; y: number; dir: Dir; p: number };
type Ghost = Actor & { state: GhostState; release: number; home: { x: number; y: number }; tone: string; persona: number };
type Status = "ready" | "playing" | "paused" | "dying" | "won" | "over";

const DOOR_EXIT = { x: 9, y: 7 };
const HOUSE = { x: 9, y: 9 };
const HS_KEY = "pacman-high-score";

function readHigh() {
  try {
    return Number(localStorage.getItem(HS_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function PacmanGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("ready");
  const [hud, setHud] = useState({ score: 0, high: 0, lives: 3, level: 1 });
  const game = useRef<{
    grid: string[][];
    pellets: number;
    pac: Actor;
    queued: Dir;
    ghosts: Ghost[];
    frightUntil: number;
    chain: number;
    score: number;
    lives: number;
    level: number;
    status: Status;
    time: number;
    deathAt: number;
  } | null>(null);
  const statusRef = useRef<Status>("ready");

  const setStat = useCallback((s: Status) => {
    statusRef.current = s;
    if (game.current) game.current.status = s;
    setStatus(s);
  }, []);

  const resetActors = useCallback((g: NonNullable<typeof game.current>) => {
    g.pac = { x: 9, y: 15, dir: NONE, p: 0 };
    g.queued = NONE;
    const tones = ["--text-primary", "--text-secondary", "--accent-hover"];
    g.ghosts = [
      { x: 9, y: 7, dir: DIRS.left, p: 0, state: "chase", release: 0, home: { x: 9, y: 7 }, tone: tones[0], persona: 0 },
      { x: 8, y: 9, dir: DIRS.up, p: 0, state: "house", release: g.time + 2.5, home: { x: 8, y: 9 }, tone: tones[1], persona: 1 },
      { x: 10, y: 9, dir: DIRS.up, p: 0, state: "house", release: g.time + 5, home: { x: 10, y: 9 }, tone: tones[2], persona: 2 },
    ];
    g.frightUntil = 0;
    g.chain = 0;
  }, []);

  const newLevel = useCallback(
    (g: NonNullable<typeof game.current>) => {
      g.grid = MAZE.map((r) => r.split(""));
      g.pellets = g.grid.flat().filter((c) => c === "." || c === "o").length;
      resetActors(g);
    },
    [resetActors],
  );

  const start = useCallback(() => {
    const g = {
      grid: [] as string[][],
      pellets: 0,
      pac: { x: 9, y: 15, dir: NONE, p: 0 },
      queued: NONE,
      ghosts: [] as Ghost[],
      frightUntil: 0,
      chain: 0,
      score: 0,
      lives: 3,
      level: 1,
      status: "playing" as Status,
      time: 0,
      deathAt: 0,
    };
    newLevel(g);
    game.current = g;
    setHud((h) => ({ ...h, score: 0, lives: 3, level: 1 }));
    setStat("playing");
    wrapRef.current?.focus({ preventScroll: true });
  }, [newLevel, setStat]);

  const steer = useCallback(
    (d: Dir) => {
      // First input (or input after game over) starts a fresh game.
      if (!game.current || statusRef.current === "ready" || statusRef.current === "over" || statusRef.current === "won") {
        start();
      } else if (statusRef.current === "paused") {
        setStat("playing");
      }
      if (game.current) game.current.queued = d;
    },
    [setStat, start],
  );

  const togglePause = useCallback(() => {
    if (statusRef.current === "playing") setStat("paused");
    else if (statusRef.current === "paused") setStat("playing");
    else start();
  }, [setStat, start]);

  // High score from storage (client only)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read from localStorage
    setHud((h) => ({ ...h, high: readHigh() }));
  }, []);

  // Keyboard: only while the game area is on screen, so page scrolling keeps working elsewhere.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let onScreen = false;
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting && e.intersectionRatio > 0.5;
      if (!onScreen && statusRef.current === "playing") setStat("paused");
    }, { threshold: [0, 0.5, 1] });
    io.observe(wrap);
    const keys: Record<string, Dir> = {
      ArrowUp: DIRS.up, ArrowDown: DIRS.down, ArrowLeft: DIRS.left, ArrowRight: DIRS.right,
      w: DIRS.up, s: DIRS.down, a: DIRS.left, d: DIRS.right, W: DIRS.up, S: DIRS.down, A: DIRS.left, D: DIRS.right,
    };
    const onKey = (e: KeyboardEvent) => {
      if (!onScreen) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const d = keys[e.key];
      const active = statusRef.current === "playing" || wrap.contains(document.activeElement);
      if (d && active) {
        e.preventDefault();
        steer(d);
      } else if ((e.key === " " || e.key === "p" || e.key === "P") && active) {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", onKey);
    const onVis = () => document.hidden && statusRef.current === "playing" && setStat("paused");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [setStat, steer, togglePause]);

  // Swipe on the board
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    let sx = 0;
    let sy = 0;
    const down = (e: TouchEvent) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    };
    const up = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
      steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? DIRS.right : DIRS.left) : dy > 0 ? DIRS.down : DIRS.up);
    };
    c.addEventListener("touchstart", down, { passive: true });
    c.addEventListener("touchend", up, { passive: true });
    return () => {
      c.removeEventListener("touchstart", down);
      c.removeEventListener("touchend", up);
    };
  }, [steer]);

  // Main loop: simulation + drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0;
    let last = performance.now();
    let tile = 20;
    let colors: Record<string, string> = {};

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      const v = (n: string) => s.getPropertyValue(n).trim();
      colors = {
        wall: v("--accent-soft"),
        wallEdge: v("--line-strong"),
        pellet: v("--text-secondary"),
        power: v("--accent"),
        pac: v("--accent"),
        text: v("--text-primary"),
        muted: v("--text-muted"),
        surface: v("--surface-raised"),
        "--text-primary": v("--text-primary"),
        "--text-secondary": v("--text-secondary"),
        "--accent-hover": v("--accent-hover"),
      };
    };
    const resize = () => {
      const w = canvas.parentElement?.clientWidth ?? 380;
      tile = Math.max(12, Math.min(24, Math.floor(w / COLS)));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = COLS * tile * dpr;
      canvas.height = ROWS * tile * dpr;
      canvas.style.width = `${COLS * tile}px`;
      canvas.style.height = `${ROWS * tile}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    readColors();
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    const mo = new MutationObserver(readColors);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const cell = (g: NonNullable<typeof game.current>, x: number, y: number) => {
      const wx = ((x % COLS) + COLS) % COLS;
      if (y < 0 || y >= ROWS) return "#";
      return g.grid[y][wx];
    };
    const pacCan = (g: NonNullable<typeof game.current>, x: number, y: number, d: Dir) => {
      const c = cell(g, x + d.x, y + d.y);
      return c !== "#" && c !== "-";
    };
    const ghostCan = (g: NonNullable<typeof game.current>, gh: Ghost, d: Dir) => {
      const c = cell(g, gh.x + d.x, gh.y + d.y);
      if (c === "#") return false;
      if (c === "-") return gh.state === "leaving" || gh.state === "eaten";
      if (c === "G") return gh.state === "eaten" || gh.state === "house" || gh.state === "leaving";
      return true;
    };
    const wrapX = (a: Actor) => {
      if (a.x < 0) a.x = COLS - 1;
      if (a.x >= COLS) a.x = 0;
    };

    const pickGhostDir = (g: NonNullable<typeof game.current>, gh: Ghost) => {
      const options = Object.values(DIRS).filter((d) => ghostCan(g, gh, d) && !opposite(d, gh.dir));
      const pool = options.length ? options : Object.values(DIRS).filter((d) => ghostCan(g, gh, d));
      if (!pool.length) return NONE;
      if (gh.state === "frightened") return pool[Math.floor(Math.random() * pool.length)];
      let target = { x: g.pac.x, y: g.pac.y };
      if (gh.state === "leaving") target = DOOR_EXIT;
      else if (gh.state === "eaten") target = HOUSE;
      else if (gh.persona === 1) target = { x: g.pac.x + g.pac.dir.x * 3, y: g.pac.y + g.pac.dir.y * 3 };
      else if (gh.persona === 2 && Math.hypot(gh.x - g.pac.x, gh.y - g.pac.y) < 6) target = { x: 1, y: ROWS - 2 };
      if (gh.state === "chase" && Math.random() < 0.12) return pool[Math.floor(Math.random() * pool.length)];
      return pool.reduce((best, d) =>
        Math.hypot(gh.x + d.x - target.x, gh.y + d.y - target.y) < Math.hypot(gh.x + best.x - target.x, gh.y + best.y - target.y) ? d : best,
      );
    };

    const eat = (g: NonNullable<typeof game.current>) => {
      const c = g.grid[g.pac.y]?.[g.pac.x];
      if (c === "." || c === "o") {
        g.grid[g.pac.y][g.pac.x] = " ";
        g.pellets--;
        g.score += c === "o" ? 50 : 10;
        if (c === "o") {
          g.frightUntil = g.time + Math.max(3, 7 - g.level);
          g.chain = 0;
          g.ghosts.forEach((gh) => {
            if (gh.state === "chase") {
              gh.state = "frightened";
              gh.dir = { x: -gh.dir.x, y: -gh.dir.y };
            }
          });
        }
        if (g.pellets <= 0) {
          g.level++;
          g.score += 500;
          newLevel(g);
        }
      }
    };

    const step = (dt: number) => {
      const g = game.current;
      if (!g) return;
      g.time += dt;
      if (g.status === "dying") {
        if (g.time - g.deathAt > 1.4) {
          if (g.lives <= 0) {
            setStat("over");
          } else {
            resetActors(g);
            setStat("playing");
          }
        }
        return;
      }
      if (g.status !== "playing") return;

      // Pac-Man
      const pac = g.pac;
      if (!same(g.queued, NONE) && opposite(g.queued, pac.dir) && pac.p > 0) {
        pac.x += pac.dir.x;
        pac.y += pac.dir.y;
        pac.dir = g.queued;
        pac.p = 1 - pac.p;
        wrapX(pac);
      }
      if (same(pac.dir, NONE) && !same(g.queued, NONE) && pacCan(g, pac.x, pac.y, g.queued)) pac.dir = g.queued;
      const pacSpeed = 6.2 + g.level * 0.25;
      if (!same(pac.dir, NONE)) {
        pac.p += pacSpeed * dt;
        while (pac.p >= 1) {
          pac.p -= 1;
          pac.x += pac.dir.x;
          pac.y += pac.dir.y;
          wrapX(pac);
          eat(g);
          if (!same(g.queued, NONE) && pacCan(g, pac.x, pac.y, g.queued)) pac.dir = g.queued;
          if (!pacCan(g, pac.x, pac.y, pac.dir)) {
            pac.dir = NONE;
            pac.p = 0;
            break;
          }
        }
      }

      // Ghosts
      const frightened = g.time < g.frightUntil;
      g.ghosts.forEach((gh) => {
        if (gh.state === "frightened" && !frightened) gh.state = "chase";
        if (gh.state === "house") {
          if (g.time >= gh.release) {
            gh.state = "leaving";
            gh.x = HOUSE.x;
            gh.y = HOUSE.y;
            gh.p = 0;
            gh.dir = DIRS.up;
          }
          return;
        }
        const speed = gh.state === "eaten" ? 11 : gh.state === "frightened" ? 3.4 : 5.2 + g.level * 0.35;
        if (same(gh.dir, NONE)) gh.dir = pickGhostDir(g, gh);
        gh.p += speed * dt;
        while (gh.p >= 1) {
          gh.p -= 1;
          gh.x += gh.dir.x;
          gh.y += gh.dir.y;
          wrapX(gh);
          if (gh.state === "leaving" && gh.x === DOOR_EXIT.x && gh.y === DOOR_EXIT.y) gh.state = frightened ? "frightened" : "chase";
          if (gh.state === "eaten" && gh.x === HOUSE.x && gh.y === HOUSE.y) gh.state = "leaving";
          gh.dir = pickGhostDir(g, gh);
        }
        // collision (interpolated positions)
        const gx = gh.x + gh.dir.x * gh.p;
        const gy = gh.y + gh.dir.y * gh.p;
        const px = pac.x + pac.dir.x * pac.p;
        const py = pac.y + pac.dir.y * pac.p;
        if (Math.hypot(gx - px, gy - py) < 0.7) {
          if (gh.state === "frightened") {
            gh.state = "eaten";
            g.chain++;
            g.score += 200 * 2 ** (g.chain - 1);
          } else if (gh.state === "chase") {
            g.lives--;
            g.deathAt = g.time;
            setStat("dying");
          }
        }
      });

      if (g.score !== hudCache.score || g.lives !== hudCache.lives || g.level !== hudCache.level) {
        hudCache = { score: g.score, lives: g.lives, level: g.level };
        setHud((h) => {
          const high = Math.max(h.high, g.score);
          if (high > h.high) {
            try {
              localStorage.setItem(HS_KEY, String(high));
            } catch {
              /* storage blocked */
            }
          }
          return { score: g.score, lives: g.lives, level: g.level, high };
        });
      }
    };
    let hudCache = { score: -1, lives: -1, level: -1 };

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
    };

    const draw = (now: number) => {
      const g = game.current;
      const W = COLS * tile;
      const H = ROWS * tile;
      ctx.clearRect(0, 0, W, H);
      const grid = g?.grid ?? MAZE.map((r) => r.split(""));
      // walls
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const c = grid[y][x];
          if (c === "#") {
            ctx.fillStyle = colors.wall;
            roundRect(x * tile + 1, y * tile + 1, tile - 2, tile - 2, tile * 0.28);
            ctx.fill();
            ctx.globalAlpha = 0.55;
            ctx.strokeStyle = colors.power;
            ctx.lineWidth = 1.25;
            ctx.stroke();
            ctx.globalAlpha = 1;
          } else if (c === "-") {
            ctx.fillStyle = colors.muted;
            ctx.fillRect(x * tile + 2, y * tile + tile / 2 - 1, tile - 4, 2);
          } else if (c === ".") {
            ctx.fillStyle = colors.pellet;
            ctx.beginPath();
            ctx.arc(x * tile + tile / 2, y * tile + tile / 2, Math.max(1.5, tile * 0.1), 0, Math.PI * 2);
            ctx.fill();
          } else if (c === "o") {
            const pulse = 0.75 + 0.25 * Math.sin(now / 180);
            ctx.fillStyle = colors.power;
            ctx.beginPath();
            ctx.arc(x * tile + tile / 2, y * tile + tile / 2, tile * 0.28 * pulse, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      if (!g) return;
      // Pac-Man
      const pac = g.pac;
      const px = (pac.x + pac.dir.x * pac.p + 0.5) * tile;
      const py = (pac.y + pac.dir.y * pac.p + 0.5) * tile;
      const facing = same(pac.dir, NONE) ? 0 : Math.atan2(pac.dir.y, pac.dir.x);
      let mouth = same(pac.dir, NONE) ? 0.2 : 0.05 + 0.22 * Math.abs(Math.sin(now / 70));
      let radius = tile * 0.45;
      if (g.status === "dying") {
        const t = Math.min(1, (g.time - g.deathAt) / 1.2);
        mouth = 0.2 + t * 0.8;
        radius *= 1 - t * 0.4;
      }
      ctx.fillStyle = colors.pac;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.arc(px, py, radius, facing + mouth * Math.PI, facing - mouth * Math.PI + Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      // Ghosts
      const flashing = g.frightUntil - g.time < 1.5 && Math.floor(now / 160) % 2 === 0;
      g.ghosts.forEach((gh) => {
        const gx = (gh.x + gh.dir.x * gh.p + 0.5) * tile;
        const gy = (gh.y + gh.dir.y * gh.p + 0.5) * tile + (gh.state === "house" ? Math.sin(now / 200 + gh.persona) * tile * 0.12 : 0);
        const r = tile * 0.44;
        if (gh.state !== "eaten") {
          const fright = gh.state === "frightened";
          ctx.fillStyle = fright ? (flashing ? colors.text : colors.wallEdge) : colors[gh.tone];
          ctx.beginPath();
          ctx.arc(gx, gy - r * 0.15, r, Math.PI, 0);
          const base = gy + r * 0.85;
          ctx.lineTo(gx + r, base);
          for (let i = 0; i < 3; i++) {
            const x1 = gx + r - (i + 0.5) * ((2 * r) / 3);
            ctx.lineTo(x1, base - r * 0.25);
            ctx.lineTo(gx + r - (i + 1) * ((2 * r) / 3), base);
          }
          ctx.closePath();
          ctx.fill();
        }
        // eyes
        const ex = gh.dir.x * r * 0.18;
        const ey = gh.dir.y * r * 0.18;
        [-1, 1].forEach((s) => {
          ctx.fillStyle = colors.surface;
          ctx.beginPath();
          ctx.arc(gx + s * r * 0.38, gy - r * 0.2, r * 0.26, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = colors.text;
          ctx.beginPath();
          ctx.arc(gx + s * r * 0.38 + ex, gy - r * 0.2 + ey, r * 0.12, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
    };
  }, [newLevel, resetActors, setStat]);

  const message =
    status === "ready" ? "Press Start, an arrow key or swipe"
    : status === "paused" ? "Paused"
    : status === "over" ? `Game over · ${hud.score} points`
    : status === "won" ? "You win!"
    : null;

  const pad = (label: string, d: Dir, arrow: string, area: string) => (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        steer(d);
      }}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && steer(d)}
      className={`grid size-14 select-none place-items-center rounded-2xl border border-line bg-surface-raised text-xl text-primary transition-[scale,background-color] duration-150 active:scale-90 active:bg-accent-soft ${area}`}
      style={{ touchAction: "none" }}
    >
      <span aria-hidden>{arrow}</span>
    </button>
  );

  return (
    <div
      ref={wrapRef}
      tabIndex={-1}
      className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 outline-none lg:grid-cols-[minmax(0,28.5rem)_1fr] lg:gap-14"
      aria-label="Pac-Man game"
    >
      <div className="mx-auto w-full max-w-[28.5rem]">
        <div className="mb-3 flex items-center justify-between text-sm tabular-nums">
          <span className="label">
            Score <span className="ml-1 text-primary">{hud.score}</span>
          </span>
          <span className="label">
            Best <span className="ml-1 text-primary">{hud.high}</span>
          </span>
          <span className="label">Lvl {hud.level}</span>
          <span className="label flex items-center gap-1" aria-label={`${hud.lives} lives`}>
            {Array.from({ length: Math.max(0, hud.lives) }).map((_, i) => (
              <span key={i} aria-hidden className="size-2.5 rounded-full bg-accent" />
            ))}
          </span>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-raised p-2">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Pac-Man maze. Use the arrow keys, WASD, swipe, or the direction buttons to move."
            className="mx-auto block"
            style={{ touchAction: "none" }}
          />
          {message ? (
            <div className="pointer-events-none absolute inset-0 grid place-items-center bg-surface/55 backdrop-blur-[2px]">
              <p className="rounded-full bg-surface-raised px-4 py-2 text-sm font-medium text-primary shadow">{message}</p>
            </div>
          ) : null}
        </div>
        <p className="sr-only" aria-live="polite">
          {status === "over" ? `Game over. Score ${hud.score}.` : ""}
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 lg:items-start">
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={togglePause} className="btn btn-primary">
            {status === "playing" ? "Pause" : status === "paused" ? "Resume" : status === "ready" ? "Start" : "Play again"}
          </button>
          {status !== "ready" ? (
            <button type="button" onClick={start} className="btn btn-ghost">
              Restart
            </button>
          ) : null}
        </div>
        <div className="grid grid-cols-3 grid-rows-3 gap-2" role="group" aria-label="Direction controls">
          {pad("Move up", DIRS.up, "↑", "col-start-2 row-start-1")}
          {pad("Move left", DIRS.left, "←", "col-start-1 row-start-2")}
          {pad("Move right", DIRS.right, "→", "col-start-3 row-start-2")}
          {pad("Move down", DIRS.down, "↓", "col-start-2 row-start-3")}
        </div>
        <p className="max-w-xs text-center text-sm text-muted text-pretty lg:text-left">
          Arrow keys or WASD on a keyboard, swipe on the board, or tap the arrows. Space pauses. Eat a vermilion power pellet to turn the tables.
        </p>
      </div>
    </div>
  );
}
