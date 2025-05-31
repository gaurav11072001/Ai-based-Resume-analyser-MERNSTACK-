import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Button,
  Tooltip,
  Divider,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Dashboard as DashboardIcon,
  Upload as UploadIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  HowToReg as RegisterIcon,
  Description as ResumeIcon,
  Info as InfoIcon,
  Work as JobsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { mode, toggleTheme, theme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/');
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const userMenuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      link: '/dashboard',
      onClick: handleCloseUserMenu,
      auth: true,
    },
    {
      text: 'Upload Resume',
      icon: <UploadIcon />,
      link: '/upload-resume',
      onClick: handleCloseUserMenu,
      auth: true,
    },
    {
      text: 'Profile',
      icon: <PersonIcon />,
      link: '/profile',
      onClick: handleCloseUserMenu,
      auth: true,
    },
    {
      text: 'Admin Panel',
      icon: <AdminIcon />,
      link: '/admin',
      onClick: handleCloseUserMenu,
      auth: true,
      admin: true,
    },
    {
      text: 'Login',
      icon: <LoginIcon />,
      link: '/login',
      onClick: handleCloseUserMenu,
      auth: false,
    },
    {
      text: 'Register',
      icon: <RegisterIcon />,
      link: '/register',
      onClick: handleCloseUserMenu,
      auth: false,
    },
  ];

  const drawerList = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem component={RouterLink} to="/">
          <ListItemIcon>
            <ResumeIcon />
          </ListItemIcon>
          <ListItemText primary="Resume Analyzer" />
        </ListItem>
        <ListItem component={RouterLink} to="/about">
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText primary="About" />
        </ListItem>
        <ListItem component={RouterLink} to="/jobs">
          <ListItemIcon>
            <JobsIcon />
          </ListItemIcon>
          <ListItemText primary="Jobs" />
        </ListItem>
        <Divider />
        {userMenuItems
          .filter(
            (item) =>
              (item.auth === isAuthenticated) &&
              (!item.admin || (user && user.role === 'admin'))
          )
          .map((item) => (
            <ListItem
              key={item.text}
              component={RouterLink}
              to={item.link}
              onClick={item.onClick}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        {isAuthenticated && (
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" color="primary">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
              >
                {drawerList()}
              </Drawer>
            </>
          ) : null}

          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
            }}
          >
            Resume Analyzer with Gemini
          </Typography>

          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
            }}
          >
            Resume Analyzer
          </Typography>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              <Button
                component={RouterLink}
                to="/about"
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                About
              </Button>
              <Button
                component={RouterLink}
                to="/jobs"
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Jobs
              </Button>
              {isAuthenticated && (
                <>
                  <Button
                    component={RouterLink}
                    to="/dashboard"
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/upload-resume"
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    Upload Resume
                  </Button>
                  {user && user.role === 'admin' && (
                    <Button
                      component={RouterLink}
                      to="/admin"
                      sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                      Admin
                    </Button>
                  )}
                </>
              )}
            </Box>
          )}

          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>

            {isAuthenticated ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem component={RouterLink} to="/profile" onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">Profile</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{ color: 'white', mx: 1 }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'white', mx: 1 }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
