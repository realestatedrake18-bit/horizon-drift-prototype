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
      "A placeholder project entry. This panel is driven by the same state machine as the camera -- swap this content for a real project record and repeat the pattern for each one.",
    body:
      "Signal Drift is the first placeholder case study in the Horizon Drift prototype. In a real build this would hold the full write-up: the brief, the approach, the outcome, and supporting imagery or embedded video. The routing, layout, and typography here are already production-shaped -- only the content needs to change.",
  },
  {
    slug: "glass-choir",
    eyebrow: "Project 02",
    title: "Glass Choir",
    summary:
      "A second placeholder entry, proving the panel can hold more than one project without touching the camera rig or the state machine at all.",
    body:
      "Glass Choir is the second placeholder case study. It exists to prove the pattern scales: add an entry to the projects array in lib/projects.ts and it appears in the panel, the /work index, and its own /work/[slug] page automatically.",
  },
  {
    slug: "quiet-machine",
    eyebrow: "Project 03",
    title: "Quiet Machine",
    summary:
      "A third placeholder entry. Swap all three for real case studies -- the crossfade and index nav already work off activeIndex in the store.",
    body:
      "Quiet Machine is the third placeholder case study, included to confirm the index nav, the crossfade, and the routing all stay in sync across more than two entries.",
  },
];
