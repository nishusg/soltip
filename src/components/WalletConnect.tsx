import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Box, Typography, Card, CardContent } from "@mui/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import LockIcon from "@mui/icons-material/Lock";
import DiamondIcon from "@mui/icons-material/Diamond";

export default function WalletConnect() {
  return (
    <Box sx={{ py: 8, textAlign: "center" }}>
      {/* ---- Hero Content ---- */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
          Send{" "}
          <Box
            component="span"
            sx={{
              background: "linear-gradient(90deg, #00e5ff 0%, #b400ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Superchats
          </Box>{" "}
          on Solana
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
          Tip your favorite creators with SOL. Fast, transparent, on-chain.
        </Typography>

        {/* Wallet connect button */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <WalletMultiButton />
        </Box>
      </Box>

      {/* ---- Feature Cards ---- */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 4 }}>
        <Box>
          <Card sx={{ height: "100%", textAlign: "center", py: 3 }}>
            <CardContent>
              <FlashOnIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Lightning Fast
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sub-second transactions on Solana
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ height: "100%", textAlign: "center", py: 3 }}>
            <CardContent>
              <LockIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Secure
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Wallet-based auth, no passwords
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ height: "100%", textAlign: "center", py: 3 }}>
            <CardContent>
              <DiamondIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Transparent
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All tips verified on-chain
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
