'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { NavItem } from '../NavItem/NavItem';
import { markProjectNavSource } from '../../lib/projectNavSource';

export type HeaderBreakpoint = 'desktop' | 'mobile';

interface NavLink {
  label: string;
  href: string;
  /** Optional override for the active state. */
  active?: boolean;
}

interface ProjectLink {
  label: string;
  /** Slug used in the `?project=` search param (e.g. "patina"). */
  slug: string;
  /** Optional override for the active state. */
  active?: boolean;
}

interface HeaderProps {
  breakpoint?: HeaderBreakpoint;
  navLinks?: NavLink[];
  projectLinks?: ProjectLink[];
  className?: string;
  /** Experimental: vertical nav. The primary nav (Index/About) stacks
   *  centered, inline to the right of the logo; the project/use-case nav
   *  stacks right-aligned on the far right. Off by default. */
  stacked?: boolean;
}

const DEFAULT_NAV_DESKTOP: NavLink[] = [
  { label: 'Index', href: '/' },
  { label: 'About', href: '/about' },
];

const DEFAULT_NAV_MOBILE: NavLink[] = [
  { label: 'Index', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
];

const DEFAULT_PROJECTS: ProjectLink[] = [
  { label: 'Patina', slug: 'patina' },
  { label: 'Zebra Finch', slug: 'zebra-finch' },
  { label: 'Vodafone', slug: 'vodafone' },
  { label: 'Herc Rentals', slug: 'herc-rentals' },
];

/**
 * Header — site nav with two independent halves:
 *   • Left primary nav (Index / About / Contact) — selects the section.
 *     Links go to their bare path; no `?project=` is carried over, since
 *     projects only render on the homepage.
 *   • Right project links (Patina / Vodafone / …) — selects the right
 *     column via `?project=`. Clicking preserves the current pathname.
 */
export function Header({
  breakpoint = 'desktop',
  navLinks,
  projectLinks = DEFAULT_PROJECTS,
  className,
  stacked = false,
}: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const project = searchParams.get('project');

  const baseNavLinks =
    navLinks ?? (breakpoint === 'mobile' ? DEFAULT_NAV_MOBILE : DEFAULT_NAV_DESKTOP);

  // Left nav links go to their bare path — no ?project= is carried over.
  // Projects only render on the homepage; /about ignores the param and
  // /work is a standalone route, so preserving it would only litter the
  // URL (e.g. /about?project=zebra-finch) with no effect. Jumping into a
  // project from these pages is handled by the right project nav below.

  // Right project nav: stay on the current pathname, change ?project=.
  // EXCEPT /about — projects live on the homepage, so clicking a project
  // from About jumps back to `/?project=…` (About is its own standalone page).
  const buildProjectHref = (slug: string) =>
    pathname === '/about' ? `/?project=${slug}` : `${pathname}?project=${slug}`;

  // Reset handler for the Index nav item — returns to the bare homepage
  // and resets HomeStack state. The <Link> itself does the soft (client)
  // navigation; this also guards against the App Router occasionally
  // wedging on a query-only change (`/?project=…` → `/`), which leaves
  // Index dead and stuck on the use-case URL. If a beat after the click
  // the URL hasn't moved at all, force a hard navigation home.
  const handleHomeReset = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('homeStack:focusedIdx');
    window.dispatchEvent(new Event('homeStack:reset'));
    const urlAtClick = window.location.pathname + window.location.search;
    window.setTimeout(() => {
      const url = window.location.pathname + window.location.search;
      // URL unchanged and still not the bare homepage → the soft nav
      // wedged (it isn't the user navigating elsewhere). Force it.
      if (url !== '/' && url === urlAtClick) {
        window.location.href = '/';
      }
    }, 300);
  };

  return (
    <header
      className={`flex flex-row w-full bg-transparent justify-between ${
        stacked ? 'items-start' : 'items-center'
      } ${className ?? ''}`}
    >
      <div className={`flex flex-row gap-6 ${stacked ? 'items-start' : 'items-center'}`}>
        {/* Brand mark — not a link; the Index nav item is the homepage
            affordance. */}
        <img src="/logo.svg" alt="Fátima Cunha" className="w-8 h-auto" />
        <nav
          aria-label="Primary navigation"
          className={`flex ${
            stacked ? 'flex-col items-center -space-y-1' : 'flex-row items-center gap-6'
          }`}
        >
          {baseNavLinks.map((link) => {
            // Index (href '/') is active on the bare homepage. When
            // a project is selected the page is a use case, so no
            // left-nav item should read as active. The active link is
            // also made non-clickable in NavItem (pointer-events-none)
            // so clicking the current page's nav item is a no-op.
            const isActive =
              link.active ??
              (link.href === '/'
                ? pathname === '/' && !project
                : pathname === link.href);
            return (
              <NavItem
                key={link.href}
                label={link.label}
                href={link.href}
                state={isActive ? 'active' : 'default'}
                onClick={link.href === '/' ? handleHomeReset : undefined}
              />
            );
          })}
        </nav>
      </div>

      {breakpoint === 'desktop' && projectLinks.length > 0 && (
        <nav
          aria-label="Project links"
          className={`flex ${
            stacked ? 'flex-col items-end -space-y-1' : 'flex-row items-center gap-6'
          }`}
        >
          {projectLinks.map((link) => {
            // A project is "active" only while it's actually on screen —
            // the home route with that ?project=. On /about the param is
            // carried in the URL but ignored, so no project reads active.
            const isActive =
              link.active ?? (pathname === '/' && project === link.slug);
            return (
              <NavItem
                key={link.slug}
                label={link.label}
                href={buildProjectHref(link.slug)}
                state={isActive ? 'active' : 'default'}
                onClick={() => markProjectNavSource('nav')}
              />
            );
          })}
        </nav>
      )}
    </header>
  );
}
