import type { FormEvent } from "react";
import { useState, useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "../context/AuthContext";
import { sendTip, getExplorerUrl, calculateFeeBreakdown } from "../services/solana";
import { verifyTransaction } from "../services/api";
import { PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import { Card, CardContent, Typography, TextField, Button, Box, CircularProgress, Link, Alert, Stack } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import SendIcon from "@mui/icons-material/Send";

type TxStatus = "idle" | "sending" | "verifying" | "success" | "error";

export default function TipForm() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { isAuthenticated, login, isLoading } = useAuth();

  const [creatorAddress, setCreatorAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const feeBreakdown = useMemo(() => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return null;
    return calculateFeeBreakdown(parsed);
  }, [amount]);

  const isFormValid = useMemo(() => {
    if (!creatorAddress) return false;
    try {
      new PublicKey(creatorAddress);
    } catch {
      return false;
    }
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed < 0.01) return false;
    if (message.length > 280) return false;
    return true;
  }, [creatorAddress, amount, message]);

  async function handleSendTip(e: FormEvent) {
    e.preventDefault();

    if (!wallet.publicKey || !isAuthenticated) return;
    if (txStatus === "sending" || txStatus === "verifying") return;

    setTxStatus("sending");
    setErrorMsg(null);
    setTxHash(null);

    try {
      const signature = await sendTip(
        connection,
        wallet,
        creatorAddress,
        parseFloat(amount)
      );
      setTxHash(signature);
      setTxStatus("verifying");

      try {
        await verifyTransaction(
          signature,
          wallet.publicKey.toString(),
          creatorAddress,
          message
        );
      } catch (verifyErr) {
        console.warn("Backend verification failed:", verifyErr);
        toast.error("Transaction sent, but backend verification failed");
      }

      setTxStatus("success");
      toast.success("Tip sent successfully!");

      setCreatorAddress("");
      setAmount("");
      setMessage("");
    } catch (err: any) {
      setTxStatus("error");
      const msg = err.message || "Transaction failed";
      setErrorMsg(msg);
      toast.error(msg);
      console.error("Tip error:", err);
    }
  }

  if (!isAuthenticated) {
    return (
      <Card sx={{ textAlign: "center", py: 6, mb: 4 }}>
        <CardContent>
          <LockIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          {wallet.connected ? (
            <>
              <Typography variant="h6" gutterBottom>
                Please sign in to verify your wallet and send tips.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={login}
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </>
          ) : (
            <Typography variant="h6" color="text.secondary">
              Connect your wallet and sign in to send tips
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          Send a{" "}
          <Box
            component="span"
            sx={{
              background: "linear-gradient(90deg, #00e5ff 0%, #b400ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Superchat
          </Box>
        </Typography>

        <form onSubmit={handleSendTip}>
          <Stack spacing={3}>
            <TextField
              label="Creator Wallet Address"
              variant="outlined"
              fullWidth
              placeholder="Enter Solana wallet address..."
              value={creatorAddress}
              onChange={(e) => setCreatorAddress(e.target.value)}
              disabled={txStatus === "sending" || txStatus === "verifying"}
            />

            <TextField
              label="Amount (SOL)"
              variant="outlined"
              type="number"
              fullWidth
              placeholder="0.01"
              inputProps={{ min: "0.01", step: "0.01" }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={txStatus === "sending" || txStatus === "verifying"}
            />

            {feeBreakdown && (
              <Box sx={{ p: 2, bgcolor: "rgba(0,0,0,0.2)", borderRadius: 2 }}>
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Total amount</Typography>
                    <Typography variant="body2">{feeBreakdown.total} SOL</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Platform fee (5%)</Typography>
                    <Typography variant="body2" color="error.main">-{feeBreakdown.fee} SOL</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <Typography variant="body2" fontWeight={600}>Creator receives</Typography>
                    <Typography variant="body2" fontWeight={600} color="primary.main">{feeBreakdown.creatorAmount} SOL</Typography>
                  </Box>
                </Stack>
              </Box>
            )}

            <TextField
              label="Message (optional)"
              variant="outlined"
              multiline
              rows={3}
              fullWidth
              placeholder="Write a superchat message..."
              inputProps={{ maxLength: 280 }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={txStatus === "sending" || txStatus === "verifying"}
              helperText={`${message.length}/280`}
              FormHelperTextProps={{ sx: { textAlign: "right" } }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={!isFormValid || txStatus === "sending" || txStatus === "verifying"}
              startIcon={
                txStatus === "sending" || txStatus === "verifying" ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SendIcon />
                )
              }
              sx={{ py: 1.5 }}
            >
              {txStatus === "sending" && "Sending..."}
              {txStatus === "verifying" && "Verifying..."}
              {txStatus === "idle" && "Send Tip"}
              {txStatus === "success" && "Send Tip"}
              {txStatus === "error" && "Retry"}
            </Button>
          </Stack>
        </form>

        {txStatus === "success" && txHash && (
          <Alert severity="success" sx={{ mt: 3, backgroundColor: "rgba(46, 125, 50, 0.2)" }}>
            Tip sent successfully!{" "}
            <Link href={getExplorerUrl(txHash)} target="_blank" rel="noopener noreferrer" color="primary.main">
              View on Solana Explorer →
            </Link>
          </Alert>
        )}

        {txStatus === "error" && errorMsg && (
          <Alert severity="error" sx={{ mt: 3, backgroundColor: "rgba(211, 47, 47, 0.2)" }}>
            {errorMsg}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
