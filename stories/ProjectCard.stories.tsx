import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { ProjectCard } from '../src/components/ProjectCard/ProjectCard';

const meta = {
  title: 'Components/ProjectCard',
  component: ProjectCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'App Patina',
    role: 'I built an app to make us put our phones down. I had the idea, designed it, built and shipped it.',
    href: '/use-case',
  },
};
