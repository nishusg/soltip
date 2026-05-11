import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { getUserProfile } from "../services/api";
import { Box, Typography, TextField, IconButton, Avatar, Paper, Button, Modal } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import BoltIcon from "@mui/icons-material/Bolt";
import SuperChatForm from "./SuperChatForm";

interface Message {
  id: string;
  wallet: string;
  name: string;
  avatar: string;
  message: string;
  timestamp: string;
  amount?: number; // In lamports (for Super Chat)
  tx_hash?: string;
}

interface ChatBoxProps {
  streamId: string;
  creatorWallet: string;
}

export default function ChatBox({ streamId, creatorWallet }: ChatBoxProps) {
  const { socket } = useSocket();
  const { walletAddress, isAuthenticated } = useWalletAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showSuperChat, setShowSuperChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load current user profile for chat metadata
  useEffect(() => {
    if (isAuthenticated && walletAddress) {
      getUserProfile(walletAddress).then((data) => setCurrentUser(data.user));
    }
  }, [isAuthenticated, walletAddress]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleSuperChat = (tx: any) => {
      // Map transaction data to Message format
      const msg: Message = {
        id: tx._id,
        wallet: tx.sender_wallet,
        name: tx.sender_wallet.slice(0, 4) + "...", // Fallback name
        avatar: "",
        message: tx.message,
        timestamp: tx.timestamp,
        amount: tx.amount,
        tx_hash: tx.tx_hash
      };
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive_message", handleMessage);
    socket.on("new_superchat", handleSuperChat);

    return () => {
      socket.off("receive_message");
      socket.off("new_superchat");
    };
  }, [socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!socket || !input.trim() || !isAuthenticated) return;

    const chatData = {
      streamId,
      wallet: walletAddress,
      name: currentUser?.name || "Anonymous",
      avatar: currentUser?.avatar_url || "",
      message: input,
    };

    socket.emit("chat_message", chatData);
    setInput("");
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Messages Area */}
      <Box 
        ref={scrollRef}
        sx={{ 
          flexGrow: 1, 
          overflowY: "auto", 
          p: 2, 
          display: "flex", 
          flexDirection: "column", 
          gap: 1.5,
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.05)", borderRadius: "3px" }
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ mt: "auto", mb: "auto", textAlign: "center", opacity: 0.5 }}>
            <Typography variant="body2">Welcome to the chat!</Typography>
            <Typography variant="caption">Be respectful and have fun.</Typography>
          </Box>
        ) : (
          messages.map((msg) => (
            <Box 
              key={msg.id} 
              sx={{ 
                display: "flex", 
                gap: 1.5, 
                animation: "fadeInUp 0.3s ease-out",
                p: msg.amount ? 1.5 : 0,
                borderRadius: "12px",
                bgcolor: msg.amount ? "rgba(112, 0, 255, 0.15)" : "transparent",
                border: msg.amount ? "1px solid rgba(112, 0, 255, 0.3)" : "none",
                boxShadow: msg.amount ? "0 0 15px rgba(112, 0, 255, 0.1)" : "none"
              }}
            >
              <Avatar src={msg.avatar} sx={{ width: 32, height: 32, mt: 0.5 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: msg.amount ? "secondary.light" : "primary.main" }}>
                      {msg.name}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: "0.6rem", opacity: 0.4 }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  {msg.amount && (
                    <Typography variant="caption" sx={{ fontWeight: 900, color: "secondary.light", bgcolor: "rgba(112, 0, 255, 0.3)", px: 1, borderRadius: "4px" }}>
                      {msg.amount / 1000000000} SOL
                    </Typography>
                  )}
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    wordBreak: "break-word", 
                    lineHeight: 1.4,
                    fontWeight: msg.amount ? 700 : 400,
                    color: msg.amount ? "#fff" : "inherit"
                  }}
                >
                  {msg.message}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 2, bgcolor: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {isAuthenticated ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton 
              color="secondary" 
              onClick={() => setShowSuperChat(true)}
              sx={{ bgcolor: "rgba(112, 0, 255, 0.1)", "&:hover": { bgcolor: "rgba(112, 0, 255, 0.2)" } }}
            >
              <BoltIcon />
            </IconButton>
            <TextField
              fullWidth
              size="small"
              placeholder="Send a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              autoComplete="off"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  bgcolor: "rgba(255,255,255,0.03)"
                }
              }}
            />
            <IconButton 
              color="primary" 
              onClick={sendMessage} 
              disabled={!input.trim()}
              sx={{ bgcolor: "rgba(0,242,255,0.1)", "&:hover": { bgcolor: "rgba(0,242,255,0.2)" } }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        ) : (
          <Paper sx={{ p: 1.5, textAlign: "center", bgcolor: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <Typography variant="caption" color="text.secondary">
              Sign in to participate in the chat
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Super Chat Modal */}
      <Modal
        open={showSuperChat}
        onClose={() => setShowSuperChat(false)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
      >
        <Box sx={{ width: "100%", maxWidth: 450 }}>
          <SuperChatForm 
            streamId={streamId} 
            creatorWallet={creatorWallet} 
            onClose={() => setShowSuperChat(false)}
            onSuccess={() => {}} // Could add logic here to refresh stats
          />
        </Box>
      </Modal>
    </Box>
  );
}
