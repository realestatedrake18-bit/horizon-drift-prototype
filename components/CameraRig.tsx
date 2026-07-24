"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";

/**
 * The hero object is the fixed focal point of the scene -- it never moves.
 * Instead, the camera orbits around it: scroll drives the base orbit angle,
 * pointer position layers an interactive spin/tilt on top, and everything
 * else in the scene (dust, embers) parallaxes for free because it's the
 * camera actually moving through the world, not the world moving past it.
 */
export default function CameraRig({ children }: { children: React.ReactNode }) {
  const { camera } = useThree();
  const pointer = useExperienceStore((s) => s.pointer);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const status = useExperienceStore((s) => s.status);
  const scrollProgress = useExperienceStore((s) => s.scrollProgress);

  useFrame((state) => {
    if (reducedMotion) {
      camera.position.set(0, 0, 5.2);
      camera.lookAt(0, 0, 0);
      return;
    }

    const t = state.clock.elapsedTime;
    const focused = status === "focused";

    const radius = focused ? 3.6 : 5.2;
    const idleDrift = Math.sin(t * 0.05) * 0.15;
    const scrollSpin = scrollProgress * Math.PI * 1.1;
    const pointerSpin = pointer.x * (focused ? 0.35 : 0.9);
    const theta = scrollSpin + pointerSpin + idleDrift;

    const elevationTarget = pointer.y * (focused ? 0.4 : 0.9) + Math.sin(t * 0.08) * 0.1;
    const elevation = THREE.MathUtils.clamp(elevationTarget, -1.6, 1.6);

    const targetX = Math.sin(theta) * radius;
    const targetZ = Math.cos(theta) * radius;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, elevation, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);

    camera.lookAt(0, 0, 0);
  });

  return <>{children}</>;
}
