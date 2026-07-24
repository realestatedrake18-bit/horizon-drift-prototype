"use client";

import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

/**
 * Ember particle material -- inspired by the glowing, drifting embers
 * around the hero mark on activetheory.net. Distinct from ParticleField's
 * flat lavender atmospheric dust: these are warm, per-particle colored,
 * twinkling points meant to sit close to the hero and read as sparks.
 * Additive blending gives the glow without needing bloom to do all the work.
 */
const EmberMaterial = shaderMaterial(
  {
    uTime: 0,
    uSizeAttenuation: 10,
  },
  /* vertex */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vPhase;
  uniform float uSizeAttenuation;

  void main() {
    vColor = aColor;
    vPhase = aPhase;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uSizeAttenuation / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
  `,
  /* fragment */ `
  varying vec3 vColor;
  varying float vPhase;
  uniform float uTime;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    float glow = smoothstep(0.5, 0.0, d);
    float twinkle = 0.5 + 0.5 * sin(uTime * 1.6 + vPhase);
    float alpha = glow * (0.25 + 0.5 * twinkle);
    gl_FragColor = vec4(vColor, alpha);
  }
  `
);

extend({ EmberMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    emberMaterial: any;
  }
}

export default EmberMaterial;
