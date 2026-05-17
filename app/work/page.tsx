'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Header } from '../../src/components/Header/Header';

interface WorkEntryProps {
  label: string;
  subtitle: string;
  href: string;
}

// Title + one-line context for each project. Tagline copy comes from
// the Figma mobile work frame (node 1:488); update both places in
// sync if a tagline changes.
const PROJECTS: WorkEntryProps[] = [
  { label: 'Patina',       subtitle: 'Mobile. Solo',                    href: '/?project=patina'        },
  { label: 'Zebra Finch',  subtitle: 'Agentic Design System Pipeline',  href: '/?project=zebra-finch'   },
  { label: 'Vodafone',     subtitle: 'Mobile. In-house',                href: '/?project=vodafone'      },
  { label: 'Herc Rentals', subtitle: 'B2B Fleet Management Platform',   href: '/?project=herc-rentals'  },
];

/**
 * Page-local entry. A tappable two-line stack: project name + short
 * tagline. Sits on the page background — no card chrome.
 */
function WorkEntry({ label, subtitle, href }: WorkEntryProps) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={`Open ${label} use case`}
      className="flex flex-col gap-1 no-underline w-full"
    >
      <span className="text-heading-xl-semibold text-text-primary">{label}</span>
      <span className="text-body-lg text-text-secondary">{subtitle}</span>
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

        <main className="w-full max-w-[420px] mt-4 px-0 md:px-5 flex flex-col gap-6 pb-12">
          {PROJECTS.map((project) => (
            <WorkEntry key={project.href} {...project} />
          ))}
        </main>
      </div>
    </div>
  );
}
