"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 3D survival game: shards fly out of the screen toward the player's plane,
 * growing larger as they approach (real perspective, not a fake scale
 * trick). Steer the mote with the pointer, raycast onto a fixed plane.
 */

const PLAYER_Z = 4;

interface ShardData {
  id: number;
  position: [number, number, number];
  velocity: THREE.Vector3;
  size: number;
  spin: number;
}

let shardSeq = 0;

function Player({ playerRef }: { playerRef: React.MutableRefObject<THREE.Vector3> }) {
  const ref = useRef<THREE.Mesh>(null);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -PLAYER_Z), []);
  const point = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, raycaster, pointer }) => {
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, point);
    const mesh = ref.current;
    if (!mesh) return;
    mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, point.x, 0.35);
    mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, point.y, 0.35);
    playerRef.current.set(mesh.position.x, mesh.position.y, PLAYER_Z);
  });

  return (
    <mesh ref={ref} position={[0, 0, PLAYER_Z]}>
      <sphereGeometry args={[0.26, 16, 16]} />
      <meshBasicMaterial color="#ff9d4d" />
    </mesh>
  );
}

function Shard({
  data,
  playerRef,
  onExpire,
  onHit
}: {
  data: ShardData;
  playerRef: React.MutableRefObject<THREE.Vector3>;
  onExpire: (id: number) => void;
  onHit: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const doneRef = useRef(false);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh || doneRef.current) return;
    mesh.position.addScaledVector(data.velocity, delta);
    mesh.rotation.x += delta * data.spin;
    mesh.rotation.y += delta * data.spin * 0.6;

    if (mesh.position.z > PLAYER_Z + 1.5) {
      doneRef.current = true;
      onExpire(data.id);
      return;
    }
    const dx = mesh.position.x - playerRef.current.x;
    const dy = mesh.position.y - playerRef.current.y;
    const dz = mesh.position.z - playerRef.current.z;
    if (Math.abs(dz) < 0.6 && Math.sqrt(dx * dx + dy * dy) < data.size * 0.6 + 0.35) {
      doneRef.current = true;
      onHit();
    }
  });

  return (
    <mesh ref={ref} position={data.position}>
      <octahedronGeometry args={[data.size, 0]} />
      <meshStandardMaterial color="#8f6bff" emissive="#4c2f99" emissiveIntensity={0.6} />
    </mesh>
  );
}

function ShardField({
  playerRef,
  playing,
  onHit
}: {
  playerRef: React.MutableRefObject<THREE.Vector3>;
  playing: boolean;
  onHit: () => void;
}) {
  const [shards, setShards] = useState<ShardData[]>([]);
  const spawnAcc = useRef(0);
  const elapsedMs = useRef(0);
  const hitRef = useRef(false);

  useEffect(() => {
    if (!playing) {
      setShards([]);
      spawnAcc.current = 0;
      elapsedMs.current = 0;
      hitRef.current = false;
    }
  }, [playing]);

  useFrame((_, delta) => {
    if (!playing || hitRef.current) return;
    elapsedMs.current += delta * 1000;
    spawnAcc.current += delta * 1000;
    const spawnEvery = Math.max(260, 900 - elapsedMs.current / 40);
    if (spawnAcc.current > spawnEvery) {
      spawnAcc.current = 0;
      shardSeq += 1;
      const spawn = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        -16
      );
      const target = new THREE.Vector3(
        (Math.random() - 0.5) * 2.6,
        (Math.random() - 0.5) * 2.6,
        PLAYER_Z + 0.2
      );
      const travel = Math.max(0.9, 2.6 - elapsedMs.current / 60000);
      const velocity = target.clone().sub(spawn).divideScalar(travel);
      setShards((prev) => [
        ...prev,
        {
          id: shardSeq,
          position: [spawn.x, spawn.y, spawn.z],
          velocity,
          size: 0.32 + Math.random() * 0.22,
          spin: (Math.random() - 0.5) * 2
        }
      ]);
    }
  });

  const remove = (id: number) => setShards((prev) => prev.filter((s) => s.id !== id));

  return (
    <>
      {shards.map((s) => (
        <Shard
          key={s.id}
          data={s}
          playerRef={playerRef}
          onExpire={remove}
          onHit={() => {
            if (hitRef.current) return;
            hitRef.current = true;
            onHit();
          }}
        />
      ))}
    </>
  );
}

export default function OrbitDodge() {
  const playerRef = useRef(new THREE.Vector3(0, 0, PLAYER_Z));
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState<"ready" | "playing" | "over">("ready");
  const startRef = useRef(0);

  const start = () => {
    playerRef.current.set(0, 0, PLAYER_Z);
    setElapsed(0);
    setPhase("playing");
    startRef.current = performance.now();
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      setElapsed(Math.floor((performance.now() - startRef.current) / 1000));
    }, 200);
    return () => window.clearInterval(id);
  }, [phase]);

  const handleHit = () => {
    setBest((b) => Math.max(b, Math.floor((performance.now() - startRef.current) / 1000)));
    setPhase("over");
  };

  return (
    <div className="game-stage">
      <div className="game-hud">
        <span>{phase === "playing" ? `${elapsed}s` : "Orbit Dodge"}</span>
        <span>Best {best}s</span>
      </div>
      <div className="game-canvas">
        <Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.4} />
          <pointLight position={[3, 3, 5]} intensity={0.7} />
          <pointLight position={[-3, -2, -6]} intensity={0.4} color="#8f6bff" />
          <Player playerRef={playerRef} />
          <ShardField playerRef={playerRef} playing={phase === "playing"} onHit={handleHit} />
        </Canvas>
      </div>
      {phase !== "playing" && (
        <div className="game-overlay">
          {phase === "over" ? (
            <>
              <p className="game-overlay-title">Shard hit</p>
              <p className="game-overlay-sub">You survived {elapsed}s.</p>
            </>
          ) : (
            <p className="game-overlay-sub">
              Move your mote with the pointer. Dodge the shards flying at you.
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
