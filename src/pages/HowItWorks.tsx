// ============================================================================
// How It Works Page — HowItWorks.tsx
// ============================================================================
//
// An interactive, premium landing page designed to explain the stream
// tipping ecosystem while boosting SEO authority using highly curated content
// and metadata.
// ============================================================================

import { useState } from "react";
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
  Divider
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BoltIcon from "@mui/icons-material/Bolt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SendIcon from "@mui/icons-material/Send";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import TvIcon from "@mui/icons-material/Tv";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StarIcon from "@mui/icons-material/Star";
import SEO from "../components/common/SEO";
import { SITE_NAME, SITE_URL, PLATFORM_FEE_PCT } from "../shared/constants";



// Define the steps of the flow
interface FlowStep {
  label: string;
  shortDesc: string;
  icon: React.ReactNode;
  title: string;
  detailedDesc: string;
  tipText: string;
}

export default function HowItWorks() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeStep, setActiveStep] = useState<number>(0);

  // Dynamic platform fee percentage whole number
  const platformFeePct = PLATFORM_FEE_PCT.toString();
  const creatorSplitPct = 100 - PLATFORM_FEE_PCT;

  const steps: FlowStep[] = [
    {
      label: "Viewer",
      shortDesc: "Visits tipping page",
      icon: <StarIcon />,
      title: "1. Viewer Visits Tipping Page",
      detailedDesc: `Stream viewers land directly on your customized donation page using your unique ${SITE_NAME} address. The interface is optimized to showcase your custom branding, active community tier goals, and previous tips list in a premium monospace style.`,
      tipText: "No logins or accounts are required for viewers. They just access your custom URL link to start supporting.",
    },
    {
      label: "Connect Wallet",
      shortDesc: "Secure authentication",
      icon: <AccountBalanceWalletIcon />,
      title: "2. Secure Solana Wallet Connection",
      detailedDesc: `With a single click, viewers connect their web3 browser-based wallet (such as Phantom, Solflare, or Backpack). ${SITE_NAME} utilizes cryptographic web3 handshakes to authorize transactions instantly, preserving user privacy while securing payment lines.`,
      tipText: "Supports both desktop extension wallets and mobile wallet adapters with industry-grade security protocols.",
    },
    {
      label: "Send SOL Tip",
      shortDesc: "Custom donation details",
      icon: <SendIcon />,
      title: "3. Formulate Custom Tipping Superchat",
      detailedDesc: "The fan inputs their desired tipping amount in SOL, types out a custom message to be read live on stream, and selects unique audio-visual alert customizations (such as custom color patterns and dynamic sounds) to stand out.",
      tipText: "Fans can preview their stream alerts directly inside the tipping portal before signing the block transaction.",
    },
    {
      label: "Instant Settlement",
      shortDesc: "Peer-to-peer payout",
      icon: <FlashOnIcon />,
      title: "4. Peer-to-Peer Instant Settlement",
      detailedDesc: `Donation splits are processed on-chain straight from the viewer's wallet to your wallet. ${SITE_NAME} is fully non-custodial: we charge a minimal flat ${platformFeePct}% platform cut to support maintenance while ${creatorSplitPct}% is transferred directly, settling in under 2 seconds.`,
      tipText: "Your SOL donations are directly yours immediately. No weekly cycles, no platform holds, and no payout delay.",
    },
    {
      label: "OBS Alert",
      shortDesc: "Overlay visual popup",
      icon: <TvIcon />,
      title: "5. Real-Time OBS Overlay Stream Alert",
      detailedDesc: "In under 300 milliseconds, our lightning-fast WebSocket gateway communicates with your live stream overlay. The custom alert instantly pops up on your Twitch or YouTube broadcast complete with special animations, text-to-speech, and customized templates.",
      tipText: "Fully compatible with OBS Studio, Streamlabs, and XSplit. Simply import your browser source URL once.",
    }
  ];


  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", overflow: "hidden", pb: 10 }}>
      {/* Dynamic SEO Tags */}
      <SEO 
        title="How It Works — Streaming Crypto Tips Overlay Guide" 
        description={`Learn how ${SITE_NAME} connects viewers to creators using secure wallet based tipping, instant crypto donations for streamers, and customizable OBS stream tipping overlays.`}
        faqs={[
          {
            q: `What is ${SITE_NAME} and how does a solana superchat work?`,
            a: `${SITE_NAME} is a non-custodial crypto monetization gateway built explicitly for creators and broadcasters. A solana superchat is an on-stream donation alert backed by instant P2P blockchain transactions. When a viewer donates SOL, our web socket integration senses the cryptographic ledger update instantly and triggers an visual notification directly in the streamer's OBS stream.`
          },
          {
            q: "How does the platform fee compare to traditional portals?",
            a: `We charge a minimal flat ${platformFeePct}% platform fee to fund hostings, stream overlays, and high-speed websocket gateways. In comparison, traditional streaming portals take 30% to 50% commission cuts and hold your funds for weeks. On ${SITE_NAME}, ${creatorSplitPct}% of the tip splits directly to your personal wallet in under 2 seconds, offering high-speed payouts with maximum creator margins.`
          },
          {
            q: "What wallets are supported for wallet based tipping?",
            a: `We support all standard web3 Solana wallets including Phantom, Solflare, Backpack, and Ledger through the Solana Wallet Adapter. On mobile devices, ${SITE_NAME} interfaces seamlessly using Mobile Wallet Adapter (MWA) links, allowing viewers to securely sign transactions inside their local wallet app in one tap.`
          },
          {
            q: "How do I set up a stream tipping overlay inside OBS Studio?",
            a: "Setup is extremely simple! Connect your wallet, click on the Dashboard inside the navigation bar, and select 'Generate OBS Overlay Token'. Copy your unique secret URL, open OBS Studio, add a new 'Browser Source', paste the link, and configure the resolution to 1920x1080. You can now use the live 'Send Test Alert' button on your dashboard to test and verify animations and sounds immediately."
          }
        ]}
      />


      {/* Decorative Orbs */}
      <Box 
        sx={{ 
          position: "absolute", top: "15%", left: "-15%", width: "50%", height: "50%", 
          background: `radial-gradient(circle, ${theme.palette.primary.main}1a 0%, transparent 75%)`, 
          zIndex: -1, filter: "blur(120px)" 
        }} 
      />
      <Box 
        sx={{ 
          position: "absolute", bottom: "25%", right: "-15%", width: "50%", height: "50%", 
          background: `radial-gradient(circle, ${theme.palette.secondary.main}15 0%, transparent 75%)`, 
          zIndex: -1, filter: "blur(120px)" 
        }} 
      />

      {/* Hero Header Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 10 } }}>
          <Typography 
            variant="overline" 
            sx={{ 
              fontWeight: 900, 
              letterSpacing: "0.25em", 
              color: "primary.main",
              fontFamily: "Space Mono, monospace",
              textTransform: "uppercase",
              bgcolor: `${theme.palette.primary.main}0a`,
              border: `1px solid ${theme.palette.primary.main}22`,
              px: 3,
              py: 1,
              borderRadius: "20px",
              display: "inline-block",
              boxShadow: `0 0 20px ${theme.palette.primary.main}0d`,
              mb: 3
            }}
          >
            Protocol Flow Spec
          </Typography>

          <Typography 
            variant={isMobile ? "h3" : "h2"} 
            sx={{ 
              fontWeight: 900, 
              letterSpacing: "-0.03em", 
              mb: 3,
              background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            How {SITE_NAME} Works

          </Typography>

          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: "750px", mx: "auto", fontWeight: 400, lineHeight: 1.6 }}
          >
            {SITE_NAME} bridges web3 decentralized ledger payments directly with stream overlays. 
            Discover how viewers send instant <strong>crypto donations for streamers</strong> using high-fidelity blockchain transactions.

          </Typography>
        </Box>

        {/* 5-Step Interactive Stepper Pipeline */}
        <Box sx={{ mb: 10 }}>
          {/* Horizontal stepper line (only on desktop) */}
          {!isMobile && (
            <Box 
              sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                position: "relative",
                mb: 6,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "22px",
                  left: "5%",
                  width: "90%",
                  height: "2px",
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}1a 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main}1a 100%)`,
                  zIndex: 0
                }
              }}
            >
              {steps.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <Box 
                    key={idx} 
                    onClick={() => setActiveStep(idx)}
                    sx={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center", 
                      position: "relative", 
                      zIndex: 1, 
                      width: "16%",
                      cursor: "pointer"
                    }}
                  >
                    {/* Circle Icon Indicator */}
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: "14px",
                        bgcolor: isActive ? "primary.main" : "rgba(15, 20, 30, 0.9)",
                        border: `1px solid ${isActive ? theme.palette.primary.main : "rgba(255,255,255,0.08)"}`,
                        color: isActive ? "#000" : "text.secondary",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: isActive ? `0 0 20px ${theme.palette.primary.main}80` : "none",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          borderColor: theme.palette.primary.main,
                          color: isActive ? "#000" : "#fff"
                        }
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 2, color: isActive ? "primary.main" : "#fff" }}>
                      {step.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center", mt: 0.5, px: 1, fontSize: "0.72rem" }}>
                      {step.shortDesc}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Vertical step list (only on mobile) */}
          {isMobile && (
            <Stack spacing={2} sx={{ mb: 4 }}>
              {steps.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <Box
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    sx={{
                      p: 2,
                      borderRadius: "16px",
                      bgcolor: isActive ? `${theme.palette.primary.main}0d` : "rgba(255,255,255,0.01)",
                      border: `1px solid ${isActive ? theme.palette.primary.main : "rgba(255,255,255,0.05)"}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      cursor: "pointer"
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        bgcolor: isActive ? "primary.main" : "rgba(255,255,255,0.03)",
                        color: isActive ? "#000" : "text.secondary",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isActive ? "primary.main" : "#fff" }}>
                        {step.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {step.shortDesc}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}

          {/* Detailed Visual Simulator Card */}
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {/* Description Block */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card 
                sx={{ 
                  height: "100%", 
                  p: 3, 
                  bgcolor: "rgba(255,255,255,0.02)", 
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 800, 
                      mb: 2.5, 
                      color: "primary.main",
                      fontFamily: "Space Grotesk, sans-serif" 
                    }}
                  >
                    {steps[activeStep].title}
                  </Typography>

                  <Typography variant="body1" sx={{ color: "text.secondary", mb: 4, lineHeight: 1.8 }}>
                    {steps[activeStep].detailedDesc}
                  </Typography>

                  <Divider sx={{ my: 3, opacity: 0.08 }} />

                  <Box 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: "12px", 
                      bgcolor: "rgba(56, 189, 248, 0.05)", 
                      border: `1px solid ${theme.palette.primary.main}22`,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2
                    }}
                  >
                    <CheckCircleIcon sx={{ color: "primary.main", mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#fff", mb: 0.5 }}>
                        Tip & Integration Advice
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                        {steps[activeStep].tipText}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Interactive Mock UI Simulator Preview Block */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper 
                sx={{ 
                  height: "100%", 
                  minHeight: 340,
                  bgcolor: "#06080C", 
                  borderRadius: "20px", 
                  border: "1px solid rgba(255,255,255,0.06)",
                  p: 4,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  boxShadow: "inset 0 0 40px rgba(0,0,0,0.8), 0 10px 40px rgba(0,0,0,0.5)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Tech grid lines overlay inside simulator */}
                <Box 
                  sx={{ 
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                    pointerEvents: "none"
                  }} 
                />

                {/* Step 1 Simulator: Viewer Profile Tipping Page */}
                {activeStep === 0 && (
                  <Box sx={{ position: "relative", zIndex: 1, animation: "fadeInUp 0.4s ease" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                      <Typography variant="caption" sx={{ fontFamily: "Space Mono, monospace", color: "rgba(255,255,255,0.4)" }}>
                        BROWSER // {SITE_URL.replace(/^https?:\/\//i, "").toUpperCase()}/MONETIZE
                      </Typography>

                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "error.main" }} />
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "warning.main" }} />
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main" }} />
                      </Box>
                    </Box>
                    <Box sx={{ p: 3, borderRadius: "16px", bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
                      <Box sx={{ width: 60, height: 60, borderRadius: "50%", bgcolor: "primary.main", mx: "auto", mb: 2, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 900 }}>
                        STREAM
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>SuperCreator Live</Typography>
                      <Typography variant="caption" sx={{ color: "success.main", display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: "rgba(16, 185, 129, 0.1)", px: 1.5, py: 0.5, borderRadius: "8px", fontWeight: 700, mb: 3 }}>
                        <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main", display: "inline-block" }} /> Verified Creator
                      </Typography>
                      
                      <Button variant="contained" size="small" fullWidth sx={{ borderRadius: "10px", py: 1.2 }}>
                        Support with Solana Tip
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Step 2 Simulator: Wallet Connect Modal */}
                {activeStep === 1 && (
                  <Box sx={{ position: "relative", zIndex: 1, animation: "fadeInUp 0.4s ease" }}>
                    <Typography variant="subtitle2" sx={{ fontFamily: "Space Mono, monospace", color: "primary.main", mb: 3, textAlign: "center" }}>
                      AUTHENTICATING WALLET ADAPTER...
                    </Typography>
                    <Box sx={{ p: 3, borderRadius: "16px", bgcolor: "rgba(11, 15, 23, 0.9)", border: "1px solid rgba(56, 189, 248, 0.2)", maxWidth: 320, mx: "auto", boxShadow: "0 15px 30px rgba(0,0,0,0.5)" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(128, 82, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8052FF" }}>
                          👻
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Phantom Wallet</Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>Connected on Mainnet</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "rgba(0,0,0,0.3)", mb: 2.5 }}>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", display: "block" }}>Public Key</Typography>
                        <Typography variant="caption" sx={{ fontFamily: "Space Mono, monospace", fontWeight: 700, color: "#fff" }}>
                          7xKa...nL9s (0.428 SOL)
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                        ✔ Secure Connection Active
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Step 3 Simulator: Tipping Form */}
                {activeStep === 2 && (
                  <Box sx={{ position: "relative", zIndex: 1, animation: "fadeInUp 0.4s ease" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Send Solana Superchat</Typography>
                      <Typography variant="caption" sx={{ color: "primary.main", fontFamily: "Space Mono, monospace", fontWeight: 700 }}>
                        FEE: 0.00 SOL
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Paper sx={{ p: 1.5, bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", flexGrow: 1, borderRadius: "10px" }}>
                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", display: "block" }}>Amount (SOL)</Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, fontFamily: "Space Mono, monospace", color: "primary.main" }}>
                            0.25 SOL
                          </Typography>
                        </Paper>
                        <Paper sx={{ p: 1.5, bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", width: 120, borderRadius: "10px" }}>
                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", display: "block" }}>Username</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>CryptoFan42</Typography>
                        </Paper>
                      </Box>
                      <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }}>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", display: "block", mb: 0.5 }}>Superchat Alert Message</Typography>
                        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                          "Keep crushing it! Sending 0.25 SOL tips to the best Solana dev streamer!"
                        </Typography>
                      </Paper>
                      <Button variant="contained" disabled sx={{ bgcolor: "primary.main", color: "#000", py: 1.5, borderRadius: "10px", opacity: 0.9 }}>
                        ⚡ Broadcast Live Superchat Alert
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Step 4 Simulator: Direct P2P Payment Confirmation */}
                {activeStep === 3 && (
                  <Box sx={{ position: "relative", zIndex: 1, animation: "fadeInUp 0.4s ease", textAlign: "center" }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "rgba(20, 241, 149, 0.15)", border: "2px solid #14F195", color: "#14F195", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                      <FlashOnIcon fontSize="large" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, color: "#14F195" }}>
                      Direct P2P Succeeded!
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", maxW: 300, mx: "auto", mb: 3 }}>
                      Payment transferred instantly over the Solana Mainnet with complete cryptographic validation.
                    </Typography>
                    <Box sx={{ bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", p: 2, maxWidth: 360, mx: "auto", textAlign: "left" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>Tx Commissions</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: "#14F195" }}>0.00% (FREE)</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>Settlement Time</Typography>
                        <Typography variant="caption" sx={{ fontFamily: "Space Mono, monospace", fontWeight: 700 }}>1.48 seconds</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>Payout Method</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>Direct Wallet-To-Wallet</Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Step 5 Simulator: Stream Overlay Pop-up Alert */}
                {activeStep === 4 && (
                  <Box sx={{ position: "relative", zIndex: 1, animation: "fadeInUp 0.4s ease" }}>
                    <Typography variant="caption" sx={{ fontFamily: "Space Mono, monospace", color: "rgba(255,255,255,0.4)", display: "block", mb: 3, textAlign: "center" }}>
                      OBS BROWSER SOURCE PREVIEW (1920x1080)
                    </Typography>
                    <Box 
                      sx={{ 
                        p: 3, 
                        borderRadius: "20px", 
                        border: "2px solid #FFD700", 
                        bgcolor: "rgba(10, 10, 15, 0.95)",
                        boxShadow: "0 0 25px rgba(255, 215, 0, 0.35)", 
                        maxWidth: 380, 
                        mx: "auto",
                        textAlign: "center",
                        position: "relative"
                      }}
                    >
                      {/* Premium gold alert details */}
                      <Box sx={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", bgcolor: "#FFD700", color: "#000", px: 2, py: 0.4, borderRadius: "20px", fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        ✨ Premium Alert
                      </Box>
                      
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, mt: 1.5, mb: 1 }}>
                        <VolumeUpIcon sx={{ color: "#FFD700" }} />
                        <Typography variant="h6" sx={{ fontWeight: 900, color: "#FFD700" }}>
                          0.25 SOL TIP!
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#fff", mb: 1 }}>
                        CryptoFan42 supported the broadcast
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontStyle: "italic", bgcolor: "rgba(255,255,255,0.03)", p: 1.5, borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        "Keep crushing it! Sending 0.25 SOL tips to the best Solana dev streamer!"
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Benefits & Competitive Advantages Grid */}
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
            Why Streamers Choose {SITE_NAME}

          </Typography>

          <Grid container spacing={3.5}>
            {/* Direct P2P Payments */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ p: 4, height: "100%", bgcolor: "rgba(255,255,255,0.01)" }}>
                <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: "rgba(56, 189, 248, 0.1)", color: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
                  <AccountBalanceWalletIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                  100% Non-Custodial
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Experience secure, decentralized <strong>wallet based tipping</strong>. Donations go directly from viewer to streamer, bypassing platform holds, commissions, or settlement restrictions.
                </Typography>
              </Card>
            </Grid>

            {/* Instant Speed */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ p: 4, height: "100%", bgcolor: "rgba(255,255,255,0.01)" }}>
                <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: "rgba(20, 241, 149, 0.1)", color: "#14F195", display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
                  <BoltIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Sub-Second Alerts
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Our WebSocket connection instantly triggers your custom <strong>stream tipping overlay</strong> in under 300 milliseconds. Keep your broadcast engagement intact and responsive.
                </Typography>
              </Card>
            </Grid>

            {/* Premium Customization */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ p: 4, height: "100%", bgcolor: "rgba(255,255,255,0.01)" }}>
                <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: "rgba(165, 180, 252, 0.1)", color: "secondary.main", display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
                  <TvIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Rich Overlays & Sounds
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Customize your overlay animations, sound waves, color presets, and Text-to-Speech voices directly from the dashboard. Set up a truly bespoke <strong>solana superchat</strong> experience.
                </Typography>
              </Card>
            </Grid>
          </Grid>
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
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "primary.main" }} />} sx={{ py: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  What is {SITE_NAME} and how does a solana superchat work?
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {SITE_NAME} is a non-custodial crypto monetization gateway built explicitly for creators and broadcasters. A <strong>solana superchat</strong> is an on-stream donation alert backed by instant P2P blockchain transactions. When a viewer donates SOL, our web socket integration senses the cryptographic ledger update instantly and triggers an visual notification directly in the streamer's OBS stream.
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* FAQ 2 */}
            <Accordion sx={{ bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px !important", "&::before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "primary.main" }} />} sx={{ py: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  How does the platform fee compare to traditional portals?
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  We charge a minimal flat {platformFeePct}% platform fee to fund hostings, stream overlays, and high-speed websocket gateways. In comparison, traditional streaming portals take 30% to 50% commission cuts and hold your funds for weeks. On {SITE_NAME}, {creatorSplitPct}% of the tip splits directly to your personal wallet in under 2 seconds, offering high-speed payouts with maximum creator margins.
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* FAQ 3 */}
            <Accordion sx={{ bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px !important", "&::before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "primary.main" }} />} sx={{ py: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  What wallets are supported for wallet based tipping?
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  We support all standard web3 Solana wallets including Phantom, Solflare, Backpack, and Ledger through the Solana Wallet Adapter. On mobile devices, {SITE_NAME} interfaces seamlessly using Mobile Wallet Adapter (MWA) links, allowing viewers to securely sign transactions inside their local wallet app in one tap.
                </Typography>
              </AccordionDetails>
            </Accordion>


            {/* FAQ 4 */}
            <Accordion sx={{ bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px !important", "&::before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "primary.main" }} />} sx={{ py: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  How do I set up a stream tipping overlay inside OBS Studio?
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Setup is extremely simple! Connect your wallet, click on the **Dashboard** inside the navigation bar, and select "Generate OBS Overlay Token". Copy your unique secret URL, open OBS Studio, add a new "Browser Source", paste the link, and configure the resolution to 1920x1080. You can now use the live "Send Test Alert" button on your dashboard to test and verify animations and sounds immediately.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Box>

        {/* Final CTA Banner */}
        <Card 
          sx={{ 
            p: { xs: 5, md: 8 }, 
            bgcolor: "rgba(255,255,255,0.02)", 
            border: (theme: any) => `1px solid ${theme.palette.primary.main}33`, 
            borderRadius: "32px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: (theme: any) => `0 20px 60px ${theme.palette.primary.main}08`
          }}
        >
          {/* Inner mesh shine */}
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 50% 50%, ${theme.palette.primary.main}0a 0%, transparent 60%)`, pointerEvents: "none" }} />
          
          <CardContent sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
              Ready to Upgrade Your Live Stream Alerts?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxW: 600, mx: "auto", mb: 5, lineHeight: 1.6 }}>
              Set up your high-converting donation flow in under 2 minutes. Connect your Solana wallet, configure your stream overlays, and start receiving peer-to-peer tip settlements instantly.
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
                startIcon={<BoltIcon sx={{ color: "#000" }} />}
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
                Creator Dashboard
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
