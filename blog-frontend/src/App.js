import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Button, Container, Box, IconButton, 
  Menu, MenuItem, Drawer, List, ListItem, ListItemText, ListItemIcon,
  Divider, Tooltip, Avatar, useMediaQuery, useTheme, Badge,
  ListItemButton, CssBaseline, Paper, Fade, Chip, LinearProgress,
  InputBase, Slide, Dialog, DialogContent, Backdrop, CircularProgress
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
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
import PeopleIcon from '@mui/icons-material/People';

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
import UserManagement from './components/admin/UserManagement';
import Home from './components/Home';

// Custom styled components
const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 24,
  backgroundColor: alpha(theme.palette.mode === 'light' ? theme.palette.common.black : theme.palette.common.white, 0.08),
  '&:hover': {
    backgroundColor: alpha(theme.palette.mode === 'light' ? theme.palette.common.black : theme.palette.common.white, 0.12),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  transition: 'all 0.3s ease',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

// Custom navigation components
const MobileNavItem = ({ icon, label, to, onClick }) => {
  return (
    <ListItem disablePadding>
      <ListItemButton 
        component={Link} 
        to={to} 
        onClick={onClick}
        sx={{ 
          py: 1.5,
          borderRadius: '10px',
          mx: 1,
          '&:hover': {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
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

// Custom loading component
const FullPageLoader = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: theme.palette.background.default 
    }}>
      <Box sx={{ position: 'relative', mb: 4 }}>
        <CircularProgress size={60} thickness={4} />
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          bottom: 0, 
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 800, color: 'primary.main' }}>
            PC
          </Typography>
        </Box>
      </Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Loading ProContent</Typography>
      <Box sx={{ width: 300 }}>
        <LinearProgress color="primary" />
      </Box>
    </Box>
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [articleLogs, setArticleLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  
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
  
  const handleNotificationsOpen = async (event) => {
    setNotificationsAnchorEl(event.currentTarget);
    setLogsLoading(true);
    try {
      const res = await fetch('/api/logs/article');
      const logs = await res.json();
      setArticleLogs(logs.reverse()); // Show newest first
    } catch (e) {
      setArticleLogs(['Failed to fetch logs']);
    }
    setLogsLoading(false);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  // Protected route component
  const ProtectedRoute = ({ children, roles = [] }) => {
    const location = useLocation();
    
    if (loading) {
      return <FullPageLoader />;
    }

    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles.length > 0 && !roles.some(role => user.roles.includes(role))) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  const drawerWidth = 280;

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
            backgroundColor: isDark ? 'background.paper' : 'background.paper',
            backdropFilter: 'blur(8px)',
            boxShadow: theme.shadows[1]
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', height: 70 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isMobile && (
                <IconButton
                  edge="start"
                  aria-label="menu"
                  onClick={toggleDrawer}
                  sx={{ 
                    mr: 1,
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    mr: 1, 
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(45deg, #4cc9f0, #4361ee)' 
                      : 'linear-gradient(45deg, #4361ee, #3a0ca3)'
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                    PC
                  </Typography>
                </Avatar>
              <Typography 
                  variant="h6"
                  noWrap
                component={Link} 
                to="/" 
                sx={{ 
                  textDecoration: 'none',
                    color: 'text.primary',
                  fontWeight: 700,
                    display: { xs: 'none', sm: 'block' }
                }}
              >
                {appName}
              </Typography>
              </Box>
              
              {!isMobile && (
                <Box sx={{ display: 'flex', ml: 3 }}>
                  <Button 
                    component={Link} 
                    to="/" 
                    sx={{ 
                      fontWeight: 500, 
                      mx: 0.5,
                      borderRadius: 2,
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    Home
                  </Button>
                  <Button 
                    component={Link} 
                    to="/articles" 
                    sx={{ 
                      fontWeight: 500, 
                      mx: 0.5,
                      borderRadius: 2,
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    Articles
                  </Button>
                  <Button 
                    component={Link} 
                    to="/categories" 
                    sx={{ 
                      fontWeight: 500, 
                      mx: 0.5,
                      borderRadius: 2,
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    Categories
                  </Button>
                </Box>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Search button/bar */}
              {!isSmall && (
                <Fade in={searchOpen}>
                  <SearchWrapper sx={{ display: searchOpen ? 'block' : 'none' }}>
                    <SearchIconWrapper>
                      <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase
                      placeholder="Search…"
                      inputProps={{ 'aria-label': 'search' }}
                      autoFocus={searchOpen}
                    />
                  </SearchWrapper>
                </Fade>
              )}

              <IconButton 
                onClick={toggleSearch} 
                sx={{ 
                  color: searchOpen ? 'primary.main' : 'text.primary',
                  backgroundColor: searchOpen ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08)
                  }
                }}
              >
                {searchOpen ? <CloseIcon /> : <SearchIcon />}
              </IconButton>
              
              {/* Notifications */}
              <IconButton 
                onClick={handleNotificationsOpen}
                sx={{ 
                  ml: 1,
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08)
                  }
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Menu
                anchorEl={notificationsAnchorEl}
                open={Boolean(notificationsAnchorEl)}
                onClose={handleNotificationsClose}
                PaperProps={{
                  elevation: 3,
                  sx: { 
                    width: 320,
                    maxHeight: 380,
                    mt: 1.5,
                    borderRadius: 2,
                    overflow: 'hidden'
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Article Logs
                  </Typography>
                </Box>
                {logsLoading ? (
                  <MenuItem>
                    <CircularProgress size={20} sx={{ mr: 2 }} /> Loading...
                  </MenuItem>
                ) : (
                  articleLogs.map((log, idx) => (
                    <MenuItem key={idx} sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="body2">{log}</Typography>
                    </MenuItem>
                  ))
                )}
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                  <Button size="small" sx={{ width: '100%' }}>
                    View all logs
                  </Button>
                </Box>
              </Menu>
              
              {/* Theme toggle */}
              <Tooltip title={isDark ? "Light Mode" : "Dark Mode"}>
                <IconButton 
                  onClick={toggleColorMode} 
                  sx={{ 
                    ml: 1,
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    }
                  }}
                >
                  {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
              
              {/* User menu */}
              {user ? (
                <>
                  <Button
                      onClick={handleUserMenuOpen}
                    startIcon={
                      <Avatar 
                        sx={{ 
                          width: 32,
                          height: 32,
                          border: '2px solid',
                          borderColor: 'primary.main'
                        }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                    endIcon={<ExpandMoreIcon />}
                    sx={{ 
                      ml: 2,
                      textTransform: 'none',
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    {!isSmall && user.username}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleUserMenuClose}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        width: 220,
                        mt: 1.5,
                        borderRadius: 2,
                        overflow: 'hidden'
                      }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {user.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                    <MenuItem 
                      component={Link}
                      to="/profile"
                      onClick={handleUserMenuClose}
                      sx={{ py: 1.5 }}
                    >
                      <ListItemIcon>
                        <AccountCircleIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Profile" />
                    </MenuItem>
                    {user.roles && user.roles.includes("ROLE_ADMIN") && (
                      <MenuItem 
                        component={Link}
                        to="/admin"
                        onClick={handleUserMenuClose}
                        sx={{ py: 1.5 }}
                      >
                        <ListItemIcon>
                          <AdminPanelSettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Admin Panel" />
                      </MenuItem>
                    )}
                    <Box sx={{ px: 1, pb: 1 }}>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        color="error"
                        startIcon={<LogoutIcon />}
                      onClick={logOut}
                        sx={{ mt: 1 }}
                      >
                        Logout
                      </Button>
                    </Box>
                  </Menu>
                </>
              ) : (
                <>
                    <Button 
                      component={Link} 
                      to="/login" 
                      variant="outlined"
                      color="primary"
                    startIcon={<LoginIcon />}
                      sx={{ 
                      ml: 2,
                      display: { xs: 'none', sm: 'flex' }
                    }}
                  >
                    Login
                    </Button>
                  <Button 
                    component={Link} 
                    to="/register" 
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    sx={{ 
                      ml: 2,
                      display: { xs: 'none', sm: 'flex' }
                    }}
                  >
                    Register
                  </Button>
                  <IconButton
                    component={Link}
                    to="/login"
                    sx={{ 
                      ml: 1,
                      display: { xs: 'flex', sm: 'none' },
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    <LoginIcon />
                  </IconButton>
                </>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={isDrawerOpen}
          onClose={toggleDrawer}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  mr: 2,
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(45deg, #4cc9f0, #4361ee)' 
                    : 'linear-gradient(45deg, #4361ee, #3a0ca3)'
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  PC
                </Typography>
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {appName}
            </Typography>
            </Box>
            <IconButton onClick={toggleDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <List sx={{ p: 1 }}>
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
            {user && (
                <MobileNavItem 
                  icon={<AccountCircleIcon />} 
                  label="Profile" 
                  to="/profile" 
                  onClick={toggleDrawer}
                />
            )}
            {user && user.roles && user.roles.includes("ROLE_ADMIN") && (
                  <MobileNavItem 
                    icon={<AdminPanelSettingsIcon />} 
                label="Admin Panel" 
                    to="/admin" 
                    onClick={toggleDrawer}
                  />
            )}
          </List>
          <Divider />
            <Box sx={{ p: 2 }}>
            {user ? (
              <Button 
                fullWidth 
                variant="outlined" 
                color="error" 
                startIcon={<LogoutIcon />}
                onClick={logOut}
              >
                Logout
              </Button>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  component={Link} 
                  to="/login" 
                  variant="outlined" 
                  color="primary"
                  fullWidth
                  startIcon={<LoginIcon />}
                  onClick={toggleDrawer}
                >
                  Login
                </Button>
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  startIcon={<PersonAddIcon />}
                  onClick={toggleDrawer}
                >
                  Register
              </Button>
            </Box>
          )}
          </Box>
        </Drawer>

        {/* Main content */}
        <Box component="main" sx={{ flexGrow: 1, pt: 2, pb: 8 }}>
          <Container maxWidth="xl">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/articles" element={<ArticleList />} />
              <Route path="/articles/:id" element={<ArticleDetail />} />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/categories/:id" element={<CategoryDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/article/add" element={
                <ProtectedRoute>
                  <ArticleForm />
                </ProtectedRoute>
              } />
              <Route path="/article/edit/:id" element={
                <ProtectedRoute>
                  <ArticleForm />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/import" element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <CsvImporter />
                </ProtectedRoute>
              } />
              <Route path="/admin/testform" element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <TestArticleForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute roles={["ROLE_ADMIN"]}>
                  <UserManagement />
                </ProtectedRoute>
              } />
            </Routes>
          </Container>
        </Box>

        {/* Modern footer */}
        <Box 
          component="footer" 
          sx={{ 
            py: 3, 
            px: 2, 
            mt: 'auto', 
            backgroundColor: theme.palette.mode === 'light' 
              ? alpha(theme.palette.primary.main, 0.03)
              : alpha(theme.palette.background.paper, 0.2),
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Container maxWidth="lg">
            <Box 
              sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
                alignItems: { xs: 'center', sm: 'flex-start' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              <Box sx={{ mb: { xs: 3, sm: 0 } }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  © 2023 {appName}. All rights reserved.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <Link to="/terms" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="text.secondary">
                      Terms
                </Typography>
                  </Link>
                  <Link to="/privacy" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="text.secondary">
                      Privacy
                  </Typography>
                </Link>
                  <Link to="/contact" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="text.secondary">
                      Contact
                  </Typography>
                </Link>
                </Box>
              </Box>
              <Box 
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: { xs: 'center', sm: 'flex-end' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      mr: 1,
                      background: theme.palette.mode === 'dark' 
                        ? 'linear-gradient(45deg, #4cc9f0, #4361ee)' 
                        : 'linear-gradient(45deg, #4361ee, #3a0ca3)'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6rem' }}>
                      PC
                    </Typography>
                  </Avatar>
                  <Typography variant="body2" fontWeight={600}>
                    {appName}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Modern Content Management Platform
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
      
      {/* Global backdrop for loading states */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: theme.zIndex.drawer + 2,
          backdropFilter: 'blur(4px)'
        }}
        open={pageLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
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
