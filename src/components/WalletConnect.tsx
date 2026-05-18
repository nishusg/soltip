import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useWalletAuth } from "../hooks/useWalletAuth";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import LockIcon from "@mui/icons-material/Lock";
import DiamondIcon from "@mui/icons-material/Diamond";

export default function WalletConnect() {
  const { isAuthenticated } = useWalletAuth();
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, textAlign: "center", position: "relative" }}>
      {/* Spinning Conic Orbs */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: { xs: "300px", md: "500px" },
          height: { xs: "300px", md: "500px" },
          background: (theme) => `conic-gradient(from 0deg, ${theme.palette.secondary?.main || theme.palette.primary.main}, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.main})`,
          borderRadius: "50%",
          zIndex: -1,
          filter: "blur(80px)",
          opacity: 0.4,
          animation: "spin 10s linear infinite",
          "@keyframes spin": {
            "0%": { transform: "translateX(-50%) rotate(0deg)" },
            "100%": { transform: "translateX(-50%) rotate(360deg)" }
          }
        }}
      />

      {/* Live Badge */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          left: 24,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: (theme) => `${theme.palette.primary.main}1a`,
          border: (theme) => `1px solid ${theme.palette.primary.main}4d`,
          borderRadius: "50px",
          px: 2,
          py: 1,
          backdropFilter: "blur(10px)",
          zIndex: 10
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "primary.main",
            animation: "pulseDot 2s infinite",
            "@keyframes pulseDot": {
              "0%": { boxShadow: (theme: any) => `0 0 0 0 ${theme.palette.primary.main}b3` },
              "70%": { boxShadow: (theme: any) => `0 0 0 10px ${theme.palette.primary.main}00` },
              "100%": { boxShadow: (theme: any) => `0 0 0 0 ${theme.palette.primary.main}00` }
            }
          }}
        />
        <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: "0.85rem", color: "primary.main", fontWeight: 700 }}>
          65,000 TPS · Live
        </Typography>
      </Box>

      {/* ---- Hero Content ---- */}
      <Box className="fade-in-up" sx={{ mb: 10 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.5rem", md: "4.5rem" },
            mb: 2,
            background: "linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.5) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Real-Time Engagement <br />
          <Box
            component="span"
            sx={{
              background: (theme) => `linear-gradient(90deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Powered by Solana
          </Box>
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            mb: 6,
            maxWidth: 750,
            mx: "auto",
            fontSize: "1.1rem",
            fontWeight: 400,
            lineHeight: 1.8
          }}
        >
          Elevate your stream with instant on-chain alerts, ultra-low fees, and direct-to-wallet superchats. The ultimate engagement layer for the next generation of creators.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          {isAuthenticated ? (
            <Button
              component={RouterLink}
              to="/dashboard"
              variant="contained"
              color="primary"
              size="large"
              sx={{
                px: 6,
                py: 2,
                borderRadius: "14px",
                fontWeight: 800,
                fontSize: "1.1rem",
                background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: (theme) => `0 8px 25px ${theme.palette.primary.main}4d`,
                "&:hover": { transform: "translateY(-2px)", boxShadow: (theme) => `0 12px 30px ${theme.palette.primary.main}66` }
              }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => document.querySelector<HTMLButtonElement>(".wallet-adapter-button")?.click()}
              sx={{
                px: 6,
                py: 2,
                borderRadius: "14px",
                fontWeight: 800,
                fontSize: "1.1rem",
                background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: (theme) => `0 8px 25px ${theme.palette.primary.main}4d`,
                "&:hover": { transform: "translateY(-2px)", boxShadow: (theme) => `0 12px 30px ${theme.palette.primary.main}66` }
              }}
            >
              Connect Phantom
            </Button>
          )}
        </Box>
        <Typography variant="caption" sx={{ display: "block", mt: 2, opacity: 0.6, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Optimized for Phantom Wallet
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
          gap: 3,
          mt: 4
        }}
      >
        <Card sx={{ p: 1 }}>
          <CardContent sx={{ py: 4 }}>
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: "14px",
              bgcolor: "rgba(20, 241, 149, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3
            }}>
              <FlashOnIcon sx={{ fontSize: 32, color: "primary.main" }} />
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              Live Alerts
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time on-stream notifications via OBS and Streamlabs.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ p: 1 }}>
          <CardContent sx={{ py: 4 }}>
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: "14px",
              bgcolor: "rgba(153, 69, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3
            }}>
              <LockIcon sx={{ fontSize: 32, color: "secondary.main" }} />
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              Direct & Secure
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Non-custodial. Tips go directly from fans to your wallet.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ p: 1 }}>
          <CardContent sx={{ py: 4 }}>
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: "14px",
              bgcolor: "rgba(20, 241, 149, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3
            }}>
              <Typography sx={{ fontSize: 28, fontWeight: 800, color: 'primary.main', fontFamily: "'Space Mono', monospace" }}>$</Typography>
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
              Zero Middleman
            </Typography>
            <Typography variant="body1" color="text.secondary">
              No 30% cuts. Only the minimal Solana network fees.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>

  );
}
