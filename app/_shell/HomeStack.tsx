'use client';

import gsap from 'gsap';
import Link from 'next/link';
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ProjectCard } from '../../src/components/ProjectCard/ProjectCard';
import { FilterTag } from '../../src/components/FilterTag/FilterTag';

/**
 * EXPLORATION — homepage v3.
 * A scroll-locked vertical "wheel" of cards. Wheel/touch input snaps the
 * deck forward or backward by one card. Slots stay in fixed viewport
 * positions — there is no sliding/dragging motion.
 *
 * The focused card's label + heading swap with a per-word GSAP stagger
 * (port of Codrops Text Block Transitions demo 6): outgoing words pivot
 * up-right with a quick power1.in (yPercent 0 → -125, rotation 0 → 3°,
 * stagger 0.02s); incoming words swing in from below-left with a slow
 * back-eased curve (yPercent 125 → 0, rotation -3 → 0). The two tweens
 * overlap so the new text is mostly arriving while the old is leaving.
 *
 * The page background takes the focused card's project tint and bleeds
 * across the entire viewport (under the Shell header).
 */

type Category = 'Product Thinking' | 'Visual Craft' | 'Complex Systems' | 'AI Native';

const CATEGORIES: Category[] = [
  'Complex Systems',
  'Product Thinking',
  'AI Native',
];

type ProjectSlug = 'patina' | 'vodafone' | 'herc-rentals' | 'zebra-finch';

type Card = {
  id: string;
  project: ProjectSlug;
  label: string;
  description: string;
  image: string;
  categories: Category[];
  bg: string;
};

// EXPLORATION — copy/imagery placeholder; iterate with Fatima.
const CARDS: Card[] = [
  {
    id: 'intro',
    project: 'patina',
    label: 'FATIMA CUNHA',
    description: 'After 18 years in agency and consultancy, I quit to explore, build an app, and an agentic design system.',
    image: '/patina/phone-card.png',
    categories: ['Product Thinking', 'AI Native'],
    bg: '#F0F0F5',
  },
  {
    id: 'patina-1',
    project: 'patina',
    label: 'APP PATINA',
    description: 'I built an app to make us put our phone down. I had the idea, designed it, built it and shipped it.',
    image: '/patina/phone-card.png',
    categories: ['Product Thinking', 'AI Native'],
    bg: '#F0F0F5',
  },
  {
    id: 'patina-2',
    project: 'patina',
    label: 'APP PATINA',
    description: 'Took on the challenge of changing two of the most persistent human behaviours. Still measuring if it works.',
    image: '/patina/phone-card.png',
    categories: ['Product Thinking'],
    bg: '#F0F0F5',
  },
  {
    id: 'herc-1',
    project: 'herc-rentals',
    label: 'APP HERC RENTALS',
    description: 'Created a visual system to represent different equipment, with multiple states on a map.',
    image: '/herc/phone-card.png',
    categories: ['Visual Craft', 'Complex Systems'],
    bg: '#F0F0F5',
  },
  {
    id: 'vodafone-1',
    project: 'vodafone',
    label: 'VODAFONE',
    description: 'Took on the challenge of changing two of the most persistent human behaviours. Still measuring if it works.',
    image: '/vodafone/phone-networks.png',
    categories: ['Complex Systems'],
    bg: '#F0F0F5',
  },
  {
    id: 'zebra-1',
    project: 'zebra-finch',
    label: 'ZEBRA FINCH',
    description: 'I built an app to make us put our phone down. I had the idea, designed it, built it and shipped it. Solo, end to end.',
    image: '/patina/phone-card.png',
    categories: ['Product Thinking', 'Visual Craft'],
    bg: '#F0F0F5',
  },
  {
    id: 'patina-3',
    project: 'patina',
    label: 'APP PATINA',
    description: 'Took on the challenge of changing two of the most persistent human behaviours. Still measuring if it works.',
    image: '/patina/phone-card.png',
    categories: ['Visual Craft'],
    bg: '#F0F0F5',
  },
  {
    id: 'herc-2',
    project: 'herc-rentals',
    label: 'APP HERC RENTALS',
    description: 'Created a visual system to represent different equipment, with multiple states on a map.',
    image: '/herc/phone-gradient.png',
    categories: ['Visual Craft', 'Complex Systems'],
    bg: '#F0F0F5',
  },
  {
    id: 'vodafone-2',
    project: 'vodafone',
    label: 'VODAFONE',
    description: 'Making a deeply technical concept feel safe and obvious to someone who just wants their Wi-Fi to work.',
    image: '/vodafone/phone-qr.png',
    categories: ['Product Thinking', 'Complex Systems'],
    bg: '#F0F0F5',
  },
  {
    id: 'patina-4',
    project: 'patina',
    label: 'APP PATINA',
    description: 'I built an app to make us put our phone down. I had the idea, designed it, built it and shipped it.',
    image: '/patina/phone-card.png',
    categories: ['Product Thinking', 'AI Native'],
    bg: '#F0F0F5',
  },
  {
    id: 'herc-3',
    project: 'herc-rentals',
    label: 'APP HERC RENTALS',
    description: 'Created a visual system to represent different equipment, with multiple states on a map.',
    image: '/herc/equipment-phone.png',
    categories: ['Complex Systems'],
    bg: '#F0F0F5',
  },
];

const SMALL_H = 90;
// Fallback height for the focused hero before its real height is measured.
const BIG_H_FALLBACK = 240;
const GAP = 8;
// Larger gap between the focused hero and the adjacent small cards
// (above and below) — so the big copy reads as a distinct moment.
const FOCUS_GAP = 40;
const SMALL_STEP = SMALL_H + GAP;
const FOCUS_Y_RATIO = 0.32;
const SLOTS_ABOVE = 3;
const SLOTS_BELOW = 4;
// Vertical offset of the focused content above focusY so the heading
// (not the label) lines up with the top filter chip; the small label
// "APP PATINA" then sits above the filters.
// Equals label line-height (22px) + mt-2 gap (8px).
const FOCUS_LABEL_OFFSET = 30;
const WHEEL_THROTTLE_MS = 380;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/** Renders text as a sequence of word spans (`.word` inside `.word-wrap`)
 *  matching the Codrops/Splitting.js structure so GSAP can target words. */
function SplitWords({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <div className={className} style={style}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span
            className="word-wrap"
            style={{ display: 'inline-block' }}
          >
            <span className="word" style={{ display: 'inline-block' }}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </div>
  );
}

function FocusedContent({
  card,
  refEl,
  mobile = false,
}: {
  card: Card;
  refEl: React.RefObject<HTMLElement | null>;
  mobile?: boolean;
}) {
  const headingFont = mobile ? 32 : 56;
  const headingLine = mobile ? '36px' : '60px';
  // Cards without a project link (e.g. the homepage intro) render as
  // a static block — no hover colour change, no navigation.
  const isStatic = card.id === 'intro';

  const labelEl = (
    <SplitWords
      text={card.label}
      className={`text-text-primary uppercase tracking-[0.16em] font-medium ${
        isStatic
          ? ''
          : 'transition-colors duration-fast ease-out group-hover:text-[var(--color-background-hero)]'
      }`}
      style={{
        fontSize: 11,
        lineHeight: '22px',
        fontFamily: 'var(--font-family-mono)',
      }}
    />
  );
  const headingEl = (
    <SplitWords
      text={card.description}
      className={`mt-2 font-medium text-text-primary ${
        isStatic
          ? ''
          : 'transition-colors duration-fast ease-out group-hover:text-[var(--color-background-hero)]'
      }`}
      style={{
        fontSize: headingFont,
        lineHeight: headingLine,
        letterSpacing: '-2px',
      }}
    />
  );

  if (isStatic) {
    return (
      <div
        ref={refEl as React.RefObject<HTMLDivElement | null>}
        className="block max-w-[940px]"
      >
        {labelEl}
        {headingEl}
      </div>
    );
  }

  return (
    <Link
      ref={refEl as React.RefObject<HTMLAnchorElement | null>}
      href={`/?project=${card.project}`}
      className="block max-w-[940px] group"
    >
      {labelEl}
      {headingEl}
    </Link>
  );
}

export function HomeStack() {
  const [filter, setFilter] = useState<Category | null>(null);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerH, setContainerH] = useState(800);
  // Measured height of the focused (entering) content — drives the position
  // of the cards below so the visible gap is exactly FOCUS_GAP, regardless
  // of how many lines the heading wraps to.
  const [focusedH, setFocusedH] = useState(BIG_H_FALLBACK);
  const lastInputRef = useRef(0);

  const filteredCards = useMemo(
    () => (filter ? CARDS.filter((c) => c.categories.includes(filter)) : CARDS),
    [filter],
  );

  // Track previous focused card so we can render the "leaving" element
  // while the new "entering" element animates in.
  const [leavingCard, setLeavingCard] = useState<Card | null>(null);
  // Direction of the most recent focus change: 1 = scroll down (next card),
  // -1 = scroll up (previous card). Drives the GSAP transition's symmetry —
  // forward = words leave up-right + new arrive from below-left;
  // backward mirrors that.
  const [direction, setDirection] = useState<1 | -1>(1);
  const enteringRef = useRef<HTMLElement | null>(null);
  const leavingRef = useRef<HTMLElement | null>(null);
  // Mobile renders a separate copy of the focused content so GSAP can
  // animate the visible words on either breakpoint.
  const enteringRefMobile = useRef<HTMLElement | null>(null);
  const leavingRefMobile = useRef<HTMLElement | null>(null);
  const prevFocusedCardRef = useRef<Card | null>(null);
  const prevFocusedIdxRef = useRef<number>(0);

  // Reset focus to top only when the filter VALUE actually changes
  // (not on the initial render, and not when strict-mode dev re-runs
  // effects — both of which would otherwise wipe the restored focus).
  const prevFilterRef = useRef<Category | null>(filter);
  useEffect(() => {
    if (prevFilterRef.current === filter) return;
    prevFilterRef.current = filter;
    setFocusedIdx(0);
    prevFocusedCardRef.current = null;
    prevFocusedIdxRef.current = 0;
    setLeavingCard(null);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('homeStack:focusedIdx', '0');
    }
  }, [filter]);

  // Restore focused card from sessionStorage on mount so browser-back
  // from a project page lands on the same card the user left.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem('homeStack:focusedIdx');
    if (stored === null) return;
    const idx = parseInt(stored, 10);
    if (!Number.isNaN(idx) && idx >= 0 && idx < CARDS.length) {
      setFocusedIdx(idx);
      prevFocusedCardRef.current = CARDS[idx];
      prevFocusedIdxRef.current = idx;
    }
  }, []);

  // Allow the header logo (or any other affordance) to reset the deck
  // back to the first card via a window event — works even when the
  // logo Link doesn't trigger a navigation (because user is already on `/`).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onReset = () => {
      setFocusedIdx(0);
      prevFocusedCardRef.current = null;
      prevFocusedIdxRef.current = 0;
      setLeavingCard(null);
      sessionStorage.removeItem('homeStack:focusedIdx');
    };
    window.addEventListener('homeStack:reset', onReset);
    return () => window.removeEventListener('homeStack:reset', onReset);
  }, []);

  // Explicit setter that both updates state AND persists. Used by all
  // user-initiated changes (wheel, touch, keyboard, small-card click).
  // We avoid an auto-persist useEffect because in strict-mode dev it
  // would fire with the initial render's stale focusedIdx=0 closure,
  // overwriting any restored value back to zero.
  const setFocusedIdxAndPersist = (next: number) => {
    setFocusedIdx(next);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('homeStack:focusedIdx', String(next));
    }
  };

  useLayoutEffect(() => {
    const update = () => {
      if (containerRef.current) setContainerH(containerRef.current.clientHeight);
    };
    update();
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const focused = filteredCards[focusedIdx];

  // Measure the entering focused content so cards below sit exactly
  // FOCUS_GAP below it.
  useLayoutEffect(() => {
    const el = enteringRef.current;
    if (!el) return;
    const measure = () => setFocusedH(el.offsetHeight);
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, [focused.id]);

  // When focused card changes, snapshot the previous one as "leaving" and
  // capture the scroll direction so the GSAP timeline can mirror itself.
  // On mount (no prev), animate the initial focused content's words in
  // with the same forward "entering" tween so the page never lands on a
  // static block of text.
  useLayoutEffect(() => {
    const prev = prevFocusedCardRef.current;
    const prevIdx = prevFocusedIdxRef.current;
    prevFocusedCardRef.current = focused;
    prevFocusedIdxRef.current = focusedIdx;
    if (!prev) {
      // Mount — animate entering words with the forward direction
      // (same motion as scrolling down would produce). Whisper-subtle.
      const enteringEls = [enteringRef.current, enteringRefMobile.current].filter(Boolean) as HTMLAnchorElement[];
      if (enteringEls.length === 0) return;
      const words = enteringEls.flatMap((el) => Array.from(el.querySelectorAll<HTMLElement>('.word')));
      gsap.fromTo(
        words,
        {
          willChange: 'transform, opacity',
          transformOrigin: '0% 50%',
          yPercent: 8,
          opacity: 0,
        },
        {
          duration: 0.35,
          ease: 'power2.out',
          yPercent: 0,
          opacity: 1,
          stagger: { each: 0.007, from: 'start' },
        },
      );
      return;
    }
    if (prev.id === focused.id) return;
    setDirection(focusedIdx >= prevIdx ? 1 : -1);
    setLeavingCard(prev);
  }, [focused, focusedIdx]);

  useLayoutEffect(() => {
    if (!leavingCard) return;
    const enteringEls = [enteringRef.current, enteringRefMobile.current].filter(Boolean) as HTMLAnchorElement[];
    const leavingEls = [leavingRef.current, leavingRefMobile.current].filter(Boolean) as HTMLAnchorElement[];
    if (enteringEls.length === 0 || leavingEls.length === 0) return;

    const enteringWords = enteringEls.flatMap((el) => Array.from(el.querySelectorAll<HTMLElement>('.word')));
    const leavingWords = leavingEls.flatMap((el) => Array.from(el.querySelectorAll<HTMLElement>('.word')));

    // Direction-aware values. Travel is small but enough to read the
    // direction. Stagger flips with scroll direction so the motion
    // sweeps the same way as the deck.
    const d = direction;
    const leavingY = -16 * d; // dir=1 → up; dir=-1 → down
    const enteringStartY = 16 * d; // dir=1 → from below; dir=-1 → from above
    const staggerFrom: 'start' | 'end' = d === 1 ? 'start' : 'end';

    const tl = gsap.timeline({
      defaults: { duration: 0.05, ease: 'expo' },
      onComplete: () => setLeavingCard(null),
    });

    tl.fromTo(
      leavingWords,
      {
        willChange: 'transform, opacity',
        yPercent: 0,
        opacity: 1,
      },
      {
        duration: 0.16,
        ease: 'power2.in',
        yPercent: leavingY,
        opacity: 0,
        stagger: { each: 0.007, from: staggerFrom },
      },
    );

    tl.fromTo(
      enteringWords,
      {
        willChange: 'transform, opacity',
        yPercent: enteringStartY,
        opacity: 0,
      },
      {
        duration: 0.35,
        ease: 'power2.out',
        yPercent: 0,
        opacity: 1,
        stagger: { each: 0.007, from: staggerFrom },
      },
      '>-=0.24',
    );

    return () => {
      tl.kill();
    };
  }, [leavingCard, focused, direction]);

  // Scroll-jack with snap-to-card behaviour.
  useEffect(() => {
    const max = filteredCards.length - 1;
    let touchY = 0;

    const advance = (dir: 1 | -1) => {
      const now = performance.now();
      if (now - lastInputRef.current < WHEEL_THROTTLE_MS) return;
      lastInputRef.current = now;
      setFocusedIdx((i) => {
        const next = clamp(i + dir, 0, max);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('homeStack:focusedIdx', String(next));
        }
        return next;
      });
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 5) return;
      advance(e.deltaY > 0 ? 1 : -1);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const dy = touchY - e.touches[0].clientY;
      if (Math.abs(dy) < 24) return;
      advance(dy > 0 ? 1 : -1);
      touchY = e.touches[0].clientY;
    };
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        advance(1);
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        advance(-1);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [filteredCards.length]);

  const focusY = containerH * FOCUS_Y_RATIO;

  const slotY = (offset: number): number => {
    // Focused content's box top is shifted up by FOCUS_LABEL_OFFSET so
    // its label sits above focusY (the filter baseline) and the heading
    // aligns with the first filter chip.
    const focusedTop = focusY - FOCUS_LABEL_OFFSET;
    if (offset === 0) return focusedTop;
    if (offset < 0) {
      // Cards above: -1 sits FOCUS_GAP above the focused content's top.
      const k = Math.abs(offset);
      return focusedTop - k * SMALL_H - FOCUS_GAP - (k - 1) * GAP;
    }
    // Cards below: 1 sits FOCUS_GAP below the focused content's bottom.
    return focusedTop + focusedH + FOCUS_GAP + (offset - 1) * SMALL_STEP;
  };

  // Render a windowed slice of the deck (with one card of buffer at each
  // edge for a smooth fade-in/out as cards enter and leave the visible
  // range). Cards are keyed by id so that on focus advance, each card
  // animates from its old slot's `top` to its new slot's `top` — giving
  // the column the "everything shifts up together" motion the design wants.
  const windowedCards: Array<{ card: Card; offset: number; visible: boolean }> = [];
  const lo = Math.max(0, focusedIdx - SLOTS_ABOVE - 1);
  const hi = Math.min(filteredCards.length - 1, focusedIdx + SLOTS_BELOW + 1);
  for (let i = lo; i <= hi; i++) {
    const offset = i - focusedIdx;
    const visible = offset >= -SLOTS_ABOVE && offset <= SLOTS_BELOW;
    windowedCards.push({ card: filteredCards[i], offset, visible });
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Full-viewport bg layer that bleeds under the Shell header. */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 transition-colors duration-700 ease-out"
        style={{ backgroundColor: focused?.bg ?? '#FFFFFF' }}
      />

      {/* ──────────────── MOBILE LAYOUT ──────────────── */}
      <div className="lg:hidden flex flex-col px-4 pt-2 gap-4 h-full">
        {/* Filter chips — single horizontal line with horizontal scroll. */}
        <div className="flex flex-row flex-nowrap gap-3 overflow-x-auto -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => {
            const active = filter === cat;
            return (
              <FilterTag
                key={cat}
                label={cat}
                state={active ? 'active' : 'default'}
                onClick={() => setFilter(active ? null : cat)}
                className="shrink-0 whitespace-nowrap"
              />
            );
          })}
        </div>

        {/* Focused content (label + heading) — animated in via GSAP. */}
        <div className="relative">
          <FocusedContent
            key={`mobile-entering-${focused.id}`}
            card={focused}
            refEl={enteringRefMobile}
            mobile
          />
          {leavingCard && (
            <div className="absolute inset-0 pointer-events-none">
              <FocusedContent
                key={`mobile-leaving-${leavingCard.id}`}
                card={leavingCard}
                refEl={leavingRefMobile}
                mobile
              />
            </div>
          )}
        </div>

        {/* Hero image — square-ish below the heading. Hidden for the
            intro card (which has no project image). */}
        {focused && focused.id !== 'intro' && (
          <div
            className="relative w-full rounded-md overflow-hidden flex items-center justify-center"
            style={{ aspectRatio: '354/185', backgroundColor: '#FFFCF7' }}
          >
            <img
              src={focused.image}
              alt={focused.label}
              className="max-h-full max-w-[60%] object-contain"
              key={`mobile-img-${focused.id}`}
              style={{ animation: 'home-stack-in 320ms cubic-bezier(.2,.8,.2,1)' }}
            />
          </div>
        )}

        {/* Cards stack — only positive offsets (cards below focus). */}
        <div className="relative flex-1 min-h-[400px]">
          {windowedCards
            .filter(({ offset }) => offset > 0)
            .map(({ card, offset }) => (
              <div
                key={`mobile-${card.id}`}
                className="absolute left-0 right-0"
                style={{
                  top: (offset - 1) * (SMALL_H + GAP),
                  height: SMALL_H,
                  transition: 'top 360ms cubic-bezier(.2,.8,.2,1)',
                  willChange: 'top',
                }}
              >
                <button
                  type="button"
                  onClick={() => setFocusedIdxAndPersist(focusedIdx + offset)}
                  className="block w-full text-left"
                >
                  <ProjectCard title={card.label} role={card.description} className="min-h-[90px]" />
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* ──────────────── DESKTOP LAYOUT ──────────────── */}
      <div className="hidden lg:block w-full h-full relative">
      {/* Filter chips — pinned to the LEFT, nudged 20px below focusY
          so the first chip optically aligns with the big copy heading. */}
      <aside
        className="absolute left-0 flex flex-col gap-3 items-start"
        style={{ top: focusY + 36, width: 180 }}
      >
        {CATEGORIES.map((cat) => {
          const active = filter === cat;
          return (
            <FilterTag
              key={cat}
              label={cat}
              state={active ? 'active' : 'default'}
              onClick={() => setFilter(active ? null : cat)}
            />
          );
        })}
      </aside>

      {/* Card column — sits in its own column to the right of the filters.
          Right reservation matches the responsive image size below. */}
      <div className="absolute right-[320px] xl:right-[360px] 2xl:right-[400px]" style={{ left: 220, top: 0, height: '100%' }}>
        {/* Small cards rendered for the whole windowed slice. The card AT
            offset 0 has opacity 0 (the focused hero overlay covers it).
            All cards animate `top` so the column shifts up as a unit when
            focus advances. */}
        {windowedCards.map(({ card, offset }) => {
          const isFocusSlot = offset === 0;
          return (
            <div
              key={card.id}
              className="absolute left-0"
              style={{
                top: slotY(offset),
                right: 0,
                height: SMALL_H,
                opacity: isFocusSlot ? 0 : 0.9,
                pointerEvents: isFocusSlot ? 'none' : 'auto',
                transition: 'top 360ms cubic-bezier(.2,.8,.2,1)',
                willChange: 'top',
              }}
            >
              <button
                type="button"
                onClick={() => setFocusedIdxAndPersist(focusedIdx + offset)}
                className="block max-w-[420px] w-full text-left"
              >
                <ProjectCard title={card.label} role={card.description} />
              </button>
            </div>
          );
        })}

        {/* Focused (entering) card — animated in via GSAP word stagger. */}
        <div
          className="absolute left-0"
          style={{ top: slotY(0), right: 0 }}
        >
          <FocusedContent
            key={`entering-${focused.id}`}
            card={focused}
            refEl={enteringRef}
          />
        </div>

        {/* Leaving card — same focus position; its words animate out via GSAP. */}
        {leavingCard && (
          <div
            className="absolute left-0 pointer-events-none"
            style={{ top: slotY(0), right: 0 }}
          >
            <FocusedContent
              key={`leaving-${leavingCard.id}`}
              card={leavingCard}
              refEl={leavingRef}
            />
          </div>
        )}
      </div>

      {/* Right phone image — shown from lg upward at responsive sizes.
          Pulls left toward the text on wider viewports (smaller gap),
          stays glued to the right margin when space is tight.
          Hidden for the intro card (which has no project image). */}
      {focused && focused.id !== 'intro' && (
        <div
          className="absolute right-0 xl:right-3 2xl:right-6 flex items-start justify-center w-[280px] h-[460px] xl:w-[320px] xl:h-[510px] 2xl:w-[360px] 2xl:h-[560px]"
          style={{ top: focusY - 100 }}
        >
          <img
            src={focused.image}
            alt={focused.label}
            className="max-h-full max-w-full object-contain rounded-[20px]"
            key={focused.id}
            style={{ animation: 'home-stack-in 320ms cubic-bezier(.2,.8,.2,1)' }}
          />
        </div>
      )}
      </div>
    </div>
  );
}
