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
  CircularProgress,
  useTheme
} from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import SettingsIcon from "@mui/icons-material/Settings";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import PaletteIcon from "@mui/icons-material/Palette";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import StarIcon from "@mui/icons-material/Star";
import RefreshIcon from "@mui/icons-material/Refresh";
import toast from "react-hot-toast";

interface AlertCustomizerProps {
  initialSettings: any;
  onSave: (settings: any) => Promise<void>;
  testLoading: boolean;
  onSendTestAlert: () => Promise<void>;
  tokenLoading: boolean;
  onGenerateToken: () => Promise<void>;
  overlayToken: string | null;
  connected: boolean;
}

export default function AlertCustomizer({
  initialSettings,
  onSave,
  testLoading,
  onSendTestAlert,
  tokenLoading,
  onGenerateToken,
  overlayToken,
  connected
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

      // Respect saved color, else fall back gracefully to the current active premium theme color!
      if (initialSettings.theme_color) {
        setThemeColor(initialSettings.theme_color);
      } else {
        setThemeColor(theme.palette.primary.main);
      }
    }
  }, [initialSettings, theme]);

  // Handle color change when the premium theme itself switches
  useEffect(() => {
    if (!initialSettings?.theme_color) {
      setThemeColor(theme.palette.primary.main);
    }
  }, [theme]);

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
      } else if (alertSoundPreset === "custom" && alertSoundUrl) {
        const audio = new Audio(alertSoundUrl);
        audio.volume = volume;
        audio.play().catch(e => {
          console.error("Audio preview failed:", e);
          toast.error("Failed to load custom sound URL. Verify CORS headers.");
        });
      } else {
        toast.error("Please enter a custom sound URL to preview");
      }
    } catch (e) {
      console.error("Sound preview synthesis error:", e);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await onSave({
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
        font_family: fontFamily
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaveLoading(false);
    }
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

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, display: "flex", alignItems: "center", gap: 1.5, color: userThemeColor }}>
            <SettingsIcon /> 🎨 Stream Alert & TTS Customizer
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Personalize your stream overlays. Configure your theme colors, preset sounds, custom GIFs, and Text-to-Speech (TTS) rules.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            onClick={onSendTestAlert}
            disabled={testLoading}
            startIcon={testLoading ? <CircularProgress size={16} color="inherit" /> : <BoltIcon />}
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
            startIcon={saveLoading ? <CircularProgress size={20} color="inherit" /> : <StarIcon />}
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

      <Divider sx={{ mb: 4, opacity: 0.05 }} />

      <Grid container spacing={4}>
        {/* 1. TTS Alerts Column */}
        <Grid size={{ xs: 12, md: 4 }}>
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
            <Typography variant="subtitle1" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1, mb: 3, color: userThemeColor }}>
              <RecordVoiceOverIcon sx={{ fontSize: 20 }} /> 🎙️ Text-to-Speech (TTS)
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
              sx={{ mb: 4, display: "flex", width: "100%" }}
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

            <FormControl fullWidth size="small" sx={{ mb: 2 }} disabled={!ttsEnabled}>
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

            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Prevents TTS spam by reading messages only for tips equal to or above this amount.
            </Typography>
          </Paper>
        </Grid>

        {/* 2. Visual Theme & Style Column */}
        <Grid size={{ xs: 12, md: 4 }}>
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
            <Typography variant="subtitle1" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1, mb: 3, color: userThemeColor }}>
              <PaletteIcon sx={{ fontSize: 20 }} /> 🎨 Visual Theme & Colors
            </Typography>

            <Box sx={{ mb: 3 }}>
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
                onChange={(e) => {
                  setThemeColor(e.target.value);
                }}
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

        {/* 3. Audio & Animation Presets Column */}
        <Grid size={{ xs: 12, md: 4 }}>
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
            <Typography variant="subtitle1" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1, mb: 3, color: userThemeColor }}>
              <MusicNoteIcon sx={{ fontSize: 20 }} /> 🎵 Audio & Animation Settings
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
                <MenuItem value="custom">Custom Sound URL 🔗</MenuItem>
              </Select>
            </FormControl>

            {alertSoundPreset === "custom" && (
              <TextField
                size="small"
                fullWidth
                label="Custom Sound Audio URL"
                placeholder="https://example.com/sound.mp3"
                value={alertSoundUrl}
                onChange={(e) => setAlertSoundUrl(e.target.value)}
                sx={{
                  mb: 2,
                  "& .MuiInputLabel-root.Mui-focused": { color: userThemeColor },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&.Mui-focused fieldset": { borderColor: userThemeColor }
                  }
                }}
              />
            )}

            <Box sx={{ display: "flex", gap: 2, mb: 3.5, alignItems: "center" }}>
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
                startIcon={<VolumeUpIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: "10px",
                  borderColor: `${userThemeColor}44`,
                  color: userThemeColor,
                  textTransform: "none",
                  fontSize: "0.75rem",
                  fontWeight: 700,
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

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="gif-preset-label" sx={{ "&.Mui-focused": { color: userThemeColor } }}>Alert Animation Preset</InputLabel>
              <Select
                labelId="gif-preset-label"
                label="Alert Animation Preset"
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
                  "& .MuiInputLabel-root.Mui-focused": { color: userThemeColor },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&.Mui-focused fieldset": { borderColor: userThemeColor }
                  }
                }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}
