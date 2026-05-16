import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { API_BASE } from "../shared/constants";
import { useRealtimeTips } from "../hooks/useRealtimeTips";
import { Box, Typography, Card, CardContent, CircularProgress, List, Avatar, Chip } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PersonIcon from "@mui/icons-material/Person";

interface Creator {
  wallet_address: string;
  name: string;
  total_received: number;
}

export default function CreatorLeaderboard() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const { newTip } = useRealtimeTips();

  useEffect(() => {
    if (newTip && newTip.creator_wallet && newTip.amount) {
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
            name: "",
            total_received: newTip.amount,
          });
        }

        updatedList.sort((a, b) => b.total_received - a.total_received);
        return updatedList.slice(0, 50);
      });
    }
  }, [newTip]);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/stats/leaderboard`
        );
        if (res.ok) {
          const data = await res.json();
          setCreators(data.creators || []);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  function shorten(addr: string): string {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function formatSol(lamports: number): string {
    return (lamports / LAMPORTS_PER_SOL).toFixed(4);
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", py: { xs: 4, md: 8 }, px: 2, position: "relative" }}>
      {/* Decorative Blur Backgrounds */}
      <Box
        sx={{
          position: "absolute", top: "10%", left: "-10%", width: "40%", height: "40%",
          background: "radial-gradient(circle, rgba(20, 241, 149, 0.15) 0%, transparent 70%)",
          zIndex: -1, filter: "blur(80px)"
        }}
      />
      <Box
        sx={{
          position: "absolute", bottom: "10%", right: "-10%", width: "40%", height: "40%",
          background: "radial-gradient(circle, rgba(153, 69, 255, 0.15) 0%, transparent 70%)",
          zIndex: -1, filter: "blur(80px)"
        }}
      />

      <Box sx={{ textAlign: "center", mb: 8 }} className="fade-in-up">
        <Typography
          variant="h2"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 800,
            background: "linear-gradient(135deg, #14F195 0%, #9945FF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2
          }}
        >
          Ecosystem Leaders
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 600, mx: "auto" }}>
          The absolute legends driving the Solana superchat economy. 
          Support your favorites to push them up the ranks!
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", py: 12 }}>
          <CircularProgress size={48} thickness={4} sx={{ mb: 3, color: "primary.main" }} />
          <Typography color="text.secondary" sx={{ letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.8rem", fontWeight: 700 }}>
            Fetching Legends...
          </Typography>
        </Box>
      )}

      {!loading && creators.length === 0 && (
        <Card sx={{ textAlign: "center", py: 10, bgcolor: "rgba(255,255,255,0.02)", backdropFilter: "blur(10px)" }}>
          <CardContent>
            <EmojiEventsIcon sx={{ fontSize: 80, color: "rgba(255,255,255,0.1)", mb: 3 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              No legends yet.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Be the first to send a tip and start the journey!
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && creators.length > 0 && (
        <List sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {creators.map((creator, index) => {
            const isTop3 = index < 3;
            const rankColors = ["#ffd700", "#c0c0c0", "#cd7f32"];
            const rankGlows = [
              "0 0 30px rgba(255, 215, 0, 0.25)",
              "0 0 30px rgba(192, 192, 192, 0.2)",
              "0 0 30px rgba(205, 127, 50, 0.15)"
            ];

            return (
              <Card
                key={creator.wallet_address}
                className="fade-in-up"
                component={RouterLink}
                to={`/profile/${creator.wallet_address}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: { xs: 2.5, sm: 3.5 },
                  position: "relative",
                  overflow: "hidden",
                  textDecoration: "none",
                  color: "inherit",
                  background: isTop3
                    ? `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`
                    : "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(16px)",
                  border: isTop3 ? `1px solid ${rankColors[index]}66` : "1px solid rgba(255,255,255,0.05)",
                  boxShadow: isTop3 ? rankGlows[index] : "0 4px 20px rgba(0,0,0,0.2)",
                  borderRadius: "20px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-6px) scale(1.01)",
                    background: isTop3
                      ? `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)`
                      : "rgba(255,255,255,0.06)",
                    boxShadow: isTop3 ? `0 15px 40px rgba(0,0,0,0.4), ${rankGlows[index]}` : "0 15px 30px rgba(0,0,0,0.3)"
                  },
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                {/* Accent Line for Top 3 */}
                {isTop3 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: 6,
                      height: "100%",
                      bgcolor: rankColors[index],
                      boxShadow: `0 0 10px ${rankColors[index]}`
                    }}
                  />
                )}

                {/* Rank Badge */}
                <Box
                  sx={{
                    width: { xs: 45, sm: 60 },
                    height: { xs: 45, sm: 60 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    bgcolor: isTop3 ? `${rankColors[index]}15` : "rgba(255,255,255,0.04)",
                    border: `2px solid ${isTop3 ? rankColors[index] + "66" : "rgba(255,255,255,0.1)"}`,
                    color: isTop3 ? rankColors[index] : "text.secondary",
                    fontSize: isTop3 ? { xs: "1.2rem", sm: "1.5rem" } : "1.1rem",
                    fontWeight: 900,
                    mr: { xs: 2, sm: 3 },
                    flexShrink: 0
                  }}
                >
                  {index === 0 ? "👑" : index + 1}
                </Box>

                {/* Avatar */}
                <Avatar
                  sx={{
                    width: { xs: 45, sm: 55 },
                    height: { xs: 45, sm: 55 },
                    mr: { xs: 2, sm: 3 },
                    bgcolor: isTop3 ? `${rankColors[index]}33` : 'rgba(255,255,255,0.1)',
                    color: isTop3 ? rankColors[index] : '#fff',
                    border: isTop3 ? `1px solid ${rankColors[index]}88` : '1px solid rgba(255,255,255,0.1)',
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    flexShrink: 0
                  }}
                >
                  {creator.name ? creator.name.charAt(0).toUpperCase() : <PersonIcon />}
                </Avatar>

                {/* Info */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Typography variant="h6" noWrap sx={{ fontWeight: 800, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                      {creator.name || "Anonymous Creator"}
                    </Typography>
                    {isTop3 && (
                      <Chip
                        label={["Champion", "Runner-up", "Bronze"][index]}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          bgcolor: `${rankColors[index]}22`,
                          color: rankColors[index],
                          border: `1px solid ${rankColors[index]}44`,
                          display: { xs: "none", sm: "flex" }
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", opacity: 0.7, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                    {shorten(creator.wallet_address)}
                  </Typography>
                </Box>

                {/* Amount */}
                <Box sx={{ textAlign: "right", pl: 2 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: "1.2rem", sm: "1.7rem" },
                      color: isTop3 ? rankColors[index] : "primary.main",
                      textShadow: isTop3 ? `0 0 20px ${rankColors[index]}66` : "0 0 10px rgba(20, 241, 149, 0.4)",
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "flex-end"
                    }}
                  >
                    {formatSol(creator.total_received)}
                    <Box component="span" sx={{ fontSize: { xs: "0.7rem", sm: "0.9rem" }, ml: 0.5, opacity: 0.8, fontWeight: 700 }}>SOL</Box>
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: { xs: "none", sm: "block" } }}>
                    Total Tipped
                  </Typography>
                </Box>
              </Card>
            );
          })}
        </List>
      )}
    </Box>
  );
}
