import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { createStream } from "../services/api";
import toast from "react-hot-toast";
import { Container, Card, CardContent, Typography, TextField, Button, Box, CircularProgress, MenuItem } from "@mui/material";
import VideoCallIcon from "@mui/icons-material/VideoCall";

const CATEGORIES = ["Gaming", "Coding", "IRL", "Music", "Crypto", "Talk Show"];

export default function CreateStream() {
  const { isAuthenticated } = useWalletAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Gaming",
    description: ""
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to go live");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Stream title is required");
      return;
    }

    setLoading(true);
    try {
      const stream = await createStream(formData);
      toast.success("Stream started!");
      navigate(`/stream/${stream._id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create stream");
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5">Please sign in to start a stream.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ animation: "fadeInUp 0.6s ease-out" }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <VideoCallIcon sx={{ color: "#fff", fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Go Live</Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="Stream Title"
                placeholder="e.g., Coding a Solana Super Chat platform!"
                fullWidth
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <TextField
                select
                label="Category"
                fullWidth
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Description"
                placeholder="Tell your viewers what this stream is about..."
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VideoCallIcon />}
                sx={{ py: 1.5, fontSize: "1.1rem", fontWeight: 700 }}
              >
                {loading ? "Starting Stream..." : "Go Live Now"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
