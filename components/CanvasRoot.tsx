"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import Scene from "@/components/Scene";
import { useExperienceStore } from "@/store/useExperienceStore";
import { QUALITY_SETTINGS } from "@/lib/quality";

/**
 * Blueprint Â54: the persistent canvas. This mounts once and stays mounted
 * for the life of the app shell -- nothing here should be re-created when the
 * visitor moves between HTML routes layered on top of it. Visibility
 * handling (Â76) pauses the render loop when the tab is hidden so a bored
 * background tab doesn't keep burning battery.
 *
 * The explicit style prop below is load-bearing: React Three Fiber's Canvas
 * applies its own inline position/width/height styles to this div by
 * default, and inline styles always win over the .experience-canvas CSS
 * class regardless of what globals.css says. Without this, the canvas never
 * actually became the fixed full-viewport background it was designed to be
 * -- it just sat in normal document flow and scrolled away with the page.
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
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
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
