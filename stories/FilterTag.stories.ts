import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FilterTag } from '../src/components/FilterTag/FilterTag';

const meta = {
  title: 'Atoms/FilterTag',
  component: FilterTag,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof FilterTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'All', state: 'default' },
};

export const Active: Story = {
  args: { label: 'Branding', state: 'active' },
};
