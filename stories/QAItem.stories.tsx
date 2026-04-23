import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { QAItem } from '../src/components/QAItem/QAItem';

const meta = {
  title: 'Components/QAItem',
  component: QAItem,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '600px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QAItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: {
    question: 'Why are you a designer?',
    answer: 'I liked two things growing up: sports and drawing. I wanted a way to combine both.',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    question: 'Why did you build Patina?',
    answer: 'I wanted to use my phone less, and I was tired of seeing other people get lost into a device.',
    size: 'lg',
  },
};
