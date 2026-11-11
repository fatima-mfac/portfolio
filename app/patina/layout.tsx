import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Metadata lives in this layout because patina/page.tsx is a Client
// Component, and `metadata` can only be exported from Server Components.
export const metadata: Metadata = {
  title: 'Patina',
  description: 'Patina — a screen time awareness app that tints your wallpaper as you use your phone. Designed, built and shipped solo by Fátima Cunha — human + AI, zero to one.',
};

export default function PatinaLayout({ children }: { children: ReactNode }) {
  return children;
}
