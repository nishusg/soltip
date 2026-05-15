import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Box, Typography, Paper, keyframes } from "@mui/material";
import { useSocket } from "../context/SocketContext";
import { API_BASE } from "../shared/constants";
import BoltIcon from "@mui/icons-material/Bolt";
import LockIcon from "@mui/icons-material/Lock";

// Animation for new tip entry
const slideInLeft = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

interface TipEntry {
  id: string;
  sender: string;
  amount: number;
  message: string;
  timestamp: string;
}

// Color tiers based on amount
function getTierColor(amount: number): string {
  if (amount >= 5) return "#ff2d55";     // 5+ SOL — red/pink (legendary)
  if (amount >= 1) return "#ff9500";     // 1-5 SOL — orange (epic)
  if (amount >= 0.5) return "#ffcc00";   // 0.5-1 SOL — gold
  if (amount >= 0.1) return "#00f2ff";   // 0.1-0.5 SOL — cyan
  return "#8e8e93";                       // < 0.1 SOL — grey
}

function getTierGlow(amount: number): string {
  if (amount >= 5) return "0 0 20px rgba(255, 45, 85, 0.5)";
  if (amount >= 1) return "0 0 15px rgba(255, 149, 0, 0.4)";
  if (amount >= 0.5) return "0 0 12px rgba(255, 204, 0, 0.3)";
  return "none";
}

const OverlayPage: React.FC = () => {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const [searchParams] = useSearchParams();
  const overlayKey = searchParams.get("key");
  const { socket } = useSocket();
  const [tips, setTips] = useState<TipEntry[]>([]);
  const [authStatus, setAuthStatus] = useState<"loading" | "ok" | "denied">("loading");
  const feedRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload audio
  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2436/2436-preview.mp3");
  }, []);

  // Step 1: Verify the overlay key
  useEffect(() => {
    if (!walletAddress || !overlayKey) {
      setAuthStatus("denied");
      return;
    }

    fetch(`${API_BASE}/creators/overlay-verify?wallet=${walletAddress}&key=${overlayKey}`)
      .then(res => {
        if (res.ok) setAuthStatus("ok");
        else setAuthStatus("denied");
      })
      .catch(() => setAuthStatus("denied"));
  }, [walletAddress, overlayKey]);

  // Step 2: Load existing tips on mount
  useEffect(() => {
    if (authStatus !== "ok" || !walletAddress) return;

    fetch(`${API_BASE}/stats/user/${walletAddress}`)
      .then(res => res.json())
      .then(data => {
        if (data.recent_tips && data.recent_tips.length > 0) {
          const received = data.recent_tips
            .filter((t: any) => t.creator_wallet === walletAddress)
            .slice(0, 20)
            .reverse() // oldest first so newest is at bottom
            .map((t: any) => ({
              id: t._id || t.tx_hash,
              sender: t.sender_wallet.slice(0, 4) + "..." + t.sender_wallet.slice(-4),
              amount: t.amount / 1e9,
              message: t.message || "",
              timestamp: t.timestamp
            }));
          setTips(received);
        }
      })
      .catch(() => {});
  }, [authStatus, walletAddress]);

  // Step 3: Subscribe to real-time tips
  useEffect(() => {
    if (authStatus !== "ok" || !socket || !walletAddress || !overlayKey) return;

    socket.emit("subscribe_overlay", { walletAddress, key: overlayKey });

    const handleSuperChat = (data: any) => {
      const newTip: TipEntry = {
        id: data._id || data.tx_hash || Math.random().toString(),
        sender: data.name || (data.wallet.slice(0, 4) + "..." + data.wallet.slice(-4)),
        amount: data.amount / 1e9,
        message: data.message || "",
        timestamp: new Date().toISOString()
      };

      setTips(prev => [...prev, newTip].slice(-50)); // Keep last 50

      // Play sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    };

    socket.on("new_superchat", handleSuperChat);

    return () => {
      socket.off("new_superchat", handleSuperChat);
      socket.emit("unsubscribe_overlay", walletAddress);
    };
  }, [authStatus, socket, walletAddress, overlayKey]);

  // Auto-scroll to bottom when new tips arrive
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [tips]);

  if (!walletAddress) return null;

  if (authStatus === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "transparent" }}>
        <Typography sx={{ color: "rgba(255,255,255,0.5)" }}>Verifying overlay access...</Typography>
      </Box>
    );
  }

  if (authStatus === "denied") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", gap: 2 }}>
        <LockIcon sx={{ fontSize: 48, color: "rgba(255,75,75,0.7)" }} />
        <Typography variant="h6" sx={{ color: "rgba(255,75,75,0.9)", fontWeight: 800 }}>
          Invalid Overlay Key
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.5)", textAlign: "center", maxWidth: 400 }}>
          This overlay URL requires a valid key. Generate one from your Creator Dashboard.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        bgcolor: "transparent",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        p: 2
      }}
    >
      {/* Tip Feed — scrolls from bottom, newest at the end */}
      <Box
        ref={feedRef}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          overflowY: "auto",
          maxHeight: "100%",
          // Hide scrollbar for OBS
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        {tips.map((tip, i) => {
          const tierColor = getTierColor(tip.amount);
          const isNew = i >= tips.length - 1; // Animate only the latest one

          return (
            <Box
              key={tip.id}
              sx={{
                animation: isNew ? `${slideInLeft} 0.4s ease-out` : undefined,
                display: "flex",
                flexDirection: "column",
                maxWidth: 420,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: "10px",
                  bgcolor: "rgba(0, 0, 0, 0.7)",
                  backdropFilter: "blur(10px)",
                  borderLeft: `3px solid ${tierColor}`,
                  boxShadow: getTierGlow(tip.amount),
                  transition: "all 0.3s ease",
                }}
              >
                {/* Header: Sender + Amount */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: tip.message ? 0.5 : 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <BoltIcon sx={{ fontSize: 14, color: tierColor }} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        color: tierColor,
                        fontSize: "0.85rem"
                      }}
                    >
                      {tip.sender}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 900,
                      color: tierColor,
                      fontSize: "0.9rem"
                    }}
                  >
                    {tip.amount.toFixed(tip.amount >= 1 ? 2 : 4)} SOL
                  </Typography>
                </Box>

                {/* Message */}
                {tip.message && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "0.85rem",
                      lineHeight: 1.4,
                      pl: 2.5,
                    }}
                  >
                    {tip.message}
                  </Typography>
                )}
              </Paper>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default OverlayPage;
