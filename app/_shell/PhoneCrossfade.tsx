import Image from 'next/image';

// Phone screens to cross-fade through, in order. All four share the
// same 1210x1503 source dimensions.
const IMAGES = [
  { src: '/patina/phone.webp', alt: 'Patina phone — state 1' },
  { src: '/patina/phone2.webp', alt: 'Patina phone — state 2' },
  { src: '/patina/phone3.webp', alt: 'Patina phone — state 3' },
  { src: '/patina/phone4.webp', alt: 'Patina phone — state 4' },
] as const;

// Each image holds for HOLD_SECONDS, so the full loop is
// HOLD_SECONDS * IMAGES.length. FADE_PERCENT is the cross-fade
// duration as a percentage of the full cycle (~0.48s of 12s).
const HOLD_SECONDS = 3;
const CYCLE_SECONDS = HOLD_SECONDS * IMAGES.length;
const HOLD_PER_IMAGE_PERCENT = 100 / IMAGES.length;
const FADE_PERCENT = 4;

/**
 * Four phone screenshots cross-fading on a pure-CSS loop. Image 0 is
 * the base (always opacity 1, never animated); images 1–3 stack on top
 * and each fades in at its slot, stays visible over the previous, then
 * is covered by the next. The top image fades back out at the end of
 * the cycle to reveal image 0 again — so the stage always has a fully
 * opaque image (no half-transparent frames).
 *
 * Pure-CSS cross-fade (no JS). Fills its grid cell (w-full h-full)
 * with aspect-[2190/2720] as a min-height fallback.
 */
export function PhoneCrossfade() {
  return (
    <>
      <style>{phoneCrossfadeKeyframes()}</style>
      <div className="w-full h-full aspect-[2190/2720] rounded-sm relative overflow-hidden">
        {IMAGES.map((img, i) => (
          <div
            key={img.src}
            className={`absolute inset-0 ${i > 0 ? `phone-crossfade-${i}` : ''}`}
            style={{
              opacity: i === 0 ? 1 : 0,
              willChange: i > 0 ? 'opacity' : undefined,
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 768px) 605px, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Builds keyframes for each non-base image:
 *   - hold opacity 0 until just before the image's slot
 *   - fade in over FADE_PERCENT
 *   - MIDDLE images: stay opaque until the NEXT image has fully faded
 *     in over them, then instantly drop to 0 (invisible — the next
 *     image is covering them). Staying 0 to the end means that when
 *     the top image fades out, image 0 — not a stale middle image —
 *     is revealed. This is what fixes the end-of-loop blip.
 *   - the TOP image fades back out at the end of the cycle, revealing
 *     image 0 for a seamless restart.
 */
function phoneCrossfadeKeyframes(): string {
  const lines: string[] = [];
  for (let i = 1; i < IMAGES.length; i++) {
    const enterStart = HOLD_PER_IMAGE_PERCENT * i - FADE_PERCENT;
    const enterEnd = HOLD_PER_IMAGE_PERCENT * i;
    const isTop = i === IMAGES.length - 1;

    let frames: string;
    if (isTop) {
      // Fade in, hold, then fade out at the end → reveals image 0.
      const exitStart = 100 - FADE_PERCENT;
      frames = `
        0% { opacity: 0; }
        ${enterStart}% { opacity: 0; }
        ${enterEnd}% { opacity: 1; }
        ${exitStart}% { opacity: 1; }
        100% { opacity: 0; }`;
    } else {
      // Hold opaque until the next image is fully faded in over this
      // one (coverPoint), then snap to 0 while it's still hidden.
      const coverPoint = HOLD_PER_IMAGE_PERCENT * (i + 1);
      frames = `
        0% { opacity: 0; }
        ${enterStart}% { opacity: 0; }
        ${enterEnd}% { opacity: 1; }
        ${coverPoint}% { opacity: 1; }
        ${coverPoint + 0.01}% { opacity: 0; }
        100% { opacity: 0; }`;
    }

    lines.push(`
      @keyframes phoneCrossfade${i} {${frames}
      }
      .phone-crossfade-${i} {
        animation: phoneCrossfade${i} ${CYCLE_SECONDS}s linear infinite;
      }
    `);
  }
  return lines.join('\n');
}
