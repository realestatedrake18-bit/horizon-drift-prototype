"use client";

import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { useExperienceStore } from "@/store/useExperienceStore";
import { QUALITY_SETTINGS } from "@/lib/quality";

/**
 * Blueprint §20 / §71-73: post-processing gated entirely by the Quality
 * Manager's tier. Every effect here is optional and cheap to strip — on
 * "low" tier this component renders nothing extra, which matters more for
 * battery and heat (§75) than any single frame-rate number does.
 */
export default function PostFX() {
  const quality = useExperienceStore((s) => s.quality);
  const settings = QUALITY_SETTINGS[quality];

  if (!settings.bloom && !settings.vignette && !settings.grain) return null;

  return (
    <EffectComposer multisampling={0}>
      {settings.bloom ? (
        <Bloom intensity={0.55} luminanceThreshold={0.35} luminanceSmoothing={0.2} mipmapBlur />
      ) : (
        <></>
      )}
      {settings.grain ? <Noise opacity={0.025} /> : <></>}
      {settings.vignette ? <Vignette eskil={false} offset={0.25} darkness={0.85} /> : <></>}
    </EffectComposer>
  );
}
