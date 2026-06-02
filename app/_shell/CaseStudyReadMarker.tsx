'use client';

import { useEffect, useRef } from 'react';

export type ReadDepth = 'middle' | 'end';

/**
 * Fires a Plausible `Case Study Read` event (props: `project`, `depth`)
 * the first time its sentinel scrolls into view — used to measure how far
 * into a case study a visitor actually gets, beyond just opening it.
 *
 * Place TWO per case study:
 *   - `depth="middle"` roughly halfway through the content → "read a good
 *      chunk" (most people never reach the literal bottom)
 *   - `depth="end"` as the last child → "read it all"
 *
 * Each is a 1px invisible sentinel observed against the viewport, so it
 * works whether the right column scrolls (desktop) or the window does
 * (mobile overlay). Fires once per mount; switching projects unmounts and
 * remounts the case study, resetting the guard per view. Plausible dedupes
 * the goal's Visitors count per person even if it fires twice.
 *
 * Configure in Plausible: Settings → Goals → + Add → Custom event →
 * `Case Study Read`, then allowlist the `project` and `depth` properties.
 */
export function CaseStudyReadMarker({
  project,
  depth,
}: {
  project: string;
  depth: ReadDepth;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let fired = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || fired) continue;
          fired = true;
          if (typeof window.plausible === 'function') {
            window.plausible('Case Study Read', { props: { project, depth } });
          }
          observer.disconnect();
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [project, depth]);

  return <div ref={ref} aria-hidden="true" className="h-px w-full" />;
}
