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

  // Header hide state. On use-case and About pages the header slides out
  // of view on scroll-down and back on scroll-up; the homepage header is
  // always shown. The header is position:sticky, so hiding it (a
  // translate) never shifts the content below.
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

  // Hide the header on scroll-down, reveal on scroll-up — use-case and
  // About pages only; the homepage header is always shown. Window scroll
  // is the mobile scroll source; on desktop the shell doesn't scroll the
  // window, so the header simply stays put there. headerHidden resets on
  // every navigation so a fresh page always opens with the header shown.
  useEffect(() => {
    setHeaderHidden(false);
    if (showHomeStack) return;
    let last = window.scrollY;
    const onScroll = () => {
      const current = window.scrollY;
      if (Math.abs(current - last) < 5) return;
      setHeaderHidden(current > last && current > 60);
      last = current;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [showHomeStack, pathname, project]);

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
    <div className={`flex flex-col ${
      showHomeStack
        ? 'h-screen overflow-hidden'
        : 'min-h-screen md:h-screen md:overflow-hidden'
    } ${showHomeStack || isAbout ? '' : 'bg-white'}`}>
      <div className={`mx-auto w-full px-4 md:px-0 flex flex-col relative ${
        showHomeStack ? 'flex-1 min-h-0' : 'md:flex-1 md:min-h-0'
      }`}>
        {/* Header area — position:sticky so it pins to the top while the
            page scrolls. On use-case/About it slides out of view on
            scroll-down (translateY) and back on scroll-up; an opaque bg
            keeps content from showing through where it pins. */}
        <div
          className={`sticky top-0 z-10 ${
            isAbout ? 'bg-background-primary' : showHomeStack ? '' : 'bg-white'
          }`}
          onWheel={handleHeaderWheel}
          style={{
            transform: `translateY(${
              !headerEntered ? '-16px' : headerHidden ? '-100%' : '0'
            })`,
            opacity: headerEntered ? 1 : 0,
            transition:
              'opacity 600ms ease-out, transform 300ms cubic-bezier(.2,.8,.2,1)',
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
          // pt-3 seats the back button just below the sticky header —
          // it cancels the BackButton's -m-3 so the hit area starts
          // flush with the header and the icon clears it by 12px.
          <main className="md:hidden flex flex-col gap-8 pt-3">
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
