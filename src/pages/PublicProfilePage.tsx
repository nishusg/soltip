import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { getPublicProfileByUsername, verifyAndStoreTransaction, getTransactionStatus } from "../services/api";
import { getExplorerUrl, sendTip, calculateFeeBreakdown } from "../services/solana";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "../context/AuthContext";
import { baseTheme, premiumThemes } from "../themes";
import { getPremiumOverrides } from "../themes/shared";
import BoringAvatar from "boring-avatars";
import SEO from "../components/SEO";
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
  IconButton
} from "@mui/material";
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
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import toast from "react-hot-toast";

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

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { connection } = useConnection();
  const wallet = useWallet();
  const { isAuthenticated, login, isLoading: authLoading } = useAuth();

  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [tips, setTips] = useState<EnrichedTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.warn("Backend verification error:", verifyErr);
        toast.error("Tip sent, but backend indexing failed");
      }

      setTxStatus("success");
      setAmount("");
      setMessage("");
      
      // Reload recent superchats
      const updatedData = await getPublicProfileByUsername(username!);
      setTips(updatedData.recent_tips || []);
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
    } catch (err: any) {
      console.error("Status check failed:", err);
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

  // Load Custom Theme Dynamically
  const currentTheme = useMemo(() => {
    if (creator?.is_premium) {
      const themeKey = creator.selected_theme || "gold";
      return premiumThemes[themeKey] || premiumThemes.gold;
    }
    return baseTheme;
  }, [creator]);

  const premiumStyles = useMemo(() => {
    if (creator?.is_premium) {
      const primaryColor = currentTheme.palette.primary.main;
      const secondaryColor = currentTheme.palette.secondary?.main || primaryColor;
      const bgColor = currentTheme.palette.background.default || "#050508";
      return getPremiumOverrides(primaryColor, secondaryColor, bgColor, "");
    }
    return "";
  }, [creator, currentTheme]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <CircularProgress size={48} sx={{ mb: 2, color: "primary.main" }} />
        <Typography color="text.secondary" variant="h6">Loading public profile...</Typography>
      </Box>
    );
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
            Verify the username slug or check if the creator is registered on SolChat.
          </Typography>
          <Button component={RouterLink} to="/" variant="outlined" startIcon={<ArrowBackIcon />}>
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
            description={creator.bio || `Watch streams, click social links, and send instant tip superchats to @${creator.username} on SolChat.`}
          />

          {/* ---- Banner Profile Header Card ---- */}
          <Card sx={{ mb: 4, overflow: "visible", position: "relative", border: `1px solid ${currentTheme.palette.primary.main}22` }}>
            {/* Top decorative gradient banner */}
            <Box
              sx={{
                height: "150px",
                borderRadius: "16px 16px 0 0",
                background: `linear-gradient(135deg, ${currentTheme.palette.primary.main}cc 0%, ${currentTheme.palette.secondary?.main || currentTheme.palette.primary.main}99 50%, ${currentTheme.palette.primary.main}55 100%)`,
                position: "relative",
                overflow: "hidden",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                }
              }}
            />

            <CardContent sx={{ pt: 0, px: { xs: 3, md: 6 }, pb: 5 }}>
              <Grid container spacing={3} sx={{ alignItems: "flex-end", mt: -7, mb: 3 }}>
                <Grid>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      p: 0.5,
                      background: `linear-gradient(135deg, ${currentTheme.palette.primary.main}, ${currentTheme.palette.secondary?.main || currentTheme.palette.primary.main})`,
                      boxShadow: `0 0 0 4px ${currentTheme.palette.background.default}, 0 8px 32px ${currentTheme.palette.primary.main}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Box sx={{ borderRadius: "50%", overflow: "hidden", width: 108, height: 108 }}>
                      <BoringAvatar
                        name={creator.name || creator.wallet_address}
                        variant="beam"
                        size={108}
                        colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]}
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid size="grow" sx={{ mt: { xs: 2, sm: 0 } }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 2 }}>
                    <Box>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <Typography variant="h4" sx={{ fontWeight: 900 }}>
                          {creator.name}
                        </Typography>
                        {creator.is_premium && (
                          <Chip 
                            label="PREMIUM" 
                            size="small" 
                            sx={{ 
                              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)", 
                              color: "#000", 
                              fontWeight: 900,
                              fontSize: "0.68rem"
                            }} 
                          />
                        )}
                      </Stack>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mt: 0.5 }}>
                        @{creator.username}
                      </Typography>
                    </Box>

                    {/* Live Badge + Share Button */}
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                      <Chip
                        label={isLive ? "🔴 LIVE" : "● ONLINE"}
                        size="small"
                        sx={{ 
                          fontWeight: 900,
                          px: 1.5,
                          borderRadius: "50px", 
                          fontSize: "0.78rem",
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
                        startIcon={<ShareIcon sx={{ fontSize: 15 }} />}
                        sx={{
                          borderRadius: "10px",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          px: 2,
                          py: 0.8,
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
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
                    <Box 
                      onClick={copyWallet}
                      sx={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: 1, 
                        px: 2, 
                        py: 0.8, 
                        borderRadius: "8px", 
                        bgcolor: "rgba(255,255,255,0.03)", 
                        border: "1px solid rgba(255,255,255,0.06)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.12)" }
                      }}
                    >
                      <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: "0.8rem", color: "text.secondary" }}>
                        {shorten(creator.wallet_address)}
                      </Typography>
                      <ContentCopyIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={copyShareableLink}
                      startIcon={<ShareIcon sx={{ fontSize: 15 }} />}
                      sx={{
                        borderRadius: "8px",
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        px: 2,
                        py: 0.8,
                        background: `linear-gradient(135deg, ${currentTheme.palette.primary.main} 0%, ${currentTheme.palette.secondary?.main || currentTheme.palette.primary.main} 100%)`,
                        boxShadow: `0 4px 14px ${currentTheme.palette.primary.main}30`,
                        "&:hover": { transform: "translateY(-1px)", boxShadow: `0 6px 18px ${currentTheme.palette.primary.main}50` }
                      }}
                    >
                      Copy Shareable Link
                    </Button>
                  </Stack>

                  {creator.bio && (
                    <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 700, lineHeight: 1.8, fontSize: "1.05rem" }}>
                      {creator.bio}
                    </Typography>
                  )}
                </Grid>
              </Grid>

              {/* Social Channels Row */}
              {creator.socials && Object.values(creator.socials).some(v => !!v) && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.1em", mb: 2 }}>
                    Social Networks
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5 }}>
                    {creator.socials.twitter && (
                      <Button
                        href={`https://twitter.com/${creator.socials.twitter}`}
                        target="_blank"
                        variant="outlined"
                        startIcon={<TwitterIcon />}
                        sx={{ borderRadius: "10px", fontWeight: 700 }}
                      >
                        Twitter
                      </Button>
                    )}
                    {creator.socials.twitch && (
                      <Button
                        href={`https://twitch.tv/${creator.socials.twitch}`}
                        target="_blank"
                        variant="outlined"
                        startIcon={<LanguageIcon />}
                        sx={{ borderRadius: "10px", fontWeight: 700, borderColor: "#6441a5", color: "#b9a3e3", "&:hover": { bgcolor: "rgba(100,65,165,0.1)", borderColor: "#7d5bbe" } }}
                      >
                        Twitch
                      </Button>
                    )}
                    {creator.socials.youtube && (
                      <Button
                        href={creator.socials.youtube.startsWith("http") ? creator.socials.youtube : `https://youtube.com/${creator.socials.youtube}`}
                        target="_blank"
                        variant="outlined"
                        startIcon={<YouTubeIcon />}
                        sx={{ borderRadius: "10px", fontWeight: 700, borderColor: "#ff0000", color: "#ff8080", "&:hover": { bgcolor: "rgba(255,0,0,0.1)", borderColor: "#cc0000" } }}
                      >
                        YouTube
                      </Button>
                    )}
                    {creator.socials.kick && (
                      <Button
                        href={`https://kick.com/${creator.socials.kick}`}
                        target="_blank"
                        variant="outlined"
                        startIcon={<TvIcon />}
                        sx={{ borderRadius: "10px", fontWeight: 700, borderColor: "#53fc18", color: "#9fff7d", "&:hover": { bgcolor: "rgba(83,252,24,0.1)", borderColor: "#41d60f" } }}
                      >
                        Kick
                      </Button>
                    )}
                    {creator.socials.discord && (
                      <Button
                        href={creator.socials.discord.startsWith("http") ? creator.socials.discord : `https://${creator.socials.discord}`}
                        target="_blank"
                        variant="outlined"
                        startIcon={<ChatIcon />}
                        sx={{ borderRadius: "10px", fontWeight: 700, borderColor: "#5865F2", color: "#8ea1ff", "&:hover": { bgcolor: "rgba(88,101,242,0.1)", borderColor: "#4752c4" } }}
                      >
                        Discord
                      </Button>
                    )}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* ---- Body Container Grid ---- */}
          <Grid container spacing={4}>
            
            {/* Left/Middle: Live Stream & Recent Superchats */}
            <Grid size={{ xs: 12, md: isLive ? 7 : 6 }}>
              <Stack spacing={4}>
                
                {/* 📺 Embedded Stream Section */}
                {isLive && (
                  <Card>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, px: 1, display: "flex", alignItems: "center", gap: 1 }}>
                        📺 Creator Live Broadcast
                      </Typography>
                      <Box sx={{ width: "100%", overflow: "hidden", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
                        {creator.stream_embed.platform === "twitch" && (
                          <iframe
                            src={`https://player.twitch.tv/?channel=${creator.stream_embed.channel}&parent=${window.location.hostname}&muted=false`}
                            height="400"
                            width="100%"
                            allowFullScreen
                            style={{ border: "none" }}
                          />
                        )}
                        {creator.stream_embed.platform === "youtube" && (
                          <iframe
                            src={`https://www.youtube.com/embed/${creator.stream_embed.channel}?autoplay=0`}
                            height="400"
                            width="100%"
                            allowFullScreen
                            style={{ border: "none" }}
                          />
                        )}
                        {creator.stream_embed.platform === "kick" && (
                          <iframe
                            src={`https://player.kick.com/${creator.stream_embed.channel}`}
                            height="400"
                            width="100%"
                            allowFullScreen
                            style={{ border: "none" }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* 🎙️ Recent Superchats Feed */}
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>🎙️ Recent Superchats</Typography>
                      <Chip label={`${tips.length} tip${tips.length !== 1 ? "s" : ""}`} size="small" variant="outlined" sx={{ fontWeight: 700, borderRadius: "8px", fontSize: "0.72rem" }} />
                    </Stack>

                    {tips.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 6 }}>
                        <Typography sx={{ fontSize: "2.5rem", mb: 1 }}>⚡</Typography>
                        <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No Superchats Yet</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Be the first to support {creator.name}!
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={2.5}>
                        {tips.map((tip, idx) => (
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
                                  <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "8px", borderLeft: `3px solid ${currentTheme.palette.primary.main}` }}>
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
                            {idx < tips.length - 1 && <Divider sx={{ borderColor: "rgba(255,255,255,0.04)", my: 1 }} />}
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            {/* Right: Quick Tip Widget Panel */}
            <Grid size={{ xs: 12, md: isLive ? 5 : 6 }}>
              
              {/* Tipping Panel Widget */}
              <Card sx={{ position: "relative", overflow: "visible" }}>
                <Box
                  sx={{
                    position: "absolute",
                    top: -1,
                    left: "10%",
                    right: "10%",
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${currentTheme.palette.primary.main}, ${currentTheme.palette.secondary?.main || currentTheme.palette.primary.main}, transparent)`
                  }}
                />

                <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 1 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
                      <BoringAvatar name={creator.name || creator.wallet_address} variant="beam" size={40} colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>⚡ Tip {creator.name}</Typography>
                      <Typography variant="caption" color="text.secondary">@{creator.username}</Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Verified on-chain tip direct to creator's wallet — 0% middlemen.
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
                              <Grid size={{ xs: 3 }} key={preset}>
                                <Button
                                  variant="outlined"
                                  fullWidth
                                  onClick={() => handlePresetTip(preset)}
                                  sx={{ 
                                    py: 1.2, 
                                    borderRadius: "10px", 
                                    fontWeight: 800, 
                                    border: amount === preset.toString() ? `2px solid ${currentTheme.palette.primary.main}` : "1px solid rgba(255,255,255,0.06)",
                                    bgcolor: amount === preset.toString() ? `${currentTheme.palette.primary.main}0d` : "transparent"
                                  }}
                                >
                                  {preset}
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
                              input: { sx: { fontSize: "1.02rem" } }
                            }}
                          />

                          {feeBreakdown && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(255,255,255,0.015)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                              <Stack spacing={1}>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                  <Typography variant="caption" color="text.secondary">Platform fee (5%)</Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: "error.light" }}>-{feeBreakdown.fee} SOL</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Creator receives</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 800, color: "primary.main" }}>{feeBreakdown.creatorAmount} SOL</Typography>
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
                          startIcon={
                            txStatus === "sending" || txStatus === "verifying" ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <SendIcon />
                            )
                          }
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
