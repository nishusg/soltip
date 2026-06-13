import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useWalletAuth } from "../../../hooks/useWalletAuth";
import { useAuth } from "../../../context/AuthContext";
import { useRealtimeTips } from "../../../hooks/useRealtimeTips";
import { listTransactions } from "../../../services/api";
import { getExplorerUrl } from "../../../services/solana";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Card, CardContent, Typography, List, ListItem, Box, Link, Chip, Tooltip, Button } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import BoringAvatar from "boring-avatars";
import { logger } from "../../../utils/logger";
import type { Tip } from "../../../types";
import { RecentTipsSkeleton } from "../../common/LoadingSkeletons";
import toast from "react-hot-toast";

export default function RecentTips() {
  const { walletAddress, isAuthenticated } = useWalletAuth();
  const { user } = useAuth();
  const { newTip, clearNewTip } = useRealtimeTips();
  const [transactions, setTransactions] = useState<Tip[]>([]);
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
        logger.error("Failed to fetch transactions:", err);
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
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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

        {loading && <RecentTipsSkeleton />}

        {!loading && transactions.length === 0 && (
          <Box sx={{
            textAlign: "center",
            py: 6,
            px: 4,
            bgcolor: "rgba(255,255,255,0.01)",
            borderRadius: "20px",
            border: "1px dashed rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2
          }}>
            <Typography sx={{ fontSize: "3rem", mb: 1, display: "inline-block", animation: "bounce 2s infinite" }}>
              ✨
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Your Ledger is Clean!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 450, lineHeight: 1.6 }}>
              No transactions have been recorded yet. Share your tipping link or support other creators to populate this feed.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, width: "100%", justifyContent: "center", alignItems: "center" }}>
              <Button
                variant="contained"
                onClick={() => {
                  if (user?.username) {
                    const tippingLink = `${window.location.origin}/${user.username}`;
                    navigator.clipboard.writeText(tippingLink);
                    toast.success("Tipping link copied!");
                  } else {
                    toast.error("Please set a username in settings first!");
                  }
                }}
                sx={{
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  px: 3,
                  py: 1,
                  background: (theme: any) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.main} 100%)`,
                  boxShadow: (theme: any) => `0 4px 12px ${theme.palette.primary.main}33`,
                  "&.MuiButton-root": { color: "#fff" },
                  "&:hover": { transform: "translateY(-1px)" }
                }}
              >
                Copy Tipping Link
              </Button>
              <Button
                component={RouterLink}
                to="/leaderboard"
                variant="outlined"
                sx={{
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  px: 3,
                  py: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "text.primary",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)", transform: "translateY(-1px)" }
                }}
              >
                Find Creators
              </Button>
            </Box>
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
                      borderColor: (theme) => isSent ? `${theme.palette.primary.main}33` : `${theme.palette.secondary?.main || theme.palette.primary.main}33`
                    }
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 3 } }}>
                      <Box sx={{ 
                        width: { xs: 44, sm: 52 }, 
                        height: { xs: 44, sm: 52 }, 
                        borderRadius: "14px", 
                        overflow: "hidden",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        boxShadow: (theme) => isSent ? `0 0 15px ${theme.palette.primary.main}26` : `0 0 15px ${theme.palette.secondary?.main || theme.palette.primary.main}26`,
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
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
                          {formatSol(tx.amount)} <Box component="span" sx={{ fontSize: "0.8em", opacity: 0.7 }}>SOL</Box>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", opacity: 0.8 }}>
                          {isSent ? (
                            <>To <Link component={RouterLink} to={`/profile/${tx.creator_wallet}`} color="inherit" sx={{ fontWeight: 700 }}>{tx.creator_name || shorten(tx.creator_wallet)}</Link></>
                          ) : (
                            <>From <Link component={RouterLink} to={`/profile/${tx.sender_wallet}`} color="inherit" sx={{ fontWeight: 700 }}>{tx.sender_name || shorten(tx.sender_wallet)}</Link></>
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
                        bgcolor: (theme) => isSent ? `${theme.palette.primary.main}1a` : `${theme.palette.secondary?.main || theme.palette.primary.main}1a`,
                        color: isSent ? "primary.main" : "secondary.main",
                        borderColor: (theme) => isSent ? `${theme.palette.primary.main}4d` : `${theme.palette.secondary?.main || theme.palette.primary.main}4d`,
                        borderRadius: "8px",
                        boxShadow: (theme) => isSent ? `0 0 10px ${theme.palette.primary.main}33` : `0 0 10px ${theme.palette.secondary?.main || theme.palette.primary.main}33`
                      }}
                      variant="outlined"
                    />
                    {tx.status && (
                      <Tooltip 
                        title={
                          tx.status === "verified" 
                            ? "This tip has been successfully verified on the Solana blockchain." 
                            : tx.status === "failed" 
                              ? "This transaction failed to verify on-chain." 
                              : "This transaction is currently awaiting verification."
                        } 
                        arrow
                      >
                        <Chip
                          label={tx.status === "verified" ? "On-Chain Verified" : tx.status}
                          size="small"
                          color={tx.status === "verified" ? "success" : tx.status === "failed" ? "error" : "warning"}
                          variant="outlined"
                          sx={{ 
                            fontWeight: 800, 
                            fontSize: "0.7rem", 
                            textTransform: "uppercase",
                            borderRadius: "8px",
                            ml: 1,
                            cursor: "help"
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>

                  {tx.message && (
                    <Box sx={{ 
                      my: 2, 
                      p: 2.5, 
                      bgcolor: "rgba(255,255,255,0.03)", 
                      borderRadius: "12px",
                      borderLeft: (theme) => `4px solid ${isSent ? theme.palette.primary.main : (theme.palette.secondary?.main || theme.palette.primary.main)}`,
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      <Box sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: (theme) => `linear-gradient(90deg, ${isSent ? theme.palette.primary.main : (theme.palette.secondary?.main || theme.palette.primary.main)}0d 0%, transparent 100%)`,
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
                        "&:hover": { color: "#fff", textShadow: (theme) => `0 0 10px ${theme.palette.primary.main}80` }
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
