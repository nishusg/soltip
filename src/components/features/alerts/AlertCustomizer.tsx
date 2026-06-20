// ============================================================================
// AlertCustomizer Component — components/AlertCustomizer.tsx
// ============================================================================
//
// Self-contained settings panel for OBS Alerts and Text-to-Speech (TTS).
// Integrates theme colors dynamically from the user's active premium theme,
// and features a synthetic Web Audio oscillator for instant audio chime previews.
// ============================================================================

import React, { useState, useEffect } from "react";
import { 
  Paper, 
  Box, 
  Typography, 
  Divider, 
  Grid, 
  FormControlLabel, 
  Switch, 
  TextField, 
  InputAdornment, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Slider, 
  Button, 
  Chip, 
  useTheme
} from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import SettingsIcon from "@mui/icons-material/Settings";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import PaletteIcon from "@mui/icons-material/Palette";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import StarIcon from "@mui/icons-material/Star";
import BlockIcon from "@mui/icons-material/Block";
import toast from "react-hot-toast";
import { logger } from "../../../utils/logger";
import type { OverlaySettings } from "../../../types";
import { SITE_NAME } from "../../../shared/constants";


interface AlertCustomizerProps {
  initialSettings: Partial<OverlaySettings>;
  onSave: (settings: Partial<OverlaySettings>) => Promise<void>;
  testLoading: boolean;
  onSendTestAlert: () => Promise<void>;
  overlayToken: string | null;
  connected: boolean;
  walletAddress: string | null;
}

export default function AlertCustomizer({
  initialSettings,
  onSave,
  testLoading,
  onSendTestAlert,
  overlayToken,
  connected,
  walletAddress
}: AlertCustomizerProps) {
  const theme = useTheme();
  const userThemeColor = theme.palette.primary.main;

  // Settings State Hooks
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [ttsMinAmount, setTtsMinAmount] = useState<number>(0.05);
  const [ttsVoice, setTtsVoice] = useState<string>("female");
  const [alertDuration, setAlertDuration] = useState<number>(6500);
  const [alertGifPreset, setAlertGifPreset] = useState<string>("bolt");
  const [alertGifUrl, setAlertGifUrl] = useState<string>("");
  const [alertSoundPreset, setAlertSoundPreset] = useState<string>("ding");
  const [alertSoundUrl, setAlertSoundUrl] = useState<string>("");
  const [soundVolume, setSoundVolume] = useState<number>(0.7);
  const [themeColor, setThemeColor] = useState<string>(theme.palette.primary.main);
  const [fontFamily, setFontFamily] = useState<string>("Space Grotesk");
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  // New visual overlay themes, font size, entry transitions, and queue systems
  const [overlayTheme, setOverlayTheme] = useState<string>("standard");
  const [alertAnimation, setAlertAnimation] = useState<string>("bounce");
  const [queueSystemEnabled, setQueueSystemEnabled] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(20);
  const [textEffect, setTextEffect] = useState<string>("glow");

  // Stream Crowdfunding Tipping Goals
  const [goalEnabled, setGoalEnabled] = useState<boolean>(false);
  const [goalTitle, setGoalTitle] = useState<string>("");
  const [goalTarget, setGoalTarget] = useState<number>(10);
  const [goalCurrent, setGoalCurrent] = useState<number>(0);
  const [isGoalCurrentDirty, setIsGoalCurrentDirty] = useState<boolean>(false);
  const [blockedWordsInput, setBlockedWordsInput] = useState<string>("");
  const [specialAlertTheme, setSpecialAlertTheme] = useState<string>("none");
  const [specialAlertThreshold, setSpecialAlertThreshold] = useState<number>(1.0);

  // Sync state values when backend profile settings change
  useEffect(() => {
    if (initialSettings) {
      if (initialSettings.tts_enabled !== undefined) setTtsEnabled(initialSettings.tts_enabled);
      if (initialSettings.tts_min_amount !== undefined) setTtsMinAmount(initialSettings.tts_min_amount);
      if (initialSettings.tts_voice !== undefined) setTtsVoice(initialSettings.tts_voice);
      if (initialSettings.alert_duration !== undefined) setAlertDuration(initialSettings.alert_duration);
      if (initialSettings.alert_gif_preset !== undefined) setAlertGifPreset(initialSettings.alert_gif_preset);
      if (initialSettings.alert_gif_url !== undefined) setAlertGifUrl(initialSettings.alert_gif_url);
      if (initialSettings.alert_sound_preset !== undefined) setAlertSoundPreset(initialSettings.alert_sound_preset);
      if (initialSettings.alert_sound_url !== undefined) setAlertSoundUrl(initialSettings.alert_sound_url);
      if (initialSettings.sound_volume !== undefined) setSoundVolume(initialSettings.sound_volume);
      if (initialSettings.font_family !== undefined) setFontFamily(initialSettings.font_family);

      // Respect saved color, else fall back gracefully to the current active theme color!
      if (initialSettings.theme_color) {
        setThemeColor(initialSettings.theme_color);
      } else {
        setThemeColor(theme.palette.primary.main);
      }

      // Sync new overlay specific variables
      if (initialSettings.theme !== undefined) setOverlayTheme(initialSettings.theme);
      if (initialSettings.alert_animation !== undefined) setAlertAnimation(initialSettings.alert_animation);
      if (initialSettings.queue_system_enabled !== undefined) setQueueSystemEnabled(initialSettings.queue_system_enabled);
      if (initialSettings.font_size !== undefined) setFontSize(initialSettings.font_size);
      if (initialSettings.text_effect !== undefined) setTextEffect(initialSettings.text_effect);
      if (initialSettings.goal_enabled !== undefined) setGoalEnabled(initialSettings.goal_enabled);
      if (initialSettings.goal_title !== undefined) setGoalTitle(initialSettings.goal_title);
      if (initialSettings.goal_target !== undefined) setGoalTarget(initialSettings.goal_target);
      if (initialSettings.goal_current !== undefined && !isGoalCurrentDirty) {
        setGoalCurrent(initialSettings.goal_current);
      }
      if (initialSettings.blocked_words !== undefined) {
        setBlockedWordsInput(initialSettings.blocked_words.join(", "));
      }
      if (initialSettings.special_alert_theme !== undefined) {
        setSpecialAlertTheme(initialSettings.special_alert_theme);
      }
      if (initialSettings.special_alert_threshold !== undefined) {
        setSpecialAlertThreshold(initialSettings.special_alert_threshold);
      }
    }
  }, [initialSettings, theme, isGoalCurrentDirty]);

  // Handle color change when the premium theme itself switches
  useEffect(() => {
    if (!initialSettings?.theme_color) {
      setThemeColor(theme.palette.primary.main);
    }
  }, [theme]);

  // Local file direct MP3/WAV base64 asset converter
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("audio/")) {
      toast.error("Please upload a valid audio file (MP3, WAV, etc.)");
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) { // 2MB cap
      toast.error("Custom audio files are capped at 2MB for stream performance.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setAlertSoundUrl(base64Url);
      toast.success(`"${file.name}" uploaded successfully! Click Save Settings to activate.`);
    };
    reader.onerror = () => {
      toast.error("Failed to read audio file.");
    };
    reader.readAsDataURL(file);
  };

  // Synthetic Audio Preview Engine using browser-native oscillators
  const playPreviewSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const volume = soundVolume;
      const now = ctx.currentTime;

      if (alertSoundPreset === "ding") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(880, now); // A5
        
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1200, now); // Metallic overtone
        
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        osc1.stop(now + 1.2);
        osc2.stop(now + 1.2);
      } else if (alertSoundPreset === "swoosh") {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.6);
        
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start();
        osc.stop(now + 0.6);
      } else if (alertSoundPreset === "chime") {
        const playNote = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, start);
          gainNode.gain.setValueAtTime(volume, start);
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
      } else if (alertSoundPreset === "fanfare") {
        const playNote = (freq: number, start: number, duration: number, type: OscillatorType = "triangle") => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, start);
          gainNode.gain.setValueAtTime(volume * 0.4, start);
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
      } else if (alertSoundPreset === "laser") {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.4);
        gainNode.gain.setValueAtTime(volume * 0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.4);
      } else if (alertSoundPreset === "retro_game") {
        const playCoinNote = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(freq, start);
          gainNode.gain.setValueAtTime(volume * 0.3, start);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration - 0.01);
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };
        playCoinNote(987.77, now, 0.08); // B5
        playCoinNote(1318.51, now + 0.08, 0.35); // E6
      } else if (alertSoundPreset === "custom" && alertSoundUrl) {
        const audio = new Audio(alertSoundUrl);
        audio.volume = volume;
        audio.play().catch(e => {
          logger.error("Audio preview failed:", e);
          toast.error("Failed to play custom sound. Verify audio format or upload again.");
        });
      } else {
        toast.error("Please enter a custom sound URL or upload a file to preview");
      }
    } catch (e) {
      logger.error("Sound preview synthesis error:", e);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const savePayload: any = {
        tts_enabled: ttsEnabled,
        tts_min_amount: ttsMinAmount,
        tts_voice: ttsVoice,
        alert_duration: alertDuration,
        alert_gif_preset: alertGifPreset,
        alert_gif_url: alertGifUrl,
        alert_sound_preset: alertSoundPreset,
        alert_sound_url: alertSoundUrl,
        sound_volume: soundVolume,
        theme_color: themeColor,
        font_family: fontFamily,
        theme: overlayTheme,
        alert_animation: alertAnimation,
        queue_system_enabled: queueSystemEnabled,
        font_size: fontSize,
        text_effect: textEffect,
        goal_enabled: goalEnabled,
        goal_title: goalTitle,
        goal_target: goalTarget,
        special_alert_theme: specialAlertTheme,
        special_alert_threshold: specialAlertThreshold,
        blocked_words: blockedWordsInput
          .split(",")
          .map((w) => w.trim())
          .filter(Boolean)
      };

      if (isGoalCurrentDirty) {
        savePayload.goal_current = goalCurrent;
      }

      await onSave(savePayload);
      setIsGoalCurrentDirty(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaveLoading(false);
    }
  };

  const getOverlayUrl = () => {
    return `${window.location.origin}/overlay/${walletAddress}#key=${overlayToken}`;
  };

  const getGoalOverlayUrl = () => {
    return `${window.location.origin}/overlay/${walletAddress}?widget=goal#key=${overlayToken}`;
  };

  return (
    <Paper sx={{
      p: { xs: 4, sm: 5 },
      bgcolor: "rgba(255, 255, 255, 0.02)",
      border: `1px solid ${userThemeColor}33`,
      borderRadius: "28px",
      backdropFilter: "blur(20px)",
      position: "relative",
      overflow: "hidden",
      boxShadow: `0 8px 32px ${userThemeColor}0d`
    }}>
      {/* Glowing top line matching creator selected theme color */}
      <Box sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: `linear-gradient(90deg, transparent, ${userThemeColor}, transparent)`
      }} />

      {/* Main Settings Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 950, display: "flex", alignItems: "center", gap: 1.5, color: userThemeColor, letterSpacing: "-0.02em" }}>
            <SettingsIcon /> {SITE_NAME} Stream Overlay Studio
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Personalize your stream overlays in real time. Configure theme colors, preset sounds, transitions, custom uploads, and sequential queues.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            onClick={onSendTestAlert}
            disabled={testLoading}
             
            sx={{
              borderRadius: "14px",
              px: 3,
              py: 1.2,
              fontWeight: 800,
              textTransform: "none",
              borderColor: `${userThemeColor}44`,
              color: userThemeColor,
              "&:hover": {
                borderColor: userThemeColor,
                bgcolor: `${userThemeColor}0a`
              }
            }}
          >
            {testLoading ? "Firing..." : "Send Test Alert"}
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saveLoading}
             
            sx={{
              borderRadius: "14px",
              px: 3.5,
              py: 1.5,
              fontWeight: 800,
              textTransform: "none",
              bgcolor: userThemeColor,
              color: "#000",
              "&:hover": {
                bgcolor: userThemeColor,
                filter: "brightness(0.9)",
                boxShadow: `0 0 20px ${userThemeColor}66`
              }
            }}
          >
            {saveLoading ? "Saving Settings..." : "Save Settings"}
          </Button>
        </Box>
      </Box>

      {/* Secret Browser Source Link Section */}
      {overlayToken && walletAddress && (
        <Box sx={{
          mb: 5,
          p: 3.5,
          bgcolor: "rgba(0,0,0,0.18)",
          border: `1px solid ${userThemeColor}26`,
          borderRadius: "22px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 3
        }}>
          <Box sx={{ flexGrow: 1, minWidth: 280 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.5, color: userThemeColor, display: "flex", alignItems: "center", gap: 1 }}>
              🔌 OBS Alert Overlay URL
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
              Add this confidential link as a Browser Source in your OBS, Streamlabs, or vMix broadcaster.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
              <Box sx={{
                px: 2.2,
                py: 1.2,
                bgcolor: "rgba(0,0,0,0.4)",
                borderRadius: "12px",
                fontFamily: "Space Mono, monospace",
                fontSize: "0.72rem",
                color: "#14F195",
                wordBreak: "break-all",
                border: "1px solid rgba(255,255,255,0.04)",
                flexGrow: 1
              }}>
                {getOverlayUrl()}
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(getOverlayUrl());
                  toast.success("Overlay source link copied!");
                }}
                sx={{
                  borderRadius: "10px",
                  borderColor: `${userThemeColor}33`,
                  color: userThemeColor,
                  fontWeight: 800,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  py: 1.2,
                  px: 2.2,
                  "&:hover": { borderColor: userThemeColor, bgcolor: `${userThemeColor}0f` }
                }}
              >
                Copy Link
              </Button>
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 900, mt: 3, mb: 0.5, color: userThemeColor, display: "flex", alignItems: "center", gap: 1 }}>
              🏆 OBS Tipping Goal URL
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
              Add this confidential link as a Browser Source to display your tipping goal progress bar overlay on stream.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
              <Box sx={{
                px: 2.2,
                py: 1.2,
                bgcolor: "rgba(0,0,0,0.4)",
                borderRadius: "12px",
                fontFamily: "Space Mono, monospace",
                fontSize: "0.72rem",
                color: "#14F195",
                wordBreak: "break-all",
                border: "1px solid rgba(255,255,255,0.04)",
                flexGrow: 1
              }}>
                {getGoalOverlayUrl()}
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(getGoalOverlayUrl());
                  toast.success("Goal source link copied!");
                }}
                sx={{
                  borderRadius: "10px",
                  borderColor: `${userThemeColor}33`,
                  color: userThemeColor,
                  fontWeight: 800,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  py: 1.2,
                  px: 2.2,
                  "&:hover": { borderColor: userThemeColor, bgcolor: `${userThemeColor}0f` }
                }}
              >
                Copy Link
              </Button>
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "flex-start", md: "flex-end" } }}>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>Overlay Link Status</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.6 }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: connected ? "#14F195" : "#ff4b4b",
                boxShadow: connected ? "0 0 10px #14F195" : "0 0 10px #ff4b4b",
                animation: "livePulse 2s infinite ease-in-out",
                "@keyframes livePulse": {
                  "0%": { opacity: 0.6 },
                  "50%": { opacity: 1 },
                  "100%": { opacity: 0.6 }
                }
              }} />
              <Typography variant="caption" sx={{ color: connected ? "#14F195" : "#ff4b4b", fontWeight: 850, textTransform: "uppercase", fontSize: "0.68rem" }}>
                {connected ? "Active Broadcast Source" : "Disconnected / Offline"}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Divider sx={{ mb: 4, opacity: 0.05 }} />

      <Grid container spacing={4}>
        {/* 1. TTS & Queue Config Column */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{
            p: 3.5,
            bgcolor: "rgba(0,0,0,0.15)",
            border: `1px solid ${userThemeColor}1f`,
            borderRadius: "20px",
            height: "100%",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: `${userThemeColor}44`,
              boxShadow: `0 4px 24px ${userThemeColor}0d`
            }
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, display: "flex", alignItems: "center", gap: 1, mb: 3, color: userThemeColor }}>
              <RecordVoiceOverIcon sx={{ fontSize: 20 }} /> 🎙️ Speech & Queue Controls
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={ttsEnabled}
                  onChange={(e) => setTtsEnabled(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: userThemeColor },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: userThemeColor }
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Enable Voice TTS</Typography>
                  <Typography variant="caption" color="text.secondary">Read tip messages aloud on stream</Typography>
                </Box>
              }
              sx={{ mb: 3.5, display: "flex", width: "100%" }}
            />

            <TextField
              label="Minimum Tip to Speak"
              type="number"
              size="small"
              fullWidth
              disabled={!ttsEnabled}
              value={ttsMinAmount}
              onChange={(e) => setTtsMinAmount(Number(e.target.value))}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><BoltIcon sx={{ color: userThemeColor }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: "text.secondary" }}>SOL</Typography></InputAdornment>
                }
              }}
              sx={{
                mb: 3,
                "& .MuiInputLabel-root.Mui-focused": { color: userThemeColor },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&.Mui-focused fieldset": { borderColor: userThemeColor }
                }
              }}
            />

            <FormControl fullWidth size="small" sx={{ mb: 4 }} disabled={!ttsEnabled}>
              <InputLabel id="tts-voice-label" sx={{ "&.Mui-focused": { color: userThemeColor } }}>TTS Voice Actor</InputLabel>
              <Select
                labelId="tts-voice-label"
                label="TTS Voice Actor"
                value={ttsVoice}
                onChange={(e) => setTtsVoice(e.target.value)}
                sx={{
                  borderRadius: "12px",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: userThemeColor }
                }}
              >
                <MenuItem value="female">Premium Female Voice 👩 (Recommended)</MenuItem>
                <MenuItem value="male">Premium Male Voice 👨</MenuItem>
                <MenuItem value="default">Default System Voice 💻</MenuItem>
                <MenuItem value="robotic">Cybernetic Robot 🤖</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ my: 3, opacity: 0.05 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={queueSystemEnabled}
                  onChange={(e) => setQueueSystemEnabled(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: userThemeColor },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: userThemeColor }
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Alert Queue Engine</Typography>
                  <Typography variant="caption" color="text.secondary">Play alerts sequentially during high traffic</Typography>
                </Box>
              }
              sx={{ display: "flex", width: "100%" }}
            />
          </Paper>
        </Grid>

        {/* 2. Visual Theme & Sizing Column */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{
            p: 3.5,
            bgcolor: "rgba(0,0,0,0.15)",
            border: `1px solid ${userThemeColor}1f`,
            borderRadius: "20px",
            height: "100%",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: `${userThemeColor}44`,
              boxShadow: `0 4px 24px ${userThemeColor}0d`
            }
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, display: "flex", alignItems: "center", gap: 1, mb: 3, color: userThemeColor }}>
              <PaletteIcon sx={{ fontSize: 20 }} /> 🎨 Visual Theme & Sizing
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel id="overlay-theme-label" sx={{ "&.Mui-focused": { color: userThemeColor } }}>Overlay Layout Theme</InputLabel>
              <Select
                labelId="overlay-theme-label"
                label="Overlay Layout Theme"
                value={overlayTheme}
                onChange={(e) => setOverlayTheme(e.target.value)}
                sx={{
                  borderRadius: "12px",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: userThemeColor }
                }}
              >
                <MenuItem value="standard">Standard Sky Blue 🌌</MenuItem>
                <MenuItem value="gold">Premium Gold Edition ✨</MenuItem>
                <MenuItem value="neon">Neon Shock Cyber ⚡</MenuItem>
                <MenuItem value="midnight">Mystical Obsidian/Void 🔮</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }}>Theme Accent Color</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                {[
                  { name: "Theme Default", value: theme.palette.primary.main },
                  { name: "Green", value: "#14F195" },
                  { name: "Purple", value: "#9945FF" },
                  { name: "Cyan", value: "#38BDF8" },
                  { name: "Gold", value: "#FFCC00" },
                  { name: "Ruby", value: "#FF2D55" }
                ].map((c) => (
                  <Chip
                    key={c.value}
                    label={c.name}
                    onClick={() => setThemeColor(c.value)}
                    sx={{
                      bgcolor: themeColor === c.value ? c.value : "rgba(255,255,255,0.03)",
                      color: themeColor === c.value ? "#000" : "#fff",
                      fontWeight: 800,
                      borderRadius: "8px",
                      border: `1px solid ${c.value}44`,
                      "&:hover": { bgcolor: themeColor === c.value ? c.value : "rgba(255,255,255,0.08)" }
                    }}
                  />
                ))}
              </Box>
              <TextField
                size="small"
                fullWidth
                label="Custom Hex Code"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                sx={{
                  "& .MuiInputLabel-root.Mui-focused": { color: userThemeColor },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&.Mui-focused fieldset": { borderColor: userThemeColor }
                  }
                }}
              />
            </Box>

            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel id="font-family-label" sx={{ "&.Mui-focused": { color: userThemeColor } }}>Font Family</InputLabel>
              <Select
                labelId="font-family-label"
                label="Font Family"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                sx={{
                  borderRadius: "12px",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: userThemeColor }
                }}
              >
                <MenuItem value="Space Grotesk" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Space Grotesk</MenuItem>
                <MenuItem value="Orbitron" style={{ fontFamily: "Orbitron, sans-serif" }}>Orbitron</MenuItem>
                <MenuItem value="Inter" style={{ fontFamily: "Inter, sans-serif" }}>Inter</MenuItem>
                <MenuItem value="Outfit" style={{ fontFamily: "Outfit, sans-serif" }}>Outfit</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Overlay Text Size</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: userThemeColor }}>{fontSize}px</Typography>
              </Box>
              <Slider
                value={fontSize}
                min={14}
                max={32}
                step={1}
                onChange={(_, val) => setFontSize(val as number)}
                sx={{
                  color: userThemeColor,
                  height: 6,
                  "& .MuiSlider-thumb": { width: 14, height: 14 }
                }}
              />
            </Box>

            <FormControl fullWidth size="small" sx={{ mt: 2 }}>
              <InputLabel id="text-effect-label" sx={{ "&.Mui-focused": { color: userThemeColor } }}>Alert Text Effect</InputLabel>
              <Select
                labelId="text-effect-label"
                label="Alert Text Effect"
                value={textEffect}
                onChange={(e) => setTextEffect(e.target.value)}
                sx={{
                  borderRadius: "12px",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: userThemeColor }
                }}
              >
                <MenuItem value="none">Plain Solid Text 📝</MenuItem>
                <MenuItem value="glow">Neon Pulse Glow 🌟</MenuItem>
                <MenuItem value="rainbow">Animated Rainbow Gradient 🌈</MenuItem>
                <MenuItem value="shine">Metallic Shine Shimmer ✨</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* 3. Audio & Animation Customizer Column */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{
            p: 3.5,
            bgcolor: "rgba(0,0,0,0.15)",
            border: `1px solid ${userThemeColor}1f`,
            borderRadius: "20px",
            height: "100%",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: `${userThemeColor}44`,
              boxShadow: `0 4px 24px ${userThemeColor}0d`
            }
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, display: "flex", alignItems: "center", gap: 1, mb: 3, color: userThemeColor }}>
              <MusicNoteIcon sx={{ fontSize: 20 }} /> 🎵 Sound & Transitions
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="sound-preset-label" sx={{ "&.Mui-focused": { color: userThemeColor } }}>Alert Audio Preset</InputLabel>
              <Select
                labelId="sound-preset-label"
                label="Alert Audio Preset"
                value={alertSoundPreset}
                onChange={(e) => setAlertSoundPreset(e.target.value)}
                sx={{
                  borderRadius: "12px",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: userThemeColor }
                }}
              >
                <MenuItem value="ding">Crypto Ding 🔔 (Synthetic)</MenuItem>
                <MenuItem value="swoosh">Cyber Swoosh 💨 (Synthetic)</MenuItem>
                <MenuItem value="chime">Classic Chime 🔮 (Synthetic)</MenuItem>
                <MenuItem value="fanfare">Epic Fanfare 🎺 (Synthetic)</MenuItem>
                <MenuItem value="laser">Retro Laser Blast ⚡ (Synthetic)</MenuItem>
                <MenuItem value="retro_game">8-Bit Coin Chime 🪙 (Synthetic)</MenuItem>
                <MenuItem value="custom">Custom Upload / URL 🔗</MenuItem>
              </Select>
            </FormControl>

            {alertSoundPreset === "custom" && (
              <Box sx={{ mb: 3 }}>
                <TextField
                  size="small"
                  fullWidth
                  label="Audio File / Link"
                  placeholder="https://example.com/sound.mp3"
                  value={alertSoundUrl.startsWith("data:") ? "Local Upload Active 📁" : alertSoundUrl}
                  onChange={(e) => setAlertSoundUrl(e.target.value)}
                  disabled={alertSoundUrl.startsWith("data:")}
                  sx={{
                    mb: 1.5,
                    "& .MuiInputLabel-root.Mui-focused": { color: userThemeColor },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      "&.Mui-focused fieldset": { borderColor: userThemeColor }
                    }
                  }}
                />
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                     
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 700,
                      color: userThemeColor,
                      borderColor: `${userThemeColor}44`,
                      "&:hover": { borderColor: userThemeColor, bgcolor: `${userThemeColor}0a` }
                    }}
                  >
                    Upload Sound
                    <input
                      type="file"
                      accept="audio/*"
                      hidden
                      onChange={handleAudioUpload}
                    />
                  </Button>
                  {alertSoundUrl.startsWith("data:") && (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      onClick={() => setAlertSoundUrl("")}
                      sx={{ textTransform: "none", fontWeight: 800 }}
                    >
                      Reset Custom
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 2, mb: 4, alignItems: "center" }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                  <VolumeUpIcon sx={{ fontSize: 14 }} /> Alert Volume
                </Typography>
                <Slider
                  value={soundVolume}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(_, val) => setSoundVolume(val as number)}
                  sx={{
                    color: userThemeColor,
                    py: 0.5,
                    "& .MuiSlider-thumb": { width: 12, height: 12 }
                  }}
                />
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={playPreviewSound}
                 
                sx={{
                  borderRadius: "10px",
                  borderColor: `${userThemeColor}44`,
                  color: userThemeColor,
                  textTransform: "none",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  py: 0.8,
                  "&:hover": {
                    borderColor: userThemeColor,
                    bgcolor: `${userThemeColor}0a`
                  }
                }}
              >
                Preview
              </Button>
            </Box>

            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel id="gif-preset-label" sx={{ "&.Mui-focused": { color: userThemeColor } }}>Alert Graphic preset</InputLabel>
              <Select
                labelId="gif-preset-label"
                label="Alert Graphic Preset"
                value={alertGifPreset}
                onChange={(e) => setAlertGifPreset(e.target.value)}
                sx={{
                  borderRadius: "12px",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: userThemeColor }
                }}
              >
                <MenuItem value="bolt">Classic Bolt ⚡ (Animated)</MenuItem>
                <MenuItem value="crown">Golden Crown 👑 (Glowing)</MenuItem>
                <MenuItem value="orb">Supernova Orb 🔮 (Futuristic)</MenuItem>
                <MenuItem value="heart">Pulsing Heart ❤️ (Animated)</MenuItem>
                <MenuItem value="diamond">Rotating Diamond 💎 (Premium)</MenuItem>
                <MenuItem value="custom">Custom Image/GIF URL 🔗</MenuItem>
              </Select>
            </FormControl>

            {alertGifPreset === "custom" && (
              <TextField
                size="small"
                fullWidth
                label="Custom GIF/Image URL"
                placeholder="https://example.com/alert.gif"
                value={alertGifUrl}
                onChange={(e) => setAlertGifUrl(e.target.value)}
                sx={{
                  mb: 3,
                  "& .MuiInputLabel-root.Mui-focused": { color: userThemeColor },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&.Mui-focused fieldset": { borderColor: userThemeColor }
                  }
                }}
              />
            )}

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="alert-animation-label" sx={{ "&.Mui-focused": { color: userThemeColor } }}>Alert Entry Animation</InputLabel>
              <Select
                labelId="alert-animation-label"
                label="Alert Entry Animation"
                value={alertAnimation}
                onChange={(e) => setAlertAnimation(e.target.value)}
                sx={{
                  borderRadius: "12px",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: userThemeColor }
                }}
              >
                <MenuItem value="bounce">Bounce Impact (Classic)</MenuItem>
                <MenuItem value="fade">Elegant Fade In</MenuItem>
                <MenuItem value="slide">Slide In Left</MenuItem>
                <MenuItem value="zoom">Zoom Scale Pop</MenuItem>
                <MenuItem value="slide_down">Slide Down Drop</MenuItem>
                <MenuItem value="flip">3D Card Flip 🔄 (Premium)</MenuItem>
                <MenuItem value="spin">Rotate Spin Zoom 🌀 (Epic)</MenuItem>
                <MenuItem value="slide_up">Slide In Up ⬆️ (Classic)</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Alert Duration</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: userThemeColor }}>{(alertDuration / 1000).toFixed(1)}s</Typography>
              </Box>
              <Slider
                value={alertDuration}
                min={3000}
                max={15000}
                step={500}
                onChange={(_, val) => setAlertDuration(val as number)}
                sx={{
                  color: userThemeColor,
                  height: 6,
                  "& .MuiSlider-thumb": { width: 14, height: 14 }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* 4. Stream Crowdfunding Goal Column */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{
            p: 3.5,
            bgcolor: "rgba(0,0,0,0.15)",
            border: `1px solid ${userThemeColor}1f`,
            borderRadius: "20px",
            height: "100%",
            transition: "all 0.3s ease",
            display: "flex",
            flexDirection: "column",
            "&:hover": {
              borderColor: `${userThemeColor}44`,
              boxShadow: `0 4px 24px ${userThemeColor}0d`
            }
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, display: "flex", alignItems: "center", gap: 1, mb: 3, color: userThemeColor }}>
              <StarIcon sx={{ fontSize: 20 }} /> 🏆 Tipping Goal Widget
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={goalEnabled}
                  onChange={(e) => setGoalEnabled(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: userThemeColor },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: userThemeColor }
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Enable Goal</Typography>
                  <Typography variant="caption" color="text.secondary">Display goal on overlay & profile</Typography>
                </Box>
              }
              sx={{ mb: 3, display: "flex", width: "100%" }}
            />

            <TextField
              label="Goal Title"
              size="small"
              fullWidth
              disabled={!goalEnabled}
              placeholder="e.g. Upgrade Setup!"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiInputLabel-root.Mui-focused": { color: userThemeColor },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&.Mui-focused fieldset": { borderColor: userThemeColor }
                }
              }}
            />

            <TextField
              label="Goal Target"
              type="number"
              size="small"
              fullWidth
              disabled={!goalEnabled}
              value={goalTarget}
              onChange={(e) => setGoalTarget(Number(e.target.value))}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><BoltIcon sx={{ color: userThemeColor }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: "text.secondary" }}>SOL</Typography></InputAdornment>
                }
              }}
              sx={{
                mb: 3,
                "& .MuiInputLabel-root.Mui-focused": { color: userThemeColor },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&.Mui-focused fieldset": { borderColor: userThemeColor }
                }
              }}
            />

            <TextField
              label="Current Progress"
              type="number"
              size="small"
              fullWidth
              disabled={!goalEnabled}
              value={goalCurrent}
              onChange={(e) => {
                setGoalCurrent(Number(e.target.value));
                setIsGoalCurrentDirty(true);
              }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><BoltIcon sx={{ color: userThemeColor }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: "text.secondary" }}>SOL</Typography></InputAdornment>
                }
              }}
              sx={{
                "& .MuiInputLabel-root.Mui-focused": { color: userThemeColor },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&.Mui-focused fieldset": { borderColor: userThemeColor }
                }
              }}
            />
          </Paper>
        </Grid>

        {/* 5. Message Moderation & Word Filter Column */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{
            p: 3.5,
            bgcolor: "rgba(0,0,0,0.15)",
            border: `1px solid ${userThemeColor}1f`,
            borderRadius: "20px",
            height: "100%",
            transition: "all 0.3s ease",
            display: "flex",
            flexDirection: "column",
            "&:hover": {
              borderColor: `${userThemeColor}44`,
              boxShadow: `0 4px 24px ${userThemeColor}0d`
            }
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, display: "flex", alignItems: "center", gap: 1, mb: 3, color: userThemeColor }}>
              <BlockIcon sx={{ fontSize: 20 }} /> 🛡️ Word Moderation
            </Typography>

            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Blocked Words List</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
              Censors custom words matching on your stream overlay & TTS. Separate words with commas (max 50).
            </Typography>

            <TextField
              multiline
              rows={4}
              placeholder="e.g. scam, hack, spam"
              value={blockedWordsInput}
              onChange={(e) => setBlockedWordsInput(e.target.value)}
              sx={{
                mb: 2,
                "& .MuiInputLabel-root.Mui-focused": { color: userThemeColor },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&.Mui-focused fieldset": { borderColor: userThemeColor }
                }
              }}
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: "auto" }}>
              <Typography variant="caption" color="text.secondary">
                Active custom:
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: userThemeColor }}>
                {blockedWordsInput.split(",").map(w => w.trim()).filter(Boolean).length} / 50
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, fontSize: "0.68rem", opacity: 0.8 }}>
              💡 A default general profanity blocklist is always active as a base layer.
            </Typography>
          </Paper>
        </Grid>

        {/* 6. Fullscreen Takeover Alert Column */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{
            p: 3.5,
            bgcolor: "rgba(0,0,0,0.15)",
            border: `1px solid ${userThemeColor}1f`,
            borderRadius: "20px",
            height: "100%",
            transition: "all 0.3s ease",
            display: "flex",
            flexDirection: "column",
            "&:hover": {
              borderColor: `${userThemeColor}44`,
              boxShadow: `0 4px 24px ${userThemeColor}0d`
            }
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, display: "flex", alignItems: "center", gap: 1, mb: 3, color: userThemeColor }}>
              <PaletteIcon sx={{ fontSize: 20 }} /> 🌸 Takeover Alerts
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
              Trigger screen-wide animations for premium high-value tipping events.
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel id="special-alert-theme-label" sx={{ "&.Mui-focused": { color: userThemeColor } }}>Takeover Animation</InputLabel>
              <Select
                labelId="special-alert-theme-label"
                label="Takeover Animation"
                value={specialAlertTheme}
                onChange={(e) => setSpecialAlertTheme(e.target.value)}
                sx={{
                  borderRadius: "12px",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: userThemeColor }
                }}
              >
                <MenuItem value="none">None (Disabled)</MenuItem>
                <MenuItem value="cherry_blossom">Cherry Blossom Shower 🌸</MenuItem>
                <MenuItem value="confetti">Confetti Rain 🎉</MenuItem>
                <MenuItem value="fireworks">Fireworks Display 🎆</MenuItem>
                <MenuItem value="snow">Gentle Snowfall ❄️</MenuItem>
                <MenuItem value="matrix">Matrix Code Rain 🟢</MenuItem>
                <MenuItem value="coin_shower">SOL Coin Shower 🪙</MenuItem>
                <MenuItem value="hearts">Floating Hearts 💖</MenuItem>
                <MenuItem value="flames">Fire & Flames 🔥</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Minimum Tip to Trigger"
              type="number"
              size="small"
              fullWidth
              disabled={specialAlertTheme === "none"}
              value={specialAlertThreshold}
              onChange={(e) => setSpecialAlertThreshold(Math.max(0, Number(e.target.value)))}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><BoltIcon sx={{ color: userThemeColor }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: "text.secondary" }}>SOL</Typography></InputAdornment>
                }
              }}
              sx={{
                "& .MuiInputLabel-root.Mui-focused": { color: userThemeColor },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&.Mui-focused fieldset": { borderColor: userThemeColor }
                }
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}
