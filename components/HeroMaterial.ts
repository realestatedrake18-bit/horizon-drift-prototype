"use client";

import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

/**
 * Blueprint Section 19 / Section 25: a small GLSL material for the hero object.
 * A real per-facet diffuse term (surface normal vs. the scene's key light
 * direction) plus a fresnel rim and a slow-drifting pulse gives the object
 * actual dimensional shading instead of a flat glow -- cheap on mobile and
 * art-directable purely through uniforms.
 *
 * Uniforms are the JS -> GPU bridge (Blueprint Section 19 "Uniforms"): uTime drives
 * idle animation, uPointer lets the surface react subtly to the cursor, and
 * uDissolve is reserved for a future transition (Blueprint Section 52) that eats the
 * object away when the visitor navigates elsewhere.
 */
const HeroMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("#e8e2d6"),
    uAccent: new THREE.Color("#8f6bff"),
    uPointer: new THREE.Vector2(0, 0),
    uDissolve: 0,
  },
  /* vertex */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;

  void main() {
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  /* fragment */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform vec2 uPointer;
  uniform float uDissolve;

  // Cosine palette (Inigo Quilez) -- fakes a thin-film / chrome iridescence
  // sweep without needing a real environment map. Cheap on every quality
  // tier and gives the activetheory.net-style shifting rim color.
  vec3 iridescence(float t) {
    vec3 a = vec3(0.55, 0.45, 0.65);
    vec3 b = vec3(0.45, 0.4, 0.5);
    vec3 c = vec3(1.0, 0.9, 0.6);
    vec3 d = vec3(0.0, 0.2, 0.45);
    return a + b * cos(6.28318 * (c * t + d));
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 lightDir = normalize(vec3(3.0, 4.0, 2.0));

    float diffuse = max(dot(N, lightDir), 0.0);
    float fresnel = pow(1.0 - max(dot(viewDir, N), 0.0), 1.5);

    float pointerGlow = smoothstep(0.9, 0.0, distance(N.xy, uPointer)) * 0.4;

    vec3 base = mix(uColor, uAccent, fresnel * 0.85 + pointerGlow);
    float shade = 0.35 + 0.65 * diffuse;
    float pulse = 0.85 + 0.15 * sin(uTime * 0.6);

    vec3 color = base * shade * pulse;

    float iridT = fresnel * 2.2 + dot(N, viewDir) * 0.5 + uTime * 0.04;
    vec3 sheen = iridescence(iridT) * (0.7 + 0.3 * pulse);
    float sheenMix = smoothstep(0.05, 0.75, fresnel);
    color = mix(color, sheen, sheenMix * 0.85);

    float alpha = 1.0 - smoothstep(0.0, 1.0, uDissolve);

    gl_FragColor = vec4(color, alpha);
  }
  `
);

extend({ HeroMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    heroMaterial: any;
  }
}

export default HeroMaterial;
