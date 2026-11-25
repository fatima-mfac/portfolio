'use client';

import { ViewTransition, useState, type ReactNode } from 'react';
import { arrivedByHeroMorph, heroTransitionName } from '../../src/lib/projectNavSource';

/**
 * A case study's hero, paired with the homepage thumbnail it grows out of.
 *
 * Shares a view-transition name with that thumbnail (see HomeStack), so a
 * card click morphs the thumbnail into this box across the route change.
 * `default="none"` keeps it from animating on any other transition — only
 * the cross-page pairing (`share`) runs. The morph's timing lives in
 * globals.css under `.hero-morph`.
 *
 * `entranceClass` is the hero's own load animation. Arriving through the
 * morph the hero is already in place, so it's dropped — otherwise it would
 * fade in a second time inside the morph.
 */
export function HeroMorphTarget({
  project,
  entranceClass,
  className,
  children,
}: {
  /** Homepage project slug, e.g. 'herc-rentals' — not the route. */
  project: string;
  entranceClass: string;
  className: string;
  children: ReactNode;
}) {
  const [morphed] = useState(arrivedByHeroMorph);
  return (
    <ViewTransition name={heroTransitionName(project)} share="hero-morph" default="none">
      <div className={`${morphed ? '' : entranceClass} ${className}`}>{children}</div>
    </ViewTransition>
  );
}
