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

import { useState, useEffect, useMemo, useCallback } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWalletAuth } from "../../hooks/useWalletAuth";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
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
// import DiamondIcon from "@mui/icons-material/Diamond";
import SettingsIcon from "@mui/icons-material/Settings";
import PaymentsIcon from "@mui/icons-material/Payments";
import ShieldIcon from "@mui/icons-material/Shield";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MonitorIcon from "@mui/icons-material/Monitor";
import BoringAvatar from "boring-avatars";
import TipForm from "../features/tips/TipForm";
import SubscriptionModal from "../features/subscription/SubscriptionModal";
import { SITE_NAME } from "../../shared/constants";


const resources = [
  {
    label: "How It Works",
    desc: "Complete step-by-step setup guides",
    path: "/how-it-works",
    icon: <BoltIcon className="menu-icon" sx={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }} />
  },
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

export default function Navbar() {
  const { connected, isAuthenticated, login, logout, isLoading, walletAddress, shortAddress, user } = useWalletAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);

  // Dropdown menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // Consolidated profile dropdown menu state
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const openProfileMenu = Boolean(profileAnchorEl);

  // Scroll detection state
  const [scrolled, setScrolled] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();

  // Theme-aware palette colors
  const brandColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary?.main || brandColor;

  useEffect(() => {
    let currentScrolled = false;
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== currentScrolled) {
        currentScrolled = isScrolled;
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };
  const handleCloseProfileMenu = () => {
    setProfileAnchorEl(null);
  };

  const handleNavClick = (path: string) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  };

  // Swapping nav links (landing vs creator workflow) - Memoized
  const navItems = useMemo(() => [
    { label: "Home", path: "/" },
    ...(isAuthenticated ? [
      { label: "Search", path: "/search" },
      { label: "Dashboard", path: "/dashboard" },
      { label: "Activity", path: "/activity" },
      { label: "Leaderboard", path: "/leaderboard" }
    ] : [])
  ], [isAuthenticated]);

  const isActive = useCallback((path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const isDropdownActive = useCallback(() => {
    const dropdownPaths = ["/pricing", "/security", "/blog", "/obs-overlay", "/how-it-works"];
    return dropdownPaths.some(path => location.pathname.startsWith(path));
  }, [location.pathname]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: scrolled
          ? (isMobile ? theme.palette.background.default : `${theme.palette.background.default}cc`)
          : "transparent",
        backdropFilter: scrolled && !isMobile ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        zIndex: 1100,
        boxShadow: scrolled && !isMobile ? "0 10px 40px rgba(0, 0, 0, 0.25)" : "none",
        transition: isMobile ? "background-color 0.2s ease" : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      {/* Dynamic bottom neon border that fades in when scrolled */}
      <Box
        sx={{
          height: "1.5px",
          width: "100%",
          background: `linear-gradient(90deg, transparent 0%, ${brandColor} 50%, transparent 100%)`,
          opacity: scrolled && !isMobile ? 0.7 : 0,
          transition: "opacity 0.3s ease",
          position: "absolute",
          bottom: 0,
          left: 0
        }}
      />

      <Toolbar sx={{ justifyContent: "space-between", py: 1.5, px: { xs: 2.5, md: 4 } }}>

        {/* Conic Glow Brand Logo */}
        <Box
          component={RouterLink}
          to="/"
          onClick={() => handleNavClick("/")}
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
            {SITE_NAME}

          </Typography>
        </Box>

        {/* Dynamic Primary Nav links (Home/Dashboard + Resources Dropdown) */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              p: 0.4,
              borderRadius: "14px",
              bgcolor: scrolled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              transition: "all 0.3s ease",
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
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    px: 2.2,
                    py: 0.8,
                    borderRadius: "10px",
                    fontWeight: active ? 750 : 500,
                    fontSize: "0.88rem",
                    color: active ? "#fff" : "rgba(255,255,255,0.55)",
                    transition: "all 0.2s ease",
                    position: "relative",
                    "&:hover": {
                      color: "#fff",
                      bgcolor: "rgba(255,255,255,0.04)"
                    },
                    "&::after": active ? {
                      content: '""',
                      position: "absolute",
                      bottom: "4px",
                      left: "20%",
                      right: "20%",
                      height: "2px",
                      borderRadius: "2px",
                      background: `linear-gradient(90deg, ${brandColor}, ${secondaryColor})`,
                      boxShadow: `0 0 10px ${brandColor}`
                    } : {}
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

              sx={{
                px: 2.2,
                py: 0.8,
                borderRadius: "10px",
                fontWeight: openMenu || isDropdownActive() ? 750 : 500,
                fontSize: "0.88rem",
                color: openMenu || isDropdownActive() ? "#fff" : "rgba(255,255,255,0.55)",
                transition: "all 0.2s ease",
                position: "relative",
                "&:hover": {
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.04)"
                },
                "&::after": isDropdownActive() ? {
                  content: '""',
                  position: "absolute",
                  bottom: "4px",
                  left: "20%",
                  right: "20%",
                  height: "2px",
                  borderRadius: "2px",
                  background: `linear-gradient(90deg, ${brandColor}, ${secondaryColor})`,
                  boxShadow: `0 0 10px ${brandColor}`
                } : {}
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
                    bgcolor: "rgba(8, 9, 12, 0.98) !important",
                    backdropFilter: "blur(24px) !important",
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
                  onClick={() => {
                    handleCloseMenu();
                    handleNavClick(res.path);
                  }}
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
              {isLoading ? "Signing..." : "Login"}
            </Button>
          )}

          {/* Dynamic Creator Control Hub Capsule (Authenticated) */}
          {isAuthenticated && !isMobile && (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>

              {/* Profile glass Capsule */}
              <Button
                aria-controls={openProfileMenu ? 'profile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openProfileMenu ? 'true' : undefined}
                onClick={handleOpenProfileMenu}

                sx={{
                  alignItems: "center",
                  p: 0.5,
                  pl: 0.5,
                  pr: 1.5,
                  borderRadius: "14px",
                  bgcolor: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  textTransform: "none",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.05)",
                    borderColor: `${brandColor}44`,
                    boxShadow: `0 0 15px ${brandColor}0a`
                  }
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", textAlign: "left" }}>
                  {/* Boring Avatar */}
                  <Box sx={{ width: 32, height: 32, borderRadius: "10px", overflow: "hidden", display: "flex" }}>
                    <BoringAvatar
                      size={32}
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
                  </Box>
                </Stack>
              </Button>

              {/* Consolidated profile dropdown menu */}
              <Menu
                id="profile-menu"
                anchorEl={profileAnchorEl}
                open={openProfileMenu}
                onClose={handleCloseProfileMenu}
                slotProps={{
                  list: {
                    sx: { py: 1 }
                  },
                  paper: {
                    sx: {
                      bgcolor: "rgba(8, 9, 12, 0.98) !important",
                      backdropFilter: "blur(24px) !important",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "20px",
                      mt: 1.5,
                      minWidth: 280,
                      boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 30px ${brandColor}0a`
                    }
                  }
                }}
              >
                {/* Header Section inside Menu */}
                <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid rgba(255,255,255,0.06)", mb: 1 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: "12px", overflow: "hidden", display: "flex" }}>
                      <BoringAvatar
                        size={40}
                        name={user?.username || walletAddress || "guest"}
                        variant="marble"
                        colors={[brandColor, secondaryColor, "#00F0FF", "#FF007A", "#FFB800"]}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 850, color: "#fff", lineHeight: 1.2 }}>
                        {user?.name || user?.username || "Creator"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                        {shortAddress}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Gold Member badge */}
                  {/* user?.is_premium && (
                    <Box sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                      py: 0.6,
                      px: 1,
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                      color: "#000",
                      border: "1px solid rgba(255, 215, 0, 0.4)",
                      boxShadow: "0 0 10px rgba(255, 215, 0, 0.25)"
                    }}>
                      <DiamondIcon sx={{ fontSize: "0.95rem" }} />
                      <Typography variant="caption" sx={{ fontWeight: 950, fontSize: "0.68rem", letterSpacing: "0.05em", fontFamily: "Space Grotesk, sans-serif" }}>
                        GOLD MEMBER 👑
                      </Typography>
                    </Box>
                  ) */}
                </Box>

                {/* Dropdown Items */}
                <MenuItem
                  component={RouterLink}
                  to={`/profile/${walletAddress}`}
                  onClick={() => {
                    handleCloseProfileMenu();
                    handleNavClick(`/profile/${walletAddress}`);
                  }}
                  sx={{
                    py: 1.2,
                    px: 2.5,
                    mx: 1.2,
                    borderRadius: "10px",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "text.primary",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.04)",
                      color: brandColor
                    }
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <PersonIcon sx={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.4)" }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>My Public Profile</Typography>
                  </Stack>
                </MenuItem>

                <MenuItem
                  component={RouterLink}
                  to="/settings"
                  onClick={() => {
                    handleCloseProfileMenu();
                    handleNavClick("/settings");
                  }}
                  sx={{
                    py: 1.2,
                    px: 2.5,
                    mx: 1.2,
                    borderRadius: "10px",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "text.primary",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.04)",
                      color: brandColor
                    }
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <SettingsIcon sx={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.4)" }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Profile Settings</Typography>
                  </Stack>
                </MenuItem>

                <Divider sx={{ my: 1, opacity: 0.08 }} />

                <MenuItem
                  onClick={() => {
                    handleCloseProfileMenu();
                    logout();
                    navigate("/");
                  }}
                  sx={{
                    py: 1.2,
                    px: 2.5,
                    mx: 1.2,
                    borderRadius: "10px",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: "error.main",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "rgba(239, 68, 68, 0.08)"
                    }
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <LogoutIcon sx={{ fontSize: "1.1rem" }} />
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>Sign Out</Typography>
                  </Stack>
                </MenuItem>

              </Menu>

            </Stack>
          )}

          {/* Mobile drawer trigger */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setMobileOpen(true)}
              disableRipple
              sx={{
                bgcolor: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.06)",
                p: 1,
                touchAction: "manipulation", // Eliminates 300ms click delay on mobile touchscreens
                transition: "background-color 0.2s ease",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.06)"
                },
                "&:active": {
                  bgcolor: "rgba(255,255,255,0.1)"
                }
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
        keepMounted
        transitionDuration={{
          enter: 200,
          exit: 150,
        }}
        ModalProps={{
          keepMounted: true,
          disableScrollLock: true // Prevents layout/header shifting when drawer opens
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 310,
            background: "rgba(10, 10, 15, 0.98)", // slightly more opaque to compensate for blur removal
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "-2px 0 12px rgba(0,0,0,0.4)",
            // Force GPU layer creation for smooth sliding animations on mobile browsers
            transform: "translate3d(0, 0, 0)",
            willChange: "transform",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden"
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
              <Typography variant="h6" sx={{ fontWeight: 950, fontFamily: "Space Grotesk" }}>{SITE_NAME} Menu</Typography>

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
                    onClick={() => {
                      setMobileOpen(false);
                      handleNavClick(item.path);
                    }}
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
                    onClick={() => {
                      setMobileOpen(false);
                      handleNavClick(res.path);
                    }}
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
                    {/* user?.is_premium && (
                      <Box sx={{
                        mt: 0.6,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        py: 0.2,
                        px: 0.8,
                        borderRadius: "6px",
                        background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                        color: "#000",
                        border: "1px solid rgba(255, 215, 0, 0.4)",
                        boxShadow: "0 0 10px rgba(255, 215, 0, 0.25)"
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 950, fontSize: "0.64rem", letterSpacing: "0.05em", fontFamily: "Space Grotesk, sans-serif" }}>
                          GOLD MEMBER 👑
                        </Typography>
                      </Box>
                    ) */}
                  </Box>
                </Stack>

                {/* Send Tip (when connected and authenticated) */}
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

                <Button
                  component={RouterLink}
                  to={`/profile/${walletAddress}`}
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => {
                    setMobileOpen(false);
                    handleNavClick(`/profile/${walletAddress}`);
                  }}
                  sx={{ py: 1.5, borderRadius: "12px", fontWeight: 800 }}

                >
                  My Public Profile
                </Button>

                <Button
                  component={RouterLink}
                  to="/settings"
                  variant="outlined"
                  color="inherit"
                  fullWidth
                  onClick={() => {
                    setMobileOpen(false);
                    handleNavClick("/settings");
                  }}
                  sx={{ py: 1.5, borderRadius: "12px", fontWeight: 800, color: "text.secondary" }}

                >
                  Profile Settings
                </Button>


              </Box>
            )}

            {/* Send Tip trigger (when connected but unauthenticated) */}
            {connected && !isAuthenticated && (
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
                Login
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
                  navigate("/");
                }}
                sx={{ py: 1.5, borderRadius: "12px", fontWeight: 800, borderColor: "rgba(239, 68, 68, 0.3)" }}

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
        disableScrollLock={true}
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
