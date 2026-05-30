import { Suspense, type ReactNode } from 'react';
import { Shell } from '../_shell/Shell';
import { PlausibleProjectTracker } from '../_shell/PlausibleProjectTracker';

/**
 * Shared layout for the section routes (`/`, `/about`, future `/contact`).
 *
 * Hosting the Shell here means the Header and the right-column slot
 * survive route changes between sections. Only the `children` slot —
 * the left-column content — re-renders when the path changes, so
 * navigating between sections does not flicker the right column.
 * (Section nav links carry no `?project=`; /about ignores it.)
 *
 * Routes outside this group (e.g. `/work`) render under the root layout
 * only and do not get the Shell.
 *
 * Shell reads `?project=` via useSearchParams(), so it must sit inside
 * a Suspense boundary — the static-export build requires it to
 * prerender these routes (Next bails the boundary to client render).
 */
export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      {/* Fires a Plausible "Project Viewed" custom event on every
          ?project= change. Sits inside the same Suspense boundary as
          Shell because it also reads search params. */}
      <PlausibleProjectTracker />
      <Shell>{children}</Shell>
    </Suspense>
  );
}
