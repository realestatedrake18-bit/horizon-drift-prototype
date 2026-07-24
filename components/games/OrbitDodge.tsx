"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Survival game: steer a small mote around the canvas, dodging drifting
 * shards that spawn faster the longer you last. Echoes the site's
 * orbit-camera / drifting-shape language (CameraRig, HeroObject) in
 * miniature, playable form.
 */

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vrot: number;
}

export default function OrbitDodge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shardsRef = useRef<Shard[]>([]);
  const playerRef = useRef({ x: 0.5, y: 0.5 });
  const spawnAccRef = useRef(0);
  const rafRef = useRef<number>();
  const startRef = useRef(0);
  const aliveRef = useRef(true);

  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState<"ready" | "playing" | "over">("ready");

  const start = () => {
    shardsRef.current = [];
    spawnAccRef.current = 0;
    aliveRef.current = true;
    playerRef.current = { x: 0.5, y: 0.5 };
    setElapsed(0);
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

    const setPointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      playerRef.current = {
        x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
      };
    };
    const handleMove = (evt: PointerEvent) => setPointer(evt.clientX, evt.clientY);
    canvas.addEventListener("pointermove", handleMove);

    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 48);
      lastTime = now;
      const t = now - startRef.current;
      setElapsed(Math.floor(t / 1000));

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      spawnAccRef.current += dt;
      const spawnEvery = Math.max(260, 900 - t / 40);
      if (spawnAccRef.current > spawnEvery) {
        spawnAccRef.current = 0;
        const edge = Math.floor(Math.random() * 4);
        const pos =
          edge === 0
            ? { x: Math.random() * w, y: -20 }
            : edge === 1
            ? { x: w + 20, y: Math.random() * h }
            : edge === 2
            ? { x: Math.random() * w, y: h + 20 }
            : { x: -20, y: Math.random() * h };
        const cx = w / 2 + (Math.random() - 0.5) * w * 0.3;
        const cy = h / 2 + (Math.random() - 0.5) * h * 0.3;
        const ang = Math.atan2(cy - pos.y, cx - pos.x);
        const speed = 0.045 + Math.random() * 0.045 + Math.min(0.05, t / 150000);
        shardsRef.current.push({
          x: pos.x,
          y: pos.y,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          size: 9 + Math.random() * 7,
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 0.004
        });
      }

      ctx.clearRect(0, 0, w, h);

      const px = playerRef.current.x * w;
      const py = playerRef.current.y * h;

      let hit = false;
      shardsRef.current = shardsRef.current.filter((s) => {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.rot += s.vrot * dt;
        if (s.x < -60 || s.x > w + 60 || s.y < -60 || s.y > h + 60) return false;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        ctx.fillStyle = "rgba(143, 107, 255, 0.85)";
        ctx.beginPath();
        ctx.moveTo(0, -s.size);
        ctx.lineTo(s.size * 0.72, 0);
        ctx.lineTo(0, s.size);
        ctx.lineTo(-s.size * 0.72, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        const dx = s.x - px;
        const dy = s.y - py;
        if (Math.sqrt(dx * dx + dy * dy) < s.size * 0.6 + 8) hit = true;
        return true;
      });

      const grd = ctx.createRadialGradient(px, py, 0, px, py, 16);
      grd.addColorStop(0, "#ffe3c2");
      grd.addColorStop(1, "rgba(255,158,77,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(px, py, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff9d4d";
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();

      if (hit) {
        aliveRef.current = false;
        const seconds = Math.floor(t / 1000);
        setBest((b) => Math.max(b, seconds));
        setPhase("over");
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  return (
    <div className="game-stage">
      <div className="game-hud">
        <span>{phase === "playing" ? `${elapsed}s` : "Orbit Dodge"}</span>
        <span>Best {best}s</span>
      </div>
      <canvas ref={canvasRef} className="game-canvas" />
      {phase !== "playing" && (
        <div className="game-overlay">
          {phase === "over" ? (
            <>
              <p className="game-overlay-title">Shard hit</p>
              <p className="game-overlay-sub">You survived {elapsed}s.</p>
            </>
          ) : (
            <p className="game-overlay-sub">
              Move your mote with the pointer. Dodge the drifting shards.
            </p>
          )}
          <button type="button" className="cta" onClick={start}>
            {phase === "over" ? "Try again" : "Start"}
            <span aria-hidden="true"> -&gt;</span>
          </button>
        </div>
      )}
    </div>
  );
}
