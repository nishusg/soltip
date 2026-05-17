import React, { useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  Typography, 
  Button, 
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DiamondIcon from "@mui/icons-material/Diamond";
import PaletteIcon from "@mui/icons-material/Palette";
import StarsIcon from "@mui/icons-material/Stars";
import BoltIcon from "@mui/icons-material/Bolt";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PLATFORM_WALLET } from "../shared/constants";
import { activateSubscription } from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
}

const SUBSCRIPTION_PRICE = 0.1; // 0.1 SOL

export default function SubscriptionModal({ open, onClose }: SubscriptionModalProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: PLATFORM_WALLET,
          lamports: SUBSCRIPTION_PRICE * LAMPORTS_PER_SOL,
        })
      );

      // 2. Send Transaction
      const signature = await sendTransaction(transaction, connection);
      
      toast.loading("Verifying payment on-chain...", { id: "sub-loading" });

      // 3. Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");

      // 4. Notify backend to activate premium
      await activateSubscription(signature);

      toast.success("Welcome to Premium! Your Gold theme is now active.", { id: "sub-loading" });
      await refreshUser();
      onClose();
    } catch (err: any) {
      console.error("Upgrade error:", err);
      toast.error(err.message || "Failed to upgrade. Please try again.", { id: "sub-loading" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "24px",
          background: "linear-gradient(135deg, #0a0800 0%, #1a1500 100%)",
          border: "1px solid rgba(255, 215, 0, 0.3)",
          boxShadow: "0 20px 60px rgba(255, 215, 0, 0.15)",
          color: "#fff"
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, textAlign: "center" }}>
        <DiamondIcon sx={{ fontSize: 48, color: "#FFD700", mb: 1 }} />
        <Typography variant="h4" sx={{ fontWeight: 900, background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          GO PREMIUM
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 16, top: 16, color: "rgba(255,255,255,0.5)" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 4 }}>
        <Typography variant="body1" sx={{ textAlign: "center", mb: 3, color: "rgba(255,255,255,0.7)" }}>
          Unlock exclusive features and support the platform for just <b>{SUBSCRIPTION_PRICE} SOL</b> / month.
        </Typography>

        <List sx={{ mb: 3 }}>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon><PaletteIcon sx={{ color: "#FFD700" }} /></ListItemIcon>
            <ListItemText 
              primary={<Typography sx={{ fontWeight: 700 }}>Exclusive Gold Theme</Typography>} 
              secondary={<Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>A premium aesthetic across the entire site.</Typography>}
            />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon><StarsIcon sx={{ color: "#FFD700" }} /></ListItemIcon>
            <ListItemText 
              primary={<Typography sx={{ fontWeight: 700 }}>Diamond Badge</Typography>} 
              secondary={<Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Stand out on the leaderboard and profiles.</Typography>}
            />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon><BoltIcon sx={{ color: "#FFD700" }} /></ListItemIcon>
            <ListItemText 
              primary={<Typography sx={{ fontWeight: 700 }}>Early Access</Typography>} 
              secondary={<Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Be the first to try new engagement tools.</Typography>}
            />
          </ListItem>
        </List>

        <Divider sx={{ mb: 3, borderColor: "rgba(255, 215, 0, 0.1)" }} />

        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          onClick={handleUpgrade}
          sx={{
            py: 2,
            borderRadius: "16px",
            fontSize: "1.1rem",
            fontWeight: 900,
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            color: "#000",
            boxShadow: "0 8px 25px rgba(255, 215, 0, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #ffea00 0%, #ffb400 100%)",
              transform: "translateY(-2px)"
            }
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#000" }} /> : `Upgrade for ${SUBSCRIPTION_PRICE} SOL`}
        </Button>
        <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 2, opacity: 0.5 }}>
          30-day access · One-time payment
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
