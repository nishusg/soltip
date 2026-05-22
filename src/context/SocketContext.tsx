import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { getToken } from "../services/auth";
import toast from "react-hot-toast";
import { SOCKET_URL } from "../shared/constants";
import { logger } from "../utils/logger";
import { sanitizeSenderName } from "../utils/security";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const useSocket = () => useContext(SocketContext);


export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { walletAddress, isAuthenticated } = useWalletAuth();

  useEffect(() => {
    const s = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {
      setConnected(true);
      logger.log("Connected to WebSocket");
      
      // Register wallet if authenticated
      if (isAuthenticated && walletAddress) {
        const token = getToken();
        if (token) {
          s.emit("register_wallet", { wallet: walletAddress, token });
        }
      }
    });

    s.on("disconnect", () => {
      setConnected(false);
      logger.log("Disconnected from WebSocket");
    });

    s.on("notification", (notif: any) => {
      logger.log("New notification:", notif);
      
      if (notif.type === "tip_received") {
        const safeSender = sanitizeSenderName(notif.data?.sender);
        const safeAmount = Number(notif.data?.amount) || 0;
        toast.success(`You received a ${safeAmount / 1e9} SOL Super Chat from ${safeSender}!`, { duration: 5000 });
      } else if (notif.type === "payment_confirmed") {
        const safeAmount = Number(notif.data?.amount) || 0;
        toast.success(`Your payment of ${safeAmount / 1e9} SOL was confirmed!`, { duration: 4000 });
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Re-register wallet if auth state changes
  useEffect(() => {
    if (socket && connected && isAuthenticated && walletAddress) {
      const token = getToken();
      if (token) {
        socket.emit("register_wallet", { wallet: walletAddress, token });
      }
    }
  }, [socket, connected, isAuthenticated, walletAddress]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
