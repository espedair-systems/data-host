# Data Host Management Interface

The management interface is designed with a dynamic, context-aware layout.

## 1. The Dynamic Sidebar
The sidebar acts as the primary navigation tool and changes its content based on which "card" or route you have selected:

*   **Top Action (Fixed)**: 
    *   **Directory**: Always visible at the top. Clicking this resets the entire application to the starting view (`/home`) and clears any active filters.
*   **Contextual Nav (Dynamic)**:
    *   **On Home Page**: Displays **Directory Categories**. This is a list of tags (like "inspect", "view", "sleep") that filter the registry cards in the main workspace.
    *   **In Schema View**: Displays the **Data Schema Tree**. It shows a folder structure of your data project, highlighting directories that contain `schema.json` or `collection.json`.
    *   **In Site View**: Displays **Inspect Site**. Includes a **View** button and a dedicated **Guidelines** section with two file trees: **Published** (the built HTML) and **Designed** (the source documentation).
    *   **In Mounts View**: Displays the **Services Dist Tree**, allowing you to browse the filesystem of your active distribution folder.

## 2. The Top App Bar
Located at the very top, this bar provides global controls and status:

*   **Breadcrumb Title**: Displays the current context (e.g., "Registry Directory", "Registry: View", or "Schema Management").
*   **Sidebar Toggle**: A hamburger menu icon that allows you to collapse the sidebar into an "icon-only" mode to maximize your workspace.
*   **Theme Toggle**: A sun/moon icon used to switch between Light and Dark modes.
*   **Account Menu**: An icon on the far right that opens a dropdown for advanced system features.

## 3. The Account Dropdown Menu
This menu is used for deeper administrative tasks that aren't accessed as frequently as the primary directory:

*   **Profile/Settings**: Standard system preferences.
*   **Files (Root)**: Direct access to the system's file management interface.
*   **Managed Mounts**: Shortcut to view and manage filesystem mount points.
*   **Data Services**: A quick link to open the hosted Astro site in a new tab.

## 4. The Main Workspace
The large center area where the actual content is displayed:

*   **Registry**: A grid of highly visual cards representing your sites, schemas, and configurations.
*   **Inspect Site**: A full-window iframe that "runs" and serves your Astro site directly from the local distribution folder.
*   **Management Tools**: Interfaces for editing configurations or viewing detailed schema data.

## 5. The TUI (Terminal UI)
While not on the web screen, the desktop component of Data Host provides:
*   **404 Error History**: A scrollable list of missing resources detected while you browse the Astro site.
*   **Server Logs**: Real-time output from the Go backend.
*   **Browser Control**: Automatically launches your browser to the correct management route upon startup.
