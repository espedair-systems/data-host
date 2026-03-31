import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import { ColorModeProvider } from '../context/ColorModeContext';
import { SidebarProvider } from '../context/SidebarContext';

const meta = {
  title: 'Layouts/MainLayout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <ColorModeProvider>
          <SidebarProvider>
            <div className="h-screen w-full font-sans antialiased bg-background text-foreground">
              <Story />
            </div>
          </SidebarProvider>
        </ColorModeProvider>
      </MemoryRouter>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic mockup of the layout showing the sidebar and top navigation
export const Default: Story = {
  decorators: [
    (Story) => (
      <Routes>
        <Route path="/" element={<Story />}>
          <Route index element={
            <div className="p-8">
              <h2 className="text-2xl font-bold">Content Area Area</h2>
              <p className="text-muted-foreground mt-4">
                This is where the router outlet renders page content alongside the layout structure.
              </p>
            </div>
          } />
        </Route>
      </Routes>
    )
  ]
};
