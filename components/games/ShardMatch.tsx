"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Memory-match game: flip shards, find the six pairs. The diamond glyph
 * (the hero object's shape) is one of the six symbols, so the site's mark
 * literally shows up as a tile.
 */

const SYMBOLS = ["◆", "▲", "●", "■", "★", "⬡"];

interface Tile {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

function buildDeck(): Tile[] {
  const pairs = [...SYMBOLS, ...SYMBOLS];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((symbol, id) => ({ id, symbol, flipped: false, matched: false }));
}

export default function ShardMatch() {
  const [tiles, setTiles] = useState<Tile[]>(() => buildDeck());
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const matchedCount = useMemo(() => tiles.filter((t) => t.matched).length, [tiles]);
  const won = matchedCount === tiles.length;

  useEffect(() => {
    if (selected.length !== 2) return;
    setLocked(true);
    setMoves((m) => m + 1);
    const [a, b] = selected;
    const timeout = window.setTimeout(() => {
      setTiles((prev) =>
        prev.map((t) => {
          if (t.id !== a && t.id !== b) return t;
          const isMatch = prev[a].symbol === prev[b].symbol;
          return { ...t, matched: t.matched || isMatch, flipped: isMatch };
        })
      );
      setSelected([]);
      setLocked(false);
    }, 550);
    return () => window.clearTimeout(timeout);
  }, [selected]);

  const flip = (id: number) => {
    if (locked) return;
    const tile = tiles.find((t) => t.id === id);
    if (!tile || tile.flipped || tile.matched || selected.length === 2) return;
    setTiles((prev) => prev.map((t) => (t.id === id ? { ...t, flipped: true } : t)));
    setSelected((prev) => [...prev, id]);
  };

  const restart = () => {
    setTiles(buildDeck());
    setSelected([]);
    setMoves(0);
    setLocked(false);
  };

  return (
    <div className="game-stage game-stage--match">
      <div className="game-hud">
        <span>Moves {moves}</span>
        <span>Shard Match</span>
      </div>
      <div className="match-grid">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            type="button"
            className={
              "match-tile" +
              (tile.flipped || tile.matched ? " match-tile--flipped" : "") +
              (tile.matched ? " match-tile--matched" : "")
            }
            onClick={() => flip(tile.id)}
            aria-label={tile.flipped || tile.matched ? tile.symbol : "Hidden shard"}
          >
            <span className="match-tile-face match-tile-front" aria-hidden="true" />
            <span className="match-tile-face match-tile-back" aria-hidden="true">
              {tile.symbol}
            </span>
          </button>
        ))}
      </div>
      {won && (
        <div className="game-overlay">
          <p className="game-overlay-title">All matched</p>
          <p className="game-overlay-sub">Solved in {moves} moves.</p>
          <button type="button" className="cta" onClick={restart}>
            Play again
            <span aria-hidden="true"> -&gt;</span>
          </button>
        </div>
      )}
    </div>
  );
}
