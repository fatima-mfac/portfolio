export type QAItemSize = 'sm' | 'lg';

interface QAItemProps {
  question: string;
  /**
   * Answer text. Use `\n\n` to separate paragraphs — each paragraph renders
   * as its own <p> with the typography tier matching the size variant.
   */
  answer: string;
  size?: QAItemSize;
  className?: string;
}

export function QAItem({ question, answer, size = 'sm', className }: QAItemProps) {
  const questionClass = size === 'lg' ? 'text-heading-md' : 'text-body-lg-medium';
  const answerClass = size === 'lg' ? 'text-body-xl' : 'text-body-lg-book';
  const gapClass = size === 'lg' ? 'gap-2' : 'gap-1';

  const paragraphs = answer.split(/\n\n+/);

  return (
    <div className={`flex flex-col w-full ${gapClass} ${className ?? ''}`}>
      <p className={`${questionClass} text-text-primary`}>{question}</p>
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={`${answerClass} text-text-primary`}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
