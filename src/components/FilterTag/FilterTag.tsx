'use client';

export type FilterTagState = 'default' | 'active';

interface FilterTagProps {
  label: string;
  state?: FilterTagState;
  onClick?: () => void;
  className?: string;
}

/** Specs per Figma component "FilterTag" (28:184):
 *  – padding: 8px L/R. Desktop (≥lg) uses symmetric 6/6 vertical;
 *    mobile uses 7/5 — a 1px nudge down because BL Melody's metrics
 *    leave the glyph slightly above the line-box centre at phone
 *    sizes even with `leading-none!`.
 *  – line-height collapsed to 1 (via `leading-none!`) so the line-box
 *    equals the font-size.
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
      className={`inline-flex items-center pt-[7px] pb-[5px] lg:py-1.5 px-2 border rounded-lg cursor-pointer transition-[color,border-color,background-color] duration-fast ease-out text-body-lg leading-none! ${stateClasses} ${className ?? ''}`}
    >
      {label}
    </button>
  );
}
