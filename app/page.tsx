'use client';

import { Header } from '../src/components/Header/Header';
import { FilterTag } from '../src/components/FilterTag/FilterTag';
import { ProjectCard } from '../src/components/ProjectCard/ProjectCard';

const FILTERS = ['Leadership', 'Complex systems', 'Vibe Coding'];

const PROJECTS = [
  {
    title: 'App Patina',
    role: 'I built an app to make us put our phone down. I had the idea, designed it, built it and shipped it. Solo, end to end.',
  },
  {
    title: 'App HERC RENTALS',
    role: 'Took on the challenge of changing two of the most persistent human behaviours. Still measuring if it works.',
  },
  {
    title: 'App Patina',
    role: 'I built an app to make us put our phone down. I had the idea, designed it, built it and shipped it. Solo, end to end.',
  },
  {
    title: 'App HERC RENTALS',
    role: 'Took on the challenge of changing two of the most persistent human behaviours. Still measuring if it works.',
  },
  {
    title: 'App Patina',
    role: 'I built an app to make us put our phone down. I had the idea, designed it, built it and shipped it. Solo, end to end.',
  },
  {
    title: 'App HERC RENTALS',
    role: 'Took on the challenge of changing two of the most persistent human behaviours. Still measuring if it works.',
  },
  {
    title: 'App Patina',
    role: 'I built an app to make us put our phone down. I had the idea, designed it, built it and shipped it. Solo, end to end.',
  },
  {
    title: 'App HERC RENTALS',
    role: 'Took on the challenge of changing two of the most persistent human behaviours. Still measuring if it works.',
  },
];

function Heading() {
  return (
    <h1 className="text-heading-xl text-text-primary">
      18 years designing and recently built an app, and an agentic design system.
    </h1>
  );
}

function ProjectsSection() {
  return (
    <section aria-label="Projects" className="flex flex-col gap-6">
      <div role="group" aria-label="Filters" className="flex flex-row flex-wrap gap-2">
        {FILTERS.map((label) => (
          <FilterTag key={label} label={label} />
        ))}
      </div>

      <ul className="flex flex-col gap-2 list-none p-0 m-0">
        {PROJECTS.map((project, i) => (
          <li key={i}>
            <ProjectCard title={project.title} role={project.role} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function HeroStack() {
  return (
    <>
      <div
        aria-hidden="true"
        className="w-full rounded-md bg-background-hero aspect-[358/235] md:aspect-[1214/903] shrink-0"
      />
      <div
        aria-hidden="true"
        className="w-full rounded-md bg-background-dark aspect-[358/235] md:aspect-[1214/903] shrink-0"
      />
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-background-primary flex flex-col">
      <div className="mx-auto w-full max-w-[1680px] px-4 md:px-5 pt-8 flex flex-col md:flex-1 md:min-h-0">
        <div className="hidden md:block">
          <Header breakpoint="desktop" activeHref="/" />
        </div>
        <div className="md:hidden">
          <Header breakpoint="mobile" activeHref="/" />
        </div>

        {/* Mobile flow — natural page scroll, hero between heading and projects */}
        <main className="md:hidden mt-12 flex flex-col gap-8">
          <Heading />
          <HeroStack />
          <ProjectsSection />
        </main>

        {/* Desktop flow — two columns, each scrolls independently */}
        <main className="hidden md:grid md:grid-cols-[370px_1fr] md:gap-12 md:flex-1 md:min-h-0 md:mt-12">
          <div
            className="
              flex flex-col gap-8
              h-full overflow-y-auto pr-2 pb-8
              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            "
          >
            <Heading />
            <ProjectsSection />
          </div>
          <div
            className="
              flex flex-col gap-6
              h-full overflow-y-auto pb-8
              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            "
          >
            <HeroStack />
          </div>
        </main>
      </div>
    </div>
  );
}
