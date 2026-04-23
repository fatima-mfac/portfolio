'use client';

export type FilterTagState = 'default' | 'active';

interface FilterTagProps {
  label: string;
  state?: FilterTagState;
  onClick?: () => void;
  className?: string;
}

export function FilterTag({ label, state = 'default', onClick, className }: FilterTagProps) {
  const stateClasses =
    state === 'active'
      ? 'text-text-accent border-border-accent'
      : 'text-text-secondary border-border-tertiary hover:text-text-primary hover:border-border-secondary';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={state === 'active'}
      className={`inline-flex items-center py-1 px-3 bg-transparent border rounded-sm cursor-pointer transition-[color,border-color] duration-fast ease-out text-body-sm ${stateClasses} ${className ?? ''}`}
    >
      {label}
    </button>
  );
}
