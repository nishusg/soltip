import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStream, getUserProfile } from "../services/api";
import { useSocket } from "../context/SocketContext";
import { useWalletAuth } from "../hooks/useWalletAuth";
import ChatBox from "../components/ChatBox";
import ModerationPanel from "../components/ModerationPanel";
import ErrorBoundary from "../components/ErrorBoundary";
import { Container, Grid, Box, Typography, Paper, Chip, Avatar, Skeleton, Button, Tabs, Tab, TextField, Switch, FormControlLabel } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

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
    } catch (err: any) {
      setError(err.message || "Failed to load stream");
    } finally {
      setLoading(false);
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
    <Container maxWidth="xl" sx={{ py: 4, minHeight: "calc(100vh - 64px)" }}>
      <Grid container spacing={3}>
        {/* Main Content Area */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Video Placeholder */}
          <ErrorBoundary>
            <Paper
              sx={{
                aspectRatio: "16/9",
                background: "linear-gradient(45deg, #0a0a0f 0%, #1a1a25 100%)",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              position: "relative",
              border: "1px solid rgba(255,255,255,0.08)",
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
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                  {stream.title}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip label={stream.category} size="small" variant="outlined" />
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "rgba(255,255,255,0.05)", px: 2, py: 1, borderRadius: "10px" }}>
                <PeopleIcon color="primary" />
                <Typography sx={{ fontWeight: 700 }}>{viewerCount}</Typography>
              </Box>
            </Box>

            <Paper sx={{ p: 3, borderRadius: "16px", bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar src={creator?.avatar_url} sx={{ width: 56, height: 56, border: "2px solid", borderColor: "primary.main" }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {creator?.name || "Anonymous Creator"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stream.creator_wallet.slice(0, 4)}...{stream.creator_wallet.slice(-4)}
                  </Typography>
                </Box>
                <Button variant="contained" size="small" sx={{ ml: "auto" }}>Follow</Button>
              </Box>
              <Typography variant="body1">{stream.description}</Typography>
            </Paper>
          </Box>
        </Grid>

        {/* Sidebar (Chat Area) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              height: { md: "calc(100vh - 128px)" },
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              bgcolor: "rgba(10, 10, 15, 0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.05)",
              overflow: "hidden"
            }}
          >
            <Box sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <Tabs 
                value={activeTab} 
                onChange={(_, v) => setActiveTab(v)} 
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
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
    </Container>
  );
}
