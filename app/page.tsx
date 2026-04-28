import { FilterTag } from '../src/components/FilterTag/FilterTag';
import { ProjectCard } from '../src/components/ProjectCard/ProjectCard';
import { Shell } from './_shell/Shell';

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
 * Index — left column shows the heading + projects list. The right column
 * is driven by `?project=` (HomeHero by default, project content otherwise).
 *
 * On mobile, when `?project=` is set we render the project as a full-bleed
 * overlay with a back button that returns to /work.
 */
export default function Home() {
  return (
    <Shell mobileOverlayWhenProjectSet>
      <Heading />
      <ProjectsSection />
    </Shell>
  );
}
