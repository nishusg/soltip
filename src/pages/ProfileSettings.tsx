import { useState, useEffect, FormEvent } from "react";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { getUserProfile, updateProfile } from "../services/api";
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

export default function ProfileSettings() {
  const { walletAddress, isAuthenticated } = useWalletAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isAuthenticated && walletAddress) {
      getUserProfile(walletAddress)
        .then((data) => {
          if (data.user) {
            setName(data.user.name || "");
            setBio(data.user.bio || "");
            setAvatarUrl(data.user.avatar_url || "");
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

    setLoading(true);
    try {
      await updateProfile({ name, bio, avatar_url: avatarUrl });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
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
              background: "linear-gradient(135deg, #14F195 0%, #9945FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>Settings</Box>
          </Typography>
          <Typography color="text.secondary" variant="h6" sx={{ fontWeight: 400 }}>
            Manage your account details and public persona.
          </Typography>
        </Box>

        <form onSubmit={handleSave}>
          <Grid container spacing={4} className="fade-in-up">
            {/* Left Column: Avatar & Basic Visuals */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 }, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 4, alignSelf: "flex-start" }}>
                    Profile Picture
                  </Typography>
                  
                  <Box sx={{ position: "relative", mb: 4 }}>
                    <Avatar 
                      src={avatarUrl} 
                      alt="Preview" 
                      sx={{ 
                        width: 160, 
                        height: 160, 
                        border: "4px solid rgba(20, 241, 149, 0.2)",
                        boxShadow: "0 0 30px rgba(20, 241, 149, 0.15)",
                        bgcolor: "rgba(255,255,255,0.05)",
                        fontSize: "4rem"
                      }} 
                    >
                      {!avatarUrl && (name || walletAddress)?.[0]?.toUpperCase()}
                    </Avatar>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Provide a direct image URL to update your profile picture.
                  </Typography>

                  <TextField
                    label="Image URL"
                    variant="outlined"
                    fullWidth
                    placeholder="https://..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column: Personal Information */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, display: "flex", alignItems: "center", gap: 1.5 }}>
                    <AccountCircleIcon color="primary" /> Personal Information
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Display Name
                      </Typography>
                      <TextField
                        variant="outlined"
                        fullWidth
                        placeholder="Your display name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        placeholder="Tell your community what you stream, when you're live, and what they can expect from you..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </Box>

                  </Box>
                  
                  <Box sx={{ mt: 6, display: "flex", justifyContent: "flex-end" }}>
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

                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Container>
    </Box>
  );
}
