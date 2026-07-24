"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reflex game: embers drift up from the bottom of the canvas, click them
 * before they fade out at the top. Ties into the site's ember-particle
 * motif (components/Embers.tsx) so it feels native to the world, not bolted on.
 */

interface Ember {
  x: number;
  y: number;
  r: number;
  speed: number;
  hue: string;
  born: number;
  caught: boolean;
  dead: boolean;
}

const PALETTE = ["#ff6a3d", "#ff9d4d", "#ffc46b", "#8f6bff"];
const ROUND_MS = 30000;

export default function EmberCatch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const embersRef = useRef<Ember[]>([]);
  const scoreRef = useRef(0);
  const missedRef = useRef(0);
  const rafRef = useRef<number>();
  const startRef = useRef<number>(0);
  const spawnAccRef = useRef(0);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS / 1000);
  const [phase, setPhase] = useState<"ready" | "playing" | "over">("ready");

  const start = () => {
    embersRef.current = [];
    scoreRef.current = 0;
    missedRef.current = 0;
    spawnAccRef.current = 0;
    setScore(0);
    setTimeLeft(ROUND_MS / 1000);
    setPhase("playing");
    startRef.current = performance.now();
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 48);
      lastTime = now;
      const elapsed = now - startRef.current;
      const remaining = Math.max(0, ROUND_MS - elapsed);
      setTimeLeft(Math.ceil(remaining / 1000));

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      spawnAccRef.current += dt;
      const spawnEvery = 520 - Math.min(280, elapsed / 100);
      if (spawnAccRef.current > spawnEvery) {
        spawnAccRef.current = 0;
        embersRef.current.push({
          x: 24 + Math.random() * (w - 48),
          y: h + 20,
          r: 10 + Math.random() * 12,
          speed: 0.035 + Math.random() * 0.05,
          hue: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          born: now,
          caught: false,
          dead: false
        });
      }

      ctx.clearRect(0, 0, w, h);

      for (const e of embersRef.current) {
        if (e.dead) continue;
        e.y -= e.speed * dt;
        if (e.y < -30) {
          e.dead = true;
          if (!e.caught) missedRef.current += 1;
          continue;
        }
        const age = (now - e.born) / 1000;
        const twinkle = 0.65 + 0.35 * Math.sin(age * 6 + e.x);
        const grd = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 2);
        grd.addColorStop(0, e.hue);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = e.caught ? 0 : twinkle;
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      embersRef.current = embersRef.current.filter((e) => !e.dead);

      if (remaining <= 0) {
        setScore(scoreRef.current);
        setPhase("over");
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const handleClick = (evt: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;
      for (const e of embersRef.current) {
        if (e.caught || e.dead) continue;
        const dx = e.x - x;
        const dy = e.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < e.r + 14) {
          e.caught = true;
          e.dead = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
          break;
        }
      }
    };
    canvas.addEventListener("pointerdown", handleClick);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", handleClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  return (
    <div className="game-stage">
      <div className="game-hud">
        <span>Score {score}</span>
        <span>{phase === "playing" ? `${timeLeft}s` : "Ember Catch"}</span>
      </div>
      <canvas ref={canvasRef} className="game-canvas" />
      {phase !== "playing" && (
        <div className="game-overlay">
          {phase === "over" ? (
            <>
              <p className="game-overlay-title">Round over</p>
              <p className="game-overlay-sub">You caught {score} embers.</p>
            </>
          ) : (
            <p className="game-overlay-sub">
              Click the embers before they drift away. 30 seconds.
            </p>
          )}
          <button type="button" className="cta" onClick={start}>
            {phase === "over" ? "Play again" : "Start"}
            <span aria-hidden="true"> -&gt;</span>
          </button>
        </div>
      )}
    </div>
  );
}
