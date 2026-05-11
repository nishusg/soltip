import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { useRealtimeTips } from "../hooks/useRealtimeTips";
import { listTransactions } from "../services/api";
import { getExplorerUrl } from "../services/solana";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Card, CardContent, Typography, List, ListItem, Box, CircularProgress, Link, Chip, Divider } from "@mui/material";
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
    <Card sx={{ mt: 6 }} className="fade-in-up">
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 800, mb: 4 }}>
          Activity Log
        </Typography>

        {loading && (
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", py: 6 }}>
            <CircularProgress size={32} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">Loading activity...</Typography>
          </Box>
        )}

        {!loading && transactions.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6, bgcolor: "rgba(255,255,255,0.01)", borderRadius: "14px", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <Typography variant="body1" color="text.secondary">No transactions found. Ready for your first tip? 🚀</Typography>
          </Box>
        )}

        {!loading && transactions.length > 0 && (
          <List disablePadding>
            {transactions.map((tx, idx) => {
              const isSent = tx.sender_wallet === walletAddress;
              return (
                <Box key={tx._id || tx.tx_hash}>
                  <ListItem sx={{ flexDirection: "column", alignItems: "stretch", px: 0, py: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: "10px", 
                          bgcolor: isSent ? "rgba(0, 242, 255, 0.1)" : "rgba(112, 0, 255, 0.1)",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          color: isSent ? "primary.main" : "secondary.main"
                        }}>
                          {isSent ? <CallMadeIcon fontSize="small" /> : <CallReceivedIcon fontSize="small" />}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {formatSol(tx.amount)} SOL
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                            {isSent ? (
                              <>To <Link component={RouterLink} to={`/profile/${tx.creator_wallet}`} color="inherit" sx={{ fontWeight: 600 }}>{shorten(tx.creator_wallet)}</Link></>
                            ) : (
                              <>From <Link component={RouterLink} to={`/profile/${tx.sender_wallet}`} color="inherit" sx={{ fontWeight: 600 }}>{shorten(tx.sender_wallet)}</Link></>
                            )}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={isSent ? "Sent" : "Received"}
                        size="small"
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: "0.7rem", 
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          bgcolor: isSent ? "rgba(0, 242, 255, 0.05)" : "rgba(112, 0, 255, 0.05)",
                          color: isSent ? "primary.main" : "secondary.main",
                          borderColor: isSent ? "rgba(0, 242, 255, 0.2)" : "rgba(112, 0, 255, 0.2)",
                          borderRadius: "6px"
                        }}
                        variant="outlined"
                      />
                    </Box>

                    {tx.message && (
                      <Box sx={{ 
                        my: 1.5, 
                        p: 2, 
                        bgcolor: "rgba(255,255,255,0.02)", 
                        borderRadius: "12px",
                        borderLeft: `3px solid ${isSent ? "#00f2ff" : "#7000ff"}`
                      }}>
                        <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.primary", opacity: 0.9 }}>
                          "{tx.message}"
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
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
                          fontWeight: 600,
                          "&:hover": { textDecoration: "underline" }
                        }}
                      >
                        Ledger Proof <OpenInNewIcon sx={{ fontSize: 14 }} />
                      </Link>
                    </Box>
                  </ListItem>
                  {idx < transactions.length - 1 && <Divider sx={{ opacity: 0.5 }} />}
                </Box>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
