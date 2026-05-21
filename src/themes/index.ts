import { createTheme, Theme } from "@mui/material/styles";
import { sharedThemeOptions } from "./shared";
import { goldThemeOptions } from "./gold";
import { discordThemeOptions } from "./discord";
import { neonThemeOptions } from "./neon";
import { diamondThemeOptions } from "./diamond";
import { midnightThemeOptions } from "./midnight";

// Base Solana/Discord Theme (Default for all users)
export const baseTheme = createTheme({
  ...sharedThemeOptions,
  palette: {
    mode: "dark",
    primary: {
      main: "#38BDF8", // Sky Blue
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
});

export const premiumThemes: Record<string, Theme> = {
  gold: createTheme({
    ...sharedThemeOptions,
    ...goldThemeOptions,
  }),
  discord: createTheme({
    ...sharedThemeOptions,
    ...discordThemeOptions,
  }),
  neon: createTheme({
    ...sharedThemeOptions,
    ...neonThemeOptions,
  }),
  diamond: createTheme({
    ...sharedThemeOptions,
    ...diamondThemeOptions,
  }),
  midnight: createTheme({
    ...sharedThemeOptions,
    ...midnightThemeOptions,
  }),
};
