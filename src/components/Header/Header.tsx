import { NavItem } from '../NavItem/NavItem';

export type HeaderBreakpoint = 'desktop' | 'mobile';

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

interface ProjectLink {
  label: string;
  href: string;
  active?: boolean;
}

interface HeaderProps {
  breakpoint?: HeaderBreakpoint;
  navLinks?: NavLink[];
  projectLinks?: ProjectLink[];
  /**
   * Active href for the primary nav (Index/About/Contact). Use this on
   * project pages to keep "Index" active while a project is open on the right.
   */
  activeNavHref?: string;
  /** Active href for the right-side project links (Patina/Vodafone/etc.). */
  activeProjectHref?: string;
  /**
   * Fallback active href applied to both nav and project links.
   * Prefer `activeNavHref` and `activeProjectHref` for explicit control.
   */
  activeHref?: string;
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
  { label: 'Patina', href: '/patina' },
  { label: 'Vodafone', href: '/vodafone' },
  { label: 'Zebra Finch', href: '/zebra-finch' },
  { label: 'Herc Rentals', href: '/herc-rentals' },
];

export function Header({
  breakpoint = 'desktop',
  navLinks,
  projectLinks = DEFAULT_PROJECTS,
  activeNavHref,
  activeProjectHref,
  activeHref,
  logoHref = '/',
  className,
}: HeaderProps) {
  const baseNavLinks =
    navLinks ?? (breakpoint === 'mobile' ? DEFAULT_NAV_MOBILE : DEFAULT_NAV_DESKTOP);

  const resolvedNavActive = activeNavHref ?? activeHref;
  const resolvedProjectActive = activeProjectHref ?? activeHref;

  const resolvedNavLinks = baseNavLinks.map((link) => ({
    ...link,
    active: link.active ?? link.href === resolvedNavActive,
  }));

  const resolvedProjectLinks = projectLinks.map((link) => ({
    ...link,
    active: link.active ?? link.href === resolvedProjectActive,
  }));

  return (
    <header
      className={`flex flex-row items-center justify-between w-full bg-transparent ${className ?? ''}`}
    >
      <div className="flex flex-row items-center gap-6">
        <a href={logoHref} aria-label="Home" className="flex items-center no-underline">
          {/* TODO: replace with <Logo /> atom once synced from Figma (figma-code-sync-components) */}
          <div className="w-6 h-6 bg-text-primary rounded-[2px]" />
        </a>
        <nav aria-label="Primary navigation" className="flex flex-row items-center gap-6">
          {resolvedNavLinks.map((link) => (
            <NavItem
              key={link.href}
              label={link.label}
              href={link.href}
              state={link.active ? 'active' : 'default'}
            />
          ))}
        </nav>
      </div>

      {breakpoint === 'desktop' && resolvedProjectLinks.length > 0 && (
        <nav aria-label="Project links" className="flex flex-row items-center gap-6">
          {resolvedProjectLinks.map((link) => (
            <NavItem
              key={link.href}
              label={link.label}
              href={link.href}
              state={link.active ? 'active' : 'default'}
            />
          ))}
        </nav>
      )}
    </header>
  );
}
