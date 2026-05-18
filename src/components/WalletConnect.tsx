import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Card, CardContent, Button, Container, Grid, TextField, Divider, Chip, Paper } from "@mui/material";
import { useWalletAuth } from "../hooks/useWalletAuth";
import BoringAvatar from "boring-avatars";
import toast from "react-hot-toast";
import SEO from "./SEO";

// Material Icons
import FlashOnIcon from "@mui/icons-material/FlashOn";
import LockIcon from "@mui/icons-material/Lock";
import DiamondIcon from "@mui/icons-material/Diamond";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SpeedIcon from "@mui/icons-material/Speed";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LanguageIcon from "@mui/icons-material/Language";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MonitorIcon from "@mui/icons-material/Monitor";
import StarBorderIcon from "@mui/icons-material/StarBorder";

export default function WalletConnect() {
  const { isAuthenticated } = useWalletAuth();

  // Live Demo Interactive State
  const [demoName, setDemoName] = useState("DegenFan");
  const [demoAmount, setDemoAmount] = useState("0.5");
  const [demoMessage, setDemoMessage] = useState("LFG! Best stream on Solana! 🔥🚀");
  const [demoAlerts, setDemoAlerts] = useState<Array<{ name: string; amount: string; message: string; id: number }>>([]);
  const [demoAlertId, setDemoAlertId] = useState(0);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const triggerDemoAlert = () => {
    if (!demoName.trim() || !demoAmount.trim()) {
      toast.error("Please enter a name and SOL amount!");
      return;
    }
    const newAlert = {
      name: demoName,
      amount: demoAmount,
      message: demoMessage,
      id: demoAlertId
    };
    setDemoAlerts([newAlert]); // Keep only latest for screen display
    setDemoAlertId(prev => prev + 1);
    toast.success("Alert sent to virtual screen!", { icon: "🖥️" });
  };

  const faqs = [
    {
      q: "How do I get paid?",
      a: "Instantly and directly! SolChat uses fully non-custodial smart contracts and direct on-chain transactions. When a fan tips you, the SOL or USDC lands inside your Phantom or Solflare wallet within sub-seconds—no weekly holding periods, no processing delay."
    },
    {
      q: "What are the platform fees?",
      a: "SolChat operates with a clean, transparent flat 5% platform fee on all standard tips to support development and overlay hosting. We do not charge subscription fees for receiving tips. Instead, creators can purchase our Premium subscription to unlock aesthetic themes (Gold, Diamond, Neon, Midnight), advanced custom stream alert overlays, personalized sound widgets, and unique creator page enhancements."
    },
    {
      q: "Does this protect against Stripe chargebacks?",
      a: "Yes! Traditional stream tipping platforms suffer from card chargeback fraud where viewers claim refunds, leaving creators with heavy fees. Blockchain transactions on Solana are permanent, irreversible, and immutable—offering 100% protection."
    },
    {
      q: "Can fans tip without a cryptocurrency wallet?",
      a: "Yes! SolChat integrates standard Solana Web3 connectors, allowing viewers to tip instantly with browser-connected wallets or mobile dApps. We are also preparing fiat-to-crypto checkout gateways for traditional viewers."
    },
    {
      q: "How do I add the live alert overlay to OBS?",
      a: "Once authenticated, go to your Control Hub to grab your unique OBS Alert Box URL. Add it as a standard 'Browser Source' inside OBS or Streamlabs. Any tip received on your dynamic SEO profile page will play a premium animation instantly."
    }
  ];

  return (
    <Box sx={{ position: "relative", overflow: "hidden", pb: 12 }}>
      <SEO 
        title="Solana-Powered Creator Superchats & OBS stream alerts"
        description="The premier superchat, alerts, and tipping layer for Solana creators. Connect Phantom or Solflare, claim your public username, and set up dynamic OBS overlay triggers."
        faqs={faqs}
      />
      
      {/* Spinning Conic Orbs Backdrop */}
      <Box
        sx={{
          position: "absolute",
          top: "2%",
          left: "50%",
          transform: "translateX(-50%)",
          width: { xs: "350px", md: "800px" },
          height: { xs: "350px", md: "800px" },
          background: (theme) => `conic-gradient(from 0deg, ${theme.palette.secondary?.main || theme.palette.primary.main}22, ${theme.palette.primary.main}33, ${theme.palette.secondary?.main || theme.palette.primary.main}11)`,
          borderRadius: "50%",
          zIndex: -1,
          filter: "blur(100px)",
          animation: "spin 25s linear infinite",
          "@keyframes spin": {
            "0%": { transform: "translateX(-50%) rotate(0deg)" },
            "100%": { transform: "translateX(-50%) rotate(360deg)" }
          }
        }}
      />

      {/* Floating Network Speed Badge */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          left: 24,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: "rgba(10, 10, 15, 0.75)",
          border: (theme) => `1px solid ${theme.palette.primary.main}4d`,
          borderRadius: "50px",
          px: 2.5,
          py: 1.2,
          backdropFilter: "blur(20px)",
          zIndex: 1000,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "primary.main",
            animation: "pulseDot 2s infinite",
            "@keyframes pulseDot": {
              "0%": { boxShadow: (theme: any) => `0 0 0 0 ${theme.palette.primary.main}cc` },
              "70%": { boxShadow: (theme: any) => `0 0 0 10px ${theme.palette.primary.main}00` },
              "100%": { boxShadow: (theme: any) => `0 0 0 0 ${theme.palette.primary.main}00` }
            }
          }}
        />
        <Typography sx={{ fontFamily: "'Space Mono', monospace", fontSize: "0.8rem", color: "primary.light", fontWeight: 800 }}>
          65,000 TPS · Real-time alerts
        </Typography>
      </Box>

      {/* ================= HERO SECTION ================= */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 14 }, pb: 10, textAlign: "center" }}>
        <Chip
          label="🚀 Solana Tipping Protocol v2.5"
          color="primary"
          variant="outlined"
          sx={{ 
            fontWeight: 800, 
            px: 2, 
            py: 2.2, 
            mb: 4, 
            borderRadius: "50px", 
            fontSize: "0.85rem",
            bgcolor: "rgba(153, 69, 242, 0.08)",
            borderColor: "rgba(153, 69, 242, 0.3)"
          }}
        />
        
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.8rem", md: "5rem" },
            fontWeight: 950,
            mb: 3,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.65) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Instant Superchats for Streamers <br />
          <Box
            component="span"
            sx={{
              background: (theme) => `linear-gradient(90deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Powered by Solana
          </Box>
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            mb: 6,
            maxWidth: 800,
            mx: "auto",
            fontSize: { xs: "1rem", md: "1.18rem" },
            fontWeight: 400,
            lineHeight: 1.8
          }}
        >
          Power your broadcast with instant on-chain alerts, custom superchat widgets, and zero platform cuts. The premium Web3 tipping protocol constructed exclusively for Solana.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2.5, flexWrap: "wrap" }}>
          {isAuthenticated ? (
            <Button
              component={RouterLink}
              to="/dashboard"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 6,
                py: 2,
                borderRadius: "14px",
                fontWeight: 800,
                fontSize: "1.1rem",
                background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: (theme) => `0 8px 25px ${theme.palette.primary.main}4d`,
                "&:hover": { transform: "translateY(-2px)", boxShadow: (theme) => `0 12px 30px ${theme.palette.primary.main}66` }
              }}
            >
              Control Dashboard
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={() => document.querySelector<HTMLButtonElement>(".wallet-adapter-button")?.click()}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 6,
                py: 2,
                borderRadius: "14px",
                fontWeight: 800,
                fontSize: "1.1rem",
                background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: (theme) => `0 8px 25px ${theme.palette.primary.main}4d`,
                "&:hover": { transform: "translateY(-2px)", boxShadow: (theme) => `0 12px 30px ${theme.palette.primary.main}66` }
              }}
            >
              Connect Wallet
            </Button>
          )}
          <Button
            component={RouterLink}
            to="/how-it-works"
            variant="outlined"
            size="large"
            sx={{
              px: 5,
              py: 2,
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: "1.1rem",
              borderColor: "rgba(255,255,255,0.15)",
              color: "#fff",
              "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.04)" }
            }}
          >
            Learn Specs
          </Button>
        </Box>
      </Container>

      {/* ================= TRUSTED BY SECTION ================= */}
      <Box sx={{ py: 6, bgcolor: "rgba(255,255,255,0.01)", borderY: "1px solid rgba(255,255,255,0.04)", mb: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="subtitle2" sx={{ textAlign: "center", fontWeight: 800, color: "text.secondary", letterSpacing: "0.15em", textTransform: "uppercase", mb: 4 }}>
            ⚡ POWERING THE NEXT GENERATION OF STREAM CREATORS
          </Typography>
          <Grid container spacing={4} sx={{ justifyContent: "center", alignItems: "center" }}>
            {[
              { name: "Ninja", slug: "ninja", color: "#14F195" },
              { name: "Shroud", slug: "shroud", color: "#9945FF" },
              { name: "xQc", slug: "xqc", color: "#00E676" },
              { name: "Pokimane", slug: "poki", color: "#FF1744" },
              { name: "Asmongold", slug: "asmon", color: "#FFD700" }
            ].map((c) => (
              <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={c.name} sx={{ display: "flex", justifyContent: "center" }}>
                <Paper
                  elevation={0}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 3,
                    py: 1.5,
                    borderRadius: "12px",
                    bgcolor: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.05)",
                      borderColor: c.color,
                      transform: "translateY(-3px)",
                      boxShadow: `0 8px 20px ${c.color}1a`
                    }
                  }}
                >
                  <BoringAvatar name={c.name} variant="beam" size={26} colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]} />
                  <Typography sx={{ fontWeight: 850, fontSize: "0.92rem", color: "text.primary" }}>{c.name}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ================= HOW IT WORKS SECTION ================= */}
      <Container maxWidth="lg" sx={{ mb: 14 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>Three Steps To Tipping Freedom</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto", fontSize: "1.05rem" }}>
            Get fully integrated with OBS stream overlays and direct-to-wallet tips in less than five minutes.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              step: "01",
              title: "Link Web3 Identity",
              desc: "Securely link your Phantom or Solflare wallet. SolChat runs 100% passwordless and non-custodial for maximal safety.",
              icon: <AccountBalanceWalletIcon sx={{ fontSize: 30, color: "primary.light" }} />
            },
            {
              step: "02",
              title: "Claim Public Profile URL",
              desc: "Set a unique slug like solchat.app/ninja, hook up your socials, and grab your custom alert overlay URL for OBS Studio.",
              icon: <LanguageIcon sx={{ fontSize: 30, color: "secondary.main" }} />
            },
            {
              step: "03",
              title: "Receive Instant Tips",
              desc: "Fans tip SOL or USDC direct to your wallet. OBS stream alerts activate instantly with ultra-low Solana sub-second delays.",
              icon: <FlashOnIcon sx={{ fontSize: 30, color: "primary.main" }} />
            }
          ].map((item, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <Card sx={{ height: "100%", position: "relative", overflow: "visible" }}>
                <Box 
                  sx={{ 
                    position: "absolute", 
                    top: -15, 
                    right: 25, 
                    fontSize: "3.5rem", 
                    fontWeight: 950, 
                    color: "rgba(255,255,255,0.03)",
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}
                >
                  {item.step}
                </Box>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justify: "center", mb: 3, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <Box sx={{ mx: "auto" }}>{item.icon}</Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: "0.95rem" }}>
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ================= INTERACTIVE LIVE DEMO SECTION ================= */}
      <Container maxWidth="lg" sx={{ mb: 14 }}>
        <Grid container spacing={6} sx={{ alignItems: "center" }}>
          
          {/* Left Panel: Inputs */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ pr: { lg: 4 } }}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>Interactive Live Demo</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                See exactly how our high-speed tipping layer operates! Customize a mock superchat on the left, click <b>Trigger Alert</b>, and watch the OBS overlay panel update immediately on the virtual screen to the right.
              </Typography>

              <Card sx={{ p: 3, border: "1px solid rgba(255,255,255,0.05)", bgcolor: "rgba(255,255,255,0.01)" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>Sender Name</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={demoName}
                        onChange={(e) => setDemoName(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>Amount (SOL)</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={demoAmount}
                        onChange={(e) => setDemoAmount(e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>Superchat Message</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      value={demoMessage}
                      onChange={(e) => setDemoMessage(e.target.value)}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={triggerDemoAlert}
                    startIcon={<FlashOnIcon />}
                    sx={{
                      py: 1.5,
                      fontWeight: 800,
                      borderRadius: "10px",
                      background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`
                    }}
                  >
                    Trigger Alert
                  </Button>
                </Box>
              </Card>
            </Box>
          </Grid>

          {/* Right Panel: Virtual Screen Monitor */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box 
              sx={{ 
                position: "relative",
                borderRadius: "20px", 
                overflow: "hidden", 
                border: "6px solid #1e293b",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
                background: "#090d16",
                aspectRatio: "16/9",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 2
              }}
            >
              {/* Virtual Camera View (Background placeholder) */}
              <Box sx={{ position: "absolute", inset: 0, opacity: 0.15, background: "radial-gradient(circle, rgba(153,69,242,0.1) 0%, rgba(0,0,0,0) 80%)" }} />
              
              {/* Camera Indicator */}
              <Box sx={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, borderRadius: "50%", bgcolor: "#ef4444" }} />
              
              {/* OBS Overlay Alert Box Container */}
              <Box sx={{ zIndex: 2, width: "100%", display: "flex", justifyContent: "center" }}>
                {demoAlerts.length === 0 ? (
                  <Box sx={{ textAlign: "center", p: 4 }}>
                    <MonitorIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5, opacity: 0.3 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Virtual Stream Screen
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                      Alerts will populate here on trigger
                    </Typography>
                  </Box>
                ) : (
                  demoAlerts.map((alert) => (
                    <Box
                      key={alert.id}
                      sx={{
                        width: "85%",
                        animation: "alertSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
                        bgcolor: "rgba(10, 15, 28, 0.95)",
                        border: "2px solid #14F195",
                        borderRadius: "16px",
                        boxShadow: "0 0 30px rgba(20,241,149,0.3)",
                        p: 3,
                        textAlign: "center",
                        position: "relative",
                        "@keyframes alertSlideIn": {
                          "0%": { transform: "scale(0.8) translateY(30px)", opacity: 0 },
                          "100%": { transform: "scale(1) translateY(0)", opacity: 1 }
                        }
                      }}
                    >
                      {/* Glow Header */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
                        <Chip
                          icon={<FlashOnIcon sx={{ "&&": { color: "#000", fontSize: 14 } }} />}
                          label="NEW SUPERCHAT!"
                          size="small"
                          sx={{ bgcolor: "#14F195", color: "#000", fontWeight: 900, fontSize: "0.68rem" }}
                        />
                      </Box>

                      {/* Sender details */}
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
                        <span style={{ color: "#14F195" }}>{alert.name}</span> tipped{" "}
                        <span style={{ color: "#9945FF" }}>{alert.amount} SOL</span>
                      </Typography>

                      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />

                      {/* Message details */}
                      <Typography sx={{ fontStyle: "italic", fontSize: "0.95rem", color: "text.secondary" }}>
                        "{alert.message}"
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>

              {/* Status footer bar */}
              <Box sx={{ position: "absolute", bottom: 8, left: 12, right: 12, display: "flex", justify: "space-between", opacity: 0.5 }}>
                <Typography sx={{ fontSize: "0.65rem", fontFamily: "'Space Mono', monospace" }}>OBS SOURCE: ACTIVE</Typography>
                <Typography sx={{ fontSize: "0.65rem", fontFamily: "'Space Mono', monospace" }}>LATENCY: 0.18s</Typography>
              </Box>
            </Box>
          </Grid>

        </Grid>
      </Container>

      {/* ================= FEATURES GRID SECTION ================= */}
      <Container maxWidth="lg" sx={{ mb: 14 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>Protocol Capabilities</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto", fontSize: "1.05rem" }}>
            Explore the deep technical core features that make SolChat the premier tipping solution.
          </Typography>
        </Box>

        <Grid container spacing={3.5}>
          {[
            {
              title: "Sub-Second Alert Audits",
              desc: "Tipping triggers overlay updates instantly. Powered by Solana's lightning-fast block times.",
              icon: <SpeedIcon sx={{ color: "primary.light" }} />
            },
            {
              title: "100% Non-Custodial",
              desc: "Tips move peer-to-peer straight into your private wallet. Zero custody risks, zero hold-backs.",
              icon: <LockIcon sx={{ color: "secondary.main" }} />
            },
            {
              title: "Premium Skins & Styles",
              desc: "Switch public pages to Gold, Diamond, Midnight, or Neon skins instantly with custom CSS.",
              icon: <DiamondIcon sx={{ color: "primary.main" }} />
            },
            {
              title: "Chargeback Security Shield",
              desc: "On-chain settlements are permanent. Completely safe from fraudulent viewer bank refunds.",
              icon: <CheckCircleIcon sx={{ color: "primary.light" }} />
            },
            {
              title: "Dynamic Stream Embeds",
              desc: "Natively drop Twitch, Kick, and YouTube live player panels straight onto your public page.",
              icon: <YouTubeIcon sx={{ color: "secondary.main" }} />
            },
            {
              title: "Comprehensive Analytics",
              desc: "Follow daily volume, transaction explorer indices, and top donor leaderboards directly.",
              icon: <MonitorIcon sx={{ color: "primary.main" }} />
            }
          ].map((f, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
              <Card sx={{ height: "100%", transition: "transform 0.2s ease, border-color 0.2s ease", "&:hover": { transform: "translateY(-3px)", borderColor: "rgba(153,69,242,0.3)" } }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justify: "center", mb: 2.5, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <Box sx={{ mx: "auto" }}>{f.icon}</Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {f.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ================= OBS OVERLAY PREVIEW SECTION ================= */}
      <Container maxWidth="lg" sx={{ mb: 14 }}>
        <Paper 
          sx={{ 
            p: { xs: 4, md: 6 }, 
            borderRadius: "24px", 
            border: "1px solid rgba(153, 69, 242, 0.2)",
            background: "linear-gradient(135deg, rgba(20,241,149,0.02) 0%, rgba(153,69,242,0.04) 100%)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h3" sx={{ fontWeight: 950, mb: 2, letterSpacing: "-0.01em" }}>
                OBS Browser Overlay Integration
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                Add your unique alert link as a Browser Source inside OBS Studio, vMix, or Streamlabs. Customize typography, sliding animations, sound effects, and color themes in your control panel to map your overlay to your broadcast style.
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "primary.light" }}>&lt; 200ms</Typography>
                  <Typography variant="caption" color="text.secondary">Alert Trigger Latency</Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "primary.light" }}>100% Free</Typography>
                  <Typography variant="caption" color="text.secondary">Included in base account</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box 
                sx={{ 
                  bgcolor: "#00FF00", // Classic Green Screen OBS chroma key
                  borderRadius: "16px",
                  p: 3,
                  aspectRatio: "1.5/1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  position: "relative"
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: "rgba(10, 10, 15, 0.95)", 
                    borderRadius: "12px", 
                    p: 2.5, 
                    border: "2px solid #9945FF",
                    boxShadow: "0 4px 20px rgba(153,69,242,0.4)",
                    width: "90%",
                    textAlign: "center"
                  }}
                >
                  <Typography variant="caption" sx={{ color: "primary.light", fontWeight: 900, letterSpacing: "0.1em", display: "block", mb: 0.5 }}>
                    ✨ OBS SCREEN PREVIEW
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.95rem" }}>
                    <span style={{ color: "#14F195" }}>Shroud</span> donated <b>2.5 SOL</b>!
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic", mt: 0.5, display: "block" }}>
                    "Ready to stream on Solana!"
                  </Typography>
                </Box>
                <Box sx={{ position: "absolute", top: 10, right: 12, bgcolor: "rgba(0,0,0,0.6)", borderRadius: "4px", px: 1, py: 0.3 }}>
                  <Typography sx={{ color: "#00FF00", fontSize: "0.6rem", fontWeight: 800 }}>CHROMA KEY CHANNELS</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* ================= SUPPORTED PLATFORMS SECTION ================= */}
      <Container maxWidth="lg" sx={{ mb: 14 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>Supported Ecosystems</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto", fontSize: "1.05rem" }}>
            Display your stream player and links on your public SEO profiles cleanly.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {[
            { name: "YouTube Broadcasters", color: "#FF0000", desc: "Embed your live stream player or VOD videos natively.", icon: <YouTubeIcon sx={{ fontSize: 32 }} /> },
            { name: "Twitch Broadcasters", color: "#6441A5", desc: "Hook up Twitch player embed blocks with chat panels directly.", icon: <LanguageIcon sx={{ fontSize: 32 }} /> },
            { name: "Kick Broadcasters", color: "#53FC18", desc: "Integrate ultra-low delay Kick players on public profile cards.", icon: <MonitorIcon sx={{ fontSize: 32 }} /> },
            { name: "Discord Servers", color: "#5865F2", desc: "Host direct invitation links to steer your community directly.", icon: <LanguageIcon sx={{ fontSize: 32 }} /> }
          ].map((p, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  textAlign: "center", 
                  bgcolor: "rgba(255,255,255,0.01)", 
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "16px",
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: p.color,
                    boxShadow: `0 10px 25px ${p.color}15`,
                    bgcolor: "rgba(255,255,255,0.02)"
                  }
                }}
              >
                <Box sx={{ color: p.color, mb: 2.5 }}>{p.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: "1.02rem" }}>
                  {p.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {p.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ================= WHY SOLANA SECTION ================= */}
      <Container maxWidth="lg" sx={{ mb: 14 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>Why Solana Matters?</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto", fontSize: "1.05rem" }}>
            A comparative look: decentralized blockchain versus central payment processors.
          </Typography>
        </Box>

        <Paper sx={{ border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", borderRadius: "16px" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1.5fr 1fr 1fr", md: "2fr 1fr 1fr" }, bgcolor: "rgba(255,255,255,0.03)", p: 2.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <Typography sx={{ fontWeight: 800, color: "text.primary" }}>Specifications</Typography>
            <Typography sx={{ fontWeight: 800, color: "primary.light", textAlign: "center" }}>Solana Protocol</Typography>
            <Typography sx={{ fontWeight: 800, color: "text.secondary", textAlign: "center" }}>Stripe / Legacy Platforms</Typography>
          </Box>

          {[
            { spec: "Platform Commissions", solana: "0% - 5%", legacy: "30% + card margins" },
            { spec: "Payout Payout Delay", solana: "Instant (< 1s)", legacy: "7 - 14 Days" },
            { spec: "Custody Control", solana: "100% Non-Custodial", legacy: "Centralized Vaults" },
            { spec: "Chargeback Security", solana: "Complete Security (Finality)", legacy: "Heavy processor risks" }
          ].map((item, idx) => (
            <Box 
              key={idx} 
              sx={{ 
                display: "grid", 
                gridTemplateColumns: { xs: "1.5fr 1fr 1fr", md: "2fr 1fr 1fr" }, 
                p: 2.5, 
                borderBottom: idx !== 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
                bgcolor: idx % 2 === 1 ? "rgba(255,255,255,0.01)" : "transparent"
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>{item.spec}</Typography>
              <Typography sx={{ fontWeight: 850, color: "#14F195", textAlign: "center" }}>{item.solana}</Typography>
              <Typography sx={{ color: "text.secondary", textAlign: "center" }}>{item.legacy}</Typography>
            </Box>
          ))}
        </Paper>
      </Container>

      {/* ================= TESTIMONIALS SECTION ================= */}
      <Container maxWidth="lg" sx={{ mb: 14 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>Broadcaster Stories</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto", fontSize: "1.05rem" }}>
            Hear from streamers who migrated to SolChat's direct on-chain tipping channels.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              quote: "Since adopting SolChat, my superchat revenue grew by 35% because of no platform cuts! The sub-second alert updates have blown my Twitch viewer community away.",
              author: "TectonicDegen",
              role: "Broadcaster, Twitch Esports"
            },
            {
              quote: "Card payment chargeback trolls were once my biggest headache. On Solana, all payments are final. Non-custodial payouts mean the cash is in my wallet immediately.",
              author: "PioneerStreamer",
              role: "Broadcaster, Kick Live Gaming"
            },
            {
              quote: "Configuring it was exceptionally simple. I set my unique username slug, dropped the OBS green-screen link inside, and received SOL tips within five minutes.",
              author: "CryptoBroadcaster",
              role: "YouTube Streamer"
            }
          ].map((t, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <Card sx={{ height: "100%", bgcolor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", justify: "space-between", height: "100%" }}>
                  <Box>
                    <Box sx={{ display: "flex", gap: 0.5, mb: 2.5 }}>
                      {[...Array(5)].map((_, i) => <StarIcon key={i} sx={{ color: "#FFD700", fontSize: 16 }} />)}
                    </Box>
                    <Typography sx={{ fontStyle: "italic", color: "text.secondary", mb: 4, lineHeight: 1.7, fontSize: "0.95rem" }}>
                      "{t.quote}"
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <BoringAvatar name={t.author} variant="beam" size={40} colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]} />
                    <Box>
                      <Typography sx={{ fontWeight: 850, fontSize: "0.9rem" }}>{t.author}</Typography>
                      <Typography variant="caption" color="text.secondary">{t.role}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ================= FAQ SECTION ================= */}
      <Container maxWidth="md" sx={{ mb: 14 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>Frequently Answered Questions</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.05rem" }}>
            Got questions about integrations, security, or fees? We have complete documentation below.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {faqs.map((faq, idx) => (
            <Paper
              key={idx}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              sx={{
                p: 3,
                cursor: "pointer",
                bgcolor: activeFaq === idx ? "rgba(153, 69, 242, 0.04)" : "rgba(255,255,255,0.01)",
                border: `1px solid ${activeFaq === idx ? "rgba(153, 69, 242, 0.3)" : "rgba(255,255,255,0.05)"}`,
                borderRadius: "12px",
                transition: "all 0.2s ease"
              }}
            >
              <Box sx={{ display: "flex", justify: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 1.5 }}>
                  <FlashOnIcon sx={{ color: "primary.light", fontSize: 20 }} /> {faq.q}
                </Typography>
                <Typography sx={{ fontWeight: 900, color: "text.secondary", fontSize: "1.2rem", pl: 2 }}>
                  {activeFaq === idx ? "−" : "+"}
                </Typography>
              </Box>
              {activeFaq === idx && (
                <Box sx={{ mt: 2, pl: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: "0.95rem" }}>
                    {faq.a}
                  </Typography>
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      </Container>

      {/* ================= FINAL CTA SECTION ================= */}
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 5, md: 8 },
            borderRadius: "32px",
            textAlign: "center",
            border: "1px solid rgba(153, 69, 242, 0.25)",
            background: "linear-gradient(135deg, rgba(20,241,149,0.03) 0%, rgba(153,69,242,0.06) 100%)",
            boxShadow: "0 20px 50px rgba(153,69,242,0.1)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Subtle background overlay */}
          <Box sx={{ position: "absolute", inset: 0, opacity: 0.04, background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54 48c-2 0-3 1-4 2v4c0 1-1 2-2 2h-4c-1 0-2 1-2 2s1 2 2 2h4c3 0 6-3 6-6v-4c1-1 2-2 2-2s-1-2-2-2zm-36-36c2 0 3-1 4-2V6c0-1 1-2 2-2h4c1 0 2-1 2-2S29 0 28 0h-4C21 0 18 3 18 6v4c-1 1-2 2-2 2s1 2 2 2zm18 36c1 1 2 2 2 2s-1 2-2 2v4c0 3-3 6-6 6h-4c-1 0-2-1-2-2s1-2 2-2h4c1 0 2-1 2-2v-4c0-1 1-2 2-2zM18 12c-1-1-2-2-2-2s1-2 2-2V4c0-3 3-6 6-6h4c1 0 2 1 2 2s-1 2-2 2h-4c-1 0-2 1-2 2v4c0 1-1 2-2 2z' fill='%23ffffff'/%3E%3C/svg%3E\")" }} />
          
          <Typography variant="h3" sx={{ fontWeight: 950, mb: 3 }}>
            Build Your Public Creator SEO Profile Today
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 6, maxWidth: 650, mx: "auto", fontSize: "1.08rem", lineHeight: 1.8 }}>
            Claim your custom tipping slug, link your social media streams, and deploy dynamic Web3 overlays in less than five minutes.
          </Typography>
          
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => document.querySelector<HTMLButtonElement>(".wallet-adapter-button")?.click()}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 7,
                py: 2.2,
                borderRadius: "16px",
                fontWeight: 900,
                fontSize: "1.15rem",
                background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: (theme) => `0 8px 30px ${theme.palette.primary.main}66`,
                "&:hover": { transform: "translateY(-2px)", boxShadow: (theme) => `0 12px 40px ${theme.palette.primary.main}80` }
              }}
            >
              Launch Wallet Setup
            </Button>
          </Box>
        </Paper>
      </Container>

    </Box>
  );
}
