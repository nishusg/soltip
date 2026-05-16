import { Link as RouterLink, useLocation } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { AppBar, Toolbar, Button, Box, Typography, Chip, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, useTheme, useMediaQuery, Dialog } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import TipForm from "../forms/TipForm";

export default function Navbar() {
  const { connected, isAuthenticated, login, logout, isLoading, walletAddress } = useWalletAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/" },
    ...(isAuthenticated ? [
      { label: "Leaderboard", path: "/leaderboard" },
      { label: "Activity", path: "/activity" },
      { label: "Dashboard", path: "/dashboard" },
      { label: "Settings", path: "/settings" }
    ] : [])
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: "rgba(10, 10, 15, 0.75)", 
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        zIndex: 1100,
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)"
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
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": { transform: "scale(1.05)" }
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #14F195 0%, #9945FF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 2,
              boxShadow: "0 0 20px rgba(20, 241, 149, 0.4)",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                borderRadius: "14px",
                boxShadow: "inset 0 0 10px rgba(255,255,255,0.4)",
                pointerEvents: "none"
              }
            }}
          >
            <BoltIcon sx={{ color: "#fff", fontSize: 30 }} />
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 900, 
              letterSpacing: "-0.03em",
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
            borderRadius: "16px",
            bgcolor: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)"
          }}
        >
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Button 
                key={item.label}
                component={RouterLink} 
                to={item.path}
                sx={{ 
                  px: 3,
                  py: 1,
                  borderRadius: "12px",
                  fontWeight: active ? 800 : 600,
                  color: active ? "#fff" : "rgba(255,255,255,0.6)",
                  bgcolor: active ? "rgba(255,255,255,0.08)" : "transparent",
                  transition: "all 0.2s ease",
                  "&:hover": { 
                    bgcolor: active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                    color: "#fff"
                  }
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* Actions - Hidden on mobile (< md), shown in drawer instead */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2.5, md: 2 } }}>
          <Button
            variant="contained"
            onClick={() => setTipModalOpen(true)}
            sx={{
              height: 44,
              borderRadius: "14px",
              fontWeight: 800,
              background: "linear-gradient(135deg, #14F195 0%, #9945FF 100%)",
              color: "#fff",
              display: { xs: "none", md: "flex" },
              boxShadow: "0 4px 15px rgba(20, 241, 149, 0.3)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": { 
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(20, 241, 149, 0.5)",
              }
            }}
          >
            Send Tip
          </Button>

          <Box sx={{ 
            display: "block", // Always show the wallet button
            "& .wallet-adapter-button": { 
              height: { xs: "38px", md: "44px" }, 
              borderRadius: "14px", 
              fontWeight: 700, 
              px: { xs: 1.5, md: 3 },
              fontSize: { xs: "0.8rem", md: "0.95rem" },
              background: "rgba(255,255,255,0.05) !important",
              border: "1px solid rgba(255,255,255,0.1) !important",
              transition: "all 0.3s ease !important",
              "&:hover": {
                background: "rgba(255,255,255,0.1) !important",
                borderColor: "rgba(255,255,255,0.2) !important",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.2) !important"
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
              sx={{ 
                height: 44, 
                borderRadius: "14px", 
                fontWeight: 700,
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                display: { xs: "none", md: "flex" },
                color: "#fff",
                "&:hover": { background: "rgba(255,255,255,0.15)" }
              }}
            >
              {isLoading ? "Signing..." : "Sign In"}
            </Button>
          )}

          {isAuthenticated && (
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1.5 }}>
              <Button
                component={RouterLink}
                to={`/profile/${walletAddress}`}
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<PersonIcon />}
                sx={{ 
                  height: 38,
                  borderRadius: "10px", 
                  fontWeight: 700, 
                  px: 2,
                  borderColor: "rgba(20, 241, 149, 0.3)",
                  "&:hover": { borderColor: "#14F195", bgcolor: "rgba(20, 241, 149, 0.05)" }
                }}
              >
                My Profile
              </Button>
              <Chip 
                icon={<CheckCircleIcon sx={{ fontSize: "1.1rem !important" }} />} 
                label="Verified" 
                color="success" 
                variant="outlined" 
                size="medium" 
                sx={{ 
                  height: 38,
                  borderRadius: "10px",
                  fontWeight: 700,
                  bgcolor: "rgba(16, 185, 129, 0.05)",
                  borderColor: "rgba(16, 185, 129, 0.2)",
                  boxShadow: "0 0 10px rgba(16, 185, 129, 0.1)"
                }} 
              />
              <IconButton 
                onClick={logout} 
                size="medium" 
                title="Logout"
                sx={{ 
                  width: 38,
                  height: 38,
                  bgcolor: "rgba(239, 68, 68, 0.05)",
                  color: "error.main",
                  borderRadius: "10px",
                  border: "1px solid rgba(239, 68, 68, 0.1)",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "rgba(239, 68, 68, 0.1)",
                    borderColor: "rgba(239, 68, 68, 0.3)",
                    transform: "scale(1.05)"
                  }
                }}
              >
                <LogoutIcon fontSize="small" />
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
                bgcolor: "rgba(255,255,255,0.05)", 
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                p: 1
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
            width: 300,
            background: "rgba(10, 10, 15, 0.95)",
            backdropFilter: "blur(24px)",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "-10px 0 40px rgba(0,0,0,0.5)"
          },
        }}
      >
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
             <Box sx={{ display: "flex", alignItems: "center" }}>
               <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: "linear-gradient(135deg, #14F195 0%, #9945FF 100%)", display: "flex", alignItems: "center", justifyContent: "center", mr: 1.5 }}>
                 <BoltIcon sx={{ color: "#fff", fontSize: 20 }} />
               </Box>
               <Typography variant="h6" sx={{ fontWeight: 900 }}>Menu</Typography>
             </Box>
             <IconButton onClick={() => setMobileOpen(false)} sx={{ color: "text.secondary" }}>
               <CloseIcon />
             </IconButton>
          </Box>

          <List sx={{ flexGrow: 1 }}>
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton 
                    component={RouterLink} 
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    sx={{ 
                      borderRadius: "12px",
                      bgcolor: active ? "rgba(255,255,255,0.05)" : "transparent",
                      border: active ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.08)" }
                    }}
                  >
                    <ListItemText 
                      primary={item.label} 
                      slotProps={{ primary: { sx: { fontWeight: active ? 800 : 600, color: active ? "#fff" : "text.secondary" } } }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ my: 3, opacity: 0.1 }} />

          <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
             {isAuthenticated && (
               <Button
                 component={RouterLink}
                 to={`/profile/${walletAddress}`}
                 variant="outlined"
                 color="primary"
                 fullWidth
                 onClick={() => setMobileOpen(false)}
                 sx={{ py: 1.5, borderRadius: "14px", fontWeight: 800, borderColor: "rgba(20, 241, 149, 0.3)", color: "#14F195" }}
                 startIcon={<PersonIcon />}
               >
                 My Profile
               </Button>
             )}

             <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setMobileOpen(false);
                  setTipModalOpen(true);
                }}
                sx={{
                  py: 1.5, borderRadius: "14px", fontWeight: 800,
                  background: "linear-gradient(135deg, #14F195 0%, #9945FF 100%)",
                  color: "#fff",
                  boxShadow: "0 4px 15px rgba(20, 241, 149, 0.3)"
                }}
             >
                Send Tip
             </Button>

             {connected && !isAuthenticated && (
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={login} 
                  sx={{ py: 1.5, borderRadius: "14px", fontWeight: 800, bgcolor: "rgba(255,255,255,0.1)", color: "#fff" }}
                >
                  Sign In
                </Button>
             )}

             {isAuthenticated && (
                <Button 
                  variant="outlined" 
                  color="error"
                  fullWidth 
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  sx={{ py: 1.5, borderRadius: "14px", fontWeight: 800, borderColor: "rgba(239, 68, 68, 0.3)" }}
                  startIcon={<LogoutIcon />}
                >
                  Logout
                </Button>
             )}
          </Box>
        </Box>
      </Drawer>

      {/* Tipping Modal */}
      <Dialog
        open={tipModalOpen}
        onClose={() => setTipModalOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            background: "transparent",
            boxShadow: "none",
            m: 2
          }
        }}
      >
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={() => setTipModalOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              zIndex: 10,
              color: "text.secondary",
              bgcolor: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(10px)",
              transition: "all 0.2s",
              "&:hover": { bgcolor: "rgba(0,0,0,0.8)", color: "#fff", transform: "scale(1.1)" }
            }}
          >
            <CloseIcon />
          </IconButton>
          <TipForm />
        </Box>
      </Dialog>
    </AppBar>
  );
}
