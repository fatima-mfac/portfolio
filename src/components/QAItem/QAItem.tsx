import styles from './QAItem.module.css';

export type QAItemSize = 'sm' | 'lg';

interface QAItemProps {
  question: string;
  answer: string;
  size?: QAItemSize;
  className?: string;
}

export function QAItem({ question, answer, size = 'sm', className }: QAItemProps) {
  return (
    <div className={`${styles.item} ${size === 'lg' ? styles.lg : styles.sm} ${className ?? ''}`}>
      <p className={styles.question}>{question}</p>
      <p className={styles.answer}>{answer}</p>
    </div>
  );
}
