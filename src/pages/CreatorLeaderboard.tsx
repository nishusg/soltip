import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useRealtimeTips } from "../hooks/useRealtimeTips";
import { getLeaderboard } from "../services/api";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { logger } from "../utils/logger";
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  Chip,
  Pagination,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Button,
  Grid,
  Paper,
  Fade,
  Grow,
  useTheme,
  useMediaQuery
} from "@mui/material";
import BoringAvatar from "boring-avatars";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SearchIcon from "@mui/icons-material/Search";
import LaunchIcon from "@mui/icons-material/Launch";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import StarIcon from "@mui/icons-material/Star";
import { CreatorLeaderboardSkeleton } from "../components/common/LoadingSkeletons";

interface Creator {
  wallet_address: string;
  name: string;
  avatar_url?: string;
  total_received: number;
  is_premium?: boolean;
}



export default function CreatorLeaderboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [timeframe, setTimeframe] = useState<"alltime" | "monthly" | "weekly">("alltime");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentUpdates, setRecentUpdates] = useState<Record<string, { amount: number; timestamp: number }>>({});

  const { newTip } = useRealtimeTips();
  const { user } = useWalletAuth();
  const activeTimersRef = useRef<Set<any>>(new Set());

  const itemsPerPage = 10;

  // ---------------------------------------------------------------------------
  // Load Leaderboard
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const data = await getLeaderboard(timeframe);
        setCreators(data.creators || []);
      } catch (err) {
        logger.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [timeframe]);

  // ---------------------------------------------------------------------------
  // Handle Realtime Socket Tips
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (newTip && newTip.creator_wallet && newTip.amount) {
      const creatorWallet = newTip.creator_wallet;

      // Trigger visual pulse/glowing feedback for this creator
      setRecentUpdates((prevUpdates) => ({
        ...prevUpdates,
        [creatorWallet]: {
          amount: newTip.amount,
          timestamp: Date.now()
        }
      }));

      // Reset the animation class after 3 seconds
      const timerId = setTimeout(() => {
        setRecentUpdates((prevUpdates) => {
          const next = { ...prevUpdates };
          delete next[creatorWallet];
          return next;
        });
        activeTimersRef.current.delete(timerId);
      }, 3000);

      activeTimersRef.current.add(timerId);

      setCreators((prev) => {
        const existingIndex = prev.findIndex((c) => c.wallet_address === newTip.creator_wallet);
        let updatedList = [...prev];

        if (existingIndex >= 0) {
          updatedList[existingIndex] = {
            ...updatedList[existingIndex],
            total_received: updatedList[existingIndex].total_received + newTip.amount,
          };
        } else {
          updatedList.push({
            wallet_address: newTip.creator_wallet,
            name: newTip.sender_name || "", // fall back
            total_received: newTip.amount,
            is_premium: false,
          });
        }

        updatedList.sort((a, b) => b.total_received - a.total_received);
        return updatedList.slice(0, 50);
      });
    }
  }, [newTip]);

  // Clean up all active timers on unmount
  useEffect(() => {
    const timers = activeTimersRef.current;
    return () => {
      timers.forEach((timerId) => clearTimeout(timerId));
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function shorten(addr: string): string {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function formatSol(lamports: number): string {
    return (lamports / LAMPORTS_PER_SOL).toFixed(4);
  }

  // ---------------------------------------------------------------------------
  // Search & Filtering
  // ---------------------------------------------------------------------------
  const filteredCreators = useMemo(() => {
    return creators.filter((c) => {
      const nameMatch = c.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const walletMatch = c.wallet_address.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || walletMatch;
    });
  }, [creators, searchQuery]);

  // ---------------------------------------------------------------------------
  // Podium Logic (Top 3)
  // ---------------------------------------------------------------------------
  // We only show the separate visual podium on larger screens when there's no active search
  const showPodium = creators.length >= 3 && !searchQuery && !isMobile;

  const firstPlace = showPodium ? creators[0] : null;
  const secondPlace = showPodium ? creators[1] : null;
  const thirdPlace = showPodium ? creators[2] : null;

  // The remaining list of creators displayed underneath
  const remainingCreators = useMemo(() => {
    return showPodium ? filteredCreators.slice(3) : filteredCreators;
  }, [filteredCreators, showPodium]);

  // Pagination slicing
  const totalPages = Math.ceil(remainingCreators.length / itemsPerPage);
  const paginatedCreators = useMemo(() => {
    return remainingCreators.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [remainingCreators, page]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    document.getElementById("leaderboard-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Current logged in user's rank
  const loggedInUserRank = useMemo(() => {
    if (!user || !user.wallet_address) return null;
    const index = creators.findIndex((c) => c.wallet_address === user.wallet_address);
    return index >= 0 ? index + 1 : null;
  }, [creators, user]);

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", py: { xs: 4, md: 8 }, px: 2, position: "relative", pb: loggedInUserRank ? 16 : 8 }}>
      {/* Dynamic CSS animations for new tip pulsing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes realTimeTipPulse {
          0% {
            border-color: #14F195;
            box-shadow: 0 0 0 0 rgba(20, 241, 149, 0.7);
            transform: translateY(-4px) scale(1.015);
          }
          50% {
            border-color: #14F195;
            box-shadow: 0 0 25px 8px rgba(20, 241, 149, 0.4);
            transform: translateY(-4px) scale(1.015);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }
        .pulse-new-tip {
          animation: realTimeTipPulse 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards !important;
          background: linear-gradient(135deg, rgba(20, 241, 149, 0.15) 0%, rgba(20, 241, 149, 0.03) 100%) !important;
        }
        @keyframes shine {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .gold-shine {
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.15), transparent);
          background-size: 200% 100%;
          animation: shine 3s infinite linear;
        }
      `}} />

      {/* Background Decorative Mesh Gradients */}
      <Box
        sx={{
          position: "absolute", top: "5%", left: "-5%", width: "45%", height: "40%",
          background: (theme: any) => `radial-gradient(circle, ${theme.palette.primary.main}1a 0%, transparent 70%)`,
          zIndex: -1, filter: "blur(90px)"
        }}
      />
      <Box
        sx={{
          position: "absolute", bottom: "15%", right: "-5%", width: "45%", height: "40%",
          background: (theme: any) => `radial-gradient(circle, ${theme.palette.secondary?.main || theme.palette.primary.main}1a 0%, transparent 70%)`,
          zIndex: -1, filter: "blur(90px)"
        }}
      />

      {/* Leaderboard Header */}
      <Box sx={{ textAlign: "center", mb: 6 }} className="fade-in-up">
        <Typography
          id="leaderboard-title"
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 900,
            fontSize: { xs: "2.5rem", sm: "3.75rem" },
            background: (theme: any) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.main} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2,
            letterSpacing: "-0.03em"
          }}
        >
          Ecosystem Leaders
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 650, mx: "auto", fontSize: { xs: "0.95rem", sm: "1.15rem" } }}>
          The legends driving the Solana superchat economy.
          Send a superchat tip to your favorite creator to propel them up the ranks!
        </Typography>
      </Box>

      {/* Control Panel: Timeframe Tabs & Search Bar */}
      <Card sx={{ mb: 6, p: 2, bgcolor: "rgba(255, 255, 255, 0.02)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
        <Grid container spacing={3} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Tabs
              value={timeframe}
              onChange={(_e, v) => { setTimeframe(v); setPage(1); }}
              indicatorColor="primary"
              textColor="primary"
              sx={{
                minHeight: 48,
                "& .MuiTabs-flexContainer": {
                  gap: 1.5
                },
                "& .MuiTab-root": {
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  minHeight: 40,
                  py: 1,
                  px: 3,
                  color: "rgba(255, 255, 255, 0.5)",
                  transition: "all 0.2s ease",
                  "&.Mui-selected": {
                    color: "#fff",
                    bgcolor: "rgba(255,255,255,0.05)",
                  },
                  "&:hover": {
                    color: "#fff",
                    bgcolor: "rgba(255,255,255,0.02)",
                  }
                },
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: "3px"
                }
              }}
            >
              <Tab value="alltime" label="All Time" />
              <Tab value="monthly" label="Monthly (30d)" />
              <Tab value="weekly" label="Weekly (7d)" />
            </Tabs>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search by name or wallet..."
              variant="outlined"
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }
              }}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Loading State */}
      {loading && <CreatorLeaderboardSkeleton />}

      {/* Empty State */}
      {!loading && filteredCreators.length === 0 && (
        <Card sx={{ textAlign: "center", py: 10, bgcolor: "rgba(255,255,255,0.01)", backdropFilter: "blur(10px)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "24px" }}>
          <CardContent>
            <EmojiEventsIcon sx={{ fontSize: 72, color: "rgba(255,255,255,0.06)", mb: 3 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
              No creators found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: "auto" }}>
              {searchQuery ? "Try refining your search query or check the wallet address." : "Be the first to tip a creator and launch the leaderboard!"}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Podium Display (Top 3 on larger screens) */}
      {!loading && showPodium && (
        <Grid
          container
          spacing={3}
          sx={{
            mb: 8,
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            alignItems: "flex-end"
          }}
        >
          {/* 2ND PLACE (SILVER) */}
          {secondPlace && (
            <Grid size={{ xs: 12, md: 3.8 }}>
              <Grow in={true} timeout={600}>
                <Card
                  onClick={() => navigate(`/profile/${secondPlace.wallet_address}`)}
                  className={recentUpdates[secondPlace.wallet_address] ? "pulse-new-tip" : ""}
                  sx={{
                    position: "relative",
                    borderRadius: "24px",
                    border: "1px solid rgba(192, 192, 192, 0.3)",
                    boxShadow: "0 10px 30px rgba(192, 192, 192, 0.05)",
                    textAlign: "center",
                    p: 3,
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      borderColor: "rgba(192, 192, 192, 0.8)",
                      boxShadow: "0 20px 40px rgba(192, 192, 192, 0.15)",
                    }
                  }}
                >
                  {/* Platform Glow Side Border */}
                  <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: 5, bgcolor: "#c0c0c0" }} />
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "#c0c0c0", opacity: 0.8, mb: 1 }}>🥈 2nd</Typography>
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <Box sx={{ p: 0.5, border: "2px solid #c0c0c0", borderRadius: "50%" }}>
                      <BoringAvatar size={76} name={secondPlace.name || secondPlace.wallet_address} variant="beam" colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]} />
                    </Box>
                  </Box>
                  <Typography variant="h6" noWrap sx={{ fontWeight: 800 }}>{secondPlace.name || shorten(secondPlace.wallet_address)}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace", display: "block", mb: 2 }}>{shorten(secondPlace.wallet_address)}</Typography>
                  
                  <Box sx={{ bgcolor: "rgba(192, 192, 192, 0.1)", py: 1, px: 2, borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: 0.5, mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#fff", display: "flex", alignItems: "baseline" }}>
                      {formatSol(secondPlace.total_received)}
                      <Typography component="span" variant="caption" sx={{ ml: 0.5, fontWeight: 700, color: "#c0c0c0" }}>SOL</Typography>
                    </Typography>
                  </Box>

                  {recentUpdates[secondPlace.wallet_address] && (
                    <Chip
                      size="small"
                      icon={<ElectricBoltIcon />}
                      label={`+${formatSol(recentUpdates[secondPlace.wallet_address].amount)} SOL`}
                      color="success"
                      sx={{ position: "absolute", top: 12, right: 12, fontWeight: 800, animation: "bounce 1s infinite" }}
                    />
                  )}

                  <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                    <Button component={RouterLink} to={`/profile/${secondPlace.wallet_address}`} variant="contained" color="secondary" size="small" sx={{ borderRadius: "8px", py: 0.5, px: 2 }}>
                      Support <LaunchIcon sx={{ fontSize: 12, ml: 0.5 }} />
                    </Button>
                  </Box>
                </Card>
              </Grow>
            </Grid>
          )}

          {/* 1ST PLACE (GOLD) */}
          {firstPlace && (
            <Grid size={{ xs: 12, md: 4.4 }}>
              <Grow in={true} timeout={300}>
                <Card
                  onClick={() => navigate(`/profile/${firstPlace.wallet_address}`)}
                  className={recentUpdates[firstPlace.wallet_address] ? "pulse-new-tip" : ""}
                  sx={{
                    position: "relative",
                    borderRadius: "28px",
                    border: "2px solid #ffd700",
                    boxShadow: "0 15px 45px rgba(255, 215, 0, 0.15)",
                    textAlign: "center",
                    p: 4.5,
                    cursor: "pointer",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: "0 25px 60px rgba(255, 215, 0, 0.25)",
                    }
                  }}
                >
                  <Box className="gold-shine" sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }} />
                  <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: 6, bgcolor: "#ffd700" }} />
                  
                  <Typography variant="h3" sx={{ fontWeight: 900, color: "#ffd700", mb: 1, textShadow: "0 0 10px rgba(255,215,0,0.5)" }}>👑 1st</Typography>
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <Box sx={{ p: 0.5, border: "3px solid #ffd700", borderRadius: "50%", boxShadow: "0 0 20px rgba(255,215,0,0.3)" }}>
                      <BoringAvatar size={90} name={firstPlace.name || firstPlace.wallet_address} variant="beam" colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]} />
                    </Box>
                  </Box>
                  <Typography variant="h5" noWrap sx={{ fontWeight: 900, color: "#ffd700" }}>{firstPlace.name || shorten(firstPlace.wallet_address)}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace", display: "block", mb: 2 }}>{shorten(firstPlace.wallet_address)}</Typography>
                  
                  <Box sx={{ bgcolor: "rgba(255, 215, 0, 0.15)", py: 1, px: 2.5, borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: 0.5, mb: 2, border: "1px solid rgba(255,215,0,0.3)" }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "#ffd700", display: "flex", alignItems: "baseline" }}>
                      {formatSol(firstPlace.total_received)}
                      <Typography component="span" variant="caption" sx={{ ml: 0.5, fontWeight: 700, color: "#ffd700" }}>SOL</Typography>
                    </Typography>
                  </Box>

                  {recentUpdates[firstPlace.wallet_address] && (
                    <Chip
                      size="small"
                      icon={<ElectricBoltIcon style={{ color: "#ffd700" }} />}
                      label={`+${formatSol(recentUpdates[firstPlace.wallet_address].amount)} SOL`}
                      color="success"
                      sx={{ position: "absolute", top: 12, right: 12, fontWeight: 800 }}
                    />
                  )}

                  <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                    <Button component={RouterLink} to={`/profile/${firstPlace.wallet_address}`} variant="contained" size="small" sx={{ borderRadius: "8px", py: 0.5, px: 2, background: "linear-gradient(135deg, #ffd700, #ffa500)", color: "#000", "&:hover": { background: "linear-gradient(135deg, #ffe066, #ffb31a)" } }}>
                      Support <LaunchIcon sx={{ fontSize: 12, ml: 0.5 }} />
                    </Button>
                  </Box>
                </Card>
              </Grow>
            </Grid>
          )}

          {/* 3RD PLACE (BRONZE) */}
          {thirdPlace && (
            <Grid size={{ xs: 12, md: 3.8 }}>
              <Grow in={true} timeout={900}>
                <Card
                  onClick={() => navigate(`/profile/${thirdPlace.wallet_address}`)}
                  className={recentUpdates[thirdPlace.wallet_address] ? "pulse-new-tip" : ""}
                  sx={{
                    position: "relative",
                    borderRadius: "24px",
                    border: "1px solid rgba(205, 127, 50, 0.3)",
                    boxShadow: "0 10px 30px rgba(205, 127, 50, 0.05)",
                    textAlign: "center",
                    p: 3,
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      borderColor: "rgba(205, 127, 50, 0.8)",
                      boxShadow: "0 20px 40px rgba(205, 127, 50, 0.15)",
                    }
                  }}
                >
                  <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: 5, bgcolor: "#cd7f32" }} />
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "#cd7f32", opacity: 0.8, mb: 1 }}>🥉 3rd</Typography>
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <Box sx={{ p: 0.5, border: "2px solid #cd7f32", borderRadius: "50%" }}>
                      <BoringAvatar size={70} name={thirdPlace.name || thirdPlace.wallet_address} variant="beam" colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]} />
                    </Box>
                  </Box>
                  <Typography variant="h6" noWrap sx={{ fontWeight: 800 }}>{thirdPlace.name || shorten(thirdPlace.wallet_address)}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace", display: "block", mb: 2 }}>{shorten(thirdPlace.wallet_address)}</Typography>
                  
                  <Box sx={{ bgcolor: "rgba(205, 127, 50, 0.1)", py: 1, px: 2, borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: 0.5, mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#fff", display: "flex", alignItems: "baseline" }}>
                      {formatSol(thirdPlace.total_received)}
                      <Typography component="span" variant="caption" sx={{ ml: 0.5, fontWeight: 700, color: "#cd7f32" }}>SOL</Typography>
                    </Typography>
                  </Box>

                  {recentUpdates[thirdPlace.wallet_address] && (
                    <Chip
                      size="small"
                      icon={<ElectricBoltIcon />}
                      label={`+${formatSol(recentUpdates[thirdPlace.wallet_address].amount)} SOL`}
                      color="success"
                      sx={{ position: "absolute", top: 12, right: 12, fontWeight: 800 }}
                    />
                  )}

                  <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                    <Button component={RouterLink} to={`/profile/${thirdPlace.wallet_address}`} variant="contained" color="secondary" size="small" sx={{ borderRadius: "8px", py: 0.5, px: 2 }}>
                      Support <LaunchIcon sx={{ fontSize: 12, ml: 0.5 }} />
                    </Button>
                  </Box>
                </Card>
              </Grow>
            </Grid>
          )}
        </Grid>
      )}

      {/* Main Leaderboard List */}
      {!loading && remainingCreators.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {showPodium && (
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, letterSpacing: "-0.01em" }}>
              Legend Rankings
            </Typography>
          )}

          <List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {paginatedCreators.map((creator) => {
              // Rank index relative to the main collection (actual leaderboard position)
              const globalIndex = creators.findIndex((c) => c.wallet_address === creator.wallet_address);
              const isTop3 = globalIndex < 3;
              const isCurrentUser = user && user.wallet_address === creator.wallet_address;
              const isUpdating = !!recentUpdates[creator.wallet_address];

              // Colors based on ranking
              const rankColors = ["#ffd700", "#c0c0c0", "#cd7f32"];
              const borderStyle = isCurrentUser
                ? "2px solid #38BDF8"
                : creator.is_premium
                  ? "1px solid rgba(255, 215, 0, 0.4)"
                  : isTop3
                    ? `1px solid ${rankColors[globalIndex]}66`
                    : "1px solid rgba(255,255,255,0.06)";

              const backgroundStyle = isCurrentUser
                ? "rgba(56, 189, 248, 0.08)"
                : creator.is_premium
                  ? "linear-gradient(135deg, rgba(255, 215, 0, 0.07) 0%, rgba(255, 215, 0, 0.02) 100%)"
                  : isTop3
                    ? `linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)`
                    : "rgba(255,255,255,0.02)";

              const glowBoxShadow = isCurrentUser
                ? "0 0 25px rgba(56, 189, 248, 0.15)"
                : creator.is_premium
                  ? "0 0 25px rgba(255, 215, 0, 0.08)"
                  : isTop3
                    ? `0 0 25px ${rankColors[globalIndex]}1a`
                    : "0 4px 15px rgba(0,0,0,0.15)";

              return (
                <Card
                  key={creator.wallet_address}
                  id={`creator-card-${creator.wallet_address}`}
                  onClick={() => navigate(`/profile/${creator.wallet_address}`)}
                  className={`fade-in-up ${isUpdating ? "pulse-new-tip" : ""}`}
                  sx={{
                    display: "block",
                    p: 0,
                    textDecoration: "none",
                    color: "inherit",
                    background: backgroundStyle,
                    border: borderStyle,
                    boxShadow: glowBoxShadow,
                    borderRadius: "20px",
                    cursor: "pointer",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: isCurrentUser ? "#38BDF8" : creator.is_premium ? "#FFD700" : "rgba(255,255,255,0.25)",
                      boxShadow: isCurrentUser
                        ? "0 10px 30px rgba(56, 189, 248, 0.25)"
                        : creator.is_premium
                          ? "0 10px 30px rgba(255, 215, 0, 0.18)"
                          : "0 10px 30px rgba(255,255,255,0.05)"
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: { xs: 2, sm: 3.5 },
                      position: "relative"
                    }}
                  >
                    {/* Visual Indicator Lines */}
                    {(isTop3 || creator.is_premium || isCurrentUser) && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: 5,
                          height: "100%",
                          bgcolor: isCurrentUser ? "#38BDF8" : creator.is_premium ? "#FFD700" : rankColors[globalIndex],
                          boxShadow: `0 0 10px ${isCurrentUser ? "#38BDF8" : creator.is_premium ? "#FFD700" : rankColors[globalIndex]}`
                        }}
                      />
                    )}

                    {/* Rank Badge */}
                    <Box
                      sx={{
                        width: { xs: 40, sm: 50 },
                        height: { xs: 40, sm: 50 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        bgcolor: isCurrentUser
                          ? "rgba(56, 189, 248, 0.1)"
                          : creator.is_premium
                            ? "rgba(255, 215, 0, 0.08)"
                            : isTop3
                              ? `${rankColors[globalIndex]}12`
                              : "rgba(255,255,255,0.03)",
                        border: `1.5px solid ${isCurrentUser ? "#38BDF8" : creator.is_premium ? "#FFD700" : isTop3 ? rankColors[globalIndex] + "66" : "rgba(255,255,255,0.08)"}`,
                        color: isCurrentUser
                          ? "#38BDF8"
                          : creator.is_premium
                            ? "#FFD700"
                            : isTop3
                              ? rankColors[globalIndex]
                              : "text.secondary",
                        fontSize: isTop3 ? { xs: "1rem", sm: "1.25rem" } : "0.95rem",
                        fontWeight: 900,
                        mr: { xs: 1.5, sm: 3 },
                        flexShrink: 0
                      }}
                    >
                      {globalIndex === 0 ? "👑" : globalIndex + 1}
                    </Box>

                    {/* Avatar */}
                    <Box
                      sx={{
                        width: { xs: 44, sm: 52 },
                        height: { xs: 44, sm: 52 },
                        mr: { xs: 1.5, sm: 3 },
                        p: 0.3,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: isCurrentUser
                          ? "rgba(56, 189, 248, 0.2)"
                          : creator.is_premium
                            ? "rgba(255, 215, 0, 0.15)"
                            : isTop3
                              ? `${rankColors[globalIndex]}22`
                              : "rgba(255,255,255,0.08)",
                        border: isCurrentUser
                          ? "1px solid #38BDF8"
                          : creator.is_premium
                            ? "1px solid #FFD700"
                            : isTop3
                              ? `1px solid ${rankColors[globalIndex]}66`
                              : "1px solid rgba(255,255,255,0.08)",
                        flexShrink: 0
                      }}
                    >
                      <BoringAvatar
                        name={creator.name || creator.wallet_address}
                        variant="beam"
                        size="100%"
                        colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]}
                      />
                    </Box>

                    {/* Info */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 0.5 }}>
                        <Typography variant="h6" noWrap sx={{ fontWeight: 800, fontSize: { xs: "0.95rem", sm: "1.15rem" }, color: creator.is_premium ? "#FFD700" : isCurrentUser ? "#38BDF8" : "inherit" }}>
                          {creator.name || shorten(creator.wallet_address)}
                        </Typography>

                        {isCurrentUser && (
                          <Chip
                            label="YOU"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.6rem",
                              fontWeight: 900,
                              bgcolor: "primary.main",
                              color: "#000",
                              px: 0.5
                            }}
                          />
                        )}

                        {creator.is_premium && (
                          <Chip
                            label="PREMIUM"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.6rem",
                              fontWeight: 900,
                              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                              color: "#000",
                              border: "none",
                              px: 0.5
                            }}
                          />
                        )}

                        {isTop3 && !creator.is_premium && (
                          <Chip
                            label={["Champion", "Runner-up", "Bronze"][globalIndex]}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.6rem",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              bgcolor: `${rankColors[globalIndex]}18`,
                              color: rankColors[globalIndex],
                              border: `1px solid ${rankColors[globalIndex]}33`,
                              display: { xs: "none", sm: "inline-flex" }
                            }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", opacity: 0.65, fontSize: { xs: "0.7rem", sm: "0.8rem" } }}>
                        {shorten(creator.wallet_address)}
                      </Typography>
                    </Box>

                    {/* Amount */}
                    <Box sx={{ textAlign: "right", pl: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 900,
                            fontSize: { xs: "1.1rem", sm: "1.5rem" },
                            color: isCurrentUser ? "primary.main" : isTop3 ? rankColors[globalIndex] : "text.primary",
                            textShadow: isCurrentUser
                              ? "0 0 15px rgba(56, 189, 248, 0.2)"
                              : isTop3
                                ? `0 0 15px ${rankColors[globalIndex]}44`
                                : "none",
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "flex-end"
                          }}
                        >
                          {formatSol(creator.total_received)}
                          <Box component="span" sx={{ fontSize: { xs: "0.65rem", sm: "0.8rem" }, ml: 0.5, opacity: 0.8, fontWeight: 700 }}>SOL</Box>
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: { xs: "none", sm: "block" } }}>
                          Total Tipped
                        </Typography>
                      </Box>

                      {/* View Profile icon */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <LaunchIcon sx={{ fontSize: 18, color: "text.secondary", opacity: 0.6 }} />
                      </Box>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </List>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Box sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "rgba(255,255,255,0.6)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    bgcolor: "rgba(255,255,255,0.02)",
                    borderRadius: "8px",
                    fontWeight: 700,
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.08)",
                    },
                    "&.Mui-selected": {
                      boxShadow: "0 0 10px rgba(56, 189, 248, 0.25)",
                      fontWeight: 900
                    }
                  }
                }}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Sticky Bottom Rank Bar for the Logged-In User */}
      {user && loggedInUserRank && (
        <Fade in={true}>
          <Paper
            elevation={8}
            sx={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              width: "92%",
              maxWidth: 680,
              background: "linear-gradient(135deg, rgba(21, 29, 43, 0.9) 0%, rgba(11, 15, 23, 0.95) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              borderRadius: "20px",
              boxShadow: "0 20px 45px rgba(0,0,0,0.6), 0 0 25px rgba(56, 189, 248, 0.15)",
              p: { xs: 1.5, sm: 2 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 1000,
              transition: "all 0.3s ease"
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2 } }}>
              <Box
                sx={{
                  bgcolor: "primary.main",
                  color: "#000",
                  fontWeight: 900,
                  fontSize: { xs: "0.95rem", sm: "1.2rem" },
                  width: { xs: 36, sm: 44 },
                  height: { xs: 36, sm: 44 },
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(56,189,248,0.3)"
                }}
              >
                #{loggedInUserRank}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.main", display: "flex", alignItems: "center", gap: 0.5 }}>
                  <StarIcon sx={{ fontSize: 16 }} /> Your Ranking
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                  Support creators to rank higher!
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 3 } }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.1rem", sm: "1.4rem" },
                  color: "#fff",
                  display: "flex",
                  alignItems: "baseline"
                }}
              >
                {formatSol(creators[loggedInUserRank - 1]?.total_received || 0)}
                <Typography component="span" variant="caption" sx={{ ml: 0.5, fontWeight: 700, opacity: 0.8 }}>SOL</Typography>
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  const targetCard = document.getElementById(`creator-card-${user.wallet_address}`);
                  if (targetCard) {
                    targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
                sx={{
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  py: 1,
                  px: 2
                }}
              >
                Locate Me
              </Button>
            </Box>
          </Paper>
        </Fade>
      )}
    </Box>
  );
}


