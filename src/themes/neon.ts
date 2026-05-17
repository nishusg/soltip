import { ThemeOptions } from "@mui/material/styles";

export const neonThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#FF007F", // Neon Synthwave Pink
      light: "#ff4da6",
      dark: "#c70060",
    },
    secondary: {
      main: "#00F0FF", // Laser Cyber Cyan
      light: "#4df5ff",
      dark: "#00b2bd",
    },
    background: {
      default: "#090514", // Deep Midnight Purple
      paper: "rgba(22, 15, 44, 0.65)", // Electric Purple Card
    },
    text: {
      primary: "#FAFAFA",
      secondary: "#B5A5D7",
    },
  },
};
