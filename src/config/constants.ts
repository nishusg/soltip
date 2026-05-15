import { PublicKey } from "@solana/web3.js";

// ============================================================================
// Frontend Constants — config/constants.ts
// ============================================================================

// API Endpoints
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
export const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001";

// Solana & Smart Contract
export const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || "11111111111111111111111111111111"
);

export const PLATFORM_WALLET = new PublicKey(
  import.meta.env.VITE_PLATFORM_WALLET || "11111111111111111111111111111111"
);

export const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL; // Can be undefined, fallback in main.tsx to clusterApiUrl

// Fees
export const FEE_PERCENTAGE = 0.05; // 5%
