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
  // The poster <picture> mirrors that art direction with each video's
  // actual first frame. It sits behind the (initially transparent)
  // <video>, positioned identically, so the page opens on the real
  // first frame — no flash of a different image while the video buffers.
  //
  // The mobile source has a thin scroll indicator on its right edge.
  // The .patina-hero-layer class below extends the element past the
  // container's right edge on mobile — wrapper's overflow-hidden
  // clips the artefact. Tune the negative right value to taste.
  return (
    <>
      <style>{`
        .patina-hero-layer {
          /* <video> and <img> are replaced elements — top/bottom alone
             don't always force the box to fill its absolute-positioned
             container in every browser. Pin explicit width + height
             100% and display:block so the box always covers the parent
             edge-to-edge before object-cover scales the content. */
          position: absolute;
          inset: 0;
          right: -40px;
          width: calc(100% + 40px);
          height: 100%;
          display: block;
          object-fit: cover;
        }
        @media (min-width: 828px) {
          .patina-hero-layer {
            right: 0;
            width: 100%;
          }
        }
      `}</style>
      {/* First-frame poster behind the video — matches each video's
          opening frame exactly, so there's no flash while the video
          buffers. The video paints over it once it has data. */}
      <picture>
        <source media="(max-width: 828px)" srcSet="/patina/hero-poster-mobile.webp" />
        <img
          src="/patina/hero-poster.webp"
          alt=""
          aria-hidden="true"
          className="patina-hero-layer"
        />
      </picture>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="metadata"
        onEnded={handleEnded}
        className="patina-hero-layer"
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
