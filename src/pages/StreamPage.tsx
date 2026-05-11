import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStream, getUserProfile, followUser, unfollowUser, getFollowStatus } from "../services/api";
import { useSocket } from "../context/SocketContext";
import { useWalletAuth } from "../hooks/useWalletAuth";
import ChatBox from "../components/ChatBox";
import ModerationPanel from "../components/ModerationPanel";
import ErrorBoundary from "../components/ErrorBoundary";
import { Container, Grid, Box, Typography, Paper, Chip, Avatar, Skeleton, Button, Tabs, Tab, TextField, Switch, FormControlLabel, useMediaQuery, useTheme, Fab, IconButton, CircularProgress } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import SEO from "../components/SEO";

export default function StreamPage() {
  const { id } = useParams<{ id: string }>();
  const { walletAddress, isAuthenticated } = useWalletAuth();
  const { socket } = useSocket();
  const [stream, setStream] = useState<any>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const isCreator = isAuthenticated && walletAddress === stream?.creator_wallet;

  useEffect(() => {
    if (!id || !socket) return;

    // Join room
    socket.emit("join_room", id);

    // Listen for updates
    socket.on("viewer_count_update", (count: number) => {
      setViewerCount(count);
    });

    return () => {
      socket.emit("leave_room", id);
      socket.off("viewer_count_update");
    };
  }, [id, socket]);

  const fetchStreamData = async () => {
    if (!id) return;
    try {
      const streamData = await getStream(id);
      setStream(streamData);
      setViewerCount(streamData.viewer_count || 0);

      // Fetch creator profile
      const creatorData = await getUserProfile(streamData.creator_wallet);
      setCreator(creatorData.user);

      // Fetch follow status if authenticated
      if (isAuthenticated) {
        const { isFollowing } = await getFollowStatus(streamData.creator_wallet);
        setIsFollowing(isFollowing);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load stream");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!isAuthenticated || !stream) {
      toast.error("Please sign in to follow creators");
      return;
    }
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(stream.creator_wallet);
        setIsFollowing(false);
        toast.success("Unfollowed creator");
      } else {
        await followUser(stream.creator_wallet);
        setIsFollowing(true);
        toast.success("Following creator!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  useEffect(() => {
    fetchStreamData();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton
              variant="rectangular"
              sx={{
                width: "100%",
                aspectRatio: "16/9",
                borderRadius: "16px"
              }}
            />
            <Box sx={{ mt: 3 }}>
              <Skeleton variant="text" sx={{ fontSize: "2.5rem" }} width="60%" />
              <Skeleton variant="text" width="20%" />
              <Skeleton variant="rectangular" height={150} sx={{ mt: 2, borderRadius: "16px" }} />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton
              variant="rectangular"
              sx={{
                height: { md: "calc(100vh - 128px)", xs: 400 },
                borderRadius: "16px"
              }}
            />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !stream) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" color="error">{error || "Stream not found"}</Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => window.location.href = "/"}>Go Home</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1, md: 4 }, px: { xs: 0, md: 2 }, minHeight: "calc(100vh - 64px)" }}>
      <SEO 
        title={stream?.title || "Livestream"} 
        description={stream?.description || "Join the live conversation on SolChat!"} 
      />
      <Grid container spacing={isMobile ? 0 : 3}>
        {/* Main Content Area */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Video Placeholder */}
          <ErrorBoundary>
            <Paper
              sx={{
                aspectRatio: "16/9",
                background: "linear-gradient(45deg, #0a0a0f 0%, #1a1a25 100%)",
                borderRadius: { xs: 0, md: "16px" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                position: "relative",
                border: { xs: "none", md: "1px solid rgba(255,255,255,0.08)" },
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "radial-gradient(circle at 50% 50%, rgba(0,242,255,0.05) 0%, transparent 70%)",
                  pointerEvents: "none"
                }
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "rgba(0,242,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid rgba(0,242,255,0.2)",
                  mb: 2,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.1)",
                    bgcolor: "rgba(0,242,255,0.2)",
                    borderColor: "#00f2ff",
                    boxShadow: "0 0 30px rgba(0,242,255,0.3)"
                  }
                }}
              >
                <Box
                  sx={{
                    width: 0,
                    height: 0,
                    borderTop: "15px solid transparent",
                    borderBottom: "15px solid transparent",
                    borderLeft: "25px solid #00f2ff",
                    ml: 1
                  }}
                />
              </Box>
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.05em" }}>
                VIDEO FEED OFFLINE
              </Typography>

              {stream.status === "live" && (
                <Chip
                  icon={<FiberManualRecordIcon sx={{ fontSize: "0.8rem !important", color: "#ff4b4b !important" }} />}
                  label="LIVE"
                  sx={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    bgcolor: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    color: "#fff",
                    fontWeight: 900,
                    px: 1,
                    animation: "pulse 2s infinite"
                  }}
                />
              )}
            </Paper>
          </ErrorBoundary>

          {/* Stream Info */}
          <Box sx={{ mt: { xs: 2, md: 3 }, px: { xs: 2, md: 0 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
              <Box>
                <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 800, mb: 1 }}>
                  {stream.title}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip label={stream.category} size="small" variant="outlined" />
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "rgba(255,255,255,0.05)", px: 2, py: 1, borderRadius: "10px" }}>
                <PeopleIcon color="primary" fontSize="small" />
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{viewerCount}</Typography>
              </Box>
            </Box>

            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: "16px", bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar src={creator?.avatar_url} sx={{ width: { xs: 40, md: 56 }, height: { xs: 40, md: 56 }, border: "2px solid", borderColor: "primary.main" }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {creator?.name || "Anonymous Creator"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stream.creator_wallet.slice(0, 4)}...{stream.creator_wallet.slice(-4)}
                  </Typography>
                </Box>
                <Button 
                  variant={isFollowing ? "outlined" : "contained"} 
                  size="small"
                  onClick={handleToggleFollow}
                  disabled={followLoading || isCreator}
                  startIcon={followLoading ? <CircularProgress size={16} /> : null}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </Box>
              <Typography variant="body2">{stream.description}</Typography>
            </Paper>
          </Box>
        </Grid>

        {/* Sidebar (Chat Area) */}
        <Grid 
          size={{ xs: 12, md: 4 }}
          sx={{
            position: isMobile ? "fixed" : "relative",
            top: isMobile ? (showMobileChat ? 0 : "100vh") : "auto",
            left: 0,
            width: "100%",
            height: isMobile ? "100vh" : "auto",
            zIndex: isMobile ? 1300 : "auto",
            transition: "top 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            bgcolor: "background.default"
          }}
        >
          <Paper
            sx={{
              height: { md: "calc(100vh - 128px)", xs: "100%" },
              borderRadius: { md: "16px", xs: 0 },
              display: "flex",
              flexDirection: "column",
              bgcolor: "rgba(10, 10, 15, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.05)",
              overflow: "hidden"
            }}
          >
            <Box sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center" }}>
              {isMobile && (
                <IconButton onClick={() => setShowMobileChat(false)} sx={{ ml: 1, color: "text.secondary" }}>
                  <CloseIcon />
                </IconButton>
              )}
              <Tabs 
                value={activeTab} 
                onChange={(_, v) => setActiveTab(v)} 
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
                sx={{ flexGrow: 1 }}
              >
                <Tab label="CHAT" />
                {isCreator && <Tab label="MODERATION" />}
              </Tabs>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
              {activeTab === 0 ? (
                <ErrorBoundary>
                  <ChatBox streamId={id!} creatorWallet={stream.creator_wallet} />
                </ErrorBoundary>
              ) : (
                <ModerationPanel 
                  streamId={id!} 
                  initialSlowMode={stream.slow_mode || 0}
                  initialBlockedKeywords={stream.blocked_keywords || []}
                  bannedWallets={stream.banned_wallets || []}
                  initialDonationGoal={stream.donation_goal || 0}
                  onUpdate={fetchStreamData}
                />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Mobile Chat Toggle Button */}
      {isMobile && !showMobileChat && (
        <Fab
          color="primary"
          aria-label="chat"
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            boxShadow: "0 8px 32px rgba(0, 242, 255, 0.4)"
          }}
          onClick={() => setShowMobileChat(true)}
        >
          <ChatIcon />
        </Fab>
      )}
    </Container>
  );
}
