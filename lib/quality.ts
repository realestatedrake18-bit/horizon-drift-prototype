"use client";

import type { QualityTier } from "@/store/useExperienceStore";

/**
 * Blueprint §73 / §102: Quality Manager.
 * A single, cheap heuristic run once on mount to pick a starting quality tier.
 * We deliberately keep this simple — the goal is "don't melt a five year old
 * phone on first paint," not a perfect device benchmark. Dynamic downgrades
 * (Blueprint §74) are handled separately by the FPS monitor in PostFX.
 */
export function detectInitialQuality(): { tier: QualityTier; isMobile: boolean } {
  if (typeof window === "undefined") {
    return { tier: "high", isMobile: false };
  }

  const ua = window.navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const cores = window.navigator.hardwareConcurrency ?? 4;
  const memory = (window.navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const dpr = window.devicePixelRatio ?? 1;

  if (isMobile && (cores <= 4 || memory <= 4)) {
    return { tier: "low", isMobile };
  }
  if (isMobile) {
    return { tier: "medium", isMobile };
  }
  if (cores <= 4 || memory <= 4 || dpr > 3) {
    return { tier: "medium", isMobile };
  }
  return { tier: "high", isMobile };
}

export const QUALITY_SETTINGS: Record<
  QualityTier,
  {
    particleCount: number;
    emberCount: number;
    dpr: [number, number];
    bloom: boolean;
    vignette: boolean;
    grain: boolean;
    shadows: boolean;
  }
> = {
  high: { particleCount: 3200, emberCount: 140, dpr: [1, 2], bloom: true, vignette: true, grain: true, shadows: true },
  medium: { particleCount: 1400, emberCount: 70, dpr: [1, 1.5], bloom: true, vignette: true, grain: false, shadows: false },
  low: { particleCount: 500, emberCount: 0, dpr: [1, 1], bloom: false, vignette: false, grain: false, shadows: false }
};
