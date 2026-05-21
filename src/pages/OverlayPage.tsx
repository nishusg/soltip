import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Box, Typography, Paper, keyframes } from "@mui/material";
import { useSocket } from "../context/SocketContext";
import { API_BASE } from "../shared/constants";
import BoltIcon from "@mui/icons-material/Bolt";
import LockIcon from "@mui/icons-material/Lock";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { logger } from "../utils/logger";
import type { OverlaySettings } from "../types";

// Animation for new tip entry
const slideInLeft = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Classic Bounce popup animation
const alertPopIn = keyframes`
  0% { transform: translate(-50%, -40%) scale(0.85); opacity: 0; filter: blur(10px); }
  8% { transform: translate(-50%, -50%) scale(1.03); opacity: 1; filter: blur(0px); }
  12% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  88% { transform: translate(-50%, -50%) scale(1); opacity: 1; filter: blur(0px); }
  100% { transform: translate(-50%, -60%) scale(0.9); opacity: 0; filter: blur(10px); }
`;

// Dynamic Fade In transition
const alertFadeIn = keyframes`
  0% { opacity: 0; filter: blur(10px); transform: translate(-50%, -50%); }
  10% { opacity: 1; filter: blur(0px); transform: translate(-50%, -50%); }
  90% { opacity: 1; filter: blur(0px); transform: translate(-50%, -50%); }
  100% { opacity: 0; filter: blur(10px); transform: translate(-50%, -50%); }
`;

// Dynamic Slide In Left transition
const alertSlideLeft = keyframes`
  0% { transform: translate(-150%, -50%); opacity: 0; }
  10% { transform: translate(-50%, -50%); opacity: 1; }
  90% { transform: translate(-50%, -50%); opacity: 1; }
  100% { transform: translate(150%, -50%); opacity: 0; }
`;

// Dynamic Zoom Scale Pop transition
const alertZoomIn = keyframes`
  0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0; }
  8% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
  12% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  88% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
`;

// Dynamic Slide Down Drop transition
const alertSlideDown = keyframes`
  0% { transform: translate(-50%, -150%); opacity: 0; }
  10% { transform: translate(-50%, -50%); opacity: 1; }
  90% { transform: translate(-50%, -50%); opacity: 1; }
  100% { transform: translate(-50%, 150%); opacity: 0; }
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

export default function OverlayPage() {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const [searchParams] = useSearchParams();
  const overlayKey = searchParams.get("key");
  const { socket } = useSocket();
  const [tips, setTips] = useState<TipEntry[]>([]);
  const [authStatus, setAuthStatus] = useState<"loading" | "ok" | "denied">("loading");
  const [activeAlert, setActiveAlert] = useState<TipEntry | null>(null);

  // Sequential alerts queue engine variables
  const [alertQueue, setAlertQueue] = useState<TipEntry[]>([]);
  const alertQueueRef = useRef<TipEntry[]>([]);
  useEffect(() => {
    alertQueueRef.current = alertQueue;
  }, [alertQueue]);

  // Overlay Settings State with default fallbacks
  const [settings, setSettings] = useState<OverlaySettings>({
    tts_enabled: true,
    tts_min_amount: 0.05,
    alert_duration: 6500,
    alert_gif_preset: "bolt",
    alert_gif_url: "",
    alert_sound_preset: "ding",
    alert_sound_url: "",
    sound_volume: 0.7,
    theme_color: "#14F195",
    font_family: "Space Grotesk",
    theme: "standard",
    alert_animation: "bounce",
    queue_system_enabled: true,
    font_size: 20
  });

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Synthetic Audio Engine (Web Audio API)
  const playAlertSound = (vol: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      const soundPreset = settingsRef.current.alert_sound_preset || "ding";

      if (soundPreset === "ding") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(880, now); // A5

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1200, now); // High overtone

        gainNode.gain.setValueAtTime(vol, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(now + 1.2);
        osc2.stop(now + 1.2);
      } else if (soundPreset === "swoosh") {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.6);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.linearRampToValueAtTime(vol, now + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(now + 0.6);
      } else if (soundPreset === "chime") {
        const playNote = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, start);
          gainNode.gain.setValueAtTime(vol, start);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration - 0.02);
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };
        playNote(523.25, now, 0.15); // C5
        playNote(659.25, now + 0.12, 0.15); // E5
        playNote(783.99, now + 0.24, 0.15); // G5
        playNote(1046.50, now + 0.36, 0.4); // C6
      } else if (soundPreset === "fanfare") {
        const playNote = (freq: number, start: number, duration: number, type: OscillatorType = "triangle") => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, start);
          gainNode.gain.setValueAtTime(vol * 0.4, start);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration - 0.05);
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };
        playNote(587.33, now, 0.25); // D5
        playNote(659.25, now + 0.25, 0.25); // E5
        playNote(783.99, now + 0.5, 0.25); // G5
        playNote(987.77, now + 0.75, 0.8, "sine"); // B5
        playNote(1174.66, now + 0.75, 0.8, "sine"); // D6
        playNote(1318.51, now + 0.75, 0.8, "triangle"); // E6
      } else if (soundPreset === "custom" && settingsRef.current.alert_sound_url) {
        const audio = new Audio(settingsRef.current.alert_sound_url);
        audio.volume = vol;
        audio.play().catch(e => logger.error("Overlay direct sound play failed:", e));
      }
    } catch (e) {
      logger.error("Alert sound playback error:", e);
    }
  };

  // Browser-native TTS Synthesis engine
  const speakTtsAlert = (name: string, amount: number, message: string) => {
    const currentSettings = settingsRef.current;
    if (!currentSettings.tts_enabled || amount < currentSettings.tts_min_amount || !window.speechSynthesis) return;

    // Polish the TTS phrase to sound beautiful
    const textToSpeak = message
      ? `${name} tipped ${amount.toFixed(amount >= 1 ? 2 : 3)} SOL. ${message}`
      : `${name} tipped ${amount.toFixed(amount >= 1 ? 2 : 3)} SOL!`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.volume = currentSettings.sound_volume !== undefined ? currentSettings.sound_volume : 0.7;

    // Select dynamic voice actor preset based on settings
    const voiceOption = currentSettings.tts_voice || "female";
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | null = null;

    if (voiceOption === "female") {
      // Look for a standard English female voice
      selectedVoice = voices.find(v => {
        const nameLower = v.name.toLowerCase();
        return v.lang.startsWith("en") &&
          (nameLower.includes("female") ||
            nameLower.includes("zira") ||
            nameLower.includes("samantha") ||
            nameLower.includes("google us english") ||
            nameLower.includes("susan") ||
            nameLower.includes("hazel") ||
            nameLower.includes("karen"));
      }) || null;
    } else if (voiceOption === "male") {
      // Look for a standard English male voice
      selectedVoice = voices.find(v => {
        const nameLower = v.name.toLowerCase();
        return v.lang.startsWith("en") &&
          (nameLower.includes("male") ||
            nameLower.includes("david") ||
            nameLower.includes("daniel") ||
            nameLower.includes("george") ||
            nameLower.includes("mark") ||
            nameLower.includes("ravi"));
      }) || null;
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Set voice rate and pitch values
    if (voiceOption === "robotic") {
      utterance.pitch = 0.3; // Low cybernetic monotone pitch
      utterance.rate = 1.15; // Slightly accelerated
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 0.95; // Slightly slower speed for clearer reading
    }

    window.speechSynthesis.speak(utterance);
  };

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

  // Manage active alert display duration and trigger next from queue
  useEffect(() => {
    if (!activeAlert) return;
    const duration = settings.alert_duration || ALERT_DISPLAY_DURATION;
    const timer = setTimeout(() => {
      setActiveAlert(null);
    }, duration);
    return () => clearTimeout(timer);
  }, [activeAlert, settings.alert_duration]);

  // Sequential alerts queue processor
  useEffect(() => {
    if (settings.queue_system_enabled !== false && !activeAlert && alertQueue.length > 0) {
      const nextAlert = alertQueue[0];
      setAlertQueue(prev => prev.slice(1));
      setActiveAlert(nextAlert);

      // Play sound
      const currentVol = settingsRef.current.sound_volume !== undefined ? settingsRef.current.sound_volume : 0.7;
      playAlertSound(currentVol);

      // Trigger TTS after a short delay
      setTimeout(() => {
        speakTtsAlert(nextAlert.sender, nextAlert.amount, nextAlert.message);
      }, 1200);
    }
  }, [activeAlert, alertQueue, settings.queue_system_enabled]);

  // Step 1: Verify the overlay key
  useEffect(() => {
    if (!walletAddress || !overlayKey) {
      setAuthStatus("denied");
      return;
    }

    verifyOverlay();
  }, [walletAddress, overlayKey]);

  const verifyOverlay = async () => {
    try {
      const res = await fetch(`${API_BASE}/creators/overlay-verify?wallet=${walletAddress}&key=${overlayKey}`);
      if (!res.ok) throw new Error("HTTP error");
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response format");
      }
      const data = await res.json();
      if (data.valid) {
        if (data.settings) {
          setSettings((prev: OverlaySettings) => ({ ...prev, ...data.settings }));
        }
        setAuthStatus("ok");
      } else {
        setAuthStatus("denied");
      }
    } catch (err) {
      setAuthStatus("denied");
    }
  };

  // Step 2: Load existing tips on mount (filtered to today for fresh daily streams)
  useEffect(() => {
    if (authStatus !== "ok" || !walletAddress) return;

    const loadRecentTips = async () => {
      try {
        const res = await fetch(`${API_BASE}/stats/user/${walletAddress}`);
        if (!res.ok) throw new Error("HTTP error");
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response format");
        }
        const data = await res.json();
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
      } catch (err) {
        // Ignore error
      }
    };

    loadRecentTips();
  }, [authStatus, walletAddress]);

  // Step 3: Subscribe to real-time tips & real-time settings synchronization
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

      if (settingsRef.current.queue_system_enabled !== false) {
        setAlertQueue(prev => [...prev, newTip]);
      } else {
        setActiveAlert(newTip);

        // Play sound with the latest volume
        const currentVol = settingsRef.current.sound_volume !== undefined ? settingsRef.current.sound_volume : 0.7;
        playAlertSound(currentVol);

        // Trigger TTS after delay
        setTimeout(() => {
          speakTtsAlert(newTip.sender, newTip.amount, newTip.message);
        }, 1200);
      }
    };

    const handleSettingsUpdated = (newSettings: any) => {
      setSettings((prev: OverlaySettings) => ({ ...prev, ...newSettings }));
    };

    socket.on("new_superchat", handleSuperChat);
    socket.on("settings_updated", handleSettingsUpdated);

    return () => {
      socket.off("new_superchat", handleSuperChat);
      socket.off("settings_updated", handleSettingsUpdated);
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
      {activeAlert && (() => {
        const selectedTheme = settings.theme || "standard";
        let accentColor = settings.theme_color || getTierColor(activeAlert.amount);
        let borderStyleColor = accentColor;
        let bgStyleColor = "rgba(0, 0, 0, 0.85)";
        let shadowStyle = `0 0 50px ${accentColor}33, inset 0 0 20px ${accentColor}1a`;
        let computedHeaderIcon = settings.alert_gif_preset || "bolt";

        // Layout Theme Configs
        if (selectedTheme === "gold") {
          borderStyleColor = "#FFD700";
          bgStyleColor = "linear-gradient(135deg, rgba(15, 12, 5, 0.97) 0%, rgba(30, 24, 10, 0.99) 100%)";
          shadowStyle = "0 0 60px rgba(255, 215, 0, 0.45), inset 0 0 25px rgba(255, 215, 0, 0.2)";
          accentColor = "#FFD700";
          if (settings.alert_gif_preset === "bolt") {
            computedHeaderIcon = "crown";
          }
        } else if (selectedTheme === "neon") {
          borderStyleColor = "#FF007F";
          bgStyleColor = "rgba(8, 4, 18, 0.95)";
          shadowStyle = "0 0 60px rgba(255, 0, 127, 0.55), inset 0 0 25px rgba(255, 0, 127, 0.25)";
          accentColor = "#00FFFF";
        } else if (selectedTheme === "midnight") {
          borderStyleColor = "#9945FF";
          bgStyleColor = "linear-gradient(135deg, rgba(5, 5, 12, 0.98) 0%, rgba(15, 8, 30, 0.98) 100%)";
          shadowStyle = "0 0 60px rgba(153, 69, 255, 0.45), inset 0 0 25px rgba(153, 69, 255, 0.2)";
          accentColor = "#14F195";
        }

        const fontStylePrimary = settings.font_family ? `${settings.font_family}, sans-serif` : FONT_PRIMARY;
        const fontStyleAccent = settings.font_family ? `${settings.font_family}, sans-serif` : FONT_ACCENT;
        const customFontSize = settings.font_size || 20;

        // Custom Broadcaster Transitions
        let activeKeyframe = alertPopIn;
        if (settings.alert_animation === "fade") activeKeyframe = alertFadeIn;
        else if (settings.alert_animation === "slide") activeKeyframe = alertSlideLeft;
        else if (settings.alert_animation === "zoom") activeKeyframe = alertZoomIn;
        else if (settings.alert_animation === "slide_down") activeKeyframe = alertSlideDown;

        return (
          <Box
            sx={{
              position: "absolute",
              top: "45%",
              left: "50%",
              zIndex: 999,
              width: ACTIVE_ALERT_WIDTH,
              animation: `${activeKeyframe} ${settings.alert_duration || ALERT_DISPLAY_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
              pointerEvents: "none"
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "28px",
                background: bgStyleColor,
                border: `2px solid ${borderStyleColor}`,
                backdropFilter: "blur(20px)",
                boxShadow: shadowStyle,
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
                background: `linear-gradient(90deg, transparent, ${borderStyleColor}, transparent)`
              }} />

              {/* Glowing Category Header */}
              <Typography
                variant="caption"
                sx={{
                  fontFamily: fontStyleAccent,
                  fontSize: "0.85rem",
                  fontWeight: 900,
                  letterSpacing: "4px",
                  color: accentColor,
                  textTransform: "uppercase",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  textShadow: `0 0 10px ${accentColor}4d`
                }}
              >
                ⚡ {activeAlert.amount >= 5 ? "Legendary Tip!" : activeAlert.amount >= 1 ? "Epic Super Chat!" : "New Super Chat!"} ⚡
              </Typography>

              {/* Large Avatar or Custom Preset representing tier */}
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  bgcolor: `${accentColor}1a`,
                  border: `2px solid ${accentColor}33`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 3,
                  boxShadow: `0 0 20px ${accentColor}26`,
                  overflow: "hidden"
                }}
              >
                {(() => {
                  if (computedHeaderIcon === "bolt") {
                    return <BoltIcon sx={{ fontSize: 40, color: accentColor }} />;
                  }
                  if (computedHeaderIcon === "crown") {
                    return <EmojiEventsIcon sx={{ fontSize: 40, color: accentColor }} />;
                  }
                  if (computedHeaderIcon === "orb") {
                    return (
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
                          animation: "pulseGlow 1.5s infinite ease-in-out",
                          "@keyframes pulseGlow": {
                            "0%": { transform: "scale(0.95)", opacity: 0.7, boxShadow: `0 0 10px ${accentColor}` },
                            "50%": { transform: "scale(1.1)", opacity: 1, boxShadow: `0 0 25px ${accentColor}` },
                            "100%": { transform: "scale(0.95)", opacity: 0.7, boxShadow: `0 0 10px ${accentColor}` }
                          }
                        }}
                      />
                    );
                  }
                  if (computedHeaderIcon === "custom" && settings.alert_gif_url) {
                    return (
                      <img
                        src={settings.alert_gif_url}
                        alt="custom-alert"
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "10px" }}
                      />
                    );
                  }
                  return <BoltIcon sx={{ fontSize: 40, color: accentColor }} />;
                })()}
              </Box>

              {/* Combined Sender Name, Amount & Superchat Alert */}
              <Typography
                sx={{
                  fontFamily: fontStylePrimary,
                  fontWeight: 700,
                  fontSize: `${customFontSize + 6}px`,
                  color: "#ffffff",
                  lineHeight: 1.4,
                  mb: activeAlert.message ? 3.5 : 0,
                  textAlign: "center",
                  width: "100%",
                  letterSpacing: "-0.01em"
                }}
              >
                <span style={{ color: accentColor, fontWeight: 800 }}>
                  {activeAlert.sender}
                </span>{" "}
                sent{" "}
                <span style={{ color: accentColor, fontWeight: 900, textShadow: `0 0 15px ${accentColor}55` }}>
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
                    borderLeft: `5px solid ${borderStyleColor}`,
                    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 12px ${accentColor}08`,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: fontStylePrimary,
                      fontWeight: 500,
                      color: "#f8fafc",
                      lineHeight: 1.6,
                      fontSize: `${customFontSize}px`,
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
        );
      })()}
    </Box>
  );
}
