import { useState, useEffect } from "react";
import { getDashboardData } from "../services/api";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Divider, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Chip,
  CircularProgress,
  Button
} from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import PeopleIcon from "@mui/icons-material/People";
import VideocamIcon from "@mui/icons-material/Videocam";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardData()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatSol = (lamports: number) => (lamports / LAMPORTS_PER_SOL).toFixed(4);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 10, textAlign: "center" }}>
        <Typography color="error" variant="h5">{error}</Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => window.location.reload()}>Retry</Button>
      </Container>
    );
  }

  const { user, streams, recentTips, streamEarnings } = data;

  // Calculate some stats
  const totalEarned = user?.total_received || 0;
  const liveStreamsCount = streams.filter((s: any) => s.status === "live").length;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6, animation: "fadeInUp 0.3s ease-out" }}>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
          Creator <Box component="span" sx={{ color: "primary.main" }}>Dashboard</Box>
        </Typography>
        <Typography color="text.secondary">Manage your content, track earnings, and engage with your community.</Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3, textAlign: "center", bgcolor: "rgba(0, 242, 255, 0.05)", border: "1px solid rgba(0, 242, 255, 0.1)" }}>
            <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{formatSol(totalEarned)} SOL</Typography>
            <Typography variant="caption" color="text.secondary">Total Earnings</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3, textAlign: "center", bgcolor: "rgba(112, 0, 255, 0.05)", border: "1px solid rgba(112, 0, 255, 0.1)" }}>
            <VideocamIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{streams.length}</Typography>
            <Typography variant="caption" color="text.secondary">Total Streams</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3, textAlign: "center", bgcolor: "rgba(255, 75, 75, 0.05)", border: "1px solid rgba(255, 75, 75, 0.1)" }}>
            <BoltIcon sx={{ fontSize: 40, mb: 1, color: "#ff4b4b" }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{recentTips.length}</Typography>
            <Typography variant="caption" color="text.secondary">Recent Super Chats</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3, textAlign: "center", bgcolor: "rgba(0, 255, 128, 0.05)", border: "1px solid rgba(0, 255, 128, 0.1)" }}>
            <TrendingUpIcon sx={{ fontSize: 40, mb: 1, color: "#00ff80" }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{liveStreamsCount}</Typography>
            <Typography variant="caption" color="text.secondary">Active Streams</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 0, overflow: "hidden" }}>
            <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Recent Super Chats</Typography>
              <Chip label="Real-time" size="small" color="primary" variant="outlined" />
            </Box>
            <List disablePadding>
              {recentTips.length === 0 ? (
                <Box sx={{ p: 6, textAlign: "center", opacity: 0.5 }}>
                  <Typography>No transactions yet.</Typography>
                </Box>
              ) : (
                recentTips.map((tip: any, idx: number) => (
                  <Box key={tip._id}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "rgba(112, 0, 255, 0.1)", color: "secondary.main" }}>
                          <BoltIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {tip.sender_wallet.slice(0, 4)}...{tip.sender_wallet.slice(-4)}
                            </Typography>
                            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 900 }}>
                              +{formatSol(tip.amount)} SOL
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ fontStyle: "italic" }}>
                            "{tip.message || "No message"}"
                          </Typography>
                        }
                      />
                    </ListItem>
                    {idx < recentTips.length - 1 && <Divider sx={{ mx: 2, opacity: 0.1 }} />}
                  </Box>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Stream History */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 0, overflow: "hidden" }}>
            <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Stream History</Typography>
            </Box>
            <List disablePadding>
              {streams.length === 0 ? (
                <Box sx={{ p: 6, textAlign: "center", opacity: 0.5 }}>
                  <Typography>No streams recorded.</Typography>
                </Box>
              ) : (
                streams.map((stream: any, idx: number) => {
                  const earnings = streamEarnings.find((e: any) => e._id === stream._id);
                  return (
                    <Box key={stream._id}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{stream.title}</Typography>
                              <Chip 
                                label={stream.status.toUpperCase()} 
                                size="small" 
                                color={stream.status === "live" ? "error" : "default"}
                                sx={{ height: 18, fontSize: "0.6rem", fontWeight: 800 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <AccountBalanceWalletIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption">{formatSol(earnings?.total_earned || 0)} SOL</Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <PeopleIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption">{stream.viewer_count || 0}</Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {idx < streams.length - 1 && <Divider sx={{ mx: 2, opacity: 0.1 }} />}
                    </Box>
                  );
                })
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
