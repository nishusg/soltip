import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#14F195", // Solana Green
      light: "#66ffc2",
      dark: "#0da263",
    },
    secondary: {
      main: "#9945FF", // Solana Purple
      light: "#b87dff",
      dark: "#6820cc",
    },
    background: {
      default: "#050508",
      paper: "rgba(15, 15, 25, 0.7)",
    },
    text: {
      primary: "#f8f9fa",
      secondary: "#94a3b8",
    },
    success: {
      main: "#10b981",
    },
    error: {
      main: "#ef4444",
    },
  },
  typography: {
    fontFamily: '"Space Grotesk", "system-ui", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      lineHeight: 1.6,
    },
    body1: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        :root {
          --glass-bg: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(255, 255, 255, 0.08);
          --neon-primary: #14F195;
          --neon-secondary: #9945FF;
        }

        body {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          background-color: #050508;
          color: #f8f9fa;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          
          /* Subtle Purple Grid */
          background-image: 
            linear-gradient(rgba(153, 69, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(153, 69, 255, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          background-position: center top;
        }

        /* Overlay gradient to fade the grid at the bottom */
        body::before {
          content: "";
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle at 50% 0%, rgba(5,5,8,0) 0%, rgba(5,5,8,1) 80%);
          pointer-events: none;
          z-index: -1;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
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
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.5)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            border: "1px solid rgba(20, 241, 149, 0.2)",
            transform: "translateY(-4px)",
            boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(20, 241, 149, 0.05)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 28px",
          fontSize: "0.95rem",
          transition: "all 0.2s ease",
          "&.MuiButton-containedPrimary": {
            background: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
            color: "#ffffff",
            boxShadow: "0 4px 15px rgba(20, 241, 149, 0.2)",
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0 8px 25px rgba(20, 241, 149, 0.4)",
              background: "linear-gradient(135deg, #a85eff 0%, #35f3a5 100%)",
            },
            "&:active": {
              transform: "scale(0.98)",
            },
          },
          "&.MuiButton-outlinedPrimary": {
            borderColor: "rgba(20, 241, 149, 0.5)",
            borderWidth: "1.5px",
            "&:hover": {
              borderWidth: "1.5px",
              backgroundColor: "rgba(20, 241, 149, 0.05)",
              borderColor: "#14F195",
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
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
              borderColor: "#14F195",
              borderWidth: "1.5px",
              boxShadow: "0 0 15px rgba(20, 241, 149, 0.1)",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#94a3b8",
            "&.Mui-focused": {
              color: "#14F195",
            },
          },
        },
      },
    },
  },
});

export default theme;
