// ============================================================================
// Security Page — SecurityPage.tsx
// ============================================================================
//
// A premium, high-trust security transparency page.
// Integrates:
//   1. Dynamic theme colors (standard indigo before login, premium theme after login)
//   2. Deep details on Non-Custodial architecture, wallet signatures
//   3. Absolute zero-seed phrase guarantee
//   4. Anti-spam thresholds, WebSocket token validation, and rate limiting specs
//   5. High-trust developer/investor security FAQs
// ============================================================================

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
import BoltIcon from "@mui/icons-material/Bolt";
import ShieldIcon from "@mui/icons-material/Shield";
import KeyIcon from "@mui/icons-material/Key";
import SecurityIcon from "@mui/icons-material/Security";
import RateReviewIcon from "@mui/icons-material/RateReview";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import WarningIcon from "@mui/icons-material/Warning";
import GppGoodIcon from "@mui/icons-material/GppGood";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import SEO from "../components/common/SEO";

export default function SecurityPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Dynamic context colors from current theme
  const brandColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary?.main || brandColor;

  const securityPillars = [
    {
      icon: <KeyIcon fontSize="medium" />,
      title: "Non-Custodial Design",
      tag: "ZERO CUSTODY",
      desc: "We never touch or hold your funds. Tipping transactions occur directly peer-to-peer on the Solana blockchain, depositing assets straight to your wallet."
    },
    {
      icon: <SecurityIcon fontSize="medium" />,
      title: "Secure Client Signatures",
      tag: "CRYPTOGRAPHIC PROOF",
      desc: "Every interaction is authenticated via standard wallet extensions (Phantom, Solflare). No seed phrases, no manual key entries, and zero exposure risk."
    },
    {
      icon: <ShieldIcon fontSize="medium" />,
      title: "Overlay Anti-Spam",
      tag: "STREAM PROTECTION",
      desc: "Websocket event triggers are signed with unique token handshakes, shielding your OBS stream overlays from bot injections and external hijacking."
    }
  ];

  const deepDives = [
    {
      icon: <VpnKeyIcon sx={{ color: "error.main" }} />,
      title: "Seed Phrase Confidentiality",
      desc: "We will NEVER ask for your seed phrase, private key, or personal passwords. Your cryptographic credentials reside exclusively inside your secure, non-custodial browser wallet (Phantom, Solflare, Ledger). SolChat initiates tip routing entirely via standard client-side browser adapters."
    },
    {
      icon: <GppGoodIcon sx={{ color: "success.main" }} />,
      title: "Smart Contract Execution Roadmap",
      desc: "Tipping splits execute transparently on the public Solana ledger using open-source smart contracts. Professional third-party security audits are planned in our developmental roadmap alongside mainnet transitions to validate resilient cryptographic execution."
    },
    {
      icon: <SettingsEthernetIcon sx={{ color: brandColor }} />,
      title: "Dynamic Backend Rate Limiting",
      desc: "Our high-speed API endpoints and message relays are fortified with strict IP-level rate limit thresholds and DDoS protections. Bots, automated scripts, and malicious spammers are isolated instantly before they can impact alert latency."
    },
    {
      icon: <WarningIcon sx={{ color: "warning.main" }} />,
      title: "Anti-Fraud P2P Ledger Protection",
      desc: "Traditional card systems are highly vulnerable to chargebacks and credit fraud claims. Because blockchain settlements are mathematically irreversible once confirmed in a block, SolChat creators are highly protected from traditional card chargeback fraud and credit penalties."
    }
  ];

  const faqs = [
    {
      q: "What does 'non-custodial' mean for SolChat creators?",
      a: "Non-custodial means SolChat never acts as a bank or custodian. We do not store your earnings, hold account balances, or keep custody of your funds. Every time a fan tips you, the transaction transfers directly on the Solana blockchain from the fan's wallet straight to your personal wallet address. Payouts are instantaneous because they bypass our systems completely."
    },
    {
      q: "Is it safe to connect my Phantom or Solflare wallet?",
      a: "Yes! Connecting your wallet to SolChat uses the industry-standard Solana Wallet Adapter. This adapter acts as a secure firewall. It only allows SolChat to request transaction signatures—it never shares your private keys, private seeds, or funds. You retain 100% control, and every transaction must be manually approved by you within your wallet popup."
    },
    {
      q: "How does the platform prevent spam tips and alert hijacking?",
      a: "We deploy multi-layered defensive shields. First, we rate limit visual alerts by IP and wallet to prevent automated message flooding. Second, our websocket overlay server validates signature payloads using private tokenized handshakes. An external actor cannot spoof tips or push fake overlay alerts to your stream—only cryptographically verified block transactions will fire alerts."
    },
    {
      q: "Are the protocol contracts audited?",
      a: "All on-chain split logic relies on standard, open-source Solana programs. To ensure complete security, we are in the process of finalizing comprehensive smart contract audits with leading Web3 auditing firms, scheduled to be publicly published ahead of our next major feature expansion."
    }
  ];

  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", overflow: "hidden", pb: 10 }}>
      <SEO 
        title="Decentralized Security, Non-Custodial Trust & Anti-Spam | SolChat" 
        description="Bank-grade security. SolChat is a non-custodial platform that never collects seed phrases or private keys. Cryptographically signed transactions, rate-limiting, and OBS overlay protection." 
      />

      {/* Dynamic Background Glowing Orbs */}
      <Box 
        sx={{ 
          position: "absolute", top: "12%", left: "-15%", width: "50%", height: "50%", 
          background: `radial-gradient(circle, ${brandColor}15 0%, transparent 75%)`, 
          zIndex: -1, filter: "blur(120px)" 
        }} 
      />
      <Box 
        sx={{ 
          position: "absolute", bottom: "18%", right: "-15%", width: "50%", height: "50%", 
          background: `radial-gradient(circle, ${brandColor}10 0%, transparent 75%)`, 
          zIndex: -1, filter: "blur(120px)" 
        }} 
      />

      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
        
        {/* Hero Section */}
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
            Bank-Grade Security
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
            Trust Built on Cryptographic Proof
          </Typography>

          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: "800px", mx: "auto", fontWeight: 400, lineHeight: 1.7 }}
          >
            Non-custodial by design. SolChat is engineered to ensure that your private keys, seed phrases, and funds never leave your secure wallet adapter.
          </Typography>
        </Box>

        {/* Dynamic Security Pillars Grid */}
        <Grid container spacing={4} sx={{ mb: 12 }}>
          {securityPillars.map((pillar, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <Card 
                sx={{ 
                  p: 4.5, 
                  height: "100%", 
                  bgcolor: "rgba(255,255,255,0.01)", 
                  border: `1px solid rgba(255,255,255,0.05)`, 
                  borderRadius: "24px",
                  transition: "transform 0.3s, border-color 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    borderColor: `${brandColor}33`,
                    boxShadow: `0 15px 35px ${brandColor}08`
                  }
                }}
              >
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: "12px", 
                    bgcolor: `${brandColor}0d`, 
                    color: brandColor, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    mb: 3 
                  }}
                >
                  {pillar.icon}
                </Box>
                <Chip 
                  label={pillar.tag} 
                  size="small" 
                  sx={{ 
                    bgcolor: "rgba(255,255,255,0.03)", 
                    color: "rgba(255,255,255,0.6)", 
                    fontWeight: 800, 
                    fontSize: "0.65rem", 
                    letterSpacing: "0.05em",
                    fontFamily: "Space Mono",
                    mb: 2 
                  }} 
                />
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, fontFamily: "Space Grotesk" }}>
                  {pillar.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {pillar.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Deep Dive Cards Grid */}
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
            Rigorous Defense In-Depth
          </Typography>

          <Grid container spacing={4}>
            {deepDives.map((dive, idx) => (
              <Grid size={{ xs: 12, md: 6 }} key={idx}>
                <Paper 
                  sx={{ 
                    p: 4.5, 
                    height: "100%", 
                    bgcolor: "#06080C", 
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "24px",
                    display: "flex",
                    gap: 3,
                    alignItems: "flex-start"
                  }}
                >
                  <Box sx={{ mt: 0.5 }}>
                    {dive.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, fontFamily: "Space Grotesk" }}>
                      {dive.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {dive.desc}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Dynamic FAQ Accordion */}
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
            Security & Trust FAQ
          </Typography>

          <Stack spacing={2}>
            {faqs.map((faq, idx) => (
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

        {/* CTA Card */}
        <Card 
          sx={{ 
            p: { xs: 5, md: 8 }, 
            bgcolor: "rgba(255,255,255,0.02)", 
            border: `1px solid ${brandColor}33`, 
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
              Secure Your Creator Revenue Today
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxW: 600, mx: "auto", mb: 5, lineHeight: 1.6 }}>
              Experience the safety of irreversible, fully non-custodial peer-to-peer tipping splits. Set up in under 2 minutes.
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
                Launch Protocol
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

        {/* Regulatory & Risk Disclaimer Footer */}
        <Box 
          sx={{ 
            mt: 8, 
            p: 4, 
            borderRadius: "20px", 
            bgcolor: "rgba(255,255,255,0.01)", 
            border: "1px solid rgba(255,255,255,0.05)", 
            textAlign: "left" 
          }}
        >
          <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 800, display: "block", mb: 1, letterSpacing: "0.1em" }}>
            Regulatory Disclaimer & Risk Disclosure
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.6 }}>
            SolChat is a decentralized, non-custodial software protocol. By connecting your wallet and using the tipping software, you agree that you are solely responsible for your own private credentials, keys, transactions, and local tax reporting compliance. Cryptocurrency transactions carry high price volatility, smart-contract risks, and blockchain validation delays. SolChat does not act as a custodian, fiduciary, financial advisor, bank, money service business (MSB), or licensed payment processor. Tipping services are provided "as-is" without explicit or implied guarantees of future yields or earnings. Smart contract audits are part of our developmental roadmap but do not eliminate decentralized software vulnerabilities.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
