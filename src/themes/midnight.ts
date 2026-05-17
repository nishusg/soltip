import { ThemeOptions } from "@mui/material/styles";

export const midnightThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#E11D48", // Vampire Crimson Scarlet
      light: "#fb7185",
      dark: "#be123c",
    },
    secondary: {
      main: "#F59E0B", // High-Contrast Amber Gold
      light: "#fbbf24",
      dark: "#b45309",
    },
    background: {
      default: "#080204", // Burgundy Obsidian Black
      paper: "rgba(28, 10, 14, 0.65)", // Velvet Crimson Charcoal Card
    },
    text: {
      primary: "#FFF1F2",
      secondary: "#FDA4AF",
    },
  },
};
