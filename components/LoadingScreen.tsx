"use client";

import { useEffect } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";

/**
 * Blueprint §66: a loading screen tied to real state-machine status rather
 * than a fake progress bar. Because this prototype's only heavy asset is the
 * shader compile + geometry build (no external GLB / textures), the "loading"
 * status resolves quickly — the pattern here is what scales once real GLB /
 * KTX2 assets are added via an AssetLoader (Blueprint §65).
 */
export default function LoadingScreen() {
  const status = useExperienceStore((s) => s.status);
  const setStatus = useExperienceStore((s) => s.setStatus);

  useEffect(() => {
    if (status === "booting") {
      const t = setTimeout(() => setStatus("loading"), 120);
      return () => clearTimeout(t);
    }
  }, [status, setStatus]);

  const visible = status === "booting" || status === "loading";

  return (
    <div className={`loading-screen ${visible ? "" : "loading-screen--hidden"}`} aria-hidden={!visible}>
      <span className="loading-mark">HORIZON DRIFT</span>
    </div>
  );
}
