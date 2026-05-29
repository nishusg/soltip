// ============================================================================
// OBS Overlay Integration Page — ObsOverlayPage.tsx
// ============================================================================
//
// A dedicated marketing and technical setup landing page for the OBS
// browser source overlay. Optimized with target keywords to capture streamer search
// traffic.
// ============================================================================

import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { 
  Container, 
  Grid,
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  useTheme, 
  useMediaQuery, 
  Stack, 
  Paper,
  Chip
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TvIcon from "@mui/icons-material/Tv";
import SettingsIcon from "@mui/icons-material/Settings";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import SEO from "../components/common/SEO";
import { SITE_NAME, SITE_URL } from "../shared/constants";



// Define the alert styles for the previewer sandbox
type AlertTheme = "standard" | "gold" | "neon" | "midnight";

interface MockAlert {
  theme: AlertTheme;
  title: string;
  subtitle: string;
  message: string;
  amount: string;
  badge: string;
  borderColor: string;
  bgGradient: string;
  glowColor: string;
}

export default function ObsOverlayPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeTheme, setActiveTheme] = useState<AlertTheme>("standard");
  const [isAlertFired, setIsAlertFired] = useState<boolean>(false);
  const [alertKey, setAlertKey] = useState<number>(0); // Used to force-reset animations

  // Mock Alert details depending on style selected
  const alertPresets: Record<AlertTheme, MockAlert> = {
    standard: {
      theme: "standard",
      title: "0.50 SOL TIP!",
      subtitle: "SolanaTrader200 supported the broadcast",
      message: "This superchat overlay is blazing fast! Settle payments instantly! 🚀",
      amount: "0.50 SOL",
      badge: "Standard alert",
      borderColor: "#38BDF8",
      bgGradient: "rgba(11, 15, 23, 0.95)",
      glowColor: "rgba(56, 189, 248, 0.4)",
    },
    gold: {
      theme: "gold",
      title: "5.00 SOL GOLD DONATION!",
      subtitle: "GoldSupporter77 premium alert unlocked",
      message: "Absolute masterclass. Gold alerts have text-to-speech enabled automatically!",
      amount: "5.00 SOL",
      badge: "✨ Gold Sub",
      borderColor: "#FFD700",
      bgGradient: "linear-gradient(135deg, rgba(15, 12, 0, 0.98) 0%, rgba(35, 28, 5, 0.98) 100%)",
      glowColor: "rgba(255, 215, 0, 0.5)",
    },
    neon: {
      theme: "neon",
      title: "1.25 SOL NEON SHOCK!",
      subtitle: "CyberpunkGamer supported the stream",
      message: "This neon design goes hard! The perfect Twitch crypto donation style.",
      amount: "1.25 SOL",
      badge: "⚡ Neon Core",
      borderColor: "#818CF8",
      bgGradient: "rgba(10, 10, 18, 0.95)",
      glowColor: "rgba(129, 140, 248, 0.6)",
    },
    midnight: {
      theme: "midnight",
      title: "10.00 SOL MYSTICAL TIP!",
      subtitle: "DeepSpaceWhale triggered deep obsidian alert",
      message: "The ultimate midnight theme for premium dark mode broadcasts.",
      amount: "10.00 SOL",
      badge: "🌌 Deep Void",
      borderColor: "#a855f7",
      bgGradient: "linear-gradient(135deg, rgba(5, 0, 15, 0.98) 0%, rgba(15, 5, 30, 0.98) 100%)",
      glowColor: "rgba(168, 85, 247, 0.5)",
    }
  };

  const currentAlert = alertPresets[activeTheme];

  const handleFireAlert = (themeName: AlertTheme) => {
    setActiveTheme(themeName);
    setIsAlertFired(false);
    // Use a small timeout to force a complete re-mount/reset of the DOM element and trigger the CSS keyframes
    setTimeout(() => {
      setAlertKey(prev => prev + 1);
      setIsAlertFired(true);
    }, 50);
  };

  // Auto-fire standard alert on page load to wow the user immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFireAlert("standard");
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", overflow: "hidden", pb: 10 }}>
      {/* Custom Styles Injection for smooth, high-fidelity mock streaming alert animation preview */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInBounce {
          0% { opacity: 0; transform: translate(-50%, 40px) scale(0.9); }
          50% { opacity: 1; transform: translate(-50%, -10px) scale(1.02); }
          75% { transform: translate(-50%, 2px) scale(0.99); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }

        @keyframes soundWaves {
          0% { height: 10px; }
          50% { height: 28px; }
          100% { height: 10px; }
        }

        .alert-pulse-container {
          animation: slideInBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .soundbar-1 { animation: soundWaves 0.5s ease infinite alternate; }
        .soundbar-2 { animation: soundWaves 0.4s ease infinite alternate 0.1s; }
        .soundbar-3 { animation: soundWaves 0.6s ease infinite alternate 0.2s; }
        .soundbar-4 { animation: soundWaves 0.3s ease infinite alternate 0.15s; }
        .soundbar-5 { animation: soundWaves 0.5s ease infinite alternate 0.05s; }
      ` }} />

      {/* SEO Metadata Tags */}
      <SEO 
        title="OBS Overlay Integration — Setup Twitch & OBS Crypto Alerts" 
        description={`Configure your OBS superchat overlay with ${SITE_NAME}. Full guide for Twitch crypto donations OBS, transparency settings, Streamlabs support, and Solana stream alerts.`}
        faqs={[
          {
            q: "What are OBS crypto alerts and how fast do they display?",
            a: `OBS crypto alerts are live graphic and audio stream notifications triggered when a supporter sends cryptocurrency (like SOL) directly to your wallet. ${SITE_NAME}’s WebSocket gateway monitors the Solana blockchain in real-time, displaying alert updates on your Twitch stream in under 300 milliseconds.`
          },
          {
            q: "Do I need to chroma key my OBS superchat overlay to make it transparent?",
            a: "No! Our OBS superchat overlay outputs clean HTML rendering with a 0% alpha background. OBS Studio and Streamlabs automatically read this transparent layer natively. You do not need to apply green-screen or chroma key filters to make it float perfectly above your gaming layout."
          },
          {
            q: `How do I connect Twitch crypto donations in OBS with ${SITE_NAME}?`,
            a: `Accepting Twitch crypto donations OBS alerts is incredibly simple. Connect your Solana browser wallet (like Phantom or Solflare) to ${SITE_NAME}, copy your custom tip link, and add it to your Twitch panels or chat bots (like Nightbot or Streamlabs Cloudbot). Then, add the secret overlay URL as a browser source inside OBS Studio. When viewers click your link and send a tip, the overlay alerts automatically fire.`
          },
          {
            q: "Can I configure custom audios for different Solana stream alerts?",
            a: `Absolutely! Inside your creator dashboard, you can fully configure different alert sounds, customized alert GIF graphics, custom CSS, custom volumes, and sound settings that automatically update your Solana stream alerts overlay without needing to adjust the OBS browser source settings.`
          }
        ]}
      />


      {/* Background radial ambient lights */}
      <Box 
        sx={{ 
          position: "absolute", top: "10%", right: "-10%", width: "45%", height: "45%", 
          background: `radial-gradient(circle, ${theme.palette.secondary.main}12 0%, transparent 75%)`, 
          zIndex: -1, filter: "blur(100px)" 
        }} 
      />
      <Box 
        sx={{ 
          position: "absolute", bottom: "10%", left: "-15%", width: "45%", height: "45%", 
          background: `radial-gradient(circle, ${theme.palette.primary.main}12 0%, transparent 75%)`, 
          zIndex: -1, filter: "blur(100px)" 
        }} 
      />

      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
        
        {/* Header Block */}
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 10 } }}>
          <Typography 
            variant="overline" 
            sx={{ 
              fontWeight: 900, 
              letterSpacing: "0.25em", 
              color: "secondary.main",
              fontFamily: "Space Mono, monospace",
              textTransform: "uppercase",
              bgcolor: `${theme.palette.secondary.main}0d`,
              border: `1px solid ${theme.palette.secondary.main}22`,
              px: 3,
              py: 1,
              borderRadius: "20px",
              display: "inline-block",
              mb: 3
            }}
          >
            Broadcast Setup Panel
          </Typography>

          <Typography 
            variant={isMobile ? "h3" : "h2"} 
            sx={{ 
              fontWeight: 900, 
              letterSpacing: "-0.03em", 
              mb: 3,
              background: "linear-gradient(135deg, #fff 0%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            OBS Overlay Integration
          </Typography>

          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: "780px", mx: "auto", fontWeight: 400, lineHeight: 1.6 }}
          >
            Attract more support and elevate your stream production. Set up customized <strong>OBS crypto alerts</strong> and let your audience trigger real-time <strong>Solana stream alerts</strong> directly on your Twitch or YouTube broadcast.
          </Typography>
        </Box>

        {/* Live Interactive Sandbox Previewer */}
        <Grid container spacing={4} sx={{ mb: 12 }}>
          
          {/* Controls Panel Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card 
              sx={{ 
                height: "100%", 
                p: 3, 
                bgcolor: "rgba(255,255,255,0.02)", 
                border: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                  <OndemandVideoIcon sx={{ color: "primary.main" }} /> Alert Sandbox
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                  Click a style below to trigger a live animation preview over our mock broadcast screen. Our alerts render with sub-second speeds.
                </Typography>

                <Stack spacing={2} sx={{ mb: 4 }}>
                  {/* Trigger Standard */}
                  <Button
                    variant="outlined"
                    onClick={() => handleFireAlert("standard")}
                    sx={{
                      py: 1.8,
                      borderRadius: "14px",
                      fontWeight: 800,
                      justifyContent: "space-between",
                      borderColor: activeTheme === "standard" ? "primary.main" : "rgba(255,255,255,0.08)",
                      bgcolor: activeTheme === "standard" ? "rgba(56, 189, 248, 0.05)" : "transparent",
                      color: activeTheme === "standard" ? "primary.main" : "text.secondary",
                      "&:hover": { borderColor: "primary.main", bgcolor: "rgba(56, 189, 248, 0.05)" }
                    }}
                     
                  >
                    Standard Sky Blue
                  </Button>

                  {/* Trigger Gold */}
                  <Button
                    variant="outlined"
                    onClick={() => handleFireAlert("gold")}
                    sx={{
                      py: 1.8,
                      borderRadius: "14px",
                      fontWeight: 800,
                      justifyContent: "space-between",
                      borderColor: activeTheme === "gold" ? "#FFD700" : "rgba(255,255,255,0.08)",
                      bgcolor: activeTheme === "gold" ? "rgba(255, 215, 0, 0.05)" : "transparent",
                      color: activeTheme === "gold" ? "#FFD700" : "text.secondary",
                      "&:hover": { borderColor: "#FFD700", bgcolor: "rgba(255, 215, 0, 0.05)" }
                    }}
                     
                  >
                    Premium Gold Edition
                  </Button>

                  {/* Trigger Neon */}
                  <Button
                    variant="outlined"
                    onClick={() => handleFireAlert("neon")}
                    sx={{
                      py: 1.8,
                      borderRadius: "14px",
                      fontWeight: 800,
                      justifyContent: "space-between",
                      borderColor: activeTheme === "neon" ? "secondary.main" : "rgba(255,255,255,0.08)",
                      bgcolor: activeTheme === "neon" ? "rgba(129, 140, 248, 0.05)" : "transparent",
                      color: activeTheme === "neon" ? "secondary.main" : "text.secondary",
                      "&:hover": { borderColor: "secondary.main", bgcolor: "rgba(129, 140, 248, 0.05)" }
                    }}
                     
                  >
                    Neon Shock Cyber
                  </Button>

                  {/* Trigger Midnight */}
                  <Button
                    variant="outlined"
                    onClick={() => handleFireAlert("midnight")}
                    sx={{
                      py: 1.8,
                      borderRadius: "14px",
                      fontWeight: 800,
                      justifyContent: "space-between",
                      borderColor: activeTheme === "midnight" ? "#a855f7" : "rgba(255,255,255,0.08)",
                      bgcolor: activeTheme === "midnight" ? "rgba(168, 85, 247, 0.05)" : "transparent",
                      color: activeTheme === "midnight" ? "#a855f7" : "text.secondary",
                      "&:hover": { borderColor: "#a855f7", bgcolor: "rgba(168, 85, 247, 0.05)" }
                    }}
                     
                  >
                    Midnight Void Glow
                  </Button>
                </Stack>
              </CardContent>
              <Button 
                variant="contained" 
                component={RouterLink}
                to="/dashboard"
                sx={{ py: 1.5, borderRadius: "12px", fontWeight: 800 }}
              >
                Go to Dashboard
              </Button>
            </Card>
          </Grid>

          {/* Interactive Screen Display Column */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              sx={{
                height: 480,
                bgcolor: "#030406",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px",
                overflow: "hidden",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 25px 60px rgba(0,0,0,0.7)"
              }}
            >
              {/* Simulated Gaming / Streaming Backdrop Background */}
              <Box 
                sx={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: "radial-gradient(circle at 10% 20%, rgba(88, 30, 200, 0.2) 0%, transparent 60%), radial-gradient(circle at 90% 80%, rgba(30, 160, 255, 0.15) 0%, transparent 60%)",
                  zIndex: 0
                }}
              />
              <Box 
                sx={{
                  position: "absolute",
                  bottom: 20,
                  right: 20,
                  p: 1.5,
                  bgcolor: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "error.main", animation: "pulse 1.5s infinite" }} />
                <Typography variant="caption" sx={{ color: "#fff", fontWeight: 800, fontFamily: "Space Mono" }}>LIVE BROADCAST</Typography>
              </Box>

              {/* Renders simulated overlay alert preview dynamically with bounce animations */}
              {isAlertFired && (
                <Box
                  key={alertKey}
                  className="alert-pulse-container"
                  sx={{
                    position: "absolute",
                    top: "15%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: { xs: "90%", sm: "80%", md: "70%" },
                    maxWidth: 440,
                    p: 3,
                    borderRadius: "20px",
                    bgcolor: currentAlert.bgGradient,
                    border: `2px solid ${currentAlert.borderColor}`,
                    boxShadow: `0 0 30px ${currentAlert.glowColor}, 0 20px 40px rgba(0,0,0,0.7)`,
                    zIndex: 2,
                    textAlign: "center"
                  }}
                >
                  {/* Glowing Soundwave bars animation for audio alert preview */}
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 0.5, height: 28, mb: 1.5 }}>
                    <Box sx={{ width: 3, bgcolor: currentAlert.borderColor, borderRadius: "2px" }} className="soundbar-1" />
                    <Box sx={{ width: 3, bgcolor: currentAlert.borderColor, borderRadius: "2px" }} className="soundbar-2" />
                    <Box sx={{ width: 3, bgcolor: currentAlert.borderColor, borderRadius: "2px" }} className="soundbar-3" />
                    <Box sx={{ width: 3, bgcolor: currentAlert.borderColor, borderRadius: "2px" }} className="soundbar-4" />
                    <Box sx={{ width: 3, bgcolor: currentAlert.borderColor, borderRadius: "2px" }} className="soundbar-5" />
                  </Box>

                  <Chip 
                    label={currentAlert.badge} 
                    size="small" 
                    sx={{ 
                      mb: 1.5, 
                      bgcolor: `${currentAlert.borderColor}1a`, 
                      color: currentAlert.borderColor, 
                      border: `1px solid ${currentAlert.borderColor}33`,
                      fontWeight: 800,
                      fontSize: "0.68rem",
                      textTransform: "uppercase"
                    }} 
                  />
                  <Typography variant="h6" sx={{ fontWeight: 950, color: currentAlert.borderColor, letterSpacing: "-0.01em", mb: 0.8 }}>
                    {currentAlert.title}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: "#fff", fontWeight: 800, mb: 1.5, opacity: 0.9 }}>
                    {currentAlert.subtitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontStyle: "italic", p: 2, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    "{currentAlert.message}"
                  </Typography>
                </Box>
              )}

              {/* Inactive state help banner */}
              {!isAlertFired && (
                <Typography color="text.secondary" sx={{ zIndex: 1, fontWeight: 700 }}>
                  Click an alert style to test...
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Integration Specs Section */}
        <Box sx={{ mb: 12 }}>
          <Grid container spacing={4}>
            {/* Transparency Feature Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 4.5, height: "100%", bgcolor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: "rgba(20, 241, 149, 0.1)", color: "#14F195", display: "flex", alignItems: "center", justifyContent: "center", mb: 3.5 }}>
                  <CheckCircleIcon />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                  Native Alpha Transparency
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>
                  Forget traditional chroma-keying green screens or tedious filters. {SITE_NAME}’s <strong>OBS superchat overlay</strong> outputs clean alpha channel layers with 100% transparent backgrounds directly.

                </Typography>
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 0.5 }}>
                  ✔ No green background removal required. Float alerts anywhere.
                </Typography>
              </Card>
            </Grid>

            {/* Compatibility Specifications */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 4.5, height: "100%", bgcolor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: "rgba(56, 189, 248, 0.1)", color: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", mb: 3.5 }}>
                  <SettingsIcon />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                  Streamlabs & Broadcaster Compatibility
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>
                  Our WebSocket framework complies fully with modern streaming software. Add your unique tipping overlay seamlessly as a Browser Source inside <strong>OBS Studio</strong>, <strong>Streamlabs Desktop</strong>, <strong>StreamElements</strong>, or <strong>XSplit</strong>.
                </Typography>
                <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 0.5 }}>
                  ✔ Configures instantly with standard browser source adapters.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Step-by-Step Setup Guide */}
        <Box sx={{ mb: 12 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 900, 
              textAlign: "center", 
              mb: 6,
              background: "linear-gradient(135deg, #fff 0%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            How to Set Up Your Overlay Source URL
          </Typography>

          <Grid container spacing={4}>
            {/* Step 1 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 4, height: "100%", bgcolor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", position: "relative" }}>
                <Typography variant="h1" sx={{ position: "absolute", top: 10, right: 20, fontWeight: 950, fontSize: "4.5rem", opacity: 0.04, color: "#fff", fontFamily: "Space Mono" }}>
                  01
                </Typography>
                <Typography variant="subtitle2" sx={{ fontFamily: "Space Mono", color: "primary.main", mb: 1, fontWeight: 700 }}>
                  [ STEP ONE ]
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Generate Overlay Key
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Log in with your Solana wallet. Navigate to your <strong>Dashboard</strong>, and click "Generate Overlay Token". This generates your private WebSocket credential URL.
                </Typography>
              </Paper>
            </Grid>

            {/* Step 2 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 4, height: "100%", bgcolor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", position: "relative" }}>
                <Typography variant="h1" sx={{ position: "absolute", top: 10, right: 20, fontWeight: 950, fontSize: "4.5rem", opacity: 0.04, color: "#fff", fontFamily: "Space Mono" }}>
                  02
                </Typography>
                <Typography variant="subtitle2" sx={{ fontFamily: "Space Mono", color: "primary.main", mb: 1, fontWeight: 700 }}>
                  [ STEP TWO ]
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Add OBS Browser Source
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Open OBS Studio. Under <strong>Sources</strong>, click the <strong>+</strong> icon, select <strong>Browser</strong>, name it `{SITE_NAME} Alerts`, and click OK.

                </Typography>
              </Paper>
            </Grid>

            {/* Step 3 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 4, height: "100%", bgcolor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", position: "relative" }}>
                <Typography variant="h1" sx={{ position: "absolute", top: 10, right: 20, fontWeight: 950, fontSize: "4.5rem", opacity: 0.04, color: "#fff", fontFamily: "Space Mono" }}>
                  03
                </Typography>
                <Typography variant="subtitle2" sx={{ fontFamily: "Space Mono", color: "primary.main", mb: 1, fontWeight: 700 }}>
                  [ STEP THREE ]
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Configure Size & Bounds
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Paste the secret URL. Configure the dimensions: **Width** to `1920` and **Height** to `1080`. Toggle "Control audio via OBS" and click OK. You are now live!
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Dynamic Parameter Guide */}
        <Box sx={{ mb: 12 }}>
          <Card sx={{ p: { xs: 4, md: 5 }, bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px" }}>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
              Custom URL Configuration Parameters
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
              You can append standard query options to customize alert responses instantly without reloading or changing dashboard files.
            </Typography>
            
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: "rgba(0,0,0,0.3)", 
                borderRadius: "12px", 
                fontFamily: "Space Mono, monospace", 
                fontSize: "0.8rem", 
                color: "primary.main",
                border: "1px solid rgba(255,255,255,0.06)",
                wordBreak: "break-all",
                mb: 4
              }}
            >
              {`${typeof window !== "undefined" ? window.location.origin : SITE_URL}/overlay/YOUR_WALLET_ADDRESS#key=YOUR_SECRET_TOKEN&sound=true&tts=true`}
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <VolumeUpIcon sx={{ color: "primary.main" }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>&sound=true | false</Typography>
                    <Typography variant="caption" color="text.secondary">Toggles audio alert play. If false, alerts will pop up silently.</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <TvIcon sx={{ color: "secondary.main" }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>&tts=true | false</Typography>
                    <Typography variant="caption" color="text.secondary">Enables text-to-speech engine to read donor messages aloud.</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Box>

        {/* SEO FAQ Section */}
        <Box sx={{ maxWidth: "800px", mx: "auto", mb: 10 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 900, 
              textAlign: "center", 
              mb: 5,
              background: "linear-gradient(135deg, #fff 0%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Frequently Asked Questions
          </Typography>

          <Stack spacing={2}>
            {/* FAQ 1 */}
            <Accordion sx={{ bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px !important", "&::before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "secondary.main" }} />} sx={{ py: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  What are OBS crypto alerts and how fast do they display?
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  <strong>OBS crypto alerts</strong> are live graphic and audio stream notifications triggered when a supporter sends cryptocurrency (like SOL) directly to your wallet. {SITE_NAME}’s WebSocket gateway monitors the Solana blockchain in real-time, displaying alert updates on your Twitch stream in under 300 milliseconds.
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* FAQ 2 */}
            <Accordion sx={{ bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px !important", "&::before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "secondary.main" }} />} sx={{ py: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Do I need to chroma key my OBS superchat overlay to make it transparent?
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  No! Our <strong>OBS superchat overlay</strong> outputs clean HTML rendering with a 0% alpha background. OBS Studio and Streamlabs automatically read this transparent layer natively. You do not need to apply green-screen or chroma key filters to make it float perfectly above your gaming layout.
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* FAQ 3 */}
            <Accordion sx={{ bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px !important", "&::before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "secondary.main" }} />} sx={{ py: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  How do I connect Twitch crypto donations in OBS with {SITE_NAME}?
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Accepting <strong>Twitch crypto donations OBS</strong> alerts is incredibly simple. Connect your Solana browser wallet (like Phantom or Solflare) to {SITE_NAME}, copy your custom tip link, and add it to your Twitch panels or chat bots (like Nightbot or Streamlabs Cloudbot). Then, add the secret overlay URL as a browser source inside OBS Studio. When viewers click your link and send a tip, the overlay alerts automatically fire.
                </Typography>
              </AccordionDetails>
            </Accordion>


            {/* FAQ 4 */}
            <Accordion sx={{ bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px !important", "&::before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "secondary.main" }} />} sx={{ py: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Can I configure custom audios for different Solana stream alerts?
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Absolutely! Inside your creator dashboard, you can fully configure different alert sounds, customized alert GIF graphics, custom CSS, custom volumes, and sound settings that automatically update your <strong>Solana stream alerts</strong> overlay without needing to adjust the OBS browser source settings.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Box>

        {/* Final CTA Card */}
        <Card 
          sx={{ 
            p: { xs: 5, md: 8 }, 
            bgcolor: "rgba(255,255,255,0.02)", 
            border: (theme: any) => `1px solid ${theme.palette.secondary.main}33`, 
            borderRadius: "32px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: (theme: any) => `0 20px 60px ${theme.palette.secondary.main}08`
          }}
        >
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 50% 50%, ${theme.palette.secondary.main}0a 0%, transparent 60%)`, pointerEvents: "none" }} />
          
          <CardContent sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
              Level Up Your Stream alerts with {SITE_NAME} Overlay

            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxW: 600, mx: "auto", mb: 5, lineHeight: 1.6 }}>
              Set up live high-speed blockchain alerts in OBS in under 3 minutes. Accept instant non-custodial tips with absolute transparency support.
            </Typography>
            
            <Stack 
              direction={{ xs: "column", sm: "row" }} 
              spacing={2} 
              sx={{ justifyContent: "center", alignItems: "stretch" }}
            >
              <Button 
                component={RouterLink}
                to="/"
                variant="contained" 
                size="large"
                 
                sx={{ px: 5, py: 1.8, borderRadius: "14px", fontWeight: 800 }}
              >
                Go to Home
              </Button>
              <Button 
                component={RouterLink}
                to="/dashboard"
                variant="outlined" 
                size="large"
                sx={{ px: 5, py: 1.8, borderRadius: "14px", fontWeight: 800 }}
              >
                Go to Dashboard
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
