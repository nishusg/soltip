import { Container, Typography, Box } from "@mui/material";
import RecentTips from "../components/RecentTips";

export default function ActivityPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8, minHeight: "calc(100vh - 64px)" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          Your <Box component="span" sx={{ color: "primary.main" }}>Activity</Box>
        </Typography>
        <Typography variant="body1" color="text.secondary">
          History of tips sent and received on your wallet.
        </Typography>
      </Box>
      <RecentTips />
    </Container>
  );
}
