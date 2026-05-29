import { useState, useEffect, useMemo, useRef } from "react";
import { buildSafeSocialUrl, isValidChannel, sanitizeMessage, sanitizeSenderName } from "../utils/security";
import { useParams, Link as RouterLink } from "react-router-dom";
import { getPublicProfileByUsername, verifyAndStoreTransaction, getTransactionStatus } from "../services/api";
import { getExplorerUrl, sendTip, calculateFeeBreakdown } from "../services/solana";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { baseTheme, premiumThemes } from "../themes";
import { getPremiumOverrides } from "../themes/shared";
import BoringAvatar from "boring-avatars";
import SEO from "../components/common/SEO";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Button,
  TextField,
  Alert,
  Stack,
  Chip,
  Grid,
  Link,
  Divider,
  ThemeProvider,
  CssBaseline,
  IconButton,
  Pagination,
  InputAdornment,
  Paper
} from "@mui/material";
import { PublicProfileSkeleton } from "../components/common/LoadingSkeletons";
import LockIcon from "@mui/icons-material/Lock";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LanguageIcon from "@mui/icons-material/Language";
import ChatIcon from "@mui/icons-material/Chat";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import VerifiedIcon from "@mui/icons-material/Verified";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import toast from "react-hot-toast";
import { logger } from "../utils/logger";
import { SITE_NAME, PLATFORM_FEE_PCT } from "../shared/constants";


interface CreatorProfile {
  wallet_address: string;
  name: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  is_premium: boolean;
  selected_theme: string;
  socials: {
    twitter?: string;
    twitch?: string;
    youtube?: string;
    kick?: string;
    discord?: string;
  };
  stream_embed: {
    platform?: string;
    channel?: string;
  };
  overlay_settings?: {
    goal_enabled?: boolean;
    goal_title?: string;
    goal_target?: number;
    goal_current?: number;
  };
}

interface EnrichedTip {
  tx_hash: string;
  sender_wallet: string;
  creator_wallet: string;
  sender_name?: string;
  creator_name?: string;
  amount: number;
  fee: number;
  message: string;
  timestamp: string;
  status: string;
}

interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { connection } = useConnection();
  const wallet = useWallet();
  const { isAuthenticated, login, isLoading: authLoading } = useAuth();
  const { socket } = useSocket();

  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [tips, setTips] = useState<EnrichedTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Enhanced visual and tracking states
  const [streamVisible, setStreamVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "large" | "message">("all");
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setPage(1);
  }, [username]);

  // Tip Form State
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [txStatus, setTxStatus] = useState<"idle" | "sending" | "verifying" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "failed" | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const isSubmitting = useRef(false);

  useEffect(() => {
    if (!username) return;

    async function fetchCreator() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicProfileByUsername(username!);
        setCreator(data.user);
        setTips(data.recent_tips || []);
      } catch (err: any) {
        setError(err.message || "Creator profile not found");
      } finally {
        setLoading(false);
      }
    }

    fetchCreator();
  }, [username]);

  // Real-time socket updates for global tipping events
  useEffect(() => {
    if (!socket || !creator) return;

    const handleGlobalSuperchat = (data: any) => {
      // Check if this tip was sent to the creator whose profile is currently being viewed
      if (data.creator_wallet?.toLowerCase() === creator.wallet_address?.toLowerCase()) {
        const amountSol = data.amount / 1e9;

        // Increment overlay settings tipping goal progress
        setCreator((prev) => {
          if (!prev) return null;
          const overlay = prev.overlay_settings || {};
          return {
            ...prev,
            overlay_settings: {
              ...overlay,
              goal_current: (overlay.goal_current || 0) + amountSol
            }
          };
        });

        // Add the new tip to the top of the tips list (if not already stored)
        setTips((prev) => {
          if (prev.some((t) => t.tx_hash === data.tx_hash)) return prev;
          const newTip: EnrichedTip = {
            tx_hash: data.tx_hash,
            sender_wallet: data.sender_wallet,
            creator_wallet: data.creator_wallet,
            sender_name: data.sender_name,
            creator_name: data.creator_name,
            amount: data.amount,
            fee: data.fee,
            message: data.message || "",
            timestamp: data.timestamp || new Date().toISOString(),
            status: data.status || "verified"
          };
          return [newTip, ...prev].slice(0, 50); // Keep up to 50 tips
        });
      }
    };

    socket.on("new_superchat_global", handleGlobalSuperchat);

    return () => {
      socket.off("new_superchat_global", handleGlobalSuperchat);
    };
  }, [socket, creator]);



  // Confetti Particle Animation Loop
  useEffect(() => {
    if (!showConfetti || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particles: ConfettiParticle[] = [];
    const colors = ["#9945FF", "#14F195", "#38BDF8", "#FFD700", "#FF2D55", "#FF9500"];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height - 50,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 6 - 3,
        speedY: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2,
        opacity: 1
      });
    }

    let frames = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y < canvas.height) {
          active = true;
        } else {
          p.opacity -= 0.015;
          if (p.opacity > 0) active = true;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frames++;
      if (active && frames < 300) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setShowConfetti(false);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [showConfetti]);

  // Handle Preset Tip Click
  const handlePresetTip = (val: number) => {
    setAmount(val.toString());
  };

  const feeBreakdown = useMemo(() => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return null;
    return calculateFeeBreakdown(parsed);
  }, [amount]);

  const isFormValid = useMemo(() => {
    if (!creator) return false;
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed < 0.01) return false;
    if (message.length > 280) return false;
    return true;
  }, [creator, amount, message]);

  // Handle Tipping
  async function handleSendTip(e: React.FormEvent) {
    e.preventDefault();
    if (!creator || !wallet.publicKey || !isAuthenticated) return;
    if (txStatus === "sending" || txStatus === "verifying") return;
    if (isSubmitting.current) return;

    isSubmitting.current = true;
    setTxStatus("sending");
    setErrorMsg(null);
    setTxHash(null);
    setVerificationStatus(null);

    try {
      const signature = await sendTip(
        connection,
        wallet,
        creator.wallet_address,
        parseFloat(amount)
      );

      setTxHash(signature);
      setTxStatus("verifying");

      try {
        await verifyAndStoreTransaction({
          tx_hash: signature,
          sender_wallet: wallet.publicKey.toString(),
          creator_wallet: creator.wallet_address,
          message: message.trim()
        });
        setVerificationStatus("pending");
      } catch (verifyErr) {
        logger.warn("Backend verification error:", verifyErr);
        toast.error("Tip sent, but backend indexing failed");
      }

      setTxStatus("success");
      setAmount("");
      setMessage("");
      setShowConfetti(true); // Trigger Confetti upon signature confirmation

      // Reload recent superchats & profile settings (including goal progress)
      const updatedData = await getPublicProfileByUsername(username!);
      setCreator(updatedData.user);
      setTips(updatedData.recent_tips || []);
      setPage(1);
    } catch (err: any) {
      setTxStatus("error");
      const msg = err.message || "Transaction execution failed";
      setErrorMsg(msg);
    } finally {
      isSubmitting.current = false;
    }
  }

  const handleCheckStatus = async () => {
    if (!txHash) return;
    setCheckingStatus(true);
    try {
      const res = await getTransactionStatus(txHash);
      setVerificationStatus(res.status);
      if (res.status === "verified") {
        setShowConfetti(true); // Celebrate again on verified state confirmation
        toast.success("Tip verified successfully!", { icon: "🎉" });
        // Reload recent superchats & profile settings
        const updatedData = await getPublicProfileByUsername(username!);
        setCreator(updatedData.user);
        setTips(updatedData.recent_tips || []);
      }
    } catch (err: any) {
      logger.error("Status check failed:", err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const copyWallet = () => {
    if (!creator) return;
    navigator.clipboard.writeText(creator.wallet_address);
    toast.success("Wallet address copied!", { icon: "📋" });
  };

  const copyShareableLink = () => {
    const link = `${window.location.origin}/${creator?.username}`;
    navigator.clipboard.writeText(link);
    toast.success("Shareable link copied!", { icon: "🔗" });
  };

  function shorten(addr: string): string {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function formatSol(lamports: number): string {
    return (lamports / 1e9).toFixed(4);
  }

  function formatTime(ts: string): string {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }

  // Dynamic stats calculated from the recent tips feed
  const creatorStats = useMemo(() => {
    if (!tips || tips.length === 0) {
      return { totalCount: 0, volumeSol: 0, avgSol: 0 };
    }
    const totalCount = tips.length;
    const totalLamports = tips.reduce((sum, tip) => sum + tip.amount, 0);
    const volumeSol = totalLamports / 1e9;
    const avgSol = volumeSol / totalCount;
    return { totalCount, volumeSol, avgSol };
  }, [tips]);

  // Dynamic Tipping Tier Configuration
  const tipTier = useMemo(() => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return { name: "Starter", color: "rgba(255, 255, 255, 0.08)", glow: "none", text: "text.secondary", badge: "🌱 Starter Support" };
    if (parsed >= 5.0) return { name: "Legendary", color: "#ff2d55", glow: "0 0 30px rgba(255, 45, 85, 0.5)", text: "#ff2d55", badge: "🏆 Legendary Support" };
    if (parsed >= 1.0) return { name: "Epic", color: "#ff9500", glow: "0 0 24px rgba(255, 149, 0, 0.4)", text: "#ff9500", badge: "💎 Epic Support" };
    if (parsed >= 0.5) return { name: "Premium", color: "#ffcc00", glow: "0 0 18px rgba(255, 204, 0, 0.35)", text: "#ffcc00", badge: "⭐ Premium Support" };
    if (parsed >= 0.1) return { name: "Standard", color: "#14F195", glow: "0 0 14px rgba(20, 241, 149, 0.25)", text: "#14F195", badge: "⚡ Standard Support" };
    return { name: "Starter", color: "rgba(255, 255, 255, 0.15)", glow: "none", text: "text.secondary", badge: "🌱 Starter Support" };
  }, [amount]);

  // Filtered and Searched Tips list
  const filteredTips = useMemo(() => {
    return tips.filter(tip => {
      const nameMatch = (tip.sender_name || "").toLowerCase().includes(searchQuery.toLowerCase());
      const messageMatch = (tip.message || "").toLowerCase().includes(searchQuery.toLowerCase());
      const walletMatch = (tip.sender_wallet || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = nameMatch || messageMatch || walletMatch;

      if (!matchesSearch) return false;

      if (filterType === "large") {
        return tip.amount >= 0.5 * 1e9; // 0.5 SOL
      }
      if (filterType === "message") {
        return !!tip.message;
      }

      return true;
    });
  }, [tips, searchQuery, filterType]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredTips.length / itemsPerPage);
  const paginatedTips = filteredTips.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    document.getElementById("public-superchats-header")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getTipTierColor = (lamports: number) => {
    const sol = lamports / 1e9;
    if (sol >= 5.0) return "#ff2d55";
    if (sol >= 1.0) return "#ff9500";
    if (sol >= 0.5) return "#ffcc00";
    if (sol >= 0.1) return "#14F195";
    return "rgba(255, 255, 255, 0.08)";
  };



  // Load Custom Theme Dynamically
  const currentTheme = useMemo(() => {
    if (creator?.is_premium) {
      const themeKey = creator.selected_theme || "gold";
      return premiumThemes[themeKey] || premiumThemes.gold;
    }
    return baseTheme;
  }, [creator]);

  const premiumStyles = useMemo(() => {
    let styles = "";
    if (creator?.is_premium) {
      const primaryColor = currentTheme.palette.primary.main;
      const secondaryColor = currentTheme.palette.secondary?.main || primaryColor;
      const bgColor = currentTheme.palette.background.default || "#050508";
      styles = getPremiumOverrides(primaryColor, secondaryColor, bgColor, "");
    }
    styles += `
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes floatShape1 {
        0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
        50% { transform: translate(30px, -20px) scale(1.15) rotate(180deg); }
      }
      @keyframes floatShape2 {
        0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
        50% { transform: translate(-30px, 30px) scale(1.1) rotate(-180deg); }
      }
      @keyframes techGridScroll {
        0% { background-position: 0 0; }
        100% { background-position: 60px 60px; }
      }
      @keyframes pulseBorder {
        0%, 100% { box-shadow: 0 0 0 4px ${currentTheme.palette.background.default}, 0 8px 32px ${currentTheme.palette.primary.main}40; }
        50% { box-shadow: 0 0 0 6px ${currentTheme.palette.primary.main}50, 0 12px 48px ${currentTheme.palette.primary.main}60; }
      }
    `;
    return styles;
  }, [creator, currentTheme]);

  if (loading) {
    return <PublicProfileSkeleton />;
  }

  if (error || !creator) {
    return (
      <Container maxWidth="sm" sx={{ py: 12 }}>
        <Card sx={{ textAlign: "center", py: 8, px: 4 }}>
          <ErrorIcon color="error" sx={{ fontSize: 64, mb: 3 }} />
          <Typography variant="h5" color="error" sx={{ fontWeight: 800, mb: 2 }}>
            {error || "Creator Profile Not Found"}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Verify the username slug or check if the creator is registered on {SITE_NAME}.

          </Typography>
          <Button component={RouterLink} to="/" variant="outlined"  >
            Back to Home
          </Button>
        </Card>
      </Container>
    );
  }

  const isLive = !!(creator.stream_embed && creator.stream_embed.platform && creator.stream_embed.channel);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      {premiumStyles && <style dangerouslySetInnerHTML={{ __html: premiumStyles }} />}

      {showConfetti && (
        <canvas
          ref={canvasRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 9999,
            pointerEvents: "none"
          }}
        />
      )}

      <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", pb: 12 }}>
        {/* Dynamic Theme Blur Orbs */}
        <Box
          sx={{
            position: "absolute",
            top: "5%",
            left: "20%",
            width: "400px",
            height: "400px",
            background: `radial-gradient(circle, ${currentTheme.palette.primary.main}1a 0%, transparent 70%)`,
            zIndex: -1,
            filter: "blur(50px)"
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "40%",
            right: "10%",
            width: "500px",
            height: "500px",
            background: `radial-gradient(circle, ${currentTheme.palette.secondary?.main || currentTheme.palette.primary.main}12 0%, transparent 70%)`,
            zIndex: -1,
            filter: "blur(60px)"
          }}
        />

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
          <SEO
            title={`${creator.name || creator.username} (@${creator.username})`}
            description={creator.bio || `Watch streams, click social links, and send instant tip superchats to @${creator.username} on ${SITE_NAME}.`}

            image={creator.avatar_url || "/og-image.png"}
            keywords={`solana, tipping, superchat, creator, ${creator.username}, ${creator.name || ""}, stream alerts, web3`}
            creatorProfile={{
              name: creator.name || creator.username || "",
              bio: creator.bio || `Solana stream creator on ${SITE_NAME}.`,

              avatarUrl: creator.avatar_url || "",
              walletAddress: creator.wallet_address || "",
              socials: creator.socials
            }}
          />

          {/* ---- Banner Profile Header Card ---- */}
          <Card sx={{ mb: 4, overflow: "visible", position: "relative", border: `1px solid ${currentTheme.palette.primary.main}22` }}>
            {/* Top decorative gradient banner */}
            <Box
              sx={{
                height: { xs: "100px", sm: "130px", md: "150px" },
                borderRadius: "16px 16px 0 0",
                background: creator.is_premium
                  ? `linear-gradient(-45deg, ${currentTheme.palette.primary.dark}dd 0%, ${currentTheme.palette.secondary?.main || currentTheme.palette.primary.main}cc 35%, ${currentTheme.palette.primary.main}bb 70%, ${currentTheme.palette.secondary?.dark || currentTheme.palette.primary.dark}dd 100%)`
                  : `linear-gradient(135deg, ${currentTheme.palette.primary.dark}bb 0%, ${currentTheme.palette.background.default} 70%, ${currentTheme.palette.secondary?.dark || currentTheme.palette.primary.dark}66 100%)`,
                backgroundSize: "400% 400%",
                animation: creator.is_premium ? "gradientShift 15s ease infinite" : "none",
                position: "relative",
                overflow: "hidden",
                borderBottom: `2px solid ${currentTheme.palette.primary.main}44`,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 30 0 L 0 0 0 30' fill='none' stroke='rgba(255,255,255,0.06)' stroke-width='1'/%3E%3C/svg%3E\")",
                  animation: creator.is_premium ? "techGridScroll 25s linear infinite" : "none",
                }
              }}
            >
              {/* Rotating futuristic crystal cards */}
              <Box sx={{
                position: "absolute",
                width: 60,
                height: 60,
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(6px)",
                top: "20%",
                right: "15%",
                transform: "rotate(45deg)",
                animation: "floatShape1 14s ease-in-out infinite",
                pointerEvents: "none",
              }} />
              <Box sx={{
                position: "absolute",
                width: 90,
                height: 90,
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.01)",
                backdropFilter: "blur(3px)",
                bottom: "10%",
                left: "20%",
                transform: "rotate(15deg)",
                animation: "floatShape2 18s ease-in-out infinite",
                pointerEvents: "none",
              }} />

              {/* Glowing decorative floating shapes inside banner */}
              <Box sx={{
                position: "absolute",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${currentTheme.palette.primary.main}3b 0%, rgba(0,0,0,0) 75%)`,
                top: "-50px",
                left: "30%",
                filter: "blur(30px)",
                animation: "floatShape1 12s ease-in-out infinite",
                pointerEvents: "none",
              }} />

              {/* Bottom vignette overlay to blend with card */}
              <Box sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: "60px",
                background: "linear-gradient(to top, rgba(11, 15, 23, 0.95) 0%, rgba(11, 15, 23, 0) 100%)",
                pointerEvents: "none",
              }} />

              {/* Floating Glassmorphic Creator Rank / Premium Status Badge */}
              <Chip
                icon={<VerifiedIcon sx={{ color: "inherit !important", fontSize: "14px !important" }} />}
                label={creator.is_premium ? "PREMIUM PARTNER" : "VERIFIED CREATOR"}
                sx={{
                  position: "absolute",
                  top: 15,
                  right: 15,
                  background: "rgba(11, 15, 23, 0.75)",
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${currentTheme.palette.primary.main}44`,
                  color: `${currentTheme.palette.primary.main} !important`,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  fontSize: "0.65rem",
                  boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 12px ${currentTheme.palette.primary.main}22`,
                  zIndex: 2,
                  "& .MuiChip-label": { px: 1.2 }
                }}
              />

              {/* Neon border line at the bottom */}
              <Box sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: `linear-gradient(90deg, transparent, ${currentTheme.palette.primary.main}, ${currentTheme.palette.secondary?.main || currentTheme.palette.primary.main}, transparent)`,
                zIndex: 2,
              }} />
            </Box>

            <CardContent sx={{ pt: 0, px: { xs: 3, md: 6 }, pb: 5 }}>
              <Box sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "center", sm: "flex-end" },
                gap: { xs: 2.5, sm: 3.5 },
                mb: 4,
                flexWrap: { xs: "wrap", sm: "nowrap" },
                width: "100%"
              }}>
                {/* Avatar container pulled up individually */}
                <Box
                  sx={{
                    width: { xs: 100, sm: 120 },
                    height: { xs: 100, sm: 120 },
                    borderRadius: "50%",
                    p: 0.5,
                    background: `linear-gradient(135deg, ${currentTheme.palette.primary.main}, ${currentTheme.palette.secondary?.main || currentTheme.palette.primary.main})`,
                    boxShadow: `0 0 0 4px ${currentTheme.palette.background.default}, 0 8px 32px ${currentTheme.palette.primary.main}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: creator.is_premium ? "pulseBorder 4s ease-in-out infinite" : "none",
                    transition: "transform 0.3s ease-in-out",
                    position: "relative",
                    zIndex: 5,
                    mt: { xs: "-50px", sm: "-60px" },
                    mx: { xs: "auto", sm: 0 },
                    flexShrink: 0,
                    "&:hover": {
                      transform: "scale(1.05)",
                    }
                  }}
                >
                  <Box sx={{
                    borderRadius: "50%",
                    overflow: "hidden",
                    width: { xs: 88, sm: 108 },
                    height: { xs: 88, sm: 108 },
                    "& svg": {
                      width: "100% !important",
                      height: "100% !important"
                    }
                  }}>
                    <BoringAvatar
                      name={creator.name || creator.wallet_address}
                      variant="beam"
                      size={108}
                      colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]}
                    />
                  </Box>
                </Box>

                {/* Creator info details: Name, Username, Badges */}
                <Box sx={{
                  flexGrow: 1,
                  minWidth: 0,
                  textAlign: { xs: "center", sm: "left" },
                  width: "100%",
                  mt: { xs: 1, sm: 0 }
                }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                      width: "100%"
                    }}
                  >
                    <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{
                          alignItems: "center",
                          justifyContent: { xs: "center", sm: "flex-start" }
                        }}
                      >
                        <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: "1.65rem", sm: "2.125rem" } }}>
                          {creator.name}
                        </Typography>
                        {creator.is_premium && (
                          <VerifiedIcon sx={{ color: "#14F195", fontSize: { xs: 22, sm: 26 }, filter: "drop-shadow(0 0 5px rgba(20,241,149,0.3))" }} />
                        )}
                        {creator.is_premium && (
                          <Chip
                            label="PREMIUM"
                            size="small"
                            sx={{
                              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                              color: "#000",
                              fontWeight: 900,
                              fontSize: "0.6rem"
                            }}
                          />
                        )}
                      </Stack>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mt: 0.2, fontSize: { xs: "0.95rem", sm: "1.25rem" }, textAlign: { xs: "center", sm: "left" } }}>
                        @{creator.username}
                      </Typography>
                    </Box>

                    {/* Live Badge + Share Button */}
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{
                        alignItems: "center",
                        justifyContent: { xs: "center", sm: "flex-end" },
                        mt: { xs: 1.5, sm: 0 }
                      }}
                    >
                      <Chip
                        label={isLive ? "🔴 LIVE" : "● ONLINE"}
                        size="small"
                        sx={{
                          fontWeight: 900,
                          px: 1.2,
                          borderRadius: "50px",
                          fontSize: "0.7rem",
                          border: isLive ? "1px solid #ff17444d" : "1px solid #00e6764d",
                          bgcolor: isLive ? "rgba(255,23,68,0.1)" : "rgba(0,230,118,0.08)",
                          color: isLive ? "#ff4444" : "#00e676",
                          letterSpacing: "0.03em"
                        }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={copyShareableLink}

                        sx={{
                          borderRadius: "8px",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          px: 1.5,
                          py: 0.6,
                          borderColor: `${currentTheme.palette.primary.main}55`,
                          color: "text.secondary",
                          bgcolor: `${currentTheme.palette.primary.main}08`,
                          "&:hover": {
                            borderColor: currentTheme.palette.primary.main,
                            bgcolor: `${currentTheme.palette.primary.main}14`,
                            color: "text.primary"
                          }
                        }}
                      >
                        Copy Link
                      </Button>
                    </Stack>
                  </Stack>

                  {/* Creator Wallet Address + Share row */}
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: "center",
                      mb: 2,
                      flexWrap: "wrap",
                      gap: 1.5,
                      justifyContent: { xs: "center", sm: "flex-start" }
                    }}
                  >
                    <Box
                      onClick={copyWallet}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.5,
                        py: 0.6,
                        borderRadius: "6px",
                        bgcolor: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.12)" }
                      }}
                    >
                      <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", color: "text.secondary" }}>
                        {shorten(creator.wallet_address)}
                      </Typography>
                      <ContentCopyIcon sx={{ fontSize: 11, color: "text.secondary" }} />
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={copyShareableLink}

                      sx={{
                        borderRadius: "6px",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        px: 1.5,
                        py: 0.6,
                        background: `linear-gradient(135deg, ${currentTheme.palette.primary.main} 0%, ${currentTheme.palette.secondary?.main || currentTheme.palette.primary.main} 100%)`,
                        boxShadow: `0 4px 12px ${currentTheme.palette.primary.main}20`,
                        "&:hover": { transform: "translateY(-1px)", boxShadow: `0 6px 14px ${currentTheme.palette.primary.main}40` }
                      }}
                    >
                      Copy Shareable Link
                    </Button>
                  </Stack>

                  {creator.bio && (
                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        maxWidth: 700,
                        lineHeight: 1.6,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        textAlign: { xs: "center", sm: "left" },
                        mx: { xs: "auto", sm: 0 }
                      }}
                    >
                      {creator.bio}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Social Channels Row */}
              {creator.socials && Object.values(creator.socials).some(v => !!v) && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.1em", mb: 2 }}>
                    Social Networks
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5 }}>
                    {(() => {
                      const url = buildSafeSocialUrl("twitter", creator.socials.twitter); return url ? (
                        <Button
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outlined"

                          sx={{ borderRadius: "10px", fontWeight: 700 }}
                        >
                          Twitter
                        </Button>
                      ) : null;
                    })()}
                    {(() => {
                      const url = buildSafeSocialUrl("twitch", creator.socials.twitch); return url ? (
                        <Button
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outlined"

                          sx={{ borderRadius: "10px", fontWeight: 700, borderColor: "#6441a5", color: "#b9a3e3", "&:hover": { bgcolor: "rgba(100,65,165,0.1)", borderColor: "#7d5bbe" } }}
                        >
                          Twitch
                        </Button>
                      ) : null;
                    })()}
                    {(() => {
                      const url = buildSafeSocialUrl("youtube", creator.socials.youtube); return url ? (
                        <Button
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outlined"

                          sx={{ borderRadius: "10px", fontWeight: 700, borderColor: "#ff0000", color: "#ff8080", "&:hover": { bgcolor: "rgba(255,0,0,0.1)", borderColor: "#cc0000" } }}
                        >
                          YouTube
                        </Button>
                      ) : null;
                    })()}
                    {(() => {
                      const url = buildSafeSocialUrl("kick", creator.socials.kick); return url ? (
                        <Button
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outlined"

                          sx={{ borderRadius: "10px", fontWeight: 700, borderColor: "#53fc18", color: "#9fff7d", "&:hover": { bgcolor: "rgba(83,252,24,0.1)", borderColor: "#41d60f" } }}
                        >
                          Kick
                        </Button>
                      ) : null;
                    })()}
                    {(() => {
                      const url = buildSafeSocialUrl("discord", creator.socials.discord); return url ? (
                        <Button
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outlined"

                          sx={{ borderRadius: "10px", fontWeight: 700, borderColor: "#5865F2", color: "#8ea1ff", "&:hover": { bgcolor: "rgba(88,101,242,0.1)", borderColor: "#4752c4" } }}
                        >
                          Discord
                        </Button>
                      ) : null;
                    })()}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* ---- Glassmorphic Stats Section ---- */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{
                bgcolor: "rgba(255, 255, 255, 0.015)",
                border: "1px solid rgba(255,255,255,0.04)",
                boxShadow: "none",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.03)", transform: "translateY(-2px)" },
                transition: "all 0.2s"
              }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "16px !important" }}>
                  <Box sx={{ p: 1.2, borderRadius: "10px", bgcolor: `${currentTheme.palette.primary.main}15`, color: "primary.main", display: "flex" }}>
                    <MonetizationOnIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                      Total Supported
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {creatorStats.volumeSol.toFixed(2)} SOL
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{
                bgcolor: "rgba(255, 255, 255, 0.015)",
                border: "1px solid rgba(255,255,255,0.04)",
                boxShadow: "none",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.03)", transform: "translateY(-2px)" },
                transition: "all 0.2s"
              }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "16px !important" }}>
                  <Box sx={{ p: 1.2, borderRadius: "10px", bgcolor: `${currentTheme.palette.secondary?.main || currentTheme.palette.primary.main}15`, color: "secondary.main", display: "flex" }}>
                    <EmojiEventsIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                      Superchats Count
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {creatorStats.totalCount}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{
                bgcolor: "rgba(255, 255, 255, 0.015)",
                border: "1px solid rgba(255,255,255,0.04)",
                boxShadow: "none",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.03)", transform: "translateY(-2px)" },
                transition: "all 0.2s"
              }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "16px !important" }}>
                  <Box sx={{ p: 1.2, borderRadius: "10px", bgcolor: "success.main15", color: "success.main", display: "flex" }}>
                    <TrendingUpIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                      Avg. Tip Size
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {creatorStats.avgSol.toFixed(3)} SOL
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ---- Tipping Goal Section ---- */}
          {creator.overlay_settings?.goal_enabled && (
            <Card
              sx={{
                mb: 4,
                p: 3,
                bgcolor: "rgba(255, 255, 255, 0.015)",
                border: `1px solid ${currentTheme.palette.primary.main}33`,
                borderRadius: "20px",
                backdropFilter: "blur(20px)",
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.2), 0 0 20px ${currentTheme.palette.primary.main}0d`,
                position: "relative",
                overflow: "hidden"
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: currentTheme.palette.primary.main,
                      letterSpacing: "-0.01em"
                    }}
                  >
                    <EmojiEventsIcon /> {creator.overlay_settings.goal_title || "Tipping Goal"}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 950 }}>
                  <span style={{ color: currentTheme.palette.primary.main }}>
                    {(creator.overlay_settings.goal_current || 0).toFixed(2)}
                  </span>{" "}
                  / {creator.overlay_settings.goal_target || 10} SOL
                </Typography>
              </Box>

              {/* Progress Bar Track */}
              <Box
                sx={{
                  width: "100%",
                  height: "24px",
                  borderRadius: "12px",
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.4)"
                }}
              >
                {/* Progress Bar Fill with stripes animation */}
                <Box
                  sx={{
                    width: `${Math.min(100, Math.max(0, ((creator.overlay_settings.goal_current || 0) / (creator.overlay_settings.goal_target || 10)) * 100))}%`,
                    height: "100%",
                    borderRadius: "12px",
                    background: `linear-gradient(90deg, ${currentTheme.palette.primary.main}88, ${currentTheme.palette.primary.main})`,
                    boxShadow: `0 0 15px ${currentTheme.palette.primary.main}aa`,
                    transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: "linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)",
                      backgroundSize: "20px 20px",
                      animation: "stripeMove 1.5s linear infinite",
                      "@keyframes stripeMove": {
                        "0%": { backgroundPosition: "0 0" },
                        "100%": { backgroundPosition: "200px 0" }
                      }
                    }
                  }}
                />

                {/* Percentage Text Overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    pointerEvents: "none"
                  }}
                >
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 950, color: "#ffffff", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                    {((creator.overlay_settings.goal_current || 0) >= (creator.overlay_settings.goal_target || 10)) ? "Completed!" : `${Math.min(100, Math.max(0, ((creator.overlay_settings.goal_current || 0) / (creator.overlay_settings.goal_target || 10)) * 100)).toFixed(0)}%`}
                  </Typography>
                </Box>
              </Box>
            </Card>
          )}

          {/* ---- Body Container Grid ---- */}
          <Grid container spacing={4}>

            {/* Left/Middle: Live Stream & Recent Superchats */}
            <Grid size={{ xs: 12, md: isLive ? 7 : 6 }}>
              <Stack spacing={4}>

                {/* 📺 Embedded Stream Section */}
                {isLive && (
                  <Card>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, px: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, display: "flex", alignItems: "center", gap: 1 }}>
                          📺 Creator Live Broadcast
                        </Typography>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setStreamVisible(!streamVisible)}

                          sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                          {streamVisible ? "Collapse Stream" : "Expand Stream"}
                        </Button>
                      </Box>
                      {streamVisible && (
                        <Box sx={{ width: "100%", overflow: "hidden", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
                          {creator.stream_embed.platform === "twitch" && isValidChannel("twitch", creator.stream_embed.channel || "") && (
                            <iframe
                              src={`https://player.twitch.tv/?channel=${encodeURIComponent(creator.stream_embed.channel!)}&parent=${encodeURIComponent(window.location.hostname)}&muted=false`}
                              height="400"
                              width="100%"
                              allowFullScreen
                              sandbox="allow-scripts allow-same-origin allow-popups"
                              referrerPolicy="no-referrer"
                              style={{ border: "none" }}
                            />
                          )}
                          {creator.stream_embed.platform === "youtube" && isValidChannel("youtube", creator.stream_embed.channel || "") && (
                            <iframe
                              src={`https://www.youtube.com/embed/${encodeURIComponent(creator.stream_embed.channel!)}?autoplay=0`}
                              height="400"
                              width="100%"
                              allowFullScreen
                              sandbox="allow-scripts allow-same-origin allow-popups"
                              referrerPolicy="no-referrer"
                              style={{ border: "none" }}
                            />
                          )}
                          {creator.stream_embed.platform === "kick" && isValidChannel("kick", creator.stream_embed.channel || "") && (
                            <iframe
                              src={`https://player.kick.com/${encodeURIComponent(creator.stream_embed.channel!)}`}
                              height="400"
                              width="100%"
                              allowFullScreen
                              sandbox="allow-scripts allow-same-origin allow-popups"
                              referrerPolicy="no-referrer"
                              style={{ border: "none" }}
                            />
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 🎙️ Recent Superchats Feed */}
                <Card id="public-superchats-header">
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>🎙️ Recent Superchats</Typography>
                      <Chip label={`${filteredTips.length} tip${filteredTips.length !== 1 ? "s" : ""}`} size="small" variant="outlined" sx={{ fontWeight: 700, borderRadius: "8px", fontSize: "0.72rem" }} />
                    </Stack>

                    {/* Filter and Search controls */}
                    <Stack spacing={2} sx={{ mb: 4 }}>
                      <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search superchats by name, message, or wallet..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: "10px" }
                          }
                        }}
                      />

                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                        <Chip
                          label="All Tips"
                          onClick={() => setFilterType("all")}
                          color={filterType === "all" ? "primary" : "default"}
                          variant={filterType === "all" ? "filled" : "outlined"}
                          size="small"
                          sx={{ fontWeight: 700, borderRadius: "8px" }}
                        />
                        <Chip
                          label="Large Tips (≥0.5 SOL)"
                          onClick={() => setFilterType("large")}
                          color={filterType === "large" ? "primary" : "default"}
                          variant={filterType === "large" ? "filled" : "outlined"}
                          size="small"
                          sx={{ fontWeight: 700, borderRadius: "8px" }}
                        />
                        <Chip
                          label="With Messages"
                          onClick={() => setFilterType("message")}
                          color={filterType === "message" ? "primary" : "default"}
                          variant={filterType === "message" ? "filled" : "outlined"}
                          size="small"
                          sx={{ fontWeight: 700, borderRadius: "8px" }}
                        />
                      </Stack>
                    </Stack>

                    {filteredTips.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 6 }}>
                        <Typography sx={{ fontSize: "2.5rem", mb: 1 }}>⚡</Typography>
                        <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No Superchats Found</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try searching for another term or tip to be the first!
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={2.5}>
                        {paginatedTips.map((tip, idx) => (
                          <Box key={tip.tx_hash}>
                            <Stack direction="row" spacing={2} sx={{ p: 2, borderRadius: "14px", bgcolor: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
                              <Box sx={{ width: 44, height: 44, borderRadius: "10px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <BoringAvatar
                                  name={tip.sender_name || tip.sender_wallet}
                                  variant="beam"
                                  size={44}
                                  colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]}
                                />
                              </Box>

                              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                    {tip.sender_name || shorten(tip.sender_wallet)}
                                  </Typography>
                                  <Chip
                                    label={`${formatSol(tip.amount)} SOL`}
                                    size="small"
                                    color="primary"
                                    sx={{ fontWeight: 800, fontSize: "0.75rem", borderRadius: "8px", background: `linear-gradient(135deg, ${currentTheme.palette.primary.main} 0%, ${currentTheme.palette.secondary?.main || currentTheme.palette.primary.main} 100%)` }}
                                  />
                                </Stack>

                                {tip.message && (
                                  <Box sx={{
                                    mt: 1.5,
                                    p: 1.5,
                                    bgcolor: "rgba(255,255,255,0.02)",
                                    borderRadius: "8px",
                                    borderLeft: `3.5px solid ${getTipTierColor(tip.amount)}`
                                  }}>
                                    <Typography variant="body2" sx={{ fontStyle: "italic", opacity: 0.95, lineHeight: 1.5 }}>
                                      "{tip.message}"
                                    </Typography>
                                  </Box>
                                )}

                                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mt: 1.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatTime(tip.timestamp)}
                                  </Typography>
                                  <Link
                                    href={getExplorerUrl(tip.tx_hash)}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.72rem", textDecoration: "none", opacity: 0.8, "&:hover": { opacity: 1, color: "primary.main" } }}
                                  >
                                    Explorer <OpenInNewIcon sx={{ fontSize: 11 }} />
                                  </Link>
                                </Stack>
                              </Box>
                            </Stack>
                            {idx < paginatedTips.length - 1 && <Divider sx={{ borderColor: "rgba(255,255,255,0.04)", my: 1 }} />}
                          </Box>
                        ))}
                      </Stack>
                    )}
                    {totalPages > 1 && (
                      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            {/* Right: Quick Tip Widget Panel */}
            <Grid size={{ xs: 12, md: isLive ? 5 : 6 }}>

              {/* Tipping Panel Widget */}
              <Card sx={{
                position: "relative",
                overflow: "visible",
                border: `2px solid ${tipTier.color}`,
                boxShadow: tipTier.glow,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              }}>
                <Box
                  sx={{
                    position: "absolute",
                    top: -2,
                    left: "10%",
                    right: "10%",
                    height: "3px",
                    background: `linear-gradient(90deg, transparent, ${tipTier.color}, transparent)`,
                    transition: "all 0.4s ease"
                  }}
                />

                <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 1, justifyContent: "space-between" }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
                        <BoringAvatar name={creator.name || creator.wallet_address} variant="beam" size={40} colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>⚡ Tip {creator.name}</Typography>
                        <Typography variant="caption" color="text.secondary">@{creator.username}</Typography>
                      </Box>
                    </Stack>

                    {amount && parseFloat(amount) > 0 && (
                      <Chip
                        label={tipTier.badge}
                        size="small"
                        sx={{
                          bgcolor: `${tipTier.color}15`,
                          color: tipTier.color,
                          border: `1px solid ${tipTier.color}35`,
                          fontWeight: 900,
                          fontSize: "0.72rem",
                          borderRadius: "6px",
                          px: 0.5
                        }}
                      />
                    )}
                  </Stack>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Verified on-chain tip direct to creator's wallet — {PLATFORM_FEE_PCT}% platform fee.
                  </Typography>

                  {!isAuthenticated ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3, border: "1px solid rgba(255,255,255,0.06)" }}>
                        <LockIcon sx={{ fontSize: 32, color: "text.secondary" }} />
                      </Box>
                      {!wallet.connected ? (
                        <>
                          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Connect Solana Wallet</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, px: 2 }}>Connect your Phantom or Solana wallet to begin.</Typography>
                          <Box sx={{ display: "flex", justifyContent: "center", "& .wallet-adapter-button": { height: "46px", borderRadius: "10px", fontWeight: 600, background: `linear-gradient(135deg, ${currentTheme.palette.secondary?.main || currentTheme.palette.primary.main} 0%, ${currentTheme.palette.primary.main} 100%) !important` } }}>
                            <WalletMultiButton />
                          </Box>
                        </>
                      ) : (
                        <>
                          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Session Signature Required</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, px: 2 }}>Sign the authentication message in your wallet to verify your identity and send tips.</Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={login}
                            disabled={authLoading}
                            size="large"
                            sx={{ px: 5, borderRadius: "10px" }}
                          >
                            {authLoading ? "Verifying..." : "Sign & Continue"}
                          </Button>
                        </>
                      )}
                    </Box>
                  ) : (
                    <form onSubmit={handleSendTip}>
                      <Stack spacing={3}>

                        {/* Preset Tipping Buttons Grid */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Quick Preset Tip (SOL)
                          </Typography>
                          <Grid container spacing={1.5}>
                            {[0.1, 0.5, 1.0, 2.5].map((preset) => (
                              <Grid size={{ xs: 6, sm: 3 }} key={preset}>
                                <Button
                                  variant="outlined"
                                  fullWidth
                                  onClick={() => handlePresetTip(preset)}
                                  sx={{
                                    py: 1.5,
                                    display: "flex",
                                    flexDirection: "column",
                                    borderRadius: "12px",
                                    fontWeight: 800,
                                    transition: "all 0.2s ease",
                                    border: amount === preset.toString()
                                      ? `2px solid ${tipTier.color}`
                                      : "1px solid rgba(255,255,255,0.06)",
                                    bgcolor: amount === preset.toString()
                                      ? `${tipTier.color}14`
                                      : "rgba(255,255,255,0.02)",
                                    "&:hover": {
                                      bgcolor: "rgba(255,255,255,0.05)",
                                      borderColor: "rgba(255,255,255,0.15)"
                                    }
                                  }}
                                >
                                  <Typography variant="body1" sx={{ fontWeight: 900 }}>
                                    {preset} SOL
                                  </Typography>
                                </Button>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Custom Amount
                          </Typography>
                          <TextField
                            variant="outlined"
                            type="number"
                            fullWidth
                            placeholder="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={txStatus === "sending" || txStatus === "verifying"}
                            slotProps={{
                              htmlInput: { min: 0.01, step: 0.01 },
                              input: {
                                sx: { fontSize: "1.02rem" }
                              }
                            }}
                          />

                          {feeBreakdown && (
                            <Box sx={{ mt: 2, p: 2.5, bgcolor: "rgba(255,255,255,0.015)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                              <Stack spacing={1.5}>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                  <Typography variant="caption" color="text.secondary">Platform fee ({PLATFORM_FEE_PCT}%)</Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: "error.light" }}>
                                    -{feeBreakdown.fee} SOL
                                  </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1.5, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Creator receives</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 900, color: tipTier.color }}>
                                    {feeBreakdown.creatorAmount} SOL
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          )}
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Message
                          </Typography>
                          <TextField
                            variant="outlined"
                            multiline
                            rows={3}
                            fullWidth
                            placeholder="Type a message (it will display on stream)..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={txStatus === "sending" || txStatus === "verifying"}
                            helperText={`${message.length}/280`}
                            slotProps={{
                              formHelperText: { sx: { textAlign: "right", fontWeight: 500 } },
                              input: { sx: { fontSize: "1.02rem" } }
                            }}
                          />
                        </Box>

                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="large"
                          disabled={!isFormValid || txStatus === "sending" || txStatus === "verifying"}

                          sx={{ py: 1.8, fontSize: "1.05rem", borderRadius: "10px", background: `linear-gradient(135deg, ${currentTheme.palette.secondary?.main || currentTheme.palette.primary.main} 0%, ${currentTheme.palette.primary.main} 100%)` }}
                        >
                          {txStatus === "sending" && "Executing Tip..."}
                          {txStatus === "verifying" && "Verifying Tip..."}
                          {txStatus === "idle" && "Send Superchat"}
                          {txStatus === "success" && "Send Another"}
                          {txStatus === "error" && "Retry Transaction"}
                        </Button>
                      </Stack>
                    </form>
                  )}

                  {/* Transaction status logs */}
                  {txHash && (
                    <Alert
                      severity="success"
                      sx={{ mt: 3, borderRadius: "10px", bgcolor: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)", color: "#fff" }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Tip successful!</Typography>
                      <Link
                        href={getExplorerUrl(txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: "primary.main", textDecoration: "none", fontWeight: 700, fontSize: "0.8rem", mt: 0.5, display: "inline-block" }}
                      >
                        View Solana Tx →
                      </Link>

                      <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.8 }}>Verification:</Typography>
                        {verificationStatus === "verified" ? (
                          <Chip label="Verified" color="success" size="small" sx={{ fontWeight: 800, borderRadius: "6px", height: 20 }} />
                        ) : verificationStatus === "failed" ? (
                          <Chip label="Failed" color="error" size="small" sx={{ fontWeight: 800, borderRadius: "6px", height: 20 }} />
                        ) : (
                          <Chip label="Pending" color="warning" size="small" variant="outlined" sx={{ fontWeight: 800, borderRadius: "6px", height: 20 }} />
                        )}
                        {verificationStatus !== "verified" && (
                          <IconButton size="small" onClick={handleCheckStatus} disabled={checkingStatus} sx={{ ml: 1, p: 0.2 }}>
                            {checkingStatus ? <CircularProgress size={12} color="inherit" /> : <RefreshIcon sx={{ fontSize: 14 }} />}
                          </IconButton>
                        )}
                      </Box>
                    </Alert>
                  )}

                  {txStatus === "error" && errorMsg && (
                    <Alert
                      severity="error"
                      sx={{ mt: 3, borderRadius: "10px", bgcolor: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)", color: "#fff" }}
                    >
                      {errorMsg}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

// Dummy icon component for Kick stream brand icon rendering
function TvIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
      <polyline points="17 2 12 7 7 2" />
    </svg>
  );
}
