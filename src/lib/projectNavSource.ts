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
