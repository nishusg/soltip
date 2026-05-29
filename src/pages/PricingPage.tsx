// ============================================================================
// Pricing Page — PricingPage.tsx
// ============================================================================
//
// A gorgeous, high-converting fee transparency and pricing page.
// Integrates:
//   1. Dynamic theme integration (before login standard, after login premium)
//   2. Platform vs. network fee specs
//   3. High-fidelity comparative pricing tables (Twitch, Patreon, PayPal, and platforms)
//   4. Interactive Split-Fee visual layout (Viewer -> Solana -> Creator)
//   5. Retention profit calculators and FAQs
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
import SEO from "../components/common/SEO";
import { SITE_NAME, FEE_PERCENTAGE, PLATFORM_FEE_PCT } from "../shared/constants";


export default function PricingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [tipVolume, setTipVolume] = useState<number>(1500);

  // Dynamic platform fee percentage whole number
  const platformFeePct = PLATFORM_FEE_PCT.toString();
  const creatorSplitPct = 100 - PLATFORM_FEE_PCT;

  // Dynamic context colors from current theme
  const brandColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary?.main || brandColor;

  // Pricing calculations
  const platformFee = Math.round(tipVolume * FEE_PERCENTAGE); // dynamic platform fee
  const networkFees = Math.round(tipVolume * 0.0005); // Solana devnet/mainnet average gas

  const creatorRetained = Math.round(tipVolume - platformFee - networkFees);
  
  // Traditional platform comparisons
  const twitchLost = Math.round(tipVolume * 0.40); // 40% average cut on Bits/Subs
  const yearlySavings = Math.round((twitchLost - platformFee) * 12);

  const pricingCards = [
    {
      title: "Solana Network Gas",
      value: "< $0.00025",
      subtitle: "Per tip transaction",
      desc: "Paid directly to global Solana validators to secure peer-to-peer transfers. Settles instantly in under 2 seconds.",
      tag: "100% P2P LEDGER"
    },
    {
      title: "Protocol Platform Fee",
      value: `Flat ${platformFeePct}%`,
      subtitle: "On incoming creator support",
      desc: "Supports platform development, OBS stream overlays, hosting, and smart contract maintenance. Only paid when you earn.",
      tag: "CREATOR FIRST"
    },
    {
      title: "No Hidden Costs",
      value: "$0.00 / month",
      subtitle: "No setups or sub tiers",
      desc: "Zero credit card gateway fees, zero chargeback dispute costs, and zero platform monthly subscription tiers.",
      tag: "FULLY TRANSPARENT"
    }
  ];

  const comparisonRows = [
    { name: `Twitch Bits / Subs`, fee: "30% - 50% commission split", payout: "15-day hold period", chargebacks: "Creator holds liability" },
    { name: "Patreon Premium", fee: "8% - 12% cut + merchant splits", payout: "Monthly cycle payouts", chargebacks: "Subject to fraud claims" },
    { name: "PayPal / Credit Cards", fee: "3.4% + $0.30 standard cuts", payout: "7-day rolling holds", chargebacks: "High chargeback penalty fees" },
    { name: `🚀 ${SITE_NAME} Protocol`, fee: `Flat ${platformFeePct}% + Solana network gas`, payout: "Instant (under 2 seconds)", chargebacks: "Ledger Irreversible (No Chargebacks)", highlight: true }
  ];

  const payoutSteps = [
    {
      step: "01",
      title: "Viewer Sends Tip",
      desc: "Viewer types message and connects their web3 wallet. Signs the transaction securely."
    },
    {
      step: "02",
      title: "On-Chain Splitting",
      desc: `Solana smart contract automatically distributes ${creatorSplitPct}% straight to the creator and ${platformFeePct}% to the protocol.`
    },
    {
      step: "03",
      title: "Instant Wallet Settlement",
      desc: "Funds reside inside the creator's non-custodial wallet instantly (in < 2 seconds) with no lockups."
    },
    {
      step: "04",
      title: "Overlay Event Triggers",
      desc: "Our real-time websocket instantly fires custom sounds, graphics, and text overlays onto your OBS stream."
    }
  ];

  const faqs = [
    {
      q: `Why does ${SITE_NAME} charge a flat ${platformFeePct}% platform fee?`,
      a: `Our flat ${platformFeePct}% platform fee helps fund the development of our high-speed websocket servers, customizable OBS alert engines, non-custodial wallet integrations, and monorepo hosting. Unlike traditional portals that take 30-50% cuts or charge high monthly subscription fees, you only pay a tiny fraction when you actually receive support.`
    },
    {
      q: "What is a Solana gas fee and who receives it?",
      a: `A gas fee (or transaction fee) is a micro-payment paid directly to Solana validators to cryptographically secure and process your transaction on the blockchain. ${SITE_NAME} takes absolutely zero commission from this network gas fee, which averages under $0.00025.`
    },
    {
      q: "Are peer-to-peer crypto tips protected against chargebacks?",
      a: "Yes! Traditional credit card donations are highly vulnerable to payment fraud and chargeback scams, which cost streamers massive penalty fees. Blockchain transactions are ledger-irreversible once confirmed in a block. This significantly reduces chargeback fraud risk compared to traditional card networks."
    },
    {
      q: "Do I have to wait to withdraw my earnings?",
      a: `Not at all. ${SITE_NAME} is fully decentralized and non-custodial. We never hold your donations. All support goes directly from your viewer's wallet into your personal Solana wallet instantly in under 2 seconds. The funds are yours to hold, spend, or stake immediately.`
    }
  ];


  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", overflow: "hidden", pb: 10 }}>
      <SEO 
        title={`Creator-First Pricing & Fee Transparency | ${SITE_NAME}`} 
        description="Simple, open, and transparent pricing. Flat 5% platform fee + micro Solana network gas. No monthly subscriptions, no chargebacks, and instant P2P payouts." 
        faqs={faqs}
      />


      {/* Dynamic Background Glowing Orbs */}
      <Box 
        sx={{ 
          position: "absolute", top: "10%", left: "-15%", width: "50%", height: "50%", 
          background: `radial-gradient(circle, ${brandColor}15 0%, transparent 75%)`, 
          zIndex: -1, filter: "blur(120px)" 
        }} 
      />
      <Box 
        sx={{ 
          position: "absolute", bottom: "20%", right: "-15%", width: "50%", height: "50%", 
          background: `radial-gradient(circle, ${brandColor}10 0%, transparent 75%)`, 
          zIndex: -1, filter: "blur(120px)" 
        }} 
      />

      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
        
        {/* Hero Header */}
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
            Fee Transparency
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
            Simple, Creator-First Pricing
          </Typography>

          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: "800px", mx: "auto", fontWeight: 400, lineHeight: 1.7 }}
          >
            Keep more of what you earn. We offer direct peer-to-peer settlement, zero monthly subscription tiers, and no hidden payment processing barriers.
          </Typography>
        </Box>

        {/* Pricing Specification Cards Grid */}
        <Grid container spacing={4} sx={{ mb: 12 }}>
          {pricingCards.map((card, idx) => (
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
                <Chip 
                  label={card.tag} 
                  size="small" 
                  sx={{ 
                    bgcolor: `${brandColor}0d`, 
                    color: brandColor, 
                    fontWeight: 800, 
                    fontSize: "0.7rem", 
                    letterSpacing: "0.05em",
                    fontFamily: "Space Mono",
                    mb: 3 
                  }} 
                />
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, fontFamily: "Space Grotesk" }}>
                  {card.title}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 950, color: "#fff", mb: 0.5, fontFamily: "Space Grotesk" }}>
                  {card.value}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3, fontWeight: 700 }}>
                  {card.subtitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {card.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Payout Logic Linear Progress Flow Diagram */}
        <Box sx={{ mb: 12 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 900, 
              textAlign: "center", 
              mb: 2,
              background: "linear-gradient(135deg, #fff 0%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            How Incoming Support Flows
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ textAlign: "center", maxWidth: "600px", mx: "auto", mb: 6 }}
          >
            We process transaction cuts dynamically on-chain using Solana smart contracts. Peer-to-peer splits happen concurrently inside the block.
          </Typography>

          <Grid container spacing={3}>
            {payoutSteps.map((step, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                <Paper 
                  sx={{ 
                    p: 4, 
                    height: "100%", 
                    bgcolor: "#06080C", 
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "20px",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      position: "absolute", 
                      top: -10, 
                      right: 10, 
                      fontWeight: 950, 
                      fontSize: "4.5rem", 
                      color: `${brandColor}06`,
                      fontFamily: "Space Mono"
                    }}
                  >
                    {step.step}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, position: "relative", zIndex: 1, pr: 4 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, position: "relative", zIndex: 1 }}>
                    {step.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
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
            Incoming Splits Comparison
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
                  <TableCell sx={{ fontWeight: 900, fontSize: "1rem", color: "#fff", py: 2.5 }}>Platform</TableCell>
                  <TableCell sx={{ fontWeight: 900, fontSize: "1rem", color: "text.secondary" }}>Fee / Commission Cut</TableCell>
                  <TableCell sx={{ fontWeight: 900, fontSize: "1rem", color: "text.secondary" }}>Payout Delay</TableCell>
                  <TableCell sx={{ fontWeight: 900, fontSize: "1rem", color: "text.secondary" }}>Chargeback Fraud Risk</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonRows.map((row, idx) => (
                  <TableRow 
                    key={idx} 
                    sx={{ 
                      borderBottom: idx === comparisonRows.length - 1 ? "none" : "1px solid rgba(255,255,255,0.04)",
                      bgcolor: row.highlight ? `${brandColor}02` : "transparent"
                    }}
                  >
                    <TableCell 
                      sx={{ 
                        fontWeight: 900, 
                        color: row.highlight ? brandColor : "#fff",
                        py: 2.5,
                        fontSize: "0.95rem"
                      }}
                    >
                      {row.name}
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 700, 
                        color: row.highlight ? "success.main" : "text.secondary" 
                      }}
                    >
                      {row.fee}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{row.payout}</TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 700, 
                        color: row.highlight ? "success.main" : "error.main" 
                      }}
                    >
                      {row.chargebacks}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Dynamic Retention Calculator */}
        <Box sx={{ mb: 12 }}>
          <Grid container spacing={5}>
            {/* Controls Card */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ p: 4.5, height: "100%", bgcolor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, fontFamily: "Space Grotesk" }}>
                  Fee Savings Calculator
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                  Simulate your tipping revenues. Drag the volume slider to see how much traditional platform fees drain your profit compared to {SITE_NAME} splits.

                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Monthly Support Volume</Typography>
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

                <Box sx={{ p: 2.5, borderRadius: "12px", bgcolor: `${brandColor}06`, border: `1px solid ${brandColor}22` }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>Estimated Annual Savings</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 950, color: "success.main", fontFamily: "Space Grotesk, sans-serif" }}>
                    +${yearlySavings.toLocaleString()} / year
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Visual Profit Stack */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 4.5, height: "100%", bgcolor: "#06080C", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 4, fontFamily: "Space Grotesk" }}>
                  Estimated Monthly Creator Share
                </Typography>

                <Stack spacing={4}>
                  {/* Twitch Bar */}
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                        Twitch Net Support (40% lost)
                      </Typography>
                      <Typography variant="caption" sx={{ color: "error.main", fontWeight: 800, fontFamily: "Space Mono" }}>
                        ${(tipVolume - twitchLost).toLocaleString()} (loses ${twitchLost.toLocaleString()})
                      </Typography>
                    </Box>
                    <Box sx={{ width: "100%", height: 14, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "4px", overflow: "hidden" }}>
                      <Box sx={{ width: `${((tipVolume - twitchLost)/tipVolume)*100}%`, height: "100%", bgcolor: "rgba(255, 255, 255, 0.2)", borderRadius: "4px" }} />
                    </Box>
                  </Box>

                  {/* Platform Bar */}
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="caption" sx={{ color: brandColor, fontWeight: 800 }}>
                        🚀 {SITE_NAME} Net Support ({platformFeePct}% platform + gas)
                      </Typography>

                      <Typography variant="caption" sx={{ color: "success.main", fontWeight: 900, fontFamily: "Space Mono" }}>
                        ${creatorRetained.toLocaleString()} (loses only ${platformFee.toLocaleString()})
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
                          width: `${(creatorRetained/tipVolume)*100}%`, 
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

        {/* Pricing & Payout FAQs */}
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
            Pricing & Payout FAQ
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

        {/* Call To Action */}
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
              Stop Overpaying Gatekeepers
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxW: 600, mx: "auto", mb: 5, lineHeight: 1.6 }}>
              Set up your high-speed decentralized tipping page in under 2 minutes. Retain {creatorSplitPct}% of your direct incoming creator support.
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
                 
                sx={{ bgcolor: brandColor, color: "#000", px: 5, py: 1.8, borderRadius: "14px", fontWeight: 800, "&:hover": { bgcolor: brandColor, opacity: 0.9 } }}
              >
                Get Started
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
            {SITE_NAME} is a decentralized, non-custodial software protocol. By connecting your wallet and using the tipping software, you agree that you are solely responsible for your own private credentials, keys, transactions, and local tax reporting compliance. Cryptocurrency transactions carry high price volatility, smart-contract risks, and blockchain validation delays. {SITE_NAME} does not act as a custodian, fiduciary, financial advisor, bank, money service business (MSB), or licensed payment processor. Tipping services are provided "as-is" without explicit or implied guarantees of future yields or earnings. Smart contract audits are part of our developmental roadmap but do not eliminate decentralized software vulnerabilities.

          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
