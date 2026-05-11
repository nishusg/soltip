import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { getUserProfile } from "../services/api";
import { Box, Typography, TextField, IconButton, Avatar, Paper, Button, Modal, Menu, MenuItem, Divider } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import BoltIcon from "@mui/icons-material/Bolt";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TimerIcon from "@mui/icons-material/Timer";
import GavelIcon from "@mui/icons-material/Gavel";
import DeleteIcon from "@mui/icons-material/Delete";
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isCreator = walletAddress === creatorWallet;

  const handleModOpen = (event: React.MouseEvent<HTMLElement>, msg: Message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMsg(msg);
  };

  const handleModClose = () => {
    setAnchorEl(null);
    setSelectedMsg(null);
  };

  const handleDelete = () => {
    if (selectedMsg && socket) {
      socket.emit("delete_message", { 
        streamId, 
        messageId: selectedMsg.id, 
        wallet: walletAddress 
      });
    }
    handleModClose();
  };

  const handleTimeout = (duration: number) => {
    if (selectedMsg && socket) {
      socket.emit("timeout_user", { 
        streamId, 
        walletToTimeout: selectedMsg.wallet, 
        duration, 
        wallet: walletAddress 
      });
    }
    handleModClose();
  };

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

    const handleHistory = (history: any[]) => {
      const formatted = history.map(msg => ({
        id: msg._id,
        wallet: msg.wallet,
        name: msg.name,
        avatar: msg.avatar,
        message: msg.message,
        timestamp: msg.timestamp,
        amount: msg.amount,
        tx_hash: msg.tx_hash
      }));
      setMessages(formatted);
    };

    const handleDeleted = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, is_deleted: true } : m));
    };

    socket.on("receive_message", handleMessage);
    socket.on("new_superchat", handleSuperChat);
    socket.on("chat_history", handleHistory);
    socket.on("message_deleted", handleDeleted);

    return () => {
      socket.off("receive_message");
      socket.off("new_superchat");
      socket.off("chat_history");
      socket.off("message_deleted");
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
        {messages.filter(m => !(m as any).is_deleted).length === 0 ? (
          <Box sx={{ mt: "auto", mb: "auto", textAlign: "center", opacity: 0.5 }}>
            <Typography variant="body2">Welcome to the chat!</Typography>
            <Typography variant="caption">Be respectful and have fun.</Typography>
          </Box>
        ) : (
          messages.filter(m => !(m as any).is_deleted).map((msg) => (
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
                boxShadow: msg.amount ? "0 0 15px rgba(112, 0, 255, 0.1)" : "none",
                position: "relative",
                "&:hover .mod-btn": { opacity: 1 }
              }}
            >
              <Avatar src={msg.avatar} sx={{ width: 32, height: 32, mt: 0.5 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: msg.amount ? "primary.light" : "rgba(255,255,255,0.6)" }}>
                    {msg.name}
                  </Typography>
                  
                  {isCreator && msg.wallet !== walletAddress && (
                    <IconButton 
                      className="mod-btn"
                      size="small" 
                      onClick={(e) => handleModOpen(e, msg)}
                      sx={{ 
                        opacity: 0, 
                        transition: "opacity 0.2s", 
                        p: 0.2,
                        color: "rgba(255,255,255,0.4)",
                        "&:hover": { color: "error.main" }
                      }}
                    >
                      <MoreVertIcon fontSize="inherit" />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleModClose}
        slotProps={{
          paper: {
            sx: { 
              bgcolor: "#1a1a25", 
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
            }
          }
        }}
      >
        <MenuItem onClick={handleDelete} sx={{ color: "error.main", gap: 1.5 }}>
          <DeleteIcon fontSize="small" /> Delete Message
        </MenuItem>
        <MenuItem onClick={() => handleTimeout(60)} sx={{ gap: 1.5 }}>
          <TimerIcon fontSize="small" /> Timeout (1 min)
        </MenuItem>
        <MenuItem onClick={() => handleTimeout(300)} sx={{ gap: 1.5 }}>
          <TimerIcon fontSize="small" /> Timeout (5 min)
        </MenuItem>
        <Divider sx={{ opacity: 0.1 }} />
        <MenuItem onClick={() => {
          if (selectedMsg && socket) {
            socket.emit("ban_user", { streamId, walletToBan: selectedMsg.wallet, wallet: walletAddress });
          }
          handleModClose();
        }} sx={{ color: "error.main", gap: 1.5 }}>
          <GavelIcon fontSize="small" /> Ban User
        </MenuItem>
      </Menu>

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
