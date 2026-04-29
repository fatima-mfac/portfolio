import { QAItem } from '../../src/components/QAItem/QAItem';
import { ExternalLink } from '../../src/components/ExternalLink/ExternalLink';

/**
 * Generic use-case article. Drives the right column for projects that
 * don't yet have bespoke layouts (Vodafone, Zebra Finch, Herc Rentals).
 *
 * Patina stays as its own bespoke component because it has real assets
 * and a particular brand placeholder. Once the rest of the projects
 * have final assets too, we can collapse Patina into this same shape.
 */
export interface UseCaseSection {
  type: 'qa' | 'screenshot' | 'brand';
  /** For `qa`: the question. For `screenshot`/`brand`: optional caption. */
  question?: string;
  /** For `qa`: the answer. */
  answer?: string;
  /** For `screenshot`/`brand`: the label shown on the placeholder block. */
  label?: string;
}

export interface UseCaseConfig {
  /** Optional bold lead phrase — e.g. "Vodafone," — followed by the body. */
  descriptionBoldPrefix?: string;
  description: string;
  metadata: string[];
  externalLink?: { url: string; href?: string };
  sections: UseCaseSection[];
  /** Label shown over the hero placeholder (project name). */
  heroLabel: string;
}

function HeroPlaceholder({ label }: { label: string }) {
  return (
    <div className="shrink-0 w-full aspect-[1217/809] rounded-md bg-background-hero flex items-center justify-center">
      <span className="text-heading-xl text-text-on-dark">{label}</span>
    </div>
  );
}

function ScreenshotPlaceholder({ label }: { label?: string }) {
  return (
    <div className="shrink-0 w-full aspect-[717/753] rounded-md bg-background-card flex items-center justify-center">
      {label ? (
        <span className="text-heading-xl text-text-tertiary">{label}</span>
      ) : null}
    </div>
  );
}

function BrandPlaceholder({ label }: { label?: string }) {
  return (
    <div className="shrink-0 w-full aspect-[717/692] rounded-md bg-background-hero flex items-center justify-center">
      {label ? (
        <span className="text-heading-xl text-text-on-dark">{label}</span>
      ) : null}
    </div>
  );
}

export function UseCase({ config }: { config: UseCaseConfig }) {
  return (
    <>
      <HeroPlaceholder label={config.heroLabel} />

      <article className="w-full max-w-[717px] mx-auto flex flex-col gap-12 pb-12">
        <p className="text-heading-xl text-text-primary">
          {config.descriptionBoldPrefix ? (
            <>
              <span className="text-heading-xl-semibold">
                {config.descriptionBoldPrefix}
              </span>{' '}
            </>
          ) : null}
          {config.description}
        </p>

        <div className="flex flex-col text-metadata-lg text-text-primary">
          {config.metadata.map((line) => (
            <span key={line} className="whitespace-pre">
              {line}
            </span>
          ))}
        </div>

        {config.externalLink ? (
          <ExternalLink
            url={config.externalLink.url}
            href={config.externalLink.href}
          />
        ) : null}

        {config.sections.map((section, i) => {
          if (section.type === 'qa') {
            return (
              <QAItem
                key={i}
                question={section.question ?? ''}
                answer={section.answer ?? ''}
                size="lg"
              />
            );
          }
          if (section.type === 'screenshot') {
            return <ScreenshotPlaceholder key={i} label={section.label} />;
          }
          return <BrandPlaceholder key={i} label={section.label} />;
        })}
      </article>
    </>
  );
}
