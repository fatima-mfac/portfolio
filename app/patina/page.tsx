'use client';

import Image from 'next/image';
import { Header } from '../../src/components/Header/Header';
import { FilterTag } from '../../src/components/FilterTag/FilterTag';
import { ProjectCard } from '../../src/components/ProjectCard/ProjectCard';
import { QAItem } from '../../src/components/QAItem/QAItem';
import { ExternalLink } from '../../src/components/ExternalLink/ExternalLink';
import { BackButton } from '../../src/components/BackButton/BackButton';

const FILTERS = ['Leadership', 'Complex systems', 'Vibe Coding'];

const PROJECTS = [
  {
    title: 'App Patina',
    role: 'I built an app to make us put our phone down. I had the idea, designed it, built it and shipped it. Solo, end to end.',
  },
  {
    title: 'App HERC RENTALS',
    role: 'Took on the challenge of changing two of the most persistent human behaviours. Still measuring if it works.',
  },
  {
    title: 'App Patina',
    role: 'I built an app to make us put our phone down. I had the idea, designed it, built it and shipped it. Solo, end to end.',
  },
  {
    title: 'App HERC RENTALS',
    role: 'Took on the challenge of changing two of the most persistent human behaviours. Still measuring if it works.',
  },
  {
    title: 'App Patina',
    role: 'I built an app to make us put our phone down. I had the idea, designed it, built it and shipped it. Solo, end to end.',
  },
  {
    title: 'App HERC RENTALS',
    role: 'Took on the challenge of changing two of the most persistent human behaviours. Still measuring if it works.',
  },
  {
    title: 'App Patina',
    role: 'I built an app to make us put our phone down. I had the idea, designed it, built it and shipped it. Solo, end to end.',
  },
  {
    title: 'App HERC RENTALS',
    role: 'Took on the challenge of changing two of the most persistent human behaviours. Still measuring if it works.',
  },
];

const METADATA_LINES = [
  'Role .......... Solo design and vibe coding, end to end',
  'Scope ......... Brand, Android app, Website',
  'Tools ......... Figma, Android Studio, Claude Code',
  'Published ..... April 2026',
];

const QAS_TOP = [
  {
    question: 'Why did you build Patina?',
    answer:
      "I wanted to use my phone less, and I was tired of seeing other people get lost into a device. Other apps solve this through notifications or restrictions, but notifications are easy to ignore, we get too many to notice one more, and restrictions feel like punishment. So I thought about colour, something that changes gradually through the day so you notice it before you even unlock. Simple, quiet, no judgment. For people who want awareness, not discipline tools.",
  },
  {
    question: 'How did you validate the concept before starting?',
    answer:
      "Before designing anything I spent one hour manually creating tinted versions of the same wallpaper and set up Android's automation tool to swap them at different times of day. Then I lived with it for two days. The colour shifts were noticeable and not annoying, so I decided it was worth building it, at least for myself, and it was a chance to experiment with vibe coding and ship a real product solo.",
  },
];

const QAS_MID = [
  {
    question: 'Can colour actually change an automatic impulse?',
    answer:
      "Reaching for the phone is a deep habit that's difficult to break, which is why I chose colour, it carries meaning we don't have to learn. Yellow and red signal warning across cultures, so my bet was that something this embedded could hold meaning even after repeated exposure, when most signals lose their impact.\n\nFirst users said the colour made them pause before unlocking. Some put the phone down without checking, so the results are promising but I'm still measuring whether it holds up over time, and what could make the signal stronger.",
  },
  {
    question: 'What if you are colour blind?',
    answer:
      "Yeah, I saw that limitation from the beginning and I tested the colours for colour blindness. They read differently but not differently enough to make the signal clear. I made the decision to design for most users first and ship. I'm working now on a solution for people with colour vision differences.",
  },
  {
    question: 'What almost made you give up?',
    answer:
      "The tint wasn't resetting overnight automatically. You had to open the app, which destroyed the core concept. The whole point was that it works silently in the background without you doing anything.\n\nI kept pushing with AI until we found the answer together. But that solution added some friction. So I had to make a decision: accept some friction at onboarding so the core concept could live. While testing with users I realised that tradeoff might cost me more than I thought. I iterated and I'm still measuring the results.",
  },
];

const QAS_BOTTOM = [
  {
    question: 'Why the name Patina?',
    answer:
      "Patina is the layer that forms on materials over time. It's a process I hear about a lot in architecture. After a few ideas this one felt right immediately. Something that accumulates with use and time. That's exactly what the app does to your wallpaper.",
  },
  {
    question: 'The app experience is very minimalist. Did you ever feel the pull to add more?',
    answer:
      "Every decision followed three rules: quiet, simple, no friction. Anything that didn't meet them was removed. Visually, the app had to feel warm, calm, and easy to use. The homepage reflects that: your daily screen time limit and active wallpaper are visible upfront, with no need to open a settings page.\n\nAt the same time, there's a subtle living element that shifts colour over time, mirroring the wallpaper. It's just colour and shape moving slowly, intended to create a calming effect and gently slow you down.",
  },
  {
    question: 'Why Figma first and not vibe design it from the start?',
    answer:
      "For me defining an identity is something very tactile. The most human part of a product. Seeing shapes and colours side by side, feeling how they interact with typography, testing voice through words. My process always starts with writing. The north star, what the product is and is not. After that I explore organically in Figma. It's faster than asking AI and much easier to compare. Sometimes you just need to change a colour. Two seconds in Figma. In AI it's a prompt, a wait, and a result you can't easily compare to what you had before.",
  },
  {
    question:
      "The website intro has a completely different visual style from Patina's colour palette and vibe. Why?",
    answer:
      'I wanted to tell a story of a problem that meets a solution. So I thought about what visual environment could express the feeling of being trapped, of repetition with no control. Black and white felt right for that, it reinforces the heaviness of it. Then colour arrives as the solution. You snap out of the repetition and back into the real colourful world. That contrast is intentional.',
  },
  {
    question: "What's the next version of Patina?",
    answer:
      "After gathering more feedback and analysing analytics, the next version focuses on three things. A 14-day free trial followed by a paid tier for continued use. A colour vision accessibility solution for users the current version doesn't serve well enough. And better instrumentation to actually measure whether the signal is changing behaviour, not just whether it's being noticed.",
  },
];

function ProjectsSection() {
  return (
    <section aria-label="Projects" className="flex flex-col gap-6">
      <div role="group" aria-label="Filters" className="flex flex-row flex-wrap gap-2">
        {FILTERS.map((label) => (
          <FilterTag key={label} label={label} />
        ))}
      </div>

      <ul className="flex flex-col gap-2 list-none p-0 m-0">
        {PROJECTS.map((project, i) => (
          <li key={i}>
            <ProjectCard title={project.title} role={project.role} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function HeroImage() {
  return (
    <div className="shrink-0 w-full aspect-[1217/809] rounded-md overflow-hidden bg-background-hero relative">
      <Image
        src="/patina-hero.png"
        alt="Patina hero"
        fill
        sizes="(min-width: 768px) 1217px, 100vw"
        className="object-cover"
        priority
      />
    </div>
  );
}

function ScreenshotImage() {
  return (
    <div className="shrink-0 w-full aspect-[717/753] rounded-md bg-background-card flex items-center justify-center p-2 overflow-hidden">
      <Image
        src="/patina-screenshot.png"
        alt="Patina app screenshot"
        width={301}
        height={627}
        className="h-full w-auto object-contain rounded-[28px] shadow-[0_0_64px_8px_rgba(81,61,28,0.10)]"
      />
    </div>
  );
}

function PatinaBrandPlaceholder() {
  // Stylised brand block — replace with real Figma asset when ready.
  return (
    <div className="shrink-0 w-full aspect-[717/692] rounded-md bg-background-hero flex items-center justify-center">
      <span className="text-heading-xl text-text-on-dark">patina</span>
    </div>
  );
}

function ArticleDescription() {
  return (
    <p className="text-body-xl text-text-primary">
      <span className="text-heading-xl-semibold">Patina,</span> a screen time awareness app
      that tints your wallpaper as you use your phone. I designed, vibe coded and shipped
      it. Created its brand identity, and website. Solo human + AI, zero to one.
    </p>
  );
}

function ArticleMetadata() {
  return (
    <div className="flex flex-col text-metadata-lg text-text-primary">
      {METADATA_LINES.map((line) => (
        <span key={line} className="whitespace-pre">
          {line}
        </span>
      ))}
    </div>
  );
}

function Article() {
  return (
    <article className="w-full max-w-[717px] mx-auto flex flex-col gap-12 pb-12">
      <ArticleDescription />
      <ArticleMetadata />
      <ExternalLink url="patinascreen.com" />

      {QAS_TOP.map((qa) => (
        <QAItem key={qa.question} question={qa.question} answer={qa.answer} size="lg" />
      ))}

      <ScreenshotImage />

      {QAS_MID.map((qa) => (
        <QAItem key={qa.question} question={qa.question} answer={qa.answer} size="lg" />
      ))}

      <PatinaBrandPlaceholder />

      {QAS_BOTTOM.map((qa) => (
        <QAItem key={qa.question} question={qa.question} answer={qa.answer} size="lg" />
      ))}
    </article>
  );
}

export default function PatinaPage() {
  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-background-primary flex flex-col">
      <div className="mx-auto w-full max-w-[1680px] px-4 md:px-5 pt-8 flex flex-col md:flex-1 md:min-h-0">
        {/* Header is desktop-only on use-case pages — mobile shows the use
            case as a full-bleed overlay with just a back button. */}
        <div className="hidden md:block">
          <Header breakpoint="desktop" activeNavHref="/" activeProjectHref="/patina" />
        </div>

        {/* Mobile flow — full-bleed overlay: back button on top, then hero, then article */}
        <main className="md:hidden flex flex-col gap-8">
          <BackButton href="/work" ariaLabel="Back to Work" />
          <HeroImage />
          <Article />
        </main>

        {/* Desktop flow — two columns, each scrolls independently */}
        <main className="hidden md:grid md:grid-cols-[370px_1fr] md:gap-12 md:flex-1 md:min-h-0 md:mt-12">
          <div
            className="
              flex flex-col gap-8
              h-full overflow-y-auto pr-2 pb-8
              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            "
          >
            <ProjectsSection />
          </div>
          <div
            className="
              flex flex-col gap-12
              h-full overflow-y-auto pb-8
              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            "
          >
            <HeroImage />
            <Article />
          </div>
        </main>
      </div>
    </div>
  );
}
