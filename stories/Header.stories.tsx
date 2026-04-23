import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { Header } from '../src/components/Header/Header';

const meta = {
  title: 'Components/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  args: {
    breakpoint: 'desktop',
    navLinks: [
      { label: 'Index', href: '/', active: true },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    projectLinks: [
      { label: 'Patina', href: '/patina' },
      { label: 'Vodafone', href: '/vodafone' },
      { label: 'Zebra Finch', href: '/zebra-finch' },
      { label: 'Herc Rentals', href: '/herc-rentals' },
    ],
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ padding: '24px', background: '#f0f1fa' }}>
        <Story />
      </div>
    ),
  ],
};

export const Mobile: Story = {
  args: {
    breakpoint: 'mobile',
    navLinks: [
      { label: 'Index', href: '/' },
      { label: 'Work', href: '/work', active: true },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ padding: '16px', background: '#f0f1fa' }}>
        <Story />
      </div>
    ),
  ],
};
