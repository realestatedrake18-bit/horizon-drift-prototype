"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useDeviceQuality } from "@/lib/useDeviceQuality";
import { useLenis } from "@/lib/useLenis";
import Interface from "@/components/Interface";
import CustomCursor from "@/components/CustomCursor";
import LoadingScreen from "@/components/LoadingScreen";

// The canvas is loaded client-only: WebGL has no meaning during server
// render, and pulling three.js into the SSR bundle only costs time
// (Blueprint §54, §60-ish territory: keep the render-critical path lean).
const CanvasRoot = dynamic(() => import("@/components/CanvasRoot"), { ssr: false });

/**
 * Top-level assembly. This is the one place that wires the persistent canvas,
 * the HTML interface layer, and the hooks that keep the shared store current
 * (Blueprint §1: "two worlds, one shared state").
 */
export default function Experience() {
  useReducedMotion();
  useDeviceQuality();
  useLenis();

  const status = useExperienceStore((s) => s.status);

  useEffect(() => {
    document.documentElement.dataset.status = status;
  }, [status]);

  return (
    <div className="experience-root">
      <LoadingScreen />
      <CanvasRoot />
      <Interface />
      <CustomCursor />
    </div>
  );
}
