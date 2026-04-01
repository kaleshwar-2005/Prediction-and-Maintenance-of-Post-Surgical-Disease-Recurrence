import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Container, 
  IconButton, 
  Tooltip,
  Tab, 
  Tabs,
  Paper,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Activity, 
  LayoutDashboard, 
  FileSearch, 
  History, 
  FileText,
  Sun,
  Moon,
  Menu as MenuIcon,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  themeMode: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange, 
  themeMode, 
  onThemeToggle 
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'analyze', label: 'Analyze Image', icon: <FileSearch size={18} /> },
    { id: 'history', label: 'Patient History', icon: <History size={18} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={18} /> },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const currentTabIndex = tabs.findIndex(t => t.id === activeTab);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100-screen', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, md: 2 } }}>
            {/* Mobile Menu Toggle */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' }, color: 'text.primary', mr: 1 }}
            >
              <MenuIcon size={24} />
            </IconButton>

            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: { xs: 1, md: 0 } }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  p: 1, 
                  borderRadius: 2, 
                  display: 'flex' 
                }}
              >
                <Activity size={24} />
              </Paper>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="h6" color="text.primary" sx={{ lineHeight: 1, fontWeight: 800 }}>
                  CATARACT GUARD
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                  AI Clinical Assistant
                </Typography>
              </Box>
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Tabs 
                value={currentTabIndex !== -1 ? currentTabIndex : 0} 
                onChange={(_, newValue) => onTabChange(tabs[newValue].id)}
                aria-label="medical navigation tabs"
                sx={{
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                  '& .MuiTab-root': {
                    minHeight: 64,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: 'text.secondary',
                    '&.Mui-selected': { color: 'primary.main' },
                    gap: 1,
                  }
                }}
              >
                {tabs.map((tab) => (
                  <Tab 
                    key={tab.id} 
                    label={tab.label} 
                    icon={tab.icon} 
                    iconPosition="start" 
                    disableRipple 
                  />
                ))}
              </Tabs>
            </Box>

            {/* Theme Toggle & Diagnostics Status */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title={`Switch to ${themeMode === 'light' ? 'Dark' : 'Light'} Mode`}>
                <IconButton 
                  onClick={onThemeToggle} 
                  sx={{ 
                    bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    color: themeMode === 'dark' ? '#ffb74d' : '#f57c00'
                  }}
                >
                  {themeMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </IconButton>
              </Tooltip>
              <Box sx={{ display: { xs: 'none', lg: 'block' }, ml: 1, pl: 2, borderLeft: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                  SYSTEM STATUS
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>AI ENGINE ACTIVE</Typography>
                </Box>
              </Box>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, bgcolor: 'background.paper' },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Paper elevation={0} sx={{ bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: 2 }}>
              <Activity size={20} />
            </Paper>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Cataract Guard</Typography>
          </Stack>
          <IconButton onClick={handleDrawerToggle}>
            <X size={20} />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ px: 1, py: 2 }}>
          {tabs.map((tab) => (
            <ListItem key={tab.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                selected={activeTab === tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  handleDrawerToggle();
                }}
                sx={{ 
                  borderRadius: 2,
                  '&.Mui-selected': {
                     bgcolor: 'primary.light',
                     color: 'primary.main',
                     '& .MuiListItemIcon-root': { color: 'primary.main' }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                  {tab.icon}
                </ListItemIcon>
                <ListItemText primary={tab.label} primaryTypographyProps={{ fontWeight: 700 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Footer */}
      <Box sx={{ py: 3, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider', mt: 'auto', bgcolor: 'background.paper' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          © 2026 Cataract Guard AI Clinic. For hospital use only.
        </Typography>
      </Box>
    </Box>
  );
};
