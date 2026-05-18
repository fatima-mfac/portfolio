'use client';

import type { ReactNode, ComponentType } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { Header } from '../../src/components/Header/Header';
import { BackButton } from '../../src/components/BackButton/BackButton';
import { Screensaver } from '../../src/components/Screensaver/Screensaver';
import { HomeHero } from './HomeHero';
import { HomeStack } from './HomeStack';
import { PatinaContent } from './PatinaContent';
import { VodafoneContent } from './VodafoneContent';
import { ZebraFinchContent } from './ZebraFinchContent';
import { HercRentalsContent } from './HercRentalsContent';

/** Map of project slugs to the component rendered in the right column. */
const PROJECT_COMPONENTS: Record<string, ComponentType> = {
  patina: PatinaContent,
  vodafone: VodafoneContent,
  'zebra-finch': ZebraFinchContent,
  'herc-rentals': HercRentalsContent,
};

interface ShellProps {
  /** The left-column content for this route. */
  children: ReactNode;
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
 *
 * On mobile, when `?project=` is set on the home route (`/`) the page
 * collapses to a full-bleed project overlay with a back button. Other
 * sections keep showing their own content on mobile regardless of
 * `?project=` (the project state is only visible on desktop).
 */
export function Shell({ children }: ShellProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const project = searchParams.get('project');

  const RightContent = project && PROJECT_COMPONENTS[project] ? PROJECT_COMPONENTS[project] : HomeHero;
  const showMobileOverlay = pathname === '/' && Boolean(project);
  // EXPLORATION (homepage v3) — scroll-locked card stack on `/` with no project.
  const showHomeStack = pathname === '/' && !project;
  // About is a full-bleed single-page composition — the two-column shell
  // doesn't apply. ?project= is ignored on this route.
  const isAbout = pathname === '/about';

  // Each column scrolls to top only when its own content changes:
  //   left column  → on pathname change (section nav: Index/About/Contact)
  //   right column → on ?project= change (project nav: Patina/Vodafone/…)
  // Other column's scroll position is left alone.
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  // Desktop /about scroll container — used to compact the header when
  // cards scroll into the header's vertical band.
  const aboutMainRef = useRef<HTMLElement>(null);
  const [aboutCompactHeader, setAboutCompactHeader] = useState(false);

  useEffect(() => {
    leftColRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    rightColRef.current?.scrollTo({ top: 0 });
  }, [project]);

  // Auto-hide header on scroll-down, reveal on scroll-up — desktop only,
  // tracking the right-column scroll. On mobile the header stays put: a
  // collapsing in-flow header shifts everything below it jarringly.
  const [headerHidden, setHeaderHidden] = useState(false);

  // First-paint entrance — header drops in from above + fades in,
  // matching the card-slide easing. Held until the homepage headline
  // motion finishes (~delay 0.35s + duration 0.5s + per-word stagger),
  // so the sequence reads: headline reveals → header + cards arrive.
  const [headerEntered, setHeaderEntered] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setHeaderEntered(true), 1100);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = rightColRef.current;
    if (!el) return;
    let last = el.scrollTop;
    const onScroll = () => {
      const current = el.scrollTop;
      if (Math.abs(current - last) < 5) return;
      setHeaderHidden(current > last && current > 50);
      last = current;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Compact-header trigger for /about on desktop. When cards have
  // scrolled far enough that they start crossing into the header's
  // vertical band, swap the desktop header for the mobile-breakpoint
  // variant (drops the project nav on the right, keeps logo + primary
  // nav on the left). Threshold is "scrolled more than ~half a
  // viewport" so the swap fires right around when the first card hits
  // the header.
  useEffect(() => {
    if (!isAbout) return;
    const el = aboutMainRef.current;
    if (!el) return;
    const threshold = () => window.innerHeight * 0.45;
    const onScroll = () => {
      setAboutCompactHeader(el.scrollTop > threshold());
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [isAbout]);

  // The header is its own (non-scrollable) element above the columns,
  // so a wheel gesture over the header band has nothing to scroll.
  // Forward it to the page's active scroll container: the /about main,
  // or — for the two-column layouts — whichever column the cursor sits
  // over horizontally (falling back to the right/content column).
  const handleHeaderWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isAbout) {
      aboutMainRef.current?.scrollBy({ top: e.deltaY });
      return;
    }
    for (const col of [rightColRef.current, leftColRef.current]) {
      if (!col) continue;
      const rect = col.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right) {
        col.scrollBy({ top: e.deltaY });
        return;
      }
    }
    rightColRef.current?.scrollBy({ top: e.deltaY });
  };

  return (
    <>
    <Screensaver />
    <div className={`min-h-screen md:h-screen md:overflow-hidden flex flex-col ${showHomeStack || isAbout ? '' : 'bg-white'}`}>
      <div className="mx-auto w-full px-4 md:px-0 flex flex-col md:flex-1 md:min-h-0 relative">
        {/* Header area — collapses to zero height on scroll-down so columns
            extend to the top of the browser; reveals on scroll-up. The
            grid-template-rows 1fr↔0fr trick gives a smooth height transition. */}
        <div
          className="grid relative z-10"
          onWheel={handleHeaderWheel}
          style={{
            gridTemplateRows: headerHidden ? 'minmax(0,0fr)' : 'minmax(0,1fr)',
            transform: headerEntered ? 'translateY(0)' : 'translateY(-16px)',
            opacity: headerEntered ? 1 : 0,
            transition:
              'grid-template-rows 200ms ease-out, opacity 600ms ease-out, transform 600ms cubic-bezier(.2,.8,.2,1)',
            willChange: 'opacity, transform',
          }}
          aria-hidden={headerHidden ? true : undefined}
        >
          <div className="overflow-hidden pt-6 md:px-8">
            <div className="hidden md:block">
              {/* On /about, swap to the mobile-breakpoint header once
                  cards have scrolled up into the header band. */}
              <Header breakpoint={isAbout && aboutCompactHeader ? 'mobile' : 'desktop'} />
            </div>
            {!showMobileOverlay && (
              <div className="md:hidden">
                <Header breakpoint="mobile" />
              </div>
            )}
            {/* Spacer below header — collapses with the header on scroll
                so columns reach the top edge. */}
            <div className="h-6" />
          </div>
        </div>

        {/* Home stack — single main spanning mobile + desktop so only
            ONE HomeStack instance mounts. The component handles its
            own responsive layout internally. */}
        {showHomeStack ? (
          <main
            aria-label={pathname}
            className="flex-1 min-h-0 md:px-5"
          >
            <HomeStack />
          </main>
        ) : null}

        {/* About — full-bleed single-page composition. The page owns the
            entire main area (no two-column shell, no right column). On
            desktop the main absolute-fills the inner wrapper so its
            scroll viewport extends all the way to the top edge of the
            screen — cards then scroll up behind the transparent header
            and disappear at the actual viewport edge (not at the
            header's bottom). On mobile the document scrolls naturally
            so the main is a plain block. */}
        {isAbout ? (
          <main
            ref={aboutMainRef}
            aria-label={pathname}
            className="flex-1 min-h-0 md:absolute md:inset-0 md:px-5 md:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {children}
          </main>
        ) : null}

        {/* Mobile flow (non-home, non-about) */}
        {!showHomeStack && !isAbout && (showMobileOverlay ? (
          // -mt-4 pulls the back button up 16px into the empty header
          // scaffolding above (pt-6 + h-6 ≈ 48px), landing it ~32px
          // from the top of the screen.
          <main className="md:hidden flex flex-col gap-8 -mt-4">
            <BackButton href="/work" ariaLabel="Back to Work" />
            <RightContent />
          </main>
        ) : (
          <main className="md:hidden flex flex-col gap-8">{children}</main>
        ))}

        {/* Desktop flow — two columns, each scrolls independently.
            EXPLORATION: when a project is selected on home, render only
            the project content centered (no left column) so it gets the
            full viewport width. */}
        {!showHomeStack && !isAbout && (showMobileOverlay ? (
          <main
            aria-label={pathname}
            className="hidden md:flex md:flex-col md:items-center md:flex-1 md:min-h-0"
          >
            <div
              ref={rightColRef}
              className="
                w-full md:px-20
                flex flex-col gap-12
                h-full overflow-y-auto pb-8
                [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
              "
            >
              <RightContent />
            </div>
          </main>
        ) : (
          <main
            aria-label={pathname}
            className="hidden md:grid md:grid-cols-[370px_1fr] md:gap-5 md:flex-1 md:min-h-0 md:px-20"
          >
            <div
              ref={leftColRef}
              className="
                flex flex-col gap-8
                h-full overflow-y-auto pb-8
                [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
              "
            >
              {children}
            </div>
            <div
              ref={rightColRef}
              className="
                flex flex-col gap-12
                h-full overflow-y-auto pb-8
                [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
              "
            >
              <RightContent />
            </div>
          </main>
        ))}
      </div>
    </div>
    </>
  );
}
