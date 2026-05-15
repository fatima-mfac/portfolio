'use client';

import { useEffect, useRef, useState } from 'react';

// Total rotation across the full scrollable distance (degrees). At
// scroll = 0 the ring sits at 0°; at scroll = max it has turned by
// SCROLL_ROTATION_DEG. Positive = clockwise. Tune to taste.
const SCROLL_ROTATION_DEG = 180;

export interface AboutLetter {
  ch: string;
  /** Angle on the ring in degrees, measured clockwise from 12 o'clock. */
  angle: number;
  /** Per-letter rotation taken from Figma — preserved verbatim. */
  rotate: number;
}

/**
 * Finds the nearest scrollable ancestor. Mirrors RevealOnScroll's
 * helper so this component works inside the Shell's main scroll
 * container (desktop) and falls back to the window on mobile.
 */
function findScrollRoot(el: Element | null): Element | Window {
  let node: Element | null = el?.parentElement ?? null;
  while (node) {
    const style = getComputedStyle(node);
    if (
      style.overflowY === 'auto' ||
      style.overflowY === 'scroll' ||
      style.overflowY === 'overlay'
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return window;
}

/**
 * Rotates the FÁTIMA letter ring as a rigid wheel based on the user's
 * scroll progress through the page. Lives on an inner wrapper so the
 * outer .about-ring-spinner mount animation (one-time -360° spin-in)
 * can still play — the two transforms compose.
 *
 * The per-letter Figma rotation (`rotate` field) is preserved on each
 * span so individual letter orientations don't change during the spin.
 */
export function AboutLetterRing({ letters }: { letters: AboutLetter[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = findScrollRoot(el);

    let frame = 0;
    const compute = () => {
      let scrollTop: number;
      let scrollMax: number;
      if (root === window) {
        scrollTop = window.scrollY;
        scrollMax =
          document.documentElement.scrollHeight - window.innerHeight;
      } else {
        const node = root as Element;
        scrollTop = node.scrollTop;
        scrollMax = node.scrollHeight - node.clientHeight;
      }
      const progress = scrollMax > 0 ? scrollTop / scrollMax : 0;
      setRotation(progress * SCROLL_ROTATION_DEG);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        compute();
      });
    };

    compute();
    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      root.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', compute);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="absolute inset-0"
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: '50% 50%',
        willChange: 'transform',
      }}
    >
      {letters.map(({ ch, angle, rotate }) => (
        <span
          key={`${ch}-${angle}`}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 text-display-2xl text-text-on-dark select-none pointer-events-none"
          style={{
            transform: `translate(-50%, -50%) translate(calc(cos(${angle}deg) * var(--ring-radius)), calc(sin(${angle}deg) * var(--ring-radius))) rotate(${rotate}deg)`,
          }}
        >
          {ch}
        </span>
      ))}
    </div>
  );
}
