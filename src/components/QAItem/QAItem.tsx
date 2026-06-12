import type { ReactNode } from 'react';

export type QAItemSize = 'sm' | 'lg';

// Below this length an answer is left as a single paragraph — short
// one-liners (e.g. "Curious. Curious. Curious.") shouldn't be cut in
// half. Substantial answers get an automatic mid break for readability.
const MIN_AUTOSPLIT_LENGTH = 140;

/**
 * Turns a string answer into its paragraphs.
 *   • Authored breaks win: if the text already contains `\n\n`, it's
 *     split on those and never re-balanced.
 *   • Otherwise a single substantial block is auto-split into TWO
 *     paragraphs at the sentence boundary nearest its midpoint, so every
 *     long answer reads with a paragraph break in the middle. Answers
 *     under MIN_AUTOSPLIT_LENGTH, or with no internal sentence boundary,
 *     are left whole.
 */
function toParagraphs(answer: string): string[] {
  if (/\n\n/.test(answer)) return answer.split(/\n\n+/);
  if (answer.length < MIN_AUTOSPLIT_LENGTH) return [answer];

  // Split into sentences, keeping their terminating punctuation.
  const sentences = answer.split(/(?<=[.!?])\s+/);
  if (sentences.length < 2) return [answer];

  // Pick the inter-sentence boundary whose running length is closest to
  // half the answer, so the two paragraphs come out roughly balanced.
  const half = answer.length / 2;
  let runningLength = 0;
  let bestIndex = 1;
  let bestDelta = Infinity;
  for (let i = 0; i < sentences.length - 1; i++) {
    runningLength += sentences[i].length + 1; // +1 for the joining space
    const delta = Math.abs(runningLength - half);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = i + 1;
    }
  }
  return [
    sentences.slice(0, bestIndex).join(' '),
    sentences.slice(bestIndex).join(' '),
  ];
}

interface QAItemProps {
  question: string;
  /**
   * Answer content.
   * - **String form**: use `\n\n` to force paragraph breaks. A single
   *   block with no `\n\n` is auto-split into two paragraphs at its
   *   midpoint (see toParagraphs) so long answers always read with a
   *   break in the middle. Each paragraph renders as its own <p>.
   * - **Array form**: each entry becomes one <p>, exactly as given (no
   *   auto-split). Use when a paragraph needs inline formatting (e.g. an
   *   <a> link) — pass a React fragment for that paragraph.
   */
  answer: string | ReadonlyArray<ReactNode>;
  size?: QAItemSize;
  className?: string;
}

export function QAItem({ question, answer, size = 'sm', className }: QAItemProps) {
  // Typography mirrors the Figma QAItem component (design system file,
  // node 37:393). The answer is the same body-xl tier in both variants;
  // only the question size differs (and `lg` upgrades the question
  // from text-heading-sm to text-heading-lg above --breakpoint-md).
  //   sm question: text-body-xl + medium  (17px Medium)
  //   sm answer:   text-body-xl     (17px Book,   lh ~28)
  //   lg question: text-heading-lg  (24px Regular, lh 32)
  //   lg answer:   text-body-xl     (17px Book,   lh ~28)
  const questionClass =
    size === 'lg'
      ? // Desktop questions tighten to -0.029em (= -0.7px at 24px), a touch
        // tighter than text-heading-lg's -0.02em. Scoped here so the
        // shared token (used by description headings) is untouched.
        'text-heading-sm md:text-heading-lg md:tracking-[-0.029em]!'
      : 'text-body-xl font-medium!';
  const answerClass = 'text-body-xl';

  const paragraphs: ReadonlyArray<ReactNode> =
    typeof answer === 'string' ? toParagraphs(answer) : answer;

  // Spacing is done with margins on the <p>s (not a flex gap or a
  // wrapper element) so the question and every answer paragraph stay
  // DIRECT children of the root. Some pages style answers via `[&>p~p]`
  // child-combinator selectors that depend on that flat structure, so a
  // nesting wrapper would silently drop their typography.
  //   • question → first answer: the original tight gap (lg stays
  //     responsive: 8px mobile, 16px desktop).
  //   • answer → answer: a wider 16px break, so a mid-answer paragraph
  //     reads as a real separation — same on mobile and desktop.
  const questionToAnswer = size === 'lg' ? 'mt-2 md:mt-4' : 'mt-2';

  return (
    <div className={`flex flex-col w-full ${className ?? ''}`}>
      <p className={`${questionClass} text-text-primary`}>{question}</p>
      {paragraphs.map((paragraph, i) => (
        <p
          key={i}
          className={`${answerClass} text-text-secondary ${
            i === 0 ? questionToAnswer : 'mt-4'
          }`}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
