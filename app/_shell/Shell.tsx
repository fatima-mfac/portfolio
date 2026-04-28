'use client';

import type { ReactNode, ComponentType } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { Header } from '../../src/components/Header/Header';
import { BackButton } from '../../src/components/BackButton/BackButton';
import { HomeHero } from './HomeHero';
import { PatinaContent } from './PatinaContent';

/** Map of project slugs to the component rendered in the right column. */
const PROJECT_COMPONENTS: Record<string, ComponentType> = {
  patina: PatinaContent,
  // future: vodafone, zebra-finch, herc-rentals
};

interface ShellProps {
  /** The left-column content for this route. */
  children: ReactNode;
  /**
   * Mobile-only: when true, the page is shown as a full-bleed overlay
   * with a back button and the project content (right column) takes the
   * whole screen. Used by the home route when `?project=` is set so
   * mobile visitors get the use-case overlay.
   */
  mobileOverlayWhenProjectSet?: boolean;
}

/**
 * Shell — the shared two-column layout used by every section route
 * (`/`, `/about`, future `/contact`).
 *
 * The LEFT column renders the page's `children`.
 * The RIGHT column renders the project component selected by the
 * `?project=` search param, or `HomeHero` as the default. Because both
 * columns derive from the URL, navigating between sections (e.g. /
 * → /about) preserves the right-column selection automatically.
 */
export function Shell({ children, mobileOverlayWhenProjectSet = false }: ShellProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const project = searchParams.get('project');

  const RightContent = project && PROJECT_COMPONENTS[project] ? PROJECT_COMPONENTS[project] : HomeHero;
  const showMobileOverlay = mobileOverlayWhenProjectSet && Boolean(project);

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-background-primary flex flex-col">
      <div className="mx-auto w-full max-w-[1680px] px-4 md:px-5 pt-8 flex flex-col md:flex-1 md:min-h-0">
        {/* Desktop header — always shown on desktop. */}
        <div className="hidden md:block">
          <Header breakpoint="desktop" />
        </div>

        {/* Mobile header — hidden when the page is a project overlay. */}
        {!showMobileOverlay && (
          <div className="md:hidden">
            <Header breakpoint="mobile" />
          </div>
        )}

        {/* Mobile flow */}
        {showMobileOverlay ? (
          <main className="md:hidden flex flex-col gap-8">
            <BackButton href="/work" ariaLabel="Back to Work" />
            <RightContent />
          </main>
        ) : (
          <main className="md:hidden mt-12 flex flex-col gap-8">{children}</main>
        )}

        {/* Desktop flow — two columns, each scrolls independently. */}
        <main
          aria-label={pathname}
          className="hidden md:grid md:grid-cols-[370px_1fr] md:gap-12 md:flex-1 md:min-h-0 md:mt-12"
        >
          <div
            className="
              flex flex-col gap-8
              h-full overflow-y-auto pr-2 pb-8
              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            "
          >
            {children}
          </div>
          <div
            className="
              flex flex-col gap-12
              h-full overflow-y-auto pb-8
              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            "
          >
            <RightContent />
          </div>
        </main>
      </div>
    </div>
  );
}
