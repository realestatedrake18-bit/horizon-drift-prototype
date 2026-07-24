# Horizon Drift — 3D Website Blueprint Prototype

A one-scene visual prototype built following the 3D Website Creation Blueprint's
Phase 5 guidance: one strong composition, one camera rig, one primary object,
one lighting setup, one particle system, one interaction, one HTML interface
layer, and one mobile/accessibility treatment — proven before anything bigger
gets built on top of it.

## Stack

Next.js 14 (App Router) · TypeScript · React Three Fiber · drei ·
@react-three/postprocessing · GSAP (ready, not yet wired to a transition) ·
Lenis (smooth scroll) · Zustand (shared state machine)

## What's here

- `store/useExperienceStore.ts` — the shared state machine (Blueprint §56/§18)
- `lib/quality.ts`, `lib/useDeviceQuality.ts` — device-based quality tiers (§73)
- `lib/useReducedMotion.ts` — `prefers-reduced-motion` support (§80)
- `lib/useLenis.ts` — smooth scroll, disabled for reduced-motion visitors
- `components/CanvasRoot.tsx` — the persistent WebGL canvas (§54)
- `components/CameraRig.tsx` — pointer parallax + idle drift camera director (§31-34)
- `components/HeroObject.tsx` + `HeroMaterial.ts` — the central metaphor object with a
  custom GLSL fresnel/noise shader (§19, §25)
- `components/ParticleField.tsx` — an instanced atmospheric dust field (§38-43)
- `components/PostFX.tsx` — bloom/vignette/grain, gated by quality tier (§20, §73)
- `components/Interface.tsx` — the HTML layer: real, indexable, keyboard-reachable
  text and controls layered over the canvas (§1, §81-82)
- `components/CustomCursor.tsx`, `components/LoadingScreen.tsx` — supporting UX (§49, §66)

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

To build for production:

```bash
npm run build
npm start
```

**Note on this build:** `tsc --noEmit` and `next lint` both pass clean. The
sandbox this project was assembled in restricts child-process spawning in a
way that kept `next build` / `next dev` from completing (their internal
worker-pool process gets killed almost immediately after forking) — this is
an artifact of that specific sandbox's process isolation, not the code. On a
normal machine or in Vercel's build environment this should build and run
normally; if you hit anything unexpected, the most likely culprits are
dependency version drift (lockfile is included, so `npm ci` is the safest
install) or a Node version below 18.

## Where to go next

This is intentionally a single scene, not a full site. The natural next steps,
in the order the Blueprint recommends (§104-115):

1. Wire GSAP timelines to an actual scene transition (§50-53) once there's a
   second scene to transition to.
2. Replace the procedural icosahedron with a Blender-authored GLB (§9, §60-62).
3. Add real routes (`/work`, `/work/[slug]`) backed by the data-driven project
   system described in §57.
4. Add the dynamic FPS-based quality downgrade described in §74 — the tiers
   exist (`lib/quality.ts`) but nothing currently watches frame rate at runtime.
