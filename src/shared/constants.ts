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
const platformFeeEnv = import.meta.env.VITE_PLATFORM_FEE;
export const PLATFORM_FEE_PCT = platformFeeEnv ? parseInt(platformFeeEnv) : 5;
export const FEE_PERCENTAGE = PLATFORM_FEE_PCT / 100;

// Site Metadata
export const SITE_NAME = import.meta.env.VITE_SITE_NAME;
export const SITE_URL = import.meta.env.VITE_SITE_URL;

// UI / Design tokens
/** Canonical Solana-branded palette used for all BoringAvatar instances. */
export const AVATAR_COLORS: [string, string, string, string, string] = [
  "#9945FF", // Solana purple
  "#14F195", // Solana green
  "#8052FF", // Deep violet
  "#00FF80", // Neon mint
  "#E1C3FF", // Soft lavender
];
