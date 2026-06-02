'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { consumeProjectNavSource } from '../../src/lib/projectNavSource';

/**
 * On every `?project=<slug>` change, fires two Plausible events:
 *
 *   1. A `Project Viewed` custom event (with `project` custom prop) —
 *      surfaces in the Goals + Properties views so you can see counts
 *      per case study.
 *   2. A manual pageview with a SYNTHETIC pathname (`/project/<slug>`) —
 *      surfaces in Top Pages so each case study gets its own row with a
 *      per-page Time-on-page metric.
 *
 *      Why synthetic instead of the real URL? Plausible's Top Pages
 *      groups by pathname and strips query strings before aggregating,
 *      so reporting `/?project=patina` (the real URL) still collapses
 *      to `/`. We pass `url: <origin>/project/<slug>` so Plausible sees
 *      a distinct pathname per project and lists them separately. The
 *      browser URL itself is unchanged — only the URL we report.
 *
 *      Note the option key is `url` (the documented API param for the
 *      pa-*.js script); it serializes to `u` on the wire. Passing `u`
 *      directly is silently ignored.
 *
 * Trade-off: Plausible's auto pageview capture is intentionally left ON
 * (the safety net — basic analytics keep working even if this component
 * breaks). That means each project view fires TWICE: the auto `/` plus
 * our synthetic `/project/<slug>`. Accepted: it inflates total pageviews
 * and lowers bounce rate, but keeps per-project Time-on-page without
 * making us the single point of failure for all tracking.
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
        url?: string;
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

    // Custom event — for Goals breakdown per project slug. `source`
    // records how they got here (card / nav / work / direct), filterable
    // in the Properties view.
    const source = consumeProjectNavSource();
    window.plausible('Project Viewed', { props: { project, source } });
    // Manual pageview with a synthetic path — Plausible strips query
    // strings before grouping, so `/?project=patina` would still bucket
    // into `/`. `/project/<slug>` is a unique pathname that survives
    // the strip and shows up as its own Top Pages row with its own
    // Time-on-page.
    window.plausible('pageview', {
      url: `${window.location.origin}/project/${project}`,
    });
  }, [project]);

  return null;
}
