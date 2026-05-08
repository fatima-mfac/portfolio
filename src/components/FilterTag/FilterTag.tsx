'use client';

export type FilterTagState = 'default' | 'active';

interface FilterTagProps {
  label: string;
  state?: FilterTagState;
  onClick?: () => void;
  className?: string;
}

/** Specs per Figma component "FilterTag" (28:184):
 *  – padding: 12px L/R, 2px top, 4px bottom (asymmetric for optical centre)
 *  – border-radius: 8px (rounded-lg)
 *  – text: body-lg (BL Melody Regular 14/20, letter-spacing -0.02em)
 *  – default: primary text + primary border, transparent fill
 *  – hover:   secondary text + secondary border
 *  – active:  on-dark text + hero-coloured border, filled with hero bg
 */
export function FilterTag({ label, state = 'default', onClick, className }: FilterTagProps) {
  const isActive = state === 'active';
  const stateClasses = isActive
    ? 'text-text-on-dark'
    : 'text-text-primary border-border-primary bg-transparent hover:text-text-secondary hover:border-border-secondary';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      style={
        isActive
          ? {
              backgroundColor: 'var(--color-background-hero)',
              borderColor: 'var(--color-background-hero)',
            }
          : undefined
      }
      className={`inline-flex items-center pt-[2px] pb-[4px] px-3 border rounded-lg cursor-pointer transition-[color,border-color,background-color] duration-fast ease-out text-body-lg ${stateClasses} ${className ?? ''}`}
    >
      {label}
    </button>
  );
}
