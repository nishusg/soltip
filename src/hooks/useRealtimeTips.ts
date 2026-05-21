// ============================================================================
// Real-time Tips Hook — hooks/useRealtimeTips.ts
// ============================================================================
//
// Connects to the backend WebSocket server using socket.io-client.
// Listens for "new_tip" events and returns the latest tip.
// ============================================================================

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../shared/constants";
import { logger } from "../utils/logger";
import type { Tip } from "../types";

export function useRealtimeTips() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [newTip, setNewTip] = useState<Tip | null>(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      logger.log("Connected to WebSocket server:", socketInstance.id);
    });

    socketInstance.on("new_tip", (tip: any) => {
      logger.log("New tip received via WebSocket:", tip);
      setNewTip(tip);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, newTip, clearNewTip: () => setNewTip(null) };
}
