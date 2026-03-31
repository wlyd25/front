import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => {
  return createTheme({
    direction: 'ltr',
    palette: {
      mode,
      primary: {
        main: '#d25419',
        light: '#c1581b',
        dark: '#ec8d11',
      },
      secondary: {
        main: '#9c27b0',
        light: '#ba68c8',
        dark: '#7b1fa2',
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
      error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontSize: '2.5rem', fontWeight: 600 },
      h2: { fontSize: '2rem', fontWeight: 600 },
      h3: { fontSize: '1.75rem', fontWeight: 600 },
      h4: { fontSize: '1.5rem', fontWeight: 600 },
      h5: { fontSize: '1.25rem', fontWeight: 600 },
      h6: { fontSize: '1rem', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            textAlign: 'left',
            padding: '12px 16px',
          },
          head: {
            fontWeight: 600,
            backgroundColor: mode === 'light' ? '#f5f5f5' : '#2c2c2c',
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          select: {
            textAlign: 'left',
          },
          displayedRows: {
            textAlign: 'left',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            left: 0,
            right: 'auto',
            transformOrigin: 'top left',
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            textAlign: 'left',
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            textAlign: 'left',
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            marginRight: 16,
            marginLeft: 0,
            minWidth: 40,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${mode === 'light' ? '#e0e0e0' : '#333'}`,
          },
        },
      },
    },
  });
};