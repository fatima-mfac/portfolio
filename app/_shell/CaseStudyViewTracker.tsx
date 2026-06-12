'use client';

import { useEffect } from 'react';
import { consumeProjectNavSource } from '../../src/lib/projectNavSource';

/**
 * Fires the Plausible `Project Viewed` custom event (props: `project`,
 * `source`) once on mount for a standalone case-study route (/patina,
 * /vodafone, /herc).
 *
 * Why this exists: PlausibleProjectTracker only runs inside the (shell)
 * layout and keys off `?project=`, so it covers the homepage overlay
 * (currently just Zebra Finch) — NOT these dedicated pages. Without this,
 * the `Project Viewed` goal and its card/nav/work source breakdown would
 * silently miss the three main case studies.
 *
 * `source` is read from the one-shot marker left by the card/nav/work
 * click handler (consumeProjectNavSource), so attribution still works.
 * No synthetic pageview is needed here — unlike the `?project=` overlay,
 * the real pathname (`/patina`) already gives each page its own Top Pages
 * row with per-page Time-on-page. Plausible's auto pageview stays on.
 *
 * Renders nothing.
 */
export function CaseStudyViewTracker({ project }: { project: string }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof window.plausible !== 'function') return;
    const source = consumeProjectNavSource();
    window.plausible('Project Viewed', { props: { project, source } });
  }, [project]);

  return null;
}
