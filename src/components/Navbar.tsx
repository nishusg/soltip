// ============================================================================
// Navbar Component — Navbar.tsx
// ============================================================================
//
// A refined, premium Web3 header navigation bar.
// Integrates:
//   1. "Resources" glassmorphic Dropdown Menu: Combines Pricing, Security, Blog,
//      and OBS Setup under a single beautiful card with dynamic icons & subtexts.
//   2. Conic glow brand logo with rotation hover effects
//   3. High-conversion glowing "Authenticate Creator Profile" button
//   4. Glassmorphic "Creator Control Hub Panel" for logged-in creators
//   5. Dynamic Boring Avatars, Gold Member badge, and Go Gold conversion sweeps
//   6. Beautifully structured and polished Mobile drawer
// ============================================================================

import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Box, 
  Typography, 
  Chip, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Divider, 
  useTheme, 
  useMediaQuery, 
  Dialog, 
  Tooltip,
  Stack,
  Menu,
  MenuItem
} from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DiamondIcon from "@mui/icons-material/Diamond";
import SettingsIcon from "@mui/icons-material/Settings";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PaymentsIcon from "@mui/icons-material/Payments";
import ShieldIcon from "@mui/icons-material/Shield";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MonitorIcon from "@mui/icons-material/Monitor";
import BoringAvatar from "boring-avatars";
import TipForm from "../forms/TipForm";
import SubscriptionModal from "./SubscriptionModal";

export default function Navbar() {
  const { connected, isAuthenticated, login, logout, isLoading, walletAddress, shortAddress, user } = useWalletAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  
  // Dropdown menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  // Theme-aware palette colors
  const brandColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary?.main || brandColor;

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Swapping nav links (landing vs creator workflow)
  const navItems = [
    { label: "Home", path: "/" },
    ...(isAuthenticated ? [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Activity", path: "/activity" },
      { label: "Leaderboard", path: "/leaderboard" }
    ] : [
      { label: "How It Works", path: "/how-it-works" }
    ])
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  const isDropdownActive = () => {
    const dropdownPaths = ["/pricing", "/security", "/blog", "/obs-overlay"];
    return dropdownPaths.some(path => location.pathname.startsWith(path));
  };

  const resources = [
    {
      label: "Pricing & Fees",
      desc: "Flat 5% cut with zero monthly gas holds",
      path: "/pricing",
      icon: <PaymentsIcon className="menu-icon" sx={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }} />
    },
    {
      label: "Security & Trust",
      desc: "100% Non-custodial cryptographic safety",
      path: "/security",
      icon: <ShieldIcon className="menu-icon" sx={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }} />
    },
    {
      label: "Blog Hub",
      desc: "Streamer insights & crypto tipping manuals",
      path: "/blog",
      icon: <MenuBookIcon className="menu-icon" sx={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }} />
    },
    {
      label: "OBS Setup",
      desc: "Low-latency alert browser overlay integrations",
      path: "/obs-overlay",
      icon: <MonitorIcon className="menu-icon" sx={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }} />
    }
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.default + "cc", // Soft glassmorphic backdrop
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        zIndex: 1100,
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.25)"
      }}
    >
      {/* Dynamic Top Neon Border glow matching brand skin */}
      <Box sx={{ height: "3px", width: "100%", background: `linear-gradient(90deg, ${brandColor} 0%, ${secondaryColor} 100%)` }} />

      <Toolbar sx={{ justifyContent: "space-between", py: 1.5, px: { xs: 2.5, md: 4 } }}>
        
        {/* Conic Glow Brand Logo */}
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
            cursor: "pointer",
            "&:hover .brand-icon-box": { 
              transform: "scale(1.05)",
              boxShadow: `0 0 30px ${brandColor}99`
            },
            "&:hover .brand-text": {
              letterSpacing: "-0.01em"
            }
          }}
        >
          <Box
            className="brand-icon-box"
            sx={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${brandColor} 0%, ${secondaryColor} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 1.8,
              boxShadow: `0 0 20px ${brandColor}4d`,
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              position: "relative"
            }}
          >
            <BoltIcon sx={{ color: "#000", fontSize: 28 }} />
          </Box>
          <Typography
            className="brand-text"
            variant="h5"
            sx={{
              fontWeight: 950,
              letterSpacing: "-0.03em",
              background: "linear-gradient(90deg, #fff 0%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "Space Grotesk, sans-serif",
              transition: "letter-spacing 0.3s ease"
            }}
          >
            SolChat
          </Typography>
        </Box>

        {/* Dynamic Primary Nav links (Home/Dashboard + Resources Dropdown) */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              p: 0.5,
              borderRadius: "16px",
              bgcolor: "rgba(255,255,255,0.01)",
              border: "1px solid rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)",
              alignItems: "center"
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
                    px: 2.2,
                    py: 0.8,
                    borderRadius: "12px",
                    fontWeight: active ? 800 : 600,
                    fontSize: "0.88rem",
                    color: active ? "#fff" : "rgba(255,255,255,0.6)",
                    bgcolor: active ? "rgba(255,255,255,0.04)" : "transparent",
                    border: active ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.06)",
                      color: "#fff",
                      borderColor: "rgba(255,255,255,0.08)"
                    }
                  }}
                >
                  {item.label}
                </Button>
              );
            })}

            {/* Resources Dropdown Trigger */}
            <Button
              aria-controls={openMenu ? 'resources-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? 'true' : undefined}
              onClick={handleOpenMenu}
              endIcon={<KeyboardArrowDownIcon sx={{ transition: "transform 0.3s", transform: openMenu ? "rotate(180deg)" : "rotate(0)" }} />}
              sx={{
                px: 2.2,
                py: 0.8,
                borderRadius: "12px",
                fontWeight: openMenu || isDropdownActive() ? 800 : 600,
                fontSize: "0.88rem",
                color: openMenu || isDropdownActive() ? brandColor : "rgba(255,255,255,0.6)",
                bgcolor: openMenu || isDropdownActive() ? "rgba(255,255,255,0.04)" : "transparent",
                border: openMenu || isDropdownActive() ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.06)",
                  color: brandColor,
                  borderColor: "rgba(255,255,255,0.08)"
                }
              }}
            >
              Resources
            </Button>

            {/* Resources Menu Dropdown Card */}
            <Menu
              id="resources-menu"
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              slotProps={{
                list: {
                  sx: { py: 1 }
                },
                paper: {
                  sx: {
                    bgcolor: "rgba(8, 9, 12, 0.96)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "20px",
                    mt: 1.5,
                    minWidth: 320,
                    boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 30px ${brandColor}0a`
                  }
                }
              }}
            >
              {resources.map((res, idx) => (
                <MenuItem
                  key={idx}
                  component={RouterLink}
                  to={res.path}
                  onClick={handleCloseMenu}
                  sx={{
                    py: 1.8,
                    px: 2.5,
                    borderRadius: "14px",
                    mx: 1.2,
                    mb: idx === resources.length - 1 ? 0 : 0.8,
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: `${brandColor}0d`,
                      "& .menu-icon": { color: brandColor }
                    }
                  }}
                >
                  <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Box sx={{ display: "flex", mt: 0.2 }}>
                      {res.icon}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 850, color: "#fff", fontFamily: "Space Grotesk" }}>
                        {res.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.3, fontSize: "0.72rem" }}>
                        {res.desc}
                      </Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              ))}
            </Menu>

          </Box>
        )}

        {/* Right Side Actions & Authentication controls */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          
          {/* Send Tip (when connected) */}
          {connected && !isMobile && (
            <Button
              variant="contained"
              onClick={() => setTipModalOpen(true)}
              startIcon={<BoltIcon sx={{ color: "#000" }} />}
              sx={{
                height: 42,
                borderRadius: "12px",
                fontWeight: 800,
                fontSize: "0.85rem",
                bgcolor: brandColor,
                color: "#000",
                boxShadow: `0 4px 15px ${brandColor}40`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  bgcolor: brandColor,
                  transform: "translateY(-1px)",
                  boxShadow: `0 6px 20px ${brandColor}66`
                }
              }}
            >
              Send Tip
            </Button>
          )}

          {/* Standard Web3 Wallet Adapter Button */}
          <Box 
            sx={{
              display: "block",
              "& .wallet-adapter-button": {
                height: "42px",
                borderRadius: "12px",
                fontWeight: 700,
                px: { xs: 1.5, md: 2.5 },
                fontSize: { xs: "0.78rem", md: "0.88rem" },
                background: "rgba(255,255,255,0.03) !important",
                border: "1px solid rgba(255,255,255,0.06) !important",
                transition: "all 0.3s ease !important",
                "&:hover": {
                  background: "rgba(255,255,255,0.08) !important",
                  borderColor: "rgba(255,255,255,0.12) !important",
                  transform: "translateY(-1px)"
                }
              }
            }}
          >
            <WalletMultiButton />
          </Box>

          {/* High-Conversion glowing signature prompt */}
          {connected && !isAuthenticated && !isMobile && (
            <Button
              variant="contained"
              onClick={login}
              disabled={isLoading}
              startIcon={<VpnKeyIcon sx={{ color: "#000", fontSize: "0.9rem" }} />}
              sx={{
                height: 42,
                borderRadius: "12px",
                fontWeight: 800,
                fontSize: "0.85rem",
                background: `linear-gradient(135deg, ${brandColor} 0%, ${secondaryColor} 100%)`,
                color: "#000",
                boxShadow: `0 0 15px ${brandColor}66`,
                transition: "all 0.3s ease",
                "&:hover": { 
                  transform: "translateY(-1px)",
                  boxShadow: `0 0 25px ${brandColor}99`
                }
              }}
            >
              {isLoading ? "Signing..." : "Authenticate Profile"}
            </Button>
          )}

          {/* Dynamic Creator Control Hub Capsule (Authenticated) */}
          {isAuthenticated && !isMobile && (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              
              {/* Profile glass Capsule */}
              <Stack 
                direction="row" 
                spacing={1.8} 
                component={RouterLink}
                to={`/profile/${walletAddress}`}
                sx={{ 
                  alignItems: "center", 
                  p: 0.4, 
                  pl: 0.4, 
                  pr: 2, 
                  borderRadius: "16px", 
                  bgcolor: "rgba(255,255,255,0.02)", 
                  border: "1px solid rgba(255,255,255,0.06)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.05)",
                    borderColor: `${brandColor}44`,
                    boxShadow: `0 0 15px ${brandColor}0a`
                  }
                }}
              >
                {/* Boring Avatar */}
                <Box sx={{ width: 34, height: 34, borderRadius: "10px", overflow: "hidden", display: "flex" }}>
                  <BoringAvatar 
                    size={34} 
                    name={user?.username || walletAddress || "guest"} 
                    variant="marble" 
                    colors={[brandColor, secondaryColor, "#00F0FF", "#FF007A", "#FFB800"]} 
                  />
                </Box>
                
                <Box>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#fff", fontSize: "0.85rem", lineHeight: 1.1 }}>
                      {user?.username || shortAddress}
                    </Typography>
                    <CheckCircleIcon sx={{ color: "success.main", fontSize: "0.95rem" }} />
                  </Stack>
                  
                  {user?.is_premium ? (
                    <Typography variant="caption" sx={{ color: "#FFD700", fontWeight: 900, fontSize: "0.68rem", display: "flex", alignItems: "center", gap: 0.3 }}>
                      GOLD MEMBER 👑
                    </Typography>
                  ) : (
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.68rem" }}>
                      Standard Creator
                    </Typography>
                  )}
                </Box>
              </Stack>

              {/* Gold subscription sweep trigger */}
              {!user?.is_premium ? (
                <Tooltip title="Unlock Gold Theme & Custom Skins" arrow>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setSubModalOpen(true)}
                    startIcon={<DiamondIcon sx={{ color: "#000", fontSize: "0.85rem !important" }} />}
                    sx={{
                      height: 38,
                      borderRadius: "10px",
                      fontWeight: 900,
                      fontSize: "0.75rem",
                      px: 2,
                      background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                      color: "#000",
                      boxShadow: "0 0 10px rgba(255, 215, 0, 0.2)",
                      transition: "all 0.2s",
                      "&:hover": {
                        background: "linear-gradient(135deg, #ffea00 0%, #ffb400 100%)",
                        transform: "scale(1.03)",
                        boxShadow: "0 0 18px rgba(255, 215, 0, 0.4)"
                      }
                    }}
                  >
                    Go Gold 👑
                  </Button>
                </Tooltip>
              ) : (
                <Tooltip title="Premium Gold Enabled" arrow>
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
              )}

              {/* Utility actions */}
              <Stack direction="row" spacing={0.8} sx={{ alignItems: "center" }}>
                {/* Settings gears icon */}
                <Tooltip title="Creator Profile Settings" arrow>
                  <IconButton
                    component={RouterLink}
                    to="/settings"
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "10px",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      bgcolor: "rgba(255, 255, 255, 0.02)",
                      color: "text.secondary",
                      transition: "all 0.2s",
                      "&:hover": {
                        color: brandColor,
                        borderColor: brandColor,
                        bgcolor: `${brandColor}08`
                      }
                    }}
                  >
                    <SettingsIcon sx={{ fontSize: "1.1rem" }} />
                  </IconButton>
                </Tooltip>

                {/* Logout trigger */}
                <Tooltip title="Sign Out Profile" arrow>
                  <IconButton
                    onClick={logout}
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "10px",
                      border: "1px solid rgba(239, 68, 68, 0.15)",
                      bgcolor: "rgba(239, 68, 68, 0.03)",
                      color: "error.main",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "rgba(239, 68, 68, 0.08)",
                        borderColor: "rgba(239, 68, 68, 0.4)",
                        transform: "scale(1.03)"
                      }
                    }}
                  >
                    <LogoutIcon sx={{ fontSize: "1.1rem" }} />
                  </IconButton>
                </Tooltip>
              </Stack>

            </Stack>
          )}

          {/* Mobile drawer trigger */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setMobileOpen(true)}
              sx={{
                bgcolor: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.06)",
                p: 1
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

        </Stack>
      </Toolbar>

      {/* Structured Mobile Drawer */}
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
            width: 310,
            background: "rgba(10, 10, 15, 0.96)",
            backdropFilter: "blur(30px)",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "-10px 0 45px rgba(0,0,0,0.6)"
          },
        }}
      >
        <Box sx={{ p: 3.5, display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
          
          {/* Header Mobile Drawer */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box 
                sx={{ 
                  width: 32, height: 32, borderRadius: "8px", 
                  background: `linear-gradient(135deg, ${brandColor} 0%, ${secondaryColor} 100%)`, 
                  display: "flex", alignItems: "center", justifyContent: "center", mr: 1.5 
                }}
              >
                <BoltIcon sx={{ color: "#000", fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 950, fontFamily: "Space Grotesk" }}>SolChat Menu</Typography>
            </Box>
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: "text.secondary" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Primary Mobile Navigation links */}
          <List>
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={RouterLink}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: "12px",
                      bgcolor: active ? "rgba(255,255,255,0.04)" : "transparent",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.06)" }
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      slotProps={{ primary: { sx: { fontWeight: active ? 800 : 600, color: active ? brandColor : "text.primary", fontSize: "0.92rem" } } }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ my: 2, opacity: 0.08 }} />

          {/* Mobile Dropdown Sub-menu Resources links */}
          <Typography variant="overline" sx={{ fontWeight: 900, px: 2, py: 1, letterSpacing: "0.15em", color: brandColor, fontSize: "0.68rem" }}>
            Explore Resources
          </Typography>
          
          <List sx={{ mb: 2 }}>
            {resources.map((res, idx) => {
              const active = isActive(res.path);
              return (
                <ListItem key={idx} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={RouterLink}
                    to={res.path}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: "12px",
                      bgcolor: active ? "rgba(255,255,255,0.04)" : "transparent",
                      py: 1,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.06)" }
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                      <Box sx={{ display: "flex", color: active ? brandColor : "text.secondary" }}>
                        {res.icon}
                      </Box>
                      <ListItemText
                        primary={res.label}
                        secondary={res.desc}
                        slotProps={{ 
                          primary: { sx: { fontWeight: active ? 800 : 700, color: active ? "#fff" : "text.primary", fontSize: "0.88rem" } },
                          secondary: { sx: { fontSize: "0.68rem", color: "text.secondary" } }
                        }}
                      />
                    </Stack>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ my: 2, opacity: 0.08 }} />

          {/* Mobile Profile & Authorization Actions Drawer Footer */}
          <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
            
            {/* Authenticated User mobile Capsule */}
            {isAuthenticated && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                
                {/* Mobile User Summary capsule */}
                <Stack 
                  direction="row" 
                  spacing={2} 
                  sx={{ 
                    p: 2, 
                    borderRadius: "16px", 
                    bgcolor: "rgba(255,255,255,0.02)", 
                    border: "1px solid rgba(255,255,255,0.05)",
                    alignItems: "center" 
                  }}
                >
                  <Box sx={{ width: 38, height: 38, borderRadius: "10px", overflow: "hidden", display: "flex" }}>
                    <BoringAvatar 
                      size={38} 
                      name={user?.username || walletAddress || "guest"} 
                      variant="marble" 
                      colors={[brandColor, secondaryColor, "#00F0FF", "#FF007A", "#FFB800"]} 
                    />
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#fff" }}>
                        {user?.username || shortAddress}
                      </Typography>
                      <CheckCircleIcon sx={{ color: "success.main", fontSize: "1rem" }} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {user?.is_premium ? "Gold Premium Member 👑" : "Standard Verified Creator"}
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  component={RouterLink}
                  to={`/profile/${walletAddress}`}
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => setMobileOpen(false)}
                  sx={{ py: 1.5, borderRadius: "12px", fontWeight: 800 }}
                  startIcon={<PersonIcon />}
                >
                  My Public Profile
                </Button>

                <Button
                  component={RouterLink}
                  to="/settings"
                  variant="outlined"
                  color="inherit"
                  fullWidth
                  onClick={() => setMobileOpen(false)}
                  sx={{ py: 1.5, borderRadius: "12px", fontWeight: 800, color: "text.secondary" }}
                  startIcon={<SettingsIcon />}
                >
                  Profile Settings
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
                      borderRadius: "12px",
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                      color: "#000",
                      boxShadow: "0 0 15px rgba(255, 215, 0, 0.3)"
                    }}
                    startIcon={<DiamondIcon />}
                  >
                    Go Premium Gold 👑
                  </Button>
                )}
              </Box>
            )}

            {/* Send Tip trigger */}
            {connected && (
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setMobileOpen(false);
                  setTipModalOpen(true);
                }}
                sx={{
                  py: 1.5, 
                  borderRadius: "12px", 
                  fontWeight: 800,
                  bgcolor: brandColor,
                  color: "#000",
                  boxShadow: `0 4px 15px ${brandColor}4d`
                }}
              >
                Send Tip
              </Button>
            )}

            {/* Connected but unauthenticated signature trigger */}
            {connected && !isAuthenticated && (
              <Button
                variant="contained"
                fullWidth
                onClick={login}
                sx={{ 
                  py: 1.5, 
                  borderRadius: "12px", 
                  fontWeight: 800, 
                  background: `linear-gradient(135deg, ${brandColor} 0%, ${secondaryColor} 100%)`,
                  color: "#000",
                  boxShadow: `0 0 15px ${brandColor}66`
                }}
              >
                Authenticate Profile
              </Button>
            )}

            {/* Authenticated Logout */}
            {isAuthenticated && (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                sx={{ py: 1.5, borderRadius: "12px", fontWeight: 800, borderColor: "rgba(239, 68, 68, 0.3)" }}
                startIcon={<LogoutIcon />}
              >
                Sign Out
              </Button>
            )}

          </Box>

        </Box>
      </Drawer>

      {/* Tipping Dialog Modal */}
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

      {/* Premium Subscription Modal */}
      <SubscriptionModal
        open={subModalOpen}
        onClose={() => setSubModalOpen(false)}
      />
    </AppBar>
  );
}
