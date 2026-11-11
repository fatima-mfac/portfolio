import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Metadata lives in this layout because vodafone/page.tsx is a Client
// Component, and `metadata` can only be exported from Server Components.
export const metadata: Metadata = {
  title: 'Vodafone',
  description: 'Vodafone Broadband — an award-winning app that lets millions of customers manage their home broadband. Product design by Fátima Cunha.',
};

export default function VodafoneLayout({ children }: { children: ReactNode }) {
  return children;
}
