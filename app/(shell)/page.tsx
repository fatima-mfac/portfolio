import { FilterTag } from '../../src/components/FilterTag/FilterTag';
import { ProjectCard } from '../../src/components/ProjectCard/ProjectCard';
import { HomeHero } from '../_shell/HomeHero';

const FILTERS = ['Leadership', 'Complex systems', 'Vibe Coding'];

const PROJECTS = [
  {
    title: 'App Patina',
    role: 'I built an app to make us put our phone down. I had the idea, designed it, built it and shipped it. Solo, end to end.',
    slug: 'patina',
  },
  {
    title: 'App HERC RENTALS',
    role: 'Took on the challenge of changing two of the most persistent human behaviours. Still measuring if it works.',
    slug: 'herc-rentals',
  },
  {
    title: 'App Patina',
    role: 'I built an app to make us put our phone down. I had the idea, designed it, built it and shipped it. Solo, end to end.',
    slug: 'patina',
  },
  {
    title: 'App HERC RENTALS',
    role: 'Took on the challenge of changing two of the most persistent human behaviours. Still measuring if it works.',
    slug: 'herc-rentals',
  },
  {
    title: 'App Patina',
    role: 'I built an app to make us put our phone down. I had the idea, designed it, built it and shipped it. Solo, end to end.',
    slug: 'patina',
  },
  {
    title: 'App HERC RENTALS',
    role: 'Took on the challenge of changing two of the most persistent human behaviours. Still measuring if it works.',
    slug: 'herc-rentals',
  },
  {
    title: 'App Patina',
    role: 'I built an app to make us put our phone down. I had the idea, designed it, built it and shipped it. Solo, end to end.',
    slug: 'patina',
  },
  {
    title: 'App HERC RENTALS',
    role: 'Took on the challenge of changing two of the most persistent human behaviours. Still measuring if it works.',
    slug: 'herc-rentals',
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
          <li key={`${project.slug}-${i}`}>
            <ProjectCard
              title={project.title}
              role={project.role}
              href={`/?project=${project.slug}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Index — left column content. The shared (shell) layout wraps this in
 * the two-column shell with the right column driven by `?project=`.
 *
 * Home is the only section that also shows the hero stack inline on
 * mobile (between heading and projects) — other sections leave the
 * mobile flow uncluttered.
 */
export default function Home() {
  return (
    <>
      <Heading />
      <div className="md:hidden flex flex-col gap-8">
        <HomeHero />
      </div>
      <ProjectsSection />
    </>
  );
}
