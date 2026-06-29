import { useState, useEffect, FormEvent } from "react";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { getUserProfile, updateProfile, updateTheme, checkUsernameAvailability } from "../services/api";
import toast from "react-hot-toast";
import { logger } from "../utils/logger";
import SEO from "../components/common/SEO";
import { SITE_NAME, SITE_URL, AVATAR_COLORS } from "../shared/constants";
import { shortenAddress } from "../utils/format";
import { isValidChannel, buildSafeSocialUrl } from "../utils/security";
import { copyToClipboard } from "../utils/clipboard";

import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Select, 
  MenuItem, 
  FormControl, 
  Tab,
  Tabs,
  InputAdornment,
  Tooltip,
  CircularProgress,
  FormHelperText,
  Paper,
  IconButton
} from "@mui/material";
import { ProfileSettingsSkeleton } from "../components/common/LoadingSkeletons";

// MUI Icons
import LockIcon from "@mui/icons-material/Lock";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InfoIcon from "@mui/icons-material/Info";
import PaletteIcon from "@mui/icons-material/Palette";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import CheckIcon from "@mui/icons-material/Check";
import SaveIcon from "@mui/icons-material/Save";
import LinkIcon from "@mui/icons-material/Link";
import CancelIcon from "@mui/icons-material/Cancel";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import BoringAvatar from "boring-avatars";

// Custom Brand SVGs for Twitch, Kick, and Discord
const TwitchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#a970ff" }}>
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
  </svg>
);

const KickIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#53FC18" }}>
    <path d="M19.4 0H4.6C2.1 0 0 2.1 0 4.6v14.8C0 21.9 2.1 24 4.6 24h14.8c2.5 0 4.6-2.1 4.6-4.6V4.6C24 2.1 21.9 0 19.4 0ZM17 17.5h-3.8V15H17v2.5Zm0-4.5h-6.2v2.5H17V13Zm0-4.5H10.8V11H17V8.5ZM17 4v2.5H7V4h10ZM7 20v-2.5h3.8V20H7Zm6.2-7.5H7V10h6.2v2.5Z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#5865F2" }}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
  </svg>
);

// High-fidelity styling configuration matching backend user themes
interface ThemeColors {
  main: string;
  secondary: string;
  bg: string;
  border: string;
  glow: string;
  text: string;
  banner: string;
}

const themeColorMap: Record<string, ThemeColors> = {
  gold: { 
    main: "#F59E0B", 
    secondary: "#D97706", 
    bg: "#0D0A04", 
    border: "rgba(245, 158, 11, 0.3)", 
    glow: "rgba(245, 158, 11, 0.2)", 
    text: "#FEF3C7",
    banner: "linear-gradient(135deg, #F59E0B 0%, #78350F 100%)"
  },
  discord: { 
    main: "#5865F2", 
    secondary: "#404EED", 
    bg: "#0E0F14", 
    border: "rgba(88, 101, 242, 0.3)", 
    glow: "rgba(88, 101, 242, 0.15)", 
    text: "#E2E8F0",
    banner: "linear-gradient(135deg, #5865F2 0%, #1a2247 100%)"
  },
  diamond: { 
    main: "#22D3EE", 
    secondary: "#0891B2", 
    bg: "#050B14", 
    border: "rgba(34, 211, 238, 0.3)", 
    glow: "rgba(34, 211, 238, 0.2)", 
    text: "#CFFAFE",
    banner: "linear-gradient(135deg, #22D3EE 0%, #0F172A 100%)"
  },
  neon: { 
    main: "#10B981", 
    secondary: "#059669", 
    bg: "#020704", 
    border: "rgba(16, 185, 129, 0.3)", 
    glow: "rgba(16, 185, 129, 0.25)", 
    text: "#D1FAE5",
    banner: "linear-gradient(135deg, #10B981 0%, #064E3B 100%)"
  },
  midnight: { 
    main: "#EF4444", 
    secondary: "#DC2626", 
    bg: "#080202", 
    border: "rgba(239, 44, 68, 0.3)", 
    glow: "rgba(239, 44, 68, 0.2)", 
    text: "#FEE2E2",
    banner: "linear-gradient(135deg, #EF4444 0%, #450A0A 100%)"
  },
  cyberpunk: { 
    main: "#FCEE09", 
    secondary: "#FF0055", 
    bg: "#0A0314", 
    border: "rgba(255, 0, 85, 0.4)", 
    glow: "rgba(255, 0, 85, 0.3)", 
    text: "#FFEBF0",
    banner: "linear-gradient(135deg, #FF0055 0%, #FCEE09 100%)"
  },
  sakura: { 
    main: "#EC4899", 
    secondary: "#DB2777", 
    bg: "#0B040B", 
    border: "rgba(236, 72, 153, 0.3)", 
    glow: "rgba(236, 72, 153, 0.2)", 
    text: "#FCE7F3",
    banner: "linear-gradient(135deg, #EC4899 0%, #4D0727 100%)"
  },
};

export default function ProfileSettings() {
  const { walletAddress, isAuthenticated, refreshUser } = useWalletAuth();
  
  const [activeTab, setActiveTab] = useState(0);
  
  // Basic Info state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [initialUsername, setInitialUsername] = useState("");
  
  // Username check state
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid" | "reserved">("idle");
  const [usernameErrorText, setUsernameErrorText] = useState("");
  
  // Social links state
  const [twitter, setTwitter] = useState("");
  const [twitch, setTwitch] = useState("");
  const [youtube, setYoutube] = useState("");
  const [kick, setKick] = useState("");
  const [discord, setDiscord] = useState("");
  
  // Stream player embed state
  const [embedPlatform, setEmbedPlatform] = useState("");
  const [embedChannel, setEmbedChannel] = useState("");

  const [selectedTheme, setSelectedTheme] = useState("gold");
  const [loading, setLoading] = useState(false);
  const [themeLoading, setThemeLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isAuthenticated && walletAddress) {
      loadProfile();
    } else {
      setFetching(false);
    }
  }, [isAuthenticated, walletAddress]);

  // Debounced username checker
  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus("idle");
      setUsernameErrorText("");
      return;
    }

    const trimmed = username.trim().toLowerCase();
    
    // Skip checking if it is the current user's saved username
    if (trimmed === initialUsername.toLowerCase()) {
      setUsernameStatus("available");
      setUsernameErrorText("");
      return;
    }

    const usernameRegex = /^[a-z0-9-]+$/;
    if (!usernameRegex.test(trimmed)) {
      setUsernameStatus("invalid");
      setUsernameErrorText("Lowercase letters, numbers, and dashes only");
      return;
    }
    if (trimmed.length < 3 || trimmed.length > 15) {
      setUsernameStatus("invalid");
      setUsernameErrorText("Must be between 3 and 15 characters");
      return;
    }

    setUsernameStatus("checking");
    setUsernameErrorText("");

    const timer = setTimeout(async () => {
      try {
        const data = await checkUsernameAvailability(trimmed);
        if (data.available) {
          setUsernameStatus("available");
        } else {
          if (data.reason === "reserved") {
            setUsernameStatus("reserved");
            setUsernameErrorText("This username is reserved");
          } else {
            setUsernameStatus("taken");
            setUsernameErrorText("Username is taken");
          }
        }
      } catch (err: any) {
        if (err.message && err.message.includes("already taken")) {
          setUsernameStatus("taken");
          setUsernameErrorText("Username is taken");
        } else {
          setUsernameStatus("invalid");
          setUsernameErrorText(err.message || "Verification failed");
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, initialUsername]);
  
  /**
   * Loads the creator's profile data from the backend and initializes the form state.
   */
  const loadProfile = async () => {
    if (!walletAddress) return;
    try {
      const data = await getUserProfile(walletAddress);
      if (data.user) {
        setName(data.user.name || "");
        setBio(data.user.bio || "");
        setSelectedTheme(data.user.selected_theme || "gold");
        setUsername(data.user.username || "");
        setInitialUsername(data.user.username || "");
        
        // Socials
        setTwitter(data.user.socials?.twitter || "");
        setTwitch(data.user.socials?.twitch || "");
        setYoutube(data.user.socials?.youtube || "");
        setKick(data.user.socials?.kick || "");
        setDiscord(data.user.socials?.discord || "");
        
        // Stream Embed
        setEmbedPlatform(data.user.stream_embed?.platform || "");
        setEmbedChannel(data.user.stream_embed?.channel || "");
      }
    } catch (err) {
      logger.log("No existing profile found or error:", err);
    } finally {
      setFetching(false);
    }
  };

  /**
   * Validates and saves the updated profile information, including display name, bio, 
   * username, socials, and stream embed settings.
   *
   * @param {FormEvent} e - Form submission event
   */
  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) return;

    if (!name.trim()) {
      toast.error("Display Name is required!");
      return;
    }

    if (name.trim().length > 50) {
      toast.error("Display Name must be 50 characters or less!");
      return;
    }

    if (bio.length > 300) {
      toast.error("Bio must be 300 characters or less!");
      return;
    }

    if (username.trim()) {
      const usernameRegex = /^[a-z0-9-]+$/;
      if (!usernameRegex.test(username.trim().toLowerCase())) {
        toast.error("Username can only contain lowercase letters, numbers, and dashes!");
        return;
      }
      if (username.trim().length < 3 || username.trim().length > 15) {
        toast.error("Username must be between 3 and 15 characters!");
        return;
      }
      if (usernameStatus === "taken" || usernameStatus === "reserved") {
        toast.error(usernameErrorText || "Username is not available!");
        return;
      }
    }

    // Socials length limits
    if (
      twitter.trim().length > 200 ||
      twitch.trim().length > 200 ||
      youtube.trim().length > 200 ||
      kick.trim().length > 200 ||
      discord.trim().length > 200
    ) {
      toast.error("Social link or username must be 200 characters or less!");
      return;
    }

    // Stream embed validations
    if (embedPlatform && embedChannel.trim()) {
      const channelTrimmed = embedChannel.trim();
      if (channelTrimmed.length > 100) {
        toast.error("Stream channel name must be 100 characters or less!");
        return;
      }
      if (embedPlatform === "twitch" && !isValidChannel("twitch", channelTrimmed)) {
        toast.error("Twitch channel must be 4 to 25 alphanumeric characters and underscores only!");
        return;
      } else if (embedPlatform === "kick" && !isValidChannel("kick", channelTrimmed)) {
        toast.error("Kick channel must be 3 to 30 alphanumeric characters and underscores only!");
        return;
      } else if (embedPlatform === "youtube" && !isValidChannel("youtube", channelTrimmed)) {
        toast.error("YouTube channel/video ID must be 3 to 30 alphanumeric characters, dashes, or underscores only!");
        return;
      }
    } else if (embedPlatform && !embedChannel.trim()) {
      toast.error("Stream channel is required if platform is selected!");
      return;
    } else if (!embedPlatform && embedChannel.trim()) {
      toast.error("Stream platform is required if channel is specified!");
      return;
    }

    // Validate and resolve social links/handles dynamically to eliminate code duplication
    const socialsToValidate = [
      { key: "twitter", value: twitter, label: "Twitter URL or handle" },
      { key: "twitch", value: twitch, label: "Twitch URL or channel" },
      { key: "youtube", value: youtube, label: "YouTube URL or channel" },
      { key: "kick", value: kick, label: "Kick URL or channel" },
      { key: "discord", value: discord, label: "Discord invite link" },
    ] as const;

    const finalSocials: Record<string, string> = {};

    for (const item of socialsToValidate) {
      const trimmedVal = item.value.trim();
      if (trimmedVal) {
        const resolvedUrl = buildSafeSocialUrl(item.key, trimmedVal);
        if (!resolvedUrl) {
          toast.error(`Invalid ${item.label}!`);
          return;
        }
        finalSocials[item.key] = resolvedUrl;
      } else {
        finalSocials[item.key] = "";
      }
    }

    setLoading(true);
    try {
      await updateProfile({ 
        name: name.trim(), 
        bio, 
        username: username.trim(),
        socials: finalSocials,
        stream_embed: {
          platform: embedPlatform,
          channel: embedChannel.trim(),
        }
      });
      toast.success("Profile updated successfully!");
      setInitialUsername(username.trim());
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Updates the selected visual theme for the creator's tipping page.
   *
   * @param {string} theme - The ID of the selected theme (e.g. "gold", "cyberpunk")
   */
  async function handleThemeChange(theme: string) {
    setThemeLoading(true);
    try {
      await updateTheme(theme);
      setSelectedTheme(theme);
      toast.success(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme activated!`);
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || "Failed to update theme");
    } finally {
      setThemeLoading(false);
    }
  }

  /**
   * Handles switching tabs within the Settings tab panel.
   */
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Shorten wallet address helper for preview
  const previewWalletShort = walletAddress 
    ? shortenAddress(walletAddress, 4) 
    : "ConnectedWallet";

  // Active theme color properties
  const activeThemeColors = themeColorMap[selectedTheme] || themeColorMap.gold;

  if (!isAuthenticated) {
    return (
      <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
          <Card sx={{ textAlign: "center", py: 8, px: 4, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <LockIcon sx={{ fontSize: 64, color: "text.secondary", mb: 3, opacity: 0.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Authentication Required
            </Typography>
            <Typography color="text.secondary">
              Please connect your wallet and sign in to edit your profile.
            </Typography>
          </Card>
        </Container>
      </Box>
    );
  }

  if (fetching) {
    return <ProfileSettingsSkeleton />;
  }

  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", overflow: "hidden", pb: 8 }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, position: "relative", zIndex: 1 }}>
        <SEO title="Profile Settings" description={`Update your ${SITE_NAME} profile settings.`} />

        {/* Title Block */}
        <Box sx={{ mb: { xs: 4, md: 5 }, animation: "fadeInUp 0.3s ease-out" }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 900, 
              mb: 1,
              background: "linear-gradient(135deg, #fff 0%, #a0a0b0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Account <Box component="span" sx={{ 
              background: (theme: any) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.main} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>Settings</Box>
          </Typography>
          <Typography color="text.secondary" variant="body1" sx={{ fontWeight: 400 }}>
            Configure your web3 page settings, streaming feeds, social links, and visual branding.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column: Form and Tabs */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper 
              sx={{ 
                background: "rgba(17, 24, 39, 0.45)", 
                backdropFilter: "blur(12px)", 
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                overflow: "hidden"
              }}
            >
              {/* Settings Category Tabs */}
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                borderBottom: 1, 
                borderColor: "rgba(255, 255, 255, 0.08)", 
                bgcolor: "rgba(0, 0, 0, 0.15)" 
              }}>
                {/* Left navigation arrow on mobile */}
                <IconButton 
                  onClick={() => setActiveTab(prev => Math.max(0, prev - 1))}
                  disabled={activeTab === 0}
                  sx={{ 
                    display: { xs: "flex", sm: "none" }, 
                    color: "primary.main",
                    ml: 1,
                    "&.Mui-disabled": { opacity: 0.3, color: "text.secondary" }
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>

                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange} 
                  variant="scrollable"
                  scrollButtons="auto"
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{
                    flex: 1,
                    px: { xs: 0, sm: 2 },
                    "& .MuiTab-root": {
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      py: 2.5,
                      minWidth: "auto",
                      mr: { xs: 1, sm: 3 },
                      opacity: 0.7,
                      "&.Mui-selected": { opacity: 1 }
                    }
                  }}
                >
                  <Tab label="Profile Info" icon={<AccountCircleIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                  <Tab label="Social Links" icon={<LinkIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                  <Tab label="Stream Embed" icon={<LiveTvIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                  <Tab label="Theme Options" icon={<PaletteIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                </Tabs>

                {/* Right navigation arrow on mobile */}
                <IconButton 
                  onClick={() => setActiveTab(prev => Math.min(3, prev + 1))}
                  disabled={activeTab === 3}
                  sx={{ 
                    display: { xs: "flex", sm: "none" }, 
                    color: "primary.main",
                    mr: 1,
                    "&.Mui-disabled": { opacity: 0.3, color: "text.secondary" }
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>

              {/* Tab Panels */}
              <Box sx={{ p: { xs: 3, sm: 4 } }}>
                <form onSubmit={handleSave}>
                  {/* TAB 1: PROFILE INFO */}
                  {activeTab === 0 && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, animation: "fadeIn 0.25s ease" }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
                        <AccountCircleIcon color="primary" /> General Profile Info
                      </Typography>
                      
                      {/* Display Name */}
                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Display Name *
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {name.length} / 50
                          </Typography>
                        </Box>
                        <TextField
                          required
                          variant="outlined"
                          fullWidth
                          placeholder="Your display name"
                          value={name}
                          onChange={(e) => setName(e.target.value.slice(0, 50))}
                          error={!name.trim()}
                          helperText={!name.trim() ? "Display Name is required to receive superchats" : "Will be displayed on your donation cards and overlay alerts"}
                        />
                      </Box>

                      {/* Username Slug */}
                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 0.5 }}>
                            Public URL Slug
                            <Tooltip title={`This slug creates your public tipping link: ${SITE_URL.replace(/^https?:\/\//i, "")}/username`}>
                              <InfoIcon sx={{ fontSize: 16, cursor: "help", color: "text.secondary" }} />
                            </Tooltip>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {username.length} / 15
                          </Typography>
                        </Box>
                        <TextField
                          variant="outlined"
                          fullWidth
                          placeholder="e.g. ninja"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 15))}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start" sx={{ color: "text.secondary", fontWeight: 700 }}>
                                  {SITE_URL.replace(/^https?:\/\//i, "")}/
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  {usernameStatus === "checking" && <CircularProgress size={20} color="inherit" />}
                                  {usernameStatus === "available" && <CheckIcon color="success" />}
                                  {(usernameStatus === "taken" || usernameStatus === "invalid" || usernameStatus === "reserved") && <CancelIcon color="error" />}
                                </InputAdornment>
                              )
                            }
                          }}
                        />
                        {username.trim() && (
                          <FormHelperText 
                            sx={{ 
                              fontWeight: 700, 
                              mt: 0.8,
                              color: 
                                usernameStatus === "available" ? "success.main" : 
                                usernameStatus === "checking" ? "text.secondary" : "error.main"
                            }}
                          >
                            {usernameStatus === "available" && "✓ Username is available!"}
                            {usernameStatus === "taken" && "✗ This username slug is already taken"}
                            {usernameStatus === "reserved" && "✗ This username is reserved"}
                            {usernameStatus === "invalid" && usernameErrorText}
                          </FormHelperText>
                        )}
                        {!username.trim() && (
                          <FormHelperText>
                            Set a unique slug to enable your dynamic, public tipping profile page.
                          </FormHelperText>
                        )}

                        {/* Public Link Share Box */}
                        {username.trim() && usernameStatus === "available" && (
                          <Box 
                            sx={{ 
                              p: 2, 
                              borderRadius: "8px", 
                              bgcolor: "rgba(20, 241, 149, 0.04)", 
                              border: "1px solid rgba(20, 241, 149, 0.15)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mt: 2
                            }}
                          >
                            <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", mr: 2 }}>
                              <Typography variant="caption" sx={{ color: "primary.light", fontWeight: 700, display: "block" }}>
                                Public URL (Active)
                              </Typography>
                              <Typography variant="body2" sx={{ fontFamily: "monospace", color: "text.primary", whiteSpace: "nowrap" }}>
                                {`${window.location.origin}/${username.trim().toLowerCase()}`}
                              </Typography>
                            </Box>
                            <Button 
                              variant="outlined" 
                              color="primary" 
                              size="small"
                              onClick={() => {
                                copyToClipboard(`${window.location.origin}/${username.trim().toLowerCase()}`);
                              }}
                              sx={{ textTransform: "none", py: 0.5, borderRadius: "6px", fontWeight: 700 }}
                            >
                              Copy Link
                            </Button>
                          </Box>
                        )}
                      </Box>

                      {/* Bio */}
                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Bio Description
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {bio.length} / 300
                          </Typography>
                        </Box>
                        <TextField
                          variant="outlined"
                          multiline
                          rows={4}
                          fullWidth
                          placeholder="Tell your community about your channel and what they are supporting..."
                          value={bio}
                          onChange={(e) => setBio(e.target.value.slice(0, 300))}
                          helperText="Shown on your public profile tipping page"
                        />
                      </Box>
                    </Box>
                  )}

                  {/* TAB 2: SOCIAL LINKS */}
                  {activeTab === 1 && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, animation: "fadeIn 0.25s ease" }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
                        <LinkIcon color="primary" /> Connected Social Channels
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fill in your handles or links to display shortcuts on your public profile. Leave empty to hide.
                      </Typography>
                      
                      <Grid container spacing={3}>
                        {/* Twitter */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>
                            Twitter / X Handle
                          </Typography>
                          <TextField
                            variant="outlined"
                            fullWidth
                            placeholder="e.g. SolanaNinja"
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value)}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <TwitterIcon sx={{ color: "#1DA1F2", fontSize: 18 }} />
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                        </Grid>

                        {/* Twitch */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>
                            Twitch Channel
                          </Typography>
                          <TextField
                            variant="outlined"
                            fullWidth
                            placeholder="e.g. ninja"
                            value={twitch}
                            onChange={(e) => setTwitch(e.target.value)}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <TwitchIcon />
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                        </Grid>

                        {/* YouTube */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>
                            YouTube Channel ID / Handle
                          </Typography>
                          <TextField
                            variant="outlined"
                            fullWidth
                            placeholder="e.g. @SolanaOfficial"
                            value={youtube}
                            onChange={(e) => setYoutube(e.target.value)}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <YouTubeIcon sx={{ color: "#FF0000", fontSize: 18 }} />
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                        </Grid>

                        {/* Kick */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>
                            Kick Channel Slug
                          </Typography>
                          <TextField
                            variant="outlined"
                            fullWidth
                            placeholder="e.g. xqc"
                            value={kick}
                            onChange={(e) => setKick(e.target.value)}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <KickIcon />
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                        </Grid>

                        {/* Discord Invite */}
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>
                            Discord Invite URL
                          </Typography>
                          <TextField
                            variant="outlined"
                            fullWidth
                            placeholder="e.g. https://discord.gg/soltip"
                            value={discord}
                            onChange={(e) => setDiscord(e.target.value)}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <DiscordIcon />
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* TAB 3: STREAM EMBED */}
                  {activeTab === 2 && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, animation: "fadeIn 0.25s ease" }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
                        <LiveTvIcon color="primary" /> Stream Overlay Embed
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Integrate your live video player directly onto your public tipping profile. Visitors will be able to watch you stream while they fill in their tips!
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary" }}>
                            Live Platform
                          </Typography>
                          <FormControl fullWidth>
                            <Select
                              value={embedPlatform}
                              onChange={(e) => setEmbedPlatform(e.target.value)}
                              sx={{ borderRadius: "12px" }}
                            >
                              <MenuItem value="">Disabled / None</MenuItem>
                              <MenuItem value="twitch">Twitch</MenuItem>
                              <MenuItem value="youtube">YouTube (Live stream or video ID)</MenuItem>
                              <MenuItem value="kick">Kick</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary" }}>
                            Channel Slug / Video ID
                          </Typography>
                          <TextField
                            variant="outlined"
                            fullWidth
                            disabled={!embedPlatform}
                            placeholder={
                              embedPlatform === "twitch"
                                ? "Twitch channel name (e.g. ninja)"
                                : embedPlatform === "youtube"
                                ? "YouTube video/stream ID (e.g. dQw4w9WgXcQ)"
                                : embedPlatform === "kick"
                                ? "Kick channel name (e.g. xqc)"
                                : "Select platform first"
                            }
                            value={embedChannel}
                            onChange={(e) => setEmbedChannel(e.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* TAB 4: THEME OPTIONS */}
                  {activeTab === 3 && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, animation: "fadeIn 0.25s ease" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
                          <PaletteIcon color="primary" /> Public Profile Themes
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Customize the visual styling of your public landing page. Select a theme below to activate it instantly.
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {[
                          { id: "gold", color: "#F59E0B", label: "Imperial Gold", desc: "Premium golden glow with royal deep accents" },
                          { id: "discord", color: "#5865F2", label: "Discord Blurple", desc: "A cozy gamer theme modeled after chat apps" },
                          { id: "diamond", color: "#22D3EE", label: "Ice Diamond", desc: "Cool cyan elements with glacial shadows" },
                          { id: "neon", color: "#10B981", label: "Cyber Neon", desc: "Glowing tech-green layout for futuristic setups" },
                          { id: "midnight", color: "#EF4444", label: "Crimson Eclipse", desc: "Dark charcoal with piercing ruby red lights" },
                          { id: "cyberpunk", color: "#FF0055", label: "Vapor Cyberpunk", desc: "Highly dynamic neon yellow and magenta cards" },
                          { id: "sakura", color: "#EC4899", label: "Sakura Night", desc: "Deep pink cherry blossom theme for cozy vibes" }
                        ].map((t) => {
                          const isActive = selectedTheme === t.id;
                          return (
                            <Grid size={{ xs: 12, sm: 6 }} key={t.id}>
                              <Card
                                onClick={() => !themeLoading && handleThemeChange(t.id)}
                                sx={{
                                  border: `2px solid ${isActive ? t.color : "rgba(255, 255, 255, 0.08)"}`,
                                  bgcolor: isActive ? `${t.color}0c` : "rgba(255, 255, 255, 0.02)",
                                  cursor: "pointer",
                                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                  position: "relative",
                                  borderRadius: "14px",
                                  boxShadow: isActive ? `0 0 16px ${t.color}22` : "none",
                                  "&:hover": {
                                    bgcolor: "rgba(255,255,255,0.05)",
                                    borderColor: isActive ? t.color : "rgba(255,255,255,0.2)",
                                    transform: "translateY(-2px)"
                                  }
                                }}
                              >
                                <CardContent sx={{ p: 2.5, display: "flex", gap: 2, alignItems: "center" }}>
                                  <Box 
                                    sx={{ 
                                      width: 44, 
                                      height: 44, 
                                      borderRadius: "50%", 
                                      background: `linear-gradient(135deg, ${t.color} 0%, #000 100%)`, 
                                      flexShrink: 0,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      boxShadow: `0 0 10px ${t.color}66`,
                                      border: `1px solid ${t.color}`
                                    }}
                                  >
                                    {isActive && <CheckIcon sx={{ color: "#fff", fontSize: 20 }} />}
                                  </Box>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isActive ? t.color : "#fff" }}>
                                      {t.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, lineHeight: 1.2 }}>
                                      {t.desc}
                                    </Typography>
                                  </Box>
                                  {isActive && (
                                    <CheckCircleIcon sx={{ fontSize: 18, color: t.color, position: "absolute", top: 8, right: 8 }} />
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}

                  {/* Actions buttons footer (only for settings form tabs, theme updates save on click) */}
                  {activeTab !== 3 && (
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end", gap: 2, borderTop: "1px solid rgba(255,255,255,0.08)", pt: 3.5 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        sx={{ 
                          px: 5, 
                          py: 1.2, 
                          borderRadius: "10px",
                          fontWeight: 800,
                          fontSize: "0.95rem",
                          boxShadow: "0 4px 14px rgba(56, 189, 248, 0.25)"
                        }}
                      >
                        {loading ? "Saving Settings..." : "Save Settings"}
                      </Button>
                    </Box>
                  )}
                </form>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: Live Interactive Mockup */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", justifyContent: "center" }}>
            <Box sx={{ width: "100%", maxWidth: "340px", position: "sticky", top: 24, alignSelf: "flex-start" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5, textAlign: "center" }}>
                Live Page Preview
              </Typography>
              
              {/* Phone Container */}
              <Box
                sx={{
                  width: "100%",
                  height: "600px",
                  borderRadius: "32px",
                  border: "12px solid #1E293B",
                  bgcolor: activeThemeColors.bg,
                  overflow: "hidden",
                  boxShadow: `0 25px 60px rgba(0, 0, 0, 0.6), 0 0 30px ${activeThemeColors.glow}`,
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Phone Speaker Notch */}
                <Box
                  sx={{
                    width: "110px",
                    height: "18px",
                    bgcolor: "#1E293B",
                    borderRadius: "0 0 12px 12px",
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 100,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Box sx={{ width: "40px", height: "4px", bgcolor: "#0F172A", borderRadius: "2px" }} />
                </Box>

                {/* Inner Preview Content Area (Scrollable but scrollbars hidden) */}
                <Box
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    pb: 4,
                    pt: 2.5,
                    "&::-webkit-scrollbar": { display: "none" },
                    scrollbarWidth: "none"
                  }}
                >
                  {/* Themed Header Banner */}
                  <Box 
                    sx={{ 
                      width: "100%", 
                      height: "80px", 
                      background: activeThemeColors.banner, 
                      position: "relative",
                      flexShrink: 0
                    }} 
                  />

                  {/* Avatar wrapper overlaps banner */}
                  <Box sx={{ display: "flex", justifyContent: "center", mt: "-40px", zIndex: 10, position: "relative", mb: 1.5 }}>
                    <Box 
                      sx={{ 
                        p: 0.6, 
                        borderRadius: "50%", 
                        bgcolor: activeThemeColors.bg, 
                        border: `2px solid ${activeThemeColors.border}`,
                        boxShadow: `0 8px 20px ${activeThemeColors.glow}`
                      }}
                    >
                      <BoringAvatar 
                        name={name || "Preview"} 
                        variant="beam" 
                        size={80} 
                        colors={AVATAR_COLORS}
                      />
                    </Box>
                  </Box>

                  {/* Creator Information */}
                  <Box sx={{ px: 2, textAlign: "center", mb: 2 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 900, 
                        color: activeThemeColors.text, 
                        fontSize: "1.05rem",
                        lineHeight: 1.2,
                        mb: 0.2
                      }}
                    >
                      {name.trim() || "Creator Name"}
                    </Typography>
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 700, 
                        color: activeThemeColors.main, 
                        letterSpacing: "0.02em",
                        display: "block"
                      }}
                    >
                      @{username.trim().toLowerCase() || "username"} ({previewWalletShort})
                    </Typography>

                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        display: "block", 
                        mt: 0.8,
                        fontSize: "0.72rem", 
                        lineHeight: 1.3,
                        px: 1,
                        whiteSpace: "pre-line",
                        wordBreak: "break-word"
                      }}
                    >
                      {bio.trim() || "This is a placeholder for your public bio. Fill in details about your streams and channels!"}
                    </Typography>
                  </Box>

                  {/* Social Channel Badges */}
                  <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1, px: 2, mb: 2.5 }}>
                    {twitter.trim() && (
                      <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.05)", border: `1px solid ${activeThemeColors.border}`, p: 0.7 }}>
                        <TwitterIcon sx={{ color: "#1DA1F2", fontSize: 16 }} />
                      </IconButton>
                    )}
                    {twitch.trim() && (
                      <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.05)", border: `1px solid ${activeThemeColors.border}`, p: 0.7 }}>
                        <TwitchIcon />
                      </IconButton>
                    )}
                    {youtube.trim() && (
                      <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.05)", border: `1px solid ${activeThemeColors.border}`, p: 0.7 }}>
                        <YouTubeIcon sx={{ color: "#FF0000", fontSize: 16 }} />
                      </IconButton>
                    )}
                    {kick.trim() && (
                      <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.05)", border: `1px solid ${activeThemeColors.border}`, p: 0.7 }}>
                        <KickIcon />
                      </IconButton>
                    )}
                    {discord.trim() && (
                      <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.05)", border: `1px solid ${activeThemeColors.border}`, p: 0.7 }}>
                        <DiscordIcon />
                      </IconButton>
                    )}
                  </Box>

                  {/* Stream Player Mockup */}
                  {embedPlatform && embedChannel.trim() && (
                    <Box sx={{ px: 2, mb: 2.5 }}>
                      <Box 
                        sx={{ 
                          width: "100%", 
                          aspectRatio: "16/9", 
                          bgcolor: "#000", 
                          borderRadius: "10px", 
                          border: `1.5px solid ${activeThemeColors.border}`,
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden"
                        }}
                      >
                        {/* Pulse Live Badge */}
                        <Box 
                          sx={{ 
                            position: "absolute", 
                            top: 8, 
                            left: 8, 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 0.5,
                            bgcolor: "rgba(239, 68, 68, 0.9)",
                            color: "#fff",
                            borderRadius: "4px",
                            px: 0.8,
                            py: 0.3,
                            fontSize: "0.6rem",
                            fontWeight: 800,
                            letterSpacing: "0.05em",
                            lineHeight: 1
                          }}
                        >
                          <Box 
                            sx={{ 
                              width: 6, 
                              height: 6, 
                              borderRadius: "50%", 
                              bgcolor: "#fff",
                              animation: "pulse 1.2s infinite"
                            }} 
                          />
                          LIVE
                        </Box>
                        
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 0.5 }}>
                          <LiveTvIcon sx={{ fontSize: 16, color: activeThemeColors.main }} />
                          {embedPlatform.toUpperCase()}: {embedChannel.slice(0, 15)}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Tipping Widget Card Mockup */}
                  <Box sx={{ px: 2 }}>
                    <Card 
                      sx={{ 
                        bgcolor: "rgba(255, 255, 255, 0.03)", 
                        border: `1px solid ${activeThemeColors.border}`,
                        borderRadius: "12px",
                        boxShadow: `0 4px 15px ${activeThemeColors.glow}`
                      }}
                    >
                      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: activeThemeColors.text, textTransform: "uppercase", fontSize: "0.65rem", display: "block", mb: 1, letterSpacing: "0.03em" }}>
                          Send Web3 Tip
                        </Typography>
                        
                        {/* Mock Amount Buttons */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, mb: 1.2 }}>
                          {["0.1", "0.5", "1"].map((val, idx) => (
                            <Box 
                              key={val} 
                              sx={{ 
                                bgcolor: idx === 1 ? `${activeThemeColors.main}20` : "rgba(255,255,255,0.02)", 
                                border: `1px solid ${idx === 1 ? activeThemeColors.main : "rgba(255,255,255,0.08)"}`,
                                borderRadius: "6px",
                                p: 0.6,
                                textAlign: "center",
                                cursor: "default"
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 800, color: idx === 1 ? activeThemeColors.main : "text.secondary", fontSize: "0.7rem" }}>
                                {val} SOL
                              </Typography>
                            </Box>
                          ))}
                        </Box>

                        {/* Mock Inputs */}
                        <Box sx={{ width: "100%", bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", p: 0.8, mb: 1.2 }}>
                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem", display: "block" }}>
                            Mock superchat message...
                          </Typography>
                        </Box>

                        {/* Mock Send Button */}
                        <Button 
                          fullWidth 
                          variant="contained" 
                          size="small"
                          disabled
                          sx={{ 
                            bgcolor: activeThemeColors.main, 
                            color: "#000",
                            fontWeight: 900, 
                            borderRadius: "6px",
                            fontSize: "0.72rem",
                            py: 0.8,
                            opacity: 0.9,
                            boxShadow: `0 3px 10px ${activeThemeColors.glow}`,
                            "&.Mui-disabled": { bgcolor: activeThemeColors.main, color: "#000" }
                          }}
                        >
                          Send Tip
                        </Button>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
                
                {/* Phone Home Bar */}
                <Box 
                  sx={{ 
                    height: "15px", 
                    width: "100%", 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center",
                    borderTop: "1px solid rgba(255,255,255,0.03)",
                    bgcolor: "rgba(0,0,0,0.15)",
                    flexShrink: 0
                  }}
                >
                  <Box sx={{ width: "100px", height: "4px", bgcolor: "rgba(255,255,255,0.15)", borderRadius: "2px" }} />
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
