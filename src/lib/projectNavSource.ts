/**
 * Records HOW a visitor opened a case study, so the Plausible
 * `Project Viewed` event can carry a `source` property.
 *
 * The problem: PlausibleProjectTracker fires when the `?project=` URL
 * param changes, but by then the click that caused it is long gone — the
 * tracker can't tell a homepage-card click from a top-nav click. So the
 * click handlers leave a one-shot note here, and the tracker consumes it.
 *
 * Module-level (not React state) on purpose: it's a transient hand-off
 * between a click handler and the very next tracker effect, not UI state.
 *
 * If no note was left (e.g. a direct/shared `/?project=…` link, or a
 * back/forward navigation), `consume` returns 'direct'.
 *
 * Sources:
 *   card   — homepage card stack or the homepage project list
 *   nav    — the desktop top-nav project links
 *   work   — the /work page list
 *   direct — no click marker (shared link, back/forward, etc.)
 */
export type ProjectNavSource = 'card' | 'nav' | 'work' | 'direct';

let pending: ProjectNavSource | null = null;

/** Called by a card / nav click just before it navigates. */
export function markProjectNavSource(source: ProjectNavSource): void {
  pending = source;
}

/** Called by the tracker; returns the pending source once, then resets. */
export function consumeProjectNavSource(): ProjectNavSource {
  const source = pending ?? 'direct';
  pending = null;
  return source;
}

/**
 * The homepage card → case study hero morph.
 *
 * The homepage thumbnail and the case study hero share a view-transition
 * name, so a card click morphs one into the other across the route change.
 * The hero normally fades in on load; arriving through the morph it's
 * already in place, so a card click stamps the time here and the hero
 * skips its own entrance if it mounts within a moment of it.
 *
 * A timestamp rather than a consume-once flag: strict-mode dev renders the
 * hero twice, and a consumed flag would read differently the second time.
 */
let heroMorphAt = -Infinity;
const HERO_MORPH_WINDOW_MS = 1500;

/** Called by a homepage card click that opens a case study. */
export function markHeroMorph(): void {
  heroMorphAt = performance.now();
}

/** True if the current page arrived through the card → hero morph. */
export function arrivedByHeroMorph(): boolean {
  if (typeof window === 'undefined') return false;
  return performance.now() - heroMorphAt < HERO_MORPH_WINDOW_MS;
}

/** The view-transition name pairing a project's thumbnail with its hero. */
export function heroTransitionName(slug: string): string {
  return `project-hero-${slug}`;
}

/**
 * Destination route for a project slug. Patina, Herc, and Vodafone have their
 * own standalone case-study pages, so they route straight there; anything else
 * (currently Zebra Finch) still renders as a v1 use case on the homepage via
 * the `?project=` search param.
 */
const CASE_STUDY_ROUTES: Record<string, string> = {
  patina: '/patina',
  'herc-rentals': '/herc',
  vodafone: '/vodafone',
};

export function projectHref(slug: string): string {
  return CASE_STUDY_ROUTES[slug] ?? `/?project=${slug}`;
}
