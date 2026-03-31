import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import DirectoryCard from './DirectoryCard';

const meta = {
  title: 'Components/DirectoryCard',
  component: DirectoryCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="w-[400px]">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DirectoryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    item: {
      id: '1',
      title: 'Sample Data Source',
      description: 'A comprehensive dataset containing sample records for testing and development purposes. Includes mock user data and transaction logs.',
      link: '/sample',
      internal: true,
      tags: ['data', 'testing', 'mock'],
    },
  },
};

export const Featured: Story = {
  args: {
    item: {
      id: '2',
      title: 'Core Production System',
      description: 'The main operational database for the organization. Contains live transactional data.',
      link: 'https://operations.example.com',
      featured: true,
      internal: false,
      tags: ['production', 'critical'],
    },
  },
};

export const WithImage: Story = {
  args: {
    item: {
      id: '3',
      title: 'Analytics Dashboard',
      image: 'https://placehold.co/400x200/png',
      description: 'Visual representations of key performance indicators and business metrics extracted from the data warehouse.',
      link: '/analytics',
      featured: true,
      internal: true,
      tags: ['BI', 'metrics', 'visualization'],
    },
  },
};
