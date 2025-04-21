import { createTheme } from '@mui/material/styles';

// Create a modern theme with beautiful aesthetics and better accessibility
const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#4361ee' : '#4cc9f0', // Modern blue shades
      light: mode === 'light' ? '#738df9' : '#72ddfb',
      dark: mode === 'light' ? '#2b47d1' : '#3aa0c0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: mode === 'light' ? '#f72585' : '#ff6b6b', // Vibrant accent colors
      light: mode === 'light' ? '#ff4ca5' : '#ff9e9e',
      dark: mode === 'light' ? '#d11769' : '#e05252',
      contrastText: '#FFFFFF',
    },
    success: {
      main: mode === 'light' ? '#10b981' : '#34d399', // Fresh green 
      light: mode === 'light' ? '#34d399' : '#6ee7b7',
      dark: mode === 'light' ? '#059669' : '#10b981',
    },
    info: {
      main: mode === 'light' ? '#3b82f6' : '#60a5fa',
      light: mode === 'light' ? '#60a5fa' : '#93c5fd',
      dark: mode === 'light' ? '#2563eb' : '#3b82f6',
    },
    warning: {
      main: mode === 'light' ? '#f59e0b' : '#fbbf24',
      light: mode === 'light' ? '#fbbf24' : '#fcd34d',
      dark: mode === 'light' ? '#d97706' : '#f59e0b',
    },
    error: {
      main: mode === 'light' ? '#ef4444' : '#f87171',
      light: mode === 'light' ? '#f87171' : '#fca5a5',
      dark: mode === 'light' ? '#dc2626' : '#ef4444',
    },
    background: {
      default: mode === 'light' ? '#f9fafb' : '#111827',
      paper: mode === 'light' ? '#ffffff' : '#1f2937',
      subtle: mode === 'light' ? '#f3f4f6' : '#374151',
    },
    text: {
      primary: mode === 'light' ? '#1f2937' : '#f9fafb',
      secondary: mode === 'light' ? '#4b5563' : '#d1d5db',
      disabled: mode === 'light' ? '#9ca3af' : '#6b7280',
    },
    divider: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    grey: {
      50: mode === 'light' ? '#f9fafb' : '#18212f',
      100: mode === 'light' ? '#f3f4f6' : '#1e293b',
      200: mode === 'light' ? '#e5e7eb' : '#334155',
      300: mode === 'light' ? '#d1d5db' : '#475569',
      400: mode === 'light' ? '#9ca3af' : '#64748b',
      500: mode === 'light' ? '#6b7280' : '#94a3b8',
      600: mode === 'light' ? '#4b5563' : '#cbd5e1',
      700: mode === 'light' ? '#374151' : '#e2e8f0',
      800: mode === 'light' ? '#1f2937' : '#f1f5f9',
      900: mode === 'light' ? '#111827' : '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01562em',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.00833em',
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.00833em',
    },
    h4: {
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.00735em',
    },
    h5: {
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.00735em',
    },
    h6: {
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.0075em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0.01071em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.00714em',
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      textTransform: 'none',
      letterSpacing: '0.02857em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.03333em',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 6px rgba(0, 0, 0, 0.07)',
    '0px 6px 8px rgba(0, 0, 0, 0.08)',
    '0px 8px 12px rgba(0, 0, 0, 0.08)',
    '0px 10px 15px rgba(0, 0, 0, 0.09)',
    '0px 12px 20px rgba(0, 0, 0, 0.09)',
    '0px 14px 25px rgba(0, 0, 0, 0.10)',
    '0px 16px 30px rgba(0, 0, 0, 0.11)',
    '0px 18px 35px rgba(0, 0, 0, 0.12)',
    '0px 20px 40px rgba(0, 0, 0, 0.12)',
    '0px 22px 45px rgba(0, 0, 0, 0.13)',
    '0px 24px 50px rgba(0, 0, 0, 0.13)',
    '0px 26px 55px rgba(0, 0, 0, 0.14)',
    '0px 28px 60px rgba(0, 0, 0, 0.14)',
    '0px 30px 65px rgba(0, 0, 0, 0.15)',
    '0px 32px 70px rgba(0, 0, 0, 0.15)',
    '0px 34px 75px rgba(0, 0, 0, 0.16)',
    '0px 36px 80px rgba(0, 0, 0, 0.16)',
    '0px 38px 85px rgba(0, 0, 0, 0.17)',
    '0px 40px 90px rgba(0, 0, 0, 0.17)',
    '0px 42px 95px rgba(0, 0, 0, 0.18)',
    '0px 44px 100px rgba(0, 0, 0, 0.18)',
    '0px 46px 105px rgba(0, 0, 0, 0.19)',
    '0px 48px 110px rgba(0, 0, 0, 0.19)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.palette.mode === 'light' ? '#bfc7cf' : '#5c6370'} ${theme.palette.mode === 'light' ? '#f7f8fa' : '#2a2f3a'}`,
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.mode === 'light' ? '#f7f8fa' : '#2a2f3a',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'light' ? '#bfc7cf' : '#5c6370',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.mode === 'light' ? '#a0a8b1' : '#73798a',
          },
        }
      })
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 600,
          boxShadow: 'none',
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          '&:hover': {
            background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          }
        },
        containedSecondary: {
          background: (theme) => `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
          '&:hover': {
            background: (theme) => `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
          }
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '20px 24px 12px',
        },
        title: {
          fontSize: '1.25rem',
          fontWeight: 600,
        },
        subheader: {
          fontSize: '0.875rem',
          marginTop: 4,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '12px 24px 24px',
          '&:last-child': {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
          fontSize: '0.75rem',
          padding: '0 8px',
          height: 28,
          '&.MuiChip-filled': {
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: (theme) => `0 1px 0 ${theme.palette.divider}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '0',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: 16,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: (theme) => theme.palette.primary.main,
            borderWidth: 1,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: (theme) => theme.palette.primary.main,
            borderWidth: 2,
          },
        },
        input: {
          padding: '14px 16px',
        },
        notchedOutline: {
          borderColor: (theme) => 
            theme.palette.mode === 'light' 
              ? 'rgba(0, 0, 0, 0.15)' 
              : 'rgba(255, 255, 255, 0.15)',
          transition: 'border-color 0.2s ease',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: (theme) => 
            theme.palette.mode === 'light'
              ? theme.palette.grey[50]
              : theme.palette.grey[900],
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
          '&:hover': {
            backgroundColor: (theme) => 
              theme.palette.mode === 'light'
                ? 'rgba(0, 0, 0, 0.02)'
                : 'rgba(255, 255, 255, 0.02)',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: 6,
          marginTop: 2,
          marginBottom: 2,
          marginLeft: 4,
          marginRight: 4,
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        ul: {
          '& .MuiPaginationItem-root': {
            borderRadius: 8,
            margin: '0 4px',
          },
        },
      },
    },
  },
});

// Export a function that returns the theme object based on the current mode
export { getTheme };

// Default theme (light mode)
const theme = getTheme('light');
export default theme; 