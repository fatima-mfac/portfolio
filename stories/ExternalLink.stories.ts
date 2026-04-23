import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ExternalLink } from '../src/components/ExternalLink/ExternalLink';

const meta = {
  title: 'Atoms/ExternalLink',
  component: ExternalLink,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ExternalLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { url: 'patinascreen.com', href: 'https://patinascreen.com', state: 'default' },
};

export const Active: Story = {
  args: { url: 'patinascreen.com', href: 'https://patinascreen.com', state: 'active' },
};
