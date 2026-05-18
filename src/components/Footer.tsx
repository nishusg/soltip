// ============================================================================
// Footer Component — Footer.tsx
// ============================================================================
//
// A premium, glassmorphic footer loaded with Quick Links, Solana integrations,
// and natural SEO keywords to optimize SolChat search ranking.
// ============================================================================

import { Link as RouterLink } from "react-router-dom";
import { Box, Container, Grid, Typography, Link, IconButton, useTheme, Tooltip, Divider } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import LanguageIcon from "@mui/icons-material/Language";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "rgba(11, 15, 23, 0.8)",
        backdropFilter: "blur(24px)",
        borderTop: `1px solid ${theme.palette.primary.main}1a`,
        py: { xs: 8, md: 10 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          bottom: 0,
          right: "10%",
          width: "300px",
          height: "300px",
          background: `radial-gradient(circle, ${theme.palette.primary.main}0d 0%, transparent 70%)`,
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={5}>
          {/* Brand Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1.5,
                  boxShadow: `0 0 15px ${theme.palette.primary.main}33`,
                }}
              >
                <BoltIcon sx={{ color: "#fff", fontSize: 24 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  background: `linear-gradient(90deg, #fff 0%, ${theme.palette.primary.main} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                SolChat
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, mr: { md: 4 }, lineHeight: 1.7 }}>
              SolChat enables instant <strong>solana superchat</strong> alerts and peer-to-peer <strong>crypto donations for streamers</strong>. 
              Our non-custodial, <strong>wallet based tipping</strong> protocol minimizes fee cuts and eliminates middle-men, pushing real-time alerts to your custom <strong>stream tipping overlay</strong> in milliseconds.
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <IconButton 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener"
                sx={{ 
                  color: "text.secondary", 
                  bgcolor: "rgba(255,255,255,0.03)", 
                  border: "1px solid rgba(255,255,255,0.05)",
                  "&:hover": { color: "primary.main", bgcolor: "rgba(255,255,255,0.08)" } 
                }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton 
                href="https://github.com" 
                target="_blank"
                rel="noopener"
                sx={{ 
                  color: "text.secondary", 
                  bgcolor: "rgba(255,255,255,0.03)", 
                  border: "1px solid rgba(255,255,255,0.05)",
                  "&:hover": { color: "primary.main", bgcolor: "rgba(255,255,255,0.08)" } 
                }}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
              <IconButton 
                href="https://solana.com" 
                target="_blank"
                rel="noopener"
                sx={{ 
                  color: "text.secondary", 
                  bgcolor: "rgba(255,255,255,0.03)", 
                  border: "1px solid rgba(255,255,255,0.05)",
                  "&:hover": { color: "primary.main", bgcolor: "rgba(255,255,255,0.08)" } 
                }}
              >
                <LanguageIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links Column */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, letterSpacing: "0.05em", textTransform: "uppercase", color: "text.primary" }}>
              Explore
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Link component={RouterLink} to="/" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                Home
              </Link>
              <Link component={RouterLink} to="/how-it-works" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                How It Works
              </Link>
              <Link component={RouterLink} to="/pricing" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                Pricing
              </Link>
              <Link component={RouterLink} to="/security" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                Security & Trust
              </Link>
              <Link component={RouterLink} to="/blog" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                Blog Hub
              </Link>
              <Link component={RouterLink} to="/obs-overlay" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                OBS Setup
              </Link>
              <Link component={RouterLink} to="/leaderboard" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                Leaderboard
              </Link>
              <Link component={RouterLink} to="/activity" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                Recent Tips
              </Link>
            </Box>
          </Grid>

          {/* Solutions Column */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, letterSpacing: "0.05em", textTransform: "uppercase", color: "text.primary" }}>
              Solutions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Link component={RouterLink} to="/for-youtube" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                YouTube
              </Link>
              <Link component={RouterLink} to="/for-kick" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                Kick Streamers
              </Link>
              <Link component={RouterLink} to="/for-streamlabs" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                Streamlabs
              </Link>
              <Link component={RouterLink} to="/for-content-creators" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                All Creators
              </Link>
            </Box>
          </Grid>

          {/* Technology Column */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, letterSpacing: "0.05em", textTransform: "uppercase", color: "text.primary" }}>
              Resources
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Link href="https://solflare.com" target="_blank" rel="noopener" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                Solflare Wallet
              </Link>
              <Link href="https://phantom.app" target="_blank" rel="noopener" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                Phantom Wallet
              </Link>
              <Link href="https://solana.fm" target="_blank" rel="noopener" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                Solana Explorer
              </Link>
              <Link href="https://obsproject.com" target="_blank" rel="noopener" sx={{ color: "text.secondary", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                OBS Studio
              </Link>
            </Box>
          </Grid>

          {/* Network Badge Column */}
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, letterSpacing: "0.05em", textTransform: "uppercase", color: "text.primary" }}>
              Network
            </Typography>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: "12px", 
                bgcolor: "rgba(255,255,255,0.02)", 
                border: "1px solid rgba(255,255,255,0.05)",
                display: "inline-flex",
                flexDirection: "column",
                gap: 1
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircleIcon sx={{ color: "success.main", fontSize: 16 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#fff" }}>
                  Solana Devnet
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.4, fontSize: "0.72rem" }}>
                Settle in under 2s. Fee averages under $0.00025.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5, opacity: 0.1 }} />

        {/* Global Legal & Volatility Disclaimer */}
        <Typography 
          variant="caption" 
          sx={{ 
            display: "block",
            color: "text.secondary", 
            lineHeight: 1.8, 
            mb: 4, 
            textAlign: "justify",
            opacity: 0.6,
            fontSize: "0.72rem"
          }}
        >
          <strong>Legal Disclaimer:</strong> SolChat is a decentralized, non-custodial software protocol. Digital assets, including Solana (SOL) and USD Coin (USDC), are subject to extreme market volatility, technical network risks, and potential total loss of value. SolChat does not operate as a financial institution, custodian, or broker-dealer, and does not provide investment, financial, tax, or legal advice. Tipping transactions are settled directly peer-to-peer on-chain between fans and creators. Creators are solely responsible for self-reporting and paying any income, capital gains, sales, or self-employment taxes required under their local jurisdictions. Brand names, logos, and simulated creator slugs (e.g., AeroDegen, GigaStreamer) are shown for technical demonstration and illustrative compatibility purposes only, and do not constitute an active endorsement, affiliation, or sponsorship.
        </Typography>

        {/* Legal & Copyright */}
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            flexDirection: { xs: "column", sm: "row" }, 
            gap: 2 
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "Space Mono, monospace" }}>
            &copy; {new Date().getFullYear()} SolChat. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}>
            Built with ⚡ by <Link href="https://solana.com" target="_blank" rel="noopener" sx={{ color: "primary.main", textDecoration: "none", fontWeight: 700, "&:hover": { textDecoration: "underline" } }}>Solana Developers</Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
