"use client";

import { create } from "zustand";

/**
 * The application's single source of truth (Blueprint §56 / §18: State Machine + Zustand).
 * Every visual system (camera, particles, post-processing, HTML overlay) reads from
 * this store rather than tracking its own local notion of "what's happening."
 */

export type ExperienceStatus =
  | "booting"
  | "loading"
  | "intro"
  | "idle"
  | "focused"
  | "transitioning";

export type QualityTier = "high" | "medium" | "low";

interface ExperienceState {
  status: ExperienceStatus;
  setStatus: (status: ExperienceStatus) => void;

  loadProgress: number;
  setLoadProgress: (value: number) => void;

  quality: QualityTier;
  setQuality: (tier: QualityTier) => void;

  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;

  isMobile: boolean;
  setIsMobile: (value: boolean) => void;

  pointer: { x: number; y: number };
  setPointer: (x: number, y: number) => void;

  activeIndex: number;
  setActiveIndex: (index: number) => void;

  soundOn: boolean;
  toggleSound: () => void;

  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;

  scrollProgress: number;
  setScrollProgress: (value: number) => void;

  activeGame: string | null;
  openGame: (id: string) => void;
  closeGame: () => void;
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  status: "booting",
  setStatus: (status) => set({ status }),

  loadProgress: 0,
  setLoadProgress: (value) => set({ loadProgress: value }),

  quality: "high",
  setQuality: (tier) => set({ quality: tier }),

  reducedMotion: false,
  setReducedMotion: (value) => set({ reducedMotion: value }),

  isMobile: false,
  setIsMobile: (value) => set({ isMobile: value }),

  pointer: { x: 0, y: 0 },
  setPointer: (x, y) => set({ pointer: { x, y } }),

  activeIndex: 0,
  setActiveIndex: (index) => set({ activeIndex: index }),

  soundOn: false,
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),

  menuOpen: false,
  setMenuOpen: (value) => set({ menuOpen: value }),

  scrollProgress: 0,
  setScrollProgress: (value) => set({ scrollProgress: value }),

  activeGame: null,
  openGame: (id) => set({ activeGame: id }),
  closeGame: () => set({ activeGame: null })
}));
