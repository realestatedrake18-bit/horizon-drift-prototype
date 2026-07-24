"use client";

import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

/**
 * Blueprint §19 / §25: a small GLSL material for the hero object.
 * Fresnel-driven rim light + a slow-drifting noise field gives the object a
 * "breathing energy" look without any texture maps — cheap on mobile and
 * art-directable purely through uniforms.
 *
 * Uniforms are the JS -> GPU bridge (Blueprint §19 "Uniforms"): uTime drives
 * idle animation, uPointer lets the surface react subtly to the cursor, and
 * uDissolve is reserved for a future transition (Blueprint §52) that eats the
 * object away when the visitor navigates elsewhere.
 */
const HeroMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("#e8e2d6"),
    uAccent: new THREE.Color("#8f6bff"),
    uPointer: new THREE.Vector2(0, 0),
    uDissolve: 0
  },
  /* vertex */ `
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;

    // cheap 3D noise (Ashima-style simplex is overkill for this scale)
    float hash(vec3 p) {
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec3 pos = position;
      float n = hash(position * 2.0 + uTime * 0.05);
      pos += normal * (n - 0.5) * 0.035;
      vPosition = pos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
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

    void main() {
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.4);

      float pointerGlow = smoothstep(0.9, 0.0, distance(vNormal.xy, uPointer)) * 0.4;

      vec3 base = mix(uColor, uAccent, fresnel * 0.85 + pointerGlow);
      float pulse = 0.85 + 0.15 * sin(uTime * 0.6);

      vec3 color = base * pulse;
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
