import { Link as RouterLink } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { AppBar, Toolbar, Button, Box, Typography, Chip, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, useTheme, useMediaQuery } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";

export default function Navbar() {
  const { connected, isAuthenticated, login, logout, isLoading, walletAddress } = useWalletAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Leaderboard", path: "/leaderboard" },
    ...(isAuthenticated ? [
      { label: "Activity", path: "/activity" },
      { label: "Dashboard", path: "/dashboard" },
      { label: "Settings", path: "/settings" }
    ] : [])
  ];

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: "rgba(5, 5, 8, 0.7)", 
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        zIndex: 1100
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 1.5, px: { xs: 2, md: 4 } }}>
        {/* Brand */}
        <Box 
          component={RouterLink} 
          to="/" 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            textDecoration: "none", 
            color: "inherit",
            transition: "opacity 0.2s",
            "&:hover": { opacity: 0.8 }
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #00f2ff 0%, #7000ff 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 1.5,
              boxShadow: "0 0 20px rgba(0, 242, 255, 0.3)"
            }}
          >
            <BoltIcon sx={{ color: "#fff", fontSize: 28 }} />
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 800, 
              letterSpacing: "-0.02em",
              background: "linear-gradient(90deg, #fff 0%, #a0a0b0 100%)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent" 
            }}
          >
            SolChat
          </Typography>
        </Box>

        {/* Links */}
        <Box 
          sx={{ 
            display: { xs: "none", md: "flex" }, 
            gap: 1, 
            p: 0.5,
            borderRadius: "12px",
            bgcolor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)"
          }}
        >
          <Button 
            component={RouterLink} 
            to="/" 
            color="inherit" 
            sx={{ 
              px: 3,
              borderRadius: "10px",
              fontWeight: 600,
              "&:hover": { bgcolor: "rgba(255,255,255,0.05)" }
            }}
          >
            Home
          </Button>
          <Button 
            component={RouterLink} 
            to="/leaderboard" 
            color="inherit" 
            sx={{ 
              px: 3,
              borderRadius: "10px",
              fontWeight: 600,
              "&:hover": { bgcolor: "rgba(255,255,255,0.05)" }
            }}
          >
            Leaderboard
          </Button>
          {isAuthenticated && (
            <>
              <Button 
                component={RouterLink} 
                to="/activity" 
                color="inherit" 
                sx={{ 
                  px: 3,
                  borderRadius: "10px",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.05)" }
                }}
              >
                Activity
              </Button>
              <Button 
                component={RouterLink} 
                to="/dashboard" 
                color="inherit" 
                sx={{ 
                  px: 3,
                  borderRadius: "10px",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.05)" }
                }}
              >
                Dashboard
              </Button>
              <Button 
                component={RouterLink} 
                to="/settings" 
                color="inherit" 
                sx={{ 
                  px: 3,
                  borderRadius: "10px",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.05)" }
                }}
              >
                Settings
              </Button>
            </>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
          <Box sx={{ 
            display: { xs: "none", sm: "block" },
            "& .wallet-adapter-button": { 
              height: "42px", 
              borderRadius: "10px", 
              fontWeight: 600, 
              px: 3,
              fontSize: "0.9rem",
              background: "rgba(255,255,255,0.05) !important",
              border: "1px solid rgba(255,255,255,0.1) !important",
              transition: "all 0.2s ease !important",
              "&:hover": {
                background: "rgba(255,255,255,0.1) !important",
                borderColor: "rgba(255,255,255,0.2) !important",
                transform: "translateY(-1px)"
              }
            } 
          }}>
             <WalletMultiButton />
          </Box>

          {connected && !isAuthenticated && (
            <Button 
              variant="contained" 
              onClick={login} 
              disabled={isLoading}
              sx={{ height: 42 }}
            >
              {isLoading ? "Signing..." : "Sign In"}
            </Button>
          )}

          {isAuthenticated && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Button
                component={RouterLink}
                to={`/profile/${useWalletAuth().walletAddress}`}
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<PersonIcon />}
                sx={{ 
                  borderRadius: "10px", 
                  fontWeight: 700, 
                  px: 2,
                  display: { xs: "none", sm: "flex" }
                }}
              >
                My Profile
              </Button>
              <Chip 
                icon={<CheckCircleIcon sx={{ fontSize: "1.2rem !important" }} />} 
                label="Verified" 
                color="success" 
                variant="outlined" 
                size="medium" 
                sx={{ 
                  display: { xs: "none", sm: "flex" },
                  borderRadius: "10px",
                  fontWeight: 600,
                  bgcolor: "rgba(16, 185, 129, 0.05)",
                  borderColor: "rgba(16, 185, 129, 0.2)"
                }} 
              />
              <IconButton 
                onClick={logout} 
                size="medium" 
                title="Logout"
                sx={{ 
                  bgcolor: "rgba(239, 68, 68, 0.05)",
                  color: "error.main",
                  borderRadius: "10px",
                  border: "1px solid rgba(239, 68, 68, 0.1)",
                  "&:hover": {
                    bgcolor: "rgba(239, 68, 68, 0.1)",
                    borderColor: "rgba(239, 68, 68, 0.2)"
                  }
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          )}

          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ 
                bgcolor: "rgba(255,255,255,0.03)", 
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.05)"
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { 
            boxSizing: "border-box", 
            width: 280,
            background: "rgba(10, 10, 15, 0.95)",
            backdropFilter: "blur(20px)",
            borderLeft: "1px solid rgba(255,255,255,0.08)"
          },
        }}
      >
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
             <BoltIcon sx={{ color: "primary.main", mr: 1 }} />
             <Typography variant="h6" sx={{ fontWeight: 800 }}>Menu</Typography>
          </Box>

          <List sx={{ flexGrow: 1 }}>
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                  component={RouterLink} 
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  sx={{ 
                    borderRadius: "12px",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.05)" }
                  }}
                >
                  <ListItemText 
                    primary={item.label} 
                    slotProps={{ primary: { sx: { fontWeight: 600 } } }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2, opacity: 0.1 }} />

          <Box sx={{ mt: "auto" }}>
             <WalletMultiButton />
             {connected && !isAuthenticated && (
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={login} 
                  sx={{ mt: 2, py: 1.5, borderRadius: "12px" }}
                >
                  Sign In
                </Button>
             )}
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
}
