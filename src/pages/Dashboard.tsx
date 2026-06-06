import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { getDashboardData, getOverlayToken, generateOverlayToken, sendTestAlert, saveOverlaySettings } from "../services/api";
import toast from "react-hot-toast";
import SEO from "../components/common/SEO";
import { useSocket } from "../context/SocketContext";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import BoringAvatar from "boring-avatars";
import { logger } from "../utils/logger";
import type { DashboardData, Tip, DailyEarning, OverlaySettings } from "../types";
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
  Button,
  TextField,
  Link,
  useTheme,
  useMediaQuery,
  Pagination
} from "@mui/material";
import { DashboardSkeleton } from "../components/common/LoadingSkeletons";
import BoltIcon from "@mui/icons-material/Bolt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import TvIcon from "@mui/icons-material/Tv";
import { useConnection } from "@solana/wallet-adapter-react";
import { useWalletAuth } from "../hooks/useWalletAuth";
import AlertCustomizer from "../components/features/alerts/AlertCustomizer";
import {
  AreaChart,
  Area,
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overlayToken, setOverlayToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [chartTab, setChartTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [filterDate, setFilterDate] = useState<string>("");
  const [page, setPage] = useState(1);
  const [tips, setTips] = useState<Tip[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTipsCount, setTotalTipsCount] = useState(0);
  const { socket, connected } = useSocket();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notif: any) => {
      if (notif.type === "tip_received") {
        logger.log("Dashboard received tip notification, reloading...");
        loadDashboard();
      }
    };

    socket.on("notification", handleNotification);
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket]);

  useEffect(() => {
    setPage(1);
  }, [filterDate]);

  // Wallet Connection & Live Balance States
  const { connection } = useConnection();
  const { publicKey } = useWalletAuth();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [fetchingBalance, setFetchingBalance] = useState(false);

  const fetchBalance = async () => {
    if (publicKey && connection) {
      setFetchingBalance(true);
      try {
        const bal = await connection.getBalance(publicKey);
        setWalletBalance(bal / LAMPORTS_PER_SOL);
      } catch (err) {
        logger.error("Failed to fetch wallet balance:", err);
        setWalletBalance(null);
      } finally {
        setFetchingBalance(false);
      }
    } else {
      setWalletBalance(null);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [publicKey, connection]);

  // Save overlay customizer settings and refresh local user stats
  const handleSaveOverlaySettings = async (settings: Partial<OverlaySettings>) => {
    await saveOverlaySettings(settings);
    toast.success("Overlay settings saved successfully!");
    try {
      const refreshed = await getDashboardData(page, 5, filterDate);
      setData(refreshed);
      setTips(refreshed.recentTips || []);
      setTotalPages(refreshed.pagination?.pages || 1);
      setTotalTipsCount(refreshed.pagination?.total || 0);
    } catch (e) {
      logger.error("Failed to refresh dashboard stats:", e);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const dashboardData = await getDashboardData(1, 5, "");
      setData(dashboardData);
      setTips(dashboardData.recentTips || []);
      setTotalPages(dashboardData.pagination?.pages || 1);
      setTotalTipsCount(dashboardData.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

    try {
      const tokenRes = await getOverlayToken();
      setOverlayToken(tokenRes.overlay_token);
    } catch (err) {
      // Ignore error
    }
  };

  // Fetch paginated tips on page or filterDate changes
  useEffect(() => {
    if (loading) return;

    async function fetchPaginatedTips() {
      try {
        const dashboardData = await getDashboardData(page, 5, filterDate);
        setTips(dashboardData.recentTips || []);
        setTotalPages(dashboardData.pagination?.pages || 1);
        setTotalTipsCount(dashboardData.pagination?.total || 0);
      } catch (err: any) {
        logger.error("Failed to fetch paginated tips for dashboard:", err);
      }
    }

    fetchPaginatedTips();
  }, [page, filterDate, loading]);

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
    return `${window.location.origin}/overlay/${data.user.wallet_address}#key=${overlayToken}`;
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
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Container sx={{ py: 10, textAlign: "center" }}>
        <Typography color="error" variant="h5" sx={{ fontWeight: 800 }}>{error}</Typography>
        <Button variant="outlined" sx={{ mt: 3, borderRadius: "12px", fontWeight: 700 }} onClick={() => window.location.reload()}>Retry</Button>
      </Container>
    );
  }

  if (!data) return null;

  const { user, dailyEarnings } = data;

  // Calculate stats
  const totalEarned = user?.total_received || 0;
  const totalTips = totalTipsCount;
  const totalDays = dailyEarnings?.length || 0;
  const avgPerDay = totalDays > 0
    ? dailyEarnings.reduce((sum: number, d: DailyEarning) => sum + d.total_earned, 0) / totalDays
    : 0;

  // Streak calculations
  const streaks = calculateStreaks(dailyEarnings);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    document.getElementById("recent-superchats-header")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getChartData = (tab: "daily" | "weekly" | "monthly") => {
    if (!dailyEarnings) return [];

    const dataMap = new Map<string, { total_earned: number; tips_count: number }>();
    dailyEarnings.forEach((e: DailyEarning) => {
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

        dailyEarnings.forEach((e: DailyEarning) => {
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
          <Typography color="text.secondary" variant="h6" sx={{ fontWeight: 400, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            Manage your alerts, track earnings, and engage with your community in real-time.
            {/* Live pulsing WebSocket session status indicator */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: "6px",
                bgcolor: connected ? "rgba(0, 255, 128, 0.08)" : "rgba(255, 75, 75, 0.08)",
                color: connected ? "#14F195" : "#ff4b4b",
                border: connected ? "1px solid rgba(0, 255, 128, 0.25)" : "1px solid rgba(255, 75, 75, 0.25)",
                fontSize: "0.68rem",
                fontWeight: 900,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: connected ? "#14F195" : "#ff4b4b",
                  boxShadow: connected ? "0 0 8px #14F195" : "0 0 8px #ff4b4b",
                  animation: "livePulse 1.5s infinite ease-in-out",
                  "@keyframes livePulse": {
                    "0%": { transform: "scale(0.8)", opacity: 0.5 },
                    "50%": { transform: "scale(1.2)", opacity: 1 },
                    "100%": { transform: "scale(0.8)", opacity: 0.5 }
                  }
                }}
              />
              {connected ? "Live Session Active" : "Websocket Offline"}
            </Box>
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 6 }} className="fade-in-up">
          {/* Total Earnings */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Paper sx={{
              p: 2.5, textAlign: "center", bgcolor: (theme: any) => `${theme.palette.primary.main}0d`, border: (theme: any) => `1px solid ${theme.palette.primary.main}26`, borderRadius: "20px", backdropFilter: "blur(10px)", height: "100%",
              boxShadow: (theme: any) => `0 8px 32px ${theme.palette.primary.main}0d`, transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: (theme: any) => `0 12px 40px ${theme.palette.primary.main}1a` }
            }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 32, mb: 1, color: (theme: any) => theme.palette.primary.main }} />
              <Typography variant="h5" sx={{ fontWeight: 900, color: (theme: any) => theme.palette.primary.main }}>{formatSol(totalEarned)} <Box component="span" sx={{ fontSize: "0.85rem" }}>SOL</Box></Typography>
              <Typography variant="caption" sx={{ color: "success.main", fontWeight: 800, display: "block", mt: 0.5 }}>
                ≈ ${(Number(formatSol(totalEarned)) * 150).toFixed(2)} USD
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", mt: 1, fontSize: "0.75rem" }}>Total Earnings</Typography>
            </Paper>
          </Grid>

          {/* Wallet Balance */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Paper sx={{
              p: 2.5, textAlign: "center", bgcolor: "rgba(20, 241, 149, 0.05)", border: "1px solid rgba(20, 241, 149, 0.15)", borderRadius: "20px", backdropFilter: "blur(10px)", height: "100%", position: "relative",
              boxShadow: "0 8px 32px rgba(20, 241, 149, 0.05)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 40px rgba(20, 241, 149, 0.15)" }
            }}>
              <Button
                onClick={fetchBalance}
                disabled={fetchingBalance}
                sx={{ position: "absolute", top: 10, right: 10, minWidth: "auto", p: 0.5, borderRadius: "50%", color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff" } }}
              >
                <RefreshIcon sx={{ fontSize: 16, animation: fetchingBalance ? "spin 1s infinite linear" : "none", "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } } }} />
              </Button>
              <AccountBalanceWalletIcon sx={{ fontSize: 32, mb: 1, color: "#14F195" }} />
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#14F195" }}>
                {walletBalance !== null ? walletBalance.toFixed(3) : "..."} <Box component="span" sx={{ fontSize: "0.85rem" }}>SOL</Box>
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5, fontWeight: 700 }}>
                Live Connected Wallet
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", mt: 1, fontSize: "0.75rem" }}>Wallet Balance</Typography>
            </Paper>
          </Grid>

          {/* Recent Superchats Count */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Paper sx={{
              p: 2.5, textAlign: "center", bgcolor: (theme: any) => `${theme.palette.secondary?.main || theme.palette.primary.main}0d`, border: (theme: any) => `1px solid ${theme.palette.secondary?.main || theme.palette.primary.main}26`, borderRadius: "20px", backdropFilter: "blur(10px)", height: "100%",
              boxShadow: (theme: any) => `0 8px 32px ${theme.palette.secondary?.main || theme.palette.primary.main}0d`, transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: (theme: any) => `0 12px 40px ${theme.palette.secondary?.main || theme.palette.primary.main}1a` }
            }}>
              <BoltIcon sx={{ fontSize: 32, mb: 1, color: (theme: any) => theme.palette.secondary?.main || theme.palette.primary.main }} />
              <Typography variant="h5" sx={{ fontWeight: 900, color: (theme: any) => theme.palette.secondary?.main || theme.palette.primary.main }}>{totalTips}</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5, fontWeight: 700 }}>
                Recent Tip Transactions
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", mt: 1, fontSize: "0.75rem" }}>Super Chats</Typography>
            </Paper>
          </Grid>

          {/* Average Daily Earnings */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Paper sx={{
              p: 2.5, textAlign: "center", bgcolor: "rgba(255, 75, 75, 0.05)", border: "1px solid rgba(255, 75, 75, 0.15)", borderRadius: "20px", backdropFilter: "blur(10px)", height: "100%",
              boxShadow: "0 8px 32px rgba(255, 75, 75, 0.05)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 40px rgba(255, 75, 75, 0.1)" }
            }}>
              <TrendingUpIcon sx={{ fontSize: 32, mb: 1, color: "#ff4b4b" }} />
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#ff4b4b" }}>{formatSol(avgPerDay)} <Box component="span" sx={{ fontSize: "0.85rem" }}>SOL</Box></Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5, fontWeight: 700 }}>
                Average Tip Split Cut
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", mt: 1, fontSize: "0.75rem" }}>Daily Avg.</Typography>
            </Paper>
          </Grid>

          {/* Overlay Status */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Paper sx={{
              p: 2.5, textAlign: "center", bgcolor: "rgba(128, 80, 255, 0.05)", border: "1px solid rgba(128, 80, 255, 0.15)", borderRadius: "20px", backdropFilter: "blur(10px)", height: "100%",
              boxShadow: "0 8px 32px rgba(128, 80, 255, 0.05)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 40px rgba(128, 80, 255, 0.1)" }
            }}>
              <TvIcon sx={{ fontSize: 32, mb: 1, color: "#9945FF" }} />
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#9945FF" }}>
                {user?.overlay_settings?.theme || "Default"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.8, mt: 0.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: connected ? "#14F195" : "#ff4b4b",
                    boxShadow: connected ? "0 0 8px #14F195" : "0 0 8px #ff4b4b",
                    animation: "livePulse 1.5s infinite ease-in-out"
                  }}
                />
                <Typography variant="caption" sx={{ color: connected ? "success.main" : "error.main", fontWeight: 800, textTransform: "uppercase" }}>
                  {connected ? "Connected" : "Offline"}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", mt: 1, fontSize: "0.75rem" }}>Overlay Status</Typography>
            </Paper>
          </Grid>

          {/* OBS URL Copy Link */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Paper
              sx={{
                p: 2.5, textAlign: "center", bgcolor: "rgba(0, 255, 128, 0.05)", border: "1px solid rgba(0, 255, 128, 0.2)", borderRadius: "20px", backdropFilter: "blur(10px)", cursor: "pointer", height: "100%",
                boxShadow: "0 8px 32px rgba(0, 255, 128, 0.05)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 40px rgba(0, 255, 128, 0.15)", borderColor: "rgba(0, 255, 128, 0.4)" }
              }}
              onClick={copyOverlayUrl}
            >
              <ContentCopyIcon sx={{ fontSize: 32, mb: 1, color: "#00ff80" }} />
              <Typography variant="h6" sx={{ fontWeight: 900, color: "#00ff80", mt: 0.5 }}>Copy URL</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5, fontWeight: 700 }}>
                Browser Source Link
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", mt: 1, fontSize: "0.75rem" }}>OBS Link</Typography>
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
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.0} />
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
                {tips && tips.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tips.slice(0, 5).map((t: any, i: number) => ({ name: `Tip ${i + 1}`, value: t.amount / LAMPORTS_PER_SOL }))}
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
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper id="recent-superchats-header" sx={{ p: 0, overflow: "hidden", bgcolor: "rgba(255,255,255,0.02)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", height: "100%" }}>
              <Box sx={{ p: { xs: 3, sm: 4 }, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Recent Super Chats</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <TextField
                    label="Filter Date"
                    type="date"
                    size="small"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                    sx={{
                      width: 140,
                      "& .MuiInputLabel-root": {
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        fontFamily: "Space Grotesk, sans-serif",
                        "&.Mui-focused": {
                          color: "primary.main"
                        }
                      },
                      "& .MuiInputBase-root": {
                        borderRadius: "10px",
                        bgcolor: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#fff",
                        fontFamily: "Space Grotesk, sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        "& fieldset": { border: "none" },
                        "&:hover": { bgcolor: "rgba(255,255,255,0.06)" }
                      },
                      "& input::-webkit-calendar-picker-indicator": {
                        filter: "invert(1)",
                        cursor: "pointer"
                      }
                    }}
                  />
                  {filterDate && (
                    <Button
                      size="small"
                      onClick={() => setFilterDate("")}
                      sx={{
                        borderRadius: "8px",
                        px: 1.5,
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        color: "primary.main",
                        border: (theme: any) => `1px solid ${theme.palette.primary.main}33`,
                        "&:hover": { bgcolor: (theme: any) => `${theme.palette.primary.main}10` }
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </Box>
              </Box>
              <List disablePadding sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                {tips.length === 0 ? (
                  <Box sx={{ p: 8, textAlign: "center", opacity: 0.5, flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {filterDate ? "No superchats received on this day." : "No transactions yet."}
                    </Typography>
                  </Box>
                ) : (
                  tips.map((tip: any, idx: number) => (
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
                          disableTypography
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
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, flexWrap: "wrap", gap: 1 }}>
                              <Typography variant="body2" sx={{ color: "text.primary", opacity: 0.8, fontStyle: "italic" }}>
                                "{tip.message || "No message"}"
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.7rem", opacity: 0.7 }}>
                                {(() => {
                                  const date = new Date(tip.timestamp);
                                  const now = new Date();
                                  const diff = now.getTime() - date.getTime();
                                  if (diff < 3600000) {
                                    const mins = Math.max(1, Math.floor(diff / 60000));
                                    return `${mins}m ago`;
                                  }
                                  if (diff < 86400000) {
                                    const hrs = Math.floor(diff / 3600000);
                                    return `${hrs}h ago`;
                                  }
                                  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                })()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {idx < tips.length - 1 && <Divider sx={{ mx: 4, opacity: 0.1 }} />}
                    </Box>
                  ))
                )}
              </List>
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="medium"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: 700,
                        borderRadius: "8px",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.08)",
                        },
                        "&.Mui-selected": {
                          boxShadow: "0 0 10px rgba(153, 69, 255, 0.3)",
                          fontWeight: 900
                        }
                      }
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* OBS Streaming Hub */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{
              p: { xs: 3, sm: 4 },
              bgcolor: "rgba(255, 255, 255, 0.02)",
              border: (theme: any) => `1px solid ${theme.palette.primary.main}33`,
              borderRadius: "24px",
              backdropFilter: "blur(20px)",
              boxShadow: (theme: any) => `0 8px 32px ${theme.palette.primary.main}0d`,
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: "100%"
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
              initialSettings={data?.user?.overlay_settings || {}}
              onSave={handleSaveOverlaySettings}
              testLoading={testLoading}
              onSendTestAlert={handleSendTestAlert}
              overlayToken={overlayToken}
              connected={connected}
              walletAddress={publicKey?.toString() || data?.user?.wallet_address || ""}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
