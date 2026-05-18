'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  /** Optional explicit destination. If omitted, navigates back in browser history. */
  href?: string;
  /** Accessible label. Defaults to "Go back". */
  ariaLabel?: string;
  className?: string;
}

/**
 * BackButton — Material Design "arrow back" icon button.
 * Used at the top of mobile use-case pages to return to the /work landing.
 */
export function BackButton({ href, ariaLabel = 'Go back', className }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={handleClick}
      className={`self-start inline-flex items-center justify-center p-3 -m-3 text-text-secondary hover:text-text-accent transition-colors duration-fast ease-out ${className ?? ''}`}
    >
      {/* Material Design "arrow_back" icon (24×24) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </svg>
    </button>
  );
}
