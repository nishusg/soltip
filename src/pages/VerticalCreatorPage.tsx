// ============================================================================
// Vertical Creator Page — VerticalCreatorPage.tsx
// ============================================================================
//
// A dynamic, highly search-optimized vertical landing page component that adapts 
// its content, theme colors, keywords, calculators, and FAQs dynamically depending
// on the "platform" prop (YouTube, Kick, Streamlabs, or General).
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
  Divider,
  Chip,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BoltIcon from "@mui/icons-material/Bolt";
import TvIcon from "@mui/icons-material/Tv";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StarIcon from "@mui/icons-material/Star";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import LanguageIcon from "@mui/icons-material/Language";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SEO from "../components/SEO";

export type PlatformType = "youtube" | "kick" | "streamlabs" | "general";

interface FAQItem {
  q: string;
  a: string;
}

interface PlatformConfig {
  metaTitle: string;
  metaDesc: string;
  brandColor: string;
  glowColor: string;
  glowOpacity: string;
  accentText: string;
  heroTitle: string;
  heroSub: string;
  comparisonLabel: string;
  comparisonFee: string;
  comparisonSplitText: string;
  calculatorFeeRate: number; // Percentage, e.g. 0.30 for YouTube
  keywords: string[];
  faqs: FAQItem[];
}

interface VerticalCreatorPageProps {
  platform: PlatformType;
}

export default function VerticalCreatorPage({ platform }: VerticalCreatorPageProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [tipVolume, setTipVolume] = useState<number>(1500);

  // Platform dynamic settings
  const configs: Record<PlatformType, PlatformConfig> = {
    youtube: {
      metaTitle: "YouTube Crypto Donations & Super Chat Alternative | SolChat",
      metaDesc: "Tired of YouTube taking 30% of your Super Chats? Set up a SolChat donation page. Lower fees, instant peer-to-peer settlement, and OBS overlays.",
      brandColor: "#EF4444", // YouTube Red
      glowColor: "rgba(239, 68, 68, 0.4)",
      glowOpacity: "0c",
      accentText: "YOUTUBE BROADCASTER SPEC",
      heroTitle: "YouTube Super Chat Alternative",
      heroSub: "YouTube takes up to 30% of your Super Chat support. SolChat enables direct peer-to-peer <strong>youtube crypto donations</strong> with a minimal 5% platform fee and instant payouts.",
      comparisonLabel: "YouTube Super Chat",
      comparisonFee: "30% flat commission",
      comparisonSplitText: "70% to Creator (Holds funds)",
      calculatorFeeRate: 0.30,
      keywords: ["youtube crypto donations", "youtube super chat alternative", "solana superchat for youtube", "crypto tipping youtube"],
      faqs: [
        {
          q: "Is it safe to put a SolChat crypto donation link in my YouTube description?",
          a: "Absolutely. YouTube welcomes third-party donation links (like Patreon, Ko-fi, and PayPal) in video descriptions. A SolChat tipping link acts as a direct, secure alternative for receiving wallet based crypto support without violating community guidelines."
        },
        {
          q: "How does a Solana superchat compare to a YouTube Super Chat?",
          a: "While YouTube Super Chats deduct a 30% fee and hold your funds for up to 45 days, a Solana superchat via SolChat is fully decentralized: we charge a flat 5% platform fee, and donations settle peer-to-peer directly into your wallet in under 2 seconds, immediately triggering real-time stream overlays."
        },
        {
          q: "Do I need a special setup to show Solana tipping alerts on YouTube streams?",
          a: "No! Just copy the unique Browser Source URL from your dashboard and paste it into OBS Studio or Streamlabs. The alerts will overlay seamlessly over your Twitch or YouTube broadcast with complete transparency."
        },
        {
          q: "Can viewers donate crypto on mobile devices?",
          a: "Yes! SolChat integrates seamlessly with the Solana Mobile Wallet Adapter (MWA). Viewers on YouTube Mobile can tap your tipping link, sign the transaction in their Phantom or Solflare app in one tap, and return immediately."
        }
      ]
    },
    kick: {
      metaTitle: "Kick Crypto Tipping Link & Custom Alerts | SolChat",
      metaDesc: "Boost your Kick stream monetization. Secure Solana tipping link with direct 95/5 creator splits, instant peer-to-peer settlement, and OBS alerts.",
      brandColor: "#53FC18", // Kick Green
      glowColor: "rgba(83, 252, 24, 0.4)",
      glowOpacity: "08",
      accentText: "KICK CREATOR SPEC",
      heroTitle: "Kick Tipping Alternative & Alerts",
      heroSub: "Kick is built on a creator-first ethos, but sub splits still take a cut. Expand your stream monetization with direct <strong>kick crypto tipping</strong>, offering 95/5 splits and instant settlement.",
      comparisonLabel: "Kick Subscriptions",
      comparisonFee: "5% platform split",
      comparisonSplitText: "95% Creator Split (Monthly cycle)",
      calculatorFeeRate: 0.05,
      keywords: ["kick crypto tipping", "kick stream alerts", "kick donation link", "solana tipping kick"],
      faqs: [
        {
          q: "How does SolChat fit with Kick's creator-first splitting fees?",
          a: "Kick is famous for its premium 95/5 splits, but sub splits still deduct fees and hold payouts. SolChat goes a step further by offering a premium 95/5 split: we take a tiny 5% commission to support platform development, and your viewers' tips transfer instantly from wallet to wallet in under two seconds."
        },
        {
          q: "How do I configure a custom Kick stream alerts overlay?",
          a: "Simply open your SolChat dashboard, configure your custom alert sounds and styling, copy your unique secret Browser Source URL, and paste it into your OBS or Streamlabs overlay dashboard. The alerts fire in under 300 milliseconds on stream."
        },
        {
          q: "Can I accept Twitch or Kick crypto donations side-by-side?",
          a: "Yes! Your custom SolChat tipping page is platform-agnostic. You can share your link simultaneously in your Kick panels, Twitch descriptions, or YouTube headers, and manage all alert presets from one central hub."
        },
        {
          q: "What wallets do Kick viewers use to sign tipping transactions?",
          a: "Viewers can connect any standard web3 Solana wallet (such as Phantom, Solflare, or Backpack) directly from their web browser, ensuring industry-grade security and transparency."
        }
      ]
    },
    streamlabs: {
      metaTitle: "Streamlabs Crypto Tip Page & OBS Integration | SolChat",
      metaDesc: "Upgrade your Streamlabs setup with Solana stream alerts. Low platform fees, instant peer-to-peer settlement, and full Streamlabs compatibility.",
      brandColor: "#06B6D4", // Streamlabs Teal
      glowColor: "rgba(6, 182, 212, 0.4)",
      glowOpacity: "0c",
      accentText: "STREAMLABS OVERLAY SPEC",
      heroTitle: "Streamlabs Crypto Tips & Overlay",
      heroSub: "Avoid high merchant fees and credit card chargebacks. Integrate direct <strong>streamlabs crypto tipping</strong> into your broadcast with a flat 5% cut, zero payout delay, and full Streamlabs compatibility.",
      comparisonLabel: "Traditional Tip Portals",
      comparisonFee: "Up to 5% + merchant fees",
      comparisonSplitText: "Chargebacks & holds apply",
      calculatorFeeRate: 0.06,
      keywords: ["streamlabs crypto tipping", "streamlabs donation overlay", "solana alerts streamlabs", "crypto tipping streamlabs OBS"],
      faqs: [
        {
          q: "Does SolChat support Streamlabs Desktop and Streamlabs OBS?",
          a: "Yes! SolChat’s custom alert overlay is fully compatible with Streamlabs Desktop (formerly Streamlabs OBS), Streamlabs Cloud, and StreamElements. Just add a new 'Browser Source' to your scene, paste your SolChat alert link, and you are ready."
        },
        {
          q: "Are credit card chargebacks a risk on crypto donations for streamers?",
          a: "Not at all. Credit card chargebacks are a massive threat for creators using traditional donation portals. Solana blockchain transactions are cryptographically validated and fully irreversible. Once a viewer sends SOL, it is yours permanently."
        },
        {
          q: "Do I need to configure chroma-key green screen filters in Streamlabs?",
          a: "No. SolChat alerts render with native alpha channel transparency (0% opacity backgrounds). You can place the browser source anywhere on your Streamlabs layout and float clean alerts without chroma-keying."
        },
        {
          q: "How do I test my Streamlabs stream overlay alerts before going live?",
          a: "Simply navigate to your SolChat dashboard and click 'Send Test Alert'. This instantly triggers a live preview on your Streamlabs overlay, letting you verify graphics, custom fonts, and alert audios in real-time."
        }
      ]
    },
    general: {
      metaTitle: "Crypto Monetization for Digital & Content Creators | SolChat",
      metaDesc: "Set up a decentralized tipping link for your brand. Direct peer-to-peer global payments, flat 5% platform cuts, and instant Solana payouts.",
      brandColor: "#6366F1", // Indigo
      glowColor: "rgba(99, 102, 241, 0.4)",
      glowOpacity: "0c",
      accentText: "CREATOR ECONOMY SPEC",
      heroTitle: "Creator Crypto Monetization",
      heroSub: "Bypass platform gatekeepers, high payment processing fees, and geo-restrictions. SolChat enables direct, global, peer-to-peer <strong>crypto monetization for creators</strong>.",
      comparisonLabel: "Traditional Sub Portals",
      comparisonFee: "10% to 30% commission cuts",
      comparisonSplitText: "Weekly/monthly delay holds",
      calculatorFeeRate: 0.15,
      keywords: ["crypto monetization creators", "content creator tipping link", "solana superchat creator", "crypto donations for streamers"],
      faqs: [
        {
          q: "What makes SolChat a superior Twitch donation alternative?",
          a: "Traditional tipping portals take heavy fee cuts, hold funds, and require complex merchant integrations. SolChat provides a secure, non-custodial alternative where viewers send tips directly to your Solana wallet with absolute transparency, instant settlement, and a flat 5% platform fee."
        },
        {
          q: "Is a web3 wallet tipping link appropriate for off-stream creators?",
          a: "Absolutely! Podcasters, bloggers, developers, and writers use SolChat's customized tipping pages in social bios, post footers, and website widgets to receive direct cross-border support globally."
        },
        {
          q: "How does the platform fee structure work?",
          a: "SolChat operates on a fully peer-to-peer decentralized transaction model. The viewer signs a transaction that splits 95% straight to the creator and 5% to the platform to maintain hosting and WebSocket servers. The only other cost is Solana's network gas fee, which averages under $0.00025."
        },
        {
          q: "How secure is direct web3 peer-to-peer tipping?",
          a: "It is exceptionally secure. No personal billing details are exposed, and funds transfer directly between wallets. SolChat never accesses your private keys or holds your donations, ensuring complete non-custodial safety."
        }
      ]
    }
  };

  const activeConfig = configs[platform];

  // Resolve dynamic colors from active theme (default before login, user-selected premium after loggedIn)
  const brandColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary?.main || brandColor;

  // Calculations for Tipping Fee Calculator
  const traditionalFees = Math.round(tipVolume * activeConfig.calculatorFeeRate);
  const platformFee = Math.round(tipVolume * 0.05); // Standard 5% platform cut
  const networkFees = Math.round(tipVolume * 0.0005); // Simulated network/gas fee
  const solchatKept = Math.round(tipVolume - platformFee - networkFees);
  const traditionalKept = Math.round(tipVolume - traditionalFees);
  const monthlySavings = Math.round(traditionalFees - platformFee - networkFees);
  const yearlySavings = Math.round(monthlySavings * 12);

  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", overflow: "hidden", pb: 10 }}>
      {/* Dynamic SEO Tags */}
      <SEO title={activeConfig.metaTitle} description={activeConfig.metaDesc} />

      {/* Dynamic Background Glowing Orbs based on platform theme skin */}
      <Box 
        sx={{ 
          position: "absolute", top: "15%", left: "-15%", width: "50%", height: "50%", 
          background: `radial-gradient(circle, ${brandColor}1a 0%, transparent 75%)`, 
          zIndex: -1, filter: "blur(120px)" 
        }} 
      />
      <Box 
        sx={{ 
          position: "absolute", bottom: "25%", right: "-15%", width: "50%", height: "50%", 
          background: `radial-gradient(circle, ${brandColor}15 0%, transparent 75%)`, 
          zIndex: -1, filter: "blur(120px)" 
        }} 
      />

      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
        
        {/* Dynamic Hero Section */}
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 10 } }}>
          <Typography 
            variant="overline" 
            sx={{ 
              fontWeight: 900, 
              letterSpacing: "0.25em", 
              color: brandColor,
              fontFamily: "Space Mono, monospace",
              textTransform: "uppercase",
              bgcolor: `${brandColor}0a`,
              border: `1px solid ${brandColor}22`,
              px: 3,
              py: 1,
              borderRadius: "20px",
              display: "inline-block",
              boxShadow: `0 0 20px ${brandColor}0d`,
              mb: 3
            }}
          >
            {activeConfig.accentText}
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
            {activeConfig.heroTitle}
          </Typography>

          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: "800px", mx: "auto", fontWeight: 400, lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: activeConfig.heroSub }}
          />

          {/* Keywords visual badges */}
          <Box sx={{ mt: 4, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1.5 }}>
            {activeConfig.keywords.map((kw, idx) => (
              <Chip 
                key={idx} 
                label={`#${kw}`} 
                size="medium"
                sx={{ 
                  bgcolor: "rgba(255,255,255,0.02)", 
                  border: "1px solid rgba(255,255,255,0.06)", 
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "Space Mono",
                  fontSize: "0.8rem",
                  fontWeight: 600
                }} 
              />
            ))}
          </Box>
        </Box>

        {/* Dynamic Comparative Table Section */}
        <Box sx={{ mb: 12 }}>
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
            Direct Monetization Comparison
          </Typography>

          <TableContainer 
            component={Paper} 
            sx={{ 
              bgcolor: "rgba(255,255,255,0.01)", 
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "24px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
              overflow: "hidden"
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900, fontSize: "1rem", color: "#fff", py: 2.5 }}>Feature Specification</TableCell>
                  <TableCell sx={{ fontWeight: 900, fontSize: "1rem", color: "text.secondary" }}>{activeConfig.comparisonLabel}</TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 900, 
                      fontSize: "1.05rem", 
                      color: brandColor,
                      bgcolor: `${brandColor}06`,
                      borderLeft: `1px solid ${brandColor}15`,
                      borderRight: `1px solid ${brandColor}15`
                    }}
                  >
                    🚀 SolChat Protocol
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Platform Commissions split */}
                <TableRow sx={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <TableCell sx={{ fontWeight: 800, color: "#fff" }}>Platform Commission</TableCell>
                  <TableCell sx={{ color: "error.main", fontWeight: 700 }}>{activeConfig.comparisonFee}</TableCell>
                  <TableCell sx={{ color: "success.main", fontWeight: 900, bgcolor: `${brandColor}03`, borderLeft: `1px solid ${brandColor}10`, borderRight: `1px solid ${brandColor}10` }}>
                    Flat 5.00%
                  </TableCell>
                </TableRow>

                {/* Split Split details */}
                <TableRow sx={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <TableCell sx={{ fontWeight: 800, color: "#fff" }}>Net Creator Share</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{activeConfig.comparisonSplitText}</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 900, bgcolor: `${brandColor}03`, borderLeft: `1px solid ${brandColor}10`, borderRight: `1px solid ${brandColor}10` }}>
                    95% to your Wallet
                  </TableCell>
                </TableRow>

                {/* Settlement Settlement times */}
                <TableRow sx={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <TableCell sx={{ fontWeight: 800, color: "#fff" }}>Payout Settlement</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>15 to 45 day weekly schedules</TableCell>
                  <TableCell sx={{ color: brandColor, fontWeight: 900, bgcolor: `${brandColor}03`, borderLeft: `1px solid ${brandColor}10`, borderRight: `1px solid ${brandColor}10` }}>
                    Instant (under 2 seconds)
                  </TableCell>
                </TableRow>

                {/* Chargeback protection */}
                <TableRow sx={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <TableCell sx={{ fontWeight: 800, color: "#fff" }}>Chargeback Protection</TableCell>
                  <TableCell sx={{ color: "error.main" }}>High risk (chargeback disputes apply)</TableCell>
                  <TableCell sx={{ color: "success.main", fontWeight: 900, bgcolor: `${brandColor}03`, borderLeft: `1px solid ${brandColor}10`, borderRight: `1px solid ${brandColor}10` }}>
                    Ledger Irreversible (No Chargebacks)
                  </TableCell>
                </TableRow>

                {/* Global global scope */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: "#fff", py: 2.5 }}>Global Payments</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>Geo-restricted card barriers</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 900, bgcolor: `${brandColor}03`, borderLeft: `1px solid ${brandColor}10`, borderRight: `1px solid ${brandColor}10` }}>
                    Borderless (Peer-to-peer web3)
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Dynamic Interactive Fee Calculator */}
        <Box sx={{ mb: 12 }}>
          <Grid container spacing={5}>
            {/* Controls Input Slider */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ p: 4.5, height: "100%", bgcolor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Profit Calculator
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                  Adjust the slider to simulate your monthly donation tipping volume and calculate exactly how much you lose to commissions vs. how much you save with SolChat.
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Monthly Tip Volume</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: brandColor, fontFamily: "Space Mono" }}>
                      ${tipVolume.toLocaleString()}
                    </Typography>
                  </Box>
                  <Slider 
                    value={tipVolume} 
                    onChange={(_, val) => setTipVolume(val as number)}
                    min={100}
                    max={10000}
                    step={100}
                    sx={{
                      color: brandColor,
                      height: 6,
                      "& .MuiSlider-thumb": {
                        width: 18,
                        height: 18,
                        backgroundColor: "#fff",
                        border: `2px solid ${brandColor}`,
                        "&:hover, &.Mui-focusVisible": { boxShadow: `0px 0px 0px 8px ${brandColor}1a` }
                      }
                    }}
                  />
                </Box>

                <Box sx={{ p: 2, borderRadius: "12px", bgcolor: `${brandColor}06`, border: `1px solid ${brandColor}22` }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>Estimated Yearly Savings</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 950, color: "success.main", fontFamily: "Space Grotesk, sans-serif" }}>
                    +${yearlySavings.toLocaleString()} / year
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Simulated Comparison Display Block */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 4.5, height: "100%", bgcolor: "#06080C", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 4, fontFamily: "Space Grotesk" }}>
                  Estimated Monthly Payout Comparison
                </Typography>

                <Stack spacing={4}>
                  {/* Traditional Split Bar */}
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                        {activeConfig.comparisonLabel} Net Share
                      </Typography>
                      <Typography variant="caption" sx={{ color: "error.main", fontWeight: 800, fontFamily: "Space Mono" }}>
                        ${traditionalKept.toLocaleString()} (loses ${traditionalFees.toLocaleString()})
                      </Typography>
                    </Box>
                    <Box sx={{ width: "100%", height: 14, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "4px", overflow: "hidden" }}>
                      <Box sx={{ width: `${(traditionalKept/tipVolume)*100}%`, height: "100%", bgcolor: "rgba(255, 255, 255, 0.2)", borderRadius: "4px" }} />
                    </Box>
                  </Box>

                  {/* SolChat Split Bar */}
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="caption" sx={{ color: brandColor, fontWeight: 800 }}>
                        🚀 SolChat Net Support (5% platform fee + gas)
                      </Typography>
                      <Typography variant="caption" sx={{ color: "success.main", fontWeight: 900, fontFamily: "Space Mono" }}>
                        ${solchatKept.toLocaleString()} (loses only ${platformFee.toLocaleString()})
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        width: "100%", 
                        height: 16, 
                        bgcolor: "rgba(255,255,255,0.02)", 
                        borderRadius: "4px", 
                        overflow: "hidden",
                        border: `1px solid ${brandColor}33`,
                        boxShadow: `0 0 10px ${brandColor}0d`
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: `${(solchatKept/tipVolume)*100}%`, 
                          height: "100%", 
                          background: `linear-gradient(90deg, ${brandColor} 0%, ${secondaryColor} 100%)`, 
                          borderRadius: "4px",
                          boxShadow: `0 0 15px ${brandColor}`
                        }} 
                      />
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Standard Core Benefits Grid */}
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
            The Ultimate Creator Monetization Gateway
          </Typography>

          <Grid container spacing={3.5}>
            {/* Twitch donation alternative */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ p: 3.5, height: "100%", bgcolor: "rgba(255,255,255,0.01)" }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: `${brandColor}0d`, color: brandColor, display: "flex", alignItems: "center", justifyContent: "center", mb: 2.5 }}>
                  <TvIcon fontSize="small" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, fontSize: "1.1rem" }}>
                  Twitch Alternative
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Skip traditional donation splits. Provide fans a modernized, high-converting crypto support experience.
                </Typography>
              </Card>
            </Grid>

            {/* Lower fees */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ p: 3.5, height: "100%", bgcolor: "rgba(255,255,255,0.01)" }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: `${brandColor}0d`, color: brandColor, display: "flex", alignItems: "center", justifyContent: "center", mb: 2.5 }}>
                  <BoltIcon fontSize="small" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, fontSize: "1.1rem" }}>
                  Minimal 5% Fee
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  We charge a minimal flat 5% platform fee. Net tip volumes settle 95% peer-to-peer directly into your wallet.
                </Typography>
              </Card>
            </Grid>

            {/* Instant settlement */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ p: 3.5, height: "100%", bgcolor: "rgba(255,255,255,0.01)" }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: `${brandColor}0d`, color: brandColor, display: "flex", alignItems: "center", justifyContent: "center", mb: 2.5 }}>
                  <FlashOnIcon fontSize="small" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, fontSize: "1.1rem" }}>
                  Instant P2P Payout
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Solana blockchain payments settle wallet-to-wallet in under 2 seconds. No payout hold thresholds.
                </Typography>
              </Card>
            </Grid>

            {/* Global payments */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ p: 3.5, height: "100%", bgcolor: "rgba(255,255,255,0.01)" }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: `${brandColor}0d`, color: brandColor, display: "flex", alignItems: "center", justifyContent: "center", mb: 2.5 }}>
                  <LanguageIcon fontSize="small" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, fontSize: "1.1rem" }}>
                  Global Cross-Border
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Accept donations borderless from any viewer, anywhere globally, bypassing local bank blockades.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Dynamic Platform SEO FAQs */}
        <Box sx={{ maxWidth: "820px", mx: "auto", mb: 10 }}>
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
            {activeConfig.faqs.map((faq, idx) => (
              <Accordion 
                key={idx} 
                sx={{ 
                  bgcolor: "rgba(255,255,255,0.02)", 
                  border: "1px solid rgba(255,255,255,0.05)", 
                  borderRadius: "16px !important", 
                  "&::before": { display: "none" } 
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: brandColor }} />} sx={{ py: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Box>

        {/* Final CTA Card */}
        <Card 
          sx={{ 
            p: { xs: 5, md: 8 }, 
            bgcolor: "rgba(255,255,255,0.02)", 
            border: (theme: any) => `1px solid ${brandColor}33`, 
            borderRadius: "32px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 20px 60px ${brandColor}06`
          }}
        >
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 50% 50%, ${brandColor}0a 0%, transparent 60%)`, pointerEvents: "none" }} />
          
          <CardContent sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
              Maximize Your Creator Revenue Today
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxW: 600, mx: "auto", mb: 5, lineHeight: 1.6 }}>
              Set up your high-converting decentralized donation link in under 2 minutes. Receive peer-to-peer tip splits instantly with a minimal flat 5% platform fee.
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
                sx={{ bgcolor: brandColor, color: "#000", px: 5, py: 1.8, borderRadius: "14px", fontWeight: 800, "&:hover": { bgcolor: brandColor, opacity: 0.9 } }}
              >
                Go to Home
              </Button>
              <Button 
                component={RouterLink}
                to="/dashboard"
                variant="outlined" 
                size="large"
                sx={{ borderColor: brandColor, color: "#fff", px: 5, py: 1.8, borderRadius: "14px", fontWeight: 800, "&:hover": { borderColor: brandColor, bgcolor: "rgba(255,255,255,0.03)" } }}
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
