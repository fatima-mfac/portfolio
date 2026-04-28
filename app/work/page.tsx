'use client';

import { Header } from '../../src/components/Header/Header';

const PROJECTS = [
  { label: 'Patina', href: '/patina' },
  { label: 'Vodafone', href: '/vodafone' },
  { label: 'Zebra Finch', href: '/zebra-finch' },
  { label: 'Herc Rentals', href: '/herc-rentals' },
];

interface WorkCardProps {
  label: string;
  href: string;
}

/**
 * Page-local card composition. Placeholder background until real cover
 * images are provided — at that point this likely becomes a reusable
 * component (e.g. WorkCard atom) and the bg moves to an <img> element.
 */
function WorkCard({ label, href }: WorkCardProps) {
  return (
    <a
      href={href}
      aria-label={`Open ${label} use case`}
      className="block w-full aspect-[358/176] rounded-sm bg-ink-300/30 relative no-underline transition-colors duration-fast ease-out hover:bg-ink-300/40"
    >
      <span className="absolute bottom-6 left-6 text-body-md text-text-secondary">
        {label}
      </span>
    </a>
  );
}

export default function WorkPage() {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      <div className="mx-auto w-full max-w-[1680px] px-4 md:px-5 pt-8 flex flex-col">
        {/* Desktop fallback header — /work isn't in the desktop nav, so
            "Index" stays active as the closest section. */}
        <div className="hidden md:block">
          <Header breakpoint="desktop" activeNavHref="/" />
        </div>
        {/* Mobile header — "Work" is active here. */}
        <div className="md:hidden">
          <Header breakpoint="mobile" activeNavHref="/work" />
        </div>

        <main className="w-full max-w-[420px] mx-auto mt-4 flex flex-col gap-4 pb-12">
          {PROJECTS.map((project) => (
            <WorkCard key={project.href} label={project.label} href={project.href} />
          ))}
        </main>
      </div>
    </div>
  );
}
