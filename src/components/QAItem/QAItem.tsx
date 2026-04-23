export type QAItemSize = 'sm' | 'lg';

interface QAItemProps {
  question: string;
  answer: string;
  size?: QAItemSize;
  className?: string;
}

export function QAItem({ question, answer, size = 'sm', className }: QAItemProps) {
  const questionClass = size === 'lg' ? 'text-heading-md' : 'text-body-lg-medium';
  const answerClass = size === 'lg' ? 'text-body-xl' : 'text-body-lg-book';

  return (
    <div className={`flex flex-col w-full ${className ?? ''}`}>
      <p className={`${questionClass} text-text-primary`}>{question}</p>
      <p className={`${answerClass} text-text-primary`}>{answer}</p>
    </div>
  );
}
