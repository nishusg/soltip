import { ThemeOptions } from "@mui/material/styles";

export const diamondThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#A5F3FC", // Pristine Glacier Diamond
      light: "#cffafe",
      dark: "#0891b2",
    },
    secondary: {
      main: "#E0F2FE", // Space Platinum Blue
      light: "#f0f9ff",
      dark: "#0369a1",
    },
    background: {
      default: "#030712", // Pure Obsidian Space Dark
      paper: "rgba(17, 24, 39, 0.65)", // Frosted Graphite Card
    },
    text: {
      primary: "#F9FAFB",
      secondary: "#9CA3AF",
    },
  },
};
