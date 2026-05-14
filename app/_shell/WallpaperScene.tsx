import Image from 'next/image';

const PAIRS = [
  {
    video: '/patina/three-phones-1.mp4',
    image: '/patina/three-phones-1.png',
    alt: 'Patina lockscreen — state 1',
  },
  {
    video: '/patina/three-phones-2.mp4',
    image: '/patina/three-phones-2.png',
    alt: 'Patina lockscreen — state 2',
  },
  {
    video: '/patina/three-phones-3.mp4',
    image: '/patina/three-phones-3.png',
    alt: 'Patina lockscreen — state 3',
  },
  {
    video: '/patina/three-phones-4.mp4',
    image: '/patina/three-phones-4.png',
    alt: 'Patina lockscreen — state 4',
  },
] as const;

// Each pair holds for 3s. Four pairs → 12s total cycle. Pair 1 sits at
// the bottom (no animation), and pairs 2/3/4 fade in over it in turn,
// each covering its predecessor. The top pair fades out at the end of
// the cycle so pair 1 is revealed again.
const CYCLE_SECONDS = 12;
const HOLD_PER_PAIR_PERCENT = 25; // 12s / 4 pairs = 25% each
const FADE_PERCENT = 4; // ~480ms fade (of 12s)

/**
 * Two-phone composition cycling through 4 video+image pairs on a pure
 * CSS loop. Pair 1 is the base (always opacity 1, never animated);
 * pairs 2–4 stack on top and each fades in at its slot, stays visible
 * over the previous, then is covered by the next. The top pair fades
 * out at the end of the cycle to reveal pair 1 again, so the screen
 * always has something at opacity 1 (no half-transparent moments).
 */
export function WallpaperScene() {
  return (
    <>
      <style>{wallpaperKeyframes()}</style>
      <div
        className="w-full aspect-[1217/808] rounded-sm relative overflow-hidden"
        style={{ backgroundColor: '#FFF9EF' }}
      >
        {PAIRS.map((p, i) => (
          <div
            key={i}
            className={`absolute inset-0 ${i > 0 ? `wallpaper-overlay-${i}` : ''}`}
            style={{
              opacity: i === 0 ? 1 : 0,
              willChange: i > 0 ? 'opacity' : undefined,
            }}
          >
            {/* RIGHT phone — static lockscreen. Rendered FIRST in DOM
                order so it sits behind the video (which comes next).
                Positioned higher than the video and shifted left so the
                two phones overlap. Offsets are 20px to the right and
                20px down from the base position. */}
            <div className="absolute w-[21.6%] h-[63%]" style={{ top: 'calc(5% + 20px)', left: 'calc(40% + 20px)' }}>
              <Image
                src={p.image}
                alt={p.alt}
                fill
                sizes="(min-width: 768px) 320px, 35vw"
                className="object-contain object-top"
              />
            </div>

            {/* LEFT phone — app UI video. */}
            <div
              className="absolute top-[15%] left-[26.1%] w-[21.06%] h-[63%]"
              style={{
                borderRadius: '24px',
                border: '9px solid rgba(49, 13, 0, 0.07)',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <video
                src={p.video}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute left-0 w-full object-contain object-top"
                style={{
                  top: '-30px',
                  height: 'calc(100% + 60px)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * For each non-base pair, build keyframes that:
 *   - hold opacity 0 until just before the pair's slot
 *   - fade in over FADE_PERCENT
 *   - stay at opacity 1 through its own slot AND every later slot
 *     (so it covers earlier pairs underneath until the next one arrives)
 *   - the TOP pair (pair index = PAIRS.length - 1) fades back to 0 at
 *     the end of the cycle so pair 0 is revealed for the loop restart
 */
function wallpaperKeyframes(): string {
  const lines: string[] = [];
  for (let i = 1; i < PAIRS.length; i++) {
    const enterStart = HOLD_PER_PAIR_PERCENT * i - FADE_PERCENT; // start fade in
    const enterEnd = HOLD_PER_PAIR_PERCENT * i; // fully visible
    const isTop = i === PAIRS.length - 1;
    const exitStart = isTop ? 100 - FADE_PERCENT : null;
    lines.push(`
      @keyframes wallpaperPair${i} {
        0% { opacity: 0; }
        ${enterStart}% { opacity: 0; }
        ${enterEnd}% { opacity: 1; }
        ${exitStart !== null ? `${exitStart}% { opacity: 1; }` : ''}
        100% { opacity: ${isTop ? 0 : 1}; }
      }
      .wallpaper-overlay-${i} {
        animation: wallpaperPair${i} ${CYCLE_SECONDS}s linear infinite;
      }
    `);
  }
  return lines.join('\n');
}
