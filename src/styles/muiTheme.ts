import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#7d4f72",
      dark: "#643d5b",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#a86b76",
      dark: "#87545e",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#b78a2e",
      dark: "#926d24",
      contrastText: "#2f1f33",
    },
    error: {
      main: "#8d2f4a",
      contrastText: "#ffffff",
    },
    background: {
      default: "#fff6fb",
      paper: "#fffaff",
    },
    text: {
      primary: "#2f1f33",
      secondary: "#5d4a60",
    },
    divider: "#d8bfd0",
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: "var(--font-sans)",
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#fffafc",
        },
      },
    },
  },
});

export default muiTheme;

