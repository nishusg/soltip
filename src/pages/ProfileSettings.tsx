import { useState, useEffect, FormEvent } from "react";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { getUserProfile, updateProfile } from "../services/api";
import toast from "react-hot-toast";
import { Container, Card, CardContent, Typography, TextField, Button, Box, CircularProgress, Avatar } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LockIcon from "@mui/icons-material/Lock";

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
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ textAlign: "center", py: 4 }}>
          <CardContent>
            <LockIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Please connect wallet and sign in to edit your profile.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (fetching) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8, minHeight: "calc(100vh - 64px)" }}>
      <Card sx={{ animation: "fadeInUp 0.6s ease-out" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
            Profile Settings
          </Typography>

          <form onSubmit={handleSave}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="Display Name"
                variant="outlined"
                fullWidth
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <TextField
                label="Bio"
                variant="outlined"
                multiline
                rows={3}
                fullWidth
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />

              <TextField
                label="Avatar URL"
                variant="outlined"
                fullWidth
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />

              {avatarUrl && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    Avatar Preview:
                  </Typography>
                  <Avatar 
                    src={avatarUrl} 
                    alt="Preview" 
                    sx={{ width: 64, height: 64, border: "2px solid rgba(255,255,255,0.1)" }} 
                  />
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ mt: 2, py: 1.5 }}
              >
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
