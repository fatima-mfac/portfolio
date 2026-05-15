'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { EmailContact } from './EmailContact';

// How far the user scrolls (in viewport-heights) before the description
// is fully faded out and translated to its end position. 0.5 = half a
// viewport of scroll. Tune to taste.
const FADE_DISTANCE_VH = 0.5;

// Maximum upward translation at full progress (px). The text drifts up
// while it fades so the motion has direction.
const TRANSLATE_END_PX = 80;

// Contact links shown below the description.
const LINKEDIN_URL = 'https://www.linkedin.com/in/fatimacunhadesigner/';
const EMAIL = 'allears@fatimacunha.com';

/**
 * Finds the nearest scrollable ancestor. Mirrors the helper in
 * RevealOnScroll so this component works inside the Shell's main scroll
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
 * Centered description for the About hero. Fades opacity 1 → 0 and
 * translates upward as the user scrolls past the hero, so the cards
 * below have a clean stage to enter onto. Runs on the nearest
 * scrollable ancestor — desktop main, mobile window.
 */
export function AboutHeroDescription({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = findScrollRoot(el);

    let frame = 0;
    const compute = () => {
      const scrollTop =
        root === window ? window.scrollY : (root as Element).scrollTop;
      const fadeDistance = window.innerHeight * FADE_DISTANCE_VH;
      const p = Math.min(1, Math.max(0, scrollTop / fadeDistance));
      setProgress(p);
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

  // Mount-time entrance: fade in + subtle zoom from 0.96 → 1.0 over
  // the same duration/easing as the letter-ring spin, so the sentence
  // "settles in" alongside the ring. Lives on an outer wrapper so it
  // composes with the scroll-driven opacity/translate on the <p>
  // (the two transforms stack — wrapper handles scale, inner handles
  // translateY — and the two opacities multiply naturally).
  return (
    <>
      <style>{`
        @keyframes about-description-enter {
          from { opacity: 0; transform: scale(0.98); }
          to   { opacity: 1; transform: scale(1); }
        }
        .about-description-enter {
          animation: about-description-enter 2s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
        }
        @media (prefers-reduced-motion: reduce) {
          .about-description-enter { animation: none; }
        }
      `}</style>
      <div className="about-description-enter">
        {/* Wrapper carries the scroll-driven fade/translate so the
            description AND the contact links move as one unit. */}
        <div
          ref={ref}
          className="flex flex-col items-center gap-16"
          style={{
            opacity: 1 - progress,
            transform: `translateY(${-TRANSLATE_END_PX * progress}px)`,
            willChange: 'opacity, transform',
          }}
        >
          <p className="max-w-[550px] text-center text-heading-lg text-text-primary pointer-events-none">
            {children}
          </p>
          {/* Contact links. LinkedIn is a plain anchor (no ExternalLink,
              so no arrow glyph); the email is a mailto: link paired
              with a separate copy button. pointer-events re-enabled
              here since the fixed backdrop ancestor disables them;
              switched off once the user starts scrolling so faded
              links never catch a stray click. */}
          <nav
            aria-label="Contact"
            className="flex justify-center gap-8 text-metadata-md"
            style={{ pointerEvents: progress > 0.1 ? 'none' : 'auto' }}
          >
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-accent transition-colors duration-fast ease-out no-underline"
            >
              Linkedin
            </a>
            <EmailContact email={EMAIL} />
          </nav>
        </div>
      </div>
    </>
  );
}
