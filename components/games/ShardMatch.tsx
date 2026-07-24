"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 3D memory-match: twelve real WebGL cards spin in place to reveal one of
 * six shapes -- the diamond shape (icosahedron) is the same geometry family
 * as the hero object, so the site's mark literally shows up as a tile.
 */

const SHAPES = ["diamond", "pyramid", "sphere", "cube", "star", "hex"];
const COLS = 4;
const ROWS = 3;
const SPACING = 1.35;

interface TileData {
  id: number;
  shape: string;
  position: [number, number, number];
  flipped: boolean;
  matched: boolean;
}

function buildDeck(): TileData[] {
  const pairs = [...SHAPES, ...SHAPES];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((shape, id) => {
    const col = id % COLS;
    const row = Math.floor(id / COLS);
    return {
      id,
      shape,
      position: [
        (col - (COLS - 1) / 2) * SPACING,
        ((ROWS - 1) / 2 - row) * SPACING,
        0
      ] as [number, number, number],
      flipped: false,
      matched: false
    };
  });
}

function GlyphGeometry({ shape }: { shape: string }) {
  switch (shape) {
    case "diamond":
      return <icosahedronGeometry args={[0.5, 0]} />;
    case "pyramid":
      return <coneGeometry args={[0.5, 0.8, 4]} />;
    case "sphere":
      return <sphereGeometry args={[0.48, 16, 16]} />;
    case "cube":
      return <boxGeometry args={[0.72, 0.72, 0.72]} />;
    case "star":
      return <octahedronGeometry args={[0.55, 0]} />;
    default:
      return <cylinderGeometry args={[0.5, 0.5, 0.35, 6]} />;
  }
}

function Tile({ tile, onFlip }: { tile: TileData; onFlip: (id: number) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const revealed = tile.flipped || tile.matched;
  const rotationTarget = useRef(0);
  const prevRevealed = useRef(revealed);

  useEffect(() => {
    if (revealed !== prevRevealed.current) {
      rotationTarget.current += Math.PI;
      prevRevealed.current = revealed;
    }
  }, [revealed]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      rotationTarget.current,
      6,
      delta
    );
  });

  return (
    <group
      ref={groupRef}
      position={tile.position}
      onClick={(e) => {
        e.stopPropagation();
        onFlip(tile.id);
      }}
    >
      {revealed ? (
        <mesh>
          <GlyphGeometry shape={tile.shape} />
          <meshStandardMaterial
            color={tile.matched ? "#ffc46b" : "#8f6bff"}
            emissive={tile.matched ? "#7a5321" : "#4c2f99"}
            emissiveIntensity={0.55}
          />
        </mesh>
      ) : (
        <mesh>
          <boxGeometry args={[0.92, 0.92, 0.14]} />
          <meshStandardMaterial color="#241a33" emissive="#3a2a5c" emissiveIntensity={0.2} />
        </mesh>
      )}
    </group>
  );
}

export default function ShardMatch() {
  const [tiles, setTiles] = useState<TileData[]>(() => buildDeck());
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const matchedCount = useMemo(() => tiles.filter((t) => t.matched).length, [tiles]);
  const won = matchedCount === tiles.length;

  useEffect(() => {
    if (selected.length !== 2) return;
    setLocked(true);
    setMoves((m) => m + 1);
    const [a, b] = selected;
    const timeout = window.setTimeout(() => {
      setTiles((prev) =>
        prev.map((t) => {
          if (t.id !== a && t.id !== b) return t;
          const isMatch = prev[a].shape === prev[b].shape;
          return { ...t, matched: t.matched || isMatch, flipped: isMatch };
        })
      );
      setSelected([]);
      setLocked(false);
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [selected]);

  const flip = (id: number) => {
    if (locked) return;
    const tile = tiles.find((t) => t.id === id);
    if (!tile || tile.flipped || tile.matched || selected.length === 2) return;
    setTiles((prev) => prev.map((t) => (t.id === id ? { ...t, flipped: true } : t)));
    setSelected((prev) => [...prev, id]);
  };

  const restart = () => {
    setTiles(buildDeck());
    setSelected([]);
    setMoves(0);
    setLocked(false);
  };

  return (
    <div className="game-stage">
      <div className="game-hud">
        <span>Moves {moves}</span>
        <span>Shard Match</span>
      </div>
      <div className="game-canvas">
        <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.5} />
          <pointLight position={[3, 4, 6]} intensity={0.9} />
          <pointLight position={[-3, -2, 4]} intensity={0.3} color="#8f6bff" />
          {tiles.map((tile) => (
            <Tile key={tile.id} tile={tile} onFlip={flip} />
          ))}
        </Canvas>
      </div>
      {won && (
        <div className="game-overlay">
          <p className="game-overlay-title">All matched</p>
          <p className="game-overlay-sub">Solved in {moves} moves.</p>
          <button type="button" className="cta" onClick={restart}>
            Play again
            <span aria-hidden="true"> -&gt;</span>
          </button>
        </div>
      )}
    </div>
  );
}
