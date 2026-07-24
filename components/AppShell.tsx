"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useDeviceQuality } from "@/lib/useDeviceQuality";
import { useLenis } from "@/lib/useLenis";
import { useAmbientAudio } from "@/lib/useAmbientAudio";
import CustomCursor from "@/components/CustomCursor";
import LoadingScreen from "@/components/LoadingScreen";

// The canvas is loaded client-only: WebGL has no meaning during server
// render, and pulling three.js into the SSR bundle only costs time.
const CanvasRoot = dynamic(() => import("@/components/CanvasRoot"), { ssr: false });

/**
 * The persistent app shell. Lives in the root layout so the 3D canvas,
 * loading screen, and cursor mount once and survive route navigation --
 * previously CanvasRoot only mounted on "/", so navigating to /work dropped
 * visitors out of the 3D experience entirely and back into a flat HTML page.
 * Route-specific content (the homepage hero, the work list, etc.) is
 * rendered as children on top of this shell.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  useReducedMotion();
  useDeviceQuality();
  useLenis();
  useAmbientAudio();

  const status = useExperienceStore((s) => s.status);

  useEffect(() => {
    document.documentElement.dataset.status = status;
  }, [status]);

  return (
    <div className="experience-root">
      <LoadingScreen />
      <CanvasRoot />
      {children}
      <CustomCursor />
    </div>
  );
}
