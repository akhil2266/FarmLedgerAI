import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItemButton, ListItemIcon, ListItemText,
  IconButton, Typography, Avatar, Menu, MenuItem, Divider, Badge, useMediaQuery, Tooltip,
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import GrassIcon from '@mui/icons-material/Grass';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SellIcon from '@mui/icons-material/Sell';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CloudIcon from '@mui/icons-material/Cloud';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DescriptionIcon from '@mui/icons-material/Description';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import NotificationPanel from '../common/NotificationPanel';
import VoiceAssistant from '../common/VoiceAssistant';

const DRAWER_WIDTH = 260;

const FARMER_NAV = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/app/dashboard' },
  { label: 'Farms', icon: <AgricultureIcon />, path: '/app/farms' },
  { label: 'Crops', icon: <GrassIcon />, path: '/app/crops' },
  { label: 'Expenses', icon: <ReceiptLongIcon />, path: '/app/expenses' },
  { label: 'Sales', icon: <SellIcon />, path: '/app/sales' },
  { label: 'AI Tools', icon: <PsychologyIcon />, path: '/app/ai' },
  { label: 'Weather', icon: <CloudIcon />, path: '/app/weather' },
  { label: 'Govt Schemes', icon: <AccountBalanceIcon />, path: '/app/schemes' },
  { label: 'Marketplace', icon: <StorefrontIcon />, path: '/app/marketplace' },
  { label: 'Reports', icon: <DescriptionIcon />, path: '/app/reports' },
];

const BUYER_NAV = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/app/buyer/dashboard' },
  { label: 'Browse Listings', icon: <StorefrontIcon />, path: '/app/buyer/listings' },
  { label: 'My Orders', icon: <SellIcon />, path: '/app/buyer/orders' },
];

const ADMIN_NAV = [
  { label: 'Overview', icon: <DashboardIcon />, path: '/app/admin/overview' },
  { label: 'Users', icon: <PersonIcon />, path: '/app/admin/users' },
  { label: 'Farms', icon: <AgricultureIcon />, path: '/app/admin/farms' },
  { label: 'Audit Logs', icon: <AdminPanelSettingsIcon />, path: '/app/admin/audit-logs' },
];

const getNavItems = (role) => {
  if (role === 'admin') return ADMIN_NAV;
  if (role === 'buyer') return BUYER_NAV;
  return FARMER_NAV;
};

const AppLayout = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const { user, logout } = useAuth();
  const { preference, resolvedMode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = getNavItems(user?.role);

  const ThemeIcon = preference === 'system' ? SettingsBrightnessIcon : resolvedMode === 'dark' ? Brightness4Icon : Brightness7Icon;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
        }}>
          <GrassIcon sx={{ color: '#fff' }} />
        </Box>
        <Typography variant="h6" fontWeight={700}>FarmLedger AI</Typography>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, px: 1.5, py: 2 }}>
        {navItems.map((item) => {
          const selected = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
              sx={{
                borderRadius: 2, mb: 0.5,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(46,125,50,0.15), rgba(102,187,106,0.15))',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: selected ? 600 : 500 }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        className="glass-panel"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {navItems.find((i) => location.pathname.startsWith(i.path))?.label || 'FarmLedger AI'}
          </Typography>

          <Tooltip title={`Theme: ${preference}`}>
            <IconButton onClick={toggleTheme}><ThemeIcon /></IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)}>
              <Badge color="error" variant="dot">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <NotificationPanel anchorEl={notifAnchor} onClose={() => setNotifAnchor(null)} />

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>{user?.full_name}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/app/profile'); }}>
              <PersonIcon fontSize="small" sx={{ mr: 1.5 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        className="gradient-bg-light dark:gradient-bg-dark"
        sx={{
          flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh', pt: 10, px: { xs: 2, md: 4 }, pb: 4,
        }}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </Box>

      <VoiceAssistant />
    </Box>
  );
};

export default AppLayout;
