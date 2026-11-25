'use client';

import gsap from 'gsap';
import Link from 'next/link';
import {
  Fragment,
  ViewTransition,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { ProjectCard } from '../../src/components/ProjectCard/ProjectCard';
import { FilterTag } from '../../src/components/FilterTag/FilterTag';
import {
  heroTransitionName,
  markHeroMorph,
  markProjectNavSource,
  projectHref,
} from '../../src/lib/projectNavSource';

/**
 * Homepage card deck.
 * A vertical column of cards with one continuous position, in card units.
 * Wheel, touch and keys move a target; every frame the rendered position
 * eases toward it, so the column follows the input instead of jumping.
 * When input stops the target settles on the nearest card. Each card's
 * place in the column is a continuous function of that position, so cards
 * glide through the same slots the static layout uses.
 *
 * The focused card opens into a large heading. It reads only at rest: it
 * fades as the deck speeds up, so a fast flick looks like a plain list
 * gliding past, and it re-commits to a card once the deck slows — one
 * heading swap per gesture rather than one per card passed.
 *
 * Heading swaps use a per-word GSAP stagger (port of Codrops Text Block
 * Transitions demo 6): outgoing words drift out in the scroll direction,
 * incoming words arrive from the other side, overlapping slightly.
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
    description:
      "I design products for brands like Vodafone and Pizza Hut. Lately I shipped my own app and built an AI design workflow.",
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
// Extra vertical drop applied to the cards-below stack on the very first
// page visit (intro card, no user scroll yet). Pushes the deck near the
// bottom of the viewport so the big headline gets a clean reveal moment.
// It occupies deck positions -1 → 0, so the first scroll lifts the cards
// with the same physics as everything after it.
const INTRO_LOWER_RATIO = 0.24;

// ── Deck physics ──────────────────────────────────────────────────────
// Wheel pixels per card. About one small-card step, so the column tracks
// a trackpad roughly 1:1, and one mouse-wheel notch (100px) is one card.
const WHEEL_PX_PER_CARD = 100;
// Finger pixels per card on touch — 1:1 with the small-card step.
const TOUCH_PX_PER_CARD = SMALL_STEP;
// A released swipe keeps travelling for this many seconds of its velocity,
// less a dead zone: below TOUCH_FLING_MIN_V (px/s) a release just settles
// where the finger left the deck, so a slow one-card drag stays one card.
const TOUCH_FLING_S = 0.18;
const TOUCH_FLING_MIN_V = 400;
// Rate (1/s) at which the rendered position closes on the target. Higher
// is snappier; ~8 is close to Lenis' default feel.
const FOLLOW_RATE = 8;
// Quiet time after the last input before the target snaps to the nearest
// card. Trackpad momentum keeps sending wheel events, so this only fires
// once the whole gesture — momentum tail included — has ended.
const SNAP_IDLE_MS = 140;
// Past either end the deck yields a little and springs back rather than
// stopping dead. OVERSCROLL caps the give; RESIST scales input out there.
const OVERSCROLL = 0.18;
const OVERSCROLL_RESIST = 0.3;
// One gesture can't fling the whole deck. Wheel travel within a gesture,
// and a touch release's fling, are compressed as S·atan(input/S): the
// first card or two track 1:1, then each further card costs more input,
// topping out near S·π/2 cards. A new gesture starts once one has settled.
const GESTURE_SOFT_CARDS = 4;
// The heading stays on screen while the gesture's destination is within
// this many cards of it — a slow drag reads each card's heading in turn.
// Further than that it fades, and returns once the deck arrives.
const HEADING_TRAVEL_CARDS = 1.2;
// Safety net for very fast motion, in cards per second: the heading also
// fades above LOW and is gone by HIGH, and only commits below COMMIT.
const HEADING_V_LOW = 6;
const HEADING_V_HIGH = 14;
const HEADING_V_COMMIT = 5;
// The heading's openness eases rather than snapping, because the gap it
// opens in the column follows it — a jump would make the cards jump. It
// closes quickly when a flick sets off and opens more gently on arrival.
const HEADING_CLOSE_RATE = 14;
const HEADING_OPEN_RATE = 6;

// Matches Tailwind's `lg`, where this component swaps its mobile layout
// for the desktop one.
const DESKTOP_MQ = '(min-width: 1024px)';

/** Whether the desktop layout is the one showing — null until known
 *  (server render and hydration), since the server can't tell. */
function useIsDesktop(): boolean | null {
  return useSyncExternalStore<boolean | null>(
    (onChange) => {
      const mq = window.matchMedia(DESKTOP_MQ);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia(DESKTOP_MQ).matches,
    () => null,
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/** Hermite ease of t, clamped to 0–1. */
function smoothstep(t: number) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
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
    // The intro heading breaks between its two sentences on desktop (the
    // deliberate two-block look), but reflows freely on mobile — a forced
    // break there strands the second sentence in a narrow column.
    // The copy itself lives only in `card.description`; we split it on the
    // sentence boundary rather than repeating it here.
    const sentenceEnd = card.description.indexOf('. ');
    const firstSentence =
      sentenceEnd === -1 ? card.description : card.description.slice(0, sentenceEnd + 1);
    const restSentences = sentenceEnd === -1 ? '' : card.description.slice(sentenceEnd + 2);
    return (
      <div
        ref={refEl as React.RefObject<HTMLDivElement | null>}
        className="block max-w-[940px]"
      >
        {labelEl}
        {mobile || !restSentences ? (
          headingEl
        ) : (
          <p
            className="mt-2 font-medium text-text-primary"
            style={{
              fontSize: headingFont,
              lineHeight: headingLine,
              letterSpacing: '-2px',
            }}
          >
            <InlineWords text={firstSentence} />
            <br />
            <InlineWords text={restSentences} />
          </p>
        )}
      </div>
    );
  }

  return (
    <Link
      ref={refEl as React.RefObject<HTMLAnchorElement | null>}
      href={projectHref(card.project)}
      onClick={() => {
        markProjectNavSource('card');
        markHeroMorph();
      }}
      className="block max-w-[940px] group focus:outline-none focus-visible:outline-none"
    >
      {labelEl}
      {headingEl}
    </Link>
  );
}

export function HomeStack() {
  const [filter, setFilter] = useState<Category | null>(null);
  // The card whose big heading is showing. Follows the deck position, but
  // only commits while the deck is slow (see HEADING_V_COMMIT).
  const [focusedIdx, setFocusedIdx] = useState(0);
  // True while the focused card's thumbnail image is hovered — lifts the
  // heading's hover highlight so hovering the image tints the text too.
  const [thumbHovered, setThumbHovered] = useState(false);
  // "Cards parked low" — true while the deck sits in its intro range
  // (position < 0). The first scroll lifts the cards out of it; once seated
  // it never returns, and the filters fade in.
  const [cardsLowered, setCardsLowered] = useState(true);
  // Mirror of cardsLowered for use inside the animation loop.
  const cardsLoweredRef = useRef(true);
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

  // ── Deck state ──
  // Refs, not React state: these change every frame and are written
  // straight to the DOM by the animation loop.
  /** Rendered position in card units. -1 → 0 is the intro lift. */
  const posRef = useRef(-1);
  /** Where input is taking the deck; posRef eases toward it. */
  const targetRef = useRef(-1);
  /** Lowest reachable position: -1 until the intro seats the cards, then 0. */
  const minPosRef = useRef(-1);
  /** Smoothed deck speed, cards per second. */
  const velRef = useRef(0);
  /** performance.now() of the most recent input. */
  const lastInputRef = useRef(0);
  /** False while a gesture is live; true once its target has snapped. */
  const snappedRef = useRef(true);
  /** Raw and compressed wheel travel within the current gesture, in cards. */
  const gestureRawRef = useRef(0);
  const gestureOutRef = useRef(0);
  /** Mirror of focusedIdx for the animation loop. */
  const committedIdxRef = useRef(0);
  /** Heading openness (0–1): its opacity, and how far the column opens
   *  around it. Eased, and mirrored so layout can read it. */
  const headingAlphaRef = useRef(1);
  /** Focused-hero height, eased so the cards below never jump. */
  const holeHRef = useRef(BIG_H_FALLBACK);
  const focusedHRef = useRef(BIG_H_FALLBACK);
  const containerHRef = useRef(800);
  // Wrappers whose opacity follows deck speed.
  const headingFadeRef = useRef<HTMLDivElement>(null);
  const thumbFadeRef = useRef<HTMLDivElement>(null);
  const mobileHeadingFadeRef = useRef<HTMLDivElement>(null);
  const mobileThumbFadeRef = useRef<HTMLDivElement>(null);
  /** Positions every card for a given deck position; rebuilt each render. */
  const layoutRef = useRef<(pos: number) => void>(() => {});

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
    if (posRef.current < 0) {
      posRef.current = 0;
      targetRef.current = 0;
    }
    minPosRef.current = 0;
  }, []);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerH, setContainerH] = useState(800);
  // Measured height of the focused (entering) content — drives the position
  // of the cards below so the visible gap is exactly FOCUS_GAP_BOTTOM,
  // regardless of how many lines the heading wraps to.
  const [focusedH, setFocusedH] = useState(BIG_H_FALLBACK);
  useLayoutEffect(() => {
    containerHRef.current = containerH;
  }, [containerH]);
  useLayoutEffect(() => {
    focusedHRef.current = focusedH;
  }, [focusedH]);

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

  /** Sends the deck to a card (small-card click, keyboard). */
  const goTo = (idx: number) => {
    targetRef.current = clamp(idx, 0, Math.max(0, filteredCards.length - 1));
    minPosRef.current = 0;
    lastInputRef.current = performance.now();
    snappedRef.current = false;
  };

  // Reset focus to top only when the filter VALUE actually changes
  // (not on the initial render, and not when strict-mode dev re-runs
  // effects — both of which would otherwise wipe the restored focus).
  const prevFilterRef = useRef<Category | null>(filter);
  useEffect(() => {
    if (prevFilterRef.current === filter) return;
    prevFilterRef.current = filter;
    posRef.current = 0;
    targetRef.current = 0;
    minPosRef.current = 0;
    committedIdxRef.current = 0;
    snappedRef.current = true;
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
      committedIdxRef.current = idx;
      prevFocusedCardRef.current = CARDS[idx];
      prevFocusedIdxRef.current = idx;
      // Returning user — skip the parked-low intro moment.
      if (idx > 0) {
        posRef.current = idx;
        targetRef.current = idx;
        minPosRef.current = 0;
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
      const desktop = window.matchMedia('(min-width: 768px)').matches;
      const start = desktop ? -1 : 0;
      posRef.current = start;
      targetRef.current = start;
      minPosRef.current = start;
      committedIdxRef.current = 0;
      snappedRef.current = true;
      setFocusedIdx(0);
      setCardsLowered(desktop);
      cardsLoweredRef.current = desktop;
      prevFocusedCardRef.current = null;
      prevFocusedIdxRef.current = 0;
      setLeavingCard(null);
      sessionStorage.removeItem('homeStack:focusedIdx');
    };
    window.addEventListener('homeStack:reset', onReset);
    return () => window.removeEventListener('homeStack:reset', onReset);
  }, []);

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
    if (prev && prev.id === focused.id) return;
    // On mount, and on arrival after a flick, there's no visible heading to
    // animate away — after a flick the old one faded out in flight. So the
    // new heading just arrives, with the calmer mount-style motion, instead
    // of the old words exiting over the new ones.
    if (!prev || headingAlphaRef.current < 0.35) {
      if (prev) setLeavingCard(null);
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

  // Rebuild the layout function each render (it closes over the current
  // card list and the card elements just committed) and apply it before
  // paint, so newly mounted cards never flash at the top of the column.
  useLayoutEffect(() => {
    const deckEls = (layout: 'desktop' | 'mobile') => {
      const map = new Map<string, HTMLElement>();
      containerRef.current
        ?.querySelectorAll<HTMLElement>(`[data-deck="${layout}"]`)
        .forEach((el) => map.set(el.dataset.id ?? '', el));
      return map;
    };
    const desktopEls = deckEls('desktop');
    const mobileEls = deckEls('mobile');
    layoutRef.current = (pos: number) => {
      const cH = containerHRef.current;
      const focusedTop = cH * FOCUS_Y_RATIO - FOCUS_LABEL_OFFSET;
      // Intro range: positions -1 → 0 lift the parked cards into place.
      const introLower = cH * INTRO_LOWER_RATIO * clamp(-pos, 0, 1);
      const p = Math.max(pos, 0);
      const headingAlpha = headingAlphaRef.current;
      // The gap around the focus slot opens with the heading. Fully open
      // it's the static layout; closed, every card sits one small step
      // from the next, so mid-flick the column is an evenly spaced list.
      const hole = SMALL_H + (holeHRef.current - SMALL_H) * headingAlpha;
      const gapTop = GAP + (FOCUS_GAP_TOP - GAP) * headingAlpha;
      const gapBottom = GAP + (FOCUS_GAP_BOTTOM - GAP) * headingAlpha;
      // Slot positions, by whole-card offset from focus.
      const slot = (k: number): number => {
        if (k === 0) return focusedTop;
        if (k < 0) {
          return focusedTop - -k * SMALL_H - gapTop - (-k - 1) * GAP;
        }
        return focusedTop + hole + gapBottom + (k - 1) * SMALL_STEP + introLower;
      };
      filteredCards.forEach((card, i) => {
        // Fractional offset from focus; interpolate between the two slots
        // either side of it, so a card glides rather than hops.
        const d = i - p;
        const k0 = Math.floor(d);
        const f = d - k0;
        const y = slot(k0) + (slot(k0 + 1) - slot(k0)) * f;

        let alpha = 0.9;
        // Fade out past the visible window at either end.
        if (d < -SLOTS_ABOVE) alpha *= 1 - smoothstep(-d - SLOTS_ABOVE);
        if (d > SLOTS_BELOW) alpha *= 1 - smoothstep(d - SLOTS_BELOW);
        // Clear the focus slot for the big heading — but only as much as
        // the heading is actually showing. Mid-flick, when the heading has
        // faded, cards pass straight through and the column reads as one list.
        const inHole =
          d >= 0
            ? 1 - smoothstep((d - 0.55) / 0.45)
            : 1 - smoothstep((-d - 0.35) / 0.5);
        // The card in the focus slot is fully cleared by the time the
        // heading is a third open, so the arriving words never land on it.
        alpha *= 1 - inHole * smoothstep(headingAlpha / 0.35);

        const el = desktopEls.get(card.id);
        if (el) {
          el.style.transform = `translate3d(0, ${y}px, 0)`;
          el.style.opacity = String(alpha);
          el.style.visibility = alpha < 0.01 ? 'hidden' : 'visible';
          el.style.pointerEvents = alpha < 0.3 ? 'none' : 'auto';
        }

        // Mobile shows only the cards below the focused one, sliding up
        // into the heading and fading as they arrive.
        const m = mobileEls.get(card.id);
        if (m) {
          const my = (d - 1) * SMALL_STEP;
          let mAlpha = smoothstep(d);
          if (d > SLOTS_BELOW) mAlpha *= 1 - smoothstep(d - SLOTS_BELOW);
          m.style.transform = `translate3d(0, ${my}px, 0)`;
          m.style.opacity = String(mAlpha);
          m.style.visibility = mAlpha < 0.01 ? 'hidden' : 'visible';
          m.style.pointerEvents = mAlpha < 0.3 ? 'none' : 'auto';
        }
      });
    };
    layoutRef.current(posRef.current);
  });

  // The animation loop: eases the deck toward its target, snaps it to the
  // nearest card once input goes quiet, fades the heading with speed, and
  // commits the heading to a new card once the deck slows down.
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rate = reduceMotion ? 40 : FOLLOW_RATE;
    let raf = 0;
    let last = performance.now();
    let prevPos = posRef.current;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const max = Math.max(0, filteredCards.length - 1);

      // Settle: once input has gone quiet, snap the target to a card.
      if (!snappedRef.current && now - lastInputRef.current > SNAP_IDLE_MS) {
        snappedRef.current = true;
        gestureRawRef.current = 0;
        gestureOutRef.current = 0;
        let t = targetRef.current;
        if (minPosRef.current < 0) {
          // Still in the intro: any real downward nudge seats the cards.
          t = t > minPosRef.current + 0.02 ? 0 : minPosRef.current;
        } else {
          t = Math.round(t);
        }
        targetRef.current = clamp(t, minPosRef.current, max);
        if (targetRef.current >= 0) minPosRef.current = 0;
      }

      // Follow: frame-rate independent exponential approach.
      const k = 1 - Math.exp(-rate * dt);
      posRef.current += (targetRef.current - posRef.current) * k;
      if (Math.abs(targetRef.current - posRef.current) < 1e-4) {
        posRef.current = targetRef.current;
      }
      const pos = posRef.current;
      const instV = dt > 0 ? (pos - prevPos) / dt : 0;
      prevPos = pos;
      velRef.current += (instV - velRef.current) * (1 - Math.exp(-12 * dt));
      holeHRef.current +=
        (focusedHRef.current - holeHRef.current) * (1 - Math.exp(-14 * dt));
      const speed = Math.abs(velRef.current);

      // Seat the intro once the deck has crossed into it.
      if (cardsLoweredRef.current && minPosRef.current === 0 && pos > -0.02) {
        cardsLoweredRef.current = false;
        setCardsLowered(false);
      }

      // How far the gesture is taking the deck from the heading on screen.
      // Within a card or so it's a step, and the heading follows card by
      // card; further than that it's a flick, so the heading waits for the
      // deck to arrive and swaps once.
      const travel = Math.abs(Math.max(targetRef.current, 0) - committedIdxRef.current);
      // Arrival only counts once the gesture has ended and the target is
      // final — mid-momentum the deck can catch a target that's still
      // creeping forward, which would commit a card it's about to leave.
      const arriving = snappedRef.current && Math.abs(targetRef.current - pos) < 0.5;
      const nearest = clamp(Math.round(Math.max(pos, 0)), 0, max);
      if (
        nearest !== committedIdxRef.current &&
        speed < HEADING_V_COMMIT &&
        (travel <= HEADING_TRAVEL_CARDS || arriving)
      ) {
        committedIdxRef.current = nearest;
        setFocusedIdx(nearest);
        sessionStorage.setItem('homeStack:focusedIdx', String(nearest));
      }

      // Heading visibility: fades while a flick is carrying the deck away
      // from it, and (as a safety net) at very high speed.
      const travelNow = Math.abs(Math.max(targetRef.current, 0) - committedIdxRef.current);
      const wantAlpha =
        (1 - smoothstep((travelNow - HEADING_TRAVEL_CARDS) / 0.6)) *
        (1 - smoothstep((speed - HEADING_V_LOW) / (HEADING_V_HIGH - HEADING_V_LOW)));
      const alphaRate =
        wantAlpha > headingAlphaRef.current ? HEADING_OPEN_RATE : HEADING_CLOSE_RATE;
      headingAlphaRef.current +=
        (wantAlpha - headingAlphaRef.current) * (1 - Math.exp(-alphaRate * dt));
      const alpha = headingAlphaRef.current;
      for (const el of [
        headingFadeRef.current,
        thumbFadeRef.current,
        mobileHeadingFadeRef.current,
        mobileThumbFadeRef.current,
      ]) {
        if (!el) continue;
        el.style.opacity = String(alpha);
        el.style.visibility = alpha < 0.02 ? 'hidden' : 'visible';
      }

      layoutRef.current(pos);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [filteredCards]);

  // Input: wheel, touch and keys move the deck's target. Nothing here
  // moves anything on screen directly — the loop above does that.
  useEffect(() => {
    const max = () => Math.max(0, filteredCards.length - 1);

    /** Moves the target by a number of cards, with give past the ends. */
    const push = (cards: number) => {
      const min = minPosRef.current;
      const intro = min < 0;
      // The intro lift is one-way: no pulling the cards back down.
      if (intro && cards < 0) return;
      let t = targetRef.current;
      const pastEnd = cards > 0 ? t >= max() : t <= min;
      t += pastEnd ? cards * OVERSCROLL_RESIST : cards;
      // The intro gesture stops once the cards are seated — leftover delta
      // (trackpad momentum included) is dropped, so the first scroll lands
      // on the headline beat rather than carrying into the next card. The
      // snap then opens the deck for the next gesture.
      t = clamp(t, min - OVERSCROLL, intro ? 0 : max() + OVERSCROLL);
      targetRef.current = t;
      lastInputRef.current = performance.now();
      snappedRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      // Pinch-zoom arrives as ctrl+wheel; leave it to the browser.
      if (e.ctrlKey) return;
      // Horizontal-dominant swipes are the browser's back/forward gesture.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      const unit =
        e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? containerHRef.current : 1;
      // Compress travel within the gesture (see GESTURE_SOFT_CARDS).
      const S = GESTURE_SOFT_CARDS;
      gestureRawRef.current += (e.deltaY * unit) / WHEEL_PX_PER_CARD;
      const out = S * Math.atan(gestureRawRef.current / S);
      const step = out - gestureOutRef.current;
      gestureOutRef.current = out;
      push(step);
    };

    // Touch: the finger drags the deck 1:1, and a release carries on with
    // the swipe's velocity before settling. Locks to the first axis moved,
    // so horizontal swipes (the filter chip row) still scroll natively.
    let touchX = 0;
    let touchY = 0;
    let touchT = 0;
    let touchV = 0; // px per second
    let axis: 'x' | 'y' | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
      touchT = performance.now();
      touchV = 0;
      axis = null;
      // Catch the deck where it is, like putting a finger on a moving list.
      targetRef.current = posRef.current;
      lastInputRef.current = touchT;
      snappedRef.current = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      if (axis === null) {
        const dx = Math.abs(x - touchX);
        const dy = Math.abs(y - touchY);
        if (dx < 4 && dy < 4) return;
        axis = dx > dy ? 'x' : 'y';
      }
      if (axis === 'x') return;
      e.preventDefault();
      const now = performance.now();
      const dy = touchY - y;
      const dt = Math.max(1, now - touchT) / 1000;
      touchV += (dy / dt - touchV) * 0.5;
      touchY = y;
      touchT = now;
      push(dy / TOUCH_PX_PER_CARD);
    };
    const onTouchEnd = () => {
      if (axis !== 'y') return;
      // A finger that stopped before lifting shouldn't fling.
      if (performance.now() - touchT > 80) touchV = 0;
      const flingV =
        Math.sign(touchV) * Math.max(0, Math.abs(touchV) - TOUCH_FLING_MIN_V);
      const fling = (flingV * TOUCH_FLING_S) / TOUCH_PX_PER_CARD;
      push(GESTURE_SOFT_CARDS * Math.atan(fling / GESTURE_SOFT_CARDS));
      // Snap on the next frame rather than after the idle wait.
      lastInputRef.current = 0;
    };

    const onKey = (e: KeyboardEvent) => {
      const down = ['ArrowDown', 'PageDown', ' '].includes(e.key);
      const up = ['ArrowUp', 'PageUp'].includes(e.key);
      if (!down && !up) return;
      e.preventDefault();
      if (minPosRef.current < 0) {
        // A down-key during the intro seats the cards in one press.
        if (down) goTo(0);
        return;
      }
      goTo(Math.round(targetRef.current) + (down ? 1 : -1));
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
    };
    // goTo only touches refs, so the stale closure is safe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCards]);

  const focusY = containerH * FOCUS_Y_RATIO;
  const focusedTop = focusY - FOCUS_LABEL_OFFSET;

  // Both layouts stay mounted (CSS picks one), but React allows only one
  // <ViewTransition> per name at a time — so only the thumbnail in the
  // layout that's showing carries the hero-morph name, and neither does
  // until the layout is known (otherwise the name would hop from one to the
  // other after hydration, briefly held by both).
  const isDesktop = useIsDesktop();
  const heroName = heroTransitionName(focused.project);

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
            the pre-roll; the inner wrapper fades with deck speed. */}
        <div
          // shrink-0: the column is h-full, so without it flex compresses this
          // block below its content height and the last line of a long heading
          // renders out of the box, under the thumbnail. The cards stack below
          // (flex-1 min-h-0) is the element meant to absorb leftover space.
          className="relative mt-2 shrink-0"
          style={{
            opacity: headlineRevealed ? 1 : 0,
            transition: 'opacity 500ms ease-out',
          }}
        >
          <div ref={mobileHeadingFadeRef}>
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
        </div>

        {/* Hero image — full-width thumbnail below the heading; its own
            aspect drives the height (no fixed box, no background). Links
            to the focused card's use case. Hidden for cards in
            NO_THUMBNAIL_IDS. */}
        {focused && !NO_THUMBNAIL_IDS.has(focused.id) && (
          <div ref={mobileThumbFadeRef} className="shrink-0">
            <Link
              href={projectHref(focused.project)}
              onClick={() => {
                markProjectNavSource('card');
                markHeroMorph();
              }}
              className="block w-full shrink-0"
              onMouseEnter={() => setThumbHovered(true)}
              onMouseLeave={() => setThumbHovered(false)}
            >
              <ViewTransition
                name={isDesktop === false ? heroName : undefined}
                share="hero-morph"
                default="none"
              >
                <img
                  key={`mobile-img-${focused.id}`}
                  src={focused.imageMobile ?? focused.image}
                  alt={focused.label}
                  className="w-full rounded-[12px]"
                  // 400ms delay (with `both` fill) holds the thumbnail hidden
                  // until the card transition settles, so it doesn't fade in
                  // over the still-animating outgoing headline.
                  style={{
                    animation:
                      'home-stack-in 320ms cubic-bezier(.2,.8,.2,1) 400ms both',
                  }}
                />
              </ViewTransition>
            </Link>
          </div>
        )}

        {/* Cards stack — the cards below focus, positioned by the loop.
            Clipped so a card sliding up into the heading disappears under
            its edge rather than over the thumbnail. */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          {filteredCards.map((card, i) => (
            <div
              key={`mobile-${card.id}`}
              className="absolute left-0 right-0 top-0"
              style={{
                height: SMALL_H,
                opacity: cardsEntered ? 1 : 0,
                transform: cardsEntered ? 'translateY(0)' : 'translateY(24px)',
                transition:
                  'opacity 500ms ease-out, transform 500ms cubic-bezier(.2,.8,.2,1)',
                transitionDelay: `${Math.max(0, i - focusedIdx) * 70}ms`,
              }}
            >
              <div
                data-deck="mobile"
                data-id={card.id}
                style={{ willChange: 'transform, opacity' }}
              >
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  className="block w-full text-left"
                >
                  <ProjectCard title={card.label} role={card.description} className="min-h-[90px]" />
                </button>
              </div>
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
        {/* Every card is rendered; the loop positions each one from the
            deck position and fades those outside the visible window. The
            outer wrapper only carries the one-time entry fade. */}
        {filteredCards.map((card, i) => (
          <div
            key={card.id}
            className="absolute left-0 top-0"
            style={{
              right: 0,
              height: SMALL_H,
              opacity: cardsEntered ? 1 : 0,
              transform: cardsEntered ? 'translateY(0)' : 'translateY(24px)',
              transition:
                'opacity 500ms ease-out, transform 500ms cubic-bezier(.2,.8,.2,1)',
              transitionDelay: cardsEntered
                ? `${Math.max(0, i - focusedIdx) * 70}ms`
                : '0ms',
            }}
          >
            <div
              data-deck="desktop"
              data-id={card.id}
              style={{ willChange: 'transform, opacity' }}
            >
              <button
                type="button"
                onClick={() => goTo(i)}
                className="block max-w-[420px] w-full text-left"
              >
                <ProjectCard title={card.label} role={card.description} />
              </button>
            </div>
          </div>
        ))}

        {/* Focused heading — entering and leaving copies share one wrapper
            whose opacity follows deck speed. The outer wrapper holds the
            whole block invisible during the mount pre-roll. */}
        <div
          className="absolute left-0 pointer-events-none"
          style={{
            top: focusedTop,
            right: 0,
            opacity: headlineRevealed ? 1 : 0,
            transition: 'opacity 500ms ease-out',
          }}
        >
          <div ref={headingFadeRef} className="relative">
            <div className="pointer-events-auto">
              <FocusedContent
                key={`entering-${focused.id}`}
                card={focused}
                refEl={enteringRef}
                thumbHovered={thumbHovered}
              />
            </div>
            {/* Leaving card — same position; its words animate out via GSAP. */}
            {leavingCard && (
              <div className="absolute inset-x-0 top-0">
                <FocusedContent
                  key={`leaving-${leavingCard.id}`}
                  card={leavingCard}
                  refEl={leavingRef}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right phone image — shown from lg upward at responsive sizes.
          Pulled inward off the right margin so it sits closer to the
          big text, and vertically centered around focusY so it sits
          higher. Fades with deck speed alongside the heading.

          Layered transition: when focus changes the *outgoing* image
          stays in place (no exit animation) and the new image fades
          in on top of it. Visually feels like a stack of cards being
          dropped on top of each other rather than a swap. */}
      {focused && !NO_THUMBNAIL_IDS.has(focused.id) && (
        <div
          ref={thumbFadeRef}
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
            onClick={() => {
              markProjectNavSource('card');
              markHeroMorph();
            }}
            className="absolute inset-0 flex items-center justify-center"
            onMouseEnter={() => setThumbHovered(true)}
            onMouseLeave={() => setThumbHovered(false)}
          >
            {/* Shares a view-transition name with the case study hero, so
                opening the project morphs this image into it. Keyed inside,
                on the image: the wrapper persists across cards, so moving
                between two cards of the same project never mounts a second
                wrapper with the same name. */}
            <ViewTransition
              name={isDesktop === true ? heroName : undefined}
              share="hero-morph"
              default="none"
            >
              <img
                key={focused.id}
                src={focused.image}
                alt={focused.label}
                className="max-h-full max-w-full object-contain rounded-[12px]"
                style={{ animation: 'home-stack-in 320ms cubic-bezier(.2,.8,.2,1)' }}
              />
            </ViewTransition>
          </Link>
        </div>
      )}
      </div>
    </div>
  );
}
