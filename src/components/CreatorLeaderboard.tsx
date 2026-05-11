import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useRealtimeTips } from "../hooks/useRealtimeTips";
import { Box, Typography, Card, CardContent, CircularProgress, List, Avatar } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

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
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/stats/leaderboard`
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

  function getRankDisplay(index: number): string {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", py: { xs: 4, md: 8 }, px: 2 }}>
      <Box sx={{ textAlign: "center", mb: 8 }} className="fade-in-up">
        <Typography 
          variant="h2" 
          component="h2" 
          gutterBottom 
          sx={{ 
            fontWeight: 800,
            background: "linear-gradient(135deg, #fff 0%, #a0a0b0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Top Creators
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          The champions of the Solana tipping ecosystem
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
        <Card sx={{ textAlign: "center", py: 10, bgcolor: "rgba(255,255,255,0.02)" }}>
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
              "0 0 20px rgba(255, 215, 0, 0.2)",
              "0 0 20px rgba(192, 192, 192, 0.15)",
              "0 0 20px rgba(205, 127, 50, 0.1)"
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
                  p: { xs: 2, sm: 3 },
                  position: "relative",
                  overflow: "hidden",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    background: "rgba(255,255,255,0.06)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                  },
                  animationDelay: `${index * 0.1}s`,
                  ...(isTop3 && {
                    background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)`,
                    border: `1px solid ${rankColors[index]}44`,
                    boxShadow: rankGlows[index],
                  })
                }}
              >
                {isTop3 && (
                  <Box 
                    sx={{ 
                      position: "absolute", 
                      top: 0, 
                      left: 0, 
                      width: 4, 
                      height: "100%", 
                      bgcolor: rankColors[index] 
                    }} 
                  />
                )}

                <Box 
                  sx={{ 
                    width: 60, 
                    height: 60,
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    borderRadius: "50%",
                    bgcolor: isTop3 ? `${rankColors[index]}11` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isTop3 ? rankColors[index] + "44" : "rgba(255,255,255,0.08)"}`,
                    color: isTop3 ? rankColors[index] : "text.secondary",
                    fontSize: isTop3 ? "1.5rem" : "1.1rem",
                    fontWeight: 800,
                    mr: 3
                  }}
                >
                  {index + 1}
                </Box>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {creator.name || "Anonymous Creator"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", opacity: 0.7 }}>
                    {creator.wallet_address}
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: "right" }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 800,
                      color: isTop3 ? rankColors[index] : "primary.main",
                      textShadow: isTop3 ? `0 0 10px ${rankColors[index]}44` : "none"
                    }}
                  >
                    {formatSol(creator.total_received)}
                    <Box component="span" sx={{ fontSize: "0.9rem", ml: 1, opacity: 0.7 }}>SOL</Box>
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
