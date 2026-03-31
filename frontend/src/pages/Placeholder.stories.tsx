import type { Meta, StoryObj } from '@storybook/react';
import PlaceholderPage from './Placeholder';

const meta = {
  title: 'Pages/Placeholder',
  component: PlaceholderPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof PlaceholderPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Work in Progress',
    description: 'We are currently building this feature. Please check back later.',
  },
};

export const CustomDescription: Story = {
  args: {
    title: 'Database Settings',
    description: 'Configuration options for the main database instances will be available here soon.',
  },
};
