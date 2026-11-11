import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Metadata lives in this layout because herc/page.tsx is a Client
// Component, and `metadata` can only be exported from Server Components.
export const metadata: Metadata = {
  title: 'Herc Rentals',
  description: 'Herc Rentals — a B2B platform for renting and managing heavy equipment, including real-time fleet tracking. Product design by Fátima Cunha.',
};

export default function HercLayout({ children }: { children: ReactNode }) {
  return children;
}
