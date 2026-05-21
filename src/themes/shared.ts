import { ThemeOptions } from "@mui/material/styles";

export const sharedThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Space Grotesk", "system-ui", sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { lineHeight: 1.6 },
    body1: { lineHeight: 1.6 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        :root {
          --glass-bg: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(255, 255, 255, 0.08);
          --neon-primary: #38BDF8;
          --neon-secondary: #818CF8;
        }

        body {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          background-color: #0B0F17;
          color: #F1F5F9;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          
          /* Sleek Sky Blue Grid */
          background-image: 
            linear-gradient(rgba(56, 189, 248, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          background-position: center top;
        }

        body::before {
          content: "";
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.08) 0%, #0B0F17 80%);
          pointer-events: none;
          z-index: -1;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `,
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }: any) => ({
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.5)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            border: `1px solid ${theme.palette.primary.main}33`,
            transform: "translateY(-4px)",
            boxShadow: `0 30px 60px -12px rgba(0, 0, 0, 0.6), 0 0 20px ${theme.palette.primary.main}1a`,
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }: any) => ({
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 28px",
          fontSize: "0.95rem",
          transition: "all 0.2s ease",
          "&.MuiButton-containedPrimary": {
            background: `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
            color: "#ffffff",
            boxShadow: `0 4px 15px ${theme.palette.primary.main}33`,
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: `0 8px 25px ${theme.palette.primary.main}66`,
              background: `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.light || theme.palette.primary.main} 100%)`,
            },
            "&:active": {
              transform: "scale(0.98)",
            },
          },
          "&.MuiButton-outlinedPrimary": {
            borderColor: `${theme.palette.primary.main}80`,
            borderWidth: "1.5px",
            "&:hover": {
              borderWidth: "1.5px",
              backgroundColor: `${theme.palette.primary.main}0d`,
              borderColor: theme.palette.primary.main,
            },
          },
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }: any) => ({
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            borderRadius: "14px",
            transition: "all 0.2s ease",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.1)",
              borderWidth: "1.5px",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.3)",
            },
            "&.Mui-focused fieldset": {
              borderColor: theme.palette.primary.main,
              borderWidth: "1.5px",
              boxShadow: `0 0 15px ${theme.palette.primary.main}1a`,
            },
          },
          "& .MuiInputLabel-root": {
            color: "#94a3b8",
            "&.Mui-focused": {
              color: theme.palette.primary.main,
            },
          },
        }),
      },
    },
  },
};

export function sanitizeColor(color: string): string {
  const trimmed = (color || "").trim();
  // Valid Hex colors
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    return trimmed;
  }
  // Valid rgb/rgba/hsl/hsla color notations (must not contain semicolon/curly brace styling breakouts)
  if (/^(rgb|rgba|hsl|hsla)\([0-9a-fA-F\s,%./()]+?\)$/i.test(trimmed)) {
    if (!/[;{}]/.test(trimmed)) {
      return trimmed;
    }
  }
  // Standard CSS text keywords
  if (/^[a-zA-Z]+$/.test(trimmed)) {
    return trimmed;
  }
  return "transparent";
}

export function sanitizeUrl(urlStr: string): string {
  if (!urlStr) return "";
  // Check if URL attempts to escape or inject styles
  // We clean single/double quotes, braces, semicolons and backslashes
  let safe = urlStr.replace(/'/g, "%27").replace(/"/g, "%22").replace(/\\/g, "/");
  if (/[;{}]/.test(safe)) {
    safe = safe.replace(/[;{}]/g, "");
  }
  return safe;
}

export const getPremiumOverrides = (primary: string, secondary: string, bg: string, pattern: string) => {
  const safePrimary = sanitizeColor(primary);
  const safeSecondary = sanitizeColor(secondary);
  const safeBg = sanitizeColor(bg);
  const safePattern = sanitizeUrl(pattern);

  return `
  :root {
    --neon-primary: ${safePrimary};
    --neon-secondary: ${safeSecondary};
  }
  body {
    background-color: ${safeBg};
    background-image: 
      linear-gradient(${safePrimary}0d 1px, transparent 1px),
      linear-gradient(90deg, ${safePrimary}0d 1px, transparent 1px);
    background-size: 50px 50px;
  }
  body::before {
    content: "";
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: radial-gradient(circle at 50% 0%, ${safePrimary}1a 0%, ${safeBg} 70%);
    pointer-events: none;
    z-index: -1;
  }
  @keyframes themeDust {
    0% { background-position: 0% 0%; }
    100% { background-position: 100% 100%; }
  }
  body::after {
    content: "";
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background-image: url('${safePattern}');
    opacity: 0.1;
    pointer-events: none;
    z-index: -1;
    animation: themeDust 60s linear infinite;
  }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
`;
};
