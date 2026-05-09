import { useState, useEffect } from "react";
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
    <Box sx={{ maxWidth: 800, mx: "auto", py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
          <Box
            component="span"
            sx={{
              background: "linear-gradient(90deg, #00e5ff 0%, #b400ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Top Creators
          </Box>
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Ranked by total tips received
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress size={32} sx={{ mr: 2 }} />
          <Typography color="text.secondary">Loading leaderboard...</Typography>
        </Box>
      )}

      {!loading && creators.length === 0 && (
        <Card sx={{ textAlign: "center", py: 8 }}>
          <CardContent>
            <EmojiEventsIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No creators on the leaderboard yet.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to send a tip!
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && creators.length > 0 && (
        <List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {creators.map((creator, index) => {
            const isTop3 = index < 3;
            return (
              <Card 
                key={creator.wallet_address} 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  p: 2,
                  ...(isTop3 && {
                    background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)",
                    border: "1px solid rgba(0, 229, 255, 0.3)",
                    boxShadow: "0 0 20px rgba(0, 229, 255, 0.1)",
                  })
                }}
              >
                <Box sx={{ width: 48, textAlign: "center", fontSize: "1.5rem" }}>
                  {getRankDisplay(index)}
                </Box>
                
                <Box sx={{ flexGrow: 1, ml: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {creator.name || shorten(creator.wallet_address)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {shorten(creator.wallet_address)}
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: "right", color: isTop3 ? "primary.main" : "text.primary" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatSol(creator.total_received)} SOL
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
