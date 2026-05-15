import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Box, Typography, Card, CardContent } from "@mui/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import LockIcon from "@mui/icons-material/Lock";
import DiamondIcon from "@mui/icons-material/Diamond";

export default function WalletConnect() {
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
          background: "conic-gradient(from 0deg, #9945FF, #14F195, #9945FF)",
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
          bgcolor: "rgba(20, 241, 149, 0.1)",
          border: "1px solid rgba(20, 241, 149, 0.3)",
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
            bgcolor: "#14F195",
            animation: "pulseDot 2s infinite",
            "@keyframes pulseDot": {
              "0%": { boxShadow: "0 0 0 0 rgba(20, 241, 149, 0.7)" },
              "70%": { boxShadow: "0 0 0 10px rgba(20, 241, 149, 0)" },
              "100%": { boxShadow: "0 0 0 0 rgba(20, 241, 149, 0)" }
            }
          }}
        />
        <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: "0.85rem", color: "#14F195", fontWeight: 700 }}>
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
          Let's Build Your <br/>
          <Box
            component="span"
            sx={{
              background: "linear-gradient(90deg, #9945FF 0%, #14F195 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Solana-Powered
          </Box>{" "}
          Future Together
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            mb: 6,
            maxWidth: 700,
            mx: "auto",
            fontSize: "1.1rem",
            fontWeight: 400,
            lineHeight: 1.8
          }}
        >
          The most seamless platform for Web3 creators. 
          Experience lightning-fast dApps, DeFi integrations, NFTs, and secure smart contracts on-chain.
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
              Instant
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Transactions settle in seconds, not minutes.
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
              Secure
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Directly peer-to-peer using your own wallet.
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
              <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#14F195', fontFamily: "'Space Mono', monospace" }}>$</Typography>
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
              ~$0.00025
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Avg. Transaction Fee
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>

  );
}
