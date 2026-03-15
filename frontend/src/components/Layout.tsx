import React, { useState } from 'react';
import {
  Menu as MenuIcon,
  LayoutDashboard as DashboardIcon,
  Settings as SettingsIcon,
  Rocket as RocketIcon,
  Moon as DarkModeIcon,
  Sun as LightModeIcon,
  Cable as CableIcon,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  ChevronDown,
  Cloud,
  FileJson,
  Cpu,
  Monitor,
  Database as DatabaseIcon,
  Layers,
  ArrowRight,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from '@/components/ui/input';
import { useColorMode } from '../context/ColorModeContext';
import { useSidebar } from '../context/SidebarContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

interface NavItem {
  text?: string;
  icon?: React.ReactNode;
  path?: string;
  external?: boolean;
  divider?: boolean;
}

const NavButton = ({ item, selected, onClick, title, className, collapsed, indent = 0 }: { item: NavItem, selected?: boolean, onClick?: () => void, title?: string, className?: string, collapsed?: boolean, indent?: number }) => {
  const content = (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-4 px-3 h-10 transition-all duration-200",
        collapsed ? "justify-center px-0" : "",
        selected ? "bg-primary/10 text-primary font-bold shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        !collapsed && indent > 0 ? `ml-${indent * 4} w-[calc(100%-${indent}rem)]` : "",
        className
      )}
      onClick={onClick}
    >
      <div className={cn("shrink-0", selected ? "text-primary scale-110" : "text-muted-foreground")}>
        {item.icon}
      </div>
      {!collapsed && <span className="truncate text-sm">{item.text}</span>}
      {selected && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
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
  const [collapsed, setCollapsed] = useState(false);
  const [platformsOpen, setPlatformsOpen] = useState(true);
  const [publishOpen, setPublishOpen] = useState(true);
  const [onPremOpen, setOnPremOpen] = useState(false);
  const { mode, toggleColorMode } = useColorMode();
  const { content: sidebarContent } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const drawerContent = (
    <div className="flex flex-col h-full bg-card overflow-hidden border-r">
      <div className={cn(
        "flex h-16 items-center px-6 shrink-0 transition-all duration-300",
        collapsed ? "justify-center px-0" : "justify-between"
      )}>
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <RocketIcon className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-xl font-black text-foreground tracking-tighter uppercase">
              Data <span className="text-primary">Host</span>
            </span>
          )}
        </Link>
      </div>

      <ScrollArea className="flex-grow">
        <div className="flex flex-col gap-1.5 p-3">
          <NavButton
            item={{ text: 'Home', icon: <DashboardIcon className="h-5 w-5" />, path: '/' }}
            selected={location.pathname === '/'}
            onClick={() => navigate('/')}
            collapsed={collapsed}
          />
          <NavButton
            item={{ text: 'Explore', icon: <Search className="h-5 w-5" />, path: '/explore' }}
            selected={isActive('/explore')}
            onClick={() => navigate('/explore')}
            collapsed={collapsed}
          />
          {/* Publish Collapsible */}
          <Collapsible
            open={!collapsed && publishOpen}
            onOpenChange={setPublishOpen}
            className="space-y-1"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-4 px-3 h-10 text-muted-foreground",
                  collapsed ? "justify-center px-0" : ""
                )}
              >
                <div className="shrink-0">
                  <RocketIcon className={cn("h-5 w-5", isActive('/publish') ? "text-primary" : "")} />
                </div>
                {!collapsed && (
                  <>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest flex-grow text-left", isActive('/publish') ? "text-primary" : "")}>Publish</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", publishOpen ? "" : "-rotate-90")} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1">
              <div className="ml-9 border-l border-muted pl-4 space-y-1">
                <NavButton
                  item={{ text: 'Dashboard', icon: <DashboardIcon className="h-4 w-4" /> }}
                  selected={location.pathname === '/publish' || location.pathname === '/publish/dashboard'}
                  onClick={() => navigate('/publish/dashboard')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Schema Data', icon: <FileJson className="h-4 w-4" /> }}
                  selected={location.pathname === '/publish/schema-data'}
                  onClick={() => navigate('/publish/schema-data')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Tables Pages', icon: <BookOpen className="h-4 w-4" /> }}
                  selected={location.pathname === '/publish/tables-pages'}
                  onClick={() => navigate('/publish/tables-pages')}
                  className="h-8 text-xs"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
          <NavButton
            item={{ text: 'Curate', icon: <Layers className="h-5 w-5" />, path: '/curate' }}
            selected={isActive('/curate')}
            onClick={() => navigate('/curate')}
            collapsed={collapsed}
          />
          <NavButton
            item={{ text: 'Ingest', icon: <DatabaseIcon className="h-5 w-5" />, path: '/ingestion' }}
            selected={isActive('/ingestion')}
            onClick={() => navigate('/ingestion')}
            collapsed={collapsed}
          />

          <Separator className="my-3 mx-2 opacity-50" />

          {/* Platforms Collapsible */}
          <Collapsible
            open={!collapsed && platformsOpen}
            onOpenChange={setPlatformsOpen}
            className="space-y-1"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-4 px-3 h-10 text-muted-foreground",
                  collapsed ? "justify-center px-0" : ""
                )}
              >
                <div className="shrink-0">
                  <Cloud className="h-5 w-5" />
                </div>
                {!collapsed && (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-widest flex-grow text-left">Platforms</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", platformsOpen ? "" : "-rotate-90")} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1">
              {/* GCP */}
              <div className="space-y-1">
                <NavButton
                  item={{ text: 'Google Cloud (GCP)', icon: <div className="w-2 h-2 rounded-full bg-blue-500" /> }}
                  selected={isActive('/platforms/gcp')}
                  onClick={() => navigate('/platforms/gcp')}
                  collapsed={collapsed}
                  className="h-8 pl-9"
                />
                {!collapsed && (
                  <div className="ml-9 border-l border-muted pl-4 space-y-1">
                    <NavButton
                      item={{ text: 'Agents', icon: <Cpu className="h-4 w-4" /> }}
                      selected={location.pathname === '/platforms/gcp/agents'}
                      onClick={() => navigate('/platforms/gcp/agents')}
                      className="h-8 text-xs"
                    />
                    <NavButton
                      item={{ text: 'Connections', icon: <CableIcon className="h-4 w-4" /> }}
                      selected={location.pathname === '/platforms/gcp/connections'}
                      onClick={() => navigate('/platforms/gcp/connections')}
                      className="h-8 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* AWS */}
              <NavButton
                item={{ text: 'AWS', icon: <div className="w-2 h-2 rounded-full bg-orange-500" /> }}
                selected={isActive('/platforms/aws')}
                onClick={() => navigate('/platforms/aws')}
                collapsed={collapsed}
                className="h-8 pl-9"
              />

              {/* Snowflake */}
              <NavButton
                item={{ text: 'Snowflake', icon: <div className="w-2 h-2 rounded-full bg-cyan-400" /> }}
                selected={isActive('/platforms/snowflake')}
                onClick={() => navigate('/platforms/snowflake')}
                collapsed={collapsed}
                className="h-8 pl-9"
              />

              {/* On-Premises Collapsible */}
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 h-8 pl-9 text-muted-foreground text-sm",
                    collapsed ? "justify-center px-0" : ""
                  )}
                  onClick={() => !collapsed && setOnPremOpen(!onPremOpen)}
                >
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  {!collapsed && (
                    <>
                      <span className="flex-grow text-left">On-premises</span>
                      <ChevronDown className={cn("h-3 w-3 transition-transform", onPremOpen ? "" : "-rotate-90")} />
                    </>
                  )}
                </Button>

                {!collapsed && onPremOpen && (
                  <div className="ml-12 border-l border-muted pl-4 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter">Databases</div>
                    {['Oracle', 'SQL Server', 'MySQL', 'PostgreSQL'].map(db => (
                      <NavButton
                        key={db}
                        item={{ text: db, icon: <DatabaseIcon className="h-3 w-3" /> }}
                        selected={location.pathname.includes(db.toLowerCase().replace(' ', ''))}
                        onClick={() => navigate(`/platforms/on-premises/databases/${db.toLowerCase().replace(' ', '')}`)}
                        className="h-7 text-[11px]"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ServiceNow */}
              <div className="space-y-1">
                <NavButton
                  item={{ text: 'ServiceNow', icon: <div className="w-2 h-2 rounded-full bg-green-700" /> }}
                  selected={isActive('/platforms/servicenow')}
                  onClick={() => navigate('/platforms/servicenow')}
                  collapsed={collapsed}
                  className="h-8 pl-9"
                />
                {!collapsed && (
                  <div className="ml-9 border-l border-muted pl-4 space-y-1">
                    <NavButton
                      item={{ text: 'CMDB', icon: <Monitor className="h-4 w-4" /> }}
                      selected={location.pathname === '/platforms/servicenow/cmdb'}
                      onClick={() => navigate('/platforms/servicenow/cmdb')}
                      className="h-8 text-xs"
                    />
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-3 border-t bg-muted/20">
        <NavButton
          item={{ text: 'Settings', icon: <SettingsIcon className="h-5 w-5" />, path: '/settings' }}
          selected={isActive('/settings')}
          onClick={() => navigate('/settings')}
          collapsed={collapsed}
        />
        <NavButton
          item={{ text: 'Logout', icon: <LogOut className="h-5 w-5 text-destructive" /> }}
          onClick={() => console.log('Logout')}
          collapsed={collapsed}
          className="hover:bg-destructive/10 hover:text-destructive"
        />
      </div>
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen w-full bg-background overflow-hidden font-sans antialiased text-foreground">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden sm:flex flex-col transition-all duration-300 shrink-0 shadow-sm",
          collapsed ? "w-20" : "w-72"
        )}>
          {drawerContent}
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-col flex-grow overflow-hidden relative">
          {/* Enhanced Top bar */}
          <header className="h-16 flex items-center justify-between px-6 border-b bg-card/60 backdrop-blur-xl z-10 shrink-0">
            <div className="flex items-center gap-6 flex-grow max-w-3xl">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCollapseToggle}
                className="hidden sm:flex rounded-xl bg-muted/30 hover:bg-muted"
              >
                <MenuIcon className="h-4 w-4" />
              </Button>

              {/* Design Rule: Search Bar with Scope Dropdown */}
              <div className="relative group flex-grow">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  className="pl-10 pr-28 bg-muted/40 border-none h-11 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/40 font-medium placeholder:text-muted-foreground/60 transition-all focus:bg-background focus:shadow-md text-sm"
                  placeholder="Search across the system..."
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 font-sans">
                  <div className="h-7 w-px bg-border mx-1" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2 bg-muted/50 border-none font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 hover:text-primary gap-1">
                        Global <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 p-2 rounded-xl">
                      <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-tight">System Wide</DropdownMenuItem>
                      <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-tight">Only GCP</DropdownMenuItem>
                      <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-tight">Metadata Only</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 rounded-lg">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Help & Support</TooltipContent>
              </Tooltip>

              <div className="h-8 w-px bg-border mx-1" />

              {/* Design Rule: Profile icon and Login Name with dropdowns */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="pl-2 pr-4 h-11 rounded-2xl gap-3 hover:bg-muted overflow-hidden relative border bg-muted/20">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/20 flex-shrink-0" />
                    <div className="hidden md:flex flex-col items-start gap-0.5">
                      <span className="text-xs font-black leading-none truncate max-w-[80px]">Jonk Espedair</span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Administrator</span>
                    </div>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl">
                  <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-xl mb-2">
                    <span className="text-sm font-black italic">Jonk Espedair</span>
                    <span className="text-xs text-muted-foreground truncate">jonk@espedair.io</span>
                  </div>
                  <DropdownMenuItem className="rounded-lg h-10 gap-3 font-bold text-xs" onClick={() => navigate('/settings')}>
                    <SettingsIcon className="h-4 w-4" />
                    User Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg h-10 gap-3 font-bold text-xs" onClick={() => navigate('/profile')}>
                    <Monitor className="h-4 w-4" />
                    System Preferences
                  </DropdownMenuItem>
                  <Separator className="my-1 opacity-50" />
                  <DropdownMenuItem className="rounded-lg h-10 gap-3 font-bold text-xs text-destructive hover:bg-destructive/10" onClick={() => console.log('Logout')}>
                    <LogOut className="h-4 w-4" />
                    Logout Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="icon" onClick={toggleColorMode} className="rounded-xl border-dashed border-muted-foreground/30">
                {mode === 'dark' ? <LightModeIcon className="h-4 w-4" /> : <DarkModeIcon className="h-4 w-4" />}
              </Button>
            </div>
          </header>

          {/* Page Content Area */}
          <main className="flex-grow flex overflow-hidden bg-muted/10">
            <div className="flex-grow overflow-auto p-6">
              <div className="max-w-[1600px] mx-auto h-full space-y-6">
                <Outlet />
              </div>
            </div>

            {/* Design Rule: Static Right Sidebar based on data-design.md */}
            <aside className="hidden xl:flex flex-col w-80 border-l bg-card/40 backdrop-blur-sm shrink-0 overflow-y-auto">
              <div className="p-6 space-y-8">
                {/* Insights Section */}
                {sidebarContent ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    {sidebarContent}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                      {location.pathname.includes('/publish/schema-data') ? 'Published Insights' : 'System Insights'}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {location.pathname.includes('/publish/schema-data') ? (
                        <>
                          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                            <div className="text-xl font-black text-indigo-600">Sync</div>
                            <div className="text-[8px] font-bold uppercase text-muted-foreground/60">Status</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                            <div className="text-xl font-black text-amber-600">Pending</div>
                            <div className="text-[8px] font-bold uppercase text-muted-foreground/60">Updates</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                            <div className="text-xl font-black text-primary">1.2k</div>
                            <div className="text-[8px] font-bold uppercase text-muted-foreground/60">Assets</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                            <div className="text-xl font-black text-emerald-600">98%</div>
                            <div className="text-[8px] font-bold uppercase text-muted-foreground/60">Health</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Resource Links / Training Section */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Help & Training</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-bold">Guidelines</span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Layers className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-bold">Best Practices</span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>

                {/* Quick Info Card */}
                <div className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20">
                  <div className="space-y-3">
                    <span className="px-2 py-1 rounded-lg bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest">Core v2.4</span>
                    <h4 className="text-sm font-black italic uppercase tracking-tight">Data Host Management</h4>
                    <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                      Data Host environment is synchronized with the meta-data registry policy.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Layout;
