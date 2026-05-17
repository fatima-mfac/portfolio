'use client';

import { useState } from 'react';

// How long the checkmark confirmation stays after a successful copy.
const COPIED_RESET_MS = 1600;

/** Two-overlapping-rectangles copy glyph. Inherits color via currentColor. */
function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

/** Checkmark shown briefly after a successful copy. */
function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * Email contact with two independent targets sharing one hover group:
 *   - the address text is a mailto: link (opens the mail client)
 *   - the trailing icon is a button that copies the address
 * The icon stays hidden until the group is hovered/focused (its space
 * is always reserved, so revealing it doesn't shift layout). After a
 * successful copy the icon swaps to a checkmark for COPIED_RESET_MS.
 */
export function EmailContact({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // Clipboard API unavailable or blocked — fail silently.
    }
  };

  return (
    <span className="group inline-flex items-center gap-1.5 text-metadata-md">
      <a
        href={`mailto:${email}`}
        className="text-text-secondary hover:text-text-accent transition-colors duration-fast ease-out no-underline"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Email address copied' : `Copy email address ${email}`}
        className={`inline-flex w-[1.2em] h-[1.2em] shrink-0 cursor-pointer appearance-none border-0 bg-transparent p-0 text-text-secondary hover:text-text-accent transition duration-fast ease-out ${
          copied
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
        }`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </span>
  );
}
