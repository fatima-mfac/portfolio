'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { NavItem } from '../NavItem/NavItem';

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
  logoHref?: string;
  className?: string;
}

const DEFAULT_NAV_DESKTOP: NavLink[] = [
  { label: 'Index', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const DEFAULT_NAV_MOBILE: NavLink[] = [
  { label: 'Index', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const DEFAULT_PROJECTS: ProjectLink[] = [
  { label: 'Patina', slug: 'patina' },
  { label: 'Vodafone', slug: 'vodafone' },
  { label: 'Zebra Finch', slug: 'zebra-finch' },
  { label: 'Herc Rentals', slug: 'herc-rentals' },
];

/**
 * Header — site nav with two independent halves:
 *   • Left primary nav (Index / About / Contact) — selects the section
 *     (left column on desktop). Clicking preserves the current `?project=`
 *     so the right column stays intact when switching sections.
 *   • Right project links (Patina / Vodafone / …) — selects the right
 *     column via `?project=`. Clicking preserves the current pathname.
 */
export function Header({
  breakpoint = 'desktop',
  navLinks,
  projectLinks = DEFAULT_PROJECTS,
  logoHref = '/',
  className,
}: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const project = searchParams.get('project');

  const baseNavLinks =
    navLinks ?? (breakpoint === 'mobile' ? DEFAULT_NAV_MOBILE : DEFAULT_NAV_DESKTOP);

  // Left nav: navigate to link.href, preserving current ?project= so the
  // right column keeps its selected project.
  const buildNavHref = (href: string) => (project ? `${href}?project=${project}` : href);

  // Right project nav: stay on the current pathname, change ?project=.
  const buildProjectHref = (slug: string) => `${pathname}?project=${slug}`;

  const homeHref = project ? `${logoHref}?project=${project}` : logoHref;

  return (
    <header
      className={`flex flex-row items-center justify-between w-full bg-transparent ${className ?? ''}`}
    >
      <div className="flex flex-row items-center gap-6">
        <Link
          href={homeHref}
          aria-label="Home"
          scroll={false}
          className="flex items-center no-underline"
        >
          {/* TODO: replace with <Logo /> atom once synced from Figma. */}
          <div className="w-6 h-6 bg-text-primary rounded-[2px]" />
        </Link>
        <nav aria-label="Primary navigation" className="flex flex-row items-center gap-6">
          {baseNavLinks.map((link) => {
            const isActive = link.active ?? pathname === link.href;
            return (
              <NavItem
                key={link.href}
                label={link.label}
                href={buildNavHref(link.href)}
                state={isActive ? 'active' : 'default'}
              />
            );
          })}
        </nav>
      </div>

      {breakpoint === 'desktop' && projectLinks.length > 0 && (
        <nav aria-label="Project links" className="flex flex-row items-center gap-6">
          {projectLinks.map((link) => {
            const isActive = link.active ?? project === link.slug;
            return (
              <NavItem
                key={link.slug}
                label={link.label}
                href={buildProjectHref(link.slug)}
                state={isActive ? 'active' : 'default'}
              />
            );
          })}
        </nav>
      )}
    </header>
  );
}
