import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00e5ff", // Neon Cyan
    },
    secondary: {
      main: "#b400ff", // Neon Purple
    },
    background: {
      default: "#0a0a0f",
      paper: "rgba(20, 20, 30, 0.6)",
    },
    text: {
      primary: "#ffffff",
      secondary: "#a0a0b0",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0a0a0f 0%, #110022 100%);
          background-attachment: fixed;
          min-height: 100vh;
        }
        * {
          box-sizing: border-box;
        }
      `,
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
          padding: "8px 24px",
          "&.MuiButton-containedPrimary": {
            background: "linear-gradient(90deg, #00e5ff 0%, #b400ff 100%)",
            color: "#ffffff",
            "&:hover": {
              background: "linear-gradient(90deg, #00b8cc 0%, #9000cc 100%)",
              boxShadow: "0 0 15px rgba(0, 229, 255, 0.5)",
            },
          },
          "&.MuiButton-containedSecondary": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            borderRadius: "8px",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.1)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.3)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#00e5ff",
            },
          },
        },
      },
    },
  },
});

export default theme;
