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
import { CaseStudyReadMarker } from '../_shell/CaseStudyReadMarker';
import { projectHref } from '../../src/lib/projectNavSource';

/**
 * EXPERIMENT — Vodafone case study, HYBRID (v3).
 *
 * Same shared "v3 spine" as /patina-v3 (intro + metadata, 100dvh hero, the
 * cream-card `@container` grid, the Q&A typography, and the pinned
 * "What did you learn?" scroll-reveal at the end), but composed for
 * Vodafone's own content, image count, and Q&A sequence.
 *
 * Standalone page at /vodafone-v3 (hidden route, not linked from nav).
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

/**
 * Cover-and-reveal intro (Vodafone v3). On desktop only the opening line
 * shows above the hero; the rest of the intro (second paragraph + metadata)
 * sits hidden BEHIND the hero. Scrolling holds the hero fixed while that text
 * scrolls up and emerges above the hero's top edge, then the hero releases.
 *
 * The layout is fully CSS-determined — no runtime-measured margins — so the
 * server-rendered HTML already matches the final layout and there is NO shift
 * on load. The rest-of-intro layer (z-0) and the hero layer (z-10) share a
 * single grid cell (`grid-area: 1/1`), so the hero overlaps the text with no
 * negative margin. The hero layer stretches to the (taller) cell height; the
 * cell is made `100dvh + GAP_END` taller than the hero via the text layer's
 * bottom padding, which becomes the pinned travel. The pin is a pure
 * scroll-driven transform (0 at the top), so it doesn't alter the initial
 * paint. Desktop + motion-safe only — on mobile / reduced-motion it's a
 * normal stacked column with all text visible.
 */
/** Splits a string into per-word spans (`.word`, inline-block) so an
 *  animation can target each word — our own stand-in for motion-plus
 *  splitText (which is a paid package). A normal space text node sits between
 *  words so they wrap and space like ordinary text. */
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

function IntroHeroCover() {
  const rootRef = useRef<HTMLDivElement>(null); // queried for .word / .meta-line
  const heroTrackRef = useRef<HTMLDivElement>(null); // hero grid cell (stretched)
  const heroPinRef = useRef<HTMLDivElement>(null); // the 100dvh hero (translated)

  // Entrance (motion.dev-style, run with gsap since motion/motion-plus aren't
  // installed): once the fonts are ready, reveal the text and stagger each
  // word up + in (opacity 0→1, y 10→0). The container stays hidden until then
  // so there's no font-swap reflow flash. The hero has NO entrance. Honors
  // reduced-motion (shows everything, no animation).
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
    // Fallback in case fonts.ready never settles.
    const fallback = window.setTimeout(run, 1500);
    return () => {
      tweens.forEach((t) => t.kill());
      window.clearTimeout(fallback);
    };
  }, []);

  // Frame-synced pin: hold the hero at its initial viewport position while the
  // text scrolls up behind it, by translating the hero down by the scroll
  // amount, capped to the slack between the hero and its taller grid cell.
  // shift is 0 at the very top, so the rendered (static) layout already
  // matches — no jump on load. Motion-safe only (now mobile + desktop).
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
      {/* The cover-and-reveal grid is plain CSS (not Tailwind utilities) so it
          ships in the server HTML and is active on first paint — no layout
          shift on load — and so the desktop overlap isn't subject to
          arbitrary-variant source-order quirks. GAP_TOP = 128/48 (grid
          margin, desktop/mobile), GAP_END = 88 (in the text layer's
          padding-bottom). The grid turns on at every width with motion
          allowed; under reduced motion it's a normal column with all text
          visible. The pinned-travel padding tracks the hero height — 70dvh
          on mobile, 100dvh on desktop — since the slack is (cell − hero). */}
      <style>{`
        .vfh-stack { margin-top: 1.08em; }
        .vfh-text { padding-bottom: 40px; }
        @media (prefers-reduced-motion: no-preference) {
          .vfh-stack { display: grid; margin-top: 48px; }
          .vfh-stack > * { grid-area: 1 / 1; }
          .vfh-text { padding-bottom: calc(70dvh + 88px); }
        }
        @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
          .vfh-stack { margin-top: 128px; }
          .vfh-text { padding-bottom: calc(100dvh + 88px); }
        }
      `}</style>

      {/* Opening line — in normal flow. Hidden until fonts.ready, then its
          words stagger in. */}
      <div
        className={`pt-[24px] md:pt-[104px] ${TEXT_PAD}`}
        style={{ visibility: textReady ? 'visible' : 'hidden' }}
      >
        <div className={BIG_TEXT}>
          <p className="mb-0">
            <Words text="Vodafone Broadband," className="font-medium" />{' '}
            <Words text="an award-winning app that lets millions of customers manage their home broadband." />
          </p>
        </div>
      </div>

      {/* Cover-and-reveal stack: the rest of the intro (z-0) and the hero
          (z-10) share one grid cell so the hero overlaps the text with no
          measured margins. The text layer's tall bottom padding makes the
          cell taller than the hero — that extra height is the pinned travel. */}
      <div className="vfh-stack">
        <div
          className={`vfh-text relative z-0 ${TEXT_PAD}`}
          style={{ visibility: textReady ? 'visible' : 'hidden' }}
        >
          <div className={BIG_TEXT}>
            <p className="mb-0">
              <Words text="I joined their global in-house product team on one of the most complex consumer apps I've worked on." />
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
            <div className="w-full h-[70dvh] md:h-[100dvh] rounded-[20px] overflow-hidden bg-background-card-cool relative">
              <Image
                src="/vodafone/hero.webp"
                alt="Vodafone Broadband — 3D house illustration"
                fill
                sizes="(min-width: 768px) 1217px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── DATA (from patina-v2) ───────────────────────────

const METADATA_LINES = [
  'Role .......... Senior Product Designer as a Contractor',
  'Scope ......... Mobile app, design system',
  'Tools ......... Figma, Transifex',
  'Published ..... Live, 1m+ downloads',
];

const QA = {
  whatItDoes: {
    question: 'What does the app actually do?',
    answer:
      "It lets you manage your home Wi-Fi, set up your router, check who's connected, pause internet access, troubleshoot your connection, set up guest networks, and a growing list of features we were actively developing. A highly complex and technical app.",
  },
  complex: {
    question: 'So it was a very complex product to work on?',
    answer:
      "Yes... the app runs across multiple markets, with different router models, different legal content, and sometimes completely different flows. I needed to think about how one design decision would ripple across all of those variations. It required a level of attention to detail that most app projects don't demand.",
  },
  hardest: {
    question: 'What was the hardest part of the work itself?',
    answer:
      "Making technical things feel human. The product talks to physical devices, routers and extenders, that don't always cooperate. And some features required explaining concepts most users have never heard of in a way that felt safe and obvious. Getting that balance right between copy and visuals took real effort.",
  },
  dayToDay: {
    question: 'What was your day to day like?',
    answer:
      "I worked across the entire product, improving existing flows and taking features through different stages of the design process. I was part of the research process, helping decide what to test and building the prototypes we took into user sessions. I wrote copy, had hands on the design system, and was very close to the dev team daily. In a product this technical that proximity wasn't optional, it was how the work actually got done. What I remember most are the enormous flow maps and all the decision trees we had to maintain to cover every use case.",
  },
  reliable: {
    question:
      'How do you design an app that depends on a physical device behaving reliably?',
    answer:
      "It's genuinely hard, especially when it comes to testing with real users. You have physical devices like routers and extenders that communicate with the app and vice versa. There is a lot that could go wrong and I needed to anticipate more use cases than you can imagine and have fallbacks for pretty much everything.",
  },
  complexity: {
    question: 'How did you manage all that complexity?',
    answer:
      'Our workflow was methodic. Figma branches, design system governance, and Transifex for translation strings so we could design in English and trust the platform to distribute the rest. Every line of text had a string attached that we needed to keep in check. Two refinement sessions per week with developers and product managers kept everyone aligned and were crucial to spot problems early, flag edge cases, and readjust flows before handoff.',
  },
  technical: {
    question:
      'Some features involved communicating very technical concepts. How did you handle that?',
    answer:
      "First you need to understand them yourself, and sometimes that was truly a challenge. Being close to the dev team on a daily basis was crucial for that. And then comes the harder part: taking something complex and making it feel safe and obvious to someone who just wants their Wi-Fi to work. Concepts like MAC address randomization, for example, require the user to go into their phone settings and turn off a security feature. Explaining what that is and why it's safe to do on a home network in a usable and beautiful way was genuinely hard. You need a very balanced and simple communication between text and visuals and then test with users.",
  },
  inHouse: {
    question:
      'What was it like being part of an in-house product team after years of consultancy?',
    answer:
      'Different in the best way. The product environment changes how you design. You optimize less for the handoff and more for the product. Everyone is on the same page, working toward the same goals, making informed decisions based on real data. You grow the product, not just launch it. That felt like my natural environment. A lot of people over the years told me I was built for product.',
  },
};

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
    <div className="rounded-[20px] p-8 @[1100px]:p-20 flex items-center bg-background-card-cool">
      <QAItem
        question={question}
        answer={answer}
        size="lg"
        className={`mx-auto max-w-[450px] ${QA_TYPE}`}
      />
    </div>
  );
}

const STATS: ReadonlyArray<{ value: string; label: string; caption: string }> = [
  { value: '1.5M', label: 'Customer base', caption: 'UK market 2025' },
  { value: '400k+', label: 'Paired users', caption: 'UK market 2025' },
  { value: '100k', label: 'MAU - Monthly Active Users', caption: 'UK market 2025' },
];

/** Metric card: big orange value, dark label, muted caption — on the page's
 *  cool card background (same panel pattern as the Q&A cards). */
function StatCard({ value, label, caption }: { value: string; label: string; caption: string }) {
  return (
    <div className="h-full bg-background-card-cool rounded-[20px] flex flex-col justify-between gap-8 p-8">
      <div className="flex flex-col gap-3">
        <p className="text-display-stat text-accent-secondary">{value}</p>
        <p className="text-metadata-md leading-[1.5]! @[768px]:leading-[2]! text-text-primary">
          {label}
        </p>
      </div>
      <p className="text-metadata-md leading-[1.5]! @[768px]:leading-[2]! text-text-secondary">
        {caption}
      </p>
    </div>
  );
}

/** In-grid image that fills its cell. `aspect` sets its height on mobile (and
 *  for full-width banners). When `fillHeight` is set, at the two-column
 *  breakpoint it also fills its grid cell height (@[768px]:h-full) so an image
 *  paired with a taller Q&A column stays the same height as that column. */
function FillImage({
  src,
  alt,
  aspect,
  fillHeight,
}: {
  src: string;
  alt: string;
  aspect: string;
  fillHeight?: boolean;
}) {
  return (
    <div
      className={`w-full ${fillHeight ? '@[768px]:h-full ' : ''}${aspect} relative rounded-[20px] overflow-hidden`}
    >
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

/** Image centered (object-contain) on a solid colour panel — same pattern as
 *  patina-v3's phone panels, but with an arbitrary panel colour. The panel
 *  fills its grid cell height when paired with a taller column (@[768px]:h-full);
 *  `panelAspect` sets the panel's height on mobile. `imgHeight` is the image's
 *  height as a % of the panel, and `imgAspect` keeps the image's proportions. */
function ImagePanel({
  src,
  alt,
  imgAspect,
  panelAspect = 'aspect-[677/887]',
  imgHeight = 'h-[80%]',
  bg = 'bg-[#F4F2F2]',
}: {
  src: string;
  alt: string;
  imgAspect: string;
  panelAspect?: string;
  imgHeight?: string;
  bg?: string;
}) {
  return (
    <div
      className={`w-full @[768px]:h-full ${panelAspect} rounded-[20px] relative flex items-center justify-center overflow-hidden ${bg}`}
    >
      <div className={`relative ${imgHeight} ${imgAspect}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 605px, 100vw"
          quality={92}
          className="object-contain"
        />
      </div>
    </div>
  );
}

/** Image centered (object-contain) on a colour panel — for landscape /
 *  transparent art. `aspect` sets the panel height on mobile (and when the
 *  panel's own aspect drives it). With `fillHeight` the panel instead fills
 *  its grid cell height (@[768px]:h-full) and the image is contained &
 *  centered, with the panel colour showing through transparent areas / margins. */
function ImageBleedPanel({
  src,
  alt,
  aspect,
  bg = 'bg-[#F4F2F2]',
  fillHeight = false,
}: {
  src: string;
  alt: string;
  aspect: string;
  bg?: string;
  fillHeight?: boolean;
}) {
  return (
    <div
      className={`w-full ${fillHeight ? '@[768px]:h-full ' : ''}${aspect} relative rounded-[20px] overflow-hidden ${bg}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 605px, 100vw"
        quality={92}
        className="object-contain"
      />
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
    <section className="rounded-[20px] bg-background-card-cool px-8 py-16 @[1100px]:px-20 @[1100px]:py-32">
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

/** Related-project card — same style/CSS as the homepage ProjectCard
 *  (bg-background-card-soft card, label-sm title + body-lg role, hover to
 *  card bg + text-secondary), keeping the thumbnail image. */
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

export default function VodafoneV3Page() {
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

      {/* Sticky header — v1 style: the standard horizontal Header on an
          opaque white band, hides on scroll down, returns on scroll up. */}
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
                  { label: 'Vodafone', slug: 'vodafone', active: true },
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

          {/* Metrics below the hero (3-up; horizontal swipe carousel on mobile). */}
          <RevealOnScroll offset={72} duration={900}>
            <section className="flex overflow-x-auto snap-x snap-mandatory gap-[16px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden @[768px]:grid @[768px]:grid-cols-3 @[768px]:overflow-visible">
              {STATS.map((stat) => (
                <div key={stat.label} className="shrink-0 w-[85%] snap-start @[768px]:w-auto">
                  <StatCard {...stat} />
                </div>
              ))}
            </section>
          </RevealOnScroll>

          {/* 3 — "What does the app do?" Q&A pinned on the right while three
              image panels scroll past on the left. */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={`${ROW} @[768px]:items-start`}>
              <div className="flex flex-col gap-[16px]">
                <ImagePanel
                  src="/vodafone/dashboard.png"
                  alt="Vodafone app — home dashboard"
                  imgAspect="aspect-[834/1719]"
                  imgHeight="h-[70%]"
                />
                <ImagePanel
                  src="/vodafone/setup.png"
                  alt="Vodafone app — router setup"
                  imgAspect="aspect-[834/1719]"
                  imgHeight="h-[70%]"
                />
                <ImagePanel
                  src="/vodafone/allset.png"
                  alt="Vodafone app — all set"
                  imgAspect="aspect-[834/1719]"
                  imgHeight="h-[70%]"
                />
                <ImagePanel
                  src="/vodafone/manageWifi.png"
                  alt="Vodafone app — manage Wi-Fi"
                  imgAspect="aspect-[782/1612]"
                  imgHeight="h-[70%]"
                />
              </div>
              <PinnedColumn className="@[768px]:self-start" pinTop={24}>
                <QACard {...QA.whatItDoes} />
              </PinnedColumn>
            </section>
          </RevealOnScroll>

          {/* 4 — "So it was a complex product?" Q&A on the left, network
              illustration filling the right column. */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={ROW}>
              <QACard {...QA.complex} />
              <FillImage
                src="/vodafone/network-illustration.webp"
                alt="Vodafone app — home network illustration"
                aspect="aspect-[2265/1509]"
                fillHeight
              />
            </section>
          </RevealOnScroll>

          {/* 5 — 2×2: devices-phone image + day-to-day Q&A (left) / hardest Q&A
              + devices image (right) — the hardest Q&A sits in the right column. */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={ROW}>
              <div className="flex flex-col gap-[16px] @[768px]:grid @[768px]:grid-rows-2 @[768px]:h-full">
                <ImageBleedPanel
                  src="/vodafone/components.png"
                  alt="Vodafone app — design system components"
                  aspect="aspect-[1510/1006]"
                  fillHeight
                />
                <QACard {...QA.dayToDay} />
              </div>
              <div className="flex flex-col gap-[16px] @[768px]:grid @[768px]:grid-rows-2 @[768px]:h-full">
                <QACard {...QA.hardest} />
                <ImageBleedPanel
                  src="/vodafone/devices-list.png"
                  alt="Vodafone app — connected devices list"
                  aspect="aspect-[1510/1006]"
                  fillHeight
                />
              </div>
            </section>
          </RevealOnScroll>

          {/* Plausible read-depth: reached roughly halfway (same as v1). */}
          <CaseStudyReadMarker project="vodafone" depth="middle" />

          {/* 6 — reliable / complexity Q&As stacked left, phone-welcome filling
              the right column. */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={ROW}>
              <ImagePanel
                src="/vodafone/rogue.png"
                alt="Vodafone app — rogue device detection"
                imgAspect="aspect-[1173/2418]"
                imgHeight="h-[70%]"
              />
              <div className="flex flex-col gap-[16px] @[768px]:grid @[768px]:grid-rows-2 @[768px]:h-full">
                <QACard {...QA.reliable} />
                <QACard {...QA.complexity} />
              </div>
            </section>
          </RevealOnScroll>

          {/* 7 — "Technical concepts" Q&A pinned on the left while three image
              panels scroll past on the right. */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={`${ROW} @[768px]:items-start`}>
              <PinnedColumn className="@[768px]:self-start" pinTop={24}>
                <QACard {...QA.technical} />
              </PinnedColumn>
              <div className="flex flex-col gap-[16px]">
                <ImageBleedPanel
                  src="/vodafone/device.png"
                  alt="Vodafone app — device"
                  aspect="aspect-[2265/1509]"
                />
                <ImagePanel
                  src="/vodafone/mac1.png"
                  alt="Vodafone app — MAC address randomization"
                  imgAspect="aspect-[834/1719]"
                  imgHeight="h-[70%]"
                />
                <ImagePanel
                  src="/vodafone/mac2.png"
                  alt="Vodafone app — MAC address randomization, step 2"
                  imgAspect="aspect-[834/1719]"
                  imgHeight="h-[70%]"
                />
              </div>
            </section>
          </RevealOnScroll>

          {/* 8 — image on the left, "In-house product team" Q&A on the right. */}
          <RevealOnScroll offset={72} duration={900}>
            <section className={ROW}>
              <ImageBleedPanel
                src="/vodafone/in-house.png"
                alt="Vodafone app — in-house product team"
                aspect="aspect-[1510/1006]"
                fillHeight
              />
              <QACard {...QA.inHouse} />
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
                <LearnLead>A small design team can do a lot with the right people.</LearnLead>
                {' Skills can be learned. Attitude and care for the product and for the team can’t. What made the difference on this team was the people who genuinely cared.'}
              </LearnRow>,
              <LearnRow n="2" key="2">
                <LearnLead>Designers need access to data.</LearnLead>
                <br />
                {'Not having direct access to analytics or data scientists made informed decisions harder and sometimes impossible. Being close to engineering is not enough. Designers need to be close to data too. I think this is what’s missing in a lot of teams.'}
              </LearnRow>,
              <LearnRow n="3" key="3">
                <LearnLead>Every good solution has its caveats.</LearnLead>
                <br />
                {'Figma branches work well for complex multi-market products but need tight coordination. We had flows repeated across six different market files that all needed to stay in sync. Merges sometimes went wrong but changing the structure once the system is in place is hard because everything already depends on it. File architecture decisions made early are hard to undo later.'}
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
                <ProjectCard slug="patina" src="/patina/patina3.webp" label="PATINA">
                  I built an app to make you put your phone down. I had the idea, designed it,
                  built it and shipped it. Solo.
                </ProjectCard>
                <ProjectCard slug="zebra-finch" src="/zebra-finch/zebra1.webp" label="ZEBRA FINCH">
                  The future of design isn&apos;t building interfaces. It&apos;s designing the
                  system. I&apos;m building that.
                </ProjectCard>
                <ProjectCard slug="herc-rentals" src="/herc/home1.webp" label="HERC RENTALS">
                  Designed a B2B real time fleet management platform that led to 150% growth in
                  12 months.
                </ProjectCard>
              </div>
            </section>
          </RevealOnScroll>

          {/* Plausible read-depth: reached the very end (same as v1). */}
          <CaseStudyReadMarker project="vodafone" depth="end" />
        </div>
      </main>
    </div>
  );
}
