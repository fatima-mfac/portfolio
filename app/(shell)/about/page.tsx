// About — viewport-locked letter-ring backdrop with scrolling content.
// Figma source: node 264:2765.
//
// Structure:
// 1. Fixed letter-ring backdrop — `position: fixed inset-0`, owns the
//    page background. Spins in once on mount via .about-ring-spinner.
//    Never moves on scroll. Sits behind the scrolling content;
//    pointer-events disabled so clicks pass through.
// 2. Scrolling content:
//    - First viewport: the centered description, which fades and
//      drifts upward as the user scrolls (AboutHeroDescription).
//    - Below the first viewport: Q&A cards revealed by RevealOnScroll
//      as they cross into view. The cards are solid white and visually
//      cover the ring backdrop where they sit.

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { QAItem } from '../../../src/components/QAItem/QAItem';
import { RevealOnScroll } from '../../../src/components/RevealOnScroll/RevealOnScroll';
import { AboutHeroDescription } from './AboutHeroDescription';
import { AboutLetterRing, type AboutLetter } from './AboutLetterRing';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About Fátima Cunha — senior product designer with 18 years across consumer and enterprise products.',
};

const DESCRIPTION =
  'Senior product designer with 18 years of experience across consumer and enterprise products. Vodafone, PizzaHut, NOS, Herc Rentals, Sonae.';

// Each letter's position on the ring is given by `angle` (degrees,
// measured clockwise from 12 o'clock, so -90° = top, 0° = right, 90° =
// bottom). `rotate` is the per-letter rotation taken from the Figma —
// preserved verbatim so the scattered/falling feel of the original
// composition survives the responsive re-layout.
const LETTERS: AboutLetter[] = [
  { ch: 'F', angle: -90, rotate:    0    },
  { ch: 'Á', angle: -30, rotate:  54.88  },
  { ch: 'T', angle:  30, rotate: 125.89  },
  { ch: 'I', angle:  90, rotate:    0    },
  { ch: 'M', angle: 150, rotate: -117.86 },
  { ch: 'A', angle: 210, rotate: -63.95  },
];

// Q&A content for the cards below the hero. Order matches the Figma
// frame node 264:2881. `answer` can be a string (paragraphs separated
// by `\n\n`) or an array of React nodes when a paragraph needs inline
// formatting (e.g. card 5's link to the LinkedIn recommendations).
const RECOMMENDATIONS_URL =
  'https://www.linkedin.com/in/fatimacunhadesigner/details/recommendations/';

const QUESTIONS: Array<{
  question: string;
  answer: string | ReadonlyArray<ReactNode>;
}> = [
  {
    question: 'Who are you in three words?',
    answer: 'Curious. Curious. Curious.',
  },
  {
    question:
      'After 18 years in consultancy, you chose to step away. Why?',
    answer:
      "I wanted the intimacy with a product that consultancy couldn't give me. To stay long enough with a challenge and help shape not just the experience but also the vision.\n\nSo I took a break to travel, study and get more creative. I painted, wrote, built an app, an agentic design system, and learned how to work with AI as a creative partner. Now I'm ready to get back.",
  },
  {
    question: 'What do you want to do next?',
    answer:
      "Work on a great product, with challenging ideas, with smart, humble people. I would love to find a great team where we push each other to be the best possible, to help teams embrace not being satisfied with the first answer. I'm good at that.\n\nIdeally a product company or early stage startup where design actually shapes what gets built. Remote or Porto based.",
  },
  {
    question: "What won't you do?",
    answer:
      "Roles where design is a service department, where you're expected to be just a doer, not a thinker. Working with teams that confuse confidence with ego.",
  },
  {
    question: "What's it like to work with you?",
    answer: [
      "People say it's easy and fun, that I light things up even when the pressure is high. I tend to focus on the solution rather than the problem, and I push people to aim higher without making them feel bad about where they are. They say I care.",
      <>
        It seems I might be a cool person after all. See it for yourself{' '}
        <a
          href={RECOMMENDATIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-text-primary hover:text-text-accent transition-colors duration-fast ease-out"
        >
          here
        </a>
        .
      </>,
    ],
  },
  {
    question: 'What makes you different?',
    answer:
      "I like to go deep on things, especially when they're complex or unclear, and then bring them into focus. I'm comfortable making decisions and living with the tradeoffs, not just designing and prototyping screens.\n\nI'm also a bit of a geek. I like technology, I experiment a lot, and I document everything as I go. The rationale, the doubts, the things to check later. I believe that what makes the difference in design is a mix of taste, judgment, and instinct.",
  },
  {
    question: 'What do you do that annoys people?',
    answer:
      "Sometimes I get too excited about possibilities and push until the last second, always wondering if there's a better answer just around the corner. For people who are happy with good enough, I can feel persistent and never fully settled on what we arrived at.\n\nI always feel it could be a little bit better, but I've learned when to act on that and when to let it go.",
  },
  {
    question: 'What do you think about AI?',
    answer:
      "I think AI is the best thing that could have happened to someone who loves learning, debating ideas, and building things. The perfect tool for restless minds. I think it's worth the risk of extinction.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Fixed letter-ring backdrop — never moves on scroll. Owns the
          page background; the scrolling section below is transparent
          so the ring shows through wherever a card isn't covering it.
          pointer-events disabled so clicks pass through to the cards. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-background-primary overflow-hidden pointer-events-none"
        // `--ring-radius` is a single value (perfect circle). It maxes
        // out at whichever viewport axis is smaller, less ~60px to leave
        // room for the letter itself, clamped to [140, 460].
        style={{ ['--ring-radius' as string]: 'clamp(140px, min(45vw, calc(50dvh - 60px)), 460px)' }}
      >
        {/* Letters spin in once on arrival — one clockwise revolution
            that decelerates into place. The 6 spans are wrapped in a
            single rotator so they move as a rigid ring; each letter's
            individual Figma rotation is preserved on the inner span. */}
        <style>{`
          @keyframes about-ring-spin-in {
            from { opacity: 0; transform: rotate(-360deg); }
            to   { opacity: 1; transform: rotate(0deg); }
          }
          .about-ring-spinner {
            animation: about-ring-spin-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) both;
            transform-origin: 50% 50%;
          }
          @media (prefers-reduced-motion: reduce) {
            .about-ring-spinner { animation: none; }
          }
        `}</style>
        {/* Outer wrapper: one-time spin-in on mount. Inner wrapper
            (AboutLetterRing): scroll-driven continuous rotation. The
            two transforms compose, so the initial spin and the
            scroll-driven turn cohabit cleanly. */}
        <div className="absolute inset-0 about-ring-spinner">
          <AboutLetterRing letters={LETTERS} />
        </div>

        {/* Description — sibling of the spinner (so it doesn't rotate
            with it) and centered to the viewport (not to the main,
            which sits below the header). Fades + drifts upward on
            scroll. */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <AboutHeroDescription>{DESCRIPTION}</AboutHeroDescription>
        </div>
      </div>

      {/* Scrolling content — transparent so the fixed ring shows
          through. pointer-events-none lets hover/clicks pass through
          the (transparent) spacer to the contact links in the fixed
          backdrop below; the cards container re-enables them. */}
      <section aria-label="About" className="relative pointer-events-none">
        {/* First viewport — spacer above the cards. Shorter than a full
            viewport so the first card peeks at the bottom with just its
            question visible (~100px of peek).
            - Mobile: document scroll, main sits below the header → the
              spacer subtracts header (~80px) + peek (~100px) = 180px.
            - Desktop: main fills the viewport (Shell.tsx makes it
              md:absolute md:inset-0), so the header doesn't shift the
              main down → only peek (~100px) is subtracted.
            Tune the peek by changing the px values. */}
        <div className="h-[calc(100dvh-180px)] md:h-[calc(100dvh-100px)]" aria-hidden="true" />

        {/* Q&A cards. The first card peeks at the bottom on initial
            load as a scroll affordance — but the whole stack stays
            hidden until the hero description has settled in, so the
            arrival sequence is: ring spins → sentence fades + zooms in →
            cards rise into the peek position. The delay (2.5s) is the
            description's delay (0.5s) + duration (2s). RevealOnScroll
            on each card still drives the per-card reveal as the user
            scrolls cards 2–4 into view (card 1's RevealOnScroll fires
            immediately on mount but stays invisible behind this
            wrapper's opacity until the wrapper animation runs). */}
        <style>{`
          @keyframes about-cards-stage-in {
            from { opacity: 0; transform: translateY(40px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .about-cards-stage-in {
            animation: about-cards-stage-in 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
          }
          @media (prefers-reduced-motion: reduce) {
            .about-cards-stage-in { animation: none; }
          }
        `}</style>
        <div className="relative pb-32 flex flex-col items-center gap-4 px-4 pointer-events-auto about-cards-stage-in">
          {QUESTIONS.map((q, i) => {
            // `w-full max-w-[605px]` sits on the wrapper (not the
            // article) so every card is the same width regardless of
            // content length. Without this, a flex column with
            // items-center shrinks each wrapper to its content width,
            // and the short card 1 ("Curious. Curious. Curious.") ends
            // up visibly narrower than the others.
            const article = (
              <article className="bg-background-card rounded-sm p-14 w-full">
                <QAItem question={q.question} answer={q.answer} size="sm" />
              </article>
            );

            // The first card is staged in by the surrounding
            // about-cards-stage-in wrapper (opacity 0 → 1, drift up).
            // Wrapping it ALSO in RevealOnScroll breaks on desktop:
            // the card peeks below the IntersectionObserver's -12%
            // rootMargin threshold during the initial transform, so
            // RevealOnScroll never reveals, and the wrapper's
            // animation can't override the inline opacity:0.
            if (i === 0) {
              return (
                <div key={i} className="w-full max-w-[605px]">
                  {article}
                </div>
              );
            }

            return (
              <RevealOnScroll key={i} className="w-full max-w-[605px]">
                {article}
              </RevealOnScroll>
            );
          })}
        </div>
      </section>
    </>
  );
}
