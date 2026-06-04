import { ThemeOptions } from "@mui/material/styles";

export const cyberpunkThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#FF0055", // Cyber Pink
      light: "#ff3377",
      dark: "#cc0044",
    },
    secondary: {
      main: "#00F0FF", // Neon Cyan
      light: "#33f3ff",
      dark: "#00c0cc",
    },
    background: {
      default: "#05050A", // Tech Pitch Black
      paper: "rgba(15, 10, 20, 0.7)", // Deep Cyber Purple Card
    },
    text: {
      primary: "#F5F5FA",
      secondary: "#A5A5C0",
    },
  },
};
