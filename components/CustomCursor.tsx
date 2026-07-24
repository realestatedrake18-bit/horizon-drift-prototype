"use client";

import { useEffect, useRef } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";

/**
 * Blueprint §49: a custom cursor that communicates state rather than existing
 * for its own sake. It disables itself on touch devices (no pointer to
 * track) and hides on real cursor movement to avoid a "stuck ghost cursor"
 * flash before the first mousemove event fires.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const isMobile = useExperienceStore((s) => s.isMobile);
  const setPointer = useExperienceStore((s) => s.setPointer);

  useEffect(() => {
    if (isMobile) return;

    function handleMove(e: PointerEvent) {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      setPointer(nx, ny);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        dotRef.current.style.opacity = "1";
      }
    }

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [isMobile, setPointer]);

  if (isMobile) return null;

  return <div ref={dotRef} className="custom-cursor" aria-hidden="true" />;
}
