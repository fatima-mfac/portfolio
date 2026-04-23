interface ProjectCardProps {
  title: string;
  role: string;
  href?: string;
  className?: string;
}

export function ProjectCard({ title, role, href, className }: ProjectCardProps) {
  const cardClasses = `group flex flex-col gap-1 py-3 px-4 bg-background-card-translucent rounded-sm no-underline cursor-pointer transition-colors duration-fast ease-out hover:bg-background-card ${className ?? ''}`;

  const content = (
    <>
      <span className="text-label-sm text-text-secondary">{title}</span>
      <span className="text-body-lg text-text-secondary transition-colors duration-fast ease-out group-hover:text-text-primary">
        {role}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={cardClasses}>
        {content}
      </a>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}
