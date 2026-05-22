// ============================================================================
// Auth Service — services/auth.ts
// ============================================================================
//
// Frontend authentication flow:
//
//   authenticate(wallet, signMessage):
//     1. Calls GET /api/auth/nonce to get a nonce
//     2. Constructs the message: "Sign this message to login: <nonce>"
//     3. Asks the wallet to sign it (via signMessage callback)
//     4. Sends the signature to POST /api/auth/verify
//     5. Stores the returned JWT in localStorage
//     6. Returns the token
//
//   getToken(): retrieves stored JWT
//   removeToken(): clears the JWT (logout)
//   isAuthenticated(): checks if a valid token exists
// ============================================================================

import bs58 from "bs58";
import { getNonce, verifySignature } from "./api";
import { isTokenValid } from "../utils/security";

/** localStorage key for the JWT token */
const TOKEN_KEY = "superchat_token";
/** localStorage key for the wallet address associated with the token */
const ADDRESS_KEY = "superchat_wallet";

/**
 * Full authentication flow: nonce → sign → verify → store JWT.
 *
 * @param walletAddress — the connected wallet's public key (base58)
 * @param signMessage — function from the wallet adapter to sign a message
 * @returns the JWT token string
 */
export async function authenticate(
  walletAddress: string,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
): Promise<string> {
  // -------------------------------------------------------------------
  // 1. Request nonce from backend
  // -------------------------------------------------------------------
  const { nonce } = await getNonce(walletAddress);

  // -------------------------------------------------------------------
  // 2. Build the message (must match backend's buildSignMessage format)
  // -------------------------------------------------------------------
  const domain = window.location.hostname;
  const message = `Sign this message to login: ${nonce}\nDomain: ${domain}`;
  const messageBytes = new TextEncoder().encode(message);

  // -------------------------------------------------------------------
  // 3. Request wallet signature
  // -------------------------------------------------------------------
  const signatureBytes = await signMessage(messageBytes);
  const signatureBase58 = bs58.encode(signatureBytes);

  // -------------------------------------------------------------------
  // 4. Verify with backend and get JWT
  // -------------------------------------------------------------------
  const { token } = await verifySignature(walletAddress, signatureBase58);

  // -------------------------------------------------------------------
  // 5. Store token and wallet in localStorage
  // -------------------------------------------------------------------
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ADDRESS_KEY, walletAddress);

  return token;
}

/** Get the stored JWT token (returns null if missing or expired) */
export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && !isTokenValid(token)) {
    // Token is expired — proactively clear it
    removeToken();
    return null;
  }
  return token;
}

/** Remove the stored JWT token and wallet (logout) */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADDRESS_KEY);
}

/** Get the stored wallet address */
export function getStoredAddress(): string | null {
  return localStorage.getItem(ADDRESS_KEY);
}

/** Check if the user has a stored, non-expired token */
export function isAuthenticated(): boolean {
  return !!getToken();
}
