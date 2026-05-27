export type ExternalLinkState = 'default' | 'active';

interface ExternalLinkProps {
  url: string;
  href?: string;
  state?: ExternalLinkState;
  className?: string;
}

export function ExternalLink({ url, href, state = 'default', className }: ExternalLinkProps) {
  const color =
    state === 'active'
      ? 'text-text-accent'
      : 'text-text-primary hover:text-text-accent';

  return (
    <a
      href={href ?? `https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`self-start inline-flex items-center gap-1 no-underline transition-colors duration-fast ease-out text-metadata-md ${color} ${className ?? ''}`}
    >
      {url}
      {/* Arrow-up-right glyph — signals the link opens in a new tab.
          Sized in `em` so it tracks the link's font-size; stroke uses
          currentColor so it inherits the default/hover color. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[0.85em] h-[0.85em] shrink-0"
      >
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
      </svg>
    </a>
  );
}
