import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { getDashboardData, getOverlayToken, generateOverlayToken, sendTestAlert, saveOverlaySettings } from "../services/api";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import { useSocket } from "../context/SocketContext";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import BoringAvatar from "boring-avatars";
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
  Link,
  useTheme,
  useMediaQuery,
  Switch,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  FormControlLabel
} from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import AlertCustomizer from "../components/AlertCustomizer";
import { 
  AreaChart,
  Area,
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

// OBS Browser Source Default Configurations
const OBS_DEFAULT_WIDTH = 1920;
const OBS_DEFAULT_HEIGHT = 1080;

interface DailyEarning {
  _id: string;
  total_earned: number;
  tips_count: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box
        sx={{
          bgcolor: "rgba(11, 15, 23, 0.95)",
          border: "1px solid rgba(56, 189, 248, 0.2)",
          borderRadius: "12px",
          p: 2,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6), 0 0 15px rgba(56, 189, 248, 0.15)",
          backdropFilter: "blur(12px)"
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", fontWeight: 700, mb: 0.5, fontFamily: "Space Grotesk" }}>
          {data.rawDate || data.label}
        </Typography>
        <Typography sx={{ color: "#38BDF8", fontSize: "0.95rem", fontWeight: 800, fontFamily: "Space Grotesk", display: "flex", alignItems: "center", gap: 0.5 }}>
          💰 {data.value.toFixed(4)} SOL
        </Typography>
        <Typography sx={{ color: "#14F195", fontSize: "0.8rem", fontWeight: 700, mt: 0.5, fontFamily: "Space Grotesk" }}>
          ⚡ {data.tips} Super {data.tips === 1 ? "chat" : "chats"}
        </Typography>
      </Box>
    );
  }
  return null;
};

function calculateStreaks(dailyEarnings: DailyEarning[]): { current: number; max: number } {
  if (!dailyEarnings || dailyEarnings.length === 0) {
    return { current: 0, max: 0 };
  }

  // Parse YYYY-MM-DD strings and set to midnight local time for safe timezone-agnostic date math
  const getMidnightDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  const sorted = [...dailyEarnings].sort((a, b) => a._id.localeCompare(b._id));
  const activeDays = new Set(
    sorted
      .filter(e => e.tips_count > 0 || e.total_earned > 0)
      .map(e => e._id)
  );

  if (activeDays.size === 0) {
    return { current: 0, max: 0 };
  }

  let maxStreak = 0;
  let tempStreak = 0;
  let lastDateStr = "";

  const dates = Array.from(activeDays).sort((a, b) => a.localeCompare(b));

  for (let i = 0; i < dates.length; i++) {
    const currentDateStr = dates[i];
    if (i === 0) {
      tempStreak = 1;
    } else {
      const d1 = getMidnightDate(dates[i - 1]);
      const d2 = getMidnightDate(currentDateStr);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        if (tempStreak > maxStreak) maxStreak = tempStreak;
        tempStreak = 1;
      }
    }
    lastDateStr = currentDateStr;
  }
  if (tempStreak > maxStreak) maxStreak = tempStreak;

  let currentStreak = 0;
  if (lastDateStr) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    
    const d1 = getMidnightDate(lastDateStr);
    const d2 = getMidnightDate(todayStr);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }
  }

  return { current: currentStreak, max: maxStreak };
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overlayToken, setOverlayToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [chartTab, setChartTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [filterDate, setFilterDate] = useState<string>("");
  const { connected } = useSocket();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Save overlay customizer settings and refresh local user stats
  const handleSaveOverlaySettings = async (settings: any) => {
    await saveOverlaySettings(settings);
    toast.success("Overlay settings saved successfully!");
    try {
      const refreshed = await getDashboardData();
      setData(refreshed);
    } catch (e) {
      console.error("Failed to refresh dashboard stats:", e);
    }
  };

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

  const handleSendTestAlert = async () => {
    setTestLoading(true);
    try {
      const res = await sendTestAlert();
      toast.success(res.message || "Test alert fired successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger test alert");
    } finally {
      setTestLoading(false);
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

  // Streak calculations
  const streaks = calculateStreaks(dailyEarnings);

  // Filter recent tips by selected date
  const filteredTips = recentTips?.filter((tip: any) => {
    if (!filterDate) return true;
    const tipDateStr = new Date(tip.timestamp).toISOString().split("T")[0];
    return tipDateStr === filterDate;
  }) || [];

  const getChartData = (tab: "daily" | "weekly" | "monthly") => {
    if (!dailyEarnings) return [];

    const dataMap = new Map<string, { total_earned: number; tips_count: number }>();
    dailyEarnings.forEach((e: any) => {
      dataMap.set(e._id, {
        total_earned: e.total_earned / LAMPORTS_PER_SOL,
        tips_count: e.tips_count
      });
    });

    const today = new Date();

    if (tab === "daily") {
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const yyyymmdd = d.toISOString().split("T")[0];
        const dateLabel = yyyymmdd.slice(5); // MM-DD format
        const entry = dataMap.get(yyyymmdd) || { total_earned: 0, tips_count: 0 };
        result.push({
          label: dateLabel,
          value: entry.total_earned,
          tips: entry.tips_count,
          rawDate: yyyymmdd
        });
      }
      return result;
    } else if (tab === "weekly") {
      const result = [];
      for (let i = 3; i >= 0; i--) {
        const end = new Date();
        end.setDate(today.getDate() - i * 7);
        const start = new Date();
        start.setDate(end.getDate() - 6);

        let total = 0;
        let tips = 0;
        for (let k = 0; k < 7; k++) {
          const d = new Date(start);
          d.setDate(start.getDate() + k);
          const yyyymmdd = d.toISOString().split("T")[0];
          const entry = dataMap.get(yyyymmdd);
          if (entry) {
            total += entry.total_earned;
            tips += entry.tips_count;
          }
        }

        const startLabel = start.toISOString().split("T")[0].slice(5);
        const endLabel = end.toISOString().split("T")[0].slice(5);
        result.push({
          label: `${startLabel} to ${endLabel}`,
          value: total,
          tips: tips,
          rawDate: `Week ${4 - i}`
        });
      }
      return result;
    } else {
      const result = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(today.getMonth() - i);
        const year = d.getFullYear();
        const month = d.getMonth();

        let total = 0;
        let tips = 0;
        
        dailyEarnings.forEach((e: any) => {
          const eDate = new Date(e._id);
          if (eDate.getFullYear() === year && eDate.getMonth() === month) {
            total += e.total_earned / LAMPORTS_PER_SOL;
            tips += e.tips_count;
          }
        });

        const monthName = d.toLocaleString("default", { month: "short" });
        result.push({
          label: `${monthName} ${year}`,
          value: total,
          tips: tips,
          rawDate: monthName
        });
      }
      return result;
    }
  };

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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, display: "flex", alignItems: "center", fontFamily: "Space Grotesk, sans-serif" }}>
                    <TrendingUpIcon sx={{ color: "primary.main", mr: 1.5 }} /> Tipping Activity <Box component="span" sx={{ fontSize: "0.9rem", color: "text.secondary", ml: 1, fontWeight: 500 }}>(SOL)</Box>
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {(["daily", "weekly", "monthly"] as const).map((tab) => (
                      <Button
                        key={tab}
                        size="small"
                        onClick={() => setChartTab(tab)}
                        sx={{
                          borderRadius: "20px",
                          px: 2.2,
                          py: 0.6,
                          textTransform: "capitalize",
                          fontWeight: 800,
                          fontSize: "0.75rem",
                          fontFamily: "Space Grotesk, sans-serif",
                          bgcolor: chartTab === tab ? "primary.main" : "rgba(255,255,255,0.02)",
                          color: chartTab === tab ? "#000" : "rgba(255,255,255,0.5)",
                          border: chartTab === tab ? "none" : "1px solid rgba(255,255,255,0.06)",
                          boxShadow: chartTab === tab ? (theme: any) => `0 4px 15px ${theme.palette.primary.main}33` : "none",
                          "&:hover": {
                            bgcolor: chartTab === tab ? "primary.main" : "rgba(255,255,255,0.06)",
                            color: chartTab === tab ? "#000" : "#fff"
                          }
                        }}
                      >
                        {tab}
                      </Button>
                    ))}
                  </Box>
                </Box>
                
                {/* Streaks Banner */}
                <Box sx={{ display: "flex", gap: 3, mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: "#38BDF8", fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5, letterSpacing: "0.02em", fontFamily: "Space Grotesk, sans-serif" }}>
                    🔥 Current Streak: <Box component="span" sx={{ fontWeight: 900 }}>{streaks.current} {streaks.current === 1 ? "day" : "days"}</Box>
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#14F195", fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5, letterSpacing: "0.02em", fontFamily: "Space Grotesk, sans-serif" }}>
                    🏆 Max Streak: <Box component="span" sx={{ fontWeight: 900 }}>{streaks.max} {streaks.max === 1 ? "day" : "days"}</Box>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                {dailyEarnings && dailyEarnings.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData(chartTab)}>
                      <defs>
                        <linearGradient id="tippingGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.25}/>
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} dy={10} style={{ fontFamily: "Space Grotesk, sans-serif" }} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} dx={-10} style={{ fontFamily: "Space Grotesk, sans-serif" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={theme.palette.primary.main} 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#tippingGlow)" 
                        activeDot={{ r: 6, strokeWidth: 0, fill: "#14F195" }}
                      />
                    </AreaChart>
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
              <Box sx={{ p: { xs: 3, sm: 4 }, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Recent Super Chats</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <TextField
                    type="date"
                    size="small"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                    sx={{
                      width: 150,
                      "& .MuiInputBase-root": {
                        borderRadius: "10px",
                        bgcolor: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#fff",
                        fontFamily: "Space Grotesk, sans-serif",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        "& fieldset": { border: "none" },
                        "&:hover": { bgcolor: "rgba(255,255,255,0.06)" }
                      },
                      "& input::-webkit-calendar-picker-indicator": {
                        filter: "invert(1)"
                      }
                    }}
                  />
                  {filterDate ? (
                    <Button 
                      size="small" 
                      onClick={() => setFilterDate("")}
                      sx={{ 
                        borderRadius: "8px", 
                        px: 1.5,
                        textTransform: "none", 
                        fontWeight: 700, 
                        fontSize: "0.75rem",
                        color: "primary.main",
                        border: (theme: any) => `1px solid ${theme.palette.primary.main}33`,
                        "&:hover": { bgcolor: (theme: any) => `${theme.palette.primary.main}10` }
                      }}
                    >
                      Clear
                    </Button>
                  ) : (
                    <Chip label="Real-time" size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, borderRadius: "8px", borderWidth: "2px" }} />
                  )}
                </Box>
              </Box>
              <List disablePadding>
                {filteredTips.length === 0 ? (
                  <Box sx={{ p: 8, textAlign: "center", opacity: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {filterDate ? "No superchats received on this day." : "No transactions yet."}
                    </Typography>
                  </Box>
                ) : (
                  filteredTips.map((tip: any, idx: number) => (
                    <Box key={tip._id}>
                      <ListItem sx={{ py: 3, px: { xs: 3, sm: 4 }, transition: "all 0.2s ease", "&:hover": { bgcolor: "rgba(255,255,255,0.02)" } }}>
                        <ListItemAvatar sx={{ mr: 2 }}>
                          <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "14px",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: (theme: any) => `0 0 15px ${theme.palette.secondary?.main || theme.palette.primary.main}33`
                          }}>
                            <BoringAvatar
                              name={tip.sender_name || tip.sender_wallet}
                              variant="beam"
                              size={48}
                              colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]}
                            />
                          </Box>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                <Link component={RouterLink} to={`/profile/${tip.sender_wallet}`} color="inherit" sx={{ textDecoration: "none", "&:hover": { color: "primary.main" } }}>
                                  {tip.sender_name || `${tip.sender_wallet.slice(0, 4)}...${tip.sender_wallet.slice(-4)}`}
                                </Link>
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
                      {idx < filteredTips.length - 1 && <Divider sx={{ mx: 4, opacity: 0.1 }} />}
                    </Box>
                  ))
                )}
              </List>
            </Paper>
          </Grid>

          {/* OBS Streaming Hub */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ 
              p: { xs: 3, sm: 4 }, 
              bgcolor: "rgba(255, 255, 255, 0.02)", 
              border: (theme: any) => `1px solid ${theme.palette.primary.main}33`, 
              borderRadius: "24px", 
              backdropFilter: "blur(20px)",
              boxShadow: (theme: any) => `0 8px 32px ${theme.palette.primary.main}0d`,
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Top glowing decorative bar */}
              <Box sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: (theme: any) => `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.main} 100%)`
              }} />

              {/* Title & Connection Status */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, display: "flex", alignItems: "center", gap: 1.5, color: "primary.main" }}>
                  🎬 OBS Streaming Hub
                </Typography>
                
                {/* Glowing WebSocket Status Badge */}
                <Chip 
                  label={connected ? "Connected" : "Reconnecting"} 
                  size="small" 
                  sx={{ 
                    height: 24, 
                    fontSize: "0.7rem", 
                    fontWeight: 800, 
                    textTransform: "uppercase",
                    borderRadius: "6px",
                    bgcolor: connected ? "rgba(0, 255, 128, 0.1)" : "rgba(255, 75, 75, 0.1)",
                    color: connected ? "#00ff80" : "#ff4b4b",
                    border: connected ? "1px solid rgba(0, 255, 128, 0.3)" : "1px solid rgba(255, 75, 75, 0.3)",
                    animation: connected ? "pulse 2s infinite" : "none",
                    "@keyframes pulse": {
                      "0%": { boxShadow: "0 0 0 0 rgba(0, 255, 128, 0.4)" },
                      "70%": { boxShadow: "0 0 0 6px rgba(0, 255, 128, 0)" },
                      "100%": { boxShadow: "0 0 0 0 rgba(0, 255, 128, 0)" }
                    }
                  }} 
                />
              </Box>

              <Typography variant="body2" sx={{ mb: 4, opacity: 0.8, lineHeight: 1.6 }}>
                Integrate live Super Chat alerts into your stream overlay. Simply add your secret URL as a Browser Source in OBS or Streamlabs.
              </Typography>

              {overlayToken ? (
                <>
                  {/* Stream URL Input Bar */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "text.primary", display: "flex", alignItems: "center", gap: 0.5 }}>
                      🔑 Your Unique Browser Source Link
                    </Typography>
                    <Box 
                      sx={{ 
                         p: 2, 
                         bgcolor: "rgba(0,0,0,0.3)", 
                         borderRadius: "14px", 
                         fontFamily: "monospace", 
                         fontSize: "0.8rem",
                         wordBreak: "break-all",
                         color: (theme: any) => theme.palette.primary.main,
                         border: (theme: any) => `1px solid ${theme.palette.primary.main}1a`,
                         display: "flex",
                         alignItems: "center",
                         justifyContent: "space-between",
                         gap: 2
                      }}
                    >
                      <Box sx={{ flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {getOverlayUrl()}
                      </Box>
                      <Button
                        size="small"
                        onClick={copyOverlayUrl}
                        sx={{ 
                          minWidth: "auto", 
                          p: 1, 
                          borderRadius: "8px", 
                          color: "primary.main",
                          bgcolor: (theme: any) => `${theme.palette.primary.main}10`,
                          "&:hover": { bgcolor: (theme: any) => `${theme.palette.primary.main}20` }
                        }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      </Button>
                    </Box>
                  </Box>

                  {/* Visual Setup Walkthrough Steps */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: "text.primary" }}>
                      📋 Quick OBS Setup Guide
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {/* Step 1 */}
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem", fontWeight: 800, bgcolor: "primary.main", color: "#000" }}>1</Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>Add a Browser Source</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                            In OBS, click **+** under Sources and select **Browser**.
                          </Typography>
                        </Box>
                      </Box>

                      {/* Step 2 */}
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem", fontWeight: 800, bgcolor: "primary.main", color: "#000" }}>2</Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>Set Resolution & Properties</Typography>
                          <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                            <Chip label={`Width: ${OBS_DEFAULT_WIDTH}`} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: "rgba(255,255,255,0.05)" }} />
                            <Chip label={`Height: ${OBS_DEFAULT_HEIGHT}`} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: "rgba(255,255,255,0.05)" }} />
                          </Box>
                        </Box>
                      </Box>

                      {/* Step 3 */}
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem", fontWeight: 800, bgcolor: "primary.main", color: "#000" }}>3</Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>Enable Alert Sound</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                            Check **"Control audio via OBS"** if you want to isolate alert sounds in your stream mixer.
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3, opacity: 0.05 }} />

                  {/* Simulation Room / Test Panel */}
                  <Box sx={{ mb: 3.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}>
                      🧪 Alert Simulator
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                      Test your sound effects and overlay animations instantly. Open your overlay link first!
                    </Typography>
                    
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      fullWidth 
                      onClick={handleSendTestAlert}
                      disabled={testLoading}
                      startIcon={testLoading ? <CircularProgress size={20} color="inherit" /> : <BoltIcon />}
                      sx={{ 
                        borderRadius: "14px", 
                        py: 1.5, 
                        fontWeight: 800, 
                        background: (theme: any) => `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
                        boxShadow: (theme: any) => `0 8px 24px ${theme.palette.primary.main}33`,
                        "&:hover": {
                          boxShadow: (theme: any) => `0 12px 30px ${theme.palette.primary.main}4d`
                        }
                      }}
                    >
                      {testLoading ? "Firing Alert..." : "Send Test Alert 🚀"}
                    </Button>
                  </Box>

                  {/* Actions / Regenerate */}
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      color="warning" 
                      fullWidth
                      onClick={handleGenerateToken}
                      disabled={tokenLoading}
                      startIcon={tokenLoading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon sx={{ fontSize: 16 }} />}
                      sx={{ borderRadius: "12px", py: 1.2, fontWeight: 800, textTransform: "none", fontSize: "0.85rem" }}
                    >
                      Regenerate Secret Key
                    </Button>
                  </Box>
                  <Typography variant="caption" sx={{ display: "block", mt: 2, opacity: 0.5, fontWeight: 500, textAlign: "center" }}>
                    ⚠️ Regenerating invalidates your current link and requires updating OBS.
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
                  sx={{ py: 1.8, borderRadius: "14px", fontWeight: 800, boxShadow: (theme: any) => `0 8px 20px ${theme.palette.primary.main}4d` }}
                >
                  {tokenLoading ? "Generating..." : "Generate Overlay URL"}
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ mt: 3 }} className="fade-in-up" style={{ animationDelay: "0.3s" }}>
          {/* Stream Alert & TTS Settings Customizer Component */}
          <Grid size={{ xs: 12 }}>
            <AlertCustomizer
              initialSettings={data?.user?.overlay_settings}
              onSave={handleSaveOverlaySettings}
              testLoading={testLoading}
              onSendTestAlert={handleSendTestAlert}
              tokenLoading={tokenLoading}
              onGenerateToken={handleGenerateToken}
              overlayToken={overlayToken}
              connected={connected}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
