// Fleet dashboard screens cross-fading on a pure-CSS loop (no JS).
// True cross-fade — the outgoing image fades out while the incoming
// one fades in, over the cream panel.

const IMAGES = [
  { src: '/herc/fleet1.png', alt: 'Fleet utilization dashboard' },
  { src: '/herc/fleet2.png', alt: 'Fleet management dashboard' },
  { src: '/herc/fleet3.png', alt: 'Fleet management dashboard' },
] as const;

// Each image holds for HOLD_SECONDS; the loop is HOLD * count. FADE_PCT
// is the cross-fade duration as a percentage of the full cycle.
const HOLD_SECONDS = 3;
const CYCLE_SECONDS = HOLD_SECONDS * IMAGES.length;
const HOLD_PCT = 100 / IMAGES.length;
const FADE_PCT = 5;

/** Trim a percentage to 3 decimals (100/3 etc. are non-terminating). */
const pct = (v: number): string => `${Number(v.toFixed(3))}`;

/**
 * Fleet dashboard on a cream panel, cross-fading through three views.
 * The panel auto-sizes its height: py-[80px] guarantees an 80px cream
 * margin above and below the images at every viewport (a fixed panel
 * height can't — the image height tracks the column width). The
 * crossfade stage is 92% of the panel width, aspect-matched to the
 * source images so each fills it.
 *
 * EXPLORATION — #FFF9EF cream is a hardcoded hex (matches the colour
 * used in WallpaperScene); promote to a token before merging.
 */
export function FleetCrossfade() {
  return (
    <>
      <style>{fleetCrossfadeKeyframes()}</style>
      <div
        className="w-full py-[80px] rounded-sm overflow-hidden"
        style={{ backgroundColor: '#FFF9EF' }}
      >
        {/* Crossfade stage — 92% of the panel width, aspect matched to
            the fleet images (1726x1260) so each one fills it exactly. */}
        <div className="relative mx-auto w-[75%] aspect-[1726/1260]">
          {IMAGES.map((img, i) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              className={`absolute inset-0 w-full h-full object-contain fleet-crossfade-${i}`}
              style={{ opacity: i === 0 ? 1 : 0, willChange: 'opacity' }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * Per-image keyframes for the looping cross-fade. Each image holds
 * opaque through its HOLD_PCT slot, then cross-fades with the next at
 * the slot boundary (outgoing 1→0 while incoming 0→1 over FADE_PCT).
 * Image 0 also fades back in across the 100%/0% wrap, so the loop has
 * no seam.
 */
function fleetCrossfadeKeyframes(): string {
  const lines: string[] = [];
  for (let i = 0; i < IMAGES.length; i++) {
    const slotStart = i * HOLD_PCT;
    const slotEnd = (i + 1) * HOLD_PCT;
    let frames: string;
    if (i === 0) {
      frames = `
        0% { opacity: 1; }
        ${pct(slotEnd - FADE_PCT)}% { opacity: 1; }
        ${pct(slotEnd)}% { opacity: 0; }
        ${pct(100 - FADE_PCT)}% { opacity: 0; }
        100% { opacity: 1; }`;
    } else {
      frames = `
        0% { opacity: 0; }
        ${pct(slotStart - FADE_PCT)}% { opacity: 0; }
        ${pct(slotStart)}% { opacity: 1; }
        ${pct(slotEnd - FADE_PCT)}% { opacity: 1; }
        ${pct(slotEnd)}% { opacity: 0; }
        100% { opacity: 0; }`;
    }
    lines.push(`
      @keyframes fleetCrossfade${i} {${frames}
      }
      .fleet-crossfade-${i} {
        animation: fleetCrossfade${i} ${CYCLE_SECONDS}s linear infinite;
      }
    `);
  }
  return lines.join('\n');
}
