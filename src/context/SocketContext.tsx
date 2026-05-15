import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useWalletAuth } from "../hooks/useWalletAuth";
import toast from "react-hot-toast";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const useSocket = () => useContext(SocketContext);

import { SOCKET_URL } from "../shared/constants";

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
      console.log("Connected to WebSocket");
      
      // Register wallet if authenticated
      if (isAuthenticated && walletAddress) {
        s.emit("register_wallet", walletAddress);
      }
    });

    s.on("disconnect", () => {
      setConnected(false);
      console.log("Disconnected from WebSocket");
    });

    s.on("notification", (notif: any) => {
      console.log("New notification:", notif);
      
      if (notif.type === "tip_received") {
        toast.success(`You received a ${notif.data.amount / 1e9} SOL Super Chat from ${notif.data.sender}!`, { duration: 5000 });
      } else if (notif.type === "payment_confirmed") {
        toast.success(`Your payment of ${notif.data.amount / 1e9} SOL was confirmed!`, { duration: 4000 });
      } else if (notif.type === "announcement") {
        toast((t) => (
          <div onClick={() => toast.dismiss(t.id)}>
            <strong>📣 {notif.data.creator_name}</strong>
            <div style={{ fontSize: "0.9rem", marginTop: "4px" }}>{notif.data.message}</div>
          </div>
        ), { duration: 8000 });
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
      socket.emit("register_wallet", walletAddress);
    }
  }, [socket, connected, isAuthenticated, walletAddress]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
