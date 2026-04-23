import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { Header } from '../src/components/Header/Header';

const meta = {
  title: 'Composites/Header',
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
      { url: 'patinascreen.com', href: 'https://patinascreen.com' },
      { url: 'somefont.com', href: 'https://somefont.com' },
      { url: 'someproject.com', href: 'https://someproject.com' },
      { url: 'anotherproject.io', href: 'https://anotherproject.io' },
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
      { label: 'About', href: '/about', active: true },
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
