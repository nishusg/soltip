import { useState, useEffect } from "react";
import { getDashboardData, sendAnnouncement, getOverlayToken, generateOverlayToken } from "../services/api";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
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
  Button,
  TextField,
  useTheme,
  useMediaQuery
} from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [overlayToken, setOverlayToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    getDashboardData()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // Fetch existing overlay token
    getOverlayToken()
      .then(res => setOverlayToken(res.overlay_token))
      .catch(() => {});
  }, []);

  const handleGenerateToken = async () => {
    setTokenLoading(true);
    try {
      const res = await generateOverlayToken();
      setOverlayToken(res.overlay_token);
      toast.success("Overlay token generated! Copy the URL below.");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate token");
    } finally {
      setTokenLoading(false);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) return;
    setAnnouncementLoading(true);
    try {
      const res = await sendAnnouncement(announcement);
      toast.success(res.message);
      setAnnouncement("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send announcement");
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const formatSol = (lamports: number) => (lamports / LAMPORTS_PER_SOL).toFixed(4);

  const getOverlayUrl = () => {
    if (!data?.user?.wallet_address || !overlayToken) return null;
    return `${window.location.origin}/overlay/${data.user.wallet_address}?key=${overlayToken}`;
  };

  const copyOverlayUrl = () => {
    const url = getOverlayUrl();
    if (!url) {
      toast.error("Generate an overlay token first!");
      return;
    }
    navigator.clipboard.writeText(url);
    toast.success("Overlay URL copied! Paste it as a Browser Source in OBS.");
  };

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

  const { user, recentTips, dailyEarnings } = data;

  // Calculate stats
  const totalEarned = user?.total_received || 0;
  const totalTips = recentTips?.length || 0;
  const totalDays = dailyEarnings?.length || 0;
  const avgPerDay = totalDays > 0 
    ? dailyEarnings.reduce((sum: number, d: any) => sum + d.total_earned, 0) / totalDays 
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 }, px: { xs: 2, md: 3 } }}>
      <SEO title="Creator Dashboard" description="Track your earnings, view recent tips, and manage your creator profile." />
      <Box sx={{ mb: { xs: 4, md: 6 }, animation: "fadeInUp 0.3s ease-out" }}>
        <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 900, mb: 1 }}>
          Creator <Box component="span" sx={{ color: "primary.main" }}>Dashboard</Box>
        </Typography>
        <Typography color="text.secondary" variant={isMobile ? "body2" : "body1"}>
          Track your earnings, view recent tips, and engage with your community.
        </Typography>
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
            <BoltIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{totalTips}</Typography>
            <Typography variant="caption" color="text.secondary">Recent Super Chats</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3, textAlign: "center", bgcolor: "rgba(255, 75, 75, 0.05)", border: "1px solid rgba(255, 75, 75, 0.1)" }}>
            <TrendingUpIcon sx={{ fontSize: 40, mb: 1, color: "#ff4b4b" }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{formatSol(avgPerDay)}</Typography>
            <Typography variant="caption" color="text.secondary">Avg. Daily Earnings</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper 
            sx={{ p: 3, textAlign: "center", bgcolor: "rgba(0, 255, 128, 0.05)", border: "1px solid rgba(0, 255, 128, 0.1)", cursor: "pointer", transition: "all 0.2s", "&:hover": { borderColor: "rgba(0, 255, 128, 0.3)" } }}
            onClick={copyOverlayUrl}
          >
            <ContentCopyIcon sx={{ fontSize: 40, mb: 1, color: "#00ff80" }} />
            <Typography variant="body2" sx={{ fontWeight: 800 }}>OBS Overlay</Typography>
            <Typography variant="caption" color="text.secondary">Click to copy URL</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Revenue Charts */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: 400, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Daily Earnings (SOL)</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              {dailyEarnings && dailyEarnings.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...dailyEarnings].reverse().map((e: any) => ({
                    date: e._id.slice(5), // MM-DD format
                    value: e.total_earned / LAMPORTS_PER_SOL,
                    tips: e.tips_count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1a1a25", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                      itemStyle={{ color: "#00f2ff" }}
                      formatter={(value: any) => [`${Number(value).toFixed(4)} SOL`, "Earned"]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {dailyEarnings.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#7000ff" : "#00f2ff"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", opacity: 0.5 }}>
                  <Typography>No earnings data yet. Tips will appear here.</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: 400, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Tip Distribution</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              {recentTips && recentTips.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={recentTips.slice(0, 5).map((t: any, i: number) => ({ name: `Tip ${i+1}`, value: t.amount / LAMPORTS_PER_SOL }))}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#7000ff" />
                      <Cell fill="#00f2ff" />
                      <Cell fill="#ff4b4b" />
                      <Cell fill="#00ff80" />
                      <Cell fill="#ffb400" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", opacity: 0.5 }}>
                  <Typography>No tips yet.</Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ textAlign: "center", mt: 1 }}>
              <Typography variant="caption" color="text.secondary">Top 5 recent tips</Typography>
            </Box>
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
              {!recentTips || recentTips.length === 0 ? (
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

        {/* Announcement + OBS Overlay */}
        <Grid size={{ xs: 12, md: 5 }}>
          {/* OBS Overlay Card */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: "rgba(0, 242, 255, 0.03)", border: "1px solid rgba(0, 242, 255, 0.1)", borderRadius: "16px" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
              🎬 OBS Overlay
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
              Add this URL as a Browser Source in OBS to display Super Chat alerts. The secret key prevents others from using your overlay.
            </Typography>

            {overlayToken ? (
              <>
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: "rgba(0,0,0,0.3)", 
                    borderRadius: "10px", 
                    fontFamily: "monospace", 
                    fontSize: "0.75rem",
                    wordBreak: "break-all",
                    color: "#00f2ff",
                    mb: 2
                  }}
                >
                  {getOverlayUrl()}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    onClick={copyOverlayUrl}
                    startIcon={<ContentCopyIcon />}
                    sx={{ borderRadius: "12px", fontWeight: 700 }}
                  >
                    Copy URL
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="warning" 
                    onClick={handleGenerateToken}
                    disabled={tokenLoading}
                    startIcon={tokenLoading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                    sx={{ borderRadius: "12px", fontWeight: 700, minWidth: 140 }}
                  >
                    Regenerate
                  </Button>
                </Box>
                <Typography variant="caption" sx={{ display: "block", mt: 1.5, opacity: 0.5 }}>
                  ⚠️ Regenerating will invalidate your current overlay URL. You'll need to update it in OBS.
                </Typography>
              </>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                onClick={handleGenerateToken}
                disabled={tokenLoading}
                startIcon={tokenLoading ? <CircularProgress size={20} color="inherit" /> : <BoltIcon />}
                sx={{ py: 1.5, borderRadius: "12px", fontWeight: 800 }}
              >
                {tokenLoading ? "Generating..." : "Generate Overlay URL"}
              </Button>
            )}
          </Paper>

          {/* Announcement Card */}
          <Paper sx={{ p: 3, bgcolor: "rgba(112, 0, 255, 0.05)", border: "1px solid rgba(112, 0, 255, 0.1)", borderRadius: "16px" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <BoltIcon color="secondary" /> Send Announcement
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
              Notify all your followers instantly. Perfect for special updates!
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="What's happening?"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              disabled={announcementLoading}
              sx={{ mb: 2 }}
              slotProps={{ input: { sx: { borderRadius: "12px" } } }}
            />
            <Button 
              variant="contained" 
              color="secondary" 
              fullWidth 
              onClick={handleSendAnnouncement}
              disabled={announcementLoading || !announcement.trim()}
              startIcon={announcementLoading ? <CircularProgress size={20} color="inherit" /> : <BoltIcon />}
              sx={{ py: 1.5, borderRadius: "12px", fontWeight: 800 }}
            >
              {announcementLoading ? "Sending..." : "Broadcast to Followers"}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
