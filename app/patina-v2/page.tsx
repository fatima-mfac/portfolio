'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Lenis from 'lenis';
import { Header } from '../../src/components/Header/Header';
import { RevealOnScroll } from '../../src/components/RevealOnScroll/RevealOnScroll';
import { ExternalLink } from '../../src/components/ExternalLink/ExternalLink';
import { SmokeCanvas } from './SmokeCanvas';

/**
 * Shared per-frame update registry. Each ScrollScale registers its update
 * fn here; the single Lenis rAF loop (SmoothScroll) calls them every frame
 * so the scale stays locked to the smoothed scroll position — that frame-
 * synced coupling is what makes the motion feel fluid (vs. tying it to raw,
 * stepwise native scroll events).
 */
const frameCallbacks = new Set<() => void>();

/**
 * Smooth/inertia scrolling via Lenis (like the reference's ScrollSmoother).
 * Runs one rAF loop that advances Lenis and ticks every registered scale.
 * Disabled under prefers-reduced-motion. Renders the small CSS Lenis needs.
 */
function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis();
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      frameCallbacks.forEach((cb) => cb());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
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
 * EXPERIMENT — Patina case study, full-width editorial layout (v2).
 *
 * Standalone full-width page at /patina-v2, matched section-by-section to
 * the Figma "Iteration2" frames (479:1813 / 1887 / 1961 / 2035). Reuses
 * the existing Q&A copy; missing images use temporary Figma crops
 * (public/patina/_v2-*.png) until finals.
 *
 * Layout model: a 12-col grid per block. Left column = col-start-3 (text)
 * / col-start-2 (wide media); right column = col-start-7. Vertical rhythm
 * uses mt-16 md:mt-[Npx] gaps measured from the Figma (gap = next.top − prev.bottom).
 *
 * Image motion (scale-down on scroll) is a later pass from the reference.
 *
 * NOTE — hardcoded values to tokenize if adopted:
 *   - page bg #fffcf8; intro gray #75757a; peach panel #fff2da + glow
 *     #fff6e8; intro type 56/58/-1px and Q&A question 32/38/-1px (BL Melody;
 *     display-xl uses the decorative font so it can't be reused).
 */

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
      "Patina is still early and mostly testers, since I haven't started active distribution. My approach is measure first, then distribute: I want clean measurement in place to show whether the wallpaper actually shifts screen time, not just whether people notice it.\n\nSo right now I'm improving instrumentation, refining the UI, and working out how to get it onto more phones.\nI'm also exploring a weekly stats view as the basis for a paid tier. The free version stays ambient and background only, while a paid layer adds weekly insight into screen time trends, something to reflect on. I'd only pursue it once the data shows the core mechanic earns it.",
  },
};

const METRICS: ReadonlyArray<{ value: string; label: string; note: string }> = [
  { value: '76.9%', label: 'Install Retention', note: 'Since launch (April 2026)' },
  {
    value: '87%',
    label: 'Decrease in screen time limit reached',
    note: 'Could mean behaviour change or that users increased their daily limit.',
  },
  { value: '80%', label: 'Paused before unlocking', note: 'From a preliminary survey of 12 early users.' },
];

/**
 * Scroll-linked scale. The wrapped content starts slightly larger (`start`)
 * and eases to 1.0 as the element scrolls up through the viewport — so the
 * Figma sizes read as the "final" (settled) state. The fixed-size box around
 * it (overflow-hidden) clips the overscaled content. Respects
 * prefers-reduced-motion. Tune `start` to taste (reference site pending).
 */
function ScrollScale({
  children,
  to = 0.86,
  className,
  innerClassName,
}: {
  children: ReactNode;
  to?: number;
  className?: string;
  innerClassName?: string;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      inner.style.transform = 'scale(1)';
      return;
    }
    const update = () => {
      // Measure the OUTER (untransformed) box so the scale applied to the
      // inner box never feeds back into its own measurement (transforms
      // change getBoundingClientRect).
      const rect = outer.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Hold at the biggest size while the box rises through the lower half,
      // then ease to the final (Figma) size as its center crosses from
      // ~START_AT to ~END_AT of the viewport height — so the shrink lands
      // later in the scroll. (1 = center at viewport bottom, 0 = at top.)
      const START_AT = 1.2;
      const END_AT = -0.3;
      const center = rect.top + rect.height / 2;
      const cf = center / vh;
      const p = Math.min(1, Math.max(0, (START_AT - cf) / (START_AT - END_AT)));
      // Smoothstep easing — eases in and out so the scale change is soft
      // rather than a linear scrub.
      const eased = p * p * (3 - 2 * p);
      // Starts at 1.0 (the slot/padding-aligned "big" state) and shrinks
      // inward to `to` (the smaller, final/Figma size) as it scrolls.
      inner.style.transform = `scale(${(1 + (to - 1) * eased).toFixed(4)})`;
    };
    // Driven by the shared Lenis frame loop so the scale is frame-synced
    // with the smoothed scroll. Resize recomputes immediately.
    update();
    frameCallbacks.add(update);
    window.addEventListener('resize', update);
    return () => {
      frameCallbacks.delete(update);
      window.removeEventListener('resize', update);
    };
  }, [to]);

  // Outer = stable layout slot (final/Figma size). Inner = the whole image
  // box, which scales as one (rounded corners and all).
  return (
    <div ref={outerRef} className={className}>
      <div
        ref={innerRef}
        className={`w-full h-full will-change-transform ${innerClassName ?? ''}`}
        style={{ transform: 'scale(1)' }}
      >
        {children}
      </div>
    </div>
  );
}

/** Editorial Q&A — Figma 479:1887: question BL Melody Medium 32/38/-1px
 *  (text-primary), answer body-xl 17/26px (text-secondary), 16px gap.
 *  whitespace-pre-line renders the copy's \n\n as blank lines. */
/** Splits an answer into paragraphs. Honors explicit blank-line breaks
 *  (`\n\n`); if there are none, inserts a single break at the sentence
 *  boundary nearest the text's midpoint, so every answer always reads as
 *  (at least) two paragraphs with a gap in the middle. */
function splitAnswer(answer: string): string[] {
  const explicit = answer.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  if (explicit.length > 1) return explicit;
  const text = explicit[0] ?? answer.trim();
  const mid = text.length / 2;
  const boundaries: number[] = [];
  const re = /[.!?]\s+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) boundaries.push(m.index + m[0].length);
  if (boundaries.length === 0) return [text];
  let best = boundaries[0];
  for (const b of boundaries) {
    if (Math.abs(b - mid) < Math.abs(best - mid)) best = b;
  }
  return [text.slice(0, best).trim(), text.slice(best).trim()];
}

// Equalizer bars: x position + resting half-height (the idle waveform shape).
const EQ_BARS = [
  { x: 7, idle: 3 },
  { x: 10.5, idle: 7 },
  { x: 14, idle: 5 },
  { x: 17.5, idle: 2 },
];
// Frequency-bin groups (fftSize 64 → 32 bins) mapped to the 4 bars, low→high.
// Voice energy concentrates in the lower bins, so the left bars move most.
const EQ_GROUPS: ReadonlyArray<[number, number]> = [
  [1, 2],
  [3, 5],
  [6, 9],
  [10, 16],
];

/** Click-to-play narration glyph for an answer — a small equalizer that toggles
 *  an <audio> recording and whose bars react in real time to the actual audio
 *  (Web Audio AnalyserNode), so they move with the voice's cadence. Sits in the
 *  answer's left margin. EXPERIMENT. */
function AnswerAudioButton({
  src,
  className,
  onProgress,
}: {
  src: string;
  className?: string;
  /** Called each frame while playing with playback fraction 0..1 (and 0 on
   *  stop) — drives read-along word highlighting. */
  onProgress?: (fraction: number) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const barsRef = useRef<Array<SVGLineElement | null>>([]);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef(0);
  const [playing, setPlaying] = useState(false);

  const setBar = (i: number, half: number) => {
    const line = barsRef.current[i];
    if (!line) return;
    line.setAttribute('y1', (12 - half).toFixed(2));
    line.setAttribute('y2', (12 + half).toFixed(2));
  };
  const resetBars = () => EQ_BARS.forEach((bar, i) => setBar(i, bar.idle));

  // Build the audio graph once (element → analyser → speakers). After this the
  // element only sounds through the AudioContext, so we resume() it on play.
  const ensureGraph = () => {
    if (analyserRef.current || !audioRef.current) return;
    try {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const source = ctx.createMediaElementSource(audioRef.current);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
    } catch {
      // Web Audio unavailable → bars stay idle, audio still plays.
    }
  };

  const animate = () => {
    const a = audioRef.current;
    if (a && a.duration > 0) onProgress?.(a.currentTime / a.duration);
    const analyser = analyserRef.current;
    if (analyser) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      EQ_GROUPS.forEach((group, i) => {
        let sum = 0;
        for (let b = group[0]; b <= group[1]; b++) sum += data[b] ?? 0;
        const amp = Math.min(1, (sum / ((group[1] - group[0] + 1) * 255)) * 1.8);
        setBar(i, 1.5 + amp * 8);
      });
    }
    rafRef.current = requestAnimationFrame(animate);
  };

  const startAnim = () => {
    // Equalizer bars are decorative (skipped under reduced-motion), but the
    // rAF loop still runs so read-along highlighting keeps tracking playback.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ensureGraph();
      void ctxRef.current?.resume();
    }
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  };
  const stopAnim = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    resetBars();
    onProgress?.(0);
  };

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      void ctxRef.current?.close();
    },
    [],
  );

  return (
    <span className={className}>
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => {
          setPlaying(true);
          startAnim();
        }}
        onPause={() => {
          setPlaying(false);
          stopAnim();
        }}
        onEnded={() => {
          setPlaying(false);
          stopAnim();
        }}
      />
      <button
        type="button"
        aria-label={playing ? 'Stop narration' : 'Play narration'}
        aria-pressed={playing}
        onClick={() => {
          const a = audioRef.current;
          if (!a) return;
          if (a.paused) {
            void a.play();
          } else {
            a.pause();
            a.currentTime = 0; // stop (not pause) — next click starts over
          }
        }}
        className={`block appearance-none bg-transparent p-0 leading-none transition-colors duration-fast ${
          playing ? 'text-accent-secondary' : 'text-text-secondary hover:text-accent-secondary'
        }`}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {EQ_BARS.map((bar, i) => (
            <line
              key={bar.x}
              ref={(el) => {
                barsRef.current[i] = el;
              }}
              x1={bar.x}
              x2={bar.x}
              y1={12 - bar.idle}
              y2={12 + bar.idle}
            />
          ))}
        </svg>
      </button>
    </span>
  );
}

function EditorialQA({
  question,
  answer,
  className,
  questionClassName = 'font-medium text-[32px] leading-[38px] tracking-[-1px]',
  answerClassName = 'text-body-xl leading-[26px]!',
  revealMargin,
  audioSrc,
}: {
  question: string;
  answer: string;
  className?: string;
  /** Override the question typography (size/weight/leading). Color +
   *  whitespace handling are always applied. */
  questionClassName?: string;
  /** Override the answer typography. */
  answerClassName?: string;
  /** How deep into the viewport the block must scroll before it fades in
   *  (percent of viewport height). Higher = reveals later/further up;
   *  ~50 reveals when it reaches the vertical middle. */
  revealMargin?: number;
  /** If set, shows a click-to-play narration glyph in the answer's left
   *  margin that plays this audio file. */
  audioSrc?: string;
}) {
  const paragraphs = useMemo(() => splitAnswer(answer), [answer]);
  // Pre-index every word for read-along highlighting (audio answers only).
  const wordParas = useMemo(() => {
    let idx = 0;
    return paragraphs.map((para) => para.split(' ').map((text) => ({ text, idx: idx++ })));
  }, [paragraphs]);
  const totalWords = useMemo(
    () => wordParas.reduce((sum, para) => sum + para.length, 0),
    [wordParas],
  );
  const [spokenCount, setSpokenCount] = useState(0);

  const answerCls = `${answerClassName} text-text-secondary whitespace-pre-line`;

  return (
    <RevealOnScroll
      className={`relative flex flex-col gap-4 ${className ?? ''}`}
      intersectMargin={revealMargin}
    >
      <p className={`${questionClassName} text-text-primary whitespace-pre-line`}>{question}</p>
      <div className="relative flex flex-col gap-4">
        {audioSrc && (
          <AnswerAudioButton
            src={audioSrc}
            className="hidden md:block absolute top-[2px] right-full mr-[16px]"
            onProgress={(fraction) => {
              const count = Math.round(fraction * totalWords);
              setSpokenCount((prev) => (prev === count ? prev : count));
            }}
          />
        )}
        {audioSrc
          ? // Read-along: words brighten as playback advances (linear demo —
            // mapped to currentTime/duration, so it drifts from real pacing).
            wordParas.map((para, pi) => (
              <p key={pi} className={answerCls}>
                {para.map((word) => (
                  <span
                    key={word.idx}
                    className={`transition-colors duration-300 ${
                      word.idx < spokenCount ? 'text-accent-secondary' : ''
                    }`}
                  >
                    {word.text}{' '}
                  </span>
                ))}
              </p>
            ))
          : paragraphs.map((paragraph, i) => (
              <p key={i} className={answerCls}>
                {paragraph}
              </p>
            ))}
      </div>
    </RevealOnScroll>
  );
}

/** Peach panel with a soft glow + a centered device screenshot (Figma
 *  "Article container", type A). Panel #fff2da, glow #fff6e8 — no tokens. */
function PhonePanel({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <ScrollScale
      className={`aspect-[677/887] ${className ?? ''}`}
      innerClassName="relative rounded-[24px] overflow-hidden bg-[#FFF7EA]"
    >
      <div className="absolute left-[35px] top-[38px] w-[607px] h-[817px] max-w-[calc(100%-70px)] rounded-[8px] bg-[#fff6e8] blur-[42px]" />
      <div className="absolute left-[176px] top-[112px] w-[325px] h-[676px] max-w-[48%] overflow-hidden">
        <Image src={src} alt={alt} fill sizes="325px" className="object-cover" />
      </div>
    </ScrollScale>
  );
}

/** Phone panel for the sticky-pin section. Same scroll-shrink motion as the
 *  other images (ScrollScale) — most of it plays as the phone enters/leaves,
 *  since the scale is frozen while it's pinned (its viewport position is
 *  constant then). Inner positions are percentage-based (calibrated to the
 *  677×887 Figma panel) so the device stays centered at the larger,
 *  height-driven size used in the pin column.
 *
 *  The device is the live phone mockup from prod: main-video.mp4 plays behind
 *  skin.png, whose transparent screen cut-out masks the video (same approach
 *  as PatinaContent's PhoneVideoCard). The video insets/scale match prod. */
function PinnedPhonePanel({ alt, className }: { alt: string; className?: string }) {
  return (
    <ScrollScale
      className={`aspect-[677/887] ${className ?? ''}`}
      innerClassName="relative rounded-[24px] overflow-hidden bg-[#FFF7EA]"
    >
      <div className="absolute left-[5.2%] top-[4.3%] w-[89.7%] h-[92.1%] rounded-[8px] bg-[#fff6e8] blur-[42px]" />
      <div className="absolute left-[26%] top-[12.6%] w-[48%] h-[76.2%] flex items-center justify-center">
        <div className="relative h-full aspect-[846/1720]">
          <video
            src="/patina/main-video.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute object-cover"
            style={{
              top: 'calc(3% - 40px)',
              bottom: 'calc(3% + 40px)',
              left: 'calc(5% - 13px)',
              right: 'calc(5% + 13px)',
              borderRadius: '8%',
              transform: 'scale(0.95)',
            }}
          />
          <Image
            src="/patina/skin.png"
            alt={alt}
            fill
            sizes="(min-width: 768px) 360px, 50vw"
            className="object-contain pointer-events-none"
          />
        </div>
      </div>
    </ScrollScale>
  );
}

/** Tinting phone — the screen-time wallpaper crossfading through its 4 tint
 *  states (neutral → red) on a loop. Each frame is a full phone-on-cream
 *  image, so they stack and crossfade in place. Respects reduced-motion. */
const TINT_FRAMES = [
  '/patina/phone.webp',
  '/patina/phone2.webp',
  '/patina/phone3.webp',
  '/patina/phone4.webp',
];
function TintPhone({ className }: { className?: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % TINT_FRAMES.length);
    }, 2600);
    return () => window.clearInterval(t);
  }, []);
  return (
    <ScrollScale
      className={`aspect-[2190/2720] ${className ?? ''}`}
      innerClassName="relative overflow-hidden rounded-[24px] bg-[#FFF7EA]"
    >
      {TINT_FRAMES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt="Patina — screen time tints the wallpaper"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          priority={i === 0}
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            i === idx ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </ScrollScale>
  );
}

/** A transparent phone mockup centered on a cream panel with a soft glow.
 *  Same panel look as the other phone cards; ScrollScale shrink-on-scroll.
 *  The device is sized + positioned to match the video phone
 *  (PinnedPhonePanel): top 12.6%, height 76.2%, horizontally centered.
 *  `imgAspect` is the Tailwind aspect class for the source image. */
function PhoneMockupPanel({
  src,
  alt,
  imgAspect,
  className,
}: {
  src: string;
  alt: string;
  imgAspect: string;
  className?: string;
}) {
  return (
    <ScrollScale
      className={`aspect-[677/887] ${className ?? ''}`}
      innerClassName="relative overflow-hidden rounded-[24px] bg-[#FFF7EA]"
    >
      <div className="absolute left-[5.2%] top-[4.3%] h-[92.1%] w-[89.7%] rounded-[8px] bg-[#fff6e8] blur-[42px]" />
      <div className={`absolute left-1/2 top-[12.6%] h-[76.2%] -translate-x-1/2 ${imgAspect}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 360px, 50vw"
          className="object-contain"
        />
      </div>
    </ScrollScale>
  );
}

/**
 * Frame-synced vertical parallax. Translates its child so it scrolls UP at a
 * fraction (`speed`) of the real scroll — e.g. speed 0.5 = half speed — making
 * it lag behind faster siblings. Used for the intro under the hero: it drifts
 * up slowly while the hero (full speed, on top) passes over it. Active ≥ md;
 * driven by the shared Lenis loop. The lag is capped to the parent's height.
 */
function ParallaxY({
  children,
  speed = 0.5,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const move = moveRef.current;
    if (!track || !move) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const update = () => {
      const row = track.parentElement;
      if (!row || !window.matchMedia('(min-width: 768px)').matches) {
        move.style.transform = '';
        return;
      }
      // How far the section has scrolled above the viewport top.
      const scrolled = Math.max(0, -row.getBoundingClientRect().top);
      // translateY DOWN by scrolled·(1-speed) so the net upward travel is
      // scrolled·speed — i.e. it moves up slower. Capped so it can't drift
      // unbounded past the section.
      const shift = Math.min(row.offsetHeight, scrolled * (1 - speed));
      move.style.transform = `translateY(${shift.toFixed(2)}px)`;
    };
    update();
    frameCallbacks.add(update);
    window.addEventListener('resize', update);
    return () => {
      frameCallbacks.delete(update);
      window.removeEventListener('resize', update);
    };
  }, [speed]);

  return (
    <div ref={trackRef} className={className}>
      <div ref={moveRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}

/**
 * Frame-synced pin. Instead of CSS `position: sticky` (which the browser
 * recalculates on its own cadence), this holds its child at the top of the
 * viewport by writing a `translateY` every frame inside the same Lenis rAF
 * loop that drives the scale — so the pin moves in exact lockstep with the
 * smoothed scroll. A light lerp eases the hold in/out so it glides rather
 * than snaps. Active only ≥ md (two-column); below that the child is a
 * normal in-flow block.
 *
 * The child must be shorter than its row (the parent grid) for there to be
 * any travel — the right column's height defines how long the pin holds.
 */
function PinnedColumn({
  children,
  className,
  pinTop,
}: {
  children: ReactNode;
  className?: string;
  /** If set, hold the pinned child this many px below the viewport top
   *  while pinned, instead of vertically centered. */
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
      if (!row || !window.matchMedia('(min-width: 768px)').matches) {
        pin.style.transform = '';
        return;
      }
      const rowRect = row.getBoundingClientRect();
      const childH = pin.offsetHeight;
      const vh = window.innerHeight;
      // Where to hold the child's top while pinned: top-anchored (`pinTop` px
      // below the viewport top) if requested, otherwise vertically centered
      // (when the child is taller than the viewport this bleeds it equally off
      // top and bottom). Locked exactly each frame (no easing) so it holds
      // dead-still — smoothness comes from the Lenis-smoothed scroll this is
      // frame-synced to.
      const anchorTop = pinTop != null ? pinTop : (vh - childH) / 2;
      // Release the pin once the LAST item in the sibling column is fully on
      // screen — i.e. its bottom edge reaches the bottom of the viewport —
      // then let the whole page scroll together. The sibling is whichever
      // grid child isn't this pinned track, so it works whether the pin is the
      // left or the right column. Falls back to the row bottom if not found.
      const sibling = Array.from(row.children).find((c) => c !== track) as
        | HTMLElement
        | undefined;
      const lastItem = sibling?.lastElementChild as HTMLElement | null;
      let maxShift: number;
      if (lastItem) {
        const itemRect = lastItem.getBoundingClientRect();
        maxShift = anchorTop - vh + (itemRect.bottom - rowRect.top);
      } else {
        maxShift = rowRect.height - childH;
      }
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

/** Full-bleed image in a 24px-radius box (banner, grayscale montage,
 *  quote card, dark panel, website preview). Size via className. */
function RoundedImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <ScrollScale className={className} innerClassName="relative overflow-hidden rounded-[24px]">
      <Image src={src} alt={alt} fill sizes="50vw" className="object-cover" />
    </ScrollScale>
  );
}

/** Two images that, as they scroll up, shrink AND slide toward each other —
 *  big + apart at the start of the motion, small + close at the end (inverts
 *  ScrollScale's shrink-in-place by also converging the pair). Frame-synced to
 *  the Lenis loop; desktop only (stacks on mobile). */
function ConvergingPair({ srcA, srcB, alt }: { srcA: string; srcB: string; alt: string }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = rowRef.current;
    const a = aRef.current;
    const b = bRef.current;
    if (!row || !a || !b) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const START_SCALE = 1.0; // big at the start of the motion
    const END_SCALE = 0.82; // small at the end
    const CONVERGE = 90; // px each image slides inward by the end
    const update = () => {
      if (!window.matchMedia('(min-width: 768px)').matches) {
        a.style.transform = '';
        b.style.transform = '';
        return;
      }
      const rect = row.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const START_AT = 1.2;
      const END_AT = -0.3;
      const p = Math.min(
        1,
        Math.max(0, (START_AT - (rect.top + rect.height / 2) / vh) / (START_AT - END_AT)),
      );
      const eased = p * p * (3 - 2 * p);
      const scale = (START_SCALE + (END_SCALE - START_SCALE) * eased).toFixed(4);
      const shift = (CONVERGE * eased).toFixed(2);
      a.style.transform = `translateX(${shift}px) scale(${scale})`;
      b.style.transform = `translateX(-${shift}px) scale(${scale})`;
    };
    update();
    frameCallbacks.add(update);
    window.addEventListener('resize', update);
    return () => {
      frameCallbacks.delete(update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return (
    <div ref={rowRef} className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-[80px]">
      <div ref={aRef} className="will-change-transform">
        <div className="relative w-full aspect-[1362/1790] overflow-hidden rounded-[24px]">
          <Image src={srcA} alt={alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>
      <div ref={bRef} className="will-change-transform">
        <div className="relative w-full aspect-[1362/1790] overflow-hidden rounded-[24px]">
          <Image src={srcB} alt={alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>
    </div>
  );
}

/** Patina hero video. Plays once, holds on the last frame for END_PAUSE_MS,
 *  then restarts — same beat as the live PatinaHeroVideo (the native `loop`
 *  cuts too abruptly). */
function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const END_PAUSE_MS = 3000;
  const handleEnded = () => {
    window.setTimeout(() => {
      const v = ref.current;
      if (!v) return;
      v.currentTime = 0;
      void v.play();
    }, END_PAUSE_MS);
  };
  return (
    <video
      ref={ref}
      src="/patina/patina-hero-video.mp4"
      poster="/patina/hero-poster.webp"
      autoPlay
      muted
      playsInline
      preload="metadata"
      onEnded={handleEnded}
      className="w-full h-full object-cover"
    />
  );
}

// Shared type styles for the pinned-column Q&As (whyBuild / validate /
// impulse): 30px medium question, 18px book answer with -0.02em tracking.
const PINNED_QA_QUESTION = 'font-medium text-[30px] leading-[36px] tracking-[-1px]';
const PINNED_QA_ANSWER = 'text-[18px] leading-[26px] tracking-[-0.02em] font-[350]';

/** One numbered learning row — Figma 565:7759. A large number and the body
 *  text sit in the right portion of a full-width row (12-col grid on desktop),
 *  with a hairline divider above each row. The lead-in sentence is emphasised
 *  (primary, medium); the rest runs on in secondary. */
function LearnRow({ n, children }: { n: string; children: ReactNode }) {
  return (
    <li className="border-t border-black/10 py-10 md:grid md:grid-cols-12 md:items-start md:py-16">
      <span className="text-[40px] leading-none font-medium text-[#1c1a1a] md:col-start-6 md:translate-x-[100px] md:text-[56px]">
        {n}
      </span>
      <div className="mt-4 max-w-[380px] text-[17px] leading-[28px] tracking-[-0.28px] text-text-secondary md:col-start-7 md:col-span-6 md:mt-0 md:justify-self-center md:-translate-x-[34px]">
        {children}
      </div>
    </li>
  );
}

/** Emphasised lead-in phrase inside a LearnRow (primary colour, medium). */
function LearnLead({ children }: { children: ReactNode }) {
  return <span className="font-medium text-text-primary">{children}</span>;
}

/** Small related-project card — Figma 568:7761. Thumbnail + mono label +
 *  one-line summary in a white rounded card with a hairline border. */
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
    <div className="flex items-center gap-3 rounded-[8px] border-[0.5px] border-[#d7d7d7] bg-background-card-soft p-2 transition-colors duration-fast ease-out hover:bg-background-card md:min-w-0 md:flex-1 md:max-w-[395px]">
      <div className="relative h-[80px] w-[115px] shrink-0 overflow-hidden rounded-[4px]">
        <Image src={src} alt={label} fill sizes="115px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-col">
        <p className="font-[family-name:var(--font-family-mono)] text-[11px] font-medium leading-[22px] tracking-[-0.11px] text-text-primary">
          {label}
        </p>
        <p className="text-[14px] leading-[1.24] tracking-[-0.7px] text-[#90908a]">{children}</p>
      </div>
    </div>
  );
}

export default function PatinaV2Page() {
  return (
    <div className="min-h-screen bg-[#FFFBF3] flex flex-col">
      <SmoothScroll />
      {/* Header — Figma 479:1843: top 24px, ~19px sides, full width. */}
      <main className="mx-auto w-full max-w-[1680px]">
        {/* Top gradient — #FCF4EA → #FFFBF3 over the first 8%, then #FFFBF3.
            This block spans page top → just below the hero, so the gradient
            ends below the hero (page bg #FCF4EA continues underneath). */}
        <div className="bg-[linear-gradient(to_bottom,#FCF4EA_0%,#FFFBF3_8%)]">
          {/* Sticky nav — transparent (no fill). */}
          <Suspense>
            <div className="sticky top-0 z-50 px-4 md:px-8 pt-6 pb-6">
              <div className="hidden md:block">
                <Header
                  breakpoint="desktop"
                  stacked
                  projectLinks={[
                    { label: 'Patina', slug: 'patina', active: true },
                    { label: 'Zebra Finch', slug: 'zebra-finch' },
                    { label: 'Vodafone', slug: 'vodafone' },
                    { label: 'Herc Rentals', slug: 'herc-rentals' },
                  ]}
                />
              </div>
              <div className="md:hidden">
                <Header breakpoint="mobile" />
              </div>
            </div>
          </Suspense>
          {/* ===== TOP — Figma 479:1813 ===== */}
          {/* Parallax-and-pass: the intro drifts up at half scroll speed while
              the hero (full speed, higher z) passes over it — so the link
              climbs out of the gap the shrinking hero would expose. Desktop. */}
        <div className="md:relative">
          <ParallaxY speed={0.5} className="md:relative md:z-0">
        <RevealOnScroll className="px-[calc(14px_+_7%)] pt-12 md:pl-[250px] md:pr-8 md:pt-[14px]">
          <div className="max-w-[935px] font-[350] text-[32px] leading-[36px] md:text-[56px] md:leading-[60px] tracking-[-2.5px]">
            <p className="mb-0">
              <span className="font-medium text-text-primary">Patina, </span>
              <span className="text-text-primary">
                a screen time awareness app that tints your wallpaper as you use your phone.
                <br />
                <br />
              </span>
            </p>
            <p className="text-text-primary">
              I designed, vibe coded and shipped it. Solo human + AI, zero to one.
            </p>
          </div>

          <div className="mt-10 max-w-[640px] flex flex-col text-metadata-md text-text-primary">
            {METADATA_LINES.map((line) => (
              <span key={line} className="whitespace-pre-wrap">
                {line}
              </span>
            ))}
          </div>

          <ExternalLink url="patinascreen.com" className="mt-8" />
        </RevealOnScroll>
          </ParallaxY>{/* /parallax intro */}

        {/* Hero — slides up over the pinned intro with the ScrollScale shrink
            (like the other images), no bg. */}
        <div className="mt-16 md:mt-[110px] px-4 md:px-8 md:relative md:z-10">
          <ScrollScale className="w-full h-[calc(100dvh+20px)]" innerClassName="relative overflow-hidden rounded-[24px]">
            <HeroVideo />
          </ScrollScale>
        </div>
        </div>{/* /pin-and-pass wrapper */}

        {/* (metrics moved below the colour banner — see METRICS section) */}
        </div>
        {/* top background block ends here — page bg #FCF4EA continues below */}

        {/* ===== Sticky-pin (Figma 479:1887 / 1961 reflow): the phone pins
            on the left right below the metrics while the two text blocks
            (whyBuild + validate) scroll past it on the right. The phone is
            the first vertical image, so the gradient now ends just above. */}
        <section className="mt-16 md:mt-[120px] px-4 md:px-8">
          <div className="md:grid md:grid-cols-2 md:items-start md:gap-8">
            {/* Left half: big phone, height-driven to nearly fill the viewport
                so it reads large while staying fully visible while pinned. It
                pins at top:24px and holds while the taller right column scrolls
                past — sticks within this grid (items-start = no stretch). */}
            <PinnedColumn className="md:self-start">
              <PinnedPhonePanel
                alt="Patina — screen time colors your wallpaper"
                className="w-full"
              />
            </PinnedColumn>
            {/* Right half (starts at the horizontal middle): the two blocks
                scroll past the pinned phone. Big inter-block gap + bottom
                padding give the pin its travel (column taller = longer hold). */}
            <div className="mt-16 md:mt-0 md:ml-[100px] flex flex-col gap-[120px] md:gap-[150px] md:max-w-[540px] md:pt-0 md:pb-0">
              <EditorialQA
                {...QA.whyBuild}
                className="max-w-[380px] md:mt-[200px] md:self-center"
                questionClassName={PINNED_QA_QUESTION}
                answerClassName={PINNED_QA_ANSWER}
                revealMargin={25}
              />
              <EditorialQA
                {...QA.validate}
                className="max-w-[380px] md:self-center md:pb-[40dvh]"
                questionClassName={PINNED_QA_QUESTION}
                answerClassName={PINNED_QA_ANSWER}
              />
            </div>
          </div>
        </section>

        {/* ===== Figma 479:1961: colour banner ===== */}
        <div className="mt-16 md:mt-[100px] px-4 md:px-8">
          <RoundedImage
            src="/patina/color-banner2.png"
            alt="Patina color palette banner"
            className="w-full aspect-[1217/720]"
          />
        </div>

        {/* Metrics — Figma 522:6936: three stat cards, 20px below the banner.
            Same full width + ScrollScale shrink-on-scroll as the images. */}
        <div className="mt-[20px] px-4 md:px-8">
          <ScrollScale className="w-full">
            <div className="flex flex-col gap-5 md:flex-row md:items-stretch">
              {METRICS.map((metric) => (
                <div
                  key={metric.value}
                  className="flex-1 md:h-[250px] flex flex-col gap-10 md:gap-0 md:justify-between rounded-[16px] bg-[#FFF7EA] px-8 py-[42px]"
                >
                  <div className="flex flex-col gap-4">
                    <p className="text-display-stat text-[32px]! font-medium tracking-[-1px] text-accent-secondary">
                      {metric.value}
                    </p>
                    <p className="text-metadata-md text-text-primary">{metric.label}</p>
                  </div>
                  <p className="text-metadata-md text-text-secondary">{metric.note}</p>
                </div>
              ))}
            </div>
          </ScrollScale>
        </div>

        {/* ===== Pinned phone (right) + impulse & colorBlind Q&As (left), after
            the metrics. The phone pins centred while the two Q&As scroll past
            on the left (PinnedColumn now finds whichever column is the
            scrolling sibling, so the pin can be the right column). ===== */}
        <section className="mt-16 md:mt-[120px] px-4 md:px-8">
          <div className="md:grid md:grid-cols-2 md:items-start md:gap-8">
            {/* Left: the two Q&As scroll past the pinned phone. */}
            <div className="mt-16 md:mt-0 flex flex-col gap-[120px] md:gap-[150px]">
              <EditorialQA
                {...QA.impulse}
                className="max-w-[380px] md:mt-[300px] md:self-center"
                questionClassName={PINNED_QA_QUESTION}
                answerClassName={PINNED_QA_ANSWER}
              />
              <EditorialQA
                {...QA.colorBlind}
                className="max-w-[380px] md:self-center md:pb-[40dvh]"
                questionClassName={PINNED_QA_QUESTION}
                answerClassName={PINNED_QA_ANSWER}
              />
            </div>
            {/* Right: pinned phone — the screen-time tint transition. */}
            <PinnedColumn className="md:self-start">
              <TintPhone className="w-full" />
            </PinnedColumn>
          </div>
        </section>

        {/* Two brand/logo cards side by side, after the colour-blind Q&A.
            Big + apart at the start, shrinking + converging to small + close. */}
        <div className="mt-16 md:mt-[120px] px-4 md:px-8">
          <ConvergingPair
            srcA="/patina/logo1.png"
            srcB="/patina/logo2.png"
            alt="Patina brand exploration"
          />
        </div>

        {/* ===== THE REST — Figma 479:2035 ===== */}
        {/* nameOrigin (R) — centred in the right half, nudged 50px left */}
        <div className="mt-16 md:mt-[100px] px-[calc(14px_+_7%)] md:px-0 md:grid md:grid-cols-12">
          <div className="col-start-7 col-span-6 md:justify-self-center md:-translate-x-[50px]">
            <EditorialQA {...QA.nameOrigin} className="max-w-[380px]" />
          </div>
        </div>

        {/* ===== minimalist Q&A (L) + the smoke as a tall vertical panel (R).
            The "subtle living element that shifts colour over time" the answer
            describes IS this smoke, so they sit side by side. ===== */}
        <section className="mt-16 md:mt-[108px] px-4 md:px-8">
          <div className="md:grid md:grid-cols-2 md:items-center md:gap-8">
            {/* Left: the minimalist Q&A, centered in the column and vertically
                centered against the smoke panel. */}
            <div>
              <EditorialQA {...QA.minimalist} className="max-w-[380px] md:mx-auto" />
            </div>
            {/* Right: smoke, as a vertical portrait panel. */}
            <ScrollScale
              className="mt-12 w-full aspect-[677/887] md:mt-0"
              innerClassName="relative overflow-hidden rounded-[24px] bg-[#FFF7EA]"
            >
              <SmokeCanvas className="absolute inset-0 block h-full w-full" />
            </ScrollScale>
          </div>
        </section>

        {/* ===== Sticky-pin (inverted): the websiteIntro Q&A pins on the left
            while the two images (grayscale montage + quote card) scroll past
            it on the right. Same PinnedColumn mechanism as the phone section,
            with the roles swapped (text pinned, media scrolls). ===== */}
        <section className="mt-16 md:mt-[158px] px-4 md:px-8">
          <div className="md:grid md:grid-cols-2 md:items-start md:gap-8">
            {/* Left: Q&A pinned 56px below the viewport top, centered
                horizontally in the column. */}
            <PinnedColumn className="md:self-start" pinTop={56}>
              <EditorialQA {...QA.websiteIntro} className="max-w-[380px] md:mx-auto" />
            </PinnedColumn>
            {/* Right: the two images, stacked, scrolling past the pinned text. */}
            <div className="mt-16 md:mt-0 flex flex-col gap-[120px] md:gap-[50px]">
              <RoundedImage
                src="/patina/web1.png"
                alt="Your phone takes up all the space"
                className="w-full aspect-[677/887]"
              />
              <RoundedImage
                src="/patina/web2.png"
                alt="Been living inside your phone?"
                className="w-full aspect-[677/887]"
              />
            </div>
          </div>
        </section>

        {/* website preview (full-width) */}
        <div className="mt-16 md:mt-[155px] px-4 md:px-8">
          <RoundedImage
            src="/patina/patina-site2.png"
            alt="Patina website preview"
            className="w-full aspect-[1217/720]"
          />
        </div>

        {/* ===== Pinned wallpaper-picker phone (right) + giveUp & biggestMistake
            Q&As scrolling (left), after the website preview. Same mechanism as
            the tint-phone section: phone pins centred, the two Q&As scroll past
            it on the left. ===== */}
        <section className="mt-16 md:mt-[120px] px-4 md:px-8">
          <div className="md:grid md:grid-cols-2 md:items-start md:gap-8">
            {/* Left: the two Q&As scroll past the pinned phone. */}
            <div className="mt-16 md:mt-0 flex flex-col gap-[120px] md:gap-[150px]">
              <EditorialQA
                {...QA.giveUp}
                className="max-w-[380px] md:mt-[140px] md:self-center"
              />
              <EditorialQA
                {...QA.biggestMistake}
                className="max-w-[380px] md:self-center md:pb-[40dvh]"
              />
            </div>
            {/* Right: pinned phone — the wallpaper picker. */}
            <PinnedColumn className="md:self-start">
              <PhoneMockupPanel
                src="/patina/phone-images.png"
                alt="Patina — pick a wallpaper screen"
                imgAspect="aspect-[834/1720]"
                className="w-full"
              />
            </PinnedColumn>
          </div>
        </section>

        {/* ===== "What's next for Patina?" Q&A (right) + the screen-time phone
            (newPatina.png) on the left, after the biggest-mistake section. ===== */}
        <section className="mt-16 md:mt-[120px] px-4 md:px-8">
          <div className="md:grid md:grid-cols-12 md:items-start">
            {/* Left: the two phones, stacked, scrolling past the pinned Q&A. */}
            <div className="flex flex-col gap-16 md:col-start-1 md:col-span-6 md:gap-[120px]">
              <PhoneMockupPanel
                src="/patina/newPatina.png"
                alt="Patina — today's screen time tinting the wallpaper"
                imgAspect="aspect-[858/1720]"
                className="w-full"
              />
              <PhoneMockupPanel
                src="/patina/newPatina2.png"
                alt="Patina — settings: daily limit, reset time, wallpaper"
                imgAspect="aspect-[858/1720]"
                className="w-full"
              />
            </div>
            {/* Right: the Q&A, pinned while the two phones scroll past, aligned
                to match the "Why the name Patina?" block. */}
            <PinnedColumn className="mt-12 md:mt-0 md:col-start-7 md:col-span-6 md:self-start">
              <div className="md:mx-auto md:max-w-[380px] md:-translate-x-[34px]">
                <EditorialQA {...QA.whatsNext} className="max-w-[380px]" />
              </div>
            </PinnedColumn>
          </div>
        </section>

        {/* ===== "What did you learn?" — Figma 565:7759. Heading top-left,
            then three numbered rows separated by hairline dividers: a large
            number and the text sit in the right portion of each row. ===== */}
        <section className="mt-16 md:mt-[140px] px-4 md:px-8">
          <h2 className="text-[28px] leading-[32px] tracking-[-1px] font-medium text-text-primary md:pl-[90px] md:text-[32px] md:leading-[38px]">
            What did you learn?
          </h2>

          <ul className="mt-8 list-none border-b border-black/10 md:mt-10">
            <LearnRow n="1">
              <LearnLead>Knowing is different from understanding.</LearnLead>
              <br />
              {'Owning every product decision alone, what to build, what to cut, what to ship, teaches you to see a product in 360°.'}
              <br />
              {'You know a lot of things in theory until you are the only one responsible for them. Things that once looked like bad management start making sense.'}
            </LearnRow>
            <LearnRow n="2">
              <LearnLead>Measuring is the art of asking</LearnLead>
              {" the right questions and filtering the right answers. And sometimes you just don't have enough reliable data to ask the next right question. It's a game of patience."}
            </LearnRow>
            <LearnRow n="3">
              <LearnLead>When you have control, you move faster.</LearnLead>
              {" You launch knowing the design isn't perfect, because iteration is entirely yours. No waiting for developers. No convincing stakeholders."}
              <br />
              <br />
              {'That changes how you think about quality and the amount of experimentation you can do.'}
            </LearnRow>
          </ul>
        </section>

        {/* ===== More projects — Figma 568:7761. A "MORE PROJECTS" label and a
            row of three related-project cards (Vodafone / Zebra Finch /
            Herc Rentals). ===== */}
        <section className="mt-16 md:mt-[90px] px-4 md:px-8 pb-24 md:pb-40">
          <p className="font-[family-name:var(--font-family-mono)] text-[11px] leading-[22px] tracking-[-0.11px] text-text-secondary md:pl-[90px]">
            MORE PROJECTS
          </p>
          <div className="mt-4 flex flex-col gap-4 md:mt-[18px] md:flex-row md:gap-8 md:pl-[90px]">
            <ProjectCard src="/vodafone/vodafone3.webp" label="VODAFONE">
              Making a deeply technical concept feel safe and obvious to someone who just wants
              their Wi-Fi to work.
            </ProjectCard>
            <ProjectCard src="/zebra-finch/zebra1.webp" label="ZEBRA FINCH">
              Making a deeply technical concept feel safe and obvious to someone who just wants
              their Wi-Fi to work.
            </ProjectCard>
            <ProjectCard src="/herc/home1.webp" label="HERC RENTALS">
              Making a deeply technical concept feel safe and obvious to someone who just wants
              their Wi-Fi to work.
            </ProjectCard>
          </div>
        </section>
      </main>
    </div>
  );
}
