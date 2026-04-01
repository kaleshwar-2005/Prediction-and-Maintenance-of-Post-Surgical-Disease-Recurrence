import { createTheme, type ThemeOptions } from '@mui/material/styles';

export const getAppTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: isDark ? '#4fc3f7' : '#0288d1', // Brighter blue for dark mode
        light: isDark ? '#b3e5fc' : '#e1f5fe',
        dark: isDark ? '#0288d1' : '#01579b',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#4dd0e1' : '#00bcd4',
        light: isDark ? '#b2ebf2' : '#e0f7fa',
        dark: isDark ? '#00838f' : '#006064',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0a1929' : '#f4f7f9',
        paper: isDark ? '#132f4c' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f3f6f9' : '#2c3e50',
        secondary: isDark ? '#b2bac2' : '#546e7a',
      },
      success: {
        main: isDark ? '#66bb6a' : '#2e7d32',
        light: isDark ? 'rgba(102, 187, 106, 0.1)' : '#edf7ed',
      },
      warning: {
        main: isDark ? '#ffa726' : '#ed6c02',
        light: isDark ? 'rgba(255, 167, 38, 0.1)' : '#fff4e5',
      },
      error: {
        main: isDark ? '#f44336' : '#d32f2f',
        light: isDark ? 'rgba(244, 67, 54, 0.1)' : '#fdecea',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 20px',
          },
          containedPrimary: {
            boxShadow: isDark ? 'none' : '0 4px 12px rgba(2, 136, 209, 0.3)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.1)' : '0 4px 20px rgba(0,0,0,0.05)',
            border: isDark ? 'none' : '1px solid rgba(0,0,0,0.05)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            backgroundImage: 'none', // Remove default elevation overlay in dark mode
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};

export default getAppTheme;
