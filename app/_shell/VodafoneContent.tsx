import type { ReactNode } from 'react';
import Image from 'next/image';
import { QAItem } from '../../src/components/QAItem/QAItem';
import { RevealOnScroll } from '../../src/components/RevealOnScroll/RevealOnScroll';

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
      "Very. The app runs across multiple markets, with different router models, different legal content, and sometimes completely different flows. I needed to think about how one design decision would ripple across all of those variations. It required a level of attention to detail that most app projects don't demand.",
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
  lostBattle: {
    question: 'Tell me about a lost battle.',
    // First paragraph: opener + setup, separated by a hard line break
    // (no paragraph gap). Second paragraph: the punchline, with the
    // usual paragraph gap above.
    answer: [
      <>
        I have a funny one.<br />
        The app has a network status section at the top you see every time you open it. When we updated to the new design system, the illustration library had nothing that represented Wi-Fi. Strange, given the entire product is about Wi-Fi. I asked why, and it had simply been left off the order sent to the agency that did the illustrations.
      </>,
      'The solution was to use a cloud upload icon instead. Users noticed in testing. They said upload, cloud storage. Not Wi-Fi. I pushed for a proper illustration and even suggested prompting AI to generate one. The answer from leadership was that we needed to stick with what we had in the design system. It still bothers me to this day.',
    ],
  },
};

function HeroImage() {
  return (
    <div className="shrink-0 w-full h-[calc(100dvh-80px)] rounded-sm overflow-hidden relative bg-background-card-cool">
      <Image
        src="/vodafone/hero.webp"
        alt="Vodafone Broadband — 3D house illustration"
        fill
        sizes="(min-width: 768px) 1217px, 100vw"
        className="object-cover"
        priority
      />
    </div>
  );
}

function DescriptionMetadata() {
  return (
    <div className="rounded-sm grid grid-cols-1 @[768px]:grid-cols-2 gap-0 @[768px]:gap-2 bg-background-card-cool">
      <p className="px-8 pt-8 pb-0 @[768px]:pb-8 @[1100px]:p-20 text-heading-lg-book text-text-primary">
        <span className="text-heading-lg">Vodafone Broadband,</span> an award-winning app that lets millions of customers manage their home broadband. I joined their global in-house product team as Senior Product Designer, working on one of the most technically complex consumer apps I&apos;ve worked on.
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
      </div>
    </div>
  );
}

function QACard({ question, answer }: { question: string; answer: string | ReadonlyArray<ReactNode> }) {
  return (
    <div className="rounded-sm p-8 @[1100px]:p-20 flex items-center bg-background-card-cool">
      <QAItem question={question} answer={answer} size="lg" />
    </div>
  );
}

/** In-section image. On mobile it sizes to its aspect ratio; at the
 *  two-column breakpoint it also fills its grid cell height (h-full) so
 *  paired image/Q&A rows stay aligned. Without the @[768px] gate, h-full
 *  would stretch a horizontal image tall on mobile and override aspect. */
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
    <div className={`w-full @[768px]:h-full ${aspect} relative rounded-sm overflow-hidden bg-background-card-cool`}>
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
 * Vodafone use-case content rendered in the right column when
 * `?project=vodafone`. Layout matches the Figma frame.
 */
export function VodafoneContent() {
  return (
    <div className="@container flex flex-col gap-2">
      <RevealOnScroll offset={16} duration={900}>
        <HeroImage />
      </RevealOnScroll>

      <RevealOnScroll>
        <DescriptionMetadata />
      </RevealOnScroll>

      {/* Section 1: phone with networks LEFT | two Q&As stacked RIGHT */}
      <RevealOnScroll>
        <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
          <FillImage src="/vodafone/phone-networks.webp" alt="Vodafone app — connected devices view" aspect="aspect-[605/750]" />
          <div className="flex flex-col @[768px]:grid @[768px]:grid-rows-2 gap-2 @[768px]:h-full">
            <QACard {...QA.whatItDoes} />
            <QACard {...QA.complex} />
          </div>
        </section>
      </RevealOnScroll>

      {/* Section 2: 2x2 — Q&A + network illustration / phone-QR + Q&A */}
      <RevealOnScroll>
        <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
          <div className="flex flex-col @[768px]:grid @[768px]:grid-rows-2 gap-2 @[768px]:h-full">
            <QACard {...QA.hardest} />
            <FillImage src="/vodafone/devices.webp" alt="Vodafone app — connected devices view" aspect="aspect-[605/440]" />
          </div>
          <div className="flex flex-col @[768px]:grid @[768px]:grid-rows-2 gap-2 @[768px]:h-full">
            <FillImage src="/vodafone/devices-phone.webp" alt="Vodafone app — My devices screen" aspect="aspect-[605/440]" />
            <QACard {...QA.dayToDay} />
          </div>
        </section>
      </RevealOnScroll>

      {/* Section 3: two Q&As stacked LEFT | phone with red gradient RIGHT */}
      <RevealOnScroll>
        <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
          <div className="flex flex-col @[768px]:grid @[768px]:grid-rows-2 gap-2 @[768px]:h-full">
            <QACard {...QA.reliable} />
            <QACard {...QA.complexity} />
          </div>
          <FillImage src="/vodafone/phone-welcome.webp" alt="Vodafone app — Welcome to your App screen" aspect="aspect-[605/750]" />
        </section>
      </RevealOnScroll>

      {/* Section 4: two Q&As side-by-side, full width */}
      <RevealOnScroll>
        <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
          <QACard {...QA.technical} />
          <QACard {...QA.inHouse} />
        </section>
      </RevealOnScroll>

      {/* Section 5: network illustration LEFT | "lost battle" Q&A RIGHT */}
      <RevealOnScroll>
        <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
          <FillImage src="/vodafone/network-illustration.webp" alt="Network status illustration" aspect="aspect-[605/440]" />
          <QACard {...QA.lostBattle} />
        </section>
      </RevealOnScroll>
    </div>
  );
}
