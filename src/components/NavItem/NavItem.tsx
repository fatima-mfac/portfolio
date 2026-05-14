'use client';

import Link from 'next/link';
import type { MouseEventHandler } from 'react';

export type NavItemState = 'default' | 'active';

interface NavItemProps {
  label: string;
  href?: string;
  state?: NavItemState;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export function NavItem({ label, href = '#', state = 'default', className, onClick }: NavItemProps) {
  const color =
    state === 'active'
      ? 'text-text-primary'
      : 'text-text-primary hover:text-text-secondary';

  return (
    <Link
      href={href}
      aria-current={state === 'active' ? 'page' : undefined}
      scroll={false}
      onClick={onClick}
      className={`inline-flex items-center py-1 no-underline transition-colors duration-fast ease-out text-body-lg ${color} ${className ?? ''}`}
    >
      {label}
    </Link>
  );
}
