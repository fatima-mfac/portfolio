import type { ReactNode } from 'react';
import { Shell } from '../_shell/Shell';

/**
 * Shared layout for the section routes (`/`, `/about`, future `/contact`).
 *
 * Hosting the Shell here means the Header and the right-column slot
 * survive route changes between sections. Only the `children` slot —
 * the left-column content — re-renders when the path changes, so
 * navigating from `/?project=patina` to `/about?project=patina` does
 * not flicker the right column.
 *
 * Routes outside this group (e.g. `/work`) render under the root layout
 * only and do not get the Shell.
 */
export default function ShellLayout({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>;
}
