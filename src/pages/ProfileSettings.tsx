import { useState, useEffect, FormEvent } from "react";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { getUserProfile, updateProfile, updateTheme } from "../services/api";
import toast from "react-hot-toast";
import { logger } from "../utils/logger";
import SEO from "../components/common/SEO";
import { SITE_NAME } from "../shared/constants";

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
  Divider
} from "@mui/material";
import { ProfileSettingsSkeleton } from "../components/common/LoadingSkeletons";
import LockIcon from "@mui/icons-material/Lock";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InfoIcon from "@mui/icons-material/Info";
import PaletteIcon from "@mui/icons-material/Palette";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShareIcon from "@mui/icons-material/Share";
import BoringAvatar from "boring-avatars";


export default function ProfileSettings() {
  const { walletAddress, isAuthenticated, refreshUser } = useWalletAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("gold");
  const [username, setUsername] = useState("");
  
  // Social links
  const [twitter, setTwitter] = useState("");
  const [twitch, setTwitch] = useState("");
  const [youtube, setYoutube] = useState("");
  const [kick, setKick] = useState("");
  const [discord, setDiscord] = useState("");
  
  // Stream player embed
  const [embedPlatform, setEmbedPlatform] = useState("");
  const [embedChannel, setEmbedChannel] = useState("");

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
  
  const loadProfile = async () => {
    if (!walletAddress) return;
    try {
      const data = await getUserProfile(walletAddress);
      if (data.user) {
        setName(data.user.name || "");
        setBio(data.user.bio || "");
        setAvatarUrl(data.user.avatar_url || "");
        setSelectedTheme(data.user.selected_theme || "gold");
        setUsername(data.user.username || "");
        
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

    if (avatarUrl.length > 2048) {
      toast.error("Avatar URL must be 2048 characters or less!");
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
      if (embedPlatform === "twitch") {
        if (!/^[a-zA-Z0-9_]{4,25}$/.test(channelTrimmed)) {
          toast.error("Twitch channel must be 4 to 25 alphanumeric characters and underscores only!");
          return;
        }
      } else if (embedPlatform === "kick") {
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(channelTrimmed)) {
          toast.error("Kick channel must be 3 to 30 alphanumeric characters and underscores only!");
          return;
        }
      } else if (embedPlatform === "youtube") {
        if (!/^[a-zA-Z0-9_-]{3,30}$/.test(channelTrimmed)) {
          toast.error("YouTube channel/video ID must be 3 to 30 alphanumeric characters, dashes, or underscores only!");
          return;
        }
      }
    } else if (embedPlatform && !embedChannel.trim()) {
      toast.error("Stream channel is required if platform is selected!");
      return;
    } else if (!embedPlatform && embedChannel.trim()) {
      toast.error("Stream platform is required if channel is specified!");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ 
        name: name.trim(), 
        bio, 
        avatar_url: avatarUrl,
        username: username.trim(),
        socials: {
          twitter: twitter.trim(),
          twitch: twitch.trim(),
          youtube: youtube.trim(),
          kick: kick.trim(),
          discord: discord.trim(),
        },
        stream_embed: {
          platform: embedPlatform,
          channel: embedChannel.trim(),
        }
      });
      toast.success("Profile updated successfully!");
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

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

  if (!isAuthenticated) {
    return (
      <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
          <Card sx={{ textAlign: "center", py: 8, px: 4 }}>
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
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, position: "relative", zIndex: 1 }}>
        <SEO title="Profile Settings" description={`Update your ${SITE_NAME} profile information.`} />

        
        <Box sx={{ mb: { xs: 4, md: 6 }, animation: "fadeInUp 0.3s ease-out" }}>
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
            Profile <Box component="span" sx={{ 
              background: (theme: any) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.main} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>Settings</Box>
          </Typography>
          <Typography color="text.secondary" variant="h6" sx={{ fontWeight: 400 }}>
            Manage your account details and public persona.
          </Typography>
        </Box>

        <Grid container spacing={4} className="fade-in-up">
          {/* Left Column: Avatar & Premium Themes */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Card>
                <CardContent sx={{ p: { xs: 3, sm: 4 }, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, alignSelf: "flex-start" }}>
                    Profile Avatar
                  </Typography>
                  
                  <Box sx={{ 
                    position: "relative", 
                    mb: 3,
                    p: 1.2,
                    borderRadius: "50%",
                    border: "4px solid rgba(153, 69, 242, 0.2)",
                    boxShadow: "0 0 30px rgba(153, 69, 242, 0.15)",
                    background: "rgba(255,255,255,0.02)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <BoringAvatar 
                      name={name || walletAddress || ""} 
                      variant="beam" 
                      size={140} 
                      colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, mb: 1, color: "primary.main", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Dynamic Web3 Avatar
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: "block" }}>
                    Your avatar is dynamically generated from your display name and wallet address! Change your display name to watch it update in real-time.
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ border: "1px solid rgba(255, 255, 255, 0.08)", background: "rgba(255,255,255,0.01)" }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                    <PaletteIcon sx={{ color: "primary.main" }} /> Profile Themes
                  </Typography>
                  
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    {[
                      { id: "gold", color: "#FFD700", label: "Gold" },
                      { id: "discord", color: "#5865F2", label: "Discord" },
                      { id: "diamond", color: "#B9F2FF", label: "Diamond" },
                      { id: "neon", color: "#FF00FF", label: "Neon" },
                      { id: "midnight", color: "#FF3333", label: "Midnight" },
                      { id: "cyberpunk", color: "#FF0055", label: "Cyberpunk" },
                      { id: "sakura", color: "#FF80BF", label: "Sakura" }
                    ].map((t) => (
                      <Box
                        key={t.id}
                        onClick={() => !themeLoading && handleThemeChange(t.id)}
                        sx={{
                          p: 2,
                          borderRadius: "12px",
                          cursor: "pointer",
                          textAlign: "center",
                          border: `2px solid ${selectedTheme === t.id ? t.color : "rgba(255,255,255,0.05)"}`,
                          bgcolor: selectedTheme === t.id ? `${t.color}11` : "rgba(255,255,255,0.02)",
                          transition: "all 0.2s ease",
                          position: "relative",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.05)", transform: "scale(1.02)" }
                        }}
                      >
                        <Box sx={{ width: 30, height: 30, borderRadius: "50%", bgcolor: t.color, mx: "auto", mb: 1, boxShadow: `0 0 10px ${t.color}` }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: selectedTheme === t.id ? t.color : "text.secondary" }}>
                          {t.label}
                        </Typography>
                        {selectedTheme === t.id && (
                          <CheckCircleIcon sx={{ position: "absolute", top: 4, right: 4, fontSize: 16, color: t.color }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Right Column: Personal Information */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, display: "flex", alignItems: "center", gap: 1.5 }}>
                  <AccountCircleIcon color="primary" /> Personal Information
                </Typography>

                <form onSubmit={handleSave}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Display Name *
                      </Typography>
                      <TextField
                        required
                        variant="outlined"
                        fullWidth
                        placeholder="Your display name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={!name.trim()}
                        helperText={!name.trim() ? "Display Name is required to receive superchats" : ""}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Public Username Slug
                      </Typography>
                      <TextField
                        variant="outlined"
                        fullWidth
                        placeholder="e.g. ninja"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        helperText={
                          username.trim()
                            ? `Your shareable public page link: ${window.location.origin}/${username.trim().toLowerCase()}`
                            : "Set a unique username slug to enable your dynamic, public SEO tipping and profile page (lowercase, numbers, and dashes only)."
                        }
                        slotProps={{
                          formHelperText: { sx: { color: "primary.main", fontWeight: 700 } }
                        }}
                      />

                      {username.trim() && (
                        <Box 
                          sx={{ 
                            p: 2.5, 
                            borderRadius: "12px", 
                            bgcolor: "rgba(153, 69, 242, 0.05)", 
                            border: "1px solid rgba(153, 69, 242, 0.15)",
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                            mt: 2
                          }}
                        >
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.light", mb: 0.5, display: "flex", alignItems: "center", gap: 0.8 }}>
                              <ShareIcon sx={{ fontSize: 16 }} /> Share Your Creator Profile Page
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: "'Space Mono', monospace", 
                                color: "text.secondary",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: "0.85rem"
                              }}
                            >
                              {`${window.location.origin}/${username.trim().toLowerCase()}`}
                            </Typography>
                          </Box>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                             
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/${username.trim().toLowerCase()}`);
                              toast.success("Shareable link copied!", { icon: "🔗" });
                            }}
                            sx={{ 
                              borderRadius: "8px", 
                              fontWeight: 800, 
                              px: 3.5, 
                              py: 1, 
                              flexShrink: 0,
                              boxShadow: "0 4px 12px rgba(153, 69, 242, 0.25)"
                            }}
                          >
                            Copy Link
                          </Button>
                        </Box>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        <InfoIcon sx={{ fontSize: 16, verticalAlign: "text-bottom", mr: 0.5 }}/> About You
                      </Typography>
                      <TextField
                        variant="outlined"
                        multiline
                        rows={4}
                        fullWidth
                        placeholder="Tell your community what you stream..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </Box>

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1 }} />

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                        🔗 Social Channels
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>
                            Twitter / X Username
                          </Typography>
                          <TextField
                            variant="outlined"
                            fullWidth
                            placeholder="e.g. SolanaNinja"
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>
                            Twitch Channel Slug
                          </Typography>
                          <TextField
                            variant="outlined"
                            fullWidth
                            placeholder="e.g. ninja"
                            value={twitch}
                            onChange={(e) => setTwitch(e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>
                            YouTube Channel ID or Video ID
                          </Typography>
                          <TextField
                            variant="outlined"
                            fullWidth
                            placeholder="e.g. UC1234567"
                            value={youtube}
                            onChange={(e) => setYoutube(e.target.value)}
                          />
                        </Grid>
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
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>
                            Discord Invite URL
                          </Typography>
                          <TextField
                            variant="outlined"
                            fullWidth
                            placeholder={`e.g. discord.gg/${SITE_NAME.toLowerCase()}`}

                            value={discord}
                            onChange={(e) => setDiscord(e.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1 }} />

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                        📺 Stream Embed Configuration
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary" }}>
                            Select Live Platform
                          </Typography>
                          <FormControl fullWidth>
                            <Select
                              value={embedPlatform}
                              onChange={(e) => setEmbedPlatform(e.target.value)}
                              sx={{ borderRadius: "12px" }}
                            >
                              <MenuItem value="">None / Hidden</MenuItem>
                              <MenuItem value="twitch">Twitch Stream</MenuItem>
                              <MenuItem value="youtube">YouTube Stream / Video</MenuItem>
                              <MenuItem value="kick">Kick Stream</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary" }}>
                            Channel Slug or Video ID
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

                    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={loading}
                         
                        sx={{ px: 6, py: 1.5, fontSize: "1.1rem" }}
                      >
                        {loading ? "Saving Changes..." : "Save Profile"}
                      </Button>
                    </Box>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
