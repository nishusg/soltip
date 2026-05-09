import { useState, useEffect } from "react";
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
    <Card sx={{ mt: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          Recent Transactions
        </Typography>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography color="text.secondary">Loading...</Typography>
          </Box>
        )}

        {!loading && transactions.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">No transactions yet. Send your first tip! 🚀</Typography>
          </Box>
        )}

        {!loading && transactions.length > 0 && (
          <List disablePadding>
            {transactions.map((tx, idx) => {
              const isSent = tx.sender_wallet === walletAddress;
              return (
                <Box key={tx._id || tx.tx_hash}>
                  <ListItem sx={{ flexDirection: "column", alignItems: "stretch", px: 0, py: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Chip
                          icon={isSent ? <CallMadeIcon fontSize="small" /> : <CallReceivedIcon fontSize="small" />}
                          label={isSent ? "Sent" : "Received"}
                          color={isSent ? "primary" : "secondary"}
                          size="small"
                          variant="outlined"
                        />
                        <Typography variant="subtitle1" fontWeight={600}>
                          {formatSol(tx.amount)} SOL
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {isSent ? `to ${shorten(tx.creator_wallet)}` : `from ${shorten(tx.sender_wallet)}`}
                      </Typography>
                    </Box>

                    {tx.message && (
                      <Box sx={{ my: 1, p: 1.5, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontStyle: "italic" }}>"{tx.message}"</Typography>
                      </Box>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(tx.timestamp)}
                      </Typography>
                      <Link
                        href={getExplorerUrl(tx.tx_hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary.main"
                        sx={{ display: "flex", alignItems: "center", fontSize: "0.75rem", gap: 0.5 }}
                      >
                        Explorer <OpenInNewIcon sx={{ fontSize: 12 }} />
                      </Link>
                    </Box>
                  </ListItem>
                  {idx < transactions.length - 1 && <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />}
                </Box>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
