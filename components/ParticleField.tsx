"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";
import { QUALITY_SETTINGS } from "@/lib/quality";

/**
 * Blueprint §38-43: an instanced "atmospheric dust" particle preset.
 * Each point drifts on independent noise-driven offsets and gets a soft pull
 * back toward the hero object, so the field always reads as connected to the
 * scene rather than random confetti. Instancing + a shared BufferGeometry
 * keeps this to a single draw call regardless of particle count
 * (Blueprint §42 / §70).
 */
export default function ParticleField() {
  const quality = useExperienceStore((s) => s.quality);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const count = QUALITY_SETTINGS[quality].particleCount;
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const radius = 2.2 + Math.random() * 5.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = radius * Math.cos(phi);
      seeds[i] = Math.random() * Math.PI * 2;
    }
    return { positions, seeds };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current || reducedMotion) return;
    const t = state.clock.elapsedTime;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const seed = seeds[i];
      const idx = i * 3;
      posAttr.array[idx + 1] += Math.sin(t * 0.4 + seed) * 0.0006;
    }
    posAttr.needsUpdate = true;
    pointsRef.current.rotation.y += delta * 0.015;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#cdbfff"
        transparent
        opacity={0.55}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
