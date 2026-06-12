'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '../../src/components/Header/Header';
import { markProjectNavSource, projectHref } from '../../src/lib/projectNavSource';

interface WorkCardProps {
  /** `?project=` slug — routed through projectHref() to the v3 page (or
   *  the v1 homepage overlay for Zebra Finch). */
  slug: string;
  /** Mono uppercase label. */
  label: string;
  /** One- or two-word tagline under the label. */
  tagline: string;
  /** Thumbnail in public/work/. */
  image: string;
}

// Order + copy match the Figma "Work-Mobile" frame (node 742:13411).
const PROJECTS: WorkCardProps[] = [
  { slug: 'patina',       label: 'PATINA',       tagline: 'Mobile. Solo',                  image: '/work/patina.png'   },
  { slug: 'vodafone',     label: 'VODAFONE',     tagline: 'Mobile. In-house',              image: '/work/vodafone.png' },
  { slug: 'herc-rentals', label: 'HERC RENTALS', tagline: 'B2B Fleet Platform',            image: '/work/herc.png'     },
  { slug: 'zebra-finch',  label: 'ZEBRA FINCH',  tagline: 'Agentic Design System Pipeline', image: '/work/zebra.png'   },
];

/**
 * A work card: white panel with a landscape thumbnail on top, a mono
 * uppercase label, and a tagline. The whole card is the tap target.
 */
function WorkCard({ slug, label, tagline, image }: WorkCardProps) {
  return (
    <Link
      href={projectHref(slug)}
      scroll={false}
      onClick={() => markProjectNavSource('work')}
      aria-label={`Open ${label} use case`}
      className="group flex flex-col gap-3 rounded-[12px] bg-background-card-warm p-3 no-underline ring-1 ring-black/[0.08]"
    >
      <div className="relative aspect-[143/100] w-full overflow-hidden rounded-[6px]">
        <Image
          src={image}
          alt={label}
          fill
          sizes="(min-width: 768px) 200px, 45vw"
          className="object-cover transition-transform duration-fast ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col gap-1">
        {/* 16px Roboto Mono SemiBold, slight negative tracking — matches
            the Figma label. */}
        <span className="font-[family-name:var(--font-family-mono)] text-[14px] font-semibold leading-tight tracking-[-0.01em] text-text-primary">
          {label}
        </span>
        <span className="text-body-lg text-text-secondary">{tagline}</span>
      </div>
    </Link>
  );
}

export default function WorkPage() {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      {/* Mirror Shell.tsx's header positioning verbatim so navigating
          to /work doesn't shift the logo + menu. Outer: px-4 md:px-0.
          Header wrapper: pt-6 md:px-8 (24px top, 32px horizontal at
          desktop). Anything else here will produce a visible jump. */}
      <div className="mx-auto w-full px-4 md:px-0 flex flex-col">
        {/* Headers read ?project= via useSearchParams() — Suspense is
            required for the static-export build to prerender /work. */}
        <Suspense>
          <div className="pt-6 md:px-8">
            {/* Desktop fallback header — /work isn't in the desktop nav,
                so "Index" stays active as the closest section. */}
            <div className="hidden md:block">
              <Header breakpoint="desktop" />
            </div>
            {/* Mobile header — "Work" is active here. */}
            <div className="md:hidden">
              <Header breakpoint="mobile" />
            </div>
            {/* Spacer below header — matches Shell.tsx's <div className="h-6" />
                so the content below sits the same distance from the header. */}
            <div className="h-6" />
          </div>
        </Suspense>

        <main className="mx-auto mt-4 grid w-full max-w-[420px] grid-cols-2 gap-4 pb-12 md:px-5">
          {PROJECTS.map((project) => (
            <WorkCard key={project.slug} {...project} />
          ))}
        </main>
      </div>
    </div>
  );
}
