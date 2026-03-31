import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
  Box,
  HelpCircle,
  LogOut,
  ChevronDown,
  UserCheck,
  Shapes,
  Shield,
  Cloud,
  FileJson,
  Cpu,
  Monitor,
  Database as DatabaseIcon,
  Layers,
  ArrowRight,
  BookOpen,
  Table as TableIcon,
  ExternalLink,
  Globe,
  Brain,
  Palette,
  Library,
  Workflow,
  Component,
  BookMarked,
  Zap,
  UserCircle,
  Lock,
  BarChart3,
  GitBranch,
  Key,
  Users,
  Bot,
  Sparkles,
  History,
  Network,
  PanelRight,
  TableProperties
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
  const [publishOpen, setPublishOpen] = useState(false);
  const [curateOpen, setCurateOpen] = useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const [ingestOpen, setIngestOpen] = useState(false);
  const [stewardOpen, setStewardOpen] = useState(false);
  const [aiStewardOpen, setAiStewardOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [secureOpen, setSecureOpen] = useState(false);
  const [integrateOpen, setIntegrateOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const { mode, toggleColorMode } = useColorMode();
  const { content: sidebarContent, isHidden: isSidebarHidden, setIsHidden: setSidebarHidden } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const eventSource = new EventSource('/api/system/events');

    eventSource.addEventListener('shutdown', (event) => {
      let data = { message: "System is shutting down" };
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        // ignore
      }
      toast.error(data.message || "System is shutting down", {
        duration: 20000,
        description: "The application will be unavailable shortly. Please save your work."
      });
    });

    eventSource.onerror = (error) => {
      // It's normal for SSE to reconnect, but log just in case
      console.debug("System events SSE connection error", error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    // Determine WS protocol based on current protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);

    ws.onmessage = (event) => {
      if (event.data === 'shutdown') {
        // Handled by SSE, but fallback here
        return;
      }
      toast.info("System Message", {
        description: event.data,
      });
    };

    ws.onerror = (error) => {
      console.debug("Websocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path: string) => {
    const current = location.pathname;
    if (path === '/' && current === '/') return true;
    if (path !== '/' && current.startsWith(path)) return true;
    // Fallback for when basename might be inconsistent
    if (path !== '/' && current.startsWith('/home' + path)) return true;
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

      <ScrollArea className="flex-1 h-0 w-full">
        <div className="flex flex-col gap-1.5 p-3">
          <NavButton
            item={{ text: 'Home', icon: <DashboardIcon className="h-5 w-5" />, path: '/' }}
            selected={location.pathname === '/'}
            onClick={() => navigate('/')}
            collapsed={collapsed}
          />
          <NavButton
            item={{ text: 'Cortext', icon: <Brain className="h-5 w-5" />, path: '/cortext' }}
            selected={isActive('/cortext')}
            onClick={() => navigate('/cortext')}
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
                  item={{ text: 'Site', icon: <DatabaseIcon className="h-4 w-4" /> }}
                  selected={location.pathname === '/publish/site'}
                  onClick={() => navigate('/publish/site')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Schema', icon: <FileJson className="h-4 w-4" /> }}
                  selected={location.pathname === '/publish/schema'}
                  onClick={() => navigate('/publish/schema')}
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
          {/* Curate Collapsible */}
          <Collapsible
            open={!collapsed && curateOpen}
            onOpenChange={setCurateOpen}
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
                  <Layers className={cn("h-5 w-5", isActive('/curate') ? "text-primary" : "")} />
                </div>
                {!collapsed && (
                  <>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest flex-grow text-left", isActive('/curate') ? "text-primary" : "")}>Curate</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", curateOpen ? "" : "-rotate-90")} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1">
              <div className="ml-9 border-l border-muted pl-4 space-y-1">
                <NavButton
                  item={{ text: 'Dashboard', icon: <DashboardIcon className="h-4 w-4" /> }}
                  selected={location.pathname === '/curate'}
                  onClick={() => navigate('/curate')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Schema', icon: <DatabaseIcon className="h-4 w-4" /> }}
                  selected={location.pathname === '/curate/schema'}
                  onClick={() => navigate('/curate/schema')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Table', icon: <TableIcon className="h-4 w-4" /> }}
                  selected={location.pathname === '/curate/tables'}
                  onClick={() => navigate('/curate/tables')}
                  className="h-8 text-xs"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Steward Collapsible */}
          <Collapsible
            open={!collapsed && stewardOpen}
            onOpenChange={setStewardOpen}
            className="space-y-1"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 gap-4 px-3 transition-all duration-300",
                  collapsed ? "justify-center px-0" : "",
                  isActive('/steward') ? "bg-primary/10 border-r-2 border-primary" : "hover:bg-muted"
                )}
              >
                <div className="shrink-0">
                  <UserCheck className={cn("h-5 w-5", isActive('/steward') ? "text-primary" : "")} />
                </div>
                {!collapsed && (
                  <>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest flex-grow text-left", isActive('/steward') ? "text-primary" : "")}>Data Steward</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", stewardOpen ? "" : "-rotate-90")} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1">
              <div className="ml-9 border-l border-muted pl-4 space-y-1">
                <NavButton
                  item={{ text: 'Dashboard', icon: <DashboardIcon className="h-4 w-4" /> }}
                  selected={location.pathname === '/steward'}
                  onClick={() => navigate('/steward')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Business Glossary', icon: <BookMarked className="h-4 w-4" /> }}
                  selected={location.pathname === '/steward/glossary'}
                  onClick={() => navigate('/steward/glossary')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Business Information Model', icon: <Layers className="h-4 w-4" /> }}
                  selected={location.pathname === '/steward/bim'}
                  onClick={() => navigate('/steward/bim')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'CMDB Systems', icon: <Monitor className="h-4 w-4" /> }}
                  selected={location.pathname === '/steward/cmdb'}
                  onClick={() => navigate('/steward/cmdb')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Critical Data', icon: <Zap className="h-4 w-4" /> }}
                  selected={location.pathname === '/steward/critical'}
                  onClick={() => navigate('/steward/critical')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Data Owners', icon: <UserCircle className="h-4 w-4" /> }}
                  selected={location.pathname === '/steward/owners'}
                  onClick={() => navigate('/steward/owners')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Privacy', icon: <Lock className="h-4 w-4" /> }}
                  selected={location.pathname === '/steward/privacy'}
                  onClick={() => navigate('/steward/privacy')}
                  className="h-8 text-xs"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* AI Steward Collapsible */}
          <Collapsible
            open={!collapsed && aiStewardOpen}
            onOpenChange={setAiStewardOpen}
            className="space-y-1"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 gap-4 px-3 transition-all duration-300",
                  collapsed ? "justify-center px-0" : "",
                  isActive('/ai-steward') ? "bg-primary/10 border-r-2 border-primary" : "hover:bg-muted"
                )}
              >
                <div className="shrink-0">
                  <Bot className={cn("h-5 w-5", isActive('/ai-steward') ? "text-primary" : "")} />
                </div>
                {!collapsed && (
                  <>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest flex-grow text-left", isActive('/ai-steward') ? "text-primary" : "")}>AI Steward</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", aiStewardOpen ? "" : "-rotate-90")} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1">
              <div className="ml-9 border-l border-muted pl-4 space-y-1">
                <NavButton
                  item={{ text: 'Dashboard', icon: <DashboardIcon className="h-4 w-4" /> }}
                  selected={location.pathname === '/ai-steward'}
                  onClick={() => navigate('/ai-steward')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'AI Agents', icon: <Cpu className="h-4 w-4" /> }}
                  selected={location.pathname === '/ai-steward/agents'}
                  onClick={() => navigate('/ai-steward/agents')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Model Insights', icon: <Sparkles className="h-4 w-4" /> }}
                  selected={location.pathname === '/ai-steward/insights'}
                  onClick={() => navigate('/ai-steward/insights')}
                  className="h-8 text-xs"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Data Analysis Collapsible */}
          <Collapsible
            open={!collapsed && analysisOpen}
            onOpenChange={setAnalysisOpen}
            className="space-y-1"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 gap-4 px-3 transition-all duration-300",
                  collapsed ? "justify-center px-0" : "",
                  isActive('/analysis') ? "bg-primary/10 border-r-2 border-primary" : "hover:bg-muted"
                )}
              >
                <div className="shrink-0">
                  <BarChart3 className={cn("h-5 w-5", isActive('/analysis') ? "text-primary" : "")} />
                </div>
                {!collapsed && (
                  <>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest flex-grow text-left", isActive('/analysis') ? "text-primary" : "")}>Data Analysis</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", analysisOpen ? "" : "-rotate-90")} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1">
              <div className="ml-9 border-l border-muted pl-4 space-y-1">
                <NavButton
                  item={{ text: 'Dashboard', icon: <DashboardIcon className="h-4 w-4" /> }}
                  selected={location.pathname === '/analysis'}
                  onClick={() => navigate('/analysis')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Reference Data', icon: <TableProperties className="h-4 w-4" /> }}
                  selected={location.pathname.startsWith('/analysis/rdm')}
                  onClick={() => navigate('/analysis/rdm/list')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Taxonomy', icon: <Library className="h-4 w-4" /> }}
                  selected={location.pathname === '/analysis/taxonomy'}
                  onClick={() => navigate('/analysis/taxonomy')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Data Product', icon: <Box className="h-4 w-4" /> }}
                  selected={location.pathname === '/analysis/data-product'}
                  onClick={() => navigate('/analysis/data-product')}
                  className="h-8 text-xs"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Model Collapsible */}
          <Collapsible
            open={!collapsed && modelOpen}
            onOpenChange={setModelOpen}
            className="space-y-1"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 gap-4 px-3 transition-all duration-300",
                  collapsed ? "justify-center px-0" : "",
                  isActive('/model') ? "bg-primary/10 border-r-2 border-primary" : "hover:bg-muted"
                )}
              >
                <div className="shrink-0">
                  <Shapes className={cn("h-5 w-5", isActive('/model') ? "text-primary" : "")} />
                </div>
                {!collapsed && (
                  <>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest flex-grow text-left", isActive('/model') ? "text-primary" : "")}>Model</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", modelOpen ? "" : "-rotate-90")} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1">
              <div className="ml-9 border-l border-muted pl-4 space-y-1">
                <NavButton
                  item={{ text: 'Dashboard', icon: <DashboardIcon className="h-4 w-4" /> }}
                  selected={location.pathname === '/model'}
                  onClick={() => navigate('/model')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Analysis', icon: <BarChart3 className="h-4 w-4" /> }}
                  selected={location.pathname === '/model/analysis'}
                  onClick={() => navigate('/model/analysis')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Entities', icon: <Component className="h-4 w-4" /> }}
                  selected={location.pathname === '/model/entities'}
                  onClick={() => navigate('/model/entities')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Pipelines', icon: <GitBranch className="h-4 w-4" /> }}
                  selected={location.pathname === '/model/pipelines'}
                  onClick={() => navigate('/model/pipelines')}
                  className="h-8 text-xs"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Knowledge Collapsible */}
          <Collapsible
            open={!collapsed && knowledgeOpen}
            onOpenChange={setKnowledgeOpen}
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
                  <Brain className={cn("h-5 w-5", isActive('/knowledge') ? "text-primary" : "")} />
                </div>
                {!collapsed && (
                  <>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest flex-grow text-left", isActive('/knowledge') ? "text-primary" : "")}>Knowledge</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", knowledgeOpen ? "" : "-rotate-90")} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1">
              <div className="ml-9 border-l border-muted pl-4 space-y-1">
                <NavButton
                  item={{ text: 'Dashboard', icon: <DashboardIcon className="h-4 w-4" /> }}
                  selected={location.pathname === '/knowledge'}
                  onClick={() => navigate('/knowledge')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Librarian', icon: <Library className="h-4 w-4" /> }}
                  selected={location.pathname === '/knowledge/librarian'}
                  onClick={() => navigate('/knowledge/librarian')}
                  className="h-8 text-xs"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Ingest Collapsible */}
          <Collapsible
            open={!collapsed && ingestOpen}
            onOpenChange={setIngestOpen}
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
                  <DatabaseIcon className={cn("h-5 w-5", isActive('/ingestion') ? "text-primary" : "")} />
                </div>
                {!collapsed && (
                  <>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest flex-grow text-left", isActive('/ingestion') ? "text-primary" : "")}>Ingest</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", ingestOpen ? "" : "-rotate-90")} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1">
              <div className="ml-9 border-l border-muted pl-4 space-y-1">
                <NavButton
                  item={{ text: 'Schema', icon: <Globe className="h-4 w-4" /> }}
                  selected={isActive('/ingestion') && location.pathname === '/ingestion'}
                  onClick={() => navigate('/ingestion')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Local', icon: <Monitor className="h-4 w-4" /> }}
                  selected={location.pathname === '/ingestion/local'}
                  onClick={() => navigate('/ingestion/local')}
                  className="h-8 text-xs"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-3 mx-2 opacity-50" />

          {/* Secure Collapsible */}
          <Collapsible
            open={!collapsed && secureOpen}
            onOpenChange={setSecureOpen}
            className="space-y-1"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 gap-4 px-3 transition-all duration-300",
                  collapsed ? "justify-center px-0" : "",
                  isActive('/secure') ? "bg-primary/10 border-r-2 border-primary" : "hover:bg-muted"
                )}
              >
                <div className="shrink-0">
                  <Shield className={cn("h-5 w-5", isActive('/secure') ? "text-primary" : "")} />
                </div>
                {!collapsed && (
                  <>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest flex-grow text-left", isActive('/secure') ? "text-primary" : "")}>Secure</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", secureOpen ? "" : "-rotate-90")} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1">
              <div className="ml-9 border-l border-muted pl-4 space-y-1">
                <NavButton
                  item={{ text: 'Dashboard', icon: <DashboardIcon className="h-4 w-4" /> }}
                  selected={location.pathname === '/secure'}
                  onClick={() => navigate('/secure')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Access', icon: <Key className="h-4 w-4" /> }}
                  selected={location.pathname === '/secure/access'}
                  onClick={() => navigate('/secure/access')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Roles', icon: <Users className="h-4 w-4" /> }}
                  selected={location.pathname === '/secure/roles'}
                  onClick={() => navigate('/secure/roles')}
                  className="h-8 text-xs"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-3 mx-2 opacity-50" />

          {/* Design Collapsible */}
          <Collapsible
            open={!collapsed && designOpen}
            onOpenChange={setDesignOpen}
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
                  <Palette className={cn("h-5 w-5", isActive('/design') ? "text-primary" : "")} />
                </div>
                {!collapsed && (
                  <>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest flex-grow text-left", isActive('/design') ? "text-primary" : "")}>Design</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", designOpen ? "" : "-rotate-90")} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1">
              <div className="ml-9 border-l border-muted pl-4 space-y-1">
                <NavButton
                  item={{ text: 'Dashboard', icon: <DashboardIcon className="h-4 w-4" /> }}
                  selected={location.pathname === '/design'}
                  onClick={() => navigate('/design')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Json Schema', icon: <FileJson className="h-4 w-4" /> }}
                  selected={location.pathname === '/design/json-schema'}
                  onClick={() => navigate('/design/json-schema')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Workflows', icon: <Workflow className="h-4 w-4" /> }}
                  selected={location.pathname === '/design/workflows'}
                  onClick={() => navigate('/design/workflows')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Astro Templates', icon: <Component className="h-4 w-4" /> }}
                  selected={location.pathname === '/design/astro-templates'}
                  onClick={() => navigate('/design/astro-templates')}
                  className="h-8 text-xs"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Integrate Collapsible */}
          <Collapsible
            open={!collapsed && integrateOpen}
            onOpenChange={setIntegrateOpen}
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
                  <CableIcon className={cn("h-5 w-5", isActive('/integrate') ? "text-primary" : "")} />
                </div>
                {!collapsed && (
                  <>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest flex-grow text-left", isActive('/integrate') ? "text-primary" : "")}>Integrate</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", integrateOpen ? "" : "-rotate-90")} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1">
              <div className="ml-9 border-l border-muted pl-4 space-y-1">
                <NavButton
                  item={{ text: 'Swagger', icon: <BookOpen className="h-4 w-4" /> }}
                  selected={location.pathname === '/integrate/swagger'}
                  onClick={() => navigate('/integrate/swagger')}
                  className="h-8 text-xs"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Platforms */}
          <NavButton
            item={{ text: 'Platforms', icon: <Cloud className="h-5 w-5" />, path: '/platforms' }}
            selected={isActive('/platforms')}
            onClick={() => navigate('/platforms')}
            collapsed={collapsed}
          />

          <Separator className="my-3 mx-2 opacity-50" />

          {/* Scratchpad Collapsible */}
          <Collapsible
            open={!collapsed && scratchpadOpen}
            onOpenChange={setScratchpadOpen}
            className="space-y-1 pb-4"
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
                  <Monitor className={cn("h-5 w-5", isActive('/scratchpad') ? "text-primary" : "")} />
                </div>
                {!collapsed && (
                  <>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest flex-grow text-left", isActive('/scratchpad') ? "text-primary" : "")}>Scratchpad</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", scratchpadOpen ? "" : "-rotate-90")} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1">
              <div className="ml-9 border-l border-muted pl-4 space-y-1">
                <NavButton
                  item={{ text: 'ERD sandbox', icon: <Cpu className="h-4 w-4" /> }}
                  selected={isActive('/scratchpad') && location.pathname === '/scratchpad'}
                  onClick={() => navigate('/scratchpad')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'DataFlows', icon: <Workflow className="h-4 w-4" /> }}
                  selected={location.pathname === '/scratchpad/data-flows'}
                  onClick={() => navigate('/scratchpad/data-flows')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Org Chart', icon: <Network className="h-4 w-4" /> }}
                  selected={location.pathname === '/scratchpad/org-chart'}
                  onClick={() => navigate('/scratchpad/org-chart')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Lineage', icon: <History className="h-4 w-4" /> }}
                  selected={location.pathname === '/scratchpad/lineage'}
                  onClick={() => navigate('/scratchpad/lineage')}
                  className="h-8 text-xs"
                />
                <NavButton
                  item={{ text: 'Mappings', icon: <TableIcon className="h-4 w-4" /> }}
                  selected={location.pathname === '/scratchpad/mappings'}
                  onClick={() => navigate('/scratchpad/mappings')}
                  className="h-8 text-xs"
                />
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

              <Button variant="outline" size="icon" onClick={() => setSidebarHidden(!isSidebarHidden)} className={cn("rounded-xl border-dashed border-muted-foreground/30", !isSidebarHidden && "bg-primary/10 text-primary border-primary/20")}>
                <PanelRight className="h-4 w-4" />
              </Button>
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

            {!isSidebarHidden && (
              <aside className="hidden lg:flex flex-col w-80 border-l bg-card/40 backdrop-blur-sm shrink-0 overflow-hidden animate-in slide-in-from-right-4 duration-300">
                <ScrollArea className="flex-1 h-0">
                  <div className="p-6 space-y-8">
                    {/* Insights Section */}
                    {sidebarContent ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        {sidebarContent}
                      </div>
                    ) : (
                      <>
                        {/* Resource Links / Training Section - Always shown as Help */}
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
                      </>
                    )}
                  </div>
                </ScrollArea>
              </aside>
            )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Layout;
