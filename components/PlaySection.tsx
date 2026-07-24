"use client";

import { useMemo } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";
import { games } from "@/components/games/registry";

const REVEAL_START = 0.3;
const REVEAL_END = 0.5;

/**
 * Scroll-revealed band of playable tiles. Fades and lifts in as scrollProgress
 * crosses the reveal window, sitting above the persistent 3D canvas (so the
 * hero diamond keeps drifting behind it) but below the game modal.
 */
export default function PlaySection() {
  const scrollProgress = useExperienceStore((s) => s.scrollProgress);
  const openGame = useExperienceStore((s) => s.openGame);

  const visibility = useMemo(() => {
    if (scrollProgress <= REVEAL_START) return 0;
    if (scrollProgress >= REVEAL_END) return 1;
    return (scrollProgress - REVEAL_START) / (REVEAL_END - REVEAL_START);
  }, [scrollProgress]);

  const visible = visibility > 0.02;

  return (
    <section
      className={"play-section" + (visible ? " play-section--visible" : "")}
      style={{
        opacity: visibility,
        transform: `translateY(${(1 - visibility) * 32}px)`,
        pointerEvents: visible ? "auto" : "none"
      }}
      aria-hidden={!visible}
    >
      <span className="play-eyebrow">Take a detour</span>
      <h2 className="play-heading">Three small games, built from the same shapes.</h2>
      <div className="play-grid">
        {games.map((game) => (
          <button
            key={game.id}
            type="button"
            className="play-box"
            onClick={() => openGame(game.id)}
          >
            <span className="play-box-title">{game.title}</span>
            <span className="play-box-tagline">{game.tagline}</span>
            <span className="play-box-cta" aria-hidden="true">
              Play -&gt;
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
