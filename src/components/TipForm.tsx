import type { FormEvent } from "react";
import { useState, useMemo, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "../context/AuthContext";
import { sendTip, getExplorerUrl, calculateFeeBreakdown } from "../services/solana";
import { verifyTransaction } from "../services/api";
import { PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import { Card, CardContent, Typography, TextField, Button, Box, CircularProgress, Link, Alert, Stack } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import SendIcon from "@mui/icons-material/Send";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

type TxStatus = "idle" | "sending" | "verifying" | "success" | "error";

export default function TipForm({ defaultCreatorAddress = "" }: { defaultCreatorAddress?: string }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { isAuthenticated, login, isLoading } = useAuth();

  const [creatorAddress, setCreatorAddress] = useState(defaultCreatorAddress);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  // Update address if prop changes
  useEffect(() => {
    setCreatorAddress(defaultCreatorAddress);
  }, [defaultCreatorAddress]);

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
      <Card sx={{ textAlign: "center", py: 8, px: 4, mb: 4 }} className="fade-in-up">
        <CardContent>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 4,
            border: "1px solid rgba(255,255,255,0.08)"
          }}>
            <LockIcon sx={{ fontSize: 40, color: "text.secondary" }} />
          </Box>
          {wallet.connected ? (
            <>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                Sign In Required
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: "auto" }}>
                Please sign the authentication message in your wallet to verify your identity and start sending tips.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={login}
                disabled={isLoading}
                size="large"
                sx={{ px: 6 }}
              >
                {isLoading ? "Signing In..." : "Sign In & Verify"}
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                Connect Wallet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Connect your Solana wallet to send a superchat tip.
              </Typography>
              <Box sx={{
                display: "flex",
                justifyContent: "center",
                "& .wallet-adapter-button": {
                  height: "48px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  px: 4,
                  fontSize: "1rem",
                  background: "linear-gradient(135deg, #00f2ff 0%, #7000ff 100%) !important",
                  boxShadow: "0 8px 20px rgba(0, 242, 255, 0.2) !important",
                  transition: "all 0.2s ease !important",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 25px rgba(0, 242, 255, 0.3) !important",
                  }
                }
              }}>
                <WalletMultiButton />
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 6, position: "relative", overflow: "visible" }} className="fade-in-up">
      {/* Decorative accent */}
      <Box sx={{
        position: "absolute",
        top: -1,
        left: "10%",
        right: "10%",
        height: "2px",
        background: "linear-gradient(90deg, transparent, #00f2ff, #7000ff, transparent)",
        opacity: 0.5
      }} />

      <CardContent sx={{ p: { xs: 3, md: 5 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
            Send a{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(90deg, #00f2ff 0%, #7000ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Superchat
            </Box>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your tip will be instantly delivered to the creator's wallet.
          </Typography>
        </Box>

        <form onSubmit={handleSendTip}>
          <Stack spacing={4}>
            <TextField
              label="Creator Wallet Address"
              variant="outlined"
              fullWidth
              placeholder="Enter Solana wallet address..."
              value={creatorAddress}
              onChange={(e) => setCreatorAddress(e.target.value)}
              disabled={!!defaultCreatorAddress || txStatus === "sending" || txStatus === "verifying"}
              slotProps={{
                input: { sx: { fontSize: "1.05rem" } }
              }}
            />

            <Box>
              <TextField
                label="Amount (SOL)"
                variant="outlined"
                type="number"
                fullWidth
                placeholder="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={txStatus === "sending" || txStatus === "verifying"}
                slotProps={{
                  htmlInput: { min: 0.01, step: 0.01 },
                  input: { sx: { fontSize: "1.05rem" } }
                }}
              />

              {feeBreakdown && (
                <Box sx={{
                  mt: 2,
                  p: 2.5,
                  bgcolor: "rgba(255,255,255,0.02)",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.05)"
                }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">Platform fee (5%)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "error.light" }}>-{feeBreakdown.fee} SOL</Typography>
                    </Box>
                    <Box sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      pt: 1.5,
                      borderTop: "1px solid rgba(255,255,255,0.05)"
                    }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Creator receives</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>{feeBreakdown.creatorAmount} SOL</Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
            </Box>

            <TextField
              label="Message (optional)"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              placeholder="Share a message with the creator..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={txStatus === "sending" || txStatus === "verifying"}
              helperText={`${message.length}/280`}
              slotProps={{
                formHelperText: { sx: { textAlign: "right", fontWeight: 500 } },
                input: { sx: { fontSize: "1.05rem" } }
              }}
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
              sx={{
                py: 2,
                fontSize: "1.1rem",
                borderRadius: "14px"
              }}
            >
              {txStatus === "sending" && "Executing Transaction..."}
              {txStatus === "verifying" && "Verifying on Ledger..."}
              {txStatus === "idle" && "Send Superchat"}
              {txStatus === "success" && "Send Another"}
              {txStatus === "error" && "Retry Transaction"}
            </Button>
          </Stack>
        </form>

        {txStatus === "success" && txHash && (
          <Alert
            severity="success"
            sx={{
              mt: 4,
              borderRadius: "14px",
              bgcolor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              color: "#fff",
              "& .MuiAlert-icon": { color: "success.main" }
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>Tip sent successfully!</Typography>
            <Link
              href={getExplorerUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                mt: 0.5,
                "&:hover": { textDecoration: "underline" }
              }}
            >
              View on Solana Explorer →
            </Link>
          </Alert>
        )}

        {txStatus === "error" && errorMsg && (
          <Alert
            severity="error"
            sx={{
              mt: 4,
              borderRadius: "14px",
              bgcolor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#fff",
              "& .MuiAlert-icon": { color: "error.main" }
            }}
          >
            {errorMsg}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
