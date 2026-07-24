export type Project = {
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  body: string;
};

export const projects: Project[] = [
  {
    slug: "signal-drift",
    eyebrow: "Project 01",
    title: "Signal Drift",
    summary:
      "An audio-reactive campaign site for an independent record label's album launch, built around a single generative visual that responds to the track in real time.",
    body:
      "The label wanted the launch page to feel like part of the record, not a landing page bolted on after it. We built a WebGL scene driven directly by the album's stems -- bass drives the camera's dolly, percussion triggers a particle burst, and the vocal track modulates a custom fresnel shader on the hero form. Visitors could scrub the track and watch the scene respond in real time. The page shipped alongside the album and became the most-shared asset in the campaign.",
  },
  {
    slug: "glass-choir",
    eyebrow: "Project 02",
    title: "Glass Choir",
    summary:
      "A generative sound-and-light installation for a museum's new media wing, translating visitor movement into an evolving choral soundscape.",
    body:
      "Commissioned for a rotating exhibit on sound and space, Glass Choir tracks visitor position through the gallery via floor sensors and maps it to a procedural choir of overlapping vocal drones, each voice tied to a suspended glass panel lit from within. We built the real-time audio engine and the lighting choreography, then ported the core generative system into this WebGL piece so it could live on afterward as a standalone web experience. It ran for fourteen weeks and became the wing's most-photographed installation.",
  },
  {
    slug: "quiet-machine",
    eyebrow: "Project 03",
    title: "Quiet Machine",
    summary:
      "A product launch microsite for a minimalist home hardware brand, built to make a single object feel worth the wait.",
    body:
      "The brand's flagship device does one thing extremely well and says almost nothing about itself -- the site needed to match that restraint. We built a single-scene 3D product page: one object, one light, one scroll-driven reveal, with copy trimmed to a handful of lines. No carousel, no feature grid, no comparison table. Pre-orders opened the same day the site went live and sold out in under six hours.",
  },
];
