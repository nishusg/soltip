import { Container, Typography, Box } from "@mui/material";
import RecentTips from "../components/RecentTips";

export default function ActivityPage() {
  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", overflow: "hidden" }}>
      {/* Decorative Blur Backgrounds */}
      <Box 
        sx={{ 
          position: "absolute", top: "5%", left: "-10%", width: "50%", height: "50%", 
          background: "radial-gradient(circle, rgba(0, 242, 255, 0.1) 0%, transparent 70%)", 
          zIndex: -1, filter: "blur(80px)" 
        }} 
      />
      <Box 
        sx={{ 
          position: "absolute", bottom: "10%", right: "-10%", width: "50%", height: "50%", 
          background: "radial-gradient(circle, rgba(112, 0, 255, 0.1) 0%, transparent 70%)", 
          zIndex: -1, filter: "blur(80px)" 
        }} 
      />

      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ mb: 6, textAlign: "center" }} className="fade-in-up">
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800, 
              mb: 1,
              background: "linear-gradient(135deg, #fff 0%, #a0a0b0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Your <Box component="span" sx={{ 
              background: "linear-gradient(135deg, #00f2ff 0%, #7000ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>Activity</Box>
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            A complete history of tips sent and received by your wallet.
          </Typography>
        </Box>
        
        <Box className="fade-in-up" sx={{ animationDelay: "0.2s" }}>
          <RecentTips />
        </Box>
      </Container>
    </Box>
  );
}
