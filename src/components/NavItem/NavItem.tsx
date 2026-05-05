'use client';

import Link from 'next/link';

export type NavItemState = 'default' | 'active';

interface NavItemProps {
  label: string;
  href?: string;
  state?: NavItemState;
  className?: string;
}

export function NavItem({ label, href = '#', state = 'default', className }: NavItemProps) {
  const color =
    state === 'active'
      ? 'text-text-accent'
      : 'text-text-secondary hover:text-text-primary';

  return (
    <Link
      href={href}
      aria-current={state === 'active' ? 'page' : undefined}
      scroll={false}
      className={`inline-flex items-center py-1 no-underline transition-colors duration-fast ease-out text-body-md ${color} ${className ?? ''}`}
    >
      {label}
    </Link>
  );
}
