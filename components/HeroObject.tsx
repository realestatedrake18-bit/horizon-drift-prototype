"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import "./HeroMaterial";
import { useExperienceStore } from "@/store/useExperienceStore";

/**
 * The scene's central metaphor (Blueprint Section 6): a single fractured, luminous
 * form suspended in a dark void -- something being held together mid-assembly.
 * It stands in for "a portfolio of work still taking shape." One object, one
 * light story, one idea -- restraint over a pile of unrelated effects
 * (Blueprint Section 117).
 *
 * Geometry now comes from a real asset (public/models/hero.glb, modeled in
 * Blender) instead of a procedural THREE.IcosahedronGeometry -- the custom
 * fresnel/noise shader material and the rotation/pointer behavior are
 * unchanged, only the mesh source changed.
 */
export default function HeroObject() {
  const materialRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const pointer = useExperienceStore((s) => s.pointer);

  const { nodes } = useGLTF("/models/hero.glb") as any;
  const geometry = nodes.HeroObject.geometry;

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;
      materialRef.current.uPointer.lerp(
        new THREE.Vector2(pointer.x, pointer.y),
        0.05
      );
    }
    if (meshRef.current && !reducedMotion) {
      meshRef.current.rotation.y += delta * 0.08;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} scale={1.4} castShadow receiveShadow>
      <heroMaterial ref={materialRef} wireframe={false} />
    </mesh>
  );
}

useGLTF.preload("/models/hero.glb");
