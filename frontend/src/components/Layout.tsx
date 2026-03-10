import React, { useState, useMemo, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Tooltip,
  ListSubheader,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Layers as LayersIcon,
  RocketLaunch as RocketIcon,
  ChevronLeft as ChevronLeftIcon,
  Person as PersonIcon,
  Label as LabelIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Visibility as ViewIcon,
  MenuBook as BookIcon,
  School as SchoolIcon,
  Category as CategoryIcon,
  TableChart as TableIcon,
  Error as ErrorIcon,
  Cable as CableIcon,
  Dns as EnvIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet, useSearchParams, Link as RouterLink } from 'react-router-dom';
import FileTree from './FileTree';
import directoryData from '../data/directory.json';
import { useColorMode } from '../context/ColorModeContext';

const drawerWidth = 240;
const collapsedWidth = 64;

interface NavItem {
  text?: string;
  icon?: React.ReactNode;
  path?: string;
  external?: boolean;
  divider?: boolean;
}

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [schemas, setSchemas] = useState<{ name: string }[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { mode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTag = searchParams.get('tag');

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    directoryData.forEach((item: any) => {
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path: string, external?: boolean) => {
    if (external) {
      window.open(path, '_blank');
    } else if (path !== '#') {
      if (path === '/' || path === '') {
        // Navigate to root and explicitly clear all search params (tags)
        navigate('/', { replace: false });
        setSearchParams({});
      } else {
        navigate(path);
      }
    }
    handleMenuClose();
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
    { text: 'Directory', icon: <DashboardIcon />, path: '/' },
  ];

  // Account menu shows the rest
  const accountMenuItems: NavItem[] = [
    { text: 'Profile', icon: <PersonIcon />, path: '#' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { divider: true },
    { text: 'Directory', icon: <BookIcon />, path: '/settings/directory' },
  ];

  const currentWidth = collapsed ? collapsedWidth : drawerWidth;

  const drawerContent = (
    <Box sx={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', px: [1] }}>
        {!collapsed && (
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Data Host
          </Typography>
        )}
        <IconButton onClick={handleCollapseToggle} sx={{ display: { xs: 'none', sm: 'flex' } }}>
          {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {sidebarItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={collapsed ? item.text || "" : ""} placement="right">
              <ListItemButton
                component={RouterLink}
                to={item.path || '/'}
                onClick={() => {
                  if (item.path === '/' || item.path === '') {
                    setSearchParams({});
                  }
                  setMobileOpen(false);
                }}
                selected={location.pathname === item.path && !activeTag}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 'auto' : 3,
                    justifyContent: 'center',
                    color: location.pathname === item.path && !activeTag ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.text} sx={{ opacity: 1 }} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
        {location.pathname.startsWith('/schema') ? (
          <List disablePadding>
            <FileTree apiUrl="/api/schemas/tree" title="Data Schema Tree" />
            {location.pathname === '/schema/edit' && (
              <>
                <Divider sx={{ my: 1 }} />
                {!collapsed && (
                  <ListSubheader component="div" sx={{ bgcolor: 'transparent', lineHeight: '40px', fontWeight: 700 }}>
                    Table Editor
                  </ListSubheader>
                )}
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <Tooltip title={collapsed ? "Table" : ""} placement="right">
                    <ListItemButton
                      selected={true}
                      sx={{
                        minHeight: 40,
                        justifyContent: collapsed ? 'center' : 'initial',
                        px: 2.5,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: collapsed ? 'auto' : 3,
                          justifyContent: 'center',
                          color: 'primary.main',
                        }}
                      >
                        <TableIcon fontSize="small" />
                      </ListItemIcon>
                      {!collapsed && <ListItemText
                        primary="Table"
                        primaryTypographyProps={{ variant: 'body2' }}
                        sx={{ opacity: 1 }}
                      />}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              </>
            )}
          </List>
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
            <List disablePadding>
              {!collapsed && (
                <ListSubheader component="div" sx={{ bgcolor: 'transparent', lineHeight: '48px', fontWeight: 700 }}>
                  {labels[type] || 'Database'} Tools
                </ListSubheader>
              )}
              {[
                { text: 'Dashboard', icon: <DashboardIcon />, path: basePath },
                {
                  text: ['postgres', 'bigquery', 'gcs'].includes(type) ? 'Connection' : 'New',
                  icon: <RocketIcon />,
                  path: `${basePath}/${['postgres', 'bigquery', 'gcs'].includes(type) ? 'connections' : 'new'}`
                },
                {
                  text: type === 'postgres' ? 'Schema' : 'Projects',
                  icon: type === 'postgres' ? <LayersIcon /> : <LabelIcon />,
                  path: `${basePath}/${type === 'postgres' ? 'schemas' : 'projects'}`
                },
              ].map((item) => (
                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                  <Tooltip title={collapsed ? item.text : ""} placement="right">
                    <ListItemButton
                      onClick={() => navigate(item.path)}
                      selected={location.pathname === item.path}
                      sx={{
                        minHeight: 40,
                        justifyContent: collapsed ? 'center' : 'initial',
                        px: 2.5,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: collapsed ? 'auto' : 3,
                          justifyContent: 'center',
                          color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        {React.cloneElement(item.icon as React.ReactElement, { fontSize: 'small' } as any)}
                      </ListItemIcon>
                      {!collapsed && <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{ variant: 'body2' }}
                        sx={{ opacity: 1 }}
                      />}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
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
            <List disablePadding>
              {!collapsed && (
                <ListSubheader component="div" sx={{ bgcolor: 'transparent', lineHeight: '48px', fontWeight: 700 }}>
                  {labels[type] || 'Platform'} Tools
                </ListSubheader>
              )}
              {[
                { text: 'Dashboard', icon: <DashboardIcon />, path: basePath },
                { text: 'Environments', icon: <EnvIcon />, path: `${basePath}/environments` },
                { text: 'Connections', icon: <CableIcon />, path: `${basePath}/connections` },
                { text: 'Issues', icon: <ErrorIcon />, path: `${basePath}/issues` },
              ].map((item) => (
                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                  <Tooltip title={collapsed ? item.text : ""} placement="right">
                    <ListItemButton
                      onClick={() => navigate(item.path)}
                      selected={location.pathname === item.path}
                      sx={{
                        minHeight: 40,
                        justifyContent: collapsed ? 'center' : 'initial',
                        px: 2.5,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: collapsed ? 'auto' : 3,
                          justifyContent: 'center',
                          color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        {React.cloneElement(item.icon as React.ReactElement, { fontSize: 'small' } as any)}
                      </ListItemIcon>
                      {!collapsed && <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{ variant: 'body2' }}
                        sx={{ opacity: 1 }}
                      />}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          );
        })() : location.pathname === '/mounts' ? (
          <FileTree apiUrl="/api/services/tree" title="Services Dist Tree" />
        ) : location.pathname === '/site' ? (
          <List disablePadding>
            {!collapsed && (
              <ListSubheader component="div" sx={{ bgcolor: 'transparent', lineHeight: '48px', fontWeight: 700 }}>
                Inspect Site
              </ListSubheader>
            )}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <Tooltip title={collapsed ? "View" : ""} placement="right">
                <ListItemButton
                  onClick={() => navigate('/site?mode=view')}
                  selected={searchParams.get('mode') === 'view' || !searchParams.get('mode')}
                  sx={{
                    minHeight: 40,
                    justifyContent: collapsed ? 'center' : 'initial',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 'auto' : 3,
                      justifyContent: 'center',
                      color: (searchParams.get('mode') === 'view' || !searchParams.get('mode')) ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </ListItemIcon>
                  {!collapsed && <ListItemText
                    primary="View"
                    primaryTypographyProps={{ variant: 'body2' }}
                    sx={{ opacity: 1 }}
                  />}
                </ListItemButton>
              </Tooltip>
            </ListItem>

            <ListItem disablePadding sx={{ display: 'block' }}>
              <Tooltip title={collapsed ? "Guidelines" : ""} placement="right">
                <ListItemButton
                  onClick={() => navigate('/site?mode=guidelines')}
                  selected={searchParams.get('mode') === 'guidelines'}
                  sx={{
                    minHeight: 40,
                    justifyContent: collapsed ? 'center' : 'initial',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 'auto' : 3,
                      justifyContent: 'center',
                      color: searchParams.get('mode') === 'guidelines' ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <BookIcon fontSize="small" />
                  </ListItemIcon>
                  {!collapsed && <ListItemText
                    primary="Guidelines"
                    primaryTypographyProps={{ variant: 'body2' }}
                    sx={{ opacity: 1 }}
                  />}
                </ListItemButton>
              </Tooltip>
            </ListItem>

            <ListItem disablePadding sx={{ display: 'block' }}>
              <Tooltip title={collapsed ? "Categories" : ""} placement="right">
                <ListItemButton
                  onClick={() => navigate('/site?mode=categories')}
                  selected={searchParams.get('mode') === 'categories'}
                  sx={{
                    minHeight: 40,
                    justifyContent: collapsed ? 'center' : 'initial',
                    px: 2.5,
                    ml: collapsed ? 0 : 2 // Indent slightly if not collapsed to show it's "under"
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 'auto' : 3,
                      justifyContent: 'center',
                      color: searchParams.get('mode') === 'categories' ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <CategoryIcon fontSize="small" />
                  </ListItemIcon>
                  {!collapsed && <ListItemText
                    primary="Categories"
                    primaryTypographyProps={{ variant: 'body2' }}
                    sx={{ opacity: 1 }}
                  />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <ListItem disablePadding sx={{ display: 'block' }}>
              <Tooltip title={collapsed ? "Training" : ""} placement="right">
                <ListItemButton
                  onClick={() => navigate('/site?mode=training')}
                  selected={searchParams.get('mode') === 'training'}
                  sx={{
                    minHeight: 40,
                    justifyContent: collapsed ? 'center' : 'initial',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 'auto' : 3,
                      justifyContent: 'center',
                      color: searchParams.get('mode') === 'training' ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <SchoolIcon fontSize="small" />
                  </ListItemIcon>
                  {!collapsed && <ListItemText
                    primary="Training"
                    primaryTypographyProps={{ variant: 'body2' }}
                    sx={{ opacity: 1 }}
                  />}
                </ListItemButton>
              </Tooltip>
            </ListItem>

            <ListItem disablePadding sx={{ display: 'block' }}>
              <Tooltip title={collapsed ? "Categories" : ""} placement="right">
                <ListItemButton
                  onClick={() => navigate('/site?mode=training-categories')}
                  selected={searchParams.get('mode') === 'training-categories'}
                  sx={{
                    minHeight: 40,
                    justifyContent: collapsed ? 'center' : 'initial',
                    px: 2.5,
                    ml: collapsed ? 0 : 2
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 'auto' : 3,
                      justifyContent: 'center',
                      color: searchParams.get('mode') === 'training-categories' ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <CategoryIcon fontSize="small" />
                  </ListItemIcon>
                  {!collapsed && <ListItemText
                    primary="Categories"
                    primaryTypographyProps={{ variant: 'body2' }}
                    sx={{ opacity: 1 }}
                  />}
                </ListItemButton>
              </Tooltip>
            </ListItem>

            <ListItem disablePadding sx={{ display: 'block' }}>
              <Tooltip title={collapsed ? "Schema" : ""} placement="right">
                <ListItemButton
                  onClick={() => navigate('/site?mode=schema')}
                  selected={searchParams.get('mode') === 'schema' && !searchParams.get('schema')}
                  sx={{
                    minHeight: 40,
                    justifyContent: collapsed ? 'center' : 'initial',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 'auto' : 3,
                      justifyContent: 'center',
                      color: (searchParams.get('mode') === 'schema' && !searchParams.get('schema')) ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <StorageIcon fontSize="small" />
                  </ListItemIcon>
                  {!collapsed && <ListItemText
                    primary="Schema Health"
                    primaryTypographyProps={{ variant: 'body2' }}
                    sx={{ opacity: 1 }}
                  />}
                </ListItemButton>
              </Tooltip>
            </ListItem>

            {/* Dynamic Schema Items */}
            {searchParams.get('mode') === 'schema' && schemas.map((s) => (
              <ListItem key={s.name} disablePadding sx={{ display: 'block' }}>
                <Tooltip title={collapsed ? s.name : ""} placement="right">
                  <ListItemButton
                    onClick={() => navigate(`/site?mode=schema&schema=${s.name}`)}
                    selected={searchParams.get('schema') === s.name}
                    sx={{
                      minHeight: 36,
                      justifyContent: collapsed ? 'center' : 'initial',
                      px: 2.5,
                      ml: collapsed ? 0 : 3
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: collapsed ? 'auto' : 2,
                        justifyContent: 'center',
                        color: searchParams.get('schema') === s.name ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      <LabelIcon sx={{ fontSize: '1rem' }} />
                    </ListItemIcon>
                    {!collapsed && <ListItemText
                      primary={s.name}
                      primaryTypographyProps={{
                        variant: 'caption',
                        sx: { textTransform: 'capitalize', fontWeight: searchParams.get('schema') === s.name ? 700 : 400 }
                      }}
                      sx={{ opacity: 1 }}
                    />}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        ) : (
          <List
            subheader={
              !collapsed ? (
                <ListSubheader component="div" sx={{ bgcolor: 'transparent', lineHeight: '48px', fontWeight: 700 }}>
                  Directory Categories
                </ListSubheader>
              ) : null
            }
          >
            {allTags.map((tag) => (
              <ListItem key={tag} disablePadding sx={{ display: 'block' }}>
                <Tooltip title={collapsed ? tag : ""} placement="right">
                  <ListItemButton
                    onClick={() => handleTagClick(tag)}
                    selected={activeTag === tag || (tag === 'All' && !activeTag)}
                    sx={{
                      minHeight: 40,
                      justifyContent: collapsed ? 'center' : 'initial',
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: collapsed ? 'auto' : 3,
                        justifyContent: 'center',
                        color: activeTag === tag ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      <LabelIcon fontSize="small" />
                    </ListItemIcon>
                    {!collapsed && <ListItemText
                      primary={tag}
                      primaryTypographyProps={{ variant: 'body2' }}
                      sx={{ opacity: 1 }}
                    />}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          ...(!collapsed ? {
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          } : {
            width: { sm: `calc(100% - ${collapsedWidth}px)` },
            ml: { sm: `${collapsedWidth}px` },
          })
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {activeTag ? `Registry: ${activeTag}` :
              (location.pathname === '/' ? 'Registry Directory' :
                sidebarItems.find((item) => item.path === location.pathname)?.text ||
                accountMenuItems.find((item) => !item.divider && item.path === location.pathname)?.text ||
                'Data Host')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton onClick={toggleColorMode} color="inherit">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {accountMenuItems.map((item, index) => (
                item.divider ? (
                  <Divider key={`divider-${index}`} />
                ) : (
                  <MenuItem
                    key={item.text}
                    onClick={() => handleMenuItemClick(item.path || '#', item.external)}
                    sx={{ gap: 1.5, minWidth: 160 }}
                  >
                    <ListItemIcon sx={{ minWidth: 'auto !important' }}>
                      {item.icon}
                    </ListItemIcon>
                    {item.text}
                  </MenuItem>
                )
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: currentWidth }, flexShrink: { sm: 0 }, transition: 'width 0.2s' }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentWidth,
              transition: (theme) =>
                theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${currentWidth}px)` },
          mt: '64px',
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
