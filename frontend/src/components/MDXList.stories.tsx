import type { Meta, StoryObj } from '@storybook/react';
import MDXList from './MDXList';

const meta = {
  title: 'Components/MDXList',
  component: MDXList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      // Mock fetch for Storybook
      window.fetch = async () => {
        return new Response(JSON.stringify([
          {
            title: 'Getting Started Guide',
            description: 'Learn the basics of setting up and accessing this system.',
            fileName: 'getting-started.mdx'
          },
          {
            title: 'Advanced Configurations',
            description: 'Deep dive into performance tuning and advanced setup options available for power users.',
            fileName: 'advanced-config.mdx'
          }
        ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
      };

      return <Story />;
    }
  ]
} satisfies Meta<typeof MDXList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Guidelines: Story = {
  args: {
    apiUrl: '/api/docs/guidelines',
    title: 'System Guidelines',
    subtitle: 'Read our comprehensive operational guidelines.',
    type: 'guidelines',
  },
};

export const Training: Story = {
  args: {
    apiUrl: '/api/docs/training',
    title: 'Training Material',
    subtitle: 'Access interactive training courses and examples.',
    type: 'training',
  },
};
