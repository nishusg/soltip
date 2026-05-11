import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { verifyAndStoreTransaction } from "../services/api";
import { Box, Typography, TextField, Button, CircularProgress, Paper, IconButton, Grid, InputAdornment } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BoltIcon from "@mui/icons-material/Bolt";
import toast from "react-hot-toast";

interface SuperChatFormProps {
  streamId: string;
  creatorWallet: string;
  onClose: () => void;
  onSuccess: () => void;
}

// Platform wallet (to receive the fee)
const PLATFORM_WALLET = new PublicKey("vines1vzrYbzLMRdu58syvpkrtqxHLwKRLXmDLGdBtx"); 

export default function SuperChatForm({ streamId, creatorWallet, onClose, onSuccess }: SuperChatFormProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState("0.1");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      toast.error("Please connect your wallet");
      return;
    }

    const solAmount = parseFloat(amount);
    if (isNaN(solAmount) || solAmount <= 0) {
      toast.error("Invalid amount");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Processing Super Chat...");

    try {
      // 1. Create Solana Transaction
      const transaction = new Transaction();
      const lamports = solAmount * LAMPORTS_PER_SOL;
      const feeLamports = Math.floor(lamports * 0.05); // 5% fee
      const creatorLamports = lamports - feeLamports;

      // Transfer to Creator
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(creatorWallet),
          lamports: creatorLamports,
        })
      );

      // Transfer Fee to Platform
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: PLATFORM_WALLET,
          lamports: feeLamports,
        })
      );

      // 2. Send and Confirm
      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction sent:", signature);

      toast.loading("Verifying on-chain...", { id: toastId });

      // Wait for confirmation (simplified)
      await connection.confirmTransaction(signature, "processed");

      // 3. Verify on Backend
      await verifyAndStoreTransaction({
        tx_hash: signature,
        sender_wallet: publicKey.toBase58(),
        creator_wallet: creatorWallet,
        message: message,
        stream_id: streamId
      });

      toast.success("Super Chat sent!", { id: toastId });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Super Chat failed:", err);
      toast.error(err.message || "Transaction failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: "16px",
        bgcolor: "background.paper",
        border: "1px solid rgba(255,255,255,0.1)",
        position: "relative",
        animation: "fadeInUp 0.3s ease-out"
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", top: 8, right: 8, color: "grey.500" }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <BoltIcon sx={{ color: "secondary.main", fontSize: 32 }} />
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Send Super Chat</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>Select Amount (SOL)</Typography>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {[0.1, 0.5, 1.0, 5.0].map((preset) => (
                <Grid size={{ xs: 3 }} key={preset}>
                  <Button 
                    fullWidth 
                    variant={amount === preset.toString() ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setAmount(preset.toString())}
                    sx={{ 
                      borderRadius: "8px",
                      fontWeight: 700,
                      borderColor: "rgba(255,255,255,0.1)",
                      "&:hover": { borderColor: "primary.main" }
                    }}
                  >
                    {preset}
                  </Button>
                </Grid>
              ))}
            </Grid>
            
            <TextField
              fullWidth
              label="Custom Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">SOL</InputAdornment>,
                }
              }}
              helperText="5% platform fee applies"
            />
          </Box>

          <TextField
            label="Your Message"
            placeholder="Say something awesome!"
            multiline
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            required
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />

          <Button
            type="submit"
            variant="contained"
            color="secondary"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <BoltIcon />}
            sx={{
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 800,
              boxShadow: "0 0 20px rgba(112, 0, 255, 0.4)"
            }}
          >
            {loading ? "Processing..." : `Send ${amount} SOL`}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
