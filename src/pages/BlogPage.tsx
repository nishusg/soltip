// ============================================================================
// Blog Listing Page — BlogPage.tsx
// ============================================================================
//
// A stunning Web3 blog hub. Features:
//   1. Search input for real-time article filtering
//   2. Category filtering tabs (All, Guides, Alerts, Monetization, Tutorials)
//   3. High-converting Featured Article top banner
//   4. Clean grid rendering with tags, read-times, and dynamic theme hover glows
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
  useTheme, 
  useMediaQuery, 
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  Stack
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BoltIcon from "@mui/icons-material/Bolt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ShieldIcon from "@mui/icons-material/Shield";
import SEO from "../components/common/SEO";
import { blogArticles } from "../data/blogArticles";

export default function BlogPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");

  // Dynamic context colors from current theme
  const brandColor = theme.palette.primary.main;

  const categories = ["All", "Guides", "Alerts", "Monetization", "Web3 Tutorials"];

  // Filter logic
  const filteredArticles = blogArticles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeTab === "All" || art.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  // Featured article (first item of list)
  const featuredArticle = blogArticles[0];

  // Grid articles (exclude first article in list when not searching or filtering)
  const showFeaturedHeader = searchQuery === "" && activeTab === "All" && featuredArticle;
  const gridArticles = showFeaturedHeader ? filteredArticles.slice(1) : filteredArticles;

  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", overflow: "hidden", pb: 10 }}>
      <SEO 
        title="Creator Tipping Guides, Solana OBS Alerts & Monetization Blog | SolChat" 
        description="Compounding strategies for streamers. Learn how to set up Solana live overlays, avoid platform commissions, and integrate non-custodial crypto tips." 
      />

      {/* Background Glowing Orbs */}
      <Box 
        sx={{ 
          position: "absolute", top: "8%", left: "-15%", width: "50%", height: "50%", 
          background: `radial-gradient(circle, ${brandColor}12 0%, transparent 75%)`, 
          zIndex: -1, filter: "blur(120px)" 
        }} 
      />
      <Box 
        sx={{ 
          position: "absolute", bottom: "25%", right: "-15%", width: "50%", height: "50%", 
          background: `radial-gradient(circle, ${brandColor}10 0%, transparent 75%)`, 
          zIndex: -1, filter: "blur(120px)" 
        }} 
      />

      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 6, md: 8 } }}>
        
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
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
            Resources & Insights
          </Typography>

          <Typography 
            variant={isMobile ? "h3" : "h2"} 
            sx={{ 
              fontWeight: 900, 
              letterSpacing: "-0.03em", 
              mb: 2,
              background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            The SolChat Creator Hub
          </Typography>

          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: "700px", mx: "auto", fontWeight: 400, lineHeight: 1.6 }}
          >
            Actionable monetization guides, OBS crypto alert setups, commission savings hacks, and direct Web3 tutorials.
          </Typography>
        </Box>

        {/* Search & Tabs Controls bar */}
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={3} sx={{ alignItems: "center" }}>
            {/* Category tabs */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Tabs 
                value={categories.indexOf(activeTab)} 
                onChange={(_, val) => setActiveTab(categories[val])}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  "& .MuiTabs-indicator": { bgcolor: brandColor },
                  "& .MuiTab-root": {
                    color: "text.secondary",
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "0.95rem",
                    px: 3.5,
                    "&.Mui-selected": { color: "#fff" }
                  }
                }}
              >
                {categories.map((cat, idx) => (
                  <Tab label={cat} key={idx} />
                ))}
              </Tabs>
            </Grid>

            {/* Search Input bar */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField 
                placeholder="Search articles or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "rgba(255,255,255,0.4)" }} />
                      </InputAdornment>
                    ),
                    sx: {
                      bgcolor: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "12px",
                      "&:hover": { borderColor: `${brandColor}44` },
                      "&.Mui-focused": { borderColor: brandColor }
                    }
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Featured Post top banner */}
        {showFeaturedHeader && (
          <Card 
            sx={{ 
              mb: 8, 
              bgcolor: "rgba(255,255,255,0.01)", 
              border: `1px solid rgba(255,255,255,0.05)`, 
              borderRadius: "32px",
              overflow: "hidden",
              position: "relative",
              transition: "border-color 0.3s",
              "&:hover": {
                borderColor: `${brandColor}44`,
                boxShadow: `0 20px 45px ${brandColor}06`
              }
            }}
          >
            <Grid container>
              <Grid size={{ xs: 12, md: 7 }} sx={{ p: { xs: 4, sm: 6, md: 8 } }}>
                <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: "center" }}>
                  <Chip 
                    label={featuredArticle.category} 
                    size="small"
                    sx={{ bgcolor: `${brandColor}12`, color: brandColor, fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.05em", fontFamily: "Space Mono" }} 
                  />
                  <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary", fontSize: "0.85rem" }}>
                    <AccessTimeIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
                    {featuredArticle.readTime}
                  </Box>
                </Stack>

                <Typography 
                  variant={isMobile ? "h4" : "h3"} 
                  component={RouterLink}
                  to={`/blog/${featuredArticle.slug}`}
                  sx={{ 
                    fontWeight: 900, 
                    mb: 2, 
                    display: "block", 
                    textDecoration: "none", 
                    color: "#fff", 
                    lineHeight: 1.25,
                    fontFamily: "Space Grotesk",
                    "&:hover": { color: brandColor } 
                  }}
                >
                  {featuredArticle.title}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7, fontSize: "1.05rem" }}>
                  {featuredArticle.excerpt}
                </Typography>

                <Button 
                  component={RouterLink}
                  to={`/blog/${featuredArticle.slug}`}
                  variant="contained" 
                  size="large"
                  endIcon={<BoltIcon sx={{ color: "#000" }} />}
                  sx={{ bgcolor: brandColor, color: "#000", px: 4, py: 1.5, borderRadius: "12px", fontWeight: 800, "&:hover": { bgcolor: brandColor, opacity: 0.95 } }}
                >
                  Read Article
                </Button>
              </Grid>

              {/* Decorative Orb Background Side */}
              <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", justifyContent: "center", position: "relative", bgcolor: "rgba(255,255,255,0.01)" }}>
                <Box 
                  sx={{ 
                    position: "absolute", width: "70%", height: "70%", 
                    background: `radial-gradient(circle, ${brandColor}15 0%, transparent 60%)`, 
                    filter: "blur(40px)" 
                  }} 
                />
                <ShieldIcon sx={{ fontSize: "140px", color: `${brandColor}1a` }} />
              </Grid>
            </Grid>
          </Card>
        )}

        {/* Articles Grid Listing */}
        {filteredArticles.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10, bgcolor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px" }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
              No Articles Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search queries or category filters.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {gridArticles.map((art, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <Card 
                  sx={{ 
                    p: 4, 
                    height: "100%", 
                    bgcolor: "rgba(255,255,255,0.01)", 
                    border: `1px solid rgba(255,255,255,0.05)`, 
                    borderRadius: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.3s, border-color 0.3s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      borderColor: `${brandColor}33`,
                      boxShadow: `0 15px 35px ${brandColor}08`
                    }
                  }}
                >
                  <Box>
                    <Stack direction="row" spacing={2} sx={{ mb: 2.5, alignItems: "center" }}>
                      <Chip 
                        label={art.category} 
                        size="small"
                        sx={{ bgcolor: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.6)", fontWeight: 800, fontSize: "0.65rem", fontFamily: "Space Mono" }} 
                      />
                      <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary", fontSize: "0.8rem" }}>
                        <AccessTimeIcon sx={{ fontSize: "0.95rem", mr: 0.5 }} />
                        {art.readTime}
                      </Box>
                    </Stack>

                    <Typography 
                      variant="h5" 
                      component={RouterLink}
                      to={`/blog/${art.slug}`}
                      sx={{ 
                        fontWeight: 800, 
                        mb: 2, 
                        display: "block", 
                        textDecoration: "none", 
                        color: "#fff", 
                        fontFamily: "Space Grotesk",
                        lineHeight: 1.35,
                        "&:hover": { color: brandColor } 
                      }}
                    >
                      {art.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.6 }}>
                      {art.excerpt}
                    </Typography>
                  </Box>

                  <Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                      {art.tags.map((tag, tIdx) => (
                        <Typography key={tIdx} variant="caption" sx={{ color: brandColor, fontWeight: 700, fontFamily: "Space Mono" }}>
                          #{tag}
                        </Typography>
                      ))}
                    </Box>

                    <Button 
                      component={RouterLink}
                      to={`/blog/${art.slug}`}
                      variant="text" 
                      color="inherit" 
                      endIcon={<BoltIcon sx={{ color: brandColor }} />}
                      sx={{ fontWeight: 800, px: 0, "&:hover": { color: brandColor } }}
                    >
                      Read Post
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
