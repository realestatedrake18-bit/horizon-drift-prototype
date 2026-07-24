"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useExperienceStore } from "@/store/useExperienceStore";

/**
 * Blueprint §17 / §47: Lenis smooth scroll turned into a progress signal.
 * Reduced-motion visitors get native scrolling instead — smooth scroll is a
 * flourish, not a requirement, and forcing it on everyone would violate
 * §80's promise that reduced-motion users still get full functionality.
 */
export function useLenis() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true
    });

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [reducedMotion]);
}
