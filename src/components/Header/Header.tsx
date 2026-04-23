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
  activeHref,
  logoHref = '/',
  className,
}: HeaderProps) {
  const baseNavLinks =
    navLinks ?? (breakpoint === 'mobile' ? DEFAULT_NAV_MOBILE : DEFAULT_NAV_DESKTOP);

  const resolvedNavLinks = baseNavLinks.map((link) => ({
    ...link,
    active: link.active ?? link.href === activeHref,
  }));

  const resolvedProjectLinks = projectLinks.map((link) => ({
    ...link,
    active: link.active ?? link.href === activeHref,
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
