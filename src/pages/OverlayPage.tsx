import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Paper, keyframes } from "@mui/material";
import { useSocket } from "../context/SocketContext";
import BoltIcon from "@mui/icons-material/Bolt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// Animation for the alert entry
const slideIn = keyframes`
  0% { transform: translateX(100%); opacity: 0; }
  10% { transform: translateX(0); opacity: 1; }
  90% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

interface Alert {
  id: string;
  sender: string;
  amount: number;
  message: string;
}

const OverlayPage: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const { socket } = useSocket();
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [stream, setStream] = useState<any>(null);
  const [recentDonors, setRecentDonors] = useState<any[]>([]);
  const [topDonors, setTopDonors] = useState<any[]>([]);
  const queue = useRef<Alert[]>([]);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (!socket || !streamId) return;

    // Fetch initial stream data for goals
    const fetchStream = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/streams/${streamId}`);
        const data = await res.json();
        setStream(data);
      } catch (err) {}
    };
    fetchStream();

    socket.emit("join_room", streamId);

    const handleSuperChat = (data: any) => {
      // Update local stream state for goal
      setStream((prev: any) => ({
        ...prev,
        donation_current: (prev?.donation_current || 0) + data.amount
      }));

      // Add to recent donors
      const donorInfo = {
        name: data.name || (data.wallet.slice(0, 4) + "..." + data.wallet.slice(-4)),
        amount: data.amount / 1000000000,
        timestamp: new Date().toISOString()
      };
      setRecentDonors(prev => [donorInfo, ...prev].slice(0, 5));

      // Update top donors (aggregate by wallet)
      setTopDonors(prev => {
        const existing = prev.find(d => d.wallet === data.wallet);
        let newTop;
        if (existing) {
          newTop = prev.map(d => d.wallet === data.wallet ? { ...d, amount: d.amount + (data.amount / 1000000000) } : d);
        } else {
          newTop = [...prev, { wallet: data.wallet, name: data.name || (data.wallet.slice(0, 4) + "..." + data.wallet.slice(-4)), amount: data.amount / 1000000000 }];
        }
        return newTop.sort((a, b) => b.amount - a.amount).slice(0, 3);
      });

      const newAlert: Alert = {
        id: data._id || Math.random().toString(),
        sender: data.wallet.slice(0, 4) + "..." + data.wallet.slice(-4),
        amount: data.amount / 1000000000,
        message: data.message,
      };
      queue.current.push(newAlert);
      processQueue();
    };

    socket.on("new_superchat", handleSuperChat);

    return () => {
      socket.off("new_superchat", handleSuperChat);
    };
  }, [socket, streamId]);

  const processQueue = () => {
    if (isProcessing.current || queue.current.length === 0) return;

    isProcessing.current = true;
    const alert = queue.current.shift()!;
    setCurrentAlert(alert);

    // Play sound (optional, creators can add their own)
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2436/2436-preview.mp3");
    audio.play().catch(() => {});

    // Duration of the alert (7 seconds)
    setTimeout(() => {
      setCurrentAlert(null);
      isProcessing.current = false;
      setTimeout(processQueue, 500); // Small gap between alerts
    }, 7000);
  };

  if (!streamId) return null;

  return (
    <Box 
      sx={{ 
        width: "100vw", 
        height: "100vh", 
        bgcolor: "transparent", 
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 6
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Recent Donors Feed (Left) */}
        <Box sx={{ width: 250 }}>
          {recentDonors.length > 0 && (
            <Paper 
              sx={{ 
                p: 2, 
                bgcolor: "rgba(0,0,0,0.6)", 
                borderRadius: "12px", 
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)"
              }}
            >
              <Typography variant="caption" sx={{ color: "#00f2ff", fontWeight: 900, mb: 1, display: "block" }}>
                RECENT SUPPORTERS
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {recentDonors.map((donor, i) => (
                  <Box 
                    key={i} 
                    sx={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      animation: "fadeIn 0.5s ease-out"
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "white", fontWeight: 600, maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {donor.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#7000ff", fontWeight: 900 }}>
                      {donor.amount}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          {/* Top Donors Leaderboard (Below Recent) */}
          {topDonors.length > 0 && (
            <Paper 
              sx={{ 
                p: 2, 
                mt: 2,
                bgcolor: "rgba(112, 0, 255, 0.4)", 
                borderRadius: "12px", 
                border: "1px solid rgba(0, 242, 255, 0.3)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 0 20px rgba(112, 0, 255, 0.3)"
              }}
            >
              <Typography variant="caption" sx={{ color: "#fff", fontWeight: 900, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 14 }} /> TOP SUPPORTERS
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {topDonors.map((donor, i) => (
                  <Box 
                    key={i} 
                    sx={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center"
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "white", fontWeight: 700 }}>
                      #{i+1} {donor.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#00f2ff", fontWeight: 900 }}>
                      {donor.amount.toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>

        {/* Super Chat Alert Area (Right) */}
        <Box>
          {currentAlert && (
            <Paper
              elevation={24}
              sx={{
                width: 400,
                p: 3,
                borderRadius: "16px",
                background: "linear-gradient(135deg, #7000ff 0%, #00f2ff 100%)",
                color: "white",
                animation: `${slideIn} 7s ease-in-out forwards`,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                boxShadow: "0 0 40px rgba(112, 0, 255, 0.4)",
                border: "2px solid rgba(255,255,255,0.2)"
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BoltIcon sx={{ fontSize: 32 }} />
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>SUPER CHAT!</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>{currentAlert.amount} SOL</Typography>
              </Box>
              
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
                {currentAlert.sender}
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mt: 1, 
                  p: 2, 
                  bgcolor: "rgba(0,0,0,0.2)", 
                  borderRadius: "8px", 
                  fontStyle: "italic",
                  fontSize: "1.1rem"
                }}
              >
                "{currentAlert.message}"
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Donation Goal Area (Bottom) */}
      {stream && stream.donation_goal > 0 && (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Box sx={{ width: "80%", maxWidth: 800 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
              <Typography sx={{ fontWeight: 900, fontSize: "1.2rem" }}>DONATION GOAL</Typography>
              <Typography sx={{ fontWeight: 900, fontSize: "1.2rem" }}>
                {stream.donation_current / 1000000000} / {stream.donation_goal / 1000000000} SOL
              </Typography>
            </Box>
            <Box 
              sx={{ 
                height: 30, 
                width: "100%", 
                bgcolor: "rgba(0,0,0,0.5)", 
                borderRadius: "15px", 
                overflow: "hidden",
                border: "2px solid rgba(255,255,255,0.2)",
                boxShadow: "0 0 20px rgba(0,0,0,0.3)"
              }}
            >
              <Box 
                sx={{ 
                  height: "100%", 
                  width: `${Math.min(100, (stream.donation_current / stream.donation_goal) * 100)}%`,
                  background: "linear-gradient(90deg, #7000ff, #00f2ff)",
                  transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 0 20px #00f2ff",
                }} 
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default OverlayPage;
