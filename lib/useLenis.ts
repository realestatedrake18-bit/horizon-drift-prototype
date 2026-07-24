"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useExperienceStore } from "@/store/useExperienceStore";

/**
 * Blueprint Section 80: smooth scroll wrapped around native scroll, and the
 * bridge that turns scroll position into a 3D camera cue (Blueprint Section 29) --
 * CameraRig reads scrollProgress to dolly and orbit the hero object as the
 * visitor scrolls, so scrolling actually moves you through the scene instead
 * of just revealing flat HTML underneath a static 3D decoration.
 *
 * Reduced-motion visitors get native scrolling instead -- smooth scroll is a
 * flourish, not a requirement, and forcing it on everyone would violate
 * Section 80's promise that reduced-motion users still get full functionality.
 */
export function useLenis() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const setScrollProgress = useExperienceStore((s) => s.setScrollProgress);

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      setScrollProgress(lenis.progress);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [reducedMotion, setScrollProgress]);
}
