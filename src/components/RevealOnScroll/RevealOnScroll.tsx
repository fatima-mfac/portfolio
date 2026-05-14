'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface RevealOnScrollProps {
  children: ReactNode;
  /** Optional className applied to the wrapper element. */
  className?: string;
  /** Vertical offset (in px) before the reveal starts. */
  offset?: number;
  /** Animation duration in ms. */
  duration?: number;
  /** Per-block delay in ms. */
  delay?: number;
  /**
   * Negative bottom rootMargin (percent of root height) — the lower this
   * goes, the deeper the block has to scroll in before it reveals.
   * Defaults to 12% so the reveal happens a touch above the fold.
   */
  intersectMargin?: number;
}

function findScrollRoot(el: Element | null): Element | null {
  let node: Element | null = el?.parentElement ?? null;
  while (node) {
    const style = getComputedStyle(node);
    if (
      style.overflowY === 'auto' ||
      style.overflowY === 'scroll' ||
      style.overflowY === 'overlay'
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

/**
 * Wraps a block so it animates into view as the user scrolls. The block
 * starts shifted down and fully transparent, then fades + slides into
 * place the first time it crosses the IntersectionObserver threshold.
 *
 * Picks the nearest scrollable ancestor as the observer root so it works
 * inside the Shell's right-column scroll container (desktop) and inside
 * the mobile-overlay scroll container too. Falls back to the viewport
 * when no scroll ancestor is found.
 */
export function RevealOnScroll({
  children,
  className,
  offset = 28,
  duration = 700,
  delay = 0,
  intersectMargin = 12,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = findScrollRoot(el);
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            obs.disconnect();
            break;
          }
        }
      },
      {
        root,
        rootMargin: `0px 0px -${intersectMargin}% 0px`,
        threshold: 0,
      },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [intersectMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : `translateY(${offset}px)`,
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms cubic-bezier(.2,.8,.2,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
