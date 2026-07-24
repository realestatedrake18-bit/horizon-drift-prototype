"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";
import { QUALITY_SETTINGS } from "@/lib/quality";
import "./EmberMaterial";

/**
 * Warm, twinkling embers drifting close to the hero object -- the concrete
 * change that came out of studying activetheory.net's hero treatment:
 * continuous ambient particles filling the otherwise-empty space around the
 * centerpiece. Distinct from ParticleField's wider atmospheric dust field.
 * Quality-tiered via emberCount, fully skipped on reduced motion.
 */
const EMBER_PALETTE = [
  new THREE.Color("#ff5a3c"),
  new THREE.Color("#ff8a3d"),
  new THREE.Color("#ffb35c"),
  new THREE.Color("#5ab8ff"),
];
export default function Embers() {
  const quality = useExperienceStore((s) => s.quality);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const count = QUALITY_SETTINGS[quality].emberCount;
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<any>(null);

  const { positions, colors, sizes, phases, seeds } = useMemo(() => {
    const positions = new Float32Array(Math.max(count, 1) * 3);
    const colors = new Float32Array(Math.max(count, 1) * 3);
    const sizes = new Float32Array(Math.max(count, 1));
    const phases = new Float32Array(Math.max(count, 1));
    const seeds = new Float32Array(Math.max(count, 1));

    for (let i = 0; i < count; i++) {
      const radius = 1.1 + Math.random() * 2.1;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 2.4;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * radius;

      const isAccent = Math.random() < 0.14;
      const paletteColor = isAccent
        ? EMBER_PALETTE[3]
        : EMBER_PALETTE[Math.floor(Math.random() * 3)];
      colors[i * 3] = paletteColor.r;
      colors[i * 3 + 1] = paletteColor.g;
      colors[i * 3 + 2] = paletteColor.b;

      sizes[i] = 6 + Math.random() * 14;
      phases[i] = Math.random() * Math.PI * 2;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    return { positions, colors, sizes, phases, seeds };
  }, [count]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
    }
    if (!pointsRef.current || reducedMotion || count <= 0) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      posAttr.array[idx] += Math.sin(t * 0.3 + seeds[i]) * 0.0009;
      posAttr.array[idx + 1] += Math.cos(t * 0.25 + seeds[i]) * 0.0007;
    }
    posAttr.needsUpdate = true;
    pointsRef.current.rotation.y += delta * 0.03;
  });

  if (count <= 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      {/* @ts-ignore -- extended via EmberMaterial.ts side effect */}
      <emberMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
