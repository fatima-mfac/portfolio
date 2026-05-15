'use client';

import { useRef } from 'react';

// Pause at the last frame for this long before restarting the loop, in ms.
const END_PAUSE_MS = 3000;

/**
 * Hero video for the Patina case study. Plays once, holds on the final frame
 * for END_PAUSE_MS, then restarts. The native `loop` attribute restarts
 * instantly, which makes the cut feel jarring; this gives the ending a beat
 * to land before the next cycle.
 */
export function PatinaHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnded = () => {
    window.setTimeout(() => {
      const video = videoRef.current;
      // Component may have unmounted while we waited.
      if (!video) return;
      video.currentTime = 0;
      void video.play();
    }, END_PAUSE_MS);
  };

  // Art-directed sources: mobile (< 828px, matches --breakpoint-md)
  // gets a portrait-oriented capture so the phone-app subject stays
  // readable; desktop gets the wider landscape composition. The
  // browser picks ONE source at parse time and only downloads that
  // file, so file weight stays low for mobile users.
  //
  // The mobile source has a thin scroll indicator on its right edge.
  // The .patina-hero-video class below extends the element past the
  // container's right edge on mobile — wrapper's overflow-hidden
  // clips the artefact. Tune the negative right value to taste.
  return (
    <>
      <style>{`
        .patina-hero-video {
          /* <video> is a replaced element — top/bottom alone don't
             always force its box to fill its absolute-positioned
             container in every browser. Pin explicit width + height
             100% and display:block so the box always covers the
             parent edge-to-edge before object-cover scales the video. */
          position: absolute;
          inset: 0;
          right: -40px;
          width: calc(100% + 40px);
          height: 100%;
          display: block;
          object-fit: cover;
        }
        @media (min-width: 828px) {
          .patina-hero-video {
            right: 0;
            width: 100%;
          }
        }
      `}</style>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="metadata"
        poster="/patina/hero.png"
        onEnded={handleEnded}
        className="patina-hero-video"
      >
        <source
          media="(max-width: 828px)"
          src="/patina/patina-hero-mobile.mp4"
          type="video/mp4"
        />
        <source src="/patina/patina-hero-video.mp4" type="video/mp4" />
      </video>
    </>
  );
}
