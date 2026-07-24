"use client";

import { useEffect } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";

/**
 * Blueprint §80: Reduced Motion.
 * Watches the OS-level prefers-reduced-motion media query and writes the
 * result into the shared store so every system (camera drift, particles,
 * transitions) can dial itself back without each one re-implementing the check.
 */
export function useReducedMotion() {
  const setReducedMotion = useExperienceStore((s) => s.setReducedMotion);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [setReducedMotion]);
}
