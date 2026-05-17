import React, { useEffect, useState } from "react";
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

// Animation for cinematic alert popup
const alertPopIn = keyframes`
  0% { transform: translate(-50%, -40%) scale(0.85); opacity: 0; filter: blur(10px); }
  8% { transform: translate(-50%, -50%) scale(1.03); opacity: 1; filter: blur(0px); }
  12% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  88% { transform: translate(-50%, -50%) scale(1); opacity: 1; filter: blur(0px); }
  100% { transform: translate(-50%, -60%) scale(0.9); opacity: 0; filter: blur(10px); }
`;

interface TipEntry {
  id: string;
  sender: string;
  amount: number;
  message: string;
  timestamp: string;
}

// Sizing and Duration Constants for Stream Overlay Layouts
const ALERT_DISPLAY_DURATION = 6500; // ms
const ACTIVE_ALERT_WIDTH = 580; // px
const TICKER_FEED_WIDTH = 400; // px
const TICKER_MAX_ITEMS = 5;

// Typography Font Constants
const FONT_ACCENT = "Orbitron, sans-serif";
const FONT_PRIMARY = "Space Grotesk, sans-serif";

// Color tiers based on amount
function getTierColor(amount: number): string {
  if (amount >= 5) return "#ff2d55";     // 5+ SOL — red/pink (legendary)
  if (amount >= 1) return "#ff9500";     // 1-5 SOL — orange (epic)
  if (amount >= 0.5) return "#ffcc00";   // 0.5-1 SOL — gold
  if (amount >= 0.1) return "#14F195";   // 0.1-0.5 SOL — cyan
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
  const [activeAlert, setActiveAlert] = useState<TipEntry | null>(null);



  // Force absolute transparent backgrounds on document body and HTML for OBS compatibility
  useEffect(() => {
    // Inject a stylesheet to force transparency on the layout, body, and all global pseudo-elements
    const styleEl = document.createElement("style");
    styleEl.id = "obs-transparency-override";
    styleEl.innerHTML = `
      html, body, #root {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
      }
      body::before, body::after, html::before, html::after {
        display: none !important;
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      const override = document.getElementById("obs-transparency-override");
      if (override) {
        override.remove();
      }
    };
  }, []);

  // Manage active alert display duration (exits when alertPopIn ends)
  useEffect(() => {
    if (!activeAlert) return;
    const timer = setTimeout(() => {
      setActiveAlert(null);
    }, ALERT_DISPLAY_DURATION);
    return () => clearTimeout(timer);
  }, [activeAlert]);



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

  // Step 2: Load existing tips on mount (filtered to today for fresh daily streams)
  useEffect(() => {
    if (authStatus !== "ok" || !walletAddress) return;

    fetch(`${API_BASE}/stats/user/${walletAddress}`)
      .then(res => res.json())
      .then(data => {
        if (data.recent_tips && data.recent_tips.length > 0) {
          const todayStr = new Date().toDateString();
          const received = data.recent_tips
            .filter((t: any) => {
              // Only load tips sent today for a fresh daily ticker experience
              const tipDate = new Date(t.timestamp);
              return t.creator_wallet === walletAddress && tipDate.toDateString() === todayStr;
            })
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
      .catch(() => { });
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

      setTips(prev => [...prev, newTip].slice(-10)); // Keep last 10
      setActiveAlert(newTip); // Trigger premium animated active popup


    };

    socket.on("new_superchat", handleSuperChat);

    return () => {
      socket.off("new_superchat", handleSuperChat);
      socket.emit("unsubscribe_overlay", walletAddress);
    };
  }, [authStatus, socket, walletAddress, overlayKey]);



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
        position: "relative"
      }}
    >


      {/* Cinematic Alert Popup */}
      {activeAlert && (
        <Box
          sx={{
            position: "absolute",
            top: "45%",
            left: "50%",
            zIndex: 999,
            width: ACTIVE_ALERT_WIDTH, // Constant fixed width for consistent professional stream visuals
            animation: `${alertPopIn} ${ALERT_DISPLAY_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
            pointerEvents: "none"
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: "28px",
              bgcolor: "rgba(0, 0, 0, 0.85)",
              border: `2px solid ${getTierColor(activeAlert.amount)}`,
              backdropFilter: "blur(20px)",
              boxShadow: `0 0 50px ${getTierColor(activeAlert.amount)}33, inset 0 0 20px ${getTierColor(activeAlert.amount)}1a`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Glowing top line matching tier */}
            <Box sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, transparent, ${getTierColor(activeAlert.amount)}, transparent)`
            }} />

            {/* Glowing Category Header */}
            <Typography
              variant="caption"
              sx={{
                fontFamily: FONT_ACCENT,
                fontSize: "0.85rem",
                fontWeight: 900,
                letterSpacing: "4px",
                color: getTierColor(activeAlert.amount),
                textTransform: "uppercase",
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                textShadow: `0 0 10px ${getTierColor(activeAlert.amount)}4d`
              }}
            >
              ⚡ {activeAlert.amount >= 5 ? "Legendary Tip!" : activeAlert.amount >= 1 ? "Epic Super Chat!" : "New Super Chat!"} ⚡
            </Typography>

            {/* Large Avatar or Bolt Icon representing tier */}
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: `${getTierColor(activeAlert.amount)}1a`,
                border: `2px solid ${getTierColor(activeAlert.amount)}33`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 3,
                boxShadow: `0 0 20px ${getTierColor(activeAlert.amount)}26`
              }}
            >
              <BoltIcon sx={{ fontSize: 40, color: getTierColor(activeAlert.amount) }} />
            </Box>

            {/* Combined Sender Name, Amount & Superchat Alert */}
            <Typography
              sx={{
                fontFamily: FONT_PRIMARY,
                fontWeight: 700,
                fontSize: "1.65rem", // High-fidelity size optimized to fit beautifully
                color: "#ffffff",
                lineHeight: 1.4,
                mb: activeAlert.message ? 3.5 : 0,
                textAlign: "center",
                width: "100%", // Utilize maximum width to prevent early wrapping
                letterSpacing: "-0.01em"
              }}
            >
              <span style={{ color: getTierColor(activeAlert.amount), fontWeight: 800 }}>
                {activeAlert.sender}
              </span>{" "}
              sent{" "}
              <span style={{ color: getTierColor(activeAlert.amount), fontWeight: 900, textShadow: `0 0 15px ${getTierColor(activeAlert.amount)}55` }}>
                {activeAlert.amount.toFixed(activeAlert.amount >= 1 ? 2 : 4)} SOL
              </span>{" "}
              Superchat!
            </Typography>

            {/* User message speech bubble */}
            {activeAlert.message && (
              <Box
                sx={{
                  width: "100%",
                  p: 3,
                  borderRadius: "18px",
                  bgcolor: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `5px solid ${getTierColor(activeAlert.amount)}`, // Vertical glowing tier border accent
                  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 12px ${getTierColor(activeAlert.amount)}08`,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FONT_PRIMARY,
                    fontWeight: 500,
                    color: "#f8fafc",
                    lineHeight: 1.6,
                    fontSize: "1.15rem",
                    fontStyle: "italic",
                    textAlign: "center"
                  }}
                >
                  “{activeAlert.message}”
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      )}

    </Box>
  );
};

export default OverlayPage;
