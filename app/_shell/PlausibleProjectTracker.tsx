'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * On every `?project=<slug>` change, fires two Plausible events:
 *
 *   1. A `Project Viewed` custom event (with `project` custom prop) —
 *      surfaces in the Goals + Properties views so you can see counts
 *      per case study.
 *   2. A manual pageview with the full URL — surfaces in Top Pages so
 *      each case study (`/?project=patina`, `/?project=vodafone`, …)
 *      gets its own row with a per-page Time-on-page metric. Plausible's
 *      auto-tracker only watches pathname changes, so without this every
 *      project would collapse into a single `/` row with combined time.
 *
 * Trade-off: on initial cold load to `/?project=patina`, Plausible's
 * auto-tracker fires `/` and we also fire `/?project=patina`, producing
 * one extra pageview per visit. Negligible at this traffic level, and
 * the gain (per-project Time-on-page) is worth it.
 *
 * Configure the matching goal in Plausible:
 *   Dashboard → Site settings → Goals → "+ Add goal" → Custom event
 *   → Name: `Project Viewed`.
 *
 * Renders nothing.
 */
declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: {
        props?: Record<string, string | number | boolean>;
        u?: string;
      },
    ) => void;
  }
}

export function PlausibleProjectTracker() {
  const searchParams = useSearchParams();
  const project = searchParams.get('project');

  useEffect(() => {
    if (!project) return;
    if (typeof window === 'undefined') return;
    if (typeof window.plausible !== 'function') return;

    // Custom event — for Goals breakdown per project slug.
    window.plausible('Project Viewed', { props: { project } });
    // Manual pageview — so each project URL gets its own Top Pages row
    // with Time-on-page. `u` overrides the URL Plausible records.
    window.plausible('pageview', { u: window.location.href });
  }, [project]);

  return null;
}
