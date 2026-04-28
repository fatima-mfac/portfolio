/**
 * Default right-column content. Two stacked rectangles (orange + dark)
 * shown when no `?project=` is selected. Intentionally decorative.
 */
export function HomeHero() {
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
