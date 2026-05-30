'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Fires a custom Plausible event ("Project Viewed") every time the
 * `?project=<slug>` query param changes to a non-empty value.
 *
 * Why this exists: Plausible auto-tracks pathname changes but ignores
 * query strings. The home (`/`) and About (`/about`) routes use
 * `?project=` to drive the right-column case study selection — without
 * this hook those would all collapse into a single `/` pageview, with
 * no way to see which case study someone opened.
 *
 * Configure the matching goal in Plausible:
 *   Dashboard → Site settings → Goals → "+ Add goal" → Custom event
 *   → Name: `Project Viewed`. The event automatically receives a
 *   `project` custom property carrying the slug
 *   (patina | vodafone | zebra-finch | herc-rentals), filterable in
 *   the dashboard.
 *
 * Renders nothing.
 */
declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> },
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

    window.plausible('Project Viewed', { props: { project } });
  }, [project]);

  return null;
}
