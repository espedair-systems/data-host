# Data Host Frontend Design System

This document outlines the architectural and visual design of the Data Host frontend application, detailing the core structure, layout strategy, and library of UI components.

## Objective & Aesthetics

The design of Data Host follows a modern, enterprise-grade application aesthetic. It aims to present dense and complex data structures (registries, pipelines, references) in a clean, comprehensive, and accessible manner.

Key aesthetic pillars:
- **Responsive Layout:** A collapsible sidebar architecture that scales cleanly from ultra-wide monitors down to compact dashboard views.
- **Dynamic Themes:** Native support for Dark/Light mode utilizing the `ColorModeContext`, allowing user preference to dictate the visual experience.
- **Micro-Animations & Transitions:** Smooth interaction transitions across all interactive elements (buttons, hover effects, collapsible navigation menus) using Tailwind animations.
- **Premium Typographic & Icon Hierarchy:** Utilizing the Lucide React icon suite and consistent, modern sans-serif typography (geist) to build high visual contrast and structural hierarchy.

## Technology Stack

- **Framework**: React 19 / Vite
- **Styling**: Tailwind CSS v4, `clsx`, and `tailwind-merge` for utility class composition.
- **Component Library Base**: `shadcn/ui` based generic components (using Radix UI under the hood for accessibility primitives).
- **Routing**: `react-router-dom` for application routing inside a single-page app architecture.
- **Storybook**: Included for isolating, documenting, and testing components independently.

## Interface Structure

The application heavily utilizes a wrapper layout (`Layout.tsx`) that enforces the global frame:
1. **Sidebar Navigation**: A collapsible drawer holding categorized navigation (Publish, Curate, Steward, Secure, Integrate, etc.) using `Collapsible` accordions to manage the dense array of routes.
2. **Main Content Area**: Encapsulated within a scrolling viewport that renders the active route defined by `react-router-dom` outlets. Built-in header components define page titles, icons, and contextual actions.

## Core UI Components

The application implements a custom-styled, composable UI kit located in `src/components/ui`.

### Data Display
- **Badge**: Highlights statuses (e.g., *Featured*, *Internal*, *Indexed*) with distinct variant styles (`outline`, `secondary`, `destructive`).
- **Card**: Provides containment blocks with headers, content areas, layouts, and footers. Used extensively in dashboard widgets (e.g., `DirectoryCard`).
- **Table / FileTree**: Specialized data rendering components to display structured tabular metrics, JSON schemas, and hierarchical directories cleanly.

### Inputs & Actions
- **Button**: A versatile interactable equipped with `cva` configurations (`default`, `ghost`, `outline`, `destructive`, `link`) and sizing controls. 
- **Input / Textarea**: Structured form elements configured for disabled, error (`aria-invalid`), and standard states.
- **Select / DropdownMenu / Switch**: Complex interactive modules powered by Radix UI, enforcing accessibility requirements natively.

### Navigation & Layout
- **Collapsible / Accordion**: Structural accordions for the sidebar menu navigation and hiding complex schema sets when not needed.
- **ScrollArea**: For unified, styled scrolling windows regardless of the user's OS or browser.
- **Tabs**: View switchers, generally used for swapping between sub-components or form sections inside heavy editor pages.

### Overlays & Feedback
- **Dialog / Sheet**: Interactive modals and sliding drawers used for editing context flows without unmounting the current view state.
- **Alert / Tooltip / Sonner**: Provides in-context informational messages, toast notifications (using `sonner`), and hover-contextual helpers on icon buttons.

## Context Constraints

To handle application state seamlessly:
- **`SidebarContext`**: Tracks whether the interface's primary sidebar is open, closed, or manually hidden based on screen real estate restrictions.
- **`ColorModeContext`**: Implements system or user-preferred toggle between `light` and `dark` themes, cascading styles automatically down through the utility classes (`dark:bg-*`).
