import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Metadata lives in this layout because work/page.tsx is a Client
// Component, and `metadata` can only be exported from Server Components.
export const metadata: Metadata = {
  title: 'Work',
  description:
    'Selected work by Fátima Cunha — Patina, Vodafone, Zebra Finch and Herc Rentals.',
};

export default function WorkLayout({ children }: { children: ReactNode }) {
  return children;
}
