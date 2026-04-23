import styles from './ExternalLink.module.css';

export type ExternalLinkState = 'default' | 'active';

interface ExternalLinkProps {
  url: string;
  href?: string;
  state?: ExternalLinkState;
  className?: string;
}

export function ExternalLink({ url, href, state = 'default', className }: ExternalLinkProps) {
  return (
    <a
      href={href ?? `https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.link} ${state === 'active' ? styles.active : ''} ${className ?? ''}`}
    >
      {url}
    </a>
  );
}
