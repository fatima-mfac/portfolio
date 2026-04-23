'use client';
import styles from './NavItem.module.css';

export type NavItemState = 'default' | 'active';

interface NavItemProps {
  label: string;
  href?: string;
  state?: NavItemState;
  className?: string;
}

export function NavItem({ label, href = '#', state = 'default', className }: NavItemProps) {
  return (
    <a
      href={href}
      className={`${styles.navItem} ${state === 'active' ? styles.active : ''} ${className ?? ''}`}
      aria-current={state === 'active' ? 'page' : undefined}
    >
      {label}
    </a>
  );
}
