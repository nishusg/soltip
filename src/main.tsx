// ============================================================================
// Application Entry Point — main.tsx
// ============================================================================

// Polyfills for Solana libraries — must be first import
import "./polyfills";

import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { SOLANA_RPC_URL } from "./config/constants";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter 
} from "@solana/wallet-adapter-wallets";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

import "@solana/wallet-adapter-react-ui/styles.css";

function Root() {
  const endpoint = useMemo(
    () => SOLANA_RPC_URL || clusterApiUrl("devnet"),
    []
  );

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="mesh-gradient" />
      <HelmetProvider>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <SocketProvider>
                <AuthProvider>
                  <App />
                </AuthProvider>
              </SocketProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
