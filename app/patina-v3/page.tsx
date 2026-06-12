'use client';

import { Fragment, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import Lenis from 'lenis';
import Snap from 'lenis/snap';
import { Header } from '../../src/components/Header/Header';
import { BackButton } from '../../src/components/BackButton/BackButton';
import { RevealOnScroll } from '../../src/components/RevealOnScroll/RevealOnScroll';
import { ExternalLink } from '../../src/components/ExternalLink/ExternalLink';
import { QAItem } from '../../src/components/QAItem/QAItem';
import { Screensaver } from '../../src/components/Screensaver/Screensaver';
import { PatinaHeroVideo } from '../_shell/PatinaHeroVideo';
import { SmokeCanvas } from '../patina-v2/SmokeCanvas';
import { CaseStudyReadMarker } from '../_shell/CaseStudyReadMarker';

/**
 * EXPERIMENT — Patina case study, HYBRID (v3).
 *
 * Same content + sequence as /patina-v2, but rendered in the calm
 * `@container` 50/50 cream-card grid of the original case study
 * (app/_shell/PatinaContent.tsx). Mostly gentle fade-ins; the pinned
 * phones / pinned text from v2 are kept, but now housed INSIDE the cream
 * grid cards (PinnedColumn within the grid) rather than floating full-bleed.
 *
 * Standalone page at /patina-v3 (hidden route, not linked from nav).
 */

/** Shared per-frame update registry, ticked once per Lenis rAF frame so the
 *  PinnedColumn pins move in lockstep with the smoothed scroll. */
const frameCallbacks = new Set<() => void>();

/** The page's live Lenis instance, shared so feature components (e.g. the
 *  learnings snap) can attach to the same smooth-scroll instance. Subscribers
 *  are notified when it is created/destroyed. */
let activeLenis: Lenis | null = null;
const lenisSubscribers = new Set<(lenis: Lenis | null) => void>();
function setActiveLenis(lenis: Lenis | null) {
  activeLenis = lenis;
  lenisSubscribers.forEach((fn) => fn(lenis));
}
function onLenis(fn: (lenis: Lenis | null) => void) {
  lenisSubscribers.add(fn);
  fn(activeLenis);
  return () => {
    lenisSubscribers.delete(fn);
  };
}

function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis();
    setActiveLenis(lenis);
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      frameCallbacks.forEach((cb) => cb());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      setActiveLenis(null);
      lenis.destroy();
    };
  }, []);

  return (
    <style>{`
      html.lenis, html.lenis body { height: auto; }
      .lenis.lenis-smooth { scroll-behavior: auto !important; }
      .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
      .lenis.lenis-stopped { overflow: hidden; }
      .lenis.lenis-smooth iframe { pointer-events: none; }
    `}</style>
  );
}

/**
 * Frame-synced pin (copied from patina-v2). Holds its child via translateY
 * written each Lenis frame; releases once the LAST item of the sibling grid
 * column reaches the bottom of the viewport. Active only ≥ md; below that the
 * child is a normal in-flow block. The pinned child must be SHORTER than the
 * scrolling sibling column for there to be travel.
 */
function PinnedColumn({
  children,
  className,
  pinTop,
}: {
  children: ReactNode;
  className?: string;
  pinTop?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    if (!track || !pin) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const update = () => {
      const row = track.parentElement;
      // Pin only while this column is laid out side-by-side with its sibling
      // (grid is 2-col). When stacked to 1-col the track fills the row width —
      // skip pinning. This keys off the real layout, so it's robust to the
      // container-query (@[768px]) vs viewport breakpoint mismatch.
      if (!row || track.offsetWidth >= row.clientWidth - 1) {
        pin.style.transform = '';
        return;
      }
      const rowRect = row.getBoundingClientRect();
      const childH = pin.offsetHeight;
      const vh = window.innerHeight;
      const anchorTop = pinTop != null ? pinTop : (vh - childH) / 2;
      // Pin until the card's bottom reaches the bottom of the row, then release.
      // This lands the card with the same gap to the next section as the
      // scrolling column beside it (the standard 16px), instead of releasing
      // early — which left a large empty gap below the short card.
      const maxShift = rowRect.height - childH;
      const shift =
        maxShift <= 0 ? 0 : Math.min(maxShift, Math.max(0, anchorTop - rowRect.top));
      pin.style.transform = `translateY(${shift.toFixed(2)}px)`;
    };
    update();
    frameCallbacks.add(update);
    window.addEventListener('resize', update);
    return () => {
      frameCallbacks.delete(update);
      window.removeEventListener('resize', update);
    };
  }, [pinTop]);

  return (
    <div ref={trackRef} className={className}>
      <div ref={pinRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────── DATA (from patina-v2) ───────────────────────────

const METADATA_LINES = [
  'Role .......... Solo design and vibe coding, end to end',
  'Scope ......... Branding, Android app, Website, Generative motion',
  'Tools ......... Figma, Android Studio, Claude Code',
  'Published ..... April 2026',
];

const QA = {
  whyBuild: {
    question: 'Why did you build Patina?',
    answer:
      "I wanted to use my phone less, and I was tired of seeing people get lost in their devices. Other apps solve this through notifications or restrictions, but notifications are easy to ignore, we get too many to notice one more, and restrictions feel like punishment. So I thought about color, something that changes gradually through the day so you notice it before you even unlock. Simple, quiet, no judgment. For people who want awareness, not discipline tools.",
  },
  validate: {
    question: 'How did you validate the concept before starting?',
    answer:
      "Before designing anything I spent one hour manually creating tinted versions of the same wallpaper and set up Android's automation tool to swap them at different times of day. Then I tried it for two days. The color shifts were noticeable and not annoying, so I decided it was worth building it, at least for myself, and it was a chance to experiment with vibe coding and ship a real product solo.",
  },
  impulse: {
    question: 'Can color actually change an automatic impulse?',
    answer:
      "Reaching for the phone is a deep habit that's difficult to break, which is why I chose color, it carries meaning we don't have to learn. Yellow and red signal warning across cultures, so my bet was that something this embedded could hold meaning even after repeated exposure, when most signals lose their impact.\n\nFirst users said the color made them pause before unlocking. Some put the phone down, so the results are promising but I'm still measuring whether it holds up over time, and what could make the signal stronger.",
  },
  colorBlind: {
    question: 'What if you are color blind?',
    answer:
      "I thought about that limitation from the beginning and I tested the colors for color blindness. They read differently but not differently enough to make the signal clear. I made the decision to design for most users first and ship. I'm working now on a solution for people with color vision differences.",
  },
  nameOrigin: {
    question: 'Why the name Patina?',
    answer:
      "Patina is the layer that forms on materials over time. It's a process I hear about a lot in architecture. After a few ideas this one felt right immediately. Something that accumulates with use and time. That's exactly what the app does to your wallpaper.",
  },
  minimalist: {
    question: 'The app experience is very minimalist. Why?',
    answer:
      "Every decision followed three rules: quiet, simple, no friction. Anything that didn't meet them was removed. Visually, the app had to feel warm, calm, and easy to use.\n\nThe homepage reflects that: your daily screen time limit and active wallpaper are visible upfront, with no need to open a settings page.\n\nThere is also a subtle living element that shifts color over time, mirroring the wallpaper. It's just color and shape moving slowly, intended to create a calming effect and gently slow you down.",
  },
  websiteIntro: {
    question:
      "The website intro has a completely different visual style from Patina's color palette and vibe. Why?",
    answer:
      'I wanted to tell a story of a problem that meets a solution. So I thought about what visual environment could express the feeling of being trapped, of repetition with no control. Black and white felt right for that, it reinforces the heaviness of it. Then color arrives as the solution. You snap out of the repetition and back into the real colorful world. That contrast is intentional.',
  },
  giveUp: {
    question: 'What almost made you give up?',
    answer:
      "The tint wasn't resetting overnight automatically. You had to open the app, which destroyed the core concept. The whole point was that it works silently in the background without you doing anything.\n\nI kept pushing with AI until we found the answer together. But that solution added some friction. So I had to make a decision: accept some friction at onboarding so the core concept could live.\n\nWhile testing with users I realized that tradeoff might cost me more than I thought. I iterated and I'm still measuring the results.",
  },
  biggestMistake: {
    question: 'What was the biggest design mistake so far?',
    answer:
      "Ignoring a pain point I knew would hurt acquisition. What I really wanted was to tint the user's existing wallpaper without them having to choose a new one. Android doesn't allow that. So users had to find an image in their gallery just to complete onboarding. That's real friction at the worst possible moment. I knew it was a problem and launched anyway. I've since added in-app wallpaper options so users can pick one and move on.",
  },
  whatsNext: {
    question: "What's next for Patina?",
    answer:
      "Two things are coming before real distribution:\n\nFirst, the homepage is getting today and weekly screen time stats, which means reorganising the layout and moving settings out. Tabs system make it easier jumping between today, week and settings. Simple nav.\n\nSecond, I am testing a lock screen shake feature that shows your exact screen time without unlocking, offering more precise awareness and a partial solution for color blindness. Because shaking feels a bit contradictory to Patina's quiet nature, it might become a setting to keep the number always visible instead. Either way, it was fun to try.\n\nPatina is still early. I haven't started active distribution because I want clean measurement in place first. The core question is whether the wallpaper actually shifts screen time, not just whether people notice the colour.",
  },
};

const STATS: ReadonlyArray<{ value: string; label: string; caption: string }> = [
  { value: '76.9%', label: 'Install Retention', caption: 'Since launch (April 2026)' },
  {
    value: '87%',
    label: 'Decrease in screen time limit reached',
    caption: 'Could mean behaviour change or that users increased their daily limit.',
  },
  {
    value: '80%',
    label: 'Paused before unlocking',
    caption: 'From a preliminary survey of 12 early users.',
  },
];

// ──────────────── GRID HELPERS (adapted from PatinaContent.tsx) ────────────────

/** Q&A typography matched to patina-v2 (question 30px / −1px / lh 36; answer
 *  18px / −0.02em / lh 26), but as fluid clamp() font-sizes so it scales down
 *  smoothly toward mobile. Letter-spacing and line-height are em/unitless so
 *  they scale with the font. Applied to the shared QAItem via child selectors —
 *  the first <p> is the question, every following <p> is an answer paragraph —
 *  so the shared component (used by the live case study) stays untouched. */
const QA_TYPE =
  '[&>p:first-child]:text-[clamp(20px,calc(18.51px_+_0.381vw),24px)] [&>p:first-child]:leading-[1.33] [&>p:first-child]:tracking-[-0.029em]! [&>p:first-child]:font-medium ' +
  '[&>p~p]:text-[17px] [&>p~p]:leading-[1.625] [&>p~p]:tracking-[-0.01em] [&>p~p]:font-[350]';

function QACard({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-[20px] p-8 @[1100px]:p-20 flex items-center bg-background-card-warm">
      <QAItem
        question={question}
        answer={answer}
        size="lg"
        className={`mx-auto max-w-[450px] ${QA_TYPE}`}
      />
    </div>
  );
}

function StatCard({ value, label, caption }: { value: string; label: string; caption: string }) {
  return (
    <div className="h-full bg-background-card-warm rounded-[20px] flex flex-col justify-between gap-8 p-8">
      <div className="flex flex-col gap-3">
        <p className="text-display-stat text-accent-secondary">{value}</p>
        <p className="text-metadata-md leading-[1.5]! @[768px]:leading-[2]! text-accent-secondary">
          {label}
        </p>
      </div>
      <p className="text-metadata-md leading-[1.5]! @[768px]:leading-[2]! text-text-secondary">
        {caption}
      </p>
    </div>
  );
}

/** In-grid image that fills its cell. */
function FillImage({ src, alt, aspect }: { src: string; alt: string; aspect: string }) {
  return (
    <div className={`w-full ${aspect} relative rounded-[20px] overflow-hidden`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 1100px, 100vw"
        quality={92}
        className="object-cover"
      />
    </div>
  );
}

/** Cream phone panel with the live app video (new-main-video.mp4).
 *
 *  The phone box uses the skin PNG's real aspect ratio (1716×3384) so the
 *  skin art fills it with no letterbox — meaning this box === the skin's
 *  visible box. The video is then absolutely placed into the skin's
 *  transparent screen rectangle, measured from the PNG alpha channel:
 *    left/right 4.25%, top 1.45%, bottom 1.51%  →  w 91.49%, h 97.05%
 *  Expressed as % of this box, the video and skin are locked together and
 *  scale as one unit on every screen size (no fixed px, no manual nudges). */
function PhoneVideoCard({ src = '/patina/new-main-video.mp4' }: { src?: string }) {
  return (
    <div className="w-full min-h-full aspect-[677/887] rounded-[20px] relative flex items-center justify-center bg-background-panel-cream overflow-hidden">
      <div className="relative h-[72%] aspect-[1716/3504]">
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute left-1/2 -translate-x-1/2 top-[-2.37%] w-[93.78%] aspect-[864/1920] object-cover [clip-path:inset(2.99%_0_0_0_round_13%/5.85%)]"
        />
        <Image
          src="/patina/skin-long.png"
          alt="Patina app frame"
          fill
          sizes="360px"
          className="object-contain pointer-events-none"
        />
      </div>
    </div>
  );
}

/** Cream phone panel holding a still phone-mockup screenshot, centered. */
function PhonePanelCard({
  src,
  alt,
  imgAspect = 'aspect-[834/1720]',
}: {
  src: string;
  alt: string;
  imgAspect?: string;
}) {
  return (
    <div className="w-full @[768px]:min-h-full aspect-[677/887] rounded-[20px] relative flex items-center justify-center bg-background-panel-cream overflow-hidden">
      <div className={`relative h-[69%] ${imgAspect}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 360px, 50vw"
          className="object-contain"
        />
      </div>
    </div>
  );
}

/** Tinting phone — crossfades through the 4 screen-time tint states, centered
 *  on a cream panel exactly like the other phone cards (h-[69%], object-contain).
 *  No-glare crossfade: the frames are stacked, and only the incoming frame fades
 *  in (on top) while the previous one stays fully opaque underneath — so the
 *  cream background never shows through mid-transition. Respects reduced-motion
 *  (holds the first frame). */
const TINT_FRAMES = [
  '/patina/phone.png',
  '/patina/phone2.png',
  '/patina/phone3.png',
  '/patina/phone4.png',
];
function TintPhonePanel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % TINT_FRAMES.length);
    }, 2600);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="w-full min-h-full aspect-[677/887] rounded-[20px] relative flex items-center justify-center bg-background-panel-cream overflow-hidden">
      <div className="relative h-[69%] aspect-[834/1719]">
        {TINT_FRAMES.map((src, i) => {
          // Sequential cycle, so the previous frame is always idx - 1. The
          // current frame fades in on top (z-20); the previous stays opaque
          // just beneath it (z-10) so nothing shows through during the fade.
          const isCurrent = i === idx;
          const isPrev = i === (idx - 1 + TINT_FRAMES.length) % TINT_FRAMES.length;
          return (
            <Image
              key={src}
              src={src}
              alt="Patina — screen time tints the wallpaper"
              fill
              sizes="(min-width: 768px) 360px, 50vw"
              priority={i === 0}
              className={`object-contain transition-opacity duration-1000 ease-in-out ${
                isCurrent
                  ? 'opacity-100 z-20'
                  : isPrev
                    ? 'opacity-100 z-10'
                    : 'opacity-0 z-0'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Smoke shader (Patina's generative tint) in a cream grid cell. `min-h-full`
 *  lets it stretch to fill a taller neighbouring column (e.g. two stacked
 *  Q&A cards) instead of leaving a gap below its aspect-ratio height.
 *
 *  The canvas is rendered 10% smaller (`scale-90`) and nudged 20px right
 *  (`translate-x-[20px]`) via CSS — scoped to this page so the shared
 *  SmokeCanvas shader (also used by the live /patina-v2) stays untouched.
 *  The canvas is transparent and the cell is cream, so shrinking/shifting it
 *  only moves the smoke blob; the surrounding cream is unaffected. */
function SmokeCell() {
  return (
    <div className="w-full min-h-full aspect-[677/887] rounded-[20px] relative overflow-hidden bg-background-panel-cream">
      <SmokeCanvas className="absolute inset-0 block h-full w-full translate-x-[20px] scale-90" />
    </div>
  );
}

// ─────────────── "What did you learn?" rows (kept from patina-v2) ───────────────

/** One learning — a row with a hairline top divider (v2 style), in the right
 *  portion (number + answer aligned to the right-hand Q&A column). `first`
 *  drops the top divider and top padding so the first answer sits flush with
 *  the pinned heading (no line above it). */
function LearnRow({
  n,
  first,
  children,
}: {
  n: string;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex flex-col @[768px]:flex-row items-start gap-4 @[768px]:gap-6 @[1100px]:gap-[100px] @[1100px]:justify-end @[1100px]:pr-[max(0px,calc(25cqw_-_309px))] ${
        first ? 'pb-12 @[1100px]:pb-[12vh]' : 'border-t border-black/10 py-12 @[1100px]:py-[12vh]'
      }`}
    >
      <span className="shrink-0 text-[40px] leading-none font-medium text-text-primary md:text-[56px]">
        {n}
      </span>
      <div className="max-w-[450px] text-[17px] leading-[28px] tracking-[-0.28px] text-text-secondary">
        {children}
      </div>
    </div>
  );
}

function LearnLead({ children }: { children: ReactNode }) {
  return <span className="font-medium text-text-primary">{children}</span>;
}

/**
 * "What did you learn?" with a pinned question and answers that fade in with
 * a soft upward motion, one at a time, as each scrolls into view (standard
 * RevealOnScroll, like every other block on the page). The question is sticky
 * (pinned) on desktop and sits vertically centered on answer 1; below
 * @[1100px] it isn't pinned (it stacks above the answers). Lenis snap still
 * eases the scroll to rest with each answer centred on the pinned question.
 */
/** The number+text block of an answer lives two levels inside the row
 *  wrapper (wrapper → RevealOnScroll div → LearnRow → [number, text]). These
 *  measure that block only — excluding the wrappers and the row's padding —
 *  so the pinned question can centre on the visible content and the snap
 *  points land on it. The RevealOnScroll div is translated down while still
 *  hidden, so its current translateY is subtracted to get the true layout
 *  position regardless of reveal state. */
function answerInner(wrapper: HTMLElement) {
  const reveal = wrapper.firstElementChild as HTMLElement | null;
  const inner = (reveal?.firstElementChild ?? reveal ?? wrapper) as HTMLElement;
  // Pre-reveal, RevealOnScroll holds its div at translateY(offset) — remove
  // that shift so measures reflect the settled layout, not the animation.
  let shift = 0;
  if (reveal) {
    const t = getComputedStyle(reveal).transform;
    if (t.startsWith('matrix(')) {
      const parts = t.slice(7, -1).split(',');
      if (parts.length === 6) shift = parseFloat(parts[5]) || 0;
    }
  }
  let top = Infinity;
  let bottom = -Infinity;
  for (const child of Array.from(inner.children)) {
    const r = child.getBoundingClientRect();
    top = Math.min(top, r.top);
    bottom = Math.max(bottom, r.bottom);
  }
  if (bottom <= top) {
    const r = inner.getBoundingClientRect();
    return { top: r.top - shift, bottom: r.bottom - shift };
  }
  return { top: top - shift, bottom: bottom - shift };
}
function measureContentHeight(wrapper: HTMLElement) {
  const { top, bottom } = answerInner(wrapper);
  return bottom - top;
}
function measureContentCenterDoc(wrapper: HTMLElement) {
  const { top, bottom } = answerInner(wrapper);
  return (top + bottom) / 2 + window.scrollY;
}

function LearningsReveal({ rows }: { rows: ReactNode[] }) {
  const qRef = useRef<HTMLHeadingElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [qOffset, setQOffset] = useState(0);

  // Whether the pinned (question-beside-answers) layout is actually active.
  // Must key off the real layout — the @[1100px] CONTAINER query — not a
  // viewport media query: with the page's px-20 padding the container crosses
  // 1100px at a ~1260px viewport, and in between a viewport check reports
  // "pinned" while the layout is stacked.
  const isPinned = () => {
    const w = wrapRef.current;
    return !!w && getComputedStyle(w).display === 'flex';
  };

  useEffect(() => {
    const update = () => {
      const q = qRef.current;
      const firstWrap = rowRefs.current[0];
      if (!q || !firstWrap) return;

      // Mobile: the question isn't pinned (it stacks above the answers), so
      // no centering offset.
      if (!isPinned()) {
        setQOffset((prev) => (prev !== 0 ? 0 : prev));
        return;
      }

      // Desktop: centre the pinned question on answer 1's number+text block —
      // measure the LearnRow's own children, so neither the wrappers nor the
      // row's bottom spacing drags it.
      const contentH = measureContentHeight(firstWrap);
      const off = (contentH - q.offsetHeight) / 2;
      setQOffset((prev) => (Math.abs(prev - off) > 0.5 ? off : prev));
    };

    update();
    frameCallbacks.add(update);
    window.addEventListener('resize', update);
    return () => {
      frameCallbacks.delete(update);
      window.removeEventListener('resize', update);
    };
  }, [rows]);

  // Snap: as you scroll, the page eases to rest with each answer's centre
  // aligned to the pinned question. Attaches to the page's Lenis instance and
  // adds a snap point per answer. Only active where the question is pinned
  // (≥1100px); 'proximity' so scrolling stays free between answers.
  useEffect(() => {
    let snap: Snap | null = null;
    let pointRemovers: Array<() => void> = [];
    let detachResize: (() => void) | null = null;

    const build = () => {
      pointRemovers.forEach((r) => r());
      pointRemovers = [];
      const first = rowRefs.current[0];
      if (!snap || !first || !isPinned()) return;
      // Question pins at top:100px, centred on answer 1's content. Each snap
      // target is the scroll where that answer's content centre meets the line.
      const pinLineY = 100 + measureContentHeight(first) / 2;
      rowRefs.current.forEach((el) => {
        if (!el) return;
        const target = measureContentCenterDoc(el) - pinLineY;
        if (target >= 0) pointRemovers.push(snap!.add(target));
      });
    };

    const unsub = onLenis((lenis) => {
      pointRemovers.forEach((r) => r());
      pointRemovers = [];
      detachResize?.();
      detachResize = null;
      if (snap) {
        snap.destroy();
        snap = null;
      }
      if (!lenis || !isPinned()) return;
      snap = new Snap(lenis, {
        type: 'proximity',
        distanceThreshold: '15%',
        duration: 0.6,
      });
      build();
      const onResize = () => build();
      window.addEventListener('resize', onResize);
      detachResize = () => window.removeEventListener('resize', onResize);
    });

    return () => {
      unsub();
      pointRemovers.forEach((r) => r());
      detachResize?.();
      if (snap) snap.destroy();
    };
  }, [rows]);

  return (
    <section className="rounded-[20px] bg-background-card-warm px-8 py-16 @[1100px]:px-20 @[1100px]:py-32">
      <div ref={wrapRef} className="@[1100px]:flex @[1100px]:items-start">
        <div className="@[1100px]:sticky @[1100px]:top-[100px] @[1100px]:self-start">
          {/* Same question typography as the v3 QACards (QA_TYPE). */}
          <h2
            ref={qRef}
            className="text-[clamp(20px,calc(18.51px_+_0.381vw),24px)] leading-[1.33] tracking-[-0.029em]! font-medium text-text-primary @[1100px]:pl-[max(0px,calc(25cqw_-_309px))]"
            style={{ transform: `translateY(${qOffset}px)` }}
          >
            What did you learn?
          </h2>
        </div>
        {/* A little bottom space lets the last answer scroll up level with the
            pinned question; the main scroll length comes from the generous
            spacing between the rows above, so there's no big end gap. */}
        <div className="mt-12 @[1100px]:mt-0 @[1100px]:flex-1 @[1100px]:pb-[10vh]">
          {rows.map((row, i) => (
            <div
              key={i}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
            >
              <RevealOnScroll offset={72} duration={900}>{row}</RevealOnScroll>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Small related-project card (kept from patina-v2). */
function ProjectCard({
  src,
  label,
  children,
}: {
  src: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-sm bg-background-card-soft p-3 no-underline ring-1 ring-black/[0.08] md:min-w-0 md:flex-1 md:max-w-[450px]">
      <div className="relative h-[80px] w-[115px] shrink-0 overflow-hidden rounded-[4px]">
        <Image src={src} alt={label} fill sizes="115px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-col gap-1 transition-opacity duration-fast ease-out group-hover:opacity-70">
        <span className="text-label-sm tracking-[0.06em]! text-text-primary">{label}</span>
        <span className="text-body-lg text-text-primary line-clamp-2">{children}</span>
      </div>
    </div>
  );
}

// Reusable grid-section class. Pinned rows reuse this and add
// `@[768px]:items-start` so the PinnedColumn stays short enough to pin.
const ROW = 'grid grid-cols-1 @[768px]:grid-cols-2 gap-[16px]';

/** Splits a string into per-word spans (`.word`, inline-block) so an animation
 *  can target each word. A normal space text node sits between words so they
 *  wrap and space like ordinary text. */
function Words({ text, className }: { text: string; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className={`word inline-block will-change-[transform,opacity] ${className ?? ''}`}>
            {word}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Cover-and-reveal intro (ported from Vodafone v3). On desktop only the opening
 * line shows above the hero; the rest of the intro (second paragraph + metadata
 * + link) sits hidden BEHIND the hero. Scrolling holds the hero fixed while that
 * text scrolls up and emerges above the hero's top edge, then the hero releases.
 * Words stagger in (gsap) once fonts are ready. Desktop + motion-safe only — on
 * mobile / reduced-motion it's a normal stacked column.
 */
function IntroHeroCover() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroTrackRef = useRef<HTMLDivElement>(null);
  const heroPinRef = useRef<HTMLDivElement>(null);

  const [textReady, setTextReady] = useState(false);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTextReady(true);
      return;
    }
    const words = Array.from(root.querySelectorAll<HTMLElement>('.word'));
    const metaLines = Array.from(root.querySelectorAll<HTMLElement>('.meta-line'));
    const tweens: gsap.core.Tween[] = [];
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      setTextReady(true);
      tweens.push(
        gsap.fromTo(
          words,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out', stagger: 0.05 },
        ),
      );
      if (metaLines.length) {
        tweens.push(
          gsap.fromTo(
            metaLines,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out', stagger: 0.05, delay: 0.15 },
          ),
        );
      }
    };
    document.fonts?.ready.then(run).catch(run);
    const fallback = window.setTimeout(run, 1500);
    return () => {
      tweens.forEach((t) => t.kill());
      window.clearTimeout(fallback);
    };
  }, []);

  // Frame-synced pin: hold the hero at its initial viewport position while the
  // text scrolls up behind it, by translating the hero down by the scroll
  // amount, capped to the slack between the hero and its taller grid cell.
  useEffect(() => {
    const active = () =>
      window.matchMedia('(min-width: 768px)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const update = () => {
      const track = heroTrackRef.current;
      const pin = heroPinRef.current;
      if (!track || !pin) return;
      if (!active()) {
        pin.style.transform = '';
        return;
      }
      const maxShift = track.offsetHeight - pin.offsetHeight;
      const shift = maxShift <= 0 ? 0 : Math.min(maxShift, Math.max(0, window.scrollY));
      pin.style.transform = `translateY(${shift.toFixed(2)}px)`;
    };
    update();
    frameCallbacks.add(update);
    window.addEventListener('resize', update);
    return () => {
      frameCallbacks.delete(update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const TEXT_PAD = 'pl-8 @[1100px]:pl-[max(80px,calc(25cqw_-_229px))]';
  const BIG_TEXT =
    'max-w-[935px] font-[350] text-[clamp(32px,calc(23.09px_+_2.286vw),56px)] leading-[1.08] tracking-[-0.045em] text-text-primary';

  return (
    <div ref={rootRef} className="md:relative">
      {/* Plain CSS so it ships in the server HTML (no load shift). The grid
          only turns on ≥768px with motion allowed; otherwise it's a normal
          column with all text visible. */}
      <style>{`
        .iho-stack { margin-top: 1.08em; }
        .iho-text { padding-bottom: 40px; }
        @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
          .iho-stack { display: grid; margin-top: 128px; }
          .iho-stack > * { grid-area: 1 / 1; }
          .iho-text { padding-bottom: calc(100dvh + 88px); }
        }
      `}</style>

      {/* Opening line — in normal flow, words stagger in once fonts are ready. */}
      <div
        className={`pt-[104px] ${TEXT_PAD}`}
        style={{ visibility: textReady ? 'visible' : 'hidden' }}
      >
        <div className={BIG_TEXT}>
          <p className="mb-0">
            <Words text="Patina," className="font-medium" />{' '}
            <Words text="a screen time awareness app that tints your wallpaper as you use your phone." />
          </p>
        </div>
      </div>

      {/* Cover-and-reveal stack: rest of intro (z-0) + hero (z-10) share one
          grid cell so the hero overlaps the text; the text layer's tall bottom
          padding makes the cell taller than the hero — that's the pinned travel. */}
      <div className="iho-stack">
        <div
          className={`iho-text relative z-0 ${TEXT_PAD}`}
          style={{ visibility: textReady ? 'visible' : 'hidden' }}
        >
          <div className={BIG_TEXT}>
            <p className="mb-0">
              <Words text="I designed, vibe coded and shipped it. Solo human + AI, zero to one." />
            </p>
          </div>
          <div className="mt-[88px] flex max-w-[640px] flex-col text-metadata-md text-text-primary">
            {METADATA_LINES.map((line) => (
              <span key={line} className="meta-line whitespace-pre-wrap">
                {line}
              </span>
            ))}
          </div>
          <ExternalLink url="patinascreen.com" className="mt-8" />
        </div>

        {/* Hero layer (z-10, covers the text; stretches to the cell height). */}
        <div ref={heroTrackRef} className="relative z-10">
          <div ref={heroPinRef} className="will-change-transform">
            <div className="w-full h-[100dvh] rounded-[20px] overflow-hidden bg-background-dark relative">
              <PatinaHeroVideo />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatinaV3Page() {
  // Auto-hide header, v1 style: slides out of view while scrolling down (past
  // a small top band) and returns immediately on any upward scroll.
  const [hideHeader, setHideHeader] = useState(false);
  // The mobile back arrow is shown ONLY near the very top of the page — it must
  // not reappear mid-page on scroll-up the way the desktop header does.
  const [atTop, setAtTop] = useState(true);
  useEffect(() => {
    const TOP_BAND = 120; // px from top within which the back arrow is shown
    let lastY = window.scrollY;
    let ticking = false;
    // Reflect the current scroll position immediately (e.g. restored scroll on
    // reload / deep link) instead of waiting for the first scroll event.
    setAtTop(window.scrollY < TOP_BAND);
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setHideHeader(y > lastY && y > 60);
        setAtTop((prev) => {
          const next = y < TOP_BAND;
          return prev !== next ? next : prev;
        });
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-white flex flex-col">
      <SmoothScroll />
      {/* Idle screensaver — same as the v1 shell. */}
      <Screensaver />

      {/* Sticky header — v1 style: standard horizontal Header on an opaque
          white band, hides on scroll down, returns on scroll up. */}
      <Suspense>
        <div
          className={`sticky top-0 z-50 bg-white transition-transform duration-300 ease-out ${
            hideHeader ? '-translate-y-full' : 'translate-y-0'
          }`}
        >
          <div className="w-full px-4 md:px-8 pt-6 pb-6">
            <div className="hidden md:block">
              <Header
                breakpoint="desktop"
                projectLinks={[
                  { label: 'Patina', slug: 'patina', active: true },
                  { label: 'Zebra Finch', slug: 'zebra-finch' },
                  { label: 'Vodafone', slug: 'vodafone' },
                  { label: 'Herc Rentals', slug: 'herc-rentals' },
                ]}
              />
            </div>
            <div
              className={`md:hidden transition-opacity duration-300 ease-out ${
                atTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <BackButton href="/work" ariaLabel="Back to Work" />
            </div>
          </div>
        </div>
      </Suspense>

      <main className="w-full px-4 md:px-20 pb-24">
        <div className="@container flex flex-col gap-[16px]">
          {/* 1 + 2 — Cover-and-reveal: only the opening line shows above the
              hero on load; scrolling slides the rest of the intro out from
              behind the pinned hero, then the hero releases. Desktop only. */}
          <IntroHeroCover />

          {/* 3 — Metrics (3-up; mobile swipe carousel) */}
          <RevealOnScroll offset={72} duration={900}>
            <section className="flex overflow-x-auto snap-x snap-mandatory gap-[16px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden @[768px]:grid @[768px]:grid-cols-3 @[768px]:overflow-visible">
              {STATS.map((stat) => (
                <div key={stat.label} className="shrink-0 w-[85%] snap-start @[768px]:w-auto">
                  <StatCard {...stat} />
                </div>
              ))}
            </section>
          </RevealOnScroll>

          {/* 4 — PIN A: video phone pinned left, whyBuild/validate scroll right */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={ROW}>
              <PhoneVideoCard />
              <div className="flex flex-col gap-[16px] @[768px]:grid @[768px]:grid-rows-2 @[768px]:h-full">
                <QACard {...QA.whyBuild} />
                <QACard {...QA.validate} />
              </div>
            </section>
          </RevealOnScroll>

          {/* 5 — Color banner */}
          <RevealOnScroll offset={72} duration={900}>
            <FillImage
              src="/patina/color-banner2.png"
              alt="Patina color palette banner"
              aspect="aspect-[1217/720]"
            />
          </RevealOnScroll>

          {/* 6 — PIN B: impulse/colorBlind scroll left, tint phone pinned right */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={ROW}>
              <div className="flex flex-col gap-[16px] @[768px]:grid @[768px]:grid-rows-2 @[768px]:h-full">
                <QACard {...QA.impulse} />
                <QACard {...QA.colorBlind} />
              </div>
              <TintPhonePanel />
            </section>
          </RevealOnScroll>

          {/* 7 — Brand logos */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={ROW}>
              <FillImage
                src="/patina/logo1.png"
                alt="Patina brand exploration"
                aspect="aspect-[1362/1106]"
              />
              <FillImage
                src="/patina/logo2.png"
                alt="Patina brand exploration"
                aspect="aspect-[1362/1106]"
              />
            </section>
          </RevealOnScroll>

          {/* 8 — Name origin + Minimalist Q&A stacked in the left column, the
              smoke shader filling the right. */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={ROW}>
              <div className="flex flex-col gap-[16px] @[768px]:grid @[768px]:grid-rows-2 @[768px]:h-full">
                <QACard {...QA.nameOrigin} />
                <QACard {...QA.minimalist} />
              </div>
              <SmokeCell />
            </section>
          </RevealOnScroll>

          {/* Plausible read-depth: reached roughly halfway (same as v1). */}
          <CaseStudyReadMarker project="patina" depth="middle" />

          {/* 9 — websiteIntro Q&A pinned at the top — a card one image tall
              with the text centered in it — while web1/web2 scroll past. */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={`${ROW} @[768px]:items-start`}>
              <PinnedColumn className="@[768px]:self-start" pinTop={24}>
                <div className="w-full rounded-[20px] bg-background-card-warm flex flex-col justify-center p-8 @[1100px]:p-20">
                  <QAItem
                    question={QA.websiteIntro.question}
                    answer={QA.websiteIntro.answer}
                    size="lg"
                    className={`mx-auto max-w-[450px] ${QA_TYPE}`}
                  />
                </div>
              </PinnedColumn>
              <div className="flex flex-col gap-[16px]">
                <FillImage
                  src="/patina/web1.png"
                  alt="Your phone takes up all the space"
                  aspect="aspect-[677/887]"
                />
                <FillImage
                  src="/patina/web2.png"
                  alt="Been living inside your phone?"
                  aspect="aspect-[677/887]"
                />
              </div>
            </section>
          </RevealOnScroll>

          {/* 10 — Website preview */}
          <RevealOnScroll offset={72} duration={900}>
            <FillImage
              src="/patina/patina-site2.png"
              alt="Patina website preview"
              aspect="aspect-[1217/720]"
            />
          </RevealOnScroll>

          {/* 11 — PIN D: giveUp/biggestMistake scroll left, wallpaper phone pinned right */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={ROW}>
              <div className="flex flex-col gap-[16px] @[768px]:grid @[768px]:grid-rows-2 @[768px]:h-full">
                <QACard {...QA.giveUp} />
                <QACard {...QA.biggestMistake} />
              </div>
              <PhonePanelCard
                src="/patina/phone-images.png"
                alt="Patina — pick a wallpaper screen"
                imgAspect="aspect-[834/1720]"
              />
            </section>
          </RevealOnScroll>

          {/* 12 — whatsNext Q&A pinned at the top (one card tall, text centered)
              while three phones (two stills + the shake video) scroll past. */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={`${ROW} @[768px]:items-start`}>
              <div className="flex flex-col gap-[16px]">
                <PhonePanelCard
                  src="/patina/newPatina.png"
                  alt="Patina — today's screen time tinting the wallpaper"
                  imgAspect="aspect-[858/1720]"
                />
                <PhonePanelCard
                  src="/patina/newPatina2.png"
                  alt="Patina — settings: daily limit, reset time, wallpaper"
                  imgAspect="aspect-[858/1720]"
                />
                <div className="w-full aspect-[1920/1400] rounded-[32px] overflow-hidden relative">
                  <video
                    src="/patina/shake.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
              <PinnedColumn className="order-first @[768px]:order-none @[768px]:self-start" pinTop={24}>
                <div className="w-full rounded-[20px] bg-background-card-warm flex flex-col justify-center p-8 @[1100px]:p-20">
                  <QAItem
                    question={QA.whatsNext.question}
                    answer={QA.whatsNext.answer}
                    size="lg"
                    className={`mx-auto max-w-[450px] ${QA_TYPE}`}
                  />
                </div>
              </PinnedColumn>
            </section>
          </RevealOnScroll>

          {/* 13 — What did you learn? v2-style numbered rows with hairline
              dividers, inside the v3 cream panel. The heading is pinned on the
              left: it starts inline with the first answer, then sticks while the
              answers scroll past, releasing at the section bottom. The numbers +
              answers sit in the right portion (aligned to the right Q&A column);
              the first row drops its top divider (no line above answer 1). Below
              @[1100px] the heading stacks above the rows. */}
          <LearningsReveal
            rows={[
              <LearnRow n="1" first key="1">
                <LearnLead>Knowing is different from understanding.</LearnLead>
                <br />
                {'Owning every product decision alone, what to build, what to cut, what to ship, teaches you to see a product in 360°.'}
                <br />
                {'You know a lot of things in theory until you are the only one responsible for them. Things that once looked like bad management start making sense.'}
              </LearnRow>,
              <LearnRow n="2" key="2">
                <LearnLead>Measuring is the art of asking</LearnLead>
                {" the right questions and filtering the right answers. And sometimes you just don't have enough reliable data to ask the next right question. It's a game of patience."}
              </LearnRow>,
              <LearnRow n="3" key="3">
                <LearnLead>When you have control, you move faster.</LearnLead>
                {" You launch knowing the design isn't perfect, because iteration is entirely yours. No waiting for developers. No convincing stakeholders. That changes how you think about quality and the amount of experimentation you can do."}
              </LearnRow>,
            ]}
          />

          {/* 14 — More projects (no card background — plain full-width block) */}
          <RevealOnScroll offset={72} duration={900}>
            <section className="pt-4 @[1100px]:pt-8">
              <p className="font-[family-name:var(--font-family-mono)] text-[11px] leading-[22px] tracking-[0.06em]! text-text-secondary">
                MORE PROJECTS
              </p>
              <div className="mt-4 flex flex-col gap-4 md:flex-row md:gap-8">
                <ProjectCard src="/vodafone/vodafone3.webp" label="VODAFONE">
                  Joined every user testing session. Watched users react to my work as it
                  happened.
                </ProjectCard>
                <ProjectCard src="/zebra-finch/zebra1.webp" label="ZEBRA FINCH">
                  The future of design isn&apos;t building interfaces. It&apos;s designing the
                  system. I&apos;m building that.
                </ProjectCard>
                <ProjectCard src="/herc/home1.webp" label="HERC RENTALS">
                  Designed a B2B real time fleet management platform that led to 150% growth in
                  12 months.
                </ProjectCard>
              </div>
            </section>
          </RevealOnScroll>

          {/* Plausible read-depth: reached the very end (same as v1). */}
          <CaseStudyReadMarker project="patina" depth="end" />
        </div>
      </main>
    </div>
  );
}
