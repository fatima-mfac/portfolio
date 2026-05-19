import Image from 'next/image';
import { QAItem } from '../../src/components/QAItem/QAItem';
import { ExternalLink } from '../../src/components/ExternalLink/ExternalLink';
import { RevealOnScroll } from '../../src/components/RevealOnScroll/RevealOnScroll';
import { PatinaHeroVideo } from './PatinaHeroVideo';
import { PhoneCrossfade } from './PhoneCrossfade';

// EXPLORATION — promote colors to tokens before merging.
// Cream background used inside Q&A cards; matches the article-container fill in Figma.
const QA_CARD_BG = '#FFFCF7';

const METADATA_LINES = [
  'Role .......... Solo design and vibe coding, end to end',
  'Scope ......... Brand, Android app, Website',
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
  minimalist: {
    question: 'The app experience is very minimalist. Why?',
    answer:
      "Every decision followed three rules: quiet, simple, no friction. Anything that didn't meet them was removed. Visually, the app had to feel warm, calm, and easy to use. The homepage reflects that: your daily screen time limit and active wallpaper are visible upfront, with no need to open a settings page.\n\nAt the same time, there's a subtle living element that shifts color over time, mirroring the wallpaper. It's just color and shape moving slowly, intended to create a calming effect and gently slow you down.",
  },
  name: {
    question: 'Why the name Patina?',
    answer:
      "Patina is the layer that forms on materials over time. It's a process I hear about a lot in architecture. After a few ideas this one felt right immediately. Something that accumulates with use and time. That's exactly what the app does to your wallpaper.",
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
  next: {
    question: "What's the next version of Patina?",
    answer:
      "After gathering more feedback and analyzing analytics, the next version focuses on four things. A 14-day free trial followed by a paid tier for continued use. A color vision accessibility solution for users the current version doesn't serve well enough. Better instrumentation to actually measure whether the signal is changing behavior, not just whether it's being noticed. And fixing visual polish, particularly adjusting some gradients that feel slightly off.",
  },
};

function HeroImage() {
  return (
    <div className="shrink-0 w-full h-[calc(100dvh-80px)] rounded-sm overflow-hidden bg-background-hero relative">
      <PatinaHeroVideo />
    </div>
  );
}

function DescriptionMetadata() {
  return (
    <div
      className="rounded-sm grid grid-cols-1 @[768px]:grid-cols-2 gap-0 @[768px]:gap-2"
      style={{ backgroundColor: QA_CARD_BG }}
    >
      <p className="px-8 pt-8 pb-0 @[768px]:pb-8 @[1100px]:p-20 text-heading-lg-book text-text-primary">
        <span className="text-heading-lg">Patina,</span> a screen time awareness app that tints your wallpaper as you use your phone. I designed, vibe coded and shipped it. Solo human + AI, zero to one.
      </p>
      <div className="px-8 pt-10 pb-8 @[768px]:pt-8 @[1100px]:p-20 flex flex-col gap-3 @[768px]:gap-0 text-metadata-md leading-[1.5]! @[768px]:leading-[2]! text-text-secondary">
        {METADATA_LINES.map((line) => (
          <span
            key={line}
            className="whitespace-pre-wrap pl-[16ch] [text-indent:-16ch]"
          >
            {line}
          </span>
        ))}
        <ExternalLink url="patinascreen.com" className="mt-10 @[768px]:mt-4" />
      </div>
    </div>
  );
}

function QACard({ question, answer }: { question: string; answer: string }) {
  return (
    <div
      className="rounded-sm p-8 @[1100px]:p-20 flex items-center"
      style={{ backgroundColor: QA_CARD_BG }}
    >
      <QAItem question={question} answer={answer} size="lg" />
    </div>
  );
}

function FlatImage({
  src,
  alt,
  aspect,
}: {
  src: string;
  alt: string;
  aspect: string;
}) {
  return (
    <div
      className={`w-full ${aspect} relative rounded-sm overflow-hidden`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 1217px, 100vw"
        className="object-cover"
      />
    </div>
  );
}

/** In-section image that stretches to fill its grid cell. The source image
 * is expected to include a safe-area margin around the focal point — that
 * margin gets cropped at any cell aspect ratio while the focal point stays
 * centered in view. `zoom` scales the image inside the container; the
 * overflow stays cropped by the wrapper's `overflow-hidden`. */
function FillImage({
  src,
  alt,
  aspect,
  zoom = 1,
}: {
  src: string;
  alt: string;
  /** Minimum aspect ratio so single-image rows still have a height. */
  aspect: string;
  /** Visual zoom factor (1 = fit, 1.2 = 20% bigger, etc.). */
  zoom?: number;
}) {
  // Instead of CSS-scaling the rasterized image (which blurs), we
  // wrap it in an oversized div so Next/Image renders at that larger
  // native size. The outer container crops via overflow-hidden; the
  // source comes from Next at the right resolution. Quality 92 is a
  // quiet upgrade from the default 75 for these focal-point shots.
  const targetWidth = Math.ceil(605 * zoom);
  const overflowPct = (zoom - 1) * 100;
  return (
    <div className={`w-full h-full ${aspect} relative rounded-sm overflow-hidden`}>
      <div
        className="absolute"
        style={
          zoom === 1
            ? { inset: 0 }
            : {
                width: `${zoom * 100}%`,
                height: `${zoom * 100}%`,
                left: `${-overflowPct / 2}%`,
                top: `${-overflowPct / 2}%`,
              }
        }
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`(min-width: 768px) ${targetWidth}px, 100vw`}
          quality={92}
          className="object-cover"
        />
      </div>
    </div>
  );
}

/**
 * Phone-card slot: the phone is centered with at least 300px of padding
 * inside the cell so it floats in cream. The skin.webp is the visible
 * phone frame; the main-video plays inside that frame's screen area.
 */
function PhoneVideoCard() {
  return (
    <div
      className="w-full h-full rounded-sm relative flex items-center justify-center"
      style={{ backgroundColor: '#FFF9EF', padding: '150px', minHeight: '900px' }}
    >
      <div className="relative h-full aspect-[640/1386]" style={{ transform: 'scale(1.15)' }}>
        {/* Video sits inside the phone's screen area. The skin.webp has
            a transparent middle, so the video shows through. Inset
            percentages are eyeballed to the skin's screen cut-out — tune
            if the video pokes out of the bezel. */}
        <video
          src="/patina/main-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute object-cover"
          style={{
            top: 'calc(3% - 20px)',
            bottom: 'calc(3% + 20px)',
            left: 'calc(5% - 13px)',
            right: 'calc(5% + 13px)',
            borderRadius: '8%',
            transform: 'scale(0.95)',
          }}
        />
        <Image
          src="/patina/skin.webp"
          alt="Patina app frame"
          fill
          sizes="640px"
          className="object-contain pointer-events-none"
        />
      </div>
    </div>
  );
}

/**
 * Patina use-case content rendered in the right column when `?project=patina`.
 * EXPLORATION layout — bespoke 50/50 grid with flat-image visual blocks
 * (mockups, brand panels, quote cards) interleaved with QACard text blocks.
 */
export function PatinaContent() {
  return (
    <div className="@container flex flex-col gap-2">
      <RevealOnScroll offset={16} duration={900}>
        <HeroImage />
      </RevealOnScroll>

      <RevealOnScroll>
        <DescriptionMetadata />
      </RevealOnScroll>

      <RevealOnScroll>
        <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
          <PhoneVideoCard />
          <div className="grid grid-rows-2 gap-2 h-full">
            <QACard {...QA.whyBuild} />
            <QACard {...QA.validate} />
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll>
        <FillImage
          src="/patina/color-banner.webp"
          alt="Patina color palette banner"
          aspect="aspect-[2434/1406]"
        />
      </RevealOnScroll>

      <RevealOnScroll>
        <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
          <div className="grid grid-rows-2 gap-2 h-full">
            <QACard {...QA.impulse} />
            <QACard {...QA.colorBlind} />
          </div>
          <PhoneCrossfade />
        </section>
      </RevealOnScroll>

      {/* Row 1 — two Q&As side by side */}
      <RevealOnScroll>
        <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
          <QACard {...QA.minimalist} />
          <QACard {...QA.name} />
        </section>
      </RevealOnScroll>

      {/* Row 2 — "Been living…" image on the left, websiteIntro Q&A on the right */}
      <RevealOnScroll>
        <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
          <FillImage src="/patina/quote-card-2.webp" alt="Been living inside your phone? quote" aspect="aspect-[605/440]" />
          <QACard {...QA.websiteIntro} />
        </section>
      </RevealOnScroll>

      {/* Full-width Patina website preview */}
      <RevealOnScroll>
        <FillImage
          src="/patina/patina-site.webp"
          alt="Patina website preview"
          aspect="aspect-[2434/1616]"
        />
      </RevealOnScroll>

      {/* Rows 3–4 — two Q&As stacked on the left, landing.webp spans both
          on the right */}
      <RevealOnScroll>
        <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
          <div className="grid grid-rows-2 gap-2 h-full">
            <QACard {...QA.giveUp} />
            <QACard {...QA.next} />
          </div>
          <FillImage src="/patina/patina-logo.webp" alt="Patina brand mark over warm gradient" aspect="aspect-[605/750]" zoom={1.2} />
        </section>
      </RevealOnScroll>
    </div>
  );
}
