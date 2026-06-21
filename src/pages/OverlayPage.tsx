import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Box, Typography, Paper, keyframes } from "@mui/material";
import { useSocket } from "../context/SocketContext";
import { API_BASE } from "../shared/constants";
import BoltIcon from "@mui/icons-material/Bolt";
import LockIcon from "@mui/icons-material/Lock";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DiamondIcon from "@mui/icons-material/Diamond";
import { logger } from "../utils/logger";
import { validateMediaUrl, sanitizeMessage, sanitizeSenderName } from "../utils/security";
import type { OverlaySettings } from "../types";
import { playSyntheticSound } from "../utils/audio";
import ConfettiShower from "../components/common/ConfettiShower";
import { shortenAddress } from "../utils/format";
import { getTierColor } from "../utils/tipTier";
import {
  CherryBlossomShower,
  GentleSnowfall,
  FireworksShower,
  MatrixCodeRain,
  SolCoinShower,
  FloatingHearts,
  FlamesShower
} from "../components/features/alerts/takeovers/TakeoverAnimations";

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

// 3D Card Flip animation
const alertFlip = keyframes`
  0% { transform: translate(-50%, -50%) rotateY(90deg); opacity: 0; filter: blur(5px); }
  10% { transform: translate(-50%, -50%) rotateY(0deg); opacity: 1; filter: blur(0px); }
  90% { transform: translate(-50%, -50%) rotateY(0deg); opacity: 1; filter: blur(0px); }
  100% { transform: translate(-50%, -50%) rotateY(90deg); opacity: 0; filter: blur(5px); }
`;

// Spin Pop Zoom animation
const alertSpin = keyframes`
  0% { transform: translate(-50%, -50%) rotate(-180deg) scale(0.1); opacity: 0; }
  10% { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 1; }
  90% { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) rotate(180deg) scale(0.1); opacity: 0; }
`;

// Slide In Up animation
const alertSlideUp = keyframes`
  0% { transform: translate(-50%, 150%); opacity: 0; }
  10% { transform: translate(-50%, -50%); opacity: 1; }
  90% { transform: translate(-50%, -50%); opacity: 1; }
  100% { transform: translate(-50%, -150%); opacity: 0; }
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

// Typography Font Constants
const FONT_ACCENT = "Orbitron, sans-serif";
const FONT_PRIMARY = "Space Grotesk, sans-serif";

export default function OverlayPage() {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const [searchParams] = useSearchParams();
  // Read key from hash fragment (#key=...) for security — hash fragments are
  // never sent in HTTP requests, preventing leakage via Referer headers and logs.
  // Falls back to query parameter (?key=...) for backward compatibility.
  const overlayKey = (() => {
    const hash = window.location.hash;
    const hashMatch = hash.match(/[#&]key=([^&]*)/);
    if (hashMatch) return hashMatch[1];
    return searchParams.get("key");
  })();
  const widget = searchParams.get("widget");
  const { socket } = useSocket();
  const [authStatus, setAuthStatus] = useState<"loading" | "ok" | "denied" | "rate_limited">("loading");
  const [activeAlert, setActiveAlert] = useState<TipEntry | null>(null);
  const [showTakeover, setShowTakeover] = useState(false);

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
    font_size: 20,
    text_effect: "glow",
    special_alert_theme: "none",
    special_alert_threshold: 1.0
  });

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Synthetic Audio Engine (Web Audio API)
  const playAlertSound = (vol: number) => {
    try {
      const soundPreset = settingsRef.current.alert_sound_preset || "ding";

      if (soundPreset !== "custom") {
        playSyntheticSound(soundPreset, vol);
      } else if (soundPreset === "custom" && settingsRef.current.alert_sound_url) {
        const safeUrl = validateMediaUrl(settingsRef.current.alert_sound_url);
        if (safeUrl) {
          const audio = new Audio(safeUrl);
          audio.volume = vol;
          audio.play().catch(e => logger.error("Overlay direct sound play failed:", e));
        }
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

  // Manage active alert display duration and fullscreen takeover triggers
  useEffect(() => {
    logger.log("Alert display check. activeAlert:", activeAlert, "theme:", settings.special_alert_theme, "threshold:", settings.special_alert_threshold);
    if (!activeAlert) {
      setShowTakeover(false);
      return;
    }

    const duration = settings.alert_duration || ALERT_DISPLAY_DURATION;

    // Check if we should trigger a takeover
    const hasTakeover = settings.special_alert_theme && settings.special_alert_theme !== "none";
    const meetsThreshold = activeAlert.amount >= (settings.special_alert_threshold ?? 1.0);
    logger.log("Takeover check. hasTakeover:", hasTakeover, "meetsThreshold:", meetsThreshold);

    if (hasTakeover && meetsThreshold) {
      setShowTakeover(true);
    }

    // Set a single timer to clear both the active alert and takeover state
    const timer = setTimeout(() => {
      setActiveAlert(null);
      setShowTakeover(false);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [activeAlert, settings.alert_duration, settings.special_alert_theme, settings.special_alert_threshold]);

  // Sequential alerts queue processor
  useEffect(() => {
    logger.log("Queue processor triggered. queue_system_enabled:", settings.queue_system_enabled, "activeAlert:", activeAlert, "queue length:", alertQueue.length);
    if (settings.queue_system_enabled !== false && !activeAlert && alertQueue.length > 0) {
      const nextAlert = alertQueue[0];
      logger.log("Processing next alert from queue:", nextAlert);
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
      const res = await fetch(
        `${API_BASE}/creators/overlay-verify?wallet=${encodeURIComponent(walletAddress || "")}&key=${encodeURIComponent(overlayKey || "")}`
      );
      if (res.status === 429) {
        setAuthStatus("rate_limited");
        return;
      }
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


  // Step 3: Subscribe to real-time tips & real-time settings synchronization
  useEffect(() => {
    if (authStatus !== "ok" || !socket || !walletAddress || !overlayKey) return;

    logger.log("Subscribing to overlay for:", walletAddress);
    socket.emit("subscribe_overlay", { walletAddress, key: overlayKey });

    const handleSuperChat = (data: any) => {
      logger.log("Received new_superchat event:", data);
      const newTip: TipEntry = {
        id: data._id || data.tx_hash || Math.random().toString(),
        sender: sanitizeSenderName(
          data.name || shortenAddress(data.wallet) || "Anonymous"
        ),
        amount: data.amount / 1e9,
        message: sanitizeMessage(data.message || ""),
        timestamp: new Date().toISOString()
      };

      if (data.goal_current !== undefined) {
        setSettings((prev: OverlaySettings) => ({ ...prev, goal_current: data.goal_current }));
      }

      if (widget === "goal") {
        return;
      }

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
      logger.log("Received settings_updated event:", newSettings);
      setSettings((prev: OverlaySettings) => ({ ...prev, ...newSettings }));
    };

    const handleOverlayAuth = (res: any) => {
      logger.log("Overlay socket authentication result:", res);
    };

    const handleOverlayError = (err: any) => {
      logger.error("Overlay socket error:", err);
    };

    socket.on("new_superchat", handleSuperChat);
    socket.on("settings_updated", handleSettingsUpdated);
    socket.on("overlay_authenticated", handleOverlayAuth);
    socket.on("overlay_error", handleOverlayError);

    return () => {
      socket.off("new_superchat", handleSuperChat);
      socket.off("settings_updated", handleSettingsUpdated);
      socket.off("overlay_authenticated", handleOverlayAuth);
      socket.off("overlay_error", handleOverlayError);
      socket.emit("unsubscribe_overlay", walletAddress);
    };
  }, [authStatus, socket, walletAddress, overlayKey, widget]);

  if (!walletAddress) return null;

  if (authStatus === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "transparent" }}>
        <Typography sx={{ color: "rgba(255,255,255,0.5)" }}>Verifying overlay access...</Typography>
      </Box>
    );
  }

  if (authStatus === "rate_limited") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", gap: 2 }}>
        <LockIcon sx={{ fontSize: 48, color: "rgba(255,152,0,0.7)" }} />
        <Typography variant="h6" sx={{ color: "rgba(255,152,0,0.9)", fontWeight: 800 }}>
          Rate Limit Exceeded
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.5)", textAlign: "center", maxWidth: 400 }}>
          Too many verification attempts. Please try again in a few minutes.
        </Typography>
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
      {widget === "goal" ? (() => {
        // Render the beautiful Crowdfunding Goal progress bar
        const selectedTheme = settings.theme || "standard";
        let accentColor = settings.theme_color || "#14F195";
        let borderStyleColor = accentColor;
        let bgStyleColor = "rgba(0, 0, 0, 0.75)";
        let shadowStyle = `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px ${accentColor}1a`;

        if (selectedTheme === "gold") {
          borderStyleColor = "#FFD700";
          bgStyleColor = "linear-gradient(135deg, rgba(15, 12, 5, 0.95) 0%, rgba(30, 24, 10, 0.97) 100%)";
          shadowStyle = "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.25)";
          accentColor = "#FFD700";
        } else if (selectedTheme === "neon") {
          borderStyleColor = "#FF007F";
          bgStyleColor = "rgba(8, 4, 18, 0.92)";
          shadowStyle = "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 0, 127, 0.35)";
          accentColor = "#00FFFF";
        } else if (selectedTheme === "midnight") {
          borderStyleColor = "#9945FF";
          bgStyleColor = "linear-gradient(135deg, rgba(5, 5, 12, 0.95) 0%, rgba(15, 8, 30, 0.95) 100%)";
          shadowStyle = "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 30px rgba(153, 69, 255, 0.25)";
          accentColor = "#14F195";
        }

        const fontStylePrimary = settings.font_family ? `${settings.font_family}, sans-serif` : FONT_PRIMARY;
        const goalTitle = settings.goal_title || "Tipping Goal";
        const goalTarget = settings.goal_target || 10;
        const goalCurrent = settings.goal_current || 0;
        const percentage = Math.min(100, Math.max(0, (goalCurrent / goalTarget) * 100));

        return (
          <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 600,
            p: 3,
            borderRadius: "20px",
            background: bgStyleColor,
            border: `2px solid ${borderStyleColor}4d`,
            backdropFilter: "blur(20px)",
            boxShadow: shadowStyle,
            color: "#ffffff"
          }}>
            {/* Title and stats row */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography sx={{
                fontFamily: fontStylePrimary,
                fontWeight: 800,
                fontSize: "1.2rem",
                letterSpacing: "-0.01em",
                textShadow: `0 0 10px ${accentColor}4d`
              }}>
                {goalTitle}
              </Typography>
              <Typography sx={{
                fontFamily: fontStylePrimary,
                fontWeight: 950,
                fontSize: "1.1rem"
              }}>
                <span style={{ color: accentColor }}>{goalCurrent.toFixed(2)}</span> / {goalTarget} SOL
              </Typography>
            </Box>

            {/* Progress Bar background track */}
            <Box sx={{
              width: "100%",
              height: "22px",
              borderRadius: "11px",
              bgcolor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
              position: "relative",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)"
            }}>
              {/* Progress Bar Fill with smooth animation */}
              <Box sx={{
                width: `${percentage}%`,
                height: "100%",
                borderRadius: "11px",
                background: `linear-gradient(90deg, ${accentColor}88, ${accentColor})`,
                boxShadow: `0 0 15px ${accentColor}aa`,
                transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: "linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)",
                  backgroundSize: "20px 20px",
                  animation: "stripeMove 1.5s linear infinite",
                  "@keyframes stripeMove": {
                    "0%": { backgroundPosition: "0 0" },
                    "100%": { backgroundPosition: "200px 0" }
                  }
                }
              }} />

              {/* Centered Percentage Label */}
              <Box sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                pointerEvents: "none"
              }}>
                <Typography sx={{
                  fontFamily: fontStylePrimary,
                  fontSize: "0.75rem",
                  fontWeight: 900,
                  color: "#ffffff",
                  textShadow: "0 1px 3px rgba(0,0,0,0.8)"
                }}>
                  {percentage >= 100 ? "Completed!" : `${percentage.toFixed(0)}%`}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })() : (
        <>
          {/* Fullscreen Special Takeover Alert */}
          {showTakeover && (() => {
            switch (settings.special_alert_theme) {
              case "cherry_blossom":
                return <CherryBlossomShower />;
              case "confetti":
                return <ConfettiShower />;
              case "fireworks":
                return <FireworksShower />;
              case "snow":
                return <GentleSnowfall />;
              case "matrix":
                return <MatrixCodeRain />;
              case "coin_shower":
                return <SolCoinShower />;
              case "hearts":
                return <FloatingHearts />;
              case "flames":
                return <FlamesShower />;
              default:
                return null;
            }
          })()}

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

            const textEffect = settings.text_effect || "glow";
            let textEffectSx = {};
            if (textEffect === "glow") {
              textEffectSx = {
                textShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}aa`
              };
            } else if (textEffect === "rainbow") {
              textEffectSx = {
                backgroundImage: "linear-gradient(90deg, #ff007f, #7f00ff, #00f0ff, #ff007f)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "rainbowText 3s linear infinite",
                "@keyframes rainbowText": {
                  "0%": { backgroundPosition: "0% center" },
                  "100%": { backgroundPosition: "200% center" }
                }
              };
            } else if (textEffect === "shine") {
              textEffectSx = {
                backgroundImage: `linear-gradient(120deg, #ffffff 30%, ${accentColor}88 40%, #ffffff 50%)`,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shineSweep 4s linear infinite",
                "@keyframes shineSweep": {
                  "0%": { backgroundPosition: "200% center" },
                  "100%": { backgroundPosition: "-200% center" }
                }
              };
            }

            // Custom Broadcaster Transitions
            let activeKeyframe = alertPopIn;
            if (settings.alert_animation === "fade") activeKeyframe = alertFadeIn;
            else if (settings.alert_animation === "slide") activeKeyframe = alertSlideLeft;
            else if (settings.alert_animation === "zoom") activeKeyframe = alertZoomIn;
            else if (settings.alert_animation === "slide_down") activeKeyframe = alertSlideDown;
            else if (settings.alert_animation === "flip") activeKeyframe = alertFlip;
            else if (settings.alert_animation === "spin") activeKeyframe = alertSpin;
            else if (settings.alert_animation === "slide_up") activeKeyframe = alertSlideUp;

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
                      if (computedHeaderIcon === "heart") {
                        return (
                          <FavoriteIcon
                            sx={{
                              fontSize: 40,
                              color: accentColor,
                              animation: "heartBeat 1.2s infinite ease-in-out",
                              "@keyframes heartBeat": {
                                "0%": { transform: "scale(1)" },
                                "25%": { transform: "scale(1.2)" },
                                "40%": { transform: "scale(1)" },
                                "60%": { transform: "scale(1.15)" },
                                "100%": { transform: "scale(1)" }
                              }
                            }}
                          />
                        );
                      }
                      if (computedHeaderIcon === "diamond") {
                        return (
                          <DiamondIcon
                            sx={{
                              fontSize: 40,
                              color: accentColor,
                              animation: "spinDiamond 3s infinite linear",
                              "@keyframes spinDiamond": {
                                "0%": { transform: "rotate(0deg)" },
                                "100%": { transform: "rotate(360deg)" }
                              }
                            }}
                          />
                        );
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
                        const safeGifUrl = validateMediaUrl(settings.alert_gif_url);
                        return safeGifUrl ? (
                          <img
                            src={safeGifUrl}
                            alt="custom-alert"
                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "10px" }}
                          />
                        ) : <BoltIcon sx={{ fontSize: 40, color: accentColor }} />;
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
                      letterSpacing: "-0.01em",
                      ...textEffectSx
                    }}
                  >
                    <span style={{ color: (textEffect === "rainbow" || textEffect === "shine") ? "inherit" : accentColor, fontWeight: 800 }}>
                      {activeAlert.sender}
                    </span>{" "}
                    sent{" "}
                    <span style={{ color: (textEffect === "rainbow" || textEffect === "shine") ? "inherit" : accentColor, fontWeight: 900, textShadow: (textEffect === "rainbow" || textEffect === "shine") ? "none" : `0 0 15px ${accentColor}55` }}>
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
        </>
      )}
    </Box>
  );
}
