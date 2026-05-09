import { Link as RouterLink } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { AppBar, Toolbar, Button, Box, Typography, Chip, IconButton } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Navbar() {
  const { connected, isAuthenticated, login, logout, isLoading } = useWalletAuth();

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: "rgba(10, 10, 15, 0.8)", 
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
        {/* Brand */}
        <Box 
          component={RouterLink} 
          to="/" 
          sx={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}
        >
          <BoltIcon sx={{ color: "primary.main", mr: 1, fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, background: "linear-gradient(90deg, #00e5ff 0%, #b400ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Superchat
          </Typography>
        </Box>

        {/* Links */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3, mx: "auto", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          <Button component={RouterLink} to="/" color="inherit" sx={{ fontWeight: 600 }}>
            Home
          </Button>
          <Button component={RouterLink} to="/leaderboard" color="inherit" sx={{ fontWeight: 600 }}>
            Leaderboard
          </Button>
          {isAuthenticated && (
            <Button component={RouterLink} to="/settings" color="inherit" sx={{ fontWeight: 600 }}>
              Settings
            </Button>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ "& .wallet-adapter-button": { height: "40px", borderRadius: "8px", fontWeight: 600, px: 2 } }}>
             <WalletMultiButton />
          </Box>

          {connected && !isAuthenticated && (
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={login} 
              disabled={isLoading}
              sx={{ height: 40 }}
            >
              {isLoading ? "Signing..." : "Sign In"}
            </Button>
          )}

          {isAuthenticated && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip 
                icon={<CheckCircleIcon />} 
                label="Verified" 
                color="success" 
                variant="outlined" 
                size="small" 
                sx={{ display: { xs: "none", sm: "flex" } }} 
              />
              <IconButton color="error" onClick={logout} size="small" title="Logout">
                <LogoutIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
