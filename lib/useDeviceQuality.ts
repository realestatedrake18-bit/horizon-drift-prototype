"use client";

import { useEffect } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";
import { detectInitialQuality } from "@/lib/quality";

/**
 * Runs the one-time quality heuristic (lib/quality.ts) on mount and stores
 * the result. Kept separate from useReducedMotion so each hook has one job,
 * per Blueprint §59 (Separation of Concerns).
 */
export function useDeviceQuality() {
  const setQuality = useExperienceStore((s) => s.setQuality);
  const setIsMobile = useExperienceStore((s) => s.setIsMobile);

  useEffect(() => {
    const { tier, isMobile } = detectInitialQuality();
    setQuality(tier);
    setIsMobile(isMobile);
  }, [setQuality, setIsMobile]);
}
