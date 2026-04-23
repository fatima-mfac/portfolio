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
      className={`inline-flex items-center no-underline transition-colors duration-fast ease-out text-metadata-lg ${color} ${className ?? ''}`}
    >
      {url}
    </a>
  );
}
