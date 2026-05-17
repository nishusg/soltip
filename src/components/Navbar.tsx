import { Link as RouterLink, useLocation } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { AppBar, Toolbar, Button, Box, Typography, Chip, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, useTheme, useMediaQuery, Dialog, Tooltip } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import TipForm from "../forms/TipForm";
import SubscriptionModal from "./SubscriptionModal";
import DiamondIcon from "@mui/icons-material/Diamond";

export default function Navbar() {
  const { connected, isAuthenticated, login, logout, isLoading, walletAddress, user } = useWalletAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/" },
    ...(isAuthenticated ? [
      { label: "Leaderboard", path: "/leaderboard" },
      { label: "Activity", path: "/activity" },
      { label: "Dashboard", path: "/dashboard" }
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
        backgroundColor: theme.palette.background.default + "bf", // Use theme background with opacity
        backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${theme.palette.primary.main}1a`,
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
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 2,
              boxShadow: `0 0 20px ${theme.palette.primary.main}66`,
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
            <BoltIcon sx={{ color: theme.palette.mode === "dark" ? "#fff" : "#000", fontSize: 30 }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              letterSpacing: "-0.03em",
              background: `linear-gradient(90deg, #fff 0%, ${theme.palette.primary.main} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            SolChat
          </Typography>
        </Box>

        {/* Links */}
        {navItems.length > 1 && (
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
                    color: active ? theme.palette.primary.main : "rgba(255,255,255,0.6)",
                    bgcolor: active ? `${theme.palette.primary.main}1a` : "transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: active ? `${theme.palette.primary.main}26` : "rgba(255,255,255,0.05)",
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        )}

        {/* Actions - Hidden on mobile (< md), shown in drawer instead */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2.5, md: 2 } }}>
          {connected && (
            <Button
              variant="contained"
              onClick={() => setTipModalOpen(true)}
              sx={{
                height: 44,
                borderRadius: "14px",
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: theme.palette.mode === "dark" ? "#000" : "#fff",
                display: { xs: "none", md: "flex" },
                boxShadow: `0 4px 15px ${theme.palette.primary.main}4d`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 8px 25px ${theme.palette.primary.main}80`,
                }
              }}
            >
              Send Tip
            </Button>
          )}

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
              {/* Profile Icon Button */}
              <Tooltip title="My Profile" arrow>
                <IconButton
                  component={RouterLink}
                  to={`/profile/${walletAddress}`}
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "text.primary",
                    transition: "all 0.2s",
                    "&:hover": {
                      color: "primary.main",
                      borderColor: "primary.main",
                      bgcolor: "rgba(255, 255, 255, 0.05)"
                    }
                  }}
                >
                  <PersonIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* Premium & Verified Icons */}
              {user?.is_premium ? (
                <Tooltip title="Premium Member" arrow>
                  <IconButton
                    disableRipple
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "10px",
                      border: "1px solid rgba(255, 215, 0, 0.3)",
                      bgcolor: "rgba(255, 215, 0, 0.05)",
                      color: "#FFD700",
                      boxShadow: "0 0 15px rgba(255, 215, 0, 0.2)",
                      cursor: "default"
                    }}
                  >
                    <DiamondIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : (
                <>
                  <Tooltip title="Go Premium" arrow>
                    <IconButton
                      onClick={() => setSubModalOpen(true)}
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "10px",
                        background: "rgba(255, 215, 0, 0.1)",
                        border: "1px solid rgba(255, 215, 0, 0.3)",
                        color: "#FFD700",
                        boxShadow: "0 0 10px rgba(255, 215, 0, 0.15)",
                        transition: "all 0.2s",
                        "&:hover": {
                          background: "rgba(255, 215, 0, 0.2)",
                          borderColor: "#FFD700",
                          transform: "scale(1.05)"
                        }
                      }}
                    >
                      <DiamondIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Verified Account" arrow>
                    <IconButton
                      disableRipple
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "10px",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        bgcolor: "rgba(16, 185, 129, 0.05)",
                        color: "success.main",
                        cursor: "default"
                      }}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              {/* Logout Button */}
              <Tooltip title="Logout" arrow>
                <IconButton
                  onClick={logout}
                  size="medium"
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
              </Tooltip>
            </Box>
          )}

          {isMobile && connected && (
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
              <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", mr: 1.5 }}>
                <BoltIcon sx={{ color: "#fff", fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>Menu</Typography>
            </Box>
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: "text.secondary" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {navItems.length > 1 && (
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
          )}

          <Divider sx={{ my: 3, opacity: 0.1 }} />

          <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
            {isAuthenticated && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Chip
                  icon={user?.is_premium ? <DiamondIcon sx={{ fontSize: "1.1rem !important", color: "#FFD700 !important" }} /> : <CheckCircleIcon sx={{ fontSize: "1.1rem !important" }} />}
                  label={user?.is_premium ? "Premium Member" : "Verified Account"}
                  color={user?.is_premium ? "warning" : "success"}
                  variant="outlined"
                  size="medium"
                  sx={{
                    width: "100%",
                    height: 44,
                    borderRadius: "14px",
                    fontWeight: 700,
                    bgcolor: user?.is_premium ? "rgba(255, 215, 0, 0.05)" : "rgba(16, 185, 129, 0.05)",
                    borderColor: user?.is_premium ? "rgba(255, 215, 0, 0.3)" : "rgba(16, 185, 129, 0.2)",
                    boxShadow: user?.is_premium ? "0 0 15px rgba(255, 215, 0, 0.2)" : "0 0 10px rgba(16, 185, 129, 0.1)",
                    color: user?.is_premium ? "#FFD700" : "success.main"
                  }}
                />

                <Button
                  component={RouterLink}
                  to={`/profile/${walletAddress}`}
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => setMobileOpen(false)}
                  sx={{ py: 1.5, borderRadius: "14px", fontWeight: 800 }}
                  startIcon={<PersonIcon />}
                >
                  My Profile
                </Button>

                {!user?.is_premium && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                      setMobileOpen(false);
                      setSubModalOpen(true);
                    }}
                    sx={{
                      py: 1.5,
                      borderRadius: "14px",
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                      color: "#000",
                      boxShadow: "0 0 15px rgba(255, 215, 0, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #ffea00 0%, #ffb400 100%)"
                      }
                    }}
                    startIcon={<DiamondIcon />}
                  >
                    Go Premium
                  </Button>
                )}
              </Box>
            )}

            {connected && (
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setMobileOpen(false);
                  setTipModalOpen(true);
                }}
                sx={{
                  py: 1.5, borderRadius: "14px", fontWeight: 800,
                  background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
                  color: "#fff",
                  boxShadow: (theme) => `0 4px 15px ${theme.palette.primary.main}4d`
                }}
              >
                Send Tip
              </Button>
            )}

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
      {/* Subscription Modal */}
      <SubscriptionModal
        open={subModalOpen}
        onClose={() => setSubModalOpen(false)}
      />
    </AppBar>
  );
}
