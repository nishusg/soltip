import { useWalletAuth } from "../hooks/useWalletAuth";
import WalletConnect from "../components/WalletConnect";
import TipForm from "../components/TipForm";
import { Container, Box } from "@mui/material";

export default function Home() {
  const { connected, walletAddress } = useWalletAuth();

  return (
    <Container maxWidth="md" sx={{ py: 4, minHeight: "calc(100vh - 64px)" }}>
      {/* Show hero section when no wallet is connected */}
      {!connected && <WalletConnect />}

      {/* Show tipping interface when wallet is connected */}
      {connected && (
        <Box sx={{ animation: "fadeInUp 0.6s ease-out" }}>
          <TipForm />
        </Box>
      )}
    </Container>
  );
}
