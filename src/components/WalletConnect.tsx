import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Box, Typography, Card, CardContent } from "@mui/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import LockIcon from "@mui/icons-material/Lock";
import DiamondIcon from "@mui/icons-material/Diamond";

export default function WalletConnect() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, textAlign: "center", position: "relative" }}>
      {/* Background Glow */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "40%",
          background: "radial-gradient(circle, rgba(0, 242, 255, 0.1) 0%, transparent 70%)",
          zIndex: -1,
          filter: "blur(60px)"
        }}
      />

      {/* ---- Hero Content ---- */}
      <Box className="fade-in-up" sx={{ mb: 10 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "3rem", md: "4.5rem" },
            mb: 2,
            background: "linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.5) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Send{" "}
          <Box
            component="span"
            sx={{
              background: "linear-gradient(90deg, #00f2ff 0%, #7000ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Superchats
          </Box>{" "}
          on Solana
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
          The most seamless way to tip your favorite creators.
          Experience lightning-fast, transparent, and secure on-chain interactions.
        </Typography>
      </Box>

      {/* ---- Feature Cards ---- */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
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
              bgcolor: "rgba(0, 242, 255, 0.1)",
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
              bgcolor: "rgba(112, 0, 255, 0.1)",
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
              bgcolor: "rgba(255, 255, 255, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3
            }}>
              <DiamondIcon sx={{ fontSize: 32, color: "#fff" }} />
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              Verified
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Fully transparent and verifiable on the ledger.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>

  );
}
