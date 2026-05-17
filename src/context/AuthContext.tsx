// ============================================================================
// Auth Context — context/AuthContext.tsx
// ============================================================================
//
// React context for managing authentication state globally.
//
// Provides:
//   - isAuthenticated: whether the user has a valid JWT
//   - token: the current JWT string (or null)
//   - login(): triggers the full auth flow (nonce → sign → verify)
//   - logout(): clears the JWT and resets state
//
// The context watches the wallet connection state and automatically
// clears auth when the wallet disconnects.
// ============================================================================

import type { ReactNode } from "react";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { authenticate, getToken, removeToken, getStoredAddress } from "../services/auth";
import toast from "react-hot-toast";

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

interface AuthContextType {
  /** Whether the user is authenticated with a valid JWT */
  isAuthenticated: boolean;
  /** The current JWT token (or null) */
  token: string | null;
  /** The current user profile data */
  user: any | null;
  /** Whether an auth operation is in progress */
  isLoading: boolean;
  /** Error message from the last auth attempt (or null) */
  error: string | null;
  /** Trigger the full auth flow */
  login: () => Promise<void>;
  /** Clear auth state and logout */
  logout: () => void;
  /** Manually refresh the user profile */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------

import { getMe } from "../services/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, signMessage, connected } = useWallet();

  // Auth state
  const [token, setToken] = useState<string | null>(getToken());
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!token;

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getMe();
      setUser(data.user);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setUser(null);
    }
  }, [token, refreshUser]);

  // -------------------------------------------------------------------
  // Login: run the full nonce → sign → verify flow
  // -------------------------------------------------------------------
  const login = useCallback(async () => {
    if (isLoading) return;
    if (!publicKey || !signMessage) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const jwt = await authenticate(publicKey.toString(), signMessage);
      setToken(jwt);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, signMessage, isLoading]);

  // -------------------------------------------------------------------
  // Logout: clear JWT and state
  // -------------------------------------------------------------------
  const logout = useCallback(() => {
    removeToken();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // -------------------------------------------------------------------
  // Auto-logout only when wallet is definitely disconnected
  // -------------------------------------------------------------------
  const { connecting } = useWallet();

  useEffect(() => {
    // 1. If wallet is definitely disconnected, clear session
    if (!connected && !connecting && token) {
      logout();
      return;
    }

    // 2. If wallet is connected, ensure it matches the stored session
    if (connected && publicKey && token) {
      const currentWallet = publicKey.toString();
      const sessionWallet = getStoredAddress();

      if (sessionWallet && currentWallet !== sessionWallet) {
        console.log("Wallet switch detected. Logging out...");
        logout();
      }
    }
  }, [connected, connecting, publicKey, logout, token]);

  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
      setError("Session expired. Please sign in again.");
      toast.error("Session expired. Please sign in again.", { id: "auth-expired" });
    };

    window.addEventListener("auth:expired", handleAuthExpired);
    return () => {
      window.removeEventListener("auth:expired", handleAuthExpired);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, user, isLoading, error, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook for consuming the context
// ---------------------------------------------------------------------------
export function useAuth() {
  return useContext(AuthContext);
}
