import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// Lazy-loaded: each game's R3F scene only ships to the browser once the
// visitor actually opens it, keeping the three.js/game code out of the
// homepage's initial bundle. ssr:false because they touch window/canvas.
const EmberCatch = dynamic(() => import("./EmberCatch"), { ssr: false });
const OrbitDodge = dynamic(() => import("./OrbitDodge"), { ssr: false });
const ShardMatch = dynamic(() => import("./ShardMatch"), { ssr: false });

export interface GameDef {
  id: string;
  title: string;
  tagline: string;
  Component: ComponentType;
}

export const games: GameDef[] = [
  {
    id: "ember-catch",
    title: "Ember Catch",
    tagline: "Click the drifting embers before they fade. 30 second reflex round.",
    Component: EmberCatch
  },
  {
    id: "orbit-dodge",
    title: "Orbit Dodge",
    tagline: "Steer your mote through a field of drifting shards. How long can you last?",
    Component: OrbitDodge
  },
  {
    id: "shard-match",
    title: "Shard Match",
    tagline: "Flip and match the six shard glyphs, diamond included.",
    Component: ShardMatch
  }
];
