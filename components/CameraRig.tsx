"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";

export default function CameraRig({ children }: { children: React.ReactNode }) {
  const rig = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const pointer = useExperienceStore((s) => s.pointer);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const status = useExperienceStore((s) => s.status);
  const scrollProgress = useExperienceStore((s) => s.scrollProgress);

  useFrame((state) => {
    if (!rig.current) return;

    if (reducedMotion) {
      rig.current.position.set(0, 0, 0);
      rig.current.rotation.set(0, 0, 0);
      camera.lookAt(0, 0, 0);
      return;
    }

    const t = state.clock.elapsedTime;
    const driftX = Math.sin(t * 0.12) * 0.12;
    const driftY = Math.cos(t * 0.09) * 0.08;

    const focused = status === "focused";
    const parallaxStrength = focused ? 0.16 : 0.5;
    const tiltStrength = focused ? 0.1 : 0.32;
    const arcStrength = focused ? 0.18 : 0.55;

    const targetX = pointer.x * parallaxStrength + driftX;
    const targetY = pointer.y * (parallaxStrength * 0.65) + driftY;
    const targetZ = (focused ? -0.9 : 0) + scrollProgress * 1.6;

    const targetOrbit = scrollProgress * Math.PI * 0.55 + pointer.x * arcStrength;
    const targetTilt = -pointer.y * tiltStrength;

    rig.current.position.x = THREE.MathUtils.lerp(rig.current.position.x, targetX, 0.05);
    rig.current.position.y = THREE.MathUtils.lerp(rig.current.position.y, targetY, 0.05);
    rig.current.position.z = THREE.MathUtils.lerp(rig.current.position.z, targetZ, 0.05);
    rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, targetOrbit, 0.06);
    rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, targetTilt, 0.06);

    camera.lookAt(0, 0, 0);
  });

  return <group ref={rig}>{children}</group>;
}
