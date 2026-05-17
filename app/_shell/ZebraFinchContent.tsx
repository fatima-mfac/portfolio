import { RevealOnScroll } from '../../src/components/RevealOnScroll/RevealOnScroll';

const METADATA_LINES = [
  'Role .......... Solo design and build',
  'Scope ......... Agentic design system, Figma–Code pipeline',
  'Tools ......... Claude Code, Figma, GitHub, Storybook, VS Code',
  'Status ........ In progress',
];

/**
 * Zebra Finch use-case content rendered in the right column when
 * `?project=zebra-finch`. Layout matches the Figma frame.
 *
 * Structure:
 *   1. Hero        — Bungee Shade title, lead heading, body, diagram placeholder
 *   2. Description — short pitch + metadata table (matches other use cases)
 *   3. Process     — "Making sure the generated pages..." + 6 numbered steps
 *   4. Principles  — 4-column lavender card with bold-prefixed body
 *   5. Stack       — heading + row of tool logos
 */

interface Step {
  n: number;
  title: string;
  body: string;
  tag?: string;
  /** Optional supporting image rendered to the right of the step on desktop.
   *  width/height in pixels — matches the natural size from Figma so we
   *  don't upscale or distort the source image.
   *  fullWidth makes the image span the whole text column instead of the
   *  default fixed 300px. */
  image?: { src: string; alt: string; width: number; height: number; fullWidth?: boolean };
}

const STEPS: Step[] = [
  {
    n: 1,
    title: 'Created six custom skills.',
    body: "Each step in the pipeline is a documented procedure the agent follows, not an improvised prompt. The first versions didn't work. I refined each one by running it, watching what failed, and editing.",
    image: {
      src: '/zebra-finch/skills.webp',
      alt: 'Claude Code skills panel listing custom skills',
      width: 600,
      height: 644,
    },
  },
  {
    n: 2,
    title: 'Set up CLAUDE.md as the single project context.',
    body: 'One file with the paths, rules, and design system locations. The agent reads it every session, so nothing gets hardcoded into the skills.',
  },
  {
    n: 3,
    title: 'Metadata file per component',
    body: 'Every component has a metadata file beside it that acts as a complete spec for the agent. Beyond name and category, it holds use cases, anti-patterns with alternatives, accessibility specs, and AI-specific hints (keywords, priority, context). The anti-patterns matter most: they tell the agent "don\'t use this in context X, use Y instead." Without this layer, the agent reinvents what already exists or misuses what does.',
    image: {
      src: '/zebra-finch/metadata-code.webp',
      alt: 'Component metadata file showing antiPatterns, composition, and behavior',
      width: 600,
      height: 339,
      fullWidth: true,
    },
  },
  {
    n: 4,
    title: 'Built in approval gates at every stage',
    body: 'The agent stops and waits for review before each step. Anything off-system gets caught before it ships.',
  },
  {
    n: 5,
    tag: 'IN PROGRESS',
    title: 'Building a git hook to audit every commit',
    body: 'Every commit will trigger a drift report comparing Figma against code: components used vs declared, tokens referenced vs hardcoded. The four guardrails above catch drift in real time. The hook will catch what they miss, automatically.',
  },
  {
    n: 6,
    tag: 'IN PROGRESS',
    title: 'Building the token police',
    body: "Checks whether tokens referenced in code actually exist and if exists checks whether they're used semantically. For example: is --color-text-primary being used for body copy, or did someone reach for --color-purple-500 directly because they liked the shade? Both tokens exist; only the first is correct. Together with the drift checker, the police closes the loop on system integrity.",
  },
];

const PRINCIPLES = [
  {
    bold: 'Code wins on conflict.',
    body: 'Tokens live in code; Figma mirrors them. When the two disagree, code is right.',
  },
  {
    bold: 'Build components only when they repeat.',
    body: "The first time a pattern is used (a card, a button style, a header), it's written directly on the page. Only when the same pattern shows up a second time does it become a reusable component. Building a library of components before they're needed creates dead weight the agent has to navigate around.",
  },
  {
    bold: 'Component categories live in metadata, not folders.',
    body: "Every component sits in one flat folder; its category (atom, molecule, organism) lives in a small description file beside it. Since that category changes as components evolve, keeping it in a file rather than a folder path means the code doesn't break when a component gets reclassified.",
  },
  {
    bold: 'Skills are the design artifact.',
    body: "Design specifications used to live in Figma. Now it's a markdown file an agent can execute.",
  },
];

// Logos: simple-icons CDN for the indexed brands; VS Code is served
// locally because simple-icons doesn't host it (Microsoft brand
// restriction). The local SVG is the official mark from Wikimedia.
const STACK = [
  { name: 'Claude code', src: 'https://cdn.simpleicons.org/claude/111111' },
  { name: 'Figma',       src: 'https://cdn.simpleicons.org/figma/111111' },
  { name: 'GitHub',      src: 'https://cdn.simpleicons.org/github/111111' },
  { name: 'Storybook',   src: 'https://cdn.simpleicons.org/storybook/111111' },
  { name: 'VS Code',     src: '/zebra-finch/vscode.svg' },
];

function DescriptionMetadata() {
  return (
    <div
      className="bg-background-primary rounded-sm grid grid-cols-1 @[768px]:grid-cols-2 gap-0 @[768px]:gap-2"
    >
      <p className="px-8 pt-8 pb-0 @[768px]:pb-8 @[1100px]:p-20 text-heading-lg-book text-text-primary">
        The <span className="text-heading-lg">future of design</span>{' '}isn&apos;t designing interfaces. It&apos;s designing the systems, the guidelines, the constraints, and the fallbacks. I wanted to experiment with that, so I built a pipeline where I set the visual direction, the soul, and the rules, and the AI generates the output using only the design system. This is the foundation for future adaptive interfaces.
      </p>
      <div className="px-8 pt-10 pb-8 @[768px]:pt-8 @[1100px]:p-20 flex flex-col text-metadata-md text-text-secondary">
        {METADATA_LINES.map((line) => (
          <span
            key={line}
            className="whitespace-pre-wrap pl-[16ch] [text-indent:-16ch]"
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-background-primary rounded-sm flex flex-col gap-10 items-center justify-center text-center min-h-[calc(100dvh-80px)] px-8 py-16 @[768px]:px-16 @[768px]:py-20">
      <h1 className="text-display-xl text-text-primary">ZEBRA FINCH</h1>
      <div className="flex flex-col gap-4 items-center w-full">
        <p className="text-heading-xl text-text-primary md:whitespace-nowrap">
          I built a bidirectional Figma – Code AI agentic pipeline.
        </p>
        <p className="text-body-xl text-text-secondary max-w-[640px]">
          Starting from scratch or from an existing design system, the AI agent extracts or builds the tokens and components, then generates new pages using only the design system. Figma and code stay in sync.
        </p>
      </div>

      {/* Diagram — bidirectional Figma ↔ Code agentic pipeline.
          Framed in a white card that sits 124px inside the lavender
          hero edge. The SVG itself is capped at 800px and centred
          inside the white frame. */}
      <div className="self-stretch mx-[60px] rounded-sm bg-background-card px-8 py-[120px] @[768px]:px-12">
        <img
          src="/zebra-finch/diagram.svg"
          alt="Bidirectional Figma to Code agentic pipeline diagram"
          className="block w-full max-w-[800px] h-auto ml-auto mr-[70px]"
        />
      </div>
    </section>
  );
}

function NumberBadge({ n }: { n: number }) {
  return (
    <div className="inline-flex items-center justify-center w-12 pt-[2px] pb-[3px] px-2 rounded-md border border-border-primary">
      <span className="text-body-lg-medium text-text-primary">{n}</span>
    </div>
  );
}

function ProgressTag({ label }: { label: string }) {
  return (
    <div className="self-center inline-flex items-center justify-center pt-[2px] pb-[3px] px-2 rounded-md bg-background-hero">
      {/* text-body-sm bundles a book weight + a paragraph line-height
          (2). font-medium! bumps the weight to 500; leading-none!
          collapses the tall line box so the tag sits compact. */}
      <span className="text-body-sm font-medium! leading-none! text-text-on-dark">{label}</span>
    </div>
  );
}

function StepImage({ image }: { image: NonNullable<Step['image']> }) {
  // Default 300px wide; fullWidth images span the whole text column.
  // Height auto-scales to the source aspect either way.
  return (
    <img
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      className={`block h-auto rounded-sm ${image.fullWidth ? 'w-full' : 'w-[300px]'}`}
    />
  );
}

/** Step text block — number/tag + title on one row, body below.
 *  Images now render separately above the step in the section's flow. */
function ProcessStep({ step }: { step: Step }) {
  return (
    <div className="flex flex-col gap-2 items-start">
      {/* Number badge, title, then the optional progress tag — all on
          one row. */}
      <div className="flex gap-2 items-start">
        <NumberBadge n={step.n} />
        {/* -top-[3px] optically aligns the title with the number badge —
            the heading line-box leading otherwise sits it a touch low. */}
        <p className="relative -top-[3px] text-heading-lg text-text-primary">{step.title}</p>
        {step.tag ? <ProgressTag label={step.tag} /> : null}
      </div>
      <p className="text-body-xl text-text-secondary">{step.body}</p>
    </div>
  );
}

function ProcessSection() {
  // Steps with a supporting image render it ABOVE the step text in the
  // flow (instead of beside the step). Currently step 1 has skills.webp
  // and step 3 has metadata-code.webp.
  return (
    <section className="flex flex-col gap-10 pt-8 mx-auto max-w-[700px] w-full">
      <RevealOnScroll>
        <div className="flex flex-col gap-6">
          <p className="text-heading-xl text-text-primary">
            Making sure the generated pages use ONLY the design system
          </p>
          <p className="text-body-xl text-text-secondary">
            The biggest risk with AI building UI is that it stops using the design system. It hardcodes colors, reinvents components, and ignores the library.
          </p>
          <p className="text-body-xl text-text-secondary">
            To prevent that, this is what I did:
          </p>
        </div>
      </RevealOnScroll>

      <div className="flex flex-col gap-10">
        {STEPS.map((step) => (
          <RevealOnScroll key={step.n}>
            <div className="flex flex-col gap-6">
              <ProcessStep step={step} />
              {step.image ? <StepImage image={step.image} /> : null}
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}

function PrinciplesSection() {
  return (
    <section className="bg-background-primary rounded-sm p-8 @[768px]:p-16 flex flex-col gap-12">
      <p className="text-heading-xl text-text-primary">
        The agentic design system principles
      </p>
      <div className="grid grid-cols-1 @[768px]:grid-cols-2 @[1100px]:grid-cols-4 gap-x-14 gap-y-10">
        {PRINCIPLES.map((p) => (
          <p key={p.bold} className="text-body-xl text-text-secondary">
            <span className="font-semibold">{p.bold}</span> {p.body}
          </p>
        ))}
      </div>
    </section>
  );
}

function StackSection() {
  return (
    <section className="flex flex-col gap-6 mx-auto max-w-[700px] w-full">
      <p className="text-heading-xl text-text-primary">My stack</p>
      <ul className="flex flex-nowrap gap-x-8 items-center">
        {STACK.map((tool) => (
          <li key={tool.name} className="flex items-center gap-2 whitespace-nowrap">
            {tool.src ? (
              <img src={tool.src} alt="" className="h-5 w-5" />
            ) : null}
            <span className="text-heading-md text-text-primary">{tool.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ZebraFinchContent() {
  return (
    <div className="@container flex flex-col gap-16 pb-28">
      {/* Hero + description sit together with a tight 8px gap; the wider
          gap-16 above applies between this pair and the next section. */}
      <div className="flex flex-col gap-2">
        <RevealOnScroll offset={16} duration={900}>
          <Hero />
        </RevealOnScroll>
        <RevealOnScroll>
          <DescriptionMetadata />
        </RevealOnScroll>
      </div>
      <ProcessSection />
      <RevealOnScroll>
        <PrinciplesSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <StackSection />
      </RevealOnScroll>
    </div>
  );
}
