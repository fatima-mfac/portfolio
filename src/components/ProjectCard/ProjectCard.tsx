import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  title: string;
  role: string;
  href?: string;
  className?: string;
}

export function ProjectCard({ title, role, href, className }: ProjectCardProps) {
  const content = (
    <>
      <span className={styles.title}>{title}</span>
      <span className={styles.role}>{role}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={`${styles.card} ${className ?? ''}`}>
        {content}
      </a>
    );
  }

  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      {content}
    </div>
  );
}
