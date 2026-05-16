import { Container, Box, Typography, Button, Card, CardContent } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";

export default function UnauthorizedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  return (
    <Box sx={{ 
      position: "relative", 
      minHeight: "calc(100vh - 64px)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      overflow: "hidden" 
    }}>
      <SEO title="Session Expired" description="Your session has expired or you are not authorized to view this page." />

      {/* Decorative background */}
      <Box 
        sx={{ 
          position: "absolute", top: "20%", left: "10%", width: "40%", height: "40%", 
          background: "radial-gradient(circle, rgba(153, 69, 255, 0.15) 0%, transparent 70%)", 
          zIndex: -1, filter: "blur(100px)" 
        }} 
      />
      <Box 
        sx={{ 
          position: "absolute", bottom: "20%", right: "10%", width: "40%", height: "40%", 
          background: "radial-gradient(circle, rgba(20, 241, 149, 0.1) 0%, transparent 70%)", 
          zIndex: -1, filter: "blur(100px)" 
        }} 
      />

      <Container maxWidth="sm">
        <Card sx={{ 
          textAlign: "center", 
          py: 6, 
          px: { xs: 2, sm: 4 },
          borderRadius: "32px",
          bgcolor: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          animation: "fadeInUp 0.8s ease-out"
        }}>
          <CardContent>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: "24px", 
              bgcolor: "rgba(153, 69, 255, 0.1)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              mx: "auto",
              mb: 4,
              border: "1px solid rgba(153, 69, 255, 0.2)",
              color: "secondary.main"
            }}>
              <LockOutlinedIcon sx={{ fontSize: 40 }} />
            </Box>

            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, letterSpacing: "-0.02em" }}>
              Session <Box component="span" sx={{ 
                background: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>Expired</Box>
            </Typography>

            <Typography variant="h6" color="text.secondary" sx={{ mb: 6, fontWeight: 400, lineHeight: 1.6 }}>
              Your session has ended or you don't have permission to access this area. 
              Please sign back in with your wallet to continue.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => document.querySelector<HTMLButtonElement>(".wallet-adapter-button")?.click()}
                sx={{ 
                  py: 2, 
                  borderRadius: "16px", 
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  background: "linear-gradient(135deg, #14F195 0%, #9945FF 100%)",
                  color: "#fff",
                  boxShadow: "0 10px 30px rgba(20, 241, 149, 0.2)",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: "0 15px 40px rgba(20, 241, 149, 0.3)" }
                }}
              >
                Sign In & Continue
              </Button>

              <Button
                component={RouterLink}
                to="/"
                variant="text"
                sx={{ color: "text.secondary", fontWeight: 700, "&:hover": { color: "#fff" } }}
              >
                Return to Home
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
