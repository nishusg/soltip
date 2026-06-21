import type { FormEvent } from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "../../../context/AuthContext";
import { sendTip, getExplorerUrl, calculateFeeBreakdown } from "../../../services/solana";
import { verifyAndStoreTransaction, getTransactionStatus } from "../../../services/api";
import { PublicKey } from "@solana/web3.js";
import { PLATFORM_FEE_PCT, AVATAR_COLORS } from "../../../shared/constants";
import toast from "react-hot-toast";
import { logger } from "../../../utils/logger";
import { getTipTierConfig } from "../../../utils/tipTier";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  Stack,
  Chip,
  Grid,
  Divider,
  IconButton,
  CircularProgress
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import BoringAvatar from "boring-avatars";

type TxStatus = "idle" | "sending" | "verifying" | "success" | "error";

interface TipFormProps {
  defaultCreatorAddress?: string;
  creatorName?: string;
  creatorUsername?: string;
  onSuccess?: (signature: string) => void;
  onVerificationSuccess?: (txHash: string) => void;
}

export default function TipForm({
  defaultCreatorAddress = "",
  creatorName = "",
  creatorUsername = "",
  onSuccess,
  onVerificationSuccess
}: TipFormProps) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { isAuthenticated, login, isLoading: authLoading } = useAuth();

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

  // New verification status tracking
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "failed" | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const isSubmitting = useRef(false);

  // Dynamic Tipping Tier Configuration
  const tipTier = useMemo(() => {
    const parsed = parseFloat(amount);
    return getTipTierConfig(parsed);
  }, [amount]);

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

  // Handle Preset Tip Click
  const handlePresetTip = (val: number) => {
    setAmount(val.toString());
  };

  async function handleSendTip(e: FormEvent) {
    e.preventDefault();

    if (!wallet.publicKey || !isAuthenticated) return;
    if (txStatus === "sending" || txStatus === "verifying") return;
    if (isSubmitting.current) return;

    isSubmitting.current = true;
    setTxStatus("sending");
    setErrorMsg(null);
    setTxHash(null);
    setVerificationStatus(null);

    try {
      const signature = await sendTip(
        connection,
        wallet,
        creatorAddress,
        parseFloat(amount)
      );
      setTxHash(signature);
      setTxStatus("verifying");

      if (onSuccess) {
        try {
          onSuccess(signature);
        } catch (cbErr) {
          logger.error("Error in onSuccess callback:", cbErr);
        }
      }

      try {
        await verifyAndStoreTransaction({
          tx_hash: signature,
          sender_wallet: wallet.publicKey.toString(),
          creator_wallet: creatorAddress,
          message: message.trim()
        });
        setVerificationStatus("pending");
      } catch (verifyErr) {
        logger.warn("Backend verification failed:", verifyErr);
        toast.error("Transaction sent, but backend verification failed");
      }

      setTxStatus("success");
      toast.success("Tip sent successfully!");
      setAmount("");
      setMessage("");
    } catch (err: any) {
      setTxStatus("error");
      const msg = err.message || "Transaction failed";
      setErrorMsg(msg);
      toast.error(msg);
      logger.error("Tip error:", err);
    } finally {
      isSubmitting.current = false;
    }
  }

  const handleCheckStatus = async () => {
    if (!txHash) return;
    setCheckingStatus(true);
    try {
      const res = await getTransactionStatus(txHash);
      setVerificationStatus(res.status);
      if (res.status === "verified") {
        toast.success("Transaction verified on backend!");
        if (onVerificationSuccess) {
          try {
            onVerificationSuccess(txHash);
          } catch (cbErr) {
            logger.error("Error in onVerificationSuccess callback:", cbErr);
          }
        }
      } else if (res.status === "failed") {
        toast.error(`Verification failed: ${res.error || "Unknown error"}`);
      } else {
        toast.loading("Verification still in progress...", { duration: 2000 });
      }
    } catch (err: any) {
      toast.error("Failed to check status");
    } finally {
      setCheckingStatus(false);
    }
  };

  // Card Styling depending on custom creator settings
  const borderStyle = creatorName
    ? `1.5px solid ${tipTier.color === "rgba(255, 255, 255, 0.08)" || tipTier.color === "rgba(255, 255, 255, 0.15)" ? "rgba(255, 255, 255, 0.06)" : tipTier.color}`
    : "1px solid rgba(255, 255, 255, 0.08)";

  const cardGlow = creatorName && tipTier.glow !== "none" ? tipTier.glow : "none";

  if (!isAuthenticated) {
    return (
      <Card
        sx={{
          textAlign: "center",
          py: creatorName ? 4 : 8,
          px: 4,
          mb: 4,
          bgcolor: "rgba(255, 255, 255, 0.01)",
          backdropFilter: "blur(24px)",
          borderRadius: "20px",
          border: borderStyle,
          boxShadow: cardGlow,
          transition: "all 0.4s ease"
        }}
        className="fade-in-up"
      >
        <CardContent>
          <Box sx={{
            width: creatorName ? 64 : 80,
            height: creatorName ? 64 : 80,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: creatorName ? 3 : 4,
            border: "1px solid rgba(255,255,255,0.08)"
          }}>
            <LockIcon sx={{ fontSize: creatorName ? 32 : 40, color: "text.secondary" }} />
          </Box>
          {wallet.connected ? (
            <>
              <Typography variant={creatorName ? "h6" : "h5"} gutterBottom sx={{ fontWeight: 800 }}>
                {creatorName ? "Session Signature Required" : "Sign In Required"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: "auto", px: creatorName ? 2 : 0 }}>
                {creatorName
                  ? "Sign the authentication message in your wallet to verify your identity and send tips."
                  : "Please sign the authentication message in your wallet to verify your identity and start sending tips."}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={login}
                disabled={authLoading}
                size="large"
                sx={{ px: 5, borderRadius: "10px", color: "#fff" }}
              >
                {authLoading ? "Verifying..." : "Sign & Continue"}
              </Button>
            </>
          ) : (
            <>
              <Typography variant={creatorName ? "h6" : "h5"} gutterBottom sx={{ fontWeight: 800 }}>
                {creatorName ? "Connect Solana Wallet" : "Connect Wallet"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, px: creatorName ? 2 : 0 }}>
                {creatorName
                  ? "Connect your Phantom or Solana wallet to begin."
                  : "Connect your Solana wallet to send a superchat tip."}
              </Typography>
              <Box sx={{
                display: "flex",
                justifyContent: "center",
                "& .wallet-adapter-button": {
                  height: "46px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  px: 4,
                  fontSize: "0.95rem",
                  background: (theme: any) => `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%) !important`,
                  boxShadow: (theme: any) => `0 6px 15px ${theme.palette.primary.main}22 !important`,
                  transition: "all 0.2s ease !important",
                  "&:hover": {
                    transform: "translateY(-1.5px)",
                    boxShadow: (theme: any) => `0 10px 20px ${theme.palette.primary.main}3c !important`,
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
    <Card
      sx={{
        position: "relative",
        overflow: "visible",
        bgcolor: "rgba(255, 255, 255, 0.01)",
        backdropFilter: "blur(24px)",
        borderRadius: "20px",
        border: borderStyle,
        boxShadow: cardGlow,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        mb: creatorName ? 0 : 6
      }}
      className="fade-in-up"
    >
      {/* Dynamic top bar decoration */}
      {creatorName ? (
        <Box
          sx={{
            position: "absolute",
            top: -2,
            left: "10%",
            right: "10%",
            height: "3px",
            background: `linear-gradient(90deg, transparent, ${tipTier.color}, transparent)`,
            transition: "all 0.4s ease"
          }}
        />
      ) : (
        <Box sx={{
          position: "absolute",
          top: -1,
          left: "10%",
          right: "10%",
          height: "2px",
          background: (theme: any) => `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.main}, transparent)`,
          opacity: 0.5
        }} />
      )}

      <CardContent sx={{ p: { xs: 3, md: creatorName ? 5 : 5 } }}>
        {creatorName ? (
          <>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 1, justifyContent: "space-between" }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
                  <BoringAvatar
                    name={creatorName || creatorAddress}
                    variant="beam"
                    size={40}
                    colors={AVATAR_COLORS}
                  />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>⚡ Tip {creatorName}</Typography>
                  {creatorUsername && <Typography variant="caption" color="text.secondary">@{creatorUsername}</Typography>}
                </Box>
              </Stack>

              {amount && parseFloat(amount) > 0 && (
                <Chip
                  label={tipTier.badge}
                  size="small"
                  sx={{
                    bgcolor: `${tipTier.color}15`,
                    color: tipTier.color,
                    border: `1px solid ${tipTier.color}35`,
                    fontWeight: 900,
                    fontSize: "0.72rem",
                    borderRadius: "6px",
                    px: 0.5
                  }}
                />
              )}
            </Stack>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Verified on-chain tip direct to creator's wallet — {PLATFORM_FEE_PCT}% platform fee.
            </Typography>
          </>
        ) : (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
              Send a{" "}
              <Box
                component="span"
                sx={{
                  background: (theme: any) => `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.main} 100%)`,
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
        )}

        <form onSubmit={handleSendTip}>
          <Stack spacing={3}>
            {!creatorName && (
              <TextField
                label="Creator Wallet Address"
                variant="outlined"
                fullWidth
                placeholder="Enter Solana wallet address..."
                value={creatorAddress}
                onChange={(e) => setCreatorAddress(e.target.value)}
                disabled={txStatus === "sending" || txStatus === "verifying"}
                slotProps={{
                  input: { sx: { fontSize: "1.05rem" } }
                }}
              />
            )}

            {/* Quick Preset Buttons (Always show in Creator Profile view, or optionally everywhere) */}
            {creatorName && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Quick Preset Tip (SOL)
                </Typography>
                <Grid container spacing={1.5}>
                  {[0.1, 0.5, 1.0, 2.5].map((preset) => {
                    const getPresetStyles = (val: number) => {
                      if (val >= 2.5) return { color: "#ff2d55", label: "Legendary Support", glow: "0 0 18px rgba(255, 45, 85, 0.4)" };
                      if (val >= 1.0) return { color: "#ff9500", label: "Epic Support", glow: "0 0 14px rgba(255, 149, 0, 0.3)" };
                      if (val >= 0.5) return { color: "#ffcc00", label: "Premium Support", glow: "0 0 10px rgba(255, 204, 0, 0.25)" };
                      return { color: "#14F195", label: "Standard Support", glow: "0 0 8px rgba(20, 241, 149, 0.2)" };
                    };
                    const styles = getPresetStyles(preset);
                    const isSelected = amount === preset.toString();

                    return (
                      <Grid size={{ xs: 6, sm: 3 }} key={preset}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => handlePresetTip(preset)}
                          sx={{
                            py: 1.5,
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: "12px",
                            fontWeight: 800,
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            border: isSelected
                              ? `2px solid ${styles.color}`
                              : "1px solid rgba(255,255,255,0.06)",
                            bgcolor: isSelected
                              ? `${styles.color}14`
                              : "rgba(255,255,255,0.02)",
                            color: isSelected ? styles.color : "text.secondary",
                            boxShadow: isSelected ? styles.glow : "none",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              borderColor: styles.color,
                              boxShadow: styles.glow,
                              bgcolor: `${styles.color}0a`,
                              color: "#fff"
                            }
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 900 }}>
                            {preset} SOL
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: "0.55rem", opacity: 0.8, textTransform: "uppercase", mt: 0.5, fontWeight: 900 }}>
                            {styles.label.split(" ")[0]}
                          </Typography>
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Custom Amount
              </Typography>
              <TextField
                variant="outlined"
                type="number"
                fullWidth
                placeholder="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={txStatus === "sending" || txStatus === "verifying"}
                slotProps={{
                  htmlInput: { min: 0.01, step: 0.01 },
                  input: { sx: { fontSize: "1.02rem" } }
                }}
              />

              {feeBreakdown && (
                <Box sx={{
                  mt: 2,
                  p: 2.5,
                  bgcolor: "rgba(255,255,255,0.015)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.04)"
                }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="text.secondary">Platform fee ({PLATFORM_FEE_PCT}%)</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "error.light" }}>-{feeBreakdown.fee} SOL</Typography>
                    </Box>
                    <Box sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      pt: 1.5,
                      borderTop: "1px solid rgba(255,255,255,0.05)"
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Creator receives</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 900, color: creatorName ? tipTier.color : "primary.main" }}>
                        {feeBreakdown.creatorAmount} SOL
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Message
              </Typography>
              <TextField
                variant="outlined"
                multiline
                rows={3}
                fullWidth
                placeholder={creatorName ? "Type a message (it will display on stream)..." : "Share a message with the creator..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={txStatus === "sending" || txStatus === "verifying"}
                helperText={`${message.length}/280`}
                slotProps={{
                  formHelperText: { sx: { textAlign: "right", fontWeight: 500 } },
                  input: { sx: { fontSize: "1.02rem" } },
                  htmlInput: { maxLength: 280 }
                }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={!isFormValid || txStatus === "sending" || txStatus === "verifying"}
              sx={{
                py: 1.8,
                fontSize: "1.05rem",
                borderRadius: "10px",
                background: (theme: any) => creatorName
                  ? `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`
                  : undefined
              }}
            >
              {txStatus === "sending" && (creatorName ? "Executing Tip..." : "Executing Transaction...")}
              {txStatus === "verifying" && (creatorName ? "Verifying Tip..." : "Verifying on Ledger...")}
              {txStatus === "idle" && "Send Superchat"}
              {txStatus === "success" && "Send Another"}
              {txStatus === "error" && "Retry Transaction"}
            </Button>
          </Stack>
        </form>

        {(txStatus === "success" || (txStatus === "idle" && txHash)) && txHash && (
          <Alert
            severity="success"
            sx={{
              mt: 3,
              borderRadius: "10px",
              bgcolor: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.15)",
              color: "#fff",
              "& .MuiAlert-icon": { color: "success.main" }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {creatorName ? "Tip successful!" : "On-chain transaction successful!"}
            </Typography>
            <Link
              href={getExplorerUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.8rem",
                mt: 0.5,
                display: "inline-block",
                "&:hover": { textDecoration: "underline" }
              }}
            >
              {creatorName ? "View Solana Tx →" : "View on Solana Explorer →"}
            </Link>

            <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.8 }}>
                Verification:
              </Typography>
              {verificationStatus === "verified" ? (
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: "14px !important" }} />}
                  label="Verified"
                  color="success"
                  size="small"
                  sx={{ fontWeight: 800, borderRadius: "6px", height: 20 }}
                />
              ) : verificationStatus === "failed" ? (
                <Chip
                  icon={<ErrorIcon sx={{ fontSize: "14px !important" }} />}
                  label="Failed"
                  color="error"
                  size="small"
                  sx={{ fontWeight: 800, borderRadius: "6px", height: 20 }}
                />
              ) : (
                <Chip
                  label="Pending"
                  color="warning"
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 800, borderRadius: "6px", height: 20 }}
                />
              )}
              {verificationStatus !== "verified" && (
                <IconButton
                  size="small"
                  onClick={handleCheckStatus}
                  disabled={checkingStatus}
                  sx={{ ml: 1, p: 0.2, color: "inherit" }}
                >
                  {checkingStatus ? <CircularProgress size={12} color="inherit" /> : <RefreshIcon sx={{ fontSize: 14 }} />}
                </IconButton>
              )}
            </Box>
          </Alert>
        )}

        {txStatus === "error" && errorMsg && (
          <Alert
            severity="error"
            sx={{
              mt: 3,
              borderRadius: "10px",
              bgcolor: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.15)",
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
