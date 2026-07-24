"use client";

import { useEffect } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";
import { games } from "@/components/games/registry";

/**
 * Fixed overlay above everything else in the interface stack. Backdrop stays
 * translucent (not solid black) so the hero diamond keeps drifting behind
 * the glass -- the game is a detour, not a different site.
 */
export default function GameModal() {
  const activeGame = useExperienceStore((s) => s.activeGame);
  const closeGame = useExperienceStore((s) => s.closeGame);
  const active = games.find((g) => g.id === activeGame);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGame();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, closeGame]);

  if (!active) return null;

  return (
    <div className="game-modal" role="dialog" aria-modal="true" aria-label={active.title}>
      <div className="game-modal-backdrop" onClick={closeGame} />
      <div className="game-modal-panel">
        <div className="game-modal-header">
          <span className="game-modal-title">{active.title}</span>
          <button
            type="button"
            className="game-modal-close"
            onClick={closeGame}
            aria-label="Close game"
          >
            Close ✕
          </button>
        </div>
        <active.Component />
      </div>
    </div>
  );
}
