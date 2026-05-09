import { useState, useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { getCreatorStats } from "../services/api";
import { getExplorerUrl } from "../services/solana";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { Container, Card, CardContent, Typography, Box, CircularProgress, Button, Avatar, List, ListItem, Divider, Link, Chip } from "@mui/material";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import SettingsIcon from "@mui/icons-material/Settings";
import ErrorIcon from "@mui/icons-material/Error";

interface CreatorProfile {
  wallet_address: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  total_received: number;
}

interface Tip {
  tx_hash: string;
  sender_wallet: string;
  amount: number;
  fee: number;
  message: string;
  timestamp: string;
}

export default function CreatorPage() {
  const { wallet } = useParams<{ wallet: string }>();
  const { walletAddress } = useWalletAuth();

  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet) return;

    async function fetchCreator() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCreatorStats(wallet!);
        setCreator(data.creator);
        setTips(data.recent_tips || []);
      } catch (err: any) {
        setError(err.message || "Creator not found");
      } finally {
        setLoading(false);
      }
    }

    fetchCreator();
  }, [wallet]);

  function shorten(addr: string): string {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function formatSol(lamports: number): string {
    return (lamports / LAMPORTS_PER_SOL).toFixed(4);
  }

  function formatTime(ts: string): string {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }

  return (
    <Container maxWidth="md" sx={{ py: 10, minHeight: "calc(100vh - 64px)" }}>
      {loading && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10 }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography color="text.secondary">Loading creator profile...</Typography>
        </Box>
      )}

      {error && (
        <Card sx={{ textAlign: "center", py: 6, animation: "fadeInUp 0.6s ease-out" }}>
          <CardContent>
            <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" color="error" gutterBottom>
              {error}
            </Typography>
            <Button component={RouterLink} to="/" variant="outlined" sx={{ mt: 2 }}>
              ← Back to Home
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && creator && (
        <Box sx={{ animation: "fadeInUp 0.6s ease-out" }}>
          {/* Profile Card */}
          <Card sx={{ mb: 4, textAlign: "center", px: 4, pb: 4, pt: 0, overflow: "visible" }}>
            <Box sx={{ display: "flex", justifyContent: "center", mt: -6, mb: 2 }}>
              <Avatar
                src={creator.avatar_url}
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: "3rem",
                  border: "4px solid #110022",
                  boxShadow: "0 0 20px rgba(0,229,255,0.3)",
                  bgcolor: "primary.dark"
                }}
              >
                {!creator.avatar_url && (creator.name || creator.wallet_address)[0]?.toUpperCase()}
              </Avatar>
            </Box>
            
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
                {creator.name || shorten(creator.wallet_address)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {creator.wallet_address}
              </Typography>

              {creator.bio && (
                <Typography variant="body1" sx={{ mb: 3, fontStyle: "italic", color: "text.secondary", maxWidth: 500, mx: "auto" }}>
                  "{creator.bio}"
                </Typography>
              )}

              <Box sx={{ my: 4, py: 3, borderTop: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <Typography variant="overline" color="text.secondary" sx={{ display: "block" }}>
                  Total Received
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, background: "linear-gradient(90deg, #00e5ff 0%, #b400ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {formatSol(creator.total_received)} SOL
                </Typography>
              </Box>
              
              {walletAddress === creator.wallet_address ? (
                <Button component={RouterLink} to="/settings" variant="outlined" color="secondary" size="large" startIcon={<SettingsIcon />}>
                  Edit Profile
                </Button>
              ) : (
                <Button component={RouterLink} to="/" variant="contained" color="primary" size="large" startIcon={<FlashOnIcon />}>
                  Send a Tip
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Tips */}
          {tips.length > 0 && (
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                  Recent Tips
                </Typography>
                <List disablePadding>
                  {tips.map((tip, idx) => (
                    <Box key={tip.tx_hash}>
                      <ListItem sx={{ flexDirection: "column", alignItems: "stretch", px: 0, py: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip icon={<CallReceivedIcon fontSize="small" />} label="Received" color="primary" size="small" variant="outlined" />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {formatSol(tip.amount)} SOL
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            from {shorten(tip.sender_wallet)}
                          </Typography>
                        </Box>

                        {tip.message && (
                          <Box sx={{ my: 1, p: 1.5, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontStyle: "italic" }}>"{tip.message}"</Typography>
                          </Box>
                        )}

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(tip.timestamp)}
                          </Typography>
                          <Link href={getExplorerUrl(tip.tx_hash)} target="_blank" rel="noopener noreferrer" color="primary.main" sx={{ display: "flex", alignItems: "center", fontSize: "0.75rem", gap: 0.5 }}>
                            Explorer <OpenInNewIcon sx={{ fontSize: 12 }} />
                          </Link>
                        </Box>
                      </ListItem>
                      {idx < tips.length - 1 && <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />}
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Container>
  );
}
