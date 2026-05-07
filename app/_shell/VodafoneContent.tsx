import Image from 'next/image';
import { QAItem } from '../../src/components/QAItem/QAItem';

// EXPLORATION — promote color to a token before merging.
const QA_CARD_BG = '#F9F9F9';
const IMAGE_BLOCK_BG = '#F9F9F9';

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
    question: "So it's was a very complex product to work on",
    answer:
      "Very. The app runs across multiple markets, with different router models, different legal content, and sometimes completely different flows. I needed to think that one design decision ripple across all of those variations. It required a level of attention to detail that most app projects don't demand.",
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
      "First you need to understand them yourself, and sometimes that was truly a challenge. Being close to the dev team on a daily basis was crucial for that. And then comes the harder part: taking something complex and making it feel safe and obvious to someone who just wants their Wi-Fi to work. Concepts like MAC address randomisation, for example, require the user to go into their phone settings and turn off a security feature. Explaining what that is and why it's safe to do on a home network in a usable and beautiful way was genuinely hard. You need a very balanced and simple communication between text and visuals and then test with users.",
  },
  inHouse: {
    question:
      'What was it like being part of an in-house product team after years of consultancy?',
    answer:
      'Different in the best way. The product environment changes how you design. You optimise less for the handoff and more for the product. Everyone is on the same page, working toward the same goals, making informed decisions based on real data. You grow the product, not just launch it. That felt like my natural environment. A lot of people over the years told me I was built for product.',
  },
};

function HeroImage() {
  return (
    <div
      className="shrink-0 w-full aspect-[1217/809] rounded-sm overflow-hidden relative"
      style={{ backgroundColor: IMAGE_BLOCK_BG }}
    >
      <Image
        src="/vodafone/hero.png"
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
    <div
      className="rounded-sm grid grid-cols-1 @[768px]:grid-cols-2 gap-0 @[768px]:gap-2"
      style={{ backgroundColor: QA_CARD_BG }}
    >
      <p className="px-8 pt-8 pb-0 @[768px]:pb-8 @[1100px]:p-14 text-heading-lg text-text-primary">
        Vodafone Broadband, an award-winning app that lets millions of customers manage their home broadband. I joined their global in-house product team as Senior Product Designer, working on one of the most technically complex consumer apps I've worked on.
      </p>
      <div className="px-8 pt-10 pb-8 @[768px]:pt-8 @[1100px]:p-14 flex flex-col text-metadata-md text-text-primary">
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

function QACard({ question, answer }: { question: string; answer: string }) {
  return (
    <div
      className="rounded-sm p-8 @[1100px]:p-14 flex items-center"
      style={{ backgroundColor: QA_CARD_BG }}
    >
      <QAItem question={question} answer={answer} size="lg" />
    </div>
  );
}

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
    <div
      className={`w-full h-full ${aspect} relative rounded-sm overflow-hidden`}
      style={{ backgroundColor: IMAGE_BLOCK_BG }}
    >
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
      <HeroImage />

      <DescriptionMetadata />

      {/* Section 1: phone with networks LEFT | two Q&As stacked RIGHT */}
      <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
        <FillImage src="/vodafone/phone-networks.png" alt="Vodafone app — connected devices view" aspect="aspect-[605/800]" />
        <div className="grid grid-rows-2 gap-2 h-full">
          <QACard {...QA.whatItDoes} />
          <QACard {...QA.complex} />
        </div>
      </section>

      {/* Section 2: 2x2 — Q&A + network illustration / phone-QR + Q&A */}
      <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
        <div className="grid grid-rows-2 gap-2 h-full">
          <QACard {...QA.hardest} />
          <FillImage src="/vodafone/phone-qr.png" alt="Vodafone app — QR pairing screen" aspect="aspect-[605/440]" />
        </div>
        <div className="grid grid-rows-2 gap-2 h-full">
          <FillImage src="/vodafone/network-illustration.png" alt="Network status illustration" aspect="aspect-[605/440]" />
          <QACard {...QA.dayToDay} />
        </div>
      </section>

      {/* Section 3: two Q&As stacked LEFT | phone with red gradient RIGHT */}
      <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
        <div className="grid grid-rows-2 gap-2 h-full">
          <QACard {...QA.reliable} />
          <QACard {...QA.complexity} />
        </div>
        <FillImage src="/vodafone/phone-welcome.png" alt="Vodafone app — Welcome to your App screen" aspect="aspect-[605/800]" />
      </section>

      {/* Section 4: two Q&As side-by-side, full width */}
      <section className="grid grid-cols-1 @[768px]:grid-cols-2 gap-2">
        <QACard {...QA.technical} />
        <QACard {...QA.inHouse} />
      </section>
    </div>
  );
}
