"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";

/**
 * The hero object is the fixed focal point of the scene -- it never moves.
 * Instead, the camera orbits around it: scroll drives the base orbit angle,
 * pointer position layers an interactive spin/tilt on top, and everything
 * else in the scene (dust, embers) parallaxes for free because it's the
 * camera actually moving through the world, not the world moving past it.
 *
 * IMPORTANT: the orbit angle (theta) and radius/elevation are smoothed
 * separately, then recombined via sin/cos every frame -- NOT by lerping
 * camera.position.x/z directly toward a moving target. Lerping x and z
 * independently interpolates along the straight chord between two points
 * on the circle, and for a large angle change (e.g. a fast scroll) that
 * chord cuts close to the origin, swinging the camera briefly right
 * through the hero object. Smoothing the angle itself keeps the camera
 * on the circle (at the current smoothed radius) at all times.
 */
export default function CameraRig({ children }: { children: React.ReactNode }) {
  const { camera } = useThree();
  const pointer = useExperienceStore((s) => s.pointer);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const status = useExperienceStore((s) => s.status);
  const scrollProgress = useExperienceStore((s) => s.scrollProgress);

  const smoothedTheta = useRef(0);
  const smoothedRadius = useRef(7.6);
  const smoothedElevation = useRef(0);
  const initialized = useRef(false);

  useFrame((state) => {
    if (reducedMotion) {
      camera.position.set(0, 0, 7.6);
      camera.lookAt(0, 0, 0);
      return;
    }

    const t = state.clock.elapsedTime;
    const focused = status === "focused";

    const targetRadius = focused ? 5.0 : 7.6;
    const idleDrift = Math.sin(t * 0.05) * 0.15;
    const scrollSpin = scrollProgress * Math.PI * 1.1;
    const pointerSpin = pointer.x * (focused ? 0.35 : 0.9);
    const targetTheta = scrollSpin + pointerSpin + idleDrift;

    const elevationTarget = pointer.y * (focused ? 0.4 : 0.9) + Math.sin(t * 0.08) * 0.1;
    const targetElevation = THREE.MathUtils.clamp(elevationTarget, -1.6, 1.6);

    if (!initialized.current) {
      smoothedTheta.current = targetTheta;
      smoothedRadius.current = targetRadius;
      smoothedElevation.current = targetElevation;
      initialized.current = true;
    }

    smoothedTheta.current = THREE.MathUtils.lerp(smoothedTheta.current, targetTheta, 0.05);
    smoothedRadius.current = THREE.MathUtils.lerp(smoothedRadius.current, targetRadius, 0.05);
    smoothedElevation.current = THREE.MathUtils.lerp(smoothedElevation.current, targetElevation, 0.05);

    camera.position.x = Math.sin(smoothedTheta.current) * smoothedRadius.current;
    camera.position.z = Math.cos(smoothedTheta.current) * smoothedRadius.current;
    camera.position.y = smoothedElevation.current;

    camera.lookAt(0, 0, 0);
  });

  return <>{children}</>;
}
