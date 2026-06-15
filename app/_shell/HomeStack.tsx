'use client';

import gsap from 'gsap';
import Link from 'next/link';
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ProjectCard } from '../../src/components/ProjectCard/ProjectCard';
import { FilterTag } from '../../src/components/FilterTag/FilterTag';
import { markProjectNavSource, projectHref } from '../../src/lib/projectNavSource';

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
  /** Optional mobile-specific thumbnail — the mobile layout crops the
   *  card image to a wider box than desktop, so some images need a
   *  variant framed for it. Falls back to `image` when absent. */
  imageMobile?: string;
  categories: Category[];
  bg: string;
};

const CARDS: Card[] = [
  {
    id: 'intro',
    project: 'patina',
    label: 'FATIMA CUNHA',
    description: "I design and improve products. Lately I shipped my own app and created an agentic design system.",
    image: '/home/default-home.png',
    imageMobile: '/home/default-home-M.png',
    categories: ['Product Thinking', 'AI Native'],
    bg: '#F0F1FA',
  },
  {
    id: 'zebra-future',
    project: 'zebra-finch',
    label: 'ZEBRA FINCH',
    description:
      "The future of design isn't building interfaces. It's designing the system. I'm building that.",
    image: '/zebra-finch/zebra1.webp',
    imageMobile: '/zebra-finch/zebra1-M.webp',
    categories: ['Product Thinking'],
    bg: '#F0F1FA',
  },
  {
    id: 'patina-app',
    project: 'patina',
    label: 'PATINA',
    description:
      'I built an app to make you put your phone down. I had the idea, designed it, built it and shipped it. Solo.',
    image: '/patina/patina-home3.png',
    imageMobile: '/patina/patina-home3-M.png',
    categories: ['AI Native'],
    bg: '#F0F1FA',
  },
  {
    id: 'herc-fleet',
    project: 'herc-rentals',
    label: 'HERC RENTALS',
    description:
      'Designed a B2B real time fleet management platform that led to 150% growth in 12 months.',
    image: '/herc/home1.webp',
    imageMobile: '/herc/home1-M.webp',
    categories: ['Complex Systems'],
    bg: '#F0F1FA',
  },
  {
    id: 'zebra-pipeline',
    project: 'zebra-finch',
    label: 'ZEBRA FINCH',
    description:
      'Built a working agentic pipeline where the AI generates interfaces using only the design system. No hallucinations.',
    image: '/zebra-finch/zebra2.webp',
    imageMobile: '/zebra-finch/zebra2-M.webp',
    categories: ['AI Native'],
    bg: '#F0F1FA',
  },
  {
    id: 'patina-behavior',
    project: 'patina',
    label: 'PATINA',
    description:
      'Took on the challenge of interrupting one of the most automatic human behaviors.',
    image: '/patina/home1.webp',
    imageMobile: '/patina/home1-M.webp',
    categories: ['Product Thinking'],
    bg: '#F0F1FA',
  },
  {
    id: 'vodafone-technical',
    project: 'vodafone',
    label: 'VODAFONE',
    description:
      'Making deeply technical concepts feel clear to someone who just wants their Wi-Fi to work.',
    image: '/vodafone/home1.webp',
    imageMobile: '/vodafone/home1-M.webp',
    categories: ['Complex Systems'],
    bg: '#F0F1FA',
  },
  {
    id: 'herc-visual',
    project: 'herc-rentals',
    label: 'APP HERC RENTALS',
    description:
      'Created a visual system to represent different equipment, their location and states, in real time.',
    image: '/herc/home2.png',
    imageMobile: '/herc/home2-M.png',
    categories: ['Complex Systems'],
    bg: '#F0F1FA',
  },
  {
    id: 'patina-analytics',
    project: 'patina',
    label: 'PATINA',
    description:
      'Set up analytics to measure if a color seen for two seconds changes what you do next.',
    image: '/patina/patina-home2.png',
    imageMobile: '/patina/patina-home2-M.png',
    categories: ['Product Thinking'],
    bg: '#F0F1FA',
  },
  {
    id: 'vodafone-research',
    project: 'vodafone',
    label: 'VODAFONE',
    description:
      'Joined every user testing session. Watched users react to my work as it happened.',
    image: '/vodafone/vodafone3.webp',
    imageMobile: '/vodafone/vodafone3-M.webp',
    categories: ['Product Thinking'],
    bg: '#F0F1FA',
  },
  {
    id: 'vodafone-locale',
    project: 'vodafone',
    label: 'VODAFONE',
    description:
      'Designed for a product that runs across multiple markets and router models, where one decision ripples across all of them.',
    image: '/vodafone/vodafone-home2.png',
    imageMobile: '/vodafone/vodafone-home2-M.png',
    categories: ['Complex Systems'],
    bg: '#F0F1FA',
  },
  {
    id: 'portfolio',
    project: 'zebra-finch',
    label: 'THIS PORTFOLIO',
    description:
      'Vibe coded this portfolio using my agentic design system pipeline.',
    image: '/home/folio-home.png',
    imageMobile: '/home/folio-home-M.png',
    categories: ['AI Native'],
    bg: '#F0F1FA',
  },
];

// Cards rendered without a thumbnail image. Empty now that the intro and
// portfolio cards have their own home/ thumbnails; kept as the gating hook.
const NO_THUMBNAIL_IDS = new Set<string>();

const SMALL_H = 90;
// Fallback height for the focused hero before its real height is measured.
const BIG_H_FALLBACK = 240;
const GAP = 8;
// Gap between the focused hero and the adjacent small cards — so the
// big copy reads as a distinct moment. Split per side: the top gap (to
// the cards above) is a touch tighter than the bottom.
const FOCUS_GAP_TOP = 48;
const FOCUS_GAP_BOTTOM = 56;
const SMALL_STEP = SMALL_H + GAP;
const FOCUS_Y_RATIO = 0.32;
const SLOTS_ABOVE = 3;
const SLOTS_BELOW = 4;
// Vertical offset of the focused content above focusY so the heading
// (not the label) lines up with the top filter chip; the small label
// "PATINA" then sits above the filters.
// Equals label line-height (22px) + mt-2 gap (8px).
const FOCUS_LABEL_OFFSET = 30;
const WHEEL_THROTTLE_MS = 140;
// Wheel/trackpad accumulator — every WHEEL_DELTA_PER_CARD pixels of
// scroll input maps to one card advance. Lets fast scrolls chain
// multiple advances while slow scrolls still snap one at a time.
const WHEEL_DELTA_PER_CARD = 70;
// Touch-swipe pixel threshold per card advance (separate from wheel
// because touch deltas are raw finger pixels — much smaller than the
// amplified deltaY a trackpad/mousewheel reports).
const TOUCH_DELTA_PER_CARD = 30;
// Extra vertical drop applied to the cards-below stack on the very first
// page visit (intro card, no user scroll yet). Pushes the deck near the
// bottom of the viewport so the big headline gets a clean reveal moment.
// The first scroll drags this offset back to zero continuously (see
// introProgress) before any focus change happens.
const INTRO_LOWER_RATIO = 0.24;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/** Inline version of the word-span structure — useful when you need to
 *  drop word-by-word animatable text into the middle of a paragraph
 *  (e.g. the intro card has highlighted phrases that wrap around
 *  SplitWords-produced words). */
function InlineWords({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="word-wrap" style={{ display: 'inline-block' }}>
            <span className="word" style={{ display: 'inline-block' }}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
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
  return (
    <div className={className} style={style}>
      <InlineWords text={text} />
    </div>
  );
}

function FocusedContent({
  card,
  refEl,
  mobile = false,
  thumbHovered = false,
}: {
  card: Card;
  refEl: React.RefObject<HTMLElement | null>;
  mobile?: boolean;
  /** True while this card's linked thumbnail is hovered — mirrors the
   *  text's own group-hover highlight onto the label + heading so the
   *  text and image read as one link. */
  thumbHovered?: boolean;
}) {
  const headingFont = mobile ? 32 : 56;
  const headingLine = mobile ? '36px' : '60px';
  // Cards without a project link (e.g. the homepage intro) render as
  // a static block — no hover color change, no navigation.
  const isStatic = card.id === 'intro';
  // Text color: hero tint while the heading itself (group-hover) OR its
  // thumbnail (thumbHovered) is hovered; primary otherwise.
  const colorClass =
    !isStatic && thumbHovered
      ? 'text-[var(--color-background-hero)]'
      : 'text-text-primary';
  const hoverClass = isStatic
    ? ''
    : 'transition-colors duration-fast ease-out group-hover:text-[var(--color-background-hero)]';

  const labelEl = (
    <SplitWords
      text={card.label}
      className={`${colorClass} uppercase tracking-[0.12em] font-medium ${hoverClass}`}
      style={{
        fontSize: mobile ? 11 : 13,
        lineHeight: '22px',
        fontFamily: 'var(--font-family-mono)',
      }}
    />
  );
  const headingEl = (
    <SplitWords
      text={card.description}
      className={`mt-2 font-medium ${colorClass} ${hoverClass}`}
      style={{
        fontSize: headingFont,
        lineHeight: headingLine,
        letterSpacing: '-2px',
      }}
    />
  );

  if (isStatic) {
    // The intro card heading has a manual line break after "products.",
    // so we render it here with InlineWords + <br /> instead of via
    // SplitWords (which only accepts a flat string).
    return (
      <div
        ref={refEl as React.RefObject<HTMLDivElement | null>}
        className="block max-w-[940px]"
      >
        {labelEl}
        <p
          className="mt-2 font-medium text-text-primary"
          style={{
            fontSize: headingFont,
            lineHeight: headingLine,
            letterSpacing: '-2px',
          }}
        >
          <InlineWords text="I design and improve products." />
          <br />
          <InlineWords text="Lately I shipped my own app and created an agentic design system." />
        </p>
      </div>
    );
  }

  return (
    <Link
      ref={refEl as React.RefObject<HTMLAnchorElement | null>}
      href={projectHref(card.project)}
      onClick={() => markProjectNavSource('card')}
      className="block max-w-[940px] group focus:outline-none focus-visible:outline-none"
    >
      {labelEl}
      {headingEl}
    </Link>
  );
}

export function HomeStack() {
  const [filter, setFilter] = useState<Category | null>(null);
  const [focusedIdx, setFocusedIdx] = useState(0);
  // True while the focused card's thumbnail image is hovered — lifts the
  // heading's hover highlight so hovering the image tints the text too.
  const [thumbHovered, setThumbHovered] = useState(false);
  // EXPERIMENT: the deck auto-advances on a timer; hovering the card area
  // pauses it so you can read. True while the pointer is over the stack.
  const [autoPaused, setAutoPaused] = useState(false);
  // Initial "cards parked low" state — true until the intro scroll seats
  // the cards. The first scroll drags them up continuously; once seated,
  // this flips false and the card-wheel behavior takes over.
  const [cardsLowered, setCardsLowered] = useState(true);
  // Mirror of cardsLowered for use inside the scroll effect's closure.
  const cardsLoweredRef = useRef(true);
  // Intro scroll progress 0→1. While cardsLowered is true, downward scroll
  // input drives this 0→1 (1:1 with scroll distance), lifting the parked
  // cards proportionally; at 1 the intro completes. The ref is the source
  // of truth read inside the scroll handler; the state mirrors it for
  // rendering, batched to one update per frame via rAF.
  const [introProgress, setIntroProgress] = useState(0);
  const introProgressRef = useRef(0);
  // Headline-block opacity for the mount intro. Holds at 0 (entire block
  // hidden including underlines/period) for a beat, then fades to 1 in
  // sync with the GSAP per-word slide-up. Driven by React state so it
  // survives strict-mode effect reruns (unlike a chained GSAP tween).
  const [headlineRevealed, setHeadlineRevealed] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setHeadlineRevealed(true), 350);
    return () => window.clearTimeout(id);
  }, []);
  // Pre-mount state used for the entrance: each parked card starts shifted
  // down + transparent, then fades into place with a small stagger. Held
  // until the homepage headline motion finishes so the sequence reads:
  // headline reveals → header + cards arrive.
  const [cardsEntered, setCardsEntered] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setCardsEntered(true), 1100);
    return () => window.clearTimeout(id);
  }, []);
  // On mobile, skip the homepage intro motion entirely: present the
  // headline, filters, and cards in their settled state from the first
  // paint. Desktop keeps the parked-cards intro that the first scroll
  // consumes. Runs in a layout effect so the correction lands before
  // the browser paints — no flash, no animation.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(min-width: 768px)').matches) return;
    cardsLoweredRef.current = false;
    setCardsLowered(false);
    setHeadlineRevealed(true);
    setCardsEntered(true);
  }, []);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerH, setContainerH] = useState(800);
  // Measured height of the focused (entering) content — drives the position
  // of the cards below so the visible gap is exactly FOCUS_GAP_BOTTOM,
  // regardless of how many lines the heading wraps to.
  const [focusedH, setFocusedH] = useState(BIG_H_FALLBACK);
  const lastInputRef = useRef(0);

  const filteredCards = useMemo(
    // When a filter is active, drop the intro card so the headline only
    // appears in the default unfiltered view.
    () =>
      filter
        ? CARDS.filter((c) => c.id !== 'intro' && c.categories.includes(filter))
        : CARDS,
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
      // Returning user — skip the parked-low intro moment.
      if (idx > 0) {
        setCardsLowered(false);
        cardsLoweredRef.current = false;
      }
    }
  }, []);

  // Allow the header logo (or any other affordance) to reset the deck
  // back to the first card via a window event — works even when the
  // logo Link doesn't trigger a navigation (because user is already on `/`).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onReset = () => {
      setFocusedIdx(0);
      setCardsLowered(true);
      cardsLoweredRef.current = true;
      setIntroProgress(0);
      introProgressRef.current = 0;
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
    setCardsLowered(false);
    cardsLoweredRef.current = false;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('homeStack:focusedIdx', String(next));
    }
  };

  // EXPERIMENT: auto-advance the deck one card every AUTO_ADVANCE_MS, looping
  // back to the top at the end. Pauses while the pointer is over the stack
  // (autoPaused) so you can read. Hover-only devices — touch screens can't
  // pause, so they keep the manual scroll. The effect re-runs on each focus
  // change, so every card gets a fresh full dwell.
  const AUTO_ADVANCE_MS = 3500;
  useEffect(() => {
    if (autoPaused) return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    const total = filteredCards.length;
    if (total <= 1) return;
    const id = window.setTimeout(() => {
      setFocusedIdxAndPersist((focusedIdx + 1) % total);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPaused, focusedIdx, filteredCards.length]);

  useLayoutEffect(() => {
    const update = () => {
      if (containerRef.current) setContainerH(containerRef.current.clientHeight);
    };
    update();
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Clamp focusedIdx to filteredCards' range — if a filter change leaves
  // the previously-focused index out of bounds (before the reset effect
  // fires), fall back to the first card so downstream code never crashes
  // on an undefined `focused`.
  const focused = filteredCards[focusedIdx] ?? filteredCards[0];

  // Plausible: how deep into the card stack the visitor scrolls. Fires a
  // `Homepage Explored` event once per depth — 'middle' when they pass the
  // midpoint card, 'end' when they reach the last one. Mirrors the case
  // study read-depth signal so homepage exploration is comparable in the
  // dashboard. Reaching the end implies passing the middle, so both fire.
  const exploredFiredRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const total = filteredCards.length;
    if (total <= 1) return;
    const lastIdx = total - 1;
    const midIdx = Math.floor(lastIdx / 2);
    const fire = (depth: 'middle' | 'end') => {
      if (exploredFiredRef.current.has(depth)) return;
      exploredFiredRef.current.add(depth);
      if (typeof window.plausible === 'function') {
        window.plausible('Homepage Explored', { props: { depth } });
      }
    };
    if (focusedIdx >= lastIdx) {
      fire('middle');
      fire('end');
    } else if (focusedIdx >= midIdx) {
      fire('middle');
    }
  }, [focusedIdx, filteredCards.length]);

  // Measure the entering focused content so cards below sit exactly
  // FOCUS_GAP_BOTTOM below it.
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
      // Mount — per-word entering motion (same as inter-card switching).
      // Wrapper opacity is controlled via headlineRevealed React state so
      // the whole block (including underlines + trailing period) holds
      // fully transparent during the pre-roll, even though GSAP only
      // animates the words.
      const enteringEls = [enteringRef.current, enteringRefMobile.current].filter(Boolean) as HTMLElement[];
      if (enteringEls.length === 0) return;
      const words = enteringEls.flatMap((el) => Array.from(el.querySelectorAll<HTMLElement>('.word')));
      gsap.fromTo(
        words,
        { willChange: 'transform, opacity', yPercent: 16, opacity: 0 },
        {
          duration: 0.5,
          ease: 'power2.out',
          yPercent: 0,
          opacity: 1,
          stagger: { each: 0.012, from: 'start' },
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

  // Scroll-jack with accumulator-based snap. Wheel/touch deltas
  // accumulate; every WHEEL_DELTA_PER_CARD / TOUCH_DELTA_PER_CARD pixels
  // triggers one focus advance. A short throttle still gates how fast
  // back-to-back advances can fire so the per-card transition stays
  // readable. Net effect: slow scroll → one card at a time; fast scroll
  // → multiple cards chain naturally without feeling stuck.
  useEffect(() => {
    const max = filteredCards.length - 1;
    let touchY = 0;
    let wheelAccum = 0;
    let touchAccum = 0;

    /** Returns true if the advance fired (i.e. wasn't throttled). */
    const advance = (dir: 1 | -1): boolean => {
      const now = performance.now();
      if (now - lastInputRef.current < WHEEL_THROTTLE_MS) return false;
      lastInputRef.current = now;
      // No focus changes until the intro scroll has seated the cards.
      if (cardsLoweredRef.current) return false;
      setFocusedIdx((i) => {
        const next = clamp(i + dir, 0, max);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('homeStack:focusedIdx', String(next));
        }
        return next;
      });
      return true;
    };

    // Completes the intro: seats the cards and reveals the filters.
    const finishIntro = () => {
      cardsLoweredRef.current = false;
      introProgressRef.current = 1;
      setCardsLowered(false);
      setIntroProgress(1);
    };

    // Intro scroll driver. Positive (downward) delta lifts the parked
    // cards 1:1 with scroll distance; the intro is one-way, so upward
    // delta is ignored. Render sync is batched to one rAF per frame.
    let introRaf = 0;
    const applyIntroScroll = (delta: number) => {
      if (delta <= 0) return;
      const dist =
        (containerRef.current?.clientHeight ?? 800) * INTRO_LOWER_RATIO;
      introProgressRef.current = Math.min(
        1,
        introProgressRef.current + delta / dist,
      );
      if (introProgressRef.current >= 1) {
        if (introRaf) cancelAnimationFrame(introRaf);
        introRaf = 0;
        finishIntro();
        return;
      }
      if (!introRaf) {
        introRaf = requestAnimationFrame(() => {
          introRaf = 0;
          setIntroProgress(introProgressRef.current);
        });
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Intro not yet seated → downward scroll drags the cards up
      // continuously. Leftover delta past the seat point is discarded
      // so the gesture stops at the final position.
      if (cardsLoweredRef.current) {
        applyIntroScroll(e.deltaY);
        return;
      }
      wheelAccum += e.deltaY;
      // Drain the accumulator one threshold at a time. Stop early if
      // throttled — leftover delta carries into the next event so fast
      // scrolls still feel responsive instead of dropping input.
      while (Math.abs(wheelAccum) >= WHEEL_DELTA_PER_CARD) {
        const dir = wheelAccum > 0 ? 1 : -1;
        if (!advance(dir)) break;
        wheelAccum -= dir * WHEEL_DELTA_PER_CARD;
        // Clamp so a single huge delta can't queue dozens of advances.
        if (Math.abs(wheelAccum) > WHEEL_DELTA_PER_CARD * 3) {
          wheelAccum = dir * WHEEL_DELTA_PER_CARD * 3;
        }
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
      touchAccum = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const dy = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      // Intro not yet seated → drag the cards up continuously.
      if (cardsLoweredRef.current) {
        applyIntroScroll(dy);
        return;
      }
      touchAccum += dy;
      while (Math.abs(touchAccum) >= TOUCH_DELTA_PER_CARD) {
        const dir = touchAccum > 0 ? 1 : -1;
        if (!advance(dir)) break;
        touchAccum -= dir * TOUCH_DELTA_PER_CARD;
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        // A down-key during the intro seats the cards in one press.
        if (cardsLoweredRef.current) {
          finishIntro();
          return;
        }
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
      if (introRaf) cancelAnimationFrame(introRaf);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [filteredCards.length]);

  const focusY = containerH * FOCUS_Y_RATIO;
  const introLower = cardsLowered
    ? containerH * INTRO_LOWER_RATIO * (1 - introProgress)
    : 0;

  const slotY = (offset: number): number => {
    // Focused content's box top is shifted up by FOCUS_LABEL_OFFSET so
    // its label sits above focusY (the filter baseline) and the heading
    // aligns with the first filter chip.
    const focusedTop = focusY - FOCUS_LABEL_OFFSET;
    if (offset === 0) return focusedTop;
    if (offset < 0) {
      // Cards above: -1 sits FOCUS_GAP_TOP above the focused content's top.
      const k = Math.abs(offset);
      return focusedTop - k * SMALL_H - FOCUS_GAP_TOP - (k - 1) * GAP;
    }
    // Cards below: 1 sits FOCUS_GAP_BOTTOM below the focused content's bottom.
    // While in the parked-low intro state, push the whole below-stack down.
    return focusedTop + focusedH + FOCUS_GAP_BOTTOM + (offset - 1) * SMALL_STEP + introLower;
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
      <div className="lg:hidden flex flex-col pt-2 gap-4 h-full">
        {/* Filter chips — single horizontal line with horizontal scroll. */}
        <div className="flex flex-row flex-nowrap gap-1 overflow-x-auto -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat, i) => {
            const active = filter === cat;
            return (
              <span
                key={cat}
                className="inline-block shrink-0"
                style={{
                  opacity: cardsLowered ? 0 : 1,
                  transform: cardsLowered ? 'translateX(-8px)' : 'translateX(0)',
                  transition: 'opacity 320ms ease-out, transform 320ms ease-out',
                  transitionDelay: cardsLowered ? '0ms' : `${150 + i * 90}ms`,
                  willChange: 'opacity, transform',
                }}
              >
                <FilterTag
                  label={cat}
                  state={active ? 'active' : 'default'}
                  onClick={() => setFilter(active ? null : cat)}
                  className="shrink-0 whitespace-nowrap"
                />
              </span>
            );
          })}
        </div>

        {/* Focused content (label + heading) — animated in via GSAP. The
            outer wrapper opacity holds at 0 for the mount intro so the
            entire block (including underlines/period) is invisible during
            the pre-roll. */}
        <div
          className="relative mt-2"
          style={{
            opacity: headlineRevealed ? 1 : 0,
            transition: 'opacity 500ms ease-out',
          }}
        >
          <FocusedContent
            key={`mobile-entering-${focused.id}`}
            card={focused}
            refEl={enteringRefMobile}
            mobile
            thumbHovered={thumbHovered}
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

        {/* Hero image — full-width thumbnail below the heading; its own
            aspect drives the height (no fixed box, no background). Links
            to the focused card's use case. Hidden for cards in
            NO_THUMBNAIL_IDS (intro + portfolio). */}
        {focused && !NO_THUMBNAIL_IDS.has(focused.id) && (
          <Link
            href={projectHref(focused.project)}
            onClick={() => markProjectNavSource('card')}
            className="block w-full"
            onMouseEnter={() => setThumbHovered(true)}
            onMouseLeave={() => setThumbHovered(false)}
          >
            <img
              src={focused.imageMobile ?? focused.image}
              alt={focused.label}
              className="w-full rounded-[12px]"
              key={`mobile-img-${focused.id}`}
              // 400ms delay (with `both` fill) holds the thumbnail hidden
              // until the card transition settles, so it doesn't fade in
              // over the still-animating outgoing headline.
              style={{
                animation:
                  'home-stack-in 320ms cubic-bezier(.2,.8,.2,1) 400ms both',
              }}
            />
          </Link>
        )}

        {/* Cards stack — only positive offsets (cards below focus). */}
        <div className="relative flex-1 min-h-0">
          {windowedCards
            .filter(({ offset }) => offset > 0)
            .map(({ card, offset }) => (
              <div
                key={`mobile-${card.id}`}
                className="absolute left-0 right-0"
                style={{
                  top: (offset - 1) * (SMALL_H + GAP) + introLower,
                  height: SMALL_H,
                  opacity: cardsEntered ? 1 : 0,
                  transform: cardsEntered ? 'translateY(0)' : 'translateY(24px)',
                  transition:
                    'top 180ms linear, opacity 500ms ease-out, transform 500ms cubic-bezier(.2,.8,.2,1)',
                  // Per-property delays: NO delay on `top` (so scroll
                  // changes propagate instantly), staggered delay on
                  // opacity + transform for the one-time entry fade-in.
                  transitionDelay: cardsEntered
                    ? `0ms, ${offset * 70}ms, ${offset * 70}ms`
                    : '0ms',
                  willChange: 'top, opacity, transform',
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
        {CATEGORIES.map((cat, i) => {
          const active = filter === cat;
          return (
            <span
              key={cat}
              className="inline-block"
              style={{
                opacity: cardsLowered ? 0 : 1,
                transform: cardsLowered ? 'translateX(-8px)' : 'translateX(0)',
                transition: 'opacity 320ms ease-out, transform 320ms ease-out',
                transitionDelay: cardsLowered ? '0ms' : `${150 + i * 90}ms`,
                willChange: 'opacity, transform',
              }}
            >
              <FilterTag
                label={cat}
                state={active ? 'active' : 'default'}
                onClick={() => setFilter(active ? null : cat)}
              />
            </span>
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
          // Hide the card sitting exactly under the headline so the
          // focused content reads cleanly. Cards transitioning through
          // this slot get an instant opacity snap (no fade) so they
          // don't appear to "pile up" as they cross.
          const settledOpacity = isFocusSlot ? 0 : 0.9;
          return (
            <div
              key={card.id}
              className="absolute left-0"
              style={{
                top: slotY(offset),
                right: 0,
                height: SMALL_H,
                opacity: cardsEntered ? settledOpacity : 0,
                transform: cardsEntered ? 'translateY(0)' : 'translateY(24px)',
                pointerEvents: isFocusSlot ? 'none' : 'auto',
                transitionProperty: 'top, opacity, transform',
                transitionDuration: `${cardsLowered ? '0ms' : '180ms'}, 500ms, 500ms`,
                transitionTimingFunction:
                  'linear, ease-out, cubic-bezier(.2,.8,.2,1)',
                // Per-property delays: NO delay on `top` (so scroll
                // changes propagate instantly), staggered delay on
                // opacity + transform for the one-time entry fade-in.
                transitionDelay: cardsEntered
                  ? `0ms, ${Math.max(0, offset) * 70}ms, ${Math.max(0, offset) * 70}ms`
                  : '0ms',
                willChange: 'top, opacity, transform',
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

        {/* Focused (entering) card — animated in via GSAP word stagger.
            Wrapper opacity is React-driven so the full block (including
            underlines/period) holds invisible during the mount pre-roll. */}
        <div
          className="absolute left-0"
          onMouseEnter={() => setAutoPaused(true)}
          onMouseLeave={() => setAutoPaused(false)}
          style={{
            top: slotY(0),
            right: 0,
            opacity: headlineRevealed ? 1 : 0,
            transition: 'opacity 500ms ease-out',
          }}
        >
          <FocusedContent
            key={`entering-${focused.id}`}
            card={focused}
            refEl={enteringRef}
            thumbHovered={thumbHovered}
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
          Pulled inward off the right margin so it sits closer to the
          big text, and vertically centered around focusY so it sits
          higher. Hidden for cards in NO_THUMBNAIL_IDS (intro + portfolio).

          Layered transition: when focus changes the *outgoing* image
          stays in place (no exit animation) and the new image fades
          in on top of it. Visually feels like a stack of cards being
          dropped on top of each other rather than a swap. */}
      {focused && !NO_THUMBNAIL_IDS.has(focused.id) && (
        <div
          className="absolute right-[40px] w-[280px] h-[460px] xl:w-[320px] xl:h-[510px] 2xl:w-[360px] 2xl:h-[560px]"
          style={{ top: focusY - 200 }}
        >
          {leavingCard && !NO_THUMBNAIL_IDS.has(leavingCard.id) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img
                src={leavingCard.image}
                alt=""
                className="max-h-full max-w-full object-contain rounded-[12px]"
                key={`leaving-img-${leavingCard.id}`}
              />
            </div>
          )}
          <Link
            href={projectHref(focused.project)}
            onClick={() => markProjectNavSource('card')}
            className="absolute inset-0 flex items-center justify-center"
            onMouseEnter={() => { setThumbHovered(true); setAutoPaused(true); }}
            onMouseLeave={() => { setThumbHovered(false); setAutoPaused(false); }}
          >
            <img
              src={focused.image}
              alt={focused.label}
              className="max-h-full max-w-full object-contain rounded-[12px]"
              key={focused.id}
              style={{ animation: 'home-stack-in 320ms cubic-bezier(.2,.8,.2,1)' }}
            />
          </Link>
        </div>
      )}
      </div>
    </div>
  );
}
