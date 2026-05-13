import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { useRealtimeTips } from "../hooks/useRealtimeTips";
import { listTransactions } from "../services/api";
import { getExplorerUrl } from "../services/solana";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Card, CardContent, Typography, List, ListItem, Box, CircularProgress, Link, Chip } from "@mui/material";
import CallMadeIcon from "@mui/icons-material/CallMade";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface Transaction {
  _id: string;
  tx_hash: string;
  sender_wallet: string;
  creator_wallet: string;
  amount: number;
  fee: number;
  message: string;
  timestamp: string;
}

export default function RecentTips() {
  const { walletAddress, isAuthenticated } = useWalletAuth();
  const { newTip, clearNewTip } = useRealtimeTips();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (newTip && walletAddress) {
      if (
        newTip.sender_wallet === walletAddress ||
        newTip.creator_wallet === walletAddress
      ) {
        setTransactions((prev) => {
          if (prev.some((tx) => tx.tx_hash === newTip.tx_hash)) return prev;
          return [newTip, ...prev];
        });
        clearNewTip();
      }
    }
  }, [newTip, walletAddress, clearNewTip]);

  useEffect(() => {
    if (!walletAddress || !isAuthenticated) return;

    async function fetchTxs() {
      setLoading(true);
      try {
        const data = await listTransactions(walletAddress!);
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTxs();
  }, [walletAddress, isAuthenticated]);

  if (!isAuthenticated) return null;

  function shorten(addr: string): string {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  }

  function formatSol(lamports: number): string {
    return (lamports / LAMPORTS_PER_SOL).toFixed(4);
  }

  function formatTime(ts: string): string {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    }
    if (diff < 86400000) {
      const hrs = Math.floor(diff / 3600000);
      return `${hrs}h ago`;
    }
    return date.toLocaleDateString();
  }

  return (
    <Card 
      sx={{ 
        bgcolor: "rgba(255,255,255,0.03)", 
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "24px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        overflow: "hidden"
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, px: 1 }}>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 800 }}>
            Activity Log
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress size={40} thickness={4} sx={{ mb: 3, color: "primary.main" }} />
            <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: "0.1em", fontWeight: 700, textTransform: "uppercase" }}>
              Syncing ledger...
            </Typography>
          </Box>
        )}

        {!loading && transactions.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>No transactions found.</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Ready for your first tip? 🚀</Typography>
          </Box>
        )}

        {!loading && transactions.length > 0 && (
          <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {transactions.map((tx) => {
              const isSent = tx.sender_wallet === walletAddress;
              return (
                <ListItem 
                  key={tx._id || tx.tx_hash}
                  sx={{ 
                    flexDirection: "column", 
                    alignItems: "stretch", 
                    px: 3, 
                    py: 3,
                    bgcolor: "rgba(255,255,255,0.02)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.03)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.04)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                      borderColor: isSent ? "rgba(0, 242, 255, 0.2)" : "rgba(112, 0, 255, 0.2)"
                    }
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 3 } }}>
                      <Box sx={{ 
                        width: { xs: 44, sm: 52 }, 
                        height: { xs: 44, sm: 52 }, 
                        borderRadius: "14px", 
                        bgcolor: isSent ? "rgba(0, 242, 255, 0.1)" : "rgba(112, 0, 255, 0.1)",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        color: isSent ? "primary.main" : "secondary.main",
                        boxShadow: isSent ? "0 0 15px rgba(0, 242, 255, 0.15)" : "0 0 15px rgba(112, 0, 255, 0.15)"
                      }}>
                        {isSent ? <CallMadeIcon /> : <CallReceivedIcon />}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
                          {formatSol(tx.amount)} <Box component="span" sx={{ fontSize: "0.8em", opacity: 0.7 }}>SOL</Box>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", opacity: 0.8 }}>
                          {isSent ? (
                            <>To <Link component={RouterLink} to={`/profile/${tx.creator_wallet}`} color="inherit" sx={{ fontWeight: 700 }}>{shorten(tx.creator_wallet)}</Link></>
                          ) : (
                            <>From <Link component={RouterLink} to={`/profile/${tx.sender_wallet}`} color="inherit" sx={{ fontWeight: 700 }}>{shorten(tx.sender_wallet)}</Link></>
                          )}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={isSent ? "Sent" : "Received"}
                      size="small"
                      sx={{ 
                        fontWeight: 800, 
                        fontSize: "0.7rem", 
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        bgcolor: isSent ? "rgba(0, 242, 255, 0.1)" : "rgba(112, 0, 255, 0.1)",
                        color: isSent ? "primary.main" : "secondary.main",
                        borderColor: isSent ? "rgba(0, 242, 255, 0.3)" : "rgba(112, 0, 255, 0.3)",
                        borderRadius: "8px",
                        boxShadow: isSent ? "0 0 10px rgba(0, 242, 255, 0.2)" : "0 0 10px rgba(112, 0, 255, 0.2)"
                      }}
                      variant="outlined"
                    />
                  </Box>

                  {tx.message && (
                    <Box sx={{ 
                      my: 2, 
                      p: 2.5, 
                      bgcolor: "rgba(255,255,255,0.03)", 
                      borderRadius: "12px",
                      borderLeft: `4px solid ${isSent ? "#00f2ff" : "#7000ff"}`,
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      <Box sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: `linear-gradient(90deg, ${isSent ? "rgba(0,242,255,0.05)" : "rgba(112,0,255,0.05)"} 0%, transparent 100%)`,
                        pointerEvents: "none"
                      }} />
                      <Typography variant="body1" sx={{ fontStyle: "italic", color: "text.primary", opacity: 0.9, position: "relative", zIndex: 1 }}>
                        "{tx.message}"
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, pt: 2, borderTop: "1px dashed rgba(255,255,255,0.05)" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.05em" }}>
                      {formatTime(tx.timestamp)}
                    </Typography>
                    <Link
                      href={getExplorerUrl(tx.tx_hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        fontSize: "0.8rem", 
                        gap: 0.5,
                        color: "primary.main",
                        textDecoration: "none",
                        fontWeight: 700,
                        transition: "all 0.2s",
                        "&:hover": { color: "#fff", textShadow: "0 0 10px rgba(0,242,255,0.5)" }
                      }}
                    >
                      Ledger Proof <OpenInNewIcon sx={{ fontSize: 14 }} />
                    </Link>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
