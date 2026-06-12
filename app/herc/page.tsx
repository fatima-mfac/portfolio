'use client';

import { Fragment, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import Lenis from 'lenis';
import Snap from 'lenis/snap';
import { Header } from '../../src/components/Header/Header';
import { BackButton } from '../../src/components/BackButton/BackButton';
import { RevealOnScroll } from '../../src/components/RevealOnScroll/RevealOnScroll';
import { QAItem } from '../../src/components/QAItem/QAItem';
import { Screensaver } from '../../src/components/Screensaver/Screensaver';
import { SmokeCanvas } from '../patina-v2/SmokeCanvas';
import { FleetCrossfade } from '../_shell/FleetCrossfade';
import { CaseStudyReadMarker } from '../_shell/CaseStudyReadMarker';
import { CaseStudyViewTracker } from '../_shell/CaseStudyViewTracker';
import { projectHref } from '../../src/lib/projectNavSource';

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
  'Role .......... Senior Product Designer',
  'Scope ......... Mobile app, web platform, design system',
  'Tools ......... Figma',
];

const QA = {
  whatItSolves: {
    question:
      'Beyond just browsing for construction gear, what does this platform actually solve for the user?',
    answer:
      "It acts as a command center for managing every piece of equipment and job sites, giving you total control from anywhere. You have real-time analytics, equipment utilization data, diagnostics, alerts.\n\nIt's a predictive management platform. It takes the chaos of a billion-dollar construction site and shrinks it down into an intuitive interface where you can rent, track, secure, and pay for everything easily.",
  },
  role: {
    question: 'What was your role in the team?',
    answer:
      'I was responsible for co-creating the visual direction, building the design system from scratch, designing and prototyping entire flows for complex features. I also handled presentations to very demanding stakeholders.\n\nMy main focus was the fleet management and tracking side of the platform (telematics), which was the most technically demanding and complex part of the product to design for.',
  },
  ui: {
    question: 'Construction is not a beautiful world. How did you approach the UI?',
    answer:
      "We spent a lot of time finding the right balance between functionality and sleekness because the standards were high. But we also had to design for the reality of a job site. This platform was being used on tablets and phones in direct sunlight by stressed project managers.\n\nIn an interface full of data visualization, decoration wasn't an option. We stripped it back as much as possible while still feeling intentional and premium, obsessing over typography scale, color balance, and attention to detail to ensure everything was readable in those harsh conditions.",
  },
  hardest: {
    question: 'What was the hardest design challenge?',
    answer:
      "It was the fleet management system, a live map where users track dozens of pieces of equipment on one screen. You've got trucks, lifts, and excavators, some moving, some idling, and some broken. On top of that we had geofences and job sites. It was a visual mess.\n\nI was responsible for building that visual language from scratch. I started with shapes for categories and specific colors for equipment status. I also built the clustering logic to handle the cognitive load of multiple elements in the map, creating all the rules and logic so the devs could build something that actually worked. It took a lot of testing, but we turned a chaotic map into a precision tool.",
  },
  adoption: {
    question: '150% adoption growth in 12 months. Do you take credit for that?',
    answer:
      "I believe our design played a fundamental part. When clients saw the demos, they could instantly see that the platform was easy to use and extremely useful. We didn't just build a platform, we built a tool that sales teams were proud to demo and customers actually wanted to use every day.",
  },
  differently: {
    question: 'Looking back, what would you do differently?',
    answer:
      "If I were designing this today, I would push much harder for the system to be color-blind proof. At the time, I tried really hard to come up with a system that used both color and text so the user didn't have to rely only on color to understand machine states, but the client decided not to focus on that.",
  },
};

const STATS: ReadonlyArray<{ value: string; label: string; caption: string }> = [
  {
    value: '25%',
    label: 'Quarterly growth in new digital accounts',
    caption: 'Reported by Herc Rentals',
  },
  {
    value: '150%',
    label: 'Management fleet platform adoption growth in 12 months',
    caption: 'Reported by Herc Rentals',
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
    <div className="h-full bg-background-panel-cream rounded-[20px] flex flex-col justify-between gap-8 p-8">
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
      <div className="max-w-[450px] text-[17px] leading-[28px] tracking-[-0.28px] font-[350] text-text-secondary">
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
  slug,
  src,
  label,
  children,
}: {
  slug: string;
  src: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link href={projectHref(slug)} className="group flex items-center gap-3 rounded-sm bg-background-card-soft p-3 no-underline ring-1 ring-black/[0.08] md:min-w-0 md:flex-1 md:max-w-[450px]">
      <div className="relative h-[80px] w-[115px] shrink-0 overflow-hidden rounded-[4px]">
        <Image src={src} alt={label} fill sizes="115px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-col gap-1 transition-opacity duration-fast ease-out group-hover:opacity-70">
        <span className="text-label-sm tracking-[0.06em]! text-text-primary">{label}</span>
        <span className="text-body-lg text-text-primary line-clamp-2">{children}</span>
      </div>
    </Link>
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
 * line shows above the hero; the rest of the intro (second paragraph +
 * metadata) sits hidden BEHIND the hero. Scrolling holds the hero fixed while
 * that text scrolls up and emerges above the hero's top edge, then the hero
 * releases. Words stagger in (gsap) once fonts are ready. Desktop + motion-safe
 * only — on mobile / reduced-motion it's a normal stacked column.
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

  const TEXT_PAD = 'pl-0 md:pl-8 @[1100px]:pl-[max(80px,calc(25cqw_-_229px))]';
  const BIG_TEXT =
    'max-w-[935px] font-[350] text-[clamp(32px,calc(23.09px_+_2.286vw),56px)] leading-[1.08] tracking-[-0.045em] text-text-primary';

  return (
    <div ref={rootRef} className="md:relative">
      {/* Plain CSS so it ships in the server HTML (no load shift). The grid
          turns on at every width with motion allowed; under reduced motion
          it's a normal column with all text visible. The hero is 100dvh at
          every width here, so the pinned-travel padding is 100dvh + 88
          throughout (slack = cell − hero); only the top margin tightens on
          mobile (48 vs 128). */}
      <style>{`
        .iho-stack { margin-top: 1.08em; }
        .iho-text { padding-bottom: 40px; }
        @media (prefers-reduced-motion: no-preference) {
          .iho-stack { display: grid; margin-top: 48px; }
          .iho-stack > * { grid-area: 1 / 1; }
          .iho-text { padding-bottom: calc(100dvh + 88px); }
        }
        @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
          .iho-stack { margin-top: 128px; }
        }
      `}</style>

      {/* Opening line — in normal flow, words stagger in once fonts are ready. */}
      <div
        className={`pt-[24px] md:pt-[104px] ${TEXT_PAD}`}
        style={{ visibility: textReady ? 'visible' : 'hidden' }}
      >
        <div className={BIG_TEXT}>
          <p className="mb-0">
            <Words text="Herc Rentals," className="font-medium" />{' '}
            <Words text="a B2B platform for renting and managing heavy equipment across app and website." />
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
              <Words text="I was part of the product team as Senior Product Designer, owning key features including real time tracking and monitoring of heavy machinery in the field." />
            </p>
          </div>
          <div className="mt-[40px] md:mt-[88px] flex max-w-[640px] flex-col text-metadata-md text-text-primary">
            {METADATA_LINES.map((line) => (
              <span key={line} className="meta-line whitespace-pre-wrap">
                {line}
              </span>
            ))}
          </div>
        </div>

        {/* Hero layer (z-10, covers the text; stretches to the cell height). */}
        <div ref={heroTrackRef} className="relative z-10">
          <div ref={heroPinRef} className="will-change-transform">
            <div className="w-full h-[100dvh] rounded-[20px] overflow-hidden bg-background-hero relative">
              {/* Interactive geofence/fleet-map prototype, isolated in an iframe
                  so its GSAP/SVG stay out of React. */}
              <iframe
                src="/herc/hero-animation.html"
                title="Herc Rentals — fleet map prototype"
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HercV3Page() {
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
      <CaseStudyViewTracker project="herc-rentals" />
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
                  { label: 'Patina', slug: 'patina' },
                  { label: 'Zebra Finch', slug: 'zebra-finch' },
                  { label: 'Vodafone', slug: 'vodafone' },
                  { label: 'Herc Rentals', slug: 'herc-rentals', active: true },
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

          {/* 3 — Metrics (2-up; mobile swipe carousel) */}
          <RevealOnScroll offset={72} duration={900}>
            <section className="flex overflow-x-auto snap-x snap-mandatory gap-[16px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden @[768px]:grid @[768px]:grid-cols-2 @[768px]:overflow-visible">
              {STATS.map((stat) => (
                <div key={stat.label} className="shrink-0 w-[85%] snap-start @[768px]:w-auto">
                  <StatCard {...stat} />
                </div>
              ))}
            </section>
          </RevealOnScroll>

          {/* 4 — Phone + intro Q&As (what it solves / role) */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={ROW}>
              <PhonePanelCard
                src="/herc/lightsON.png"
                alt="Herc Rentals app — light towers, all on"
                imgAspect="aspect-[834/1719]"
              />
              <div className="flex flex-col gap-[16px] @[768px]:grid @[768px]:grid-rows-2 @[768px]:h-full">
                <QACard {...QA.whatItSolves} />
                <QACard {...QA.role} />
              </div>
            </section>
          </RevealOnScroll>

          {/* 5 — Fleet Utilization dashboard (cross-fades through 3 views) */}
          <RevealOnScroll offset={72} duration={900}>
            <FleetCrossfade
              images={[
                { src: '/herc/fleet1-new.png', alt: 'Fleet utilization dashboard' },
                { src: '/herc/fleet2-new.png', alt: 'Fleet management dashboard' },
                { src: '/herc/fleet3-new.png', alt: 'Fleet management dashboard' },
              ]}
            />
          </RevealOnScroll>

          {/* Plausible read-depth: reached roughly halfway (same as v1). */}
          <CaseStudyReadMarker project="herc-rentals" depth="middle" />

          {/* 6 — UI Q&A + equipment phone */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={ROW}>
              <QACard {...QA.ui} />
              <PhonePanelCard
                src="/herc/lights.png"
                alt="Herc Rentals app — light towers & diagnostics"
                imgAspect="aspect-[834/1719]"
              />
            </section>
          </RevealOnScroll>

          {/* 7 — Fleet-map phone LEFT | hardest-challenge Q&A over the
              ripple-pin map card RIGHT. Static pin for now — the animated
              ripple can come later. */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={ROW}>
              <PhonePanelCard
                src="/herc/fleet.png"
                alt="Herc Rentals app — fleet management live map"
                imgAspect="aspect-[834/1719]"
              />
              <div className="flex flex-col gap-[16px]">
                <QACard {...QA.hardest} />
                <div className="relative w-full aspect-[1199/887] rounded-[20px] overflow-hidden">
                  <Image
                    src="/herc/herc-pin-ripple-bg.png"
                    alt="Fleet map with a tracked truck"
                    fill
                    sizes="(min-width: 768px) 605px, 100vw"
                    className="object-cover"
                  />
                  {/* Animated tracked-equipment tag (yellow pin, red alert
                      ripples, "Big Chevy Truck" label) — isolated in an iframe
                      with a transparent body so the map shows through. */}
                  <iframe
                    src="/herc/tag-ripple.html"
                    title="Tracked equipment pin animation"
                    loading="lazy"
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              </div>
            </section>
          </RevealOnScroll>

          {/* 9 — Geofence + unlocking phones */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={ROW}>
              <PhonePanelCard
                src="/herc/geo.png"
                alt="Herc Rentals app — new geofence"
                imgAspect="aspect-[834/1719]"
              />
              <PhonePanelCard
                src="/herc/unlocking.png"
                alt="Herc Rentals app — unlocking equipment"
                imgAspect="aspect-[834/1719]"
              />
            </section>
          </RevealOnScroll>

          {/* 10 — Promo phone + adoption / differently Q&As */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={ROW}>
              <PhonePanelCard
                src="/herc/home.png"
                alt="Herc Rentals app — manage your fleet with ease"
                imgAspect="aspect-[834/1719]"
              />
              <div className="flex flex-col gap-[16px] @[768px]:grid @[768px]:grid-rows-2 @[768px]:h-full">
                <QACard {...QA.adoption} />
                <QACard {...QA.differently} />
              </div>
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
                <LearnLead>Learning by doing is the best way.</LearnLead>
                {' Building a design system from scratch for the first time is challenging. Getting the structure right, how to organise files, how to build components that actually scale. You only learn what works by getting it wrong first and fixing it.'}
              </LearnRow>,
              <LearnRow n="2" key="2">
                <LearnLead>Hierarchy is not just size or weight.</LearnLead>
                {" Typography scales help in complex interfaces, but more sizes and weights doesn't mean more clarity. It could mean, more cognitive load. Sometimes a title should be smaller than its content. It depends on the message and what the section is actually about. Hierarchy is content dependent."}
              </LearnRow>,
              <LearnRow n="3" key="3">
                <LearnLead>Data visualisation accessibility is hard.</LearnLead>
                {' I studied accessible colour palettes for colour blindness carefully and ended up with something technically correct but visually confusing for everyone else. I was solving for a minority of users at the expense of the majority. The decision was to keep colours close to what users in this context already recognise as meaningful. I felt this as a failure, not being able to find a inclusive solution on time.'}
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
                <ProjectCard slug="vodafone" src="/vodafone/vodafone3.webp" label="VODAFONE">
                  Joined every user testing session. Watched users react to my work as it
                  happened.
                </ProjectCard>
                <ProjectCard slug="zebra-finch" src="/zebra-finch/zebra1.webp" label="ZEBRA FINCH">
                  The future of design isn&apos;t building interfaces. It&apos;s designing the
                  system. I&apos;m building that.
                </ProjectCard>
                <ProjectCard slug="patina" src="/patina/patina3.webp" label="PATINA">
                  I built an app to make you put your phone down. I had the idea, designed it,
                  built it and shipped it. Solo.
                </ProjectCard>
              </div>
            </section>
          </RevealOnScroll>

          {/* Plausible read-depth: reached the very end (same as v1). */}
          <CaseStudyReadMarker project="herc-rentals" depth="end" />
        </div>
      </main>
    </div>
  );
}
