"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import Scene from "@/components/Scene";
import { useExperienceStore } from "@/store/useExperienceStore";
import { QUALITY_SETTINGS } from "@/lib/quality";

/**
 * Blueprint §54: the persistent canvas. This mounts once and stays mounted
 * for the life of the app shell — nothing here should be re-created when the
 * visitor moves between HTML routes layered on top of it. Visibility
 * handling (§76) pauses the render loop when the tab is hidden so a bored
 * background tab doesn't keep burning battery.
 */
export default function CanvasRoot() {
  const quality = useExperienceStore((s) => s.quality);
  const setStatus = useExperienceStore((s) => s.setStatus);
  const dpr = QUALITY_SETTINGS[quality].dpr;

  useEffect(() => {
    const t = setTimeout(() => setStatus("idle"), 900);
    return () => clearTimeout(t);
  }, [setStatus]);

  return (
    <Canvas
      className="experience-canvas"
      dpr={dpr}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      camera={{ position: [0, 0, 5.2], fov: 42, near: 0.1, far: 40 }}
      onCreated={({ gl }) => {
        gl.setClearColor("#050406", 1);
      }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
