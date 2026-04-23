import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NavItem } from '../src/components/NavItem/NavItem';

const meta = {
  title: 'Atoms/NavItem',
  component: NavItem,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof NavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Index', href: '/', state: 'default' },
};

export const Active: Story = {
  args: { label: 'About', href: '/about', state: 'active' },
};
