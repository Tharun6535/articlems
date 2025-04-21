import React, { createContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from '../theme';

// Create the context
export const ThemeContext = createContext({
  mode: 'light',
  toggleColorMode: () => {},
});

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Check if dark mode preference exists in localStorage, default to light
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    // Also check system preference if no saved preference
    if (!savedMode) {
      const prefersDarkMode = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDarkMode ? 'dark' : 'light';
    }
    return savedMode;
  });

  // Toggle between light and dark mode
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode); // Save to localStorage
      return newMode;
    });
  };

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only change if user hasn't set a preference
      if (!localStorage.getItem('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    
    // Add listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // For older browsers
      mediaQuery.addListener(handleChange);
    }
    
    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // For older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Create the theme object based on current mode
  const theme = useMemo(() => getTheme(mode), [mode]);

  // Context value with mode state and toggle function
  const contextValue = useMemo(() => ({
    mode,
    toggleColorMode,
  }), [mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline /> {/* Normalize CSS and apply theme's baseline styles */}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 