// About — full-bleed hero composition.
// Figma source: node 241:10213.
// The six letters of FÁTIMA sit on a perfect circle around the page
// center. The section is pinned to the viewport (position: fixed) so
// the circle can use the FULL viewport height — not just the area
// below the header — which lets the radius grow significantly while
// keeping every letter fully visible at any resolution.
// The header (rendered by Shell, z-10) stays on top of this layer so
// the logo and nav remain clickable.

const DESCRIPTION =
  'Senior product designer, 18 years, most of it through consultancy on B2B and B2C products like Vodafone, PizzaHut, NOS, Herc Rentals, Pizza Hut, and Sonae.';

// Each letter's position on the ring is given by `angle` (degrees,
// measured clockwise from 12 o'clock, so -90° = top, 0° = right, 90° =
// bottom). `rotate` is the per-letter rotation taken from the Figma —
// preserved verbatim so the scattered/falling feel of the original
// composition survives the responsive re-layout.
const LETTERS: Array<{ ch: string; angle: number; rotate: number }> = [
  { ch: 'F', angle: -90, rotate:    0    },
  { ch: 'Á', angle: -30, rotate:  54.88  },
  { ch: 'T', angle:  30, rotate: 125.89  },
  { ch: 'I', angle:  90, rotate:    0    },
  { ch: 'M', angle: 150, rotate: -117.86 },
  { ch: 'A', angle: 210, rotate: -63.95  },
];

export default function AboutPage() {
  return (
    <section
      aria-label="About"
      // `--ring-radius` is a single value (perfect circle). It maxes
      // out at whichever viewport axis is smaller, less ~60px to leave
      // room for the letter itself:
      //   • `min(45vw, calc(50dvh - 60px))` — the tightest of the two
      //     halves of the viewport, minus a buffer
      //   • clamped to [140, 460] so it stays sensible on tiny + huge
      //     screens
      style={{ ['--ring-radius' as string]: 'clamp(140px, min(45vw, calc(50dvh - 60px)), 460px)' }}
      className="fixed inset-0 overflow-hidden bg-background-primary"
    >
      {LETTERS.map(({ ch, angle, rotate }) => (
        <span
          key={`${ch}-${angle}`}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 text-display-2xl text-text-on-dark select-none pointer-events-none"
          style={{
            transform: `translate(-50%, -50%) translate(calc(cos(${angle}deg) * var(--ring-radius)), calc(sin(${angle}deg) * var(--ring-radius))) rotate(${rotate}deg)`,
          }}
        >
          {ch}
        </span>
      ))}

      <div className="absolute inset-0 flex items-center justify-center px-6">
        <p className="max-w-[600px] text-center text-heading-lg text-text-primary">
          {DESCRIPTION}
        </p>
      </div>
    </section>
  );
}
