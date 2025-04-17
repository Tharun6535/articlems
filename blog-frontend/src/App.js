import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Button, Container, Box, IconButton, 
  Menu, MenuItem, Drawer, List, ListItem, ListItemText, ListItemIcon,
  Divider, Tooltip, Avatar, useMediaQuery, useTheme, Badge,
  ListItemButton, CssBaseline, Paper, Fade, Chip, LinearProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import CategoryIcon from '@mui/icons-material/Category';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Theme Provider
import ThemeProvider, { ThemeContext } from './contexts/ThemeContext';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AuthService from './services/auth.service';
import { AuthProvider, useAuth } from './context/AuthContext';
import Profile from './components/user/Profile';

// Blog Components
import ArticleList from './components/articles/ArticleList';
import ArticleDetail from './components/articles/ArticleDetail';
import ArticleForm from './components/articles/ArticleForm';
import CategoryList from './components/categories/CategoryList';
import CategoryDetail from './components/categories/CategoryDetail';
import AdminDashboard from './components/admin/AdminDashboard';
import CsvImporter from './components/admin/CsvImporter';
import TestArticleForm from './components/articles/TestArticleForm';

// Custom components
const MobileNavItem = ({ icon, label, to, onClick }) => {
  return (
    <ListItem disablePadding>
      <ListItemButton 
        component={Link} 
        to={to} 
        onClick={onClick}
        sx={{ 
          py: 1.5,
          borderRadius: '8px',
          mx: 1,
          '&:hover': {
            backgroundColor: 'rgba(0, 82, 204, 0.08)',
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
          {icon}
        </ListItemIcon>
        <ListItemText 
          primary={label} 
          primaryTypographyProps={{ 
            fontWeight: 500,
            fontSize: '0.95rem'
          }} 
        />
      </ListItemButton>
    </ListItem>
  );
};

function AppContent() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { mode, toggleColorMode } = useContext(ThemeContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = mode === 'dark';
  const { user, loading } = useAuth();
  const [pageLoading, setPageLoading] = useState(false);
  
  const appName = "ProContent";

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    
    // Simulate page load for demo
    setPageLoading(true);
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(null);
    window.location.href = '/';
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  // Protected route component
  const ProtectedRoute = ({ children, roles = [] }) => {
    const location = useLocation();
    
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: theme.palette.background.default 
        }}>
          <Box sx={{ width: '80px', height: '80px', mb: 3 }}>
            <img src="/logo192.png" alt="Logo" style={{ width: '100%', height: '100%' }} />
          </Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Loading your application</Typography>
          <Box sx={{ width: 300 }}>
            <LinearProgress color="primary" />
          </Box>
        </Box>
      );
    }

    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles.length > 0 && !roles.some(role => user.roles.includes(role))) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {pageLoading && (
          <Box sx={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
            <LinearProgress color="primary" />
          </Box>
        )}
        
        {/* Modern AppBar */}
        <AppBar 
          position="sticky" 
          color="default" 
          elevation={0} 
          sx={{ 
            zIndex: theme.zIndex.drawer + 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: isDark ? 'grey.900' : 'background.paper'
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isMobile && (
                <IconButton
                  edge="start"
                  aria-label="menu"
                  onClick={toggleDrawer}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              
              <Typography 
                variant="h5" 
                component={Link} 
                to="/" 
                sx={{ 
                  color: 'primary.main', 
                  textDecoration: 'none',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  letterSpacing: '-0.5px',
                }}
              >
                <ArticleIcon sx={{ mr: 1, color: 'primary.main' }} />
                {appName}
              </Typography>
              
              {!isMobile && (
                <Box sx={{ ml: 4, display: 'flex' }}>
                  <Button 
                    component={Link} 
                    to="/" 
                    sx={{ 
                      mx: 0.5,
                      px: 2,
                      py: 1,
                      fontWeight: 600,
                      borderRadius: '4px',
                      color: 'text.primary',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '100%',
                        transform: 'scaleX(0)',
                        height: '2px',
                        bottom: 0,
                        left: 0,
                        backgroundColor: 'primary.main',
                        transformOrigin: 'bottom right',
                        transition: 'transform 0.3s ease-out'
                      },
                      '&:hover': {
                        backgroundColor: 'transparent',
                        '&::after': {
                          transform: 'scaleX(1)',
                          transformOrigin: 'bottom left'
                        }
                      }
                    }}
                  >
                    Home
                  </Button>
                  <Button 
                    component={Link} 
                    to="/articles" 
                    sx={{ 
                      mx: 0.5,
                      px: 2,
                      py: 1,
                      fontWeight: 600,
                      borderRadius: '4px',
                      color: 'text.primary',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '100%',
                        transform: 'scaleX(0)',
                        height: '2px',
                        bottom: 0,
                        left: 0,
                        backgroundColor: 'primary.main',
                        transformOrigin: 'bottom right',
                        transition: 'transform 0.3s ease-out'
                      },
                      '&:hover': {
                        backgroundColor: 'transparent',
                        '&::after': {
                          transform: 'scaleX(1)',
                          transformOrigin: 'bottom left'
                        }
                      }
                    }}
                  >
                    Articles
                  </Button>
                  <Button 
                    component={Link} 
                    to="/categories" 
                    sx={{ 
                      mx: 0.5,
                      px: 2,
                      py: 1,
                      fontWeight: 600,
                      borderRadius: '4px',
                      color: 'text.primary',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '100%',
                        transform: 'scaleX(0)',
                        height: '2px',
                        bottom: 0,
                        left: 0,
                        backgroundColor: 'primary.main',
                        transformOrigin: 'bottom right',
                        transition: 'transform 0.3s ease-out'
                      },
                      '&:hover': {
                        backgroundColor: 'transparent',
                        '&::after': {
                          transform: 'scaleX(1)',
                          transformOrigin: 'bottom left'
                        }
                      }
                    }}
                  >
                    Categories
                  </Button>
                </Box>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Theme toggle button */}
              <Tooltip title={`Toggle ${isDark ? 'light' : 'dark'} mode`}>
                <IconButton 
                  color="inherit" 
                  onClick={toggleColorMode} 
                  sx={{ mr: 1 }}
                >
                  {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
              
              {currentUser ? (
                <>
                  <Tooltip title={`Logged in as ${currentUser.username}`}>
                    <IconButton
                      onClick={handleUserMenuOpen}
                      size="small"
                      sx={{ 
                        ml: 0.5,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 32,
                          height: 32,
                          background: 'linear-gradient(45deg, #0052CC 30%, #4C9AFF 90%)',
                          fontSize: '1rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {currentUser.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    id="user-menu"
                    open={Boolean(anchorEl)}
                    onClose={handleUserMenuClose}
                    onClick={handleUserMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                        mt: 1.5,
                        width: 220,
                        borderRadius: '8px',
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {currentUser.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentUser.email || 'user@example.com'}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem 
                      component={Link}
                      to="/profile"
                      sx={{ 
                        py: 1.5,
                        px: 2,
                        '&:hover': { backgroundColor: 'rgba(0, 82, 204, 0.08)' }
                      }}
                    >
                      <ListItemIcon>
                        <AccountCircleIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <Typography variant="body2">Profile</Typography>
                    </MenuItem>
                    {currentUser.roles && currentUser.roles.includes('ROLE_ADMIN') && (
                      <MenuItem 
                        component={Link}
                        to="/admin"
                        sx={{ 
                          py: 1.5,
                          px: 2,
                          '&:hover': { backgroundColor: 'rgba(0, 82, 204, 0.08)' }
                        }}
                      >
                        <ListItemIcon>
                          <AdminPanelSettingsIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <Typography variant="body2">Admin Dashboard</Typography>
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem 
                      onClick={logOut}
                      sx={{ 
                        py: 1.5,
                        px: 2,
                        color: 'error.main',
                        '&:hover': { backgroundColor: 'rgba(229, 9, 20, 0.08)' }
                      }}
                    >
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" color="error" />
                      </ListItemIcon>
                      <Typography variant="body2">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  {!isSmall && (
                    <Button 
                      component={Link} 
                      to="/login" 
                      variant="outlined"
                      color="primary"
                      sx={{ 
                        mx: 1,
                        whiteSpace: 'nowrap',
                        px: 2,
                        py: 0.8,
                        borderWidth: 1.5,
                        '&:hover': {
                          borderWidth: 1.5
                        }
                      }}
                    >
                      Sign In
                    </Button>
                  )}
                  <Button 
                    component={Link} 
                    to="/register" 
                    variant="contained"
                    color="primary"
                    sx={{ py: 0.8 }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* Mobile Navigation Drawer */}
        <Drawer
          anchor="left"
          open={isDrawerOpen}
          onClose={toggleDrawer}
          PaperProps={{
            sx: {
              width: 280,
              borderRadius: 0,
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600} color="primary.main">
              {appName}
            </Typography>
            <IconButton onClick={toggleDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          
          <Box sx={{ p: 2 }}>
            {currentUser ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 42, 
                    height: 42, 
                    background: 'linear-gradient(45deg, #0052CC 30%, #4C9AFF 90%)',
                    mr: 2 
                  }}
                >
                  {currentUser.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {currentUser.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentUser.email || 'user@example.com'}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button 
                  component={Link} 
                  to="/login" 
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={toggleDrawer}
                  sx={{ flex: 1 }}
                >
                  Sign In
                </Button>
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={toggleDrawer}
                  sx={{ flex: 1 }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
          
          <Divider />
          
          <List sx={{ pt: 1 }}>
            <MobileNavItem 
              icon={<HomeIcon />} 
              label="Home" 
              to="/" 
              onClick={toggleDrawer}
            />
            <MobileNavItem 
              icon={<ArticleIcon />} 
              label="Articles" 
              to="/articles" 
              onClick={toggleDrawer}
            />
            <MobileNavItem 
              icon={<CategoryIcon />} 
              label="Categories" 
              to="/categories" 
              onClick={toggleDrawer}
            />
            {currentUser && (
              <>
                <MobileNavItem 
                  icon={<AccountCircleIcon />} 
                  label="Profile" 
                  to="/profile" 
                  onClick={toggleDrawer}
                />
                {currentUser.roles && currentUser.roles.includes('ROLE_ADMIN') && (
                  <MobileNavItem 
                    icon={<AdminPanelSettingsIcon />} 
                    label="Admin Dashboard" 
                    to="/admin" 
                    onClick={toggleDrawer}
                  />
                )}
              </>
            )}
          </List>
          
          <Divider />
          
          {currentUser && (
            <Box sx={{ p: 2 }}>
              <Button 
                variant="outlined" 
                color="error" 
                fullWidth 
                onClick={() => {
                  toggleDrawer();
                  logOut();
                }}
                startIcon={<LogoutIcon />}
              >
                Logout
              </Button>
            </Box>
          )}
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ 
          py: 2,
          px: { xs: 2, sm: 4 },
          flexGrow: 1,
          backgroundColor: theme.palette.background.default
        }}>
          <Container maxWidth="xl">
            <Routes>
              <Route path="/" element={<ArticleList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/articles" element={<ArticleList />} />
              <Route path="/articles/:id" element={<ArticleDetail />} />
              <Route path="/add-article" element={
                <ProtectedRoute>
                  <ArticleForm />
                </ProtectedRoute>
              } />
              <Route path="/test-article/:id" element={<TestArticleForm />} />
              <Route path="/edit-article/:id" element={
                <ProtectedRoute>
                  <ArticleForm />
                </ProtectedRoute>
              } />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/categories/:id" element={<CategoryDetail />} />
              <Route path="/admin" element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/csv-import" element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <CsvImporter />
                </ProtectedRoute>
              } />
            </Routes>
          </Container>
        </Box>

        {/* Footer */}
        <Box 
          component="footer" 
          sx={{ 
            mt: 'auto', 
            py: 2, 
            backgroundColor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'center', sm: 'flex-start' }
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' }, mb: { xs: 2, sm: 0 } }}>
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'primary.main',
                    fontWeight: 700,
                    mb: 1
                  }}
                >
                  <ArticleIcon sx={{ mr: 1 }} />
                  {appName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  © {new Date().getFullYear()} {appName}. All rights reserved.
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/articles" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                    Articles
                  </Typography>
                </Link>
                <Link to="/categories" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                    Categories
                  </Typography>
                </Link>
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                    Profile
                  </Typography>
                </Link>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                  Privacy Policy
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                  Terms of Service
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
