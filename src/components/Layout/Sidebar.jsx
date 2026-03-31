import { NavLink, useLocation } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Typography,
  useTheme,
  Avatar,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  People,
  Storefront,
  Restaurant,
  ShoppingBag,
  LocalShipping,
  Notifications,
  Analytics,
  Assessment,
  TrendingUp,
  Settings,
  Security,
  Map,
  Chat
} from '@mui/icons-material';

const menuItems = [
  { path: '/dashboard', label: 'لوحة التحكم', icon: Dashboard },
  { path: '/users', label: 'المستخدمين', icon: People },
  { path: '/vendors', label: 'التجار', icon: People },
  { path: '/', label: 'المحدثات', icon: Chat },
  { path: '/stores', label: 'المتاجر', icon: Storefront },
  { path: '/products', label: 'المنتجات', icon: Restaurant },
  { path: '/orders', label: 'الطلبات', icon: ShoppingBag },
  { path: '/drivers', label: 'المندوبين', icon: LocalShipping },
  { path: '/map', label: 'الخرائط', icon: Map },
  { path: '/notifications', label: 'الإشعارات', icon: Notifications },
  { path: '/analytics', label: 'التحليلات', icon: Analytics },
  { path: '/reports', label: 'التقارير', icon: Assessment },
  { path: '/advanced-stats', label: 'إحصائيات متقدمة', icon: TrendingUp },
  { path: '/system', label: 'النظام', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'relative',
      }}
    >
      {/* ✅ الجزء العلوي الثابت */}
      <Box
        sx={{
          p: 0,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          transition: 'all 0.3s ease',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: isMobile ? 70 : 250,
              height: isMobile ? 70 : 125,
              mb: 0,
              mx: 'auto',
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
              backgroundImage: 'url(/logo.png)',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            fontWeight="bold"
            color="primary"
            sx={{
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Food Delivery Admin
          </Typography>
        </Box>
      </Box>

      {/* ✅ الجزء القابل للتمرير - القائمة */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.grey[200],
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main,
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          },
        }}
      >
        <List sx={{ mt: 1, px: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);

            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  selected={isActive}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    transition: 'all 0.2s ease',
                    '&.active': {
                      backgroundColor: theme.palette.primary.main + '20',
                      color: theme.palette.primary.main,
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.main,
                      },
                    },
                    '&:hover': {
                      transform: 'translateX(4px)',
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, mr: 1 }}>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: isMobile ? '0.875rem' : '1rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ my: 2, mx: 2 }} />

        <List sx={{ px: 2, pb: 2 }}>
          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/system"
              sx={{
                borderRadius: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, mr: 1 }}>
                <Security />
              </ListItemIcon>
              <ListItemText
                primary="Security & Settings"
                primaryTypographyProps={{
                  fontSize: isMobile ? '0.875rem' : '1rem',
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
}