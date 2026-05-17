import { ThemeOptions } from "@mui/material/styles";

export const discordThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#38BDF8", // Electric Sky Blue
      light: "#7dd3fc",
      dark: "#0284c7",
    },
    secondary: {
      main: "#818CF8", // Slate Indigo
      light: "#a5b4fc",
      dark: "#4f46e5",
    },
    background: {
      default: "#0B0F17", // Cyber Obsidian Slate
      paper: "rgba(21, 29, 43, 0.65)", // Slate Card Base
    },
    text: {
      primary: "#F1F5F9",
      secondary: "#94A3B8",
    },
  },
};
