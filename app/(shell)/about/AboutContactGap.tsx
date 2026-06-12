'use client';

import { useEffect, useRef, useState } from 'react';

// Mobile-only safeguard for the spacer that sits between the hero and
// the first Q&A card.
//
// The CV / Linkedin contact line is vertically centred in the fixed
// backdrop, so where it lands depends on how many lines the description
// wraps to — which varies with viewport width/height. The first card
// peeks above the fold at a FIXED offset (the base spacer's
// `100dvh-345px`), so on short/narrow phones, where the wrapped
// description pushes the contact line down, the peeking card can crowd
// or overlap it.
//
// This measures the contact line's bottom and the first card's top in a
// scroll-independent (document) frame, and grows an extra spacer only
// when the gap would fall below MIN_GAP_PX. When there's already enough
// room — and always on desktop — the extra stays 0 and the base
// spacer's designed height is untouched.
const MIN_GAP_PX = 32;
// Matches the cards container's mobile `mt-10` — the gap between the
// spacer stack and the first card.
const CARDS_MARGIN_TOP_PX = 40;

export function AboutContactGap() {
  const baseRef = useRef<HTMLDivElement>(null);
  const [extra, setExtra] = useState(0);

  useEffect(() => {
    const base = baseRef.current;
    if (!base) return;
    const mobile = window.matchMedia('(max-width: 767px)');

    const measure = () => {
      if (!mobile.matches) {
        setExtra(0);
        return;
      }
      // Only meaningful at rest: the contact line is a fixed element
      // that fades + drifts up on scroll, so a mid-scroll measure would
      // read a position the user never overlaps anyway. Skip it and keep
      // the at-rest value.
      if (window.scrollY > 4) return;
      const nav = document.getElementById('about-contact');
      if (!nav) return;
      // Document-frame Y (scroll-independent). The base spacer is in
      // normal flow; the nav lives in a fixed backdrop, so at scrollY 0
      // its viewport rect already equals its document position.
      const baseCardTop =
        base.getBoundingClientRect().bottom + window.scrollY + CARDS_MARGIN_TOP_PX;
      const navBottom = nav.getBoundingClientRect().bottom + window.scrollY;
      setExtra(Math.max(0, Math.round(navBottom + MIN_GAP_PX - baseCardTop)));
    };

    measure();
    // Re-measure once the hero entrance animation settles and web fonts
    // load — both change where the wrapped contact line lands.
    const settle = window.setTimeout(measure, 2600);
    window.addEventListener('resize', measure);
    mobile.addEventListener('change', measure);
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener('resize', measure);
      mobile.removeEventListener('change', measure);
    };
  }, []);

  return (
    <>
      <div
        ref={baseRef}
        className="h-[calc(100dvh-345px)] md:h-[calc(100dvh-265px)]"
        aria-hidden="true"
      />
      <div aria-hidden="true" style={{ height: extra }} />
    </>
  );
}
