import WalletConnect from "../components/features/wallet/WalletConnect";
import { Container, Box } from "@mui/material";

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: "calc(100vh - 64px)" }}>
      <Box sx={{ animation: "fadeInUp 0.6s ease-out" }}>
        <WalletConnect />
      </Box>
    </Container>
  );
}
