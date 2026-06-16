import { useState, useEffect, useRef } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { getUserProfile } from "../services/api";
import { getExplorerUrl } from "../services/solana";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { Container, Card, CardContent, Typography, Box, Button, List, ListItem, Divider, Link, Chip, Tabs, Tab, Pagination, Tooltip, Grid } from "@mui/material";
import { ProfilePageSkeleton } from "../components/common/LoadingSkeletons";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ErrorIcon from "@mui/icons-material/Error";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import toast from "react-hot-toast";
import TipForm from "../components/features/tips/TipForm";
import SEO from "../components/common/SEO";
import { SITE_NAME } from "../shared/constants";
import BoringAvatar from "boring-avatars";

interface UserProfile {
  wallet_address: string;
  name: string;
  bio?: string;
  total_received: number;
  total_sent: number;
}

interface Tip {
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

export default function ProfilePage() {
  const { wallet } = useParams<{ wallet: string }>();
  const { walletAddress } = useWalletAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTipForm, setShowTipForm] = useState(false);

  const lastTabRef = useRef(activeTab);

  // Reset page when tab changes
  useEffect(() => {
    if (activeTab !== lastTabRef.current) {
      setPage(1);
    }
  }, [activeTab]);

  // Fetch creator profile details
  useEffect(() => {
    if (!wallet) return;

    async function fetchCreator() {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserProfile(wallet!, 1, 5, "received");
        setUser(data.user);
        setTips(data.recent_tips || []);
        setTotalPages(data.pagination?.pages || 1);
      } catch (err: any) {
        setError(err.message || "Creator profile not found");
      } finally {
        setLoading(false);
      }
    }

    fetchCreator();
  }, [wallet]);

  // Fetch paginated tips
  useEffect(() => {
    if (!wallet || loading) return;

    // If activeTab changed but page is not reset to 1 yet, wait for the reset
    if (activeTab !== lastTabRef.current && page !== 1) {
      return;
    }
    lastTabRef.current = activeTab;

    async function fetchPaginatedTips() {
      try {
        const tabKey = activeTab === 0 ? "received" : "sent";
        const data = await getUserProfile(wallet!, page, 5, tabKey);
        setTips(data.recent_tips || []);
        setTotalPages(data.pagination?.pages || 1);
      } catch (err: any) {
        console.error("Failed to fetch paginated tips:", err);
      }
    }

    fetchPaginatedTips();
  }, [wallet, page, activeTab, loading]);

  const copyWallet = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.wallet_address);
    toast.success("Wallet address copied!", { icon: "📋" });
  };

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

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    document.getElementById("profile-activity-header")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 10, minHeight: "calc(100vh - 64px)" }}>
      {loading && <ProfilePageSkeleton />}

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

      {!loading && user && (
        <Box sx={{ position: "relative", animation: "fadeInUp 0.6s ease-out" }}>
          <SEO 
            title={user.name || shorten(user.wallet_address)} 
            description={user.bio || `Send a superchat to ${user.name || shorten(user.wallet_address)} on ${SITE_NAME} — the ultimate Solana engagement platform.`}
          />
          
          {/* Glowing Background Orbs */}
          <Box
            sx={{
              position: "absolute",
              top: "-10%",
              left: "-10%",
              width: "350px",
              height: "350px",
              background: (theme) => `radial-gradient(circle, ${theme.palette.primary.main}12 0%, transparent 70%)`,
              zIndex: -1,
              filter: "blur(40px)",
              pointerEvents: "none"
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "20%",
              right: "-10%",
              width: "400px",
              height: "400px",
              background: (theme) => `radial-gradient(circle, ${theme.palette.secondary?.main || theme.palette.primary.main}0d 0%, transparent 70%)`,
              zIndex: -1,
              filter: "blur(50px)",
              pointerEvents: "none"
            }}
          />

          {/* Profile Card with premium layout and banner */}
          <Card sx={{ 
            mb: 4, 
            overflow: "visible", 
            position: "relative", 
            border: "1px solid rgba(255, 255, 255, 0.05)",
            background: "rgba(21, 29, 43, 0.4)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
          }}>
            {/* Top decorative gradient banner */}
            <Box
              sx={{
                height: { xs: "80px", sm: "110px" },
                borderRadius: "16px 16px 0 0",
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark}88 0%, ${theme.palette.background.default} 70%, ${theme.palette.secondary?.dark || theme.palette.primary.dark}44 100%)`,
                position: "relative",
                overflow: "hidden",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 30 0 L 0 0 0 30' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/svg%3E\")",
                }
              }}
            >
              {/* Bottom line accent */}
              <Box sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: (theme) => `linear-gradient(90deg, transparent, ${theme.palette.primary.main}88, ${theme.palette.secondary?.main || theme.palette.primary.main}88, transparent)`,
                zIndex: 2,
              }} />
            </Box>

            <CardContent sx={{ pt: 0, px: { xs: 3, md: 5 }, pb: 4 }}>
              {/* Profile Main Header Layout */}
              <Box sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "center", sm: "flex-end" },
                gap: { xs: 2, sm: 3 },
                mb: 3,
                width: "100%",
                textAlign: { xs: "center", sm: "left" }
              }}>
                {/* Floating Avatar Container */}
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    p: 0.4,
                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.main})`,
                    boxShadow: (theme) => `0 0 0 4px ${theme.palette.background.default}, 0 8px 24px ${theme.palette.primary.main}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 5,
                    mt: "-48px",
                    flexShrink: 0
                  }}
                >
                  <Box sx={{
                    borderRadius: "50%",
                    overflow: "hidden",
                    width: 86,
                    height: 86
                  }}>
                    <BoringAvatar
                      name={user.name || user.wallet_address}
                      variant="beam"
                      size={86}
                      colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]}
                    />
                  </Box>
                </Box>

                {/* Name / Handle details */}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, display: "flex", alignItems: "center", justifyContent: { xs: "center", sm: "flex-start" }, gap: 1 }}>
                    {user.name || shorten(user.wallet_address)}
                  </Typography>
                  
                  <Tooltip title="Copy Wallet Address" arrow>
                    <Box
                      onClick={copyWallet}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.5,
                        py: 0.6,
                        borderRadius: "8px",
                        bgcolor: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": { 
                          bgcolor: "rgba(255,255,255,0.05)", 
                          borderColor: "rgba(255,255,255,0.1)",
                          transform: "translateY(-1px)"
                        }
                      }}
                    >
                      <Typography variant="caption" sx={{ fontFamily: "'Space Mono', monospace", color: "text.secondary" }}>
                        {shorten(user.wallet_address)}
                      </Typography>
                      <ContentCopyIcon sx={{ fontSize: 11, color: "text.secondary" }} />
                    </Box>
                  </Tooltip>
                </Box>
              </Box>

              {user.bio && (
                <Typography variant="body1" sx={{ mb: 4, fontStyle: "italic", color: "text.secondary", maxWidth: 550, mx: { xs: "auto", sm: 0 }, textAlign: { xs: "center", sm: "left" } }}>
                  "{user.bio}"
                </Typography>
              )}

              {/* Enhanced Stats Cards Grid */}
              <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card sx={{
                    bgcolor: "rgba(255, 255, 255, 0.015)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    boxShadow: "none",
                    borderRadius: "12px",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.03)", transform: "translateY(-2px)" },
                    transition: "all 0.2s"
                  }}>
                    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "16px !important", justifyContent: { xs: "center", sm: "flex-start" } }}>
                      <Box sx={{ p: 1.2, borderRadius: "10px", bgcolor: (theme) => `${theme.palette.primary.main}15`, color: "primary.main", display: "flex" }}>
                        <MonetizationOnIcon />
                      </Box>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                          Total Received
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.main} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                          {formatSol(user.total_received)} SOL
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card sx={{
                    bgcolor: "rgba(255, 255, 255, 0.015)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    boxShadow: "none",
                    borderRadius: "12px",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.03)", transform: "translateY(-2px)" },
                    transition: "all 0.2s"
                  }}>
                    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "16px !important", justifyContent: { xs: "center", sm: "flex-start" } }}>
                      <Box sx={{ p: 1.2, borderRadius: "10px", bgcolor: (theme) => `${theme.palette.secondary?.main || theme.palette.primary.main}15`, color: "secondary.main", display: "flex" }}>
                        <TrendingUpIcon />
                      </Box>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                          Total Sent
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "secondary.light" }}>
                          {formatSol(user.total_sent)} SOL
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Action Buttons: Edit or Tip */}
              {walletAddress === user.wallet_address ? (
                <Box sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-start" } }}>
                  <Button component={RouterLink} to="/settings" variant="outlined" color="primary" size="large" sx={{ borderRadius: "10px", fontWeight: 750 }}>
                    Edit Profile
                  </Button>
                </Box>
              ) : (
                <Box sx={{ mt: 3 }}>
                  {!showTipForm ? (
                    <Box sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-start" } }}>
                      <Button 
                        variant="contained" 
                        size="large" 
                        onClick={() => setShowTipForm(true)}
                        sx={{ 
                          px: 5, 
                          py: 1.6, 
                          borderRadius: "12px", 
                          fontWeight: 800,
                          background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
                          boxShadow: (theme) => `0 6px 20px ${theme.palette.primary.main}22`,
                          "&:hover": { transform: "translateY(-1px)", boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}4d` }
                        }}
                      >
                        Send Super Chat
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "left", animation: "fadeInUp 0.4s ease-out" }}>
                      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Send Tip</Typography>
                        <Button size="small" onClick={() => setShowTipForm(false)} sx={{ color: "text.secondary" }}>Cancel</Button>
                      </Box>
                      <TipForm defaultCreatorAddress={user.wallet_address} />
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Activity Ledger Card */}
          <Card id="profile-activity-header" sx={{ 
            border: "1px solid rgba(255, 255, 255, 0.05)",
            background: "rgba(21, 29, 43, 0.3)",
            backdropFilter: "blur(16px)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)"
          }}>
            <Box sx={{ borderBottom: 1, borderColor: "rgba(255,255,255,0.06)", bgcolor: "rgba(0, 0, 0, 0.15)" }}>
              <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} centered textColor="primary" indicatorColor="primary">
                <Tab label="Received Chats" sx={{ fontWeight: 800, py: 2 }} />
                <Tab label="Sent Chats" sx={{ fontWeight: 800, py: 2 }} />
              </Tabs>
            </Box>
            <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
              <List disablePadding>
                {tips.length === 0 ? (
                  <Typography sx={{ textAlign: "center", py: 4, color: "text.secondary", fontStyle: "italic" }}>
                    No activity found
                  </Typography>
                ) : (
                  tips.map((tip, idx) => (
                    <Box key={tip.tx_hash}>
                      <ListItem sx={{ py: 2.5, px: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                          {/* Avatar */}
                          <Box sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: (theme) => `2px solid ${theme.palette.primary.main}22`,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                            flexShrink: 0
                          }}>
                            <BoringAvatar
                              name={activeTab === 0 ? (tip.sender_name || tip.sender_wallet) : (tip.creator_name || tip.creator_wallet)}
                              variant="beam"
                              size={44}
                              colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]}
                            />
                          </Box>

                          {/* Content */}
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5, flexWrap: "wrap", gap: 1 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                  {formatSol(tip.amount)} SOL
                                </Typography>
                                {tip.status && (
                                  <Chip 
                                    label={tip.status} 
                                    color={tip.status === "verified" ? "success" : tip.status === "failed" ? "error" : "warning"} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ fontWeight: 800, fontSize: "0.65rem", height: 20, borderRadius: "6px" }}
                                  />
                                )}
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary">
                                {activeTab === 0 ? (
                                  <>from <Link component={RouterLink} to={`/profile/${tip.sender_wallet}`} color="inherit" sx={{ fontWeight: 600, "&:hover": { color: "primary.main" } }}>{tip.sender_name || shorten(tip.sender_wallet)}</Link></>
                                ) : (
                                  <>to <Link component={RouterLink} to={`/profile/${tip.creator_wallet}`} color="inherit" sx={{ fontWeight: 600, "&:hover": { color: "primary.main" } }}>{tip.creator_name || shorten(tip.creator_wallet)}</Link></>
                                )}
                              </Typography>
                            </Box>

                            {tip.message && (
                              <Box sx={{ my: 0.5, p: 1, bgcolor: "rgba(255,255,255,0.01)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.03)" }}>
                                <Typography variant="body2" sx={{ fontStyle: "italic", opacity: 0.9 }}>"{tip.message}"</Typography>
                              </Box>
                            )}

                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatTime(tip.timestamp)}
                              </Typography>
                              
                              <Link 
                                href={getExplorerUrl(tip.tx_hash)} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                color="primary.main"
                                sx={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: 0.5, 
                                  fontSize: "0.75rem", 
                                  textDecoration: "none", 
                                  opacity: 0.8,
                                  "&:hover": { opacity: 1 }
                                }}
                              >
                                Explorer <OpenInNewIcon sx={{ fontSize: 12 }} />
                              </Link>
                            </Box>
                          </Box>
                        </Box>
                      </ListItem>
                      {idx < tips.length - 1 && <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />}
                    </Box>
                  ))
                )}
              </List>
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
                          boxShadow: (theme) => `0 0 10px ${theme.palette.primary.main}4d`,
                          fontWeight: 900
                        }
                      }
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
}
