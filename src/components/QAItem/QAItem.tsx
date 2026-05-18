import type { ReactNode } from 'react';

export type QAItemSize = 'sm' | 'lg';

interface QAItemProps {
  question: string;
  /**
   * Answer content.
   * - **String form**: use `\n\n` between paragraphs. Each chunk renders
   *   as its own <p> in the size variant's body typography.
   * - **Array form**: each entry becomes one <p>. Use when a paragraph
   *   needs inline formatting (e.g. an <a> link) — pass a React fragment
   *   for that paragraph instead of a plain string.
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
      ? 'text-heading-sm md:text-heading-lg'
      : 'text-body-xl font-medium!';
  const answerClass = 'text-body-xl';
  const gapClass = size === 'lg' ? 'gap-2 md:gap-4' : 'gap-2';

  const paragraphs: ReadonlyArray<ReactNode> =
    typeof answer === 'string' ? answer.split(/\n\n+/) : answer;

  return (
    <div className={`flex flex-col w-full ${gapClass} ${className ?? ''}`}>
      <p className={`${questionClass} text-text-primary`}>{question}</p>
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={`${answerClass} text-text-secondary`}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
