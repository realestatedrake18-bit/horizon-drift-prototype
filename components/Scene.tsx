"use client";

import { Environment, ContactShadows } from "@react-three/drei";
import CameraRig from "@/components/CameraRig";
import HeroObject from "@/components/HeroObject";
import ParticleField from "@/components/ParticleField";
import Embers from "@/components/Embers";
import PostFX from "@/components/PostFX";
import { useExperienceStore } from "@/store/useExperienceStore";

/**
 * Blueprint §21-29: the 3D world itself — scene graph, lighting story, and
 * the reusable systems (camera rig, particles, post-fx) assembled together.
 * Lighting follows the key/fill/rim pattern from §26 so the hero object
 * reads with real form instead of flat ambient wash.
 */
export default function Scene() {
  const quality = useExperienceStore((s) => s.quality);

  return (
    <>
      <color attach="background" args={["#050406"]} />
      <fog attach="fog" args={["#050406", 6, 14]} />

      {/* key light */}
      <directionalLight position={[3, 4, 2]} intensity={1.6} color="#fff3e0" />
      {/* fill light */}
      <ambientLight intensity={0.18} color="#4b3f7a" />
      {/* rim light */}
      <pointLight position={[-4, -1, -3]} intensity={4} color="#8f6bff" />

      

      <CameraRig>
        <HeroObject />
      </CameraRig>

      <ParticleField />
      <Embers />

      {quality !== "low" && (
        <ContactShadows position={[0, -1.6, 0]} opacity={0.4} scale={8} blur={2.6} far={3} />
      )}

      <PostFX />
    </>
  );
}
