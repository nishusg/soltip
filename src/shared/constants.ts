import { PublicKey } from "@solana/web3.js";

// ============================================================================
// Frontend Constants — config/constants.ts
// ============================================================================

// API Endpoints
export const API_BASE = import.meta.env.VITE_API_URL;
export const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "");

// Solana & Smart Contract
export const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID
);

export const PLATFORM_WALLET = new PublicKey(
  import.meta.env.VITE_PLATFORM_WALLET
);

export const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL;

// Fees
export const FEE_PERCENTAGE = 0.05;

// Site Metadata
export const SITE_NAME = import.meta.env.VITE_SITE_NAME;
export const SITE_URL = import.meta.env.VITE_SITE_URL;

