'use client';

import Link from 'next/link';
import type { MouseEventHandler } from 'react';

export type NavItemState = 'default' | 'active';

interface NavItemProps {
  label: string;
  href?: string;
  state?: NavItemState;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export function NavItem({ label, href = '#', state = 'default', className, onClick }: NavItemProps) {
  // Active and hover share one emphasized look: accent-secondary (the
  // hero orange — accent-secondary === background-hero, orange-600)
  // plus a heavier weight. `text-body-lg` bundles a book weight, so
  // `font-medium!` (important) overrides only the weight — size and
  // line-height are untouched, so the heavier text doesn't shift the
  // line metrics.
  // The active nav item is the page the user is already on, so it's
  // shown but made inert — pointer-events-none disables mouse hover
  // and clicks, since clicking the current page is a no-op.
  const stateClasses =
    state === 'active'
      ? 'text-accent-secondary font-medium! pointer-events-none'
      : 'text-text-primary hover:text-accent-secondary hover:font-medium!';

  // inline-grid with both spans in the same cell (grid-area 1/1): the
  // cell sizes to the WIDER of the two — the always-medium ghost — so
  // the item's width is fixed at its bold size and never reflows when
  // the visible label's weight changes on hover/active.
  return (
    <Link
      href={href}
      aria-current={state === 'active' ? 'page' : undefined}
      // Preserve scroll only for in-page `?project=` swaps (homepage overlay).
      // For real route changes (e.g. /patina) let Next scroll to the top — so
      // jumping from the bottom of one use case to another opens it at the top.
      scroll={!href.includes('?')}
      onClick={onClick}
      className={`inline-grid items-center py-1 no-underline whitespace-nowrap transition-colors duration-fast ease-out text-body-lg ${stateClasses} ${className ?? ''}`}
    >
      {/* Visible label — weight follows the Link state (book → medium). */}
      <span className="[grid-area:1/1] justify-self-center">{label}</span>
      {/* Invisible medium-weight ghost — reserves the bold width. */}
      <span
        aria-hidden="true"
        className="[grid-area:1/1] justify-self-center font-medium invisible"
      >
        {label}
      </span>
    </Link>
  );
}
