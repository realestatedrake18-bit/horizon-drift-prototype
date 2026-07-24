"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 3D reflex game: embers spawn far in the scene and drift up and toward the
 * camera, growing with real perspective as they approach. Click them (R3F's
 * built-in raycasting handles hit-testing against actual mesh position/size)
 * before they drift past. Genuinely WebGL, not a 2D canvas illusion.
 */

const PALETTE = ["#ff6a3d", "#ff9d4d", "#ffc46b", "#8f6bff"];
const ROUND_MS = 30000;

interface EmberData {
  id: number;
  position: [number, number, number];
  speed: number;
  size: number;
  color: string;
  seed: number;
}

let emberSeq = 0;

function Ember({
  data,
  onExpire,
  onCatch
}: {
  data: EmberData;
  onExpire: (id: number) => void;
  onCatch: (id: number) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const born = useRef(performance.now());
  const caughtRef = useRef(false);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh || caughtRef.current) return;
    mesh.position.y += data.speed * delta;
    mesh.position.z += 0.4 * delta;
    const age = (performance.now() - born.current) / 1000;
    const twinkle = 0.6 + 0.4 * Math.sin(age * 6 + data.seed);
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.opacity = twinkle;
    if (mesh.position.y > 5.5 || mesh.position.z > 5) {
      onExpire(data.id);
    }
  });

  return (
    <mesh
      ref={ref}
      position={data.position}
      onClick={(e) => {
        e.stopPropagation();
        if (caughtRef.current) return;
        caughtRef.current = true;
        onCatch(data.id);
      }}
    >
      <sphereGeometry args={[data.size, 12, 12]} />
      <meshBasicMaterial color={data.color} transparent opacity={0.85} />
    </mesh>
  );
}

function EmberField({
  playing,
  onScore
}: {
  playing: boolean;
  onScore: () => void;
}) {
  const [embers, setEmbers] = useState<EmberData[]>([]);
  const spawnAcc = useRef(0);
  const elapsedMs = useRef(0);

  useEffect(() => {
    if (!playing) {
      setEmbers([]);
      elapsedMs.current = 0;
      spawnAcc.current = 0;
    }
  }, [playing]);

  useFrame((_, delta) => {
    if (!playing) return;
    elapsedMs.current += delta * 1000;
    spawnAcc.current += delta * 1000;
    const spawnEvery = 520 - Math.min(280, elapsedMs.current / 100);
    if (spawnAcc.current > spawnEvery) {
      spawnAcc.current = 0;
      emberSeq += 1;
      setEmbers((prev) => [
        ...prev,
        {
          id: emberSeq,
          position: [
            (Math.random() - 0.5) * 7,
            -3.2 - Math.random() * 0.6,
            -6 - Math.random() * 4
          ],
          speed: 0.9 + Math.random() * 0.9,
          size: 0.34 + Math.random() * 0.24,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          seed: Math.random() * 10
        }
      ]);
    }
  });

  const remove = (id: number) => setEmbers((prev) => prev.filter((e) => e.id !== id));

  return (
    <>
      {embers.map((e) => (
        <Ember
          key={e.id}
          data={e}
          onExpire={remove}
          onCatch={(id) => {
            remove(id);
            onScore();
          }}
        />
      ))}
    </>
  );
}

export default function EmberCatch() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS / 1000);
  const [phase, setPhase] = useState<"ready" | "playing" | "over">("ready");
  const startRef = useRef(0);

  const start = () => {
    setScore(0);
    setTimeLeft(ROUND_MS / 1000);
    setPhase("playing");
    startRef.current = performance.now();
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, ROUND_MS - (performance.now() - startRef.current));
      setTimeLeft(Math.ceil(remaining / 1000));
      if (remaining <= 0) setPhase("over");
    }, 200);
    return () => window.clearInterval(id);
  }, [phase]);

  return (
    <div className="game-stage">
      <div className="game-hud">
        <span>Score {score}</span>
        <span>{phase === "playing" ? `${timeLeft}s` : "Ember Catch"}</span>
      </div>
      <div className="game-canvas">
        <Canvas camera={{ position: [0, 0, 6], fov: 55 }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.35} />
          <pointLight position={[3, 3, 5]} intensity={0.8} />
          <EmberField playing={phase === "playing"} onScore={() => setScore((s) => s + 1)} />
        </Canvas>
      </div>
      {phase !== "playing" && (
        <div className="game-overlay">
          {phase === "over" ? (
            <>
              <p className="game-overlay-title">Round over</p>
              <p className="game-overlay-sub">You caught {score} embers.</p>
            </>
          ) : (
            <p className="game-overlay-sub">
              Click the embers as they drift toward you. 30 seconds.
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
