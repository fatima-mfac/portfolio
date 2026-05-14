'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const LETTERS = [
  { char: 'p', angle: 0 },
  { char: 'a', angle: 60 },
  { char: 'n', angle: 120 },
  { char: 'i', angle: 180 },
  { char: 't', angle: 240 },
  { char: 'a', angle: 300 },
];

// EXPLORATION — tints applied to the photo via mix-blend multiply each tick.
const TINTS = ['#ffffff', '#fff099', '#ffd400', '#ff8c1a', '#ed4a18', '#cc1e0e'];

const ROTATION_MS = 900;
const HOLD_MS = 3000;
const STEP_DEG = 60;

/**
 * EXPLORATION — patina hero animation. Landscape photo with a 6-letter ring
 * that ticks 60° clockwise on each beat, and a multiply tint that cycles
 * through warm tones to mirror the wallpaper-tinting concept.
 */
export function PatinaHeroAnimation() {
  const ringRef = useRef<HTMLDivElement>(null);
  const tintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let tintIndex = 0;
    let rotation = 0;
    let cancelled = false;
    const timers: number[] = [];

    const tick = () => {
      if (cancelled) return;
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          tintIndex = (tintIndex + 1) % TINTS.length;
          rotation += STEP_DEG;
          if (ringRef.current) {
            ringRef.current.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
          }
          if (tintRef.current) {
            tintRef.current.style.backgroundColor = TINTS[tintIndex];
          }
          timers.push(window.setTimeout(tick, ROTATION_MS));
        }, HOLD_MS),
      );
    };

    timers.push(window.setTimeout(tick, 600));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="@container w-full aspect-[1217/700] relative rounded-sm overflow-hidden">
      <Image
        src="/patina/landscape.jpg"
        alt=""
        fill
        sizes="(min-width: 768px) 1217px, 100vw"
        className="object-cover"
        priority={false}
      />
      <div
        ref={tintRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: TINTS[0],
          mixBlendMode: 'multiply',
          transition: 'background-color 0.9s cubic-bezier(.6,.05,.4,.95)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.35) 100%)',
        }}
      />
      <div
        ref={ringRef}
        className="absolute left-1/2 top-1/2 w-0 h-0"
        style={{
          transform: 'translate(-50%, -50%) rotate(0deg)',
          transition: 'transform 0.9s cubic-bezier(.7, 0, .2, 1)',
        }}
      >
        {LETTERS.map((l, i) => (
          <span
            key={i}
            className="absolute left-0 top-0 leading-none font-normal"
            style={{
              color: '#fff',
              fontSize: 'clamp(2.5rem, 7.5cqi, 6rem)',
              letterSpacing: '-0.01em',
              textShadow: '0 2px 14px rgba(0,0,0,.25)',
              transform: `translate(-50%, -50%) rotate(${l.angle}deg) translateY(-24cqi)`,
            }}
          >
            {l.char}
          </span>
        ))}
      </div>
    </div>
  );
}
