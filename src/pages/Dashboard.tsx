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
        <CircularProgress size={48} thickness={4} sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 10, textAlign: "center" }}>
        <Typography color="error" variant="h5" sx={{ fontWeight: 800 }}>{error}</Typography>
        <Button variant="outlined" sx={{ mt: 3, borderRadius: "12px", fontWeight: 700 }} onClick={() => window.location.reload()}>Retry</Button>
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
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", overflow: "hidden" }}>
      {/* Decorative Blur Backgrounds */}
      <Box 
        sx={{ 
          position: "absolute", top: "10%", left: "-10%", width: "40%", height: "40%", 
          background: (theme: any) => `radial-gradient(circle, ${theme.palette.primary.main}26 0%, transparent 70%)`, 
          zIndex: -1, filter: "blur(80px)" 
        }} 
      />
      <Box 
        sx={{ 
          position: "absolute", bottom: "10%", right: "-10%", width: "40%", height: "40%", 
          background: (theme: any) => `radial-gradient(circle, ${theme.palette.secondary?.main || theme.palette.primary.main}26 0%, transparent 70%)`, 
          zIndex: -1, filter: "blur(80px)" 
        }} 
      />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, md: 3 } }}>
        <SEO title="Creator Dashboard" description="Track your earnings, view recent tips, and manage your creator profile." />
        
        <Box sx={{ mb: { xs: 5, md: 8 }, animation: "fadeInUp 0.3s ease-out" }}>
          <Typography 
            variant={isMobile ? "h3" : "h2"} 
            sx={{ 
              fontWeight: 900, 
              mb: 1,
              background: "linear-gradient(135deg, #fff 0%, #a0a0b0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Creator <Box component="span" sx={{ 
              background: (theme: any) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.main} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>Hub</Box>
          </Typography>
          <Typography color="text.secondary" variant="h6" sx={{ fontWeight: 400 }}>
            Manage your alerts, track earnings, and engage with your community in real-time.
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 6 }} className="fade-in-up">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ 
              p: 3, textAlign: "center", bgcolor: (theme: any) => `${theme.palette.primary.main}0d`, border: (theme: any) => `1px solid ${theme.palette.primary.main}26`, borderRadius: "20px", backdropFilter: "blur(10px)",
              boxShadow: (theme: any) => `0 8px 32px ${theme.palette.primary.main}0d`, transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: (theme: any) => `0 12px 40px ${theme.palette.primary.main}1a` }
            }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 48, mb: 1.5, color: (theme: any) => theme.palette.primary.main, filter: (theme: any) => `drop-shadow(0 0 10px ${theme.palette.primary.main}66)` }} />
              <Typography variant="h4" sx={{ fontWeight: 900, color: (theme: any) => theme.palette.primary.main }}>{formatSol(totalEarned)} <Box component="span" sx={{ fontSize: "1rem", opacity: 0.8 }}>SOL</Box></Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", mt: 1 }}>Total Earnings</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ 
              p: 3, textAlign: "center", bgcolor: (theme: any) => `${theme.palette.secondary?.main || theme.palette.primary.main}0d`, border: (theme: any) => `1px solid ${theme.palette.secondary?.main || theme.palette.primary.main}26`, borderRadius: "20px", backdropFilter: "blur(10px)",
              boxShadow: (theme: any) => `0 8px 32px ${theme.palette.secondary?.main || theme.palette.primary.main}0d`, transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: (theme: any) => `0 12px 40px ${theme.palette.secondary?.main || theme.palette.primary.main}1a` }
            }}>
              <BoltIcon sx={{ fontSize: 48, mb: 1.5, color: (theme: any) => theme.palette.secondary?.main || theme.palette.primary.main, filter: (theme: any) => `drop-shadow(0 0 10px ${theme.palette.secondary?.main || theme.palette.primary.main}66)` }} />
              <Typography variant="h4" sx={{ fontWeight: 900, color: (theme: any) => theme.palette.secondary?.main || theme.palette.primary.main }}>{totalTips}</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", mt: 1 }}>Recent Super Chats</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ 
              p: 3, textAlign: "center", bgcolor: "rgba(255, 75, 75, 0.05)", border: "1px solid rgba(255, 75, 75, 0.15)", borderRadius: "20px", backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px rgba(255, 75, 75, 0.05)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 40px rgba(255, 75, 75, 0.1)" }
            }}>
              <TrendingUpIcon sx={{ fontSize: 48, mb: 1.5, color: "#ff4b4b", filter: "drop-shadow(0 0 10px rgba(255,75,75,0.4))" }} />
              <Typography variant="h4" sx={{ fontWeight: 900, color: "#ff4b4b" }}>{formatSol(avgPerDay)}</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", mt: 1 }}>Avg. Daily Earnings</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper 
              sx={{ 
                p: 3, textAlign: "center", bgcolor: "rgba(0, 255, 128, 0.05)", border: "1px solid rgba(0, 255, 128, 0.2)", borderRadius: "20px", backdropFilter: "blur(10px)", cursor: "pointer", 
                boxShadow: "0 8px 32px rgba(0, 255, 128, 0.05)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 40px rgba(0, 255, 128, 0.15)", borderColor: "rgba(0, 255, 128, 0.4)" } 
              }}
              onClick={copyOverlayUrl}
            >
              <ContentCopyIcon sx={{ fontSize: 48, mb: 1.5, color: "#00ff80", filter: "drop-shadow(0 0 10px rgba(0,255,128,0.4))" }} />
              <Typography variant="h6" sx={{ fontWeight: 900, color: "#00ff80" }}>OBS Overlay</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", mt: 1 }}>Click to copy URL</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Revenue Charts */}
        <Grid container spacing={4} sx={{ mb: 6 }} className="fade-in-up" style={{ animationDelay: "0.1s" }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: { xs: 2, sm: 4 }, height: 420, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", display: "flex", flexDirection: "column" }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, display: "flex", alignItems: "center" }}>
                <TrendingUpIcon sx={{ color: "primary.main", mr: 1.5 }} /> Daily Earnings <Box component="span" sx={{ fontSize: "0.9rem", color: "text.secondary", ml: 1, fontWeight: 500 }}>(SOL)</Box>
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                {dailyEarnings && dailyEarnings.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[...dailyEarnings].reverse().map((e: any) => ({
                      date: e._id.slice(5), // MM-DD format
                      value: e.total_earned / LAMPORTS_PER_SOL,
                      tips: e.tips_count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "rgba(10, 10, 15, 0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", backdropFilter: "blur(10px)" }}
                        itemStyle={{ color: theme.palette.primary.main, fontWeight: 700 }}
                        formatter={(value: any) => [`${Number(value).toFixed(4)} SOL`, "Earned"]}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {dailyEarnings.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "url(#colorPurple)" : "url(#colorCyan)"} />
                        ))}
                      </Bar>
                      <defs>
                        <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.secondary?.main || theme.palette.primary.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.secondary?.main || theme.palette.primary.main} stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", opacity: 0.5, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <Typography sx={{ fontWeight: 600 }}>No superchats yet. Your fans are waiting! 🚀</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: { xs: 2, sm: 4 }, height: 420, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", display: "flex", flexDirection: "column" }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, display: "flex", alignItems: "center" }}>
                <BoltIcon sx={{ color: "secondary.main", mr: 1 }} /> Tip Distribution
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {recentTips && recentTips.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={recentTips.slice(0, 5).map((t: any, i: number) => ({ name: `Tip ${i+1}`, value: t.amount / LAMPORTS_PER_SOL }))}
                        innerRadius={isMobile ? 60 : 75}
                        outerRadius={isMobile ? 80 : 100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill={theme.palette.secondary?.main || theme.palette.primary.main} />
                        <Cell fill={theme.palette.primary.main} />
                        <Cell fill={theme.palette.error.main} />
                        <Cell fill={theme.palette.success.main} />
                        <Cell fill={theme.palette.warning.main} />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "rgba(10, 10, 15, 0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", backdropFilter: "blur(10px)" }}
                        itemStyle={{ fontWeight: 700 }}
                        formatter={(value: any) => [`${Number(value).toFixed(4)} SOL`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%", opacity: 0.5, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <Typography sx={{ fontWeight: 600 }}>No tips yet.</Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Chip label="Top 5 Recent Tips" size="small" sx={{ bgcolor: "rgba(255,255,255,0.05)", fontWeight: 700, borderRadius: "8px" }} />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={4} className="fade-in-up" style={{ animationDelay: "0.2s" }}>
          {/* Recent Activity */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 0, overflow: "hidden", bgcolor: "rgba(255,255,255,0.02)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(20px)" }}>
              <Box sx={{ p: { xs: 3, sm: 4 }, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Recent Super Chats</Typography>
                <Chip label="Real-time" size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, borderRadius: "8px", borderWidth: "2px" }} />
              </Box>
              <List disablePadding>
                {!recentTips || recentTips.length === 0 ? (
                  <Box sx={{ p: 8, textAlign: "center", opacity: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>No transactions yet.</Typography>
                  </Box>
                ) : (
                  recentTips.map((tip: any, idx: number) => (
                    <Box key={tip._id}>
                      <ListItem sx={{ py: 3, px: { xs: 3, sm: 4 }, transition: "all 0.2s ease", "&:hover": { bgcolor: "rgba(255,255,255,0.02)" } }}>
                        <ListItemAvatar sx={{ mr: 2 }}>
                          <Avatar sx={{ 
                            width: 48, height: 48, borderRadius: "14px", 
                            bgcolor: (theme: any) => `${theme.palette.secondary?.main || theme.palette.primary.main}1a`, color: "secondary.main",
                            boxShadow: (theme: any) => `0 0 15px ${theme.palette.secondary?.main || theme.palette.primary.main}33`
                          }}>
                            <BoltIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                {tip.sender_wallet.slice(0, 4)}...{tip.sender_wallet.slice(-4)}
                              </Typography>
                              <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 900, textShadow: (theme: any) => `0 0 10px ${theme.palette.primary.main}4d` }}>
                                +{formatSol(tip.amount)} SOL
                              </Typography>
                              {tip.status && (
                                <Chip 
                                  label={tip.status} 
                                  size="small" 
                                  variant="outlined"
                                  color={tip.status === "verified" ? "success" : tip.status === "failed" ? "error" : "warning"}
                                  sx={{ ml: 1, height: 20, fontSize: "0.65rem", fontWeight: 800, borderRadius: "6px" }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: "text.primary", opacity: 0.8, fontStyle: "italic" }}>
                              "{tip.message || "No message"}"
                            </Typography>
                          }
                        />
                      </ListItem>
                      {idx < recentTips.length - 1 && <Divider sx={{ mx: 4, opacity: 0.1 }} />}
                    </Box>
                  ))
                )}
              </List>
            </Paper>
          </Grid>

          {/* Announcement + OBS Overlay */}
          <Grid size={{ xs: 12, md: 5 }}>
            {/* OBS Overlay Card */}
            <Paper sx={{ p: { xs: 3, sm: 4 }, mb: 4, bgcolor: (theme: any) => `${theme.palette.primary.main}08`, border: (theme: any) => `1px solid ${theme.palette.primary.main}33`, borderRadius: "24px", backdropFilter: "blur(20px)" }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, display: "flex", alignItems: "center", gap: 1.5, color: "primary.main" }}>
                🎬 OBS Overlay
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.8, lineHeight: 1.6 }}>
                Add this URL as a Browser Source in OBS to display real-time Super Chat alerts on your stream. The secret key ensures only you can use your overlay.
              </Typography>

              {overlayToken ? (
                <>
                  <Box 
                    sx={{ 
                       p: 2.5, 
                       bgcolor: "rgba(0,0,0,0.4)", 
                       borderRadius: "14px", 
                       fontFamily: "monospace", 
                       fontSize: "0.8rem",
                       wordBreak: "break-all",
                       color: (theme: any) => theme.palette.primary.main,
                       border: (theme: any) => `1px solid ${theme.palette.primary.main}33`,
                       mb: 3
                    }}
                  >
                    {getOverlayUrl()}
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      onClick={copyOverlayUrl}
                      startIcon={<ContentCopyIcon />}
                      sx={{ borderRadius: "14px", py: 1.5, fontWeight: 800, boxShadow: (theme: any) => `0 8px 20px ${theme.palette.primary.main}4d` }}
                    >
                      Copy URL
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="warning" 
                      onClick={handleGenerateToken}
                      disabled={tokenLoading}
                      sx={{ borderRadius: "14px", fontWeight: 800, minWidth: { xs: 60, sm: 140 } }}
                    >
                      {tokenLoading ? <CircularProgress size={20} color="inherit" /> : (isMobile ? <RefreshIcon /> : "Regenerate")}
                    </Button>
                  </Box>
                  <Typography variant="caption" sx={{ display: "block", mt: 2, opacity: 0.6, fontWeight: 500 }}>
                    ⚠️ Regenerating invalidates your current overlay URL. You will need to update it in OBS.
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
                  sx={{ py: 1.5, borderRadius: "14px", fontWeight: 800, boxShadow: (theme: any) => `0 8px 20px ${theme.palette.primary.main}4d` }}
                >
                  {tokenLoading ? "Generating..." : "Generate Overlay URL"}
                </Button>
              )}
            </Paper>

            {/* Announcement Card */}
            <Paper sx={{ p: { xs: 3, sm: 4 }, bgcolor: (theme: any) => `${theme.palette.secondary?.main || theme.palette.primary.main}0d`, border: (theme: any) => `1px solid ${theme.palette.secondary?.main || theme.palette.primary.main}33`, borderRadius: "24px", backdropFilter: "blur(20px)" }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, display: "flex", alignItems: "center", gap: 1.5, color: "secondary.main" }}>
                <BoltIcon /> Broadcast
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.8, lineHeight: 1.6 }}>
                Send an instant notification to all your followers. Perfect for going live or special updates!
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="What's happening? (e.g. Going live in 5 mins!)"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                disabled={announcementLoading}
                sx={{ 
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(0,0,0,0.2)",
                    borderRadius: "14px",
                    "&:hover fieldset": { borderColor: (theme: any) => `${theme.palette.secondary?.main || theme.palette.primary.main}66` },
                    "&.Mui-focused fieldset": { borderColor: (theme: any) => theme.palette.secondary?.main || theme.palette.primary.main }
                  }
                }}
              />
              <Button 
                variant="contained" 
                color="secondary" 
                fullWidth 
                onClick={handleSendAnnouncement}
                disabled={announcementLoading || !announcement.trim()}
                startIcon={announcementLoading ? <CircularProgress size={20} color="inherit" /> : <BoltIcon />}
                sx={{ py: 1.5, borderRadius: "14px", fontWeight: 800, boxShadow: (theme: any) => `0 8px 20px ${theme.palette.secondary?.main || theme.palette.primary.main}4d` }}
              >
                {announcementLoading ? "Sending..." : "Broadcast to Followers"}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
