// ============================================================================
// useWalletAuth Hook — hooks/useWalletAuth.ts
// ============================================================================
//
// Convenience hook that combines wallet adapter state with auth context.
//
// Returns a unified object with:
//   - Wallet state: connected, publicKey, connecting
//   - Auth state: isAuthenticated, isLoading, error
//   - Actions: login, logout
//   - Computed: walletAddress (shortened display string)
//
// Use this instead of importing useWallet and useAuth separately.
// ============================================================================

import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "../context/AuthContext";

/**
 * Shorten a Solana address for display: "ABCD...WXYZ"
 *
 * @param address — full base58 address
 * @param chars — number of chars to show on each side (default 4)
 * @returns shortened string
 */
function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Combined wallet + auth hook.
 *
 * Usage:
 *   const { connected, isAuthenticated, login, walletAddress } = useWalletAuth();
 */
export function useWalletAuth() {
  const { publicKey, connected, connecting } = useWallet();
  const { isAuthenticated, token, user, isLoading, error, login, logout, refreshUser } = useAuth();

  return {
    // Wallet state
    connected,
    connecting,
    publicKey,

    // Auth state
    isAuthenticated,
    token,
    user,
    isLoading,
    error,

    // Actions
    login,
    logout,
    refreshUser,

    // Computed helpers
    walletAddress: publicKey ? publicKey.toString() : null,
    shortAddress: publicKey ? shortenAddress(publicKey.toString()) : null,
  };
}
