import { createTheme } from '@mui/material/styles';

const baseTypography = {
  fontFamily: "'Inter', 'Poppins', sans-serif",
  h1: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
  h2: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
  h3: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
  h4: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
  h5: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
  h6: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
  button: { textTransform: 'none', fontWeight: 600 },
};

const shape = { borderRadius: 14 };

export const getAppTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#2E7D32' : '#66BB6A',
        light: '#81C784',
        dark: '#1B5E20',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: mode === 'light' ? '#F9A825' : '#FFCA28',
        contrastText: '#1B1B1B',
      },
      success: { main: '#43A047' },
      warning: { main: '#FB8C00' },
      error: { main: '#E53935' },
      info: { main: '#039BE5' },
      background: {
        default: mode === 'light' ? '#F3F7F3' : '#0D1712',
        paper: mode === 'light' ? '#FFFFFF' : '#152019',
      },
      text: {
        primary: mode === 'light' ? '#1B2A1F' : '#E8F0E9',
        secondary: mode === 'light' ? '#4B5F4F' : '#A9BBAD',
      },
    },
    shape,
    typography: baseTypography,
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10, padding: '8px 20px' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: mode === 'light' ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
