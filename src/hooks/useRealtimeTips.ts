// ============================================================================
// Real-time Tips Hook — hooks/useRealtimeTips.ts
// ============================================================================
//
// Connects to the backend WebSocket server using socket.io-client.
// Listens for "new_tip" events and returns the latest tip.
// ============================================================================

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// Get the base URL (remove /api from VITE_API_URL if present)
const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_BASE = rawApiUrl.endsWith("/api") ? rawApiUrl.slice(0, -4) : rawApiUrl;

export function useRealtimeTips() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [newTip, setNewTip] = useState<any | null>(null);

  useEffect(() => {
    const socketInstance = io(API_BASE, {
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket server:", socketInstance.id);
    });

    socketInstance.on("new_tip", (tip: any) => {
      console.log("New tip received via WebSocket:", tip);
      setNewTip(tip);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, newTip, clearNewTip: () => setNewTip(null) };
}
