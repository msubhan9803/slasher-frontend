// Theme below created using these helpful tools:
// https://material.io/inline-tools/color/
// https://bareynol.github.io/mui-theme-creator/

import { ThemeOptions, createTheme } from '@mui/material/styles';

// Find available configuration options here:
// https://mui.com/material-ui/customization/default-theme/
const materialUiThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF1700',
    },
    secondary: {
      main: '#000000',
    },
    background: {
      default: '#080808',
      paper: '#171717',
    },
    error: {
      main: '#9d0059',
    },
    warning: {
      main: '#e64d03',
    },
    info: {
      main: '#007c82',
    },
    success: {
      main: '#009900',
    },
    divider: '#242424',
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 50,
        },
      },
    },
  },
};

export default createTheme(materialUiThemeOptions);
