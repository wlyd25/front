import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  DarkMode,
  LightMode,
  Person,
  Logout,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotifOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };
  
  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };
  
  const notifications = [
    { id: 1, message: 'طلب جديد رقم #1234', time: 'منذ 5 دقائق', read: false },
    { id: 2, message: 'تقرير يومي جاهز', time: 'منذ ساعة', read: false },
    { id: 3, message: 'مستخدم جديد قام بالتسجيل', time: 'منذ 3 ساعات', read: true },
  ];
  
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Food Delivery Admin
        </Typography>
        
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="الإشعارات">
            <IconButton color="inherit" onClick={handleNotifOpen}>
              <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title={mode === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="الحساب">
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar alt={user?.name} src={user?.avatar}>
                {user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Person sx={{ mr: 1 }} /> الملف الشخصي
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Settings sx={{ mr: 1 }} /> الإعدادات
          </MenuItem>
          <MenuItem onClick={logout}>
            <Logout sx={{ mr: 1 }} /> تسجيل الخروج
          </MenuItem>
        </Menu>
        
        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={handleNotifClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
        >
          {notifications.map((notif) => (
            <MenuItem key={notif.id} onClick={handleNotifClose} sx={{ whiteSpace: 'normal' }}>
              <Box>
                <Typography variant="body2" fontWeight={notif.read ? 'normal' : 'bold'}>
                  {notif.message}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {notif.time}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={handleNotifClose}>
            <Typography variant="body2" color="primary" textAlign="center">
              عرض جميع الإشعارات
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}