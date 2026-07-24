"use client";

import { useEffect, useRef } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";

/**
 * A tiny generative ambient drone -- no audio file, no licensing question,
 * just a handful of detuned oscillators through a slow-modulated filter.
 * Mirrors the rest of the scene's philosophy (shader, particles, camera):
 * everything here is procedural and driven by the same store. Starts on
 * the existing "Sound on/off" toggle, which also satisfies the browser's
 * requirement that audio only starts from a real user gesture.
 */
export function useAmbientAudio() {
  const soundOn = useExperienceStore((s) => s.soundOn);
  const pointer = useExperienceStore((s) => s.pointer);
  const pointerRef = useRef(pointer);
  pointerRef.current = pointer;

  const graphRef = useRef<{
    ctx: AudioContext;
    master: GainNode;
    filter: BiquadFilterNode;
  } | null>(null);

  useEffect(() => {
    if (!soundOn) {
      const graph = graphRef.current;
      if (graph) {
        graph.master.gain.cancelScheduledValues(graph.ctx.currentTime);
        graph.master.gain.linearRampToValueAtTime(0, graph.ctx.currentTime + 0.8);
      }
      return;
    }

    if (!graphRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();

      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 900;
      filter.Q.value = 0.7;
      filter.connect(master);

      const panner = ctx.createStereoPanner();
      panner.connect(filter);

      const tones = [
        { freq: 55, gain: 0.5, detune: 0 },
        { freq: 82.41, gain: 0.32, detune: -6 },
        { freq: 220, gain: 0.14, detune: 8 },
      ];

      tones.forEach(({ freq, gain, detune }) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.detune.value = detune;
        const g = ctx.createGain();
        g.gain.value = gain;
        osc.connect(g);
        g.connect(panner);
        osc.start();
      });

      // slow filter-cutoff "breathing"
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.05;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 300;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      // slow stereo drift
      const panLfo = ctx.createOscillator();
      panLfo.type = "sine";
      panLfo.frequency.value = 0.03;
      const panLfoGain = ctx.createGain();
      panLfoGain.gain.value = 0.6;
      panLfo.connect(panLfoGain);
      panLfoGain.connect(panner.pan);
      panLfo.start();

      graphRef.current = { ctx, master, filter };
    }

    const graph = graphRef.current;
    if (graph.ctx.state === "suspended") {
      graph.ctx.resume();
    }
    graph.master.gain.cancelScheduledValues(graph.ctx.currentTime);
    graph.master.gain.linearRampToValueAtTime(0.07, graph.ctx.currentTime + 1.2);
  }, [soundOn]);

  // subtle pointer-driven filter cutoff -- ties the drone to the same
  // interaction the camera and hero shader already respond to.
  useEffect(() => {
    const id = window.setInterval(() => {
      const graph = graphRef.current;
      if (!graph) return;
      const target = 900 + pointerRef.current.x * 250;
      graph.filter.frequency.setTargetAtTime(target, graph.ctx.currentTime, 0.6);
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    return () => {
      graphRef.current?.ctx.close();
    };
  }, []);
}
