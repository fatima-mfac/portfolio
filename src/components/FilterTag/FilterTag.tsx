'use client';
import styles from './FilterTag.module.css';

export type FilterTagState = 'default' | 'active';

interface FilterTagProps {
  label: string;
  state?: FilterTagState;
  onClick?: () => void;
  className?: string;
}

export function FilterTag({ label, state = 'default', onClick, className }: FilterTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.tag} ${state === 'active' ? styles.active : ''} ${className ?? ''}`}
      aria-pressed={state === 'active'}
    >
      {label}
    </button>
  );
}
