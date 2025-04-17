import { createTheme } from '@mui/material/styles';

// Enterprise-grade professional theme inspired by top platforms (Netflix, Microsoft, Google)
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0052CC', // Professional deep blue (Microsoft/LinkedIn style)
      light: '#4C9AFF',
      dark: '#0747A6',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E50914', // Netflix red for accents
      light: '#FF3D49',
      dark: '#B7000C',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#00875A', // Professional green
      light: '#57D9A3',
      dark: '#006644',
    },
    info: {
      main: '#2684FF',
      light: '#4C9AFF',
      dark: '#0052CC',
    },
    warning: {
      main: '#FF8B00',
      light: '#FFB084',
      dark: '#CC6D00',
    },
    error: {
      main: '#DE350B',
      light: '#FF5630',
      dark: '#BF2600',
    },
    background: {
      default: '#F4F5F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#172B4D',
      secondary: '#5E6C84',
    },
    divider: '#E6E6E6',
    grey: {
      50: '#FAFBFC',
      100: '#F4F5F7',
      200: '#EBECF0',
      300: '#DFE1E6',
      400: '#C1C7D0',
      500: '#8993A4',
      600: '#6B778C',
      700: '#344563',
      800: '#172B4D',
      900: '#091E42',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Segoe UI", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.5px',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: '"Segoe UI", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.5px',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: '"Segoe UI", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: '"Segoe UI", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: '"Segoe UI", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: '"Segoe UI", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
      fontSize: '0.875rem',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    },
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(9, 30, 66, 0.06)',
    '0px 3px 5px rgba(9, 30, 66, 0.08)',
    '0px 4px 8px rgba(9, 30, 66, 0.10)',
    '0px 5px 15px rgba(9, 30, 66, 0.08)',
    '0px 8px 15px rgba(9, 30, 66, 0.10)',
    '0px 10px 20px rgba(9, 30, 66, 0.12)',
    '0px 15px 25px rgba(9, 30, 66, 0.12)',
    '0px 20px 40px rgba(9, 30, 66, 0.15)',
    '0px 25px 50px rgba(9, 30, 66, 0.15)',
    '0px 30px 60px rgba(9, 30, 66, 0.15)',
    '0px 35px 70px rgba(9, 30, 66, 0.15)',
    '0px 40px 80px rgba(9, 30, 66, 0.15)',
    '0px 45px 90px rgba(9, 30, 66, 0.15)',
    '0px 50px 100px rgba(9, 30, 66, 0.15)',
    '0px 55px 110px rgba(9, 30, 66, 0.15)',
    '0px 60px 120px rgba(9, 30, 66, 0.15)',
    '0px 65px 130px rgba(9, 30, 66, 0.15)',
    '0px 70px 140px rgba(9, 30, 66, 0.15)',
    '0px 75px 150px rgba(9, 30, 66, 0.15)',
    '0px 80px 160px rgba(9, 30, 66, 0.15)',
    '0px 85px 170px rgba(9, 30, 66, 0.15)',
    '0px 90px 180px rgba(9, 30, 66, 0.15)',
    '0px 95px 190px rgba(9, 30, 66, 0.15)',
    '0px 100px 200px rgba(9, 30, 66, 0.15)',
  ],
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c7d0',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#8993a4',
          },
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '10px 16px',
          transition: 'all 0.2s ease-in-out',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(to right, #0052CC, #2684FF)',
          '&:hover': {
            background: 'linear-gradient(to right, #0747A6, #0052CC)',
          }
        },
        containedSecondary: {
          background: 'linear-gradient(to right, #E50914, #FF3D49)',
          '&:hover': {
            background: 'linear-gradient(to right, #B7000C, #E50914)',
          }
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
          },
        },
        textPrimary: {
          '&:hover': {
            backgroundColor: 'rgba(0, 82, 204, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(9, 30, 66, 0.08)',
          overflow: 'hidden',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(9, 30, 66, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
        },
        title: {
          fontSize: '1.125rem',
          fontWeight: 600,
        },
        subheader: {
          fontSize: '0.875rem',
          color: '#5E6C84',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
          '&:last-child': {
            paddingBottom: 20,
          },
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
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          lineHeight: 1.6,
        },
        input: {
          '&::placeholder': {
            color: '#8993A4',
            opacity: 1,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0052CC',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0052CC',
            borderWidth: 2,
          },
        },
        notchedOutline: {
          borderColor: '#DFE1E6',
          transition: 'border-color 0.2s ease',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          color: '#5E6C84',
          '&.Mui-focused': {
            color: '#0052CC',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          fontSize: '0.75rem',
          padding: '0 4px',
          height: 24,
        },
        filled: {
          backgroundColor: '#EBECF0',
          color: '#172B4D',
          '&:hover': {
            backgroundColor: '#DFE1E6',
          },
        },
        outlined: {
          borderColor: '#DFE1E6',
          color: '#172B4D',
        },
        filledPrimary: {
          backgroundColor: '#DEEBFF',
          color: '#0747A6',
          '&:hover': {
            backgroundColor: '#C3D0EB',
          },
        },
        filledSecondary: {
          backgroundColor: '#FFEBE6',
          color: '#B7000C',
          '&:hover': {
            backgroundColor: '#FFCFC7',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          marginTop: 16,
          marginBottom: 16,
          backgroundColor: '#DFE1E6',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          background: 'linear-gradient(to bottom right, #0052CC, #2684FF)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px rgba(9, 30, 66, 0.1)',
          backgroundImage: 'none',
        },
        colorPrimary: {
          backgroundColor: '#FFFFFF',
          color: '#172B4D',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
          padding: '0 16px',
          '@media (min-width:600px)': {
            minHeight: 70,
            padding: '0 24px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px rgba(9, 30, 66, 0.1)',
        },
        outlined: {
          borderColor: '#DFE1E6',
        },
        elevation1: {
          boxShadow: '0 1px 2px rgba(9, 30, 66, 0.08)',
        },
        elevation2: {
          boxShadow: '0 3px 5px rgba(9, 30, 66, 0.08)',
        },
        elevation3: {
          boxShadow: '0 5px 10px rgba(9, 30, 66, 0.1)',
        },
        elevation4: {
          boxShadow: '0 8px 16px rgba(9, 30, 66, 0.12)',
        },
        elevation6: {
          boxShadow: '0 12px 24px rgba(9, 30, 66, 0.15)',
        },
        elevation8: {
          boxShadow: '0 16px 32px rgba(9, 30, 66, 0.15)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme; 