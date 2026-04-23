import { NavItem } from '../NavItem/NavItem';
import { ExternalLink } from '../ExternalLink/ExternalLink';
import styles from './Header.module.css';

export type HeaderBreakpoint = 'desktop' | 'mobile';

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

interface ProjectLink {
  url: string;
  href: string;
  active?: boolean;
}

interface HeaderProps {
  breakpoint?: HeaderBreakpoint;
  navLinks?: NavLink[];
  projectLinks?: ProjectLink[];
  logoHref?: string;
  className?: string;
}

const DEFAULT_NAV: NavLink[] = [
  { label: 'Index', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const DEFAULT_PROJECTS: ProjectLink[] = [
  { url: 'patinascreen.com', href: 'https://patinascreen.com' },
  { url: 'somefont.com', href: 'https://somefont.com' },
  { url: 'someproject.com', href: 'https://someproject.com' },
  { url: 'anotherproject.io', href: 'https://anotherproject.io' },
];

export function Header({
  breakpoint = 'desktop',
  navLinks = DEFAULT_NAV,
  projectLinks = DEFAULT_PROJECTS,
  logoHref = '/',
  className,
}: HeaderProps) {
  return (
    <header className={`${styles.header} ${className ?? ''}`}>
      <div className={styles.logoAndNav}>
        <a href={logoHref} className={styles.logo} aria-label="Home">
          <div className={styles.logoMark} />
        </a>
        <nav className={styles.nav} aria-label="Primary navigation">
          {navLinks.map((link) => (
            <NavItem
              key={link.href}
              label={link.label}
              href={link.href}
              state={link.active ? 'active' : 'default'}
            />
          ))}
        </nav>
      </div>

      {breakpoint === 'desktop' && projectLinks.length > 0 && (
        <div className={styles.projectLinks}>
          {projectLinks.map((link) => (
            <ExternalLink
              key={link.href}
              url={link.url}
              href={link.href}
              state={link.active ? 'active' : 'default'}
            />
          ))}
        </div>
      )}
    </header>
  );
}
