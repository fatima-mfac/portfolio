'use client';

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent, TransitionEvent } from 'react';

// Fleet dashboard screens shown in the Herc use case. A slide carousel:
// it auto-advances on a slow timer, a hovering mouse pauses it, and a
// horizontal drag (or a dot click) steps between screens.
//
// EXPLORATION — #FFF9EF cream is a hardcoded hex (matches the color
// used in WallpaperScene); promote to a token before merging.
const IMAGES = [
  { src: '/herc/fleet1.webp', alt: 'Fleet utilization dashboard' },
  { src: '/herc/fleet2.webp', alt: 'Fleet management dashboard' },
  { src: '/herc/fleet3.webp', alt: 'Fleet management dashboard' },
] as const;

// Clone the last screen before the first and the first after the last
// so the track can loop seamlessly in both directions: when a slide
// lands on a clone, the position snaps (without animation) to its real
// twin, which shows the identical image.
//   track:  [ fleet3' , fleet1 , fleet2 , fleet3 , fleet1' ]
//   pos:        0         1        2        3         4
const SLIDES = [IMAGES[IMAGES.length - 1], ...IMAGES, IMAGES[0]];
const FIRST_REAL = 1;
const LAST_REAL = IMAGES.length;

// How long each screen holds before advancing, and the slide length.
const HOLD_MS = 5000;
const SLIDE_MS = 700;
// Minimum horizontal pointer travel (px) for a drag to count as a
// navigation gesture rather than a stray click.
const DRAG_THRESHOLD = 40;

/**
 * Fleet dashboard slide carousel on a cream panel. Auto-advances
 * forward (right-to-left); a hovering mouse pauses it; a horizontal
 * drag or a pagination-dot click steps between screens. The seamless
 * loop is handled by the cloned slides at each end of the track.
 */
export function FleetCrossfade() {
  // `pos` indexes SLIDES (0..4); 1..3 are the real screens.
  const [pos, setPos] = useState(FIRST_REAL);
  const [animated, setAnimated] = useState(true);
  const [paused, setPaused] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  // Real image index (0..2) — drives the pagination dots.
  const realIndex =
    (((pos - FIRST_REAL) % IMAGES.length) + IMAGES.length) % IMAGES.length;

  const goForward = () => setPos((p) => Math.min(p + 1, SLIDES.length - 1));
  const goBackward = () => setPos((p) => Math.max(p - 1, 0));
  // Dot click — jump straight to a real screen.
  const goTo = (real: number) => setPos(real + FIRST_REAL);

  // Auto-advance. Re-armed after every position change; suspended while
  // a mouse hovers the panel.
  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(goForward, HOLD_MS);
    return () => window.clearTimeout(id);
  }, [pos, paused]);

  // When a slide lands on a cloned end, snap (without animation) to its
  // real twin so the next move continues seamlessly. requestAnimationFrame
  // re-enables the transition once the no-animation jump has painted.
  const onTransitionEnd = (e: TransitionEvent) => {
    if (e.propertyName !== 'transform') return;
    if (pos !== 0 && pos !== SLIDES.length - 1) return;
    setAnimated(false);
    setPos(pos === 0 ? LAST_REAL : FIRST_REAL);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimated(true)),
    );
  };

  // Pause only for a real mouse hover — touch has no hover state, so
  // gating on pointerType keeps `paused` from sticking on touch.
  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setPaused(true);
  };
  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setPaused(false);
  };

  const onPointerDown = (e: PointerEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
    // Capture so the drag still completes if the pointer leaves the
    // stage mid-gesture. Guarded — setPointerCapture can throw if the
    // pointer was already released.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* not capturable — drag still works without capture */
    }
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = dragStart.current;
    dragStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    // Only a mostly-horizontal drag past the threshold navigates —
    // drag left = next screen, drag right = previous. A vertical drag
    // is ignored so page scrolling isn't hijacked.
    if (Math.abs(dx) > DRAG_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goForward();
      else goBackward();
    }
  };

  return (
    <div
      className="w-full py-[80px] rounded-sm overflow-hidden"
      style={{ backgroundColor: '#FFF9EF' }}
    >
      <div className="mx-auto flex w-[75%] flex-col items-center gap-6">
        {/* Slide stage — clips the track; the grab cursor signals the
            drag affordance. */}
        <div
          className="relative aspect-[1726/1260] w-full cursor-grab select-none overflow-hidden active:cursor-grabbing"
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            dragStart.current = null;
          }}
        >
          <div
            className="flex h-full w-full"
            onTransitionEnd={onTransitionEnd}
            style={{
              transform: `translateX(-${pos * 100}%)`,
              transition: animated
                ? `transform ${SLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : 'none',
              willChange: 'transform',
            }}
          >
            {SLIDES.map((img, i) => {
              const isReal = i >= FIRST_REAL && i <= LAST_REAL;
              return (
                <img
                  key={i}
                  src={img.src}
                  alt={isReal ? img.alt : ''}
                  aria-hidden={!isReal}
                  draggable={false}
                  className="h-full w-full shrink-0 object-contain"
                />
              );
            })}
          </div>
        </div>

        {/* Pagination dots — signal how many screens there are and
            which one is showing; clicking jumps to that screen. */}
        <div className="flex gap-2">
          {IMAGES.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show fleet screen ${i + 1}`}
              aria-current={i === realIndex}
              className={`h-2 w-2 rounded-full transition-colors duration-fast ease-out ${
                i === realIndex ? 'bg-text-primary' : 'bg-text-primary/25'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
