import { ThemeOptions } from "@mui/material/styles";

export const sakuraThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#FF80BF", // Sakura Pink
      light: "#ffa6d2",
      dark: "#cc4d8c",
    },
    secondary: {
      main: "#C084FC", // Lavender
      light: "#d8b4fe",
      dark: "#a855f7",
    },
    background: {
      default: "#0E080C", // Dark Cherry Obsidian
      paper: "rgba(30, 16, 26, 0.7)", // Deep Rose Velvet Card
    },
    text: {
      primary: "#FFF0F6",
      secondary: "#FBCFE8",
    },
  },
};
