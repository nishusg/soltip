// ============================================================================
// Activity Ledger Component — ActivityPage.tsx
// ============================================================================
//
// A high-end, premium Web3 ledger dashboard for broadcasters.
// Highlights:
//   1. **Top Donators Card**: Live calculation & ranking of top supporters with neon progress bars.
//   2. **LED Statistics Panels**: Net Earnings, Tip Count, Refunds, and Failed transactions.
//   3. **Interactive Tab Filters**: All, Verified, Failed, Refunds, and Sent Tips.
//   4. **Explorer Preference Engine**: Persistence selector for Solscan, Solana FM, or Solana Explorer.
//   5. **Creator Tipping Refunds**: Safe, double-checked refund action that triggers stats deduction.
//   6. **Explicit Timestamps**: Absolute date/time formatting with relative hover tooltips.
// ============================================================================

import { useState, useEffect, useMemo } from "react";
import { logger } from "../utils/logger";
import { Link as RouterLink } from "react-router-dom";
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Tabs, 
  Tab, 
  Chip, 
  Tooltip, 
  Link, 
  Stack, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  LinearProgress,
  Grid,
  Pagination
} from "@mui/material";
import { ActivityPageSkeleton } from "../components/common/LoadingSkeletons";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CancelIcon from "@mui/icons-material/Cancel";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BoringAvatar from "boring-avatars";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { listTransactions/*, refundTransaction*/ } from "../services/api";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import SEO from "../components/common/SEO";
import toast from "react-hot-toast";

interface Transaction {
  _id: string;
  tx_hash: string;
  sender_wallet: string;
  creator_wallet: string;
  sender_name?: string;
  creator_name?: string;
  amount: number;
  fee: number;
  message: string;
  timestamp: string;
  status: string;
  error_message?: string;
}

export default function ActivityPage() {
  const { walletAddress, isAuthenticated } = useWalletAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Reset pagination to page 1 when active tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);
  
  // Explorer preference (Persisted in LocalStorage)
  const [explorerPref, setExplorerPref] = useState<string>(() => {
    const pref = localStorage.getItem("soltip_explorer_pref") || "solscan";
    return pref === "solanafm" ? "solscan" : pref;
  });

  // Fetch transactions on load
  useEffect(() => {
    if (!walletAddress || !isAuthenticated) return;

    async function fetchTxs() {
      setLoading(true);
      try {
        const data = await listTransactions(walletAddress!);
        setTransactions(data.transactions || []);
      } catch (err) {
        logger.error("Failed to fetch transactions:", err);
        toast.error("Failed to sync your activity log.");
      } finally {
        setLoading(false);
      }
    }

    fetchTxs();
  }, [walletAddress, isAuthenticated]);

  // Save explorer preference
  const handleExplorerChange = (pref: string) => {
    setExplorerPref(pref);
    localStorage.setItem("soltip_explorer_pref", pref);
    toast.success(`Explorer preference set to ${pref === "solscan" ? "Solscan" : "Solana Explorer"}`);
  };

  // Generate explorer URL dynamically based on preference
  const getCustomExplorerUrl = (txHash: string) => {
    if (explorerPref === "solscan") {
      return `https://solscan.io/tx/${txHash}?cluster=devnet`;
    }
    return `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
  };

  const shorten = (addr: string): string => {
    if (!addr) return "";
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const formatSol = (lamports: number): string => {
    return (lamports / LAMPORTS_PER_SOL).toFixed(4);
  };

  const getAbsoluteTimestamp = (ts: string): string => {
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const getRelativeTime = (ts: string): string => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "just now";
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    }
    if (diff < 86400000) {
      const hrs = Math.floor(diff / 3600000);
      return `${hrs}h ago`;
    }
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  };

  // 1. Calculate Live Aggregated Statistics
  const stats = useMemo(() => {
    let verifiedEarnings = 0;
    let verifiedCount = 0;
    let failedCount = 0;
    let refundedVolume = 0;

    transactions.forEach((tx) => {
      // Received stats (authenticated user is the recipient)
      if (tx.creator_wallet === walletAddress) {
        if (tx.status === "verified") {
          verifiedEarnings += (tx.amount - tx.fee);
          verifiedCount += 1;
        } else if (tx.status === "failed") {
          failedCount += 1;
        } else if (tx.status === "refunded") {
          refundedVolume += tx.amount;
        }
      }
    });

    return {
      netEarnings: verifiedEarnings / LAMPORTS_PER_SOL,
      tipsCount: verifiedCount,
      failedCount,
      refundedVolume: refundedVolume / LAMPORTS_PER_SOL
    };
  }, [transactions, walletAddress]);

  // 2. Calculate Top Supporters (Real-Time Contribution Leaderboard)
  const topSupporters = useMemo(() => {
    const contributorMap: Record<string, { total: number; name: string }> = {};

    transactions.forEach((tx) => {
      if (tx.creator_wallet === walletAddress && tx.status === "verified") {
        const key = tx.sender_wallet;
        const displayName = tx.sender_name || shorten(tx.sender_wallet);
        if (!contributorMap[key]) {
          contributorMap[key] = { total: 0, name: displayName };
        }
        contributorMap[key].total += tx.amount / LAMPORTS_PER_SOL;
      }
    });

    return Object.entries(contributorMap)
      .map(([wallet, data]) => ({
        wallet,
        name: data.name,
        total: data.total
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [transactions, walletAddress]);

  const maxSupporterTotal = useMemo(() => {
    if (topSupporters.length === 0) return 1;
    return topSupporters[0].total;
  }, [topSupporters]);

  // 3. Filter Transactions based on active tab
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const isReceived = tx.creator_wallet === walletAddress;
      const isSent = tx.sender_wallet === walletAddress;

      if (activeTab === 0) return true; // All
      if (activeTab === 1) return isReceived && tx.status === "verified"; // Verified Tips
      if (activeTab === 2) return isReceived && tx.status === "failed"; // Failed
      // if (activeTab === 3) return isReceived && tx.status === "refunded"; // Refunds (Disabled)
      if (activeTab === 3) return isSent; // Sent Tips (Index adjusted from 4 to 3)
      return true;
    });
  }, [transactions, activeTab, walletAddress]);

  // 4. Calculate Paginated Transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  // Execute Refund Action
  /*
  const handleConfirmRefund = async () => {
    if (!refundTarget) return;
    setRefundLoading(true);
    try {
      await refundTransaction(refundTarget._id);
      
      // Update local state instantly so everything recalculates
      setTransactions((prev) => 
        prev.map((tx) => 
          tx._id === refundTarget._id ? { ...tx, status: "refunded" } : tx
        )
      );

      toast.success("Transaction marked as refunded! Statistics updated.");
      setRefundTarget(null);
    } catch (err: any) {
      logger.error("Refund failed:", err);
      toast.error(err.message || "Failed to process refund.");
    } finally {
      setRefundLoading(false);
    }
  };
  */

  if (!isAuthenticated) return null;

  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", pb: 8, overflow: "hidden" }}>
      <SEO title="Broadcaster Activity Ledger" description="Advanced real-time tip logs, failed transaction histories, and refund management tools." />

      {/* Decorative Orbs */}
      <Box 
        sx={{ 
          position: "absolute", top: "5%", left: "-10%", width: "50%", height: "50%", 
          background: (theme: any) => `radial-gradient(circle, ${theme.palette.primary.main}1a 0%, transparent 70%)`, 
          zIndex: -1, filter: "blur(120px)" 
        }} 
      />
      <Box 
        sx={{ 
          position: "absolute", bottom: "10%", right: "-10%", width: "50%", height: "50%", 
          background: (theme: any) => `radial-gradient(circle, ${theme.palette.secondary?.main || theme.palette.primary.main}1a 0%, transparent 70%)`, 
          zIndex: -1, filter: "blur(120px)" 
        }} 
      />

      <Container maxWidth="lg" sx={{ pt: 6 }}>
        {/* Page Header */}
        <Box sx={{ mb: 6, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 3 }}>
          <Box className="fade-in-up">
            <Typography variant="h2" sx={{ fontWeight: 850, mb: 1, letterSpacing: "-0.02em" }}>
              Broadcaster <Box component="span" sx={{ 
                background: (theme: any) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.main} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>Ledger</Box>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem" }}>
              Comprehensive real-time ledger auditing, failed signatures, refunds, and supporter analytics.
            </Typography>
          </Box>

          {/* Explorer Selector Choice */}
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 200, 
              bgcolor: "rgba(255,255,255,0.02)", 
              borderRadius: "12px", 
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.08)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" }
            }}
          >
            <InputLabel id="explorer-select-label" sx={{ color: "text.secondary" }}>Explorer Preferences</InputLabel>
            <Select
              labelId="explorer-select-label"
              id="explorer-select"
              value={explorerPref}
              label="Explorer Preferences"
              onChange={(e) => handleExplorerChange(e.target.value as string)}
              sx={{ borderRadius: "12px", fontWeight: 700 }}
            >
              <MenuItem value="solscan" sx={{ fontWeight: 600 }}>Solscan Ledger</MenuItem>
              <MenuItem value="explorer" sx={{ fontWeight: 600 }}>Solana Explorer</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* ---- LED statistics cards ---- */}
        <Grid container spacing={3} sx={{ mb: 5 }} className="fade-in-up">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "20px" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                  Net Tips Volume
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "secondary.main" }}>
                  {stats.netEarnings.toFixed(4)} <Box component="span" sx={{ fontSize: "0.6em", opacity: 0.8 }}>SOL</Box>
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "20px" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                  Verified Superchats
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main" }}>
                  {stats.tipsCount} <Box component="span" sx={{ fontSize: "0.6em", opacity: 0.8 }}>tips</Box>
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "20px" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                  Refunded Volume
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "warning.main" }}>
                  {stats.refundedVolume.toFixed(4)} <Box component="span" sx={{ fontSize: "0.6em", opacity: 0.8 }}>SOL</Box>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          */}

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "20px" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                  Failed Transactions
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "error.main" }}>
                  {stats.failedCount} <Box component="span" sx={{ fontSize: "0.6em", opacity: 0.8 }}>failed</Box>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ---- Core Ledger Dashboard Split ---- */}
        <Grid container spacing={4} className="fade-in-up" style={{ animationDelay: "0.15s" }}>
          
          {/* Main Ledger Feed */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ 
              bgcolor: "rgba(255,255,255,0.03)", 
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              overflow: "hidden"
            }}>
              
              {/* Tab Selector */}
              <Box id="ledger-tabs-header" sx={{ borderBottom: "1px solid rgba(255,255,255,0.06)", bgcolor: "rgba(0,0,0,0.15)" }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(_, val) => setActiveTab(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    px: 2,
                    "& .MuiTabs-indicator": { bgcolor: "primary.main", height: 3 },
                    "& .MuiTab-root": { py: 2.2, minWidth: 100, fontWeight: 700, fontSize: "0.88rem", color: "text.secondary" },
                    "& .Mui-selected": { color: "#fff !important" }
                  }}
                >
                  <Tab label="All Activities" />
                  <Tab label="Verified Tips" />
                  <Tab label="Failed Txs" />
                  {/* <Tab label="Refunds" /> */}
                  <Tab label="Sent Tips" />
                </Tabs>
              </Box>

              <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                {loading && <ActivityPageSkeleton />}

                {!loading && filteredTransactions.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 10, bgcolor: "rgba(255,255,255,0.01)", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.08)" }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                      No matching records found in this category.
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                      Ledger is clean! ✨
                    </Typography>
                  </Box>
                )}

                {!loading && filteredTransactions.length > 0 && (
                  <Stack spacing={2.5}>
                    {paginatedTransactions.map((tx) => {
                      const isSent = tx.sender_wallet === walletAddress;
                      return (
                        <Box 
                          key={tx._id || tx.tx_hash}
                          sx={{ 
                            p: 3,
                            bgcolor: "rgba(255,255,255,0.01)",
                            borderRadius: "20px",
                            border: "1px solid rgba(255,255,255,0.04)",
                            transition: "all 0.3s ease",
                            position: "relative",
                            overflow: "hidden",
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,0.03)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                              borderColor: (theme) => isSent ? `${theme.palette.primary.main}26` : `${theme.palette.secondary?.main || theme.palette.primary.main}26`
                            }
                          }}
                        >
                          {/* Inner container */}
                          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 2.5 }}>
                            
                            {/* Avatar & Sender Info */}
                            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                              <Box sx={{ 
                                width: 48, 
                                height: 48, 
                                borderRadius: "12px", 
                                overflow: "hidden",
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                border: "1px solid rgba(255,255,255,0.06)",
                                flexShrink: 0
                              }}>
                                <BoringAvatar
                                  name={isSent ? (tx.creator_name || tx.creator_wallet) : (tx.sender_name || tx.sender_wallet)}
                                  variant="beam"
                                  size="100%"
                                  colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]}
                                />
                              </Box>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 850, lineHeight: 1.2, mb: 0.5 }}>
                                  {formatSol(tx.amount)} <Box component="span" sx={{ fontSize: "0.78em", opacity: 0.7 }}>SOL</Box>
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "'Space Mono', monospace", fontSize: "0.82rem" }}>
                                  {isSent ? (
                                    <>To <Link component={RouterLink} to={`/profile/${tx.creator_wallet}`} color="primary" sx={{ fontWeight: 700, textDecoration: "none" }}>{tx.creator_name || shorten(tx.creator_wallet)}</Link></>
                                  ) : (
                                    <>From <Link component={RouterLink} to={`/profile/${tx.sender_wallet}`} color="secondary" sx={{ fontWeight: 700, textDecoration: "none" }}>{tx.sender_name || shorten(tx.sender_wallet)}</Link></>
                                  )}
                                </Typography>
                              </Box>
                            </Stack>

                            {/* Status and Action Buttons */}
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                              {/* Status Tag */}
                              <Tooltip 
                                title={
                                  tx.status === "verified" 
                                    ? "Verified successfully on-chain." 
                                    : tx.status === "refunded" 
                                      ? "Transaction has been marked as refunded."
                                      : tx.status === "failed" 
                                        ? `On-chain signature failed: ${tx.error_message || "Unknown error"}`
                                        : "Awaiting confirmation."
                                } 
                                arrow
                              >
                                <Chip
                                  icon={
                                    tx.status === "verified" ? <CheckCircleIcon sx={{ fontSize: "14px !important" }} /> :
                                    tx.status === "failed" ? <ErrorIcon sx={{ fontSize: "14px !important" }} /> :
                                    tx.status === "refunded" ? <CancelIcon sx={{ fontSize: "14px !important" }} /> :
                                    <HourglassEmptyIcon sx={{ fontSize: "14px !important" }} />
                                  }
                                  label={tx.status === "verified" ? "Verified" : tx.status === "refunded" ? "Refunded" : tx.status}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    fontWeight: 800, 
                                    fontSize: "0.72rem", 
                                    textTransform: "uppercase",
                                    borderRadius: "8px",
                                    px: 0.8,
                                    py: 1.5,
                                    borderColor: 
                                      tx.status === "verified" ? "success.main" : 
                                      tx.status === "refunded" ? "warning.main" : 
                                      tx.status === "failed" ? "error.main" : "text.secondary",
                                    color: 
                                      tx.status === "verified" ? "success.main" : 
                                      tx.status === "refunded" ? "warning.main" : 
                                      tx.status === "failed" ? "error.main" : "text.secondary",
                                    bgcolor: 
                                      tx.status === "verified" ? "rgba(46, 125, 50, 0.05)" : 
                                      tx.status === "refunded" ? "rgba(237, 108, 2, 0.05)" : 
                                      tx.status === "failed" ? "rgba(211, 47, 47, 0.05)" : "transparent"
                                  }}
                                />
                              </Tooltip>

                              {/* Direction Indicator */}
                              <Chip
                                label={isSent ? "Sent" : "Received"}
                                size="small"
                                sx={{ 
                                  fontWeight: 800, 
                                  fontSize: "0.68rem", 
                                  textTransform: "uppercase",
                                  bgcolor: (theme) => isSent ? `${theme.palette.primary.main}0d` : `${theme.palette.secondary?.main || theme.palette.primary.main}0d`,
                                  color: isSent ? "primary.main" : "secondary.main",
                                  border: (theme) => `1px solid ${isSent ? theme.palette.primary.main : (theme.palette.secondary?.main || theme.palette.primary.main)}26`,
                                  borderRadius: "8px"
                                }}
                              />

                              {/* Refund Action (Only for Received + Verified transactions)
                              {!isSent && tx.status === "verified" && (
                                <Tooltip title="Process refund and deduct statistics" arrow>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    onClick={() => setRefundTarget(tx)}
                                     
                                    sx={{ 
                                      borderRadius: "8px", 
                                      fontWeight: 800, 
                                      fontSize: "0.72rem",
                                      py: 0.5,
                                      borderColor: "warning.main",
                                      bgcolor: "rgba(237, 108, 2, 0.03)",
                                      "&:hover": { bgcolor: "warning.main", color: "#000" }
                                    }}
                                  >
                                    Refund
                                  </Button>
                                </Tooltip>
                              )}
                              */}
                            </Stack>
                          </Box>

                          {/* Message Bubble */}
                          {tx.message && (
                            <Box sx={{ 
                              my: 2.2, 
                              p: 2.5, 
                              bgcolor: "rgba(255,255,255,0.015)", 
                              borderRadius: "14px",
                              border: "1px solid rgba(255,255,255,0.03)",
                              borderLeft: (theme) => `4px solid ${isSent ? theme.palette.primary.main : (theme.palette.secondary?.main || theme.palette.primary.main)}`,
                              position: "relative"
                            }}>
                              <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.primary", opacity: 0.95, lineHeight: 1.5 }}>
                                "{tx.message}"
                              </Typography>
                            </Box>
                          )}

                          {/* Footer Details: Timestamps & Links */}
                          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", mt: 1, pt: 2, borderTop: "1px dashed rgba(255,255,255,0.05)", gap: 1.5 }}>
                            
                            {/* Explicit Timestamp with Relative hover */}
                            <Tooltip title={`Relative Time: ${getRelativeTime(tx.timestamp)}`} arrow>
                              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.02em", cursor: "help" }}>
                                {getAbsoluteTimestamp(tx.timestamp)}
                              </Typography>
                            </Tooltip>

                            {/* Explorer Link preference */}
                            <Link
                              href={getCustomExplorerUrl(tx.tx_hash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ 
                                display: "flex", 
                                alignItems: "center", 
                                fontSize: "0.8rem", 
                                gap: 0.6,
                                color: isSent ? "primary.main" : "secondary.main",
                                textDecoration: "none",
                                fontWeight: 700,
                                transition: "all 0.2s",
                                "&:hover": { color: "#fff" }
                              }}
                            >
                              Ledger Proof ({explorerPref === "solscan" ? "Solscan" : explorerPref === "solanafm" ? "Solana FM" : "Explorer"}) <OpenInNewIcon sx={{ fontSize: 13 }} />
                            </Link>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                    <Pagination 
                      count={totalPages} 
                      page={currentPage} 
                      onChange={(_, page) => {
                        setCurrentPage(page);
                        // Smooth scroll to top of tabs header container
                        document.getElementById("ledger-tabs-header")?.scrollIntoView({ behavior: "smooth" });
                      }} 
                      color="primary"
                      variant="outlined"
                      shape="rounded"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          color: "text.secondary",
                          borderColor: "rgba(255,255,255,0.1)",
                          fontWeight: 700,
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: "rgba(153, 69, 242, 0.08)"
                          },
                          "&.Mui-selected": {
                            color: "#fff",
                            borderColor: "primary.main",
                            bgcolor: "primary.main",
                            boxShadow: (theme) => `0 0 10px ${theme.palette.primary.main}4d`,
                            "&:hover": {
                              bgcolor: "primary.dark"
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar Panel: Supporter Leaderboard */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ 
              bgcolor: "rgba(255,255,255,0.03)", 
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              position: "sticky",
              top: 84
            }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 4 }}>
                  <Box sx={{ color: "secondary.main", display: "flex" }}>
                    <EmojiEventsIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 850 }}>
                    Top Supporters
                  </Typography>
                </Stack>

                {topSupporters.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: "center", bgcolor: "rgba(255,255,255,0.01)", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.05)" }}>
                    <Typography variant="body2" color="text.secondary">
                      No top donators recorded yet. Share your tipping link to climb the ranks! 🚀
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {topSupporters.map((supporter, index) => {
                      const percentage = (supporter.total / maxSupporterTotal) * 100;
                      return (
                        <Box key={supporter.wallet}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                              {/* Ranks badge color */}
                              <Box sx={{ 
                                width: 24, 
                                height: 24, 
                                borderRadius: "6px", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "0.75rem",
                                bgcolor: 
                                  index === 0 ? "#FFD70033" : 
                                  index === 1 ? "#C0C0C033" : 
                                  index === 2 ? "#CD7F3233" : "rgba(255,255,255,0.05)",
                                color: 
                                  index === 0 ? "#FFD700" : 
                                  index === 1 ? "#C0C0C0" : 
                                  index === 2 ? "#CD7F32" : "text.secondary",
                                border: 
                                  index === 0 ? "1px solid #FFD7004d" : 
                                  index === 1 ? "1px solid #C0C0C04d" : 
                                  index === 2 ? "1px solid #CD7F324d" : "1px solid rgba(255,255,255,0.05)"
                              }}>
                                {index + 1}
                              </Box>

                              <BoringAvatar
                                name={supporter.wallet}
                                variant="marble"
                                size={26}
                                colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]}
                              />
                              
                              <Typography variant="body2" sx={{ fontWeight: 800, color: "#fff" }}>
                                {supporter.name}
                              </Typography>
                            </Stack>

                            <Typography variant="body2" sx={{ fontWeight: 800, color: "secondary.main" }}>
                              {supporter.total.toFixed(4)} <Box component="span" sx={{ fontSize: "0.8em", color: "text.secondary" }}>SOL</Box>
                            </Typography>
                          </Box>

                          {/* Styled Contributors Progress indicators */}
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              height: 6,
                              borderRadius: "3px",
                              bgcolor: "rgba(255,255,255,0.03)",
                              "& .MuiLinearProgress-bar": {
                                background: (theme) => 
                                  index === 0 ? `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, #FFD700 100%)` :
                                  index === 1 ? `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, #C0C0C0 100%)` :
                                  `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                                borderRadius: "3px"
                              }
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Container>

    </Box>
  );
}
