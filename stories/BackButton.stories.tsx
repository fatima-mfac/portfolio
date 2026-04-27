import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { BackButton } from '../src/components/BackButton/BackButton';

const meta = {
  title: 'Components/BackButton',
  component: BackButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof BackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ariaLabel: 'Go back',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ padding: '24px', background: '#f0f1fa' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithHref: Story = {
  args: {
    href: '/work',
    ariaLabel: 'Back to Work',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ padding: '24px', background: '#f0f1fa' }}>
        <Story />
      </div>
    ),
  ],
};
