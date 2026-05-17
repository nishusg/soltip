import { useState, useEffect, FormEvent } from "react";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { getUserProfile, updateProfile, updateTheme } from "../services/api";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  CircularProgress, 
  Avatar,
  Card,
  CardContent,
  Grid
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LockIcon from "@mui/icons-material/Lock";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InfoIcon from "@mui/icons-material/Info";
import PaletteIcon from "@mui/icons-material/Palette";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BoringAvatar from "boring-avatars";


export default function ProfileSettings() {
  const { walletAddress, isAuthenticated, user, refreshUser } = useWalletAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("gold");
  const [loading, setLoading] = useState(false);
  const [themeLoading, setThemeLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isAuthenticated && walletAddress) {
      getUserProfile(walletAddress)
        .then((data) => {
          if (data.user) {
            setName(data.user.name || "");
            setBio(data.user.bio || "");
            setAvatarUrl(data.user.avatar_url || "");
            setSelectedTheme(data.user.selected_theme || "gold");
          }
        })
        .catch((err) => {
          console.log("No existing profile found or error:", err);
        })
        .finally(() => {
          setFetching(false);
        });
    } else {
      setFetching(false);
    }
  }, [isAuthenticated, walletAddress]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) return;

    if (!name.trim()) {
      toast.error("Display Name is required!");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), bio, avatar_url: avatarUrl });
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
    return (
      <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress size={48} thickness={4} sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", overflow: "hidden", pb: 8 }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, position: "relative", zIndex: 1 }}>
        <SEO title="Profile Settings" description="Update your SolChat profile information." />
        
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

              {user?.is_premium && (
                <Card sx={{ border: "1px solid rgba(255, 215, 0, 0.3)", background: "linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(0,0,0,0) 100%)" }}>
                  <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                      <PaletteIcon sx={{ color: "#FFD700" }} /> Premium Themes
                    </Typography>
                    
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                      {[
                        { id: "gold", color: "#FFD700", label: "Gold" },
                        { id: "discord", color: "#5865F2", label: "Discord" },
                        { id: "diamond", color: "#B9F2FF", label: "Diamond" },
                        { id: "neon", color: "#FF00FF", label: "Neon" },
                        { id: "midnight", color: "#FF3333", label: "Midnight" }
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
              )}
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
                        <InfoIcon sx={{ fontSize: 16, verticalAlign: "text-bottom", mr: 0.5 }}/> About You
                      </Typography>
                      <TextField
                        variant="outlined"
                        multiline
                        rows={5}
                        fullWidth
                        placeholder="Tell your community what you stream..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </Box>

                    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
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
