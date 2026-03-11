import React, { useState, useMemo, useEffect } from 'react';
import {
  Menu as MenuIcon,
  LayoutDashboard as DashboardIcon,
  Database as StorageIcon,
  Settings as SettingsIcon,
  UserCircle as AccountCircle,
  Layers as LayersIcon,
  Rocket as RocketIcon,
  ChevronLeft as ChevronLeftIcon,
  User as PersonIcon,
  Tag as LabelIcon,
  Moon as DarkModeIcon,
  Sun as LightModeIcon,
  Eye as ViewIcon,
  BookOpen as BookIcon,
  GraduationCap as SchoolIcon,
  FolderOpen as CategoryIcon,
  Table as TableIcon,
  AlertCircle as ErrorIcon,
  Cable as CableIcon,
  Globe as EnvIcon,
} from 'lucide-react';
import { useNavigate, useLocation, Outlet, useSearchParams } from 'react-router-dom';
import FileTree from './FileTree';
import directoryData from '../data/directory.json';
import { useColorMode } from '../context/ColorModeContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const drawerWidth = 'w-60';
const collapsedWidth = 'w-16';

interface NavItem {
  text?: string;
  icon?: React.ReactNode;
  path?: string;
  external?: boolean;
  divider?: boolean;
}

interface DirectoryItem {
  id: string;
  title: string;
  tags?: string[];
  image?: string;
  featured?: boolean;
  internal?: boolean;
  description: string;
  link: string;
}

const NavButton = ({ item, selected, onClick, title, className, collapsed }: { item: NavItem, selected?: boolean, onClick?: () => void, title?: string, className?: string, collapsed?: boolean }) => {
  const content = (
    <Button
      variant={selected ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-4 px-3",
        collapsed ? "justify-center px-0" : "",
        selected ? "font-semibold text-primary" : "text-muted-foreground",
        className
      )}
      onClick={onClick}
    >
      <div className={cn("shrink-0", selected ? "text-primary" : "text-muted-foreground")}>
        {item.icon}
      </div>
      {!collapsed && <span>{item.text}</span>}
    </Button>
  );

  if (collapsed && title) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right">
            {title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [schemas, setSchemas] = useState<{ name: string }[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { mode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTag = searchParams.get('tag');

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    (directoryData as DirectoryItem[]).forEach((item) => {
      item.tags?.forEach((tag: string) => tags.add(tag));
    });
    return ['All', 'Preferred', ...Array.from(tags).sort()];
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuItemClick = (path: string, external?: boolean) => {
    if (external) {
      window.open(path, '_blank');
    } else if (path !== '#') {
      navigate(path);
    }
    setMobileOpen(false);
  };

  useEffect(() => {
    if (location.pathname === '/site') {
      fetch('/api/site/schemas')
        .then(res => res.json())
        .then(data => setSchemas(data))
        .catch(err => console.error("Failed to fetch schemas", err));
    }
  }, [location.pathname]);

  const handleTagClick = (tag: string) => {
    const tagParam = (tag === 'All' || activeTag === tag) ? null : tag;

    if (location.pathname !== '/') {
      if (tagParam) {
        navigate(`/?tag=${tagParam}`);
      } else {
        navigate('/');
      }
    } else {
      if (tagParam) {
        setSearchParams({ tag: tagParam });
      } else {
        setSearchParams({});
      }
    }
    setMobileOpen(false);
  };

  // Sidebar only shows Directory
  const sidebarItems: NavItem[] = [
    { text: 'Directory', icon: <DashboardIcon className="h-5 w-5" />, path: '/' },
  ];

  // Account menu shows the rest
  const accountMenuItems: NavItem[] = [
    { text: 'Profile', icon: <PersonIcon className="h-4 w-4" />, path: '#' },
    { text: 'Settings', icon: <SettingsIcon className="h-4 w-4" />, path: '/settings' },
    { divider: true },
    { text: 'Directory', icon: <BookIcon className="h-4 w-4" />, path: '/settings/directory' },
  ];

  const currentWidthClass = collapsed ? collapsedWidth : drawerWidth;

  const drawerContent = (
    <div className="flex flex-col h-full bg-background">
      <div className={cn(
        "flex h-16 items-center border-b px-4 shrink-0",
        collapsed ? "justify-center px-0" : "justify-between"
      )}>
        {!collapsed && (
          <span className="text-xl font-bold text-primary tracking-tight">
            Data Host
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCollapseToggle}
          className="hidden sm:flex"
        >
          {collapsed ? <MenuIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </Button>
      </div>

      <ScrollArea className="flex-grow">
        <div className="flex flex-col gap-2 p-2">
          {sidebarItems.map((item) => (
            <NavButton
              key={item.text}
              item={item}
              selected={location.pathname === item.path}
              onClick={() => handleMenuItemClick(item.path || '/')}
              title={item.text}
              collapsed={collapsed}
            />
          ))}

          <Separator className="my-2" />

          {location.pathname.startsWith('/schema') ? (
            <div className="flex flex-col gap-1">
              <FileTree apiUrl="/api/schemas/tree" title="Data Schema Tree" />
              {location.pathname === '/schema/edit' && (
                <>
                  <Separator className="my-2" />
                  {!collapsed && (
                    <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Table Editor
                    </div>
                  )}
                  <NavButton
                    item={{ text: 'Table', icon: <TableIcon className="h-4 w-4" /> }}
                    selected={true}
                    title="Table"
                    className="h-9"
                    collapsed={collapsed}
                  />
                </>
              )}
            </div>
          ) : location.pathname.startsWith('/ingestion/') && location.pathname !== '/ingestion' ? (() => {
            const type = location.pathname.split('/')[2];
            const labels: Record<string, string> = {
              bigquery: 'BigQuery',
              oracle: 'Oracle',
              postgres: 'Postgres',
              mssql: 'MS SQL',
              mysql: 'MySQL',
              mongo: 'MongoDB',
              gcs: 'Cloud Storage'
            };
            const basePath = `/ingestion/${type}`;

            return (
              <div className="flex flex-col gap-1">
                {!collapsed && (
                  <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {labels[type] || 'Database'} Tools
                  </div>
                )}
                {[
                  { text: 'Dashboard', icon: <DashboardIcon className="h-4 w-4" />, path: basePath },
                  {
                    text: ['postgres', 'bigquery', 'gcs'].includes(type) ? 'Connection' : 'New',
                    icon: <RocketIcon className="h-4 w-4" />,
                    path: `${basePath}/${['postgres', 'bigquery', 'gcs'].includes(type) ? 'connections' : 'new'}`
                  },
                  {
                    text: type === 'postgres' ? 'Schema' : 'Projects',
                    icon: type === 'postgres' ? <LayersIcon className="h-4 w-4" /> : <LabelIcon className="h-4 w-4" />,
                    path: `${basePath}/${type === 'postgres' ? 'schemas' : 'projects'}`
                  },
                ].map((item) => (
                  <NavButton
                    key={item.text}
                    item={item}
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    title={item.text}
                    className="h-9"
                    collapsed={collapsed}
                  />
                ))}
              </div>
            );
          })() : location.pathname.startsWith('/platforms/') ? (() => {
            const type = location.pathname.split('/')[2];
            const labels: Record<string, string> = {
              gcp: 'Google Cloud',
              aws: 'AWS',
              gcve: 'GCVE',
              saas: 'SaaS'
            };
            const basePath = `/platforms/${type}`;

            return (
              <div className="flex flex-col gap-1">
                {!collapsed && (
                  <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {labels[type] || 'Platform'} Tools
                  </div>
                )}
                {[
                  { text: 'Dashboard', icon: <DashboardIcon className="h-4 w-4" />, path: basePath },
                  { text: 'Environments', icon: <EnvIcon className="h-4 w-4" />, path: `${basePath}/environments` },
                  { text: 'Connections', icon: <CableIcon className="h-4 w-4" />, path: `${basePath}/connections` },
                  { text: 'Issues', icon: <ErrorIcon className="h-4 w-4" />, path: `${basePath}/issues` },
                ].map((item) => (
                  <NavButton
                    key={item.text}
                    item={item}
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    title={item.text}
                    className="h-9"
                    collapsed={collapsed}
                  />
                ))}
              </div>
            );
          })() : location.pathname === '/mounts' ? (
            <FileTree apiUrl="/api/services/tree" title="Services Dist Tree" />
          ) : location.pathname === '/site' ? (
            <div className="flex flex-col gap-1">
              {!collapsed && (
                <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Inspect Site
                </div>
              )}
              {[
                { text: 'View', icon: <ViewIcon className="h-4 w-4" />, path: '/site?mode=view', active: searchParams.get('mode') === 'view' || !searchParams.get('mode') },
                { text: 'Guidelines', icon: <BookIcon className="h-4 w-4" />, path: '/site?mode=guidelines', active: searchParams.get('mode') === 'guidelines' },
                { text: 'Categories', icon: <CategoryIcon className="h-4 w-4" />, path: '/site?mode=categories', active: searchParams.get('mode') === 'categories', indent: true },
                { text: 'Training', icon: <SchoolIcon className="h-4 w-4" />, path: '/site?mode=training', active: searchParams.get('mode') === 'training' },
                { text: 'Categories', icon: <CategoryIcon className="h-4 w-4" />, path: '/site?mode=training-categories', active: searchParams.get('mode') === 'training-categories', indent: true },
                { text: 'Schema Health', icon: <StorageIcon className="h-4 w-4" />, path: '/site?mode=schema', active: searchParams.get('mode') === 'schema' && !searchParams.get('schema') },
              ].map((item) => (
                <NavButton
                  key={item.text + item.path}
                  item={item}
                  selected={item.active}
                  onClick={() => navigate(item.path)}
                  title={item.text}
                  className={cn("h-9", !collapsed && item.indent ? "ml-4 w-[calc(100%-1rem)]" : "")}
                  collapsed={collapsed}
                />
              ))}

              {/* Dynamic Schema Items */}
              {searchParams.get('mode') === 'schema' && schemas.map((s) => (
                <NavButton
                  key={s.name}
                  item={{ text: s.name, icon: <LabelIcon className="h-3 w-3" /> }}
                  selected={searchParams.get('schema') === s.name}
                  onClick={() => navigate(`/site?mode=schema&schema=${s.name}`)}
                  title={s.name}
                  className={cn("h-8 ml-6 w-[calc(100%-1.5rem)] text-xs capitalize", collapsed ? "ml-0 w-full" : "")}
                  collapsed={collapsed}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {!collapsed && (
                <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Directory Categories
                </div>
              )}
              {allTags.map((tag) => (
                <NavButton
                  key={tag}
                  item={{ text: tag, icon: <LabelIcon className="h-4 w-4" /> }}
                  selected={activeTag === tag || (tag === 'All' && !activeTag)}
                  onClick={() => handleTagClick(tag)}
                  title={tag}
                  className="h-9"
                  collapsed={collapsed}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* Mobile Sidebar (Sheet) */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-60">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            {drawerContent}
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar (Persistent) */}
        <aside className={cn(
          "hidden sm:flex flex-col border-r transition-all duration-300 shrink-0",
          currentWidthClass
        )}>
          {drawerContent}
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-col flex-grow overflow-hidden relative">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDrawerToggle}
                className="sm:hidden"
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold tracking-tight">
                {activeTag ? `Registry: ${activeTag}` :
                  (location.pathname === '/' ? 'Registry Directory' :
                    sidebarItems.find((item) => item.path === location.pathname)?.text ||
                    accountMenuItems.find((item) => !item.divider && item.path === location.pathname)?.text ||
                    'Data Host')}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleColorMode}>
                    {mode === 'dark' ? <LightModeIcon className="h-5 w-5" /> : <DarkModeIcon className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Switch to {mode === 'light' ? 'dark' : 'light'} mode
                </TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <AccountCircle className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {accountMenuItems.map((item, index) => (
                    item.divider ? (
                      <DropdownMenuSeparator key={`divider-${index}`} />
                    ) : (
                      <DropdownMenuItem
                        key={item.text}
                        onClick={() => handleMenuItemClick(item.path || '#', item.external)}
                        className="gap-2 cursor-pointer"
                      >
                        {item.icon}
                        <span>{item.text}</span>
                      </DropdownMenuItem>
                    )
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-grow overflow-auto p-4 sm:p-8">
            <div className="max-w-7xl mx-auto h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Layout;
