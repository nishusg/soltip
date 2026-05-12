import { useWalletAuth } from "../hooks/useWalletAuth";
import WalletConnect from "../components/WalletConnect";
import TipForm from "../components/TipForm";
import RecentTips from "../components/RecentTips";
import { Container, Box, Divider } from "@mui/material";
import SEO from "../components/SEO";

export default function Home() {
  const { connected } = useWalletAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: "calc(100vh - 64px)" }}>
      <SEO />
      {/* Show hero section when no wallet is connected */}
      {!connected && <WalletConnect />}

      <Box sx={{ animation: "fadeInUp 0.6s ease-out" }}>

        {connected && (
          <>
            <Divider sx={{ my: 6, opacity: 0.1 }} />
            <Box sx={{ maxWidth: "md", mx: "auto" }}>
              <TipForm />
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}
