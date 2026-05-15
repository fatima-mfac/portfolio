import Image from 'next/image';
import { QAItem } from '../../src/components/QAItem/QAItem';
import { ExternalLink } from '../../src/components/ExternalLink/ExternalLink';
import { RevealOnScroll } from '../../src/components/RevealOnScroll/RevealOnScroll';
import { FleetCrossfade } from './FleetCrossfade';

// EXPLORATION — promote color to a token before merging.
const QA_CARD_BG = '#FFFCF7';

const METADATA_LINES = [
  'Role .......... Senior Product Designer',
  'Scope ......... Mobile app, web platform, design system',
  'Tools ......... Figma',
  'Results ....... 25% quarterly growth in new digital accounts, 150% management fleet platform adoption growth in 12 months',
];

const QA = {
  whatItSolves: {
    question: 'Beyond just browsing for construction gear, what does this platform actually solve for the user?',
    answer:
      " It acts as a command center for managing every piece of equipment and job sites, giving you total control from anywhere. You have real-time analytics, equipment utilization data, diagnostics, alerts.\n\nIt’s a predictive management platform. It takes the chaos of a billion-dollar construction site and shrinks it down into an intuitive interface where you can rent, track, secure, and pay for everything easily.",
  },
  role: {
    question: 'What was your role in the team?',
    answer:
      'I was responsible for co-creating the visual direction, building the design system from scratch, designing and prototyping entire flows for complex features. I also handled presentations to very demanding stakeholders. My main focus was the fleet management and tracking side of the platform, which was the most technically demanding and complex part of the product to design for.',
  },
  ui: {
    question: 'Construction is not a beautiful world. How did you approach the UI?',
    answer:
      "We spent a lot of time finding the right balance between functionality and sleekness because the standards were high. But we also had to design for the reality of a job site. This platform was being used on tablets and phones in direct sunlight by stressed project managers.\n\nIn an interface full of data visualization, decoration wasn't an option. We stripped it back as much as possible while still feeling intentional and premium, obsessing over typography scale, color balance, and attention to detail to ensure everything was readable in those harsh conditions.",
  },
  hardest: {
    question: 'What was the hardest design challenge?',
    answer:
      "It was the fleet management system, a live map where users track dozens of pieces of equipment on one screen. You’ve got trucks, lifts, and excavators, some moving, some idling, and some broken. On top of that we had geofences and job sites. It was a visual mess.\n\nI was responsible for building that visual language from scratch. I started with shapes for categories and specific colors for equipment status. I also built the clustering logic so the screen didn’t explode when you zoomed out, creating all the rules and logic so the devs could build something that actually worked. It took a lot of testing, but we turned a chaotic map into a precision tool.",
  },
  adoption: {
    question: '150% adoption growth in 12 months. Do you take credit for that?',
    answer:
      "I believe our design played a fundamental part. When clients saw the demos, they could instantly see that the platform was easy to use and extremely useful. We didn't just build an platform, we built a tool that sales teams were proud to demo and customers actually wanted to use every day.",
  },
  differently: {
    question: 'Looking back, what would you do differently?',
    answer:
      "If I were designing this today, I would push much harder for the system to be color-blind proof. At the time, I tried really hard to come up with a system that used both color and text so the user didn't have to rely only on color to understand machine states, but the client decided not to focus on that.",
  },
};

function HeroImage() {
  return (
    <div className="shrink-0 w-full h-[calc(100dvh-80px)] rounded-sm overflow-hidden bg-background-hero relative">
      {/* EXPLORATION — interactive geofence prototype as iframe so its
          GSAP/SVG/event handlers stay isolated from the React tree. */}
      <iframe
        src="/herc/hero-animation.html"
        title="Herc Rentals — geofence prototype"
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
      />
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
        <span className="text-heading-lg">Herc Rentals,</span> a B2B platform for renting and managing heavy equipment across app and website. I was part of the product team as Senior Product Designer, owning key features including real time tracking and monitoring of heavy machinery in the field.
      </p>
      <div className="px-8 pt-10 pb-8 @[768px]:pt-8 @[1100px]:p-20 flex flex-col text-metadata-md text-text-secondary">
        {METADATA_LINES.map((line) => (
          <span
            key={line}
            className="whitespace-pre-wrap pl-[16ch] [text-indent:-16ch]"
          >
            {line}
          </span>
        ))}
        <ExternalLink url="hercrentals.com" className="mt-10 @[768px]:mt-4" />
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

/** Full-width image whose height is driven by aspect-ratio. */
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
    <div className={`w-full ${aspect} relative rounded-sm overflow-hidden`}>
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

/** In-section image that stretches to fill its grid cell. */
function FillImage({
  src,
  alt,
  aspect,
}: {
  src: string;
  alt: string;
  aspect: string;
}) {
  return (
    <div className={`w-full h-full ${aspect} relative rounded-sm overflow-hidden`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 605px, 100vw"
        className="object-cover"
      />
    </div>
  );
}

/**
 * Herc Rentals use-case content rendered in the right column when
 * `?project=herc-rentals`. Layout matches the Figma frame exactly.
 */
export function HercRentalsContent() {
  return (
    <div className="@container flex flex-col gap-2">
      <RevealOnScroll offset={16} duration={900}>
        <HeroImage />
      </RevealOnScroll>

      <RevealOnScroll>
        <DescriptionMetadata />
      </RevealOnScroll>

      {/* Section 1: phone card LEFT | two Q&As stacked RIGHT */}
      <RevealOnScroll>
        <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
          <FillImage src="/herc/phone-gradient.png" alt="Herc Rentals app — phone mockup with brand gradient" aspect="aspect-[605/750]" />
          <div className="grid grid-rows-2 gap-2 h-full">
            <QACard {...QA.whatItSolves} />
            <QACard {...QA.role} />
          </div>
        </section>
      </RevealOnScroll>

      {/* Fleet utilization dashboard — cross-fades through three views
          on an 800px-tall cream panel. */}
      <RevealOnScroll>
        <FleetCrossfade />
      </RevealOnScroll>

      {/* Section 2: 2x2 — Q&A + map / equipment phone + Q&A */}
      <RevealOnScroll>
        <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
          <div className="grid grid-rows-2 gap-2 h-full">
            <QACard {...QA.ui} />
            <FillImage src="/herc/map-pins.png" alt="Map view with equipment pins" aspect="aspect-[605/440]" />
          </div>
          <div className="grid grid-rows-2 gap-2 h-full">
            <FillImage src="/herc/equipment-phone.png" alt="Herc Rentals app — equipment selected card" aspect="aspect-[605/440]" />
            <QACard {...QA.hardest} />
          </div>
        </section>
      </RevealOnScroll>

      {/* Section 3: phone card LEFT | two Q&As stacked RIGHT */}
      <RevealOnScroll>
        <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
          <FillImage src="/herc/phone-card.png" alt="Herc Rentals app — equipment list" aspect="aspect-[605/750]" />
          <div className="grid grid-rows-2 gap-2 h-full">
            <QACard {...QA.adoption} />
            <QACard {...QA.differently} />
          </div>
        </section>
      </RevealOnScroll>
    </div>
  );
}
