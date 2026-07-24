import type { ComponentType } from "react";
import EmberCatch from "./EmberCatch";
import OrbitDodge from "./OrbitDodge";
import ShardMatch from "./ShardMatch";

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
