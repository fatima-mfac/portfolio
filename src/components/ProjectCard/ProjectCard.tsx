import Link from 'next/link';

interface ProjectCardProps {
  title: string;
  role: string;
  href?: string;
  className?: string;
}

export function ProjectCard({ title, role, href, className }: ProjectCardProps) {
  const cardClasses = `group flex flex-col gap-1 py-3 px-4 rounded-sm no-underline cursor-pointer transition-colors duration-fast ease-out bg-background-card-soft hover:bg-background-card ${className ?? ''}`;

  const content = (
    <>
      <span className="text-label-sm tracking-[0.06em]! text-text-primary transition-colors duration-fast ease-out group-hover:text-text-secondary">
        {title}
      </span>
      <span className="text-body-lg text-text-primary transition-colors duration-fast ease-out group-hover:text-text-secondary line-clamp-2">
        {role}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} scroll={false} className={cardClasses}>
        {content}
      </Link>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}
