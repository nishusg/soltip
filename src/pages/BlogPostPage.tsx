// ============================================================================
// Blog Post Reader Page — BlogPostPage.tsx
// ============================================================================
//
// A high-fidelity, dynamic blog post render page. Features:
//   1. Reading progress bar pinned to the top of the viewport
//   2. Dynamic content blocks compiler (Paragraph, Header, Quote, List, CTA, Table)
//   3. Inline high-conversion creator sign-up widgets
//   4. Related Articles suggestion footer matching active categories
// ============================================================================

import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
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
  Stack, 
  Paper, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BoltIcon from "@mui/icons-material/Bolt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SEO from "../components/SEO";
import { blogArticles, BlogArticle } from "../data/blogArticles";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [scrollProgress, setScrollProgress] = useState(0);

  // Dynamic context colors from current theme
  const brandColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary?.main || brandColor;

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = (window.pageYOffset / totalScroll) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch article
  const article = blogArticles.find((art) => art.slug === slug);

  if (!article) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Article Not Found</Typography>
        <Button component={RouterLink} to="/blog" variant="contained" sx={{ bgcolor: brandColor }}>
          Back to Blog
        </Button>
      </Box>
    );
  }

  // Get related articles (same category or others, excluding current article)
  const relatedArticles = blogArticles
    .filter((art) => art.slug !== article.slug)
    .slice(0, 3);

  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", overflow: "hidden", pb: 10 }}>
      <SEO title={article.metaTitle} description={article.metaDesc} />

      {/* Reading Progress Bar pinned to top of screen */}
      <Box 
        sx={{ 
          position: "fixed", top: 64, left: 0, right: 0, height: 4, 
          bgcolor: "rgba(255,255,255,0.05)", zIndex: 1000 
        }}
      >
        <Box sx={{ width: `${scrollProgress}%`, height: "100%", bgcolor: brandColor, transition: "width 0.1s" }} />
      </Box>

      {/* Background Glowing Orbs */}
      <Box 
        sx={{ 
          position: "absolute", top: "5%", left: "-15%", width: "50%", height: "50%", 
          background: `radial-gradient(circle, ${brandColor}12 0%, transparent 75%)`, 
          zIndex: -1, filter: "blur(120px)" 
        }} 
      />
      <Box 
        sx={{ 
          position: "absolute", bottom: "15%", right: "-15%", width: "50%", height: "50%", 
          background: `radial-gradient(circle, ${brandColor}0d 0%, transparent 75%)`, 
          zIndex: -1, filter: "blur(120px)" 
        }} 
      />

      <Container maxWidth="md" sx={{ pt: { xs: 8, md: 10 }, pb: { xs: 6, md: 8 } }}>
        
        {/* Back Button */}
        <Button 
          component={RouterLink}
          to="/blog"
          startIcon={<ArrowBackIcon />}
          sx={{ color: "text.secondary", fontWeight: 800, mb: 5, "&:hover": { color: brandColor } }}
        >
          Back to Blog Listing
        </Button>

        {/* Article Meta Header */}
        <Box sx={{ mb: 6 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: "center" }}>
            <Chip 
              label={article.category} 
              size="small"
              sx={{ bgcolor: `${brandColor}0d`, color: brandColor, fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.05em", fontFamily: "Space Mono" }} 
            />
            <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary", fontSize: "0.85rem" }}>
              <CalendarMonthIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
              {article.date}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary", fontSize: "0.85rem" }}>
              <AccessTimeIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
              {article.readTime}
            </Box>
          </Stack>

          <Typography 
            variant={isMobile ? "h4" : "h2"} 
            sx={{ 
              fontWeight: 950, 
              letterSpacing: "-0.03em", 
              lineHeight: 1.2, 
              mb: 3,
              fontFamily: "Space Grotesk, sans-serif",
              color: "#fff"
            }}
          >
            {article.title}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {article.tags.map((tag, idx) => (
              <Chip 
                key={idx} 
                label={`#${tag}`} 
                size="small" 
                sx={{ 
                  bgcolor: "rgba(255,255,255,0.02)", 
                  border: "1px solid rgba(255,255,255,0.06)", 
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "Space Mono",
                  fontWeight: 600
                }} 
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 6 }} />

        {/* Article Content Compiler */}
        <Box sx={{ mb: 10 }}>
          {article.contentBlocks.map((block, idx) => {
            switch (block.type) {
              case "paragraph":
                return (
                  <Typography 
                    key={idx} 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: "1.1rem", 
                      lineHeight: 1.8, 
                      mb: 4, 
                      fontWeight: 400 
                    }}
                  >
                    {block.text}
                  </Typography>
                );

              case "header":
                return (
                  <Box key={idx} sx={{ mt: 5, mb: 2.5 }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 900, 
                        fontFamily: "Space Grotesk", 
                        color: "#fff",
                        mb: 1.5
                      }}
                    >
                      {block.title}
                    </Typography>
                    {block.text && (
                      <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", lineHeight: 1.8, mb: 2 }}>
                        {block.text}
                      </Typography>
                    )}
                  </Box>
                );

              case "quote":
                return (
                  <Box 
                    key={idx} 
                    sx={{ 
                      p: 4, 
                      my: 5, 
                      bgcolor: `${brandColor}03`, 
                      borderLeft: `4px solid ${brandColor}`, 
                      borderRadius: "0 16px 16px 0",
                      boxShadow: `0 10px 30px ${brandColor}03`
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontStyle: "italic", 
                        fontWeight: 500, 
                        lineHeight: 1.6, 
                        color: "text.primary",
                        fontFamily: "Space Grotesk"
                      }}
                    >
                      “{block.text}”
                    </Typography>
                  </Box>
                );

              case "list":
                return (
                  <Stack key={idx} spacing={2} sx={{ my: 3.5, pl: 2 }}>
                    {block.items?.map((item, itemIdx) => (
                      <Stack direction="row" spacing={2} key={itemIdx} sx={{ alignItems: "flex-start" }}>
                        <CheckCircleIcon sx={{ color: "success.main", mt: 0.3, fontSize: "1.2rem" }} />
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}>
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                );

              case "cta":
                return (
                  <Card 
                    key={idx} 
                    sx={{ 
                      p: 6, 
                      my: 6, 
                      bgcolor: "rgba(255,255,255,0.02)", 
                      border: `1px solid ${brandColor}33`, 
                      borderRadius: "28px", 
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 50% 50%, ${brandColor}0a 0%, transparent 60%)`, pointerEvents: "none" }} />
                    <CardContent sx={{ position: "relative", zIndex: 1, p: 0 }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5, fontFamily: "Space Grotesk" }}>
                        {block.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ maxW: 500, mx: "auto", mb: 4.5, fontSize: "1rem" }}>
                        Join thousands of creators who skip centralized payout hold cycles and keep 100% of their donor volume peer-to-peer.
                      </Typography>
                      <Stack 
                        direction={{ xs: "column", sm: "row" }} 
                        spacing={2} 
                        sx={{ justifyContent: "center" }}
                      >
                        <Button 
                          component={RouterLink}
                          to="/"
                          variant="contained" 
                          startIcon={<BoltIcon sx={{ color: "#000" }} />}
                          sx={{ bgcolor: brandColor, color: "#000", px: 4, py: 1.6, borderRadius: "12px", fontWeight: 800, "&:hover": { bgcolor: brandColor, opacity: 0.9 } }}
                        >
                          Get Started Now
                        </Button>
                        <Button 
                          component={RouterLink}
                          to="/dashboard"
                          variant="outlined" 
                          sx={{ borderColor: brandColor, color: "#fff", px: 4, py: 1.6, borderRadius: "12px", fontWeight: 800, "&:hover": { borderColor: brandColor, bgcolor: "rgba(255,255,255,0.03)" } }}
                        >
                          Creator Space
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                );

              case "table":
                return (
                  <TableContainer 
                    key={idx} 
                    component={Paper} 
                    sx={{ 
                      my: 5, 
                      bgcolor: "rgba(255,255,255,0.01)", 
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "20px",
                      overflow: "hidden"
                    }}
                  >
                    <Table>
                      <TableHead sx={{ bgcolor: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <TableRow>
                          {block.headers?.map((header, hIdx) => (
                            <TableCell key={hIdx} sx={{ fontWeight: 900, color: hIdx === 0 ? "#fff" : "text.secondary", py: 2 }}>
                              {header}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {block.rows?.map((row, rIdx) => {
                          const isSolChat = row[0].includes("SolChat");
                          return (
                            <TableRow key={rIdx} sx={{ borderBottom: rIdx === block.rows!.length - 1 ? "none" : "1px solid rgba(255,255,255,0.04)", bgcolor: isSolChat ? `${brandColor}03` : "transparent" }}>
                              {row.map((cell, cIdx) => (
                                <TableCell key={cIdx} sx={{ color: cIdx === 0 ? (isSolChat ? brandColor : "#fff") : "text.secondary", fontWeight: isSolChat && cIdx < 2 ? 800 : 500 }}>
                                  {cell}
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                );

              default:
                return null;
            }
          })}
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 6 }} />

        {/* Related Articles listing */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, fontFamily: "Space Grotesk" }}>
            Related Articles
          </Typography>

          <Grid container spacing={3.5}>
            {relatedArticles.map((art, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={idx}>
                <Card 
                  sx={{ 
                    p: 3, 
                    height: "100%", 
                    bgcolor: "rgba(255,255,255,0.01)", 
                    border: `1px solid rgba(255,255,255,0.05)`, 
                    borderRadius: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.3s, border-color 0.3s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      borderColor: `${brandColor}33`
                    }
                  }}
                >
                  <Box>
                    <Chip 
                      label={art.category} 
                      size="small"
                      sx={{ bgcolor: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.6)", fontWeight: 800, fontSize: "0.6rem", fontFamily: "Space Mono", mb: 2 }} 
                    />
                    <Typography 
                      variant="subtitle1" 
                      component={RouterLink}
                      to={`/blog/${art.slug}`}
                      sx={{ 
                        fontWeight: 800, 
                        display: "block", 
                        textDecoration: "none", 
                        color: "#fff", 
                        fontFamily: "Space Grotesk",
                        lineHeight: 1.35,
                        mb: 1.5,
                        "&:hover": { color: brandColor } 
                      }}
                    >
                      {art.title}
                    </Typography>
                  </Box>

                  <Button 
                    component={RouterLink}
                    to={`/blog/${art.slug}`}
                    variant="text" 
                    color="inherit" 
                    endIcon={<BoltIcon sx={{ color: brandColor }} />}
                    sx={{ fontWeight: 800, px: 0, justifyContent: "flex-start", "&:hover": { color: brandColor } }}
                  >
                    Read
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

      </Container>
    </Box>
  );
}
