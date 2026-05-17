import { useState, useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { getUserProfile } from "../services/api";
import { getExplorerUrl } from "../services/solana";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { Container, Card, CardContent, Typography, Box, CircularProgress, Button, Avatar, List, ListItem, Divider, Link, Chip, Tabs, Tab } from "@mui/material";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import CallMadeIcon from "@mui/icons-material/CallMade";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SettingsIcon from "@mui/icons-material/Settings";
import ErrorIcon from "@mui/icons-material/Error";
import TipForm from "../forms/TipForm";
import SEO from "../components/SEO";
import BoringAvatar from "boring-avatars";

interface UserProfile {
  wallet_address: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  total_received: number;
  total_sent: number;
}

interface Tip {
  tx_hash: string;
  sender_wallet: string;
  creator_wallet: string;
  amount: number;
  fee: number;
  message: string;
  timestamp: string;
  status: string;
}

export default function ProfilePage() {
  const { wallet } = useParams<{ wallet: string }>();
  const { walletAddress } = useWalletAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showTipForm, setShowTipForm] = useState(false);

  useEffect(() => {
    if (!wallet) return;

    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserProfile(wallet!);
        setUser(data.user);
        setTips(data.recent_tips || []);
      } catch (err: any) {
        setError(err.message || "User not found");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [wallet]);

  function shorten(addr: string): string {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function formatSol(lamports: number): string {
    return (lamports / LAMPORTS_PER_SOL).toFixed(4);
  }

  function formatTime(ts: string): string {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }

  const receivedTips = tips.filter(t => t.creator_wallet === wallet);
  const sentTips = tips.filter(t => t.sender_wallet === wallet);

  return (
    <Container maxWidth="md" sx={{ py: 10, minHeight: "calc(100vh - 64px)" }}>
      {loading && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10 }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography color="text.secondary">Loading profile...</Typography>
        </Box>
      )}

      {error && (
        <Card sx={{ textAlign: "center", py: 6, animation: "fadeInUp 0.6s ease-out" }}>
          <CardContent>
            <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" color="error" gutterBottom>
              {error}
            </Typography>
            <Button component={RouterLink} to="/" variant="outlined" sx={{ mt: 2 }}>
              ← Back to Home
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && user && (
        <Box sx={{ animation: "fadeInUp 0.6s ease-out" }}>
          <SEO 
            title={user.name || shorten(user.wallet_address)} 
            description={user.bio || `Send a superchat to ${user.name || shorten(user.wallet_address)} on SolChat — the ultimate Solana engagement platform.`}
          />
          {/* Profile Card */}
          <Card sx={{ mb: 4, textAlign: "center", px: 4, pb: 4, pt: 0, overflow: "visible" }}>
            <Box sx={{ 
              display: "flex", 
              mt: -6, 
              mb: 2,
              mx: "auto",
              width: 120,
              height: 120,
              p: 0.6,
              borderRadius: "50%",
              border: (theme) => `4px solid ${theme.palette.background.default}`,
              boxShadow: (theme) => `0 0 20px ${theme.palette.primary.main}4d`,
              background: (theme) => theme.palette.background.default,
              alignItems: "center",
              justifyContent: "center"
            }}>
              <BoringAvatar
                name={user.name || user.wallet_address}
                variant="beam"
                size={108}
                colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]}
              />
            </Box>
            
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
                {user.name || shorten(user.wallet_address)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {user.wallet_address}
              </Typography>

              {user.bio && (
                <Typography variant="body1" sx={{ mb: 3, fontStyle: "italic", color: "text.secondary", maxWidth: 500, mx: "auto" }}>
                  "{user.bio}"
                </Typography>
              )}

              <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: 2,
                my: 4, 
                py: 3, 
                borderTop: "1px solid rgba(255,255,255,0.1)", 
                borderBottom: "1px solid rgba(255,255,255,0.1)" 
              }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ display: "block" }}>
                    Total Received
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.main} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {formatSol(user.total_received)} SOL
                  </Typography>
                </Box>
                <Box sx={{ borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
                  <Typography variant="overline" color="text.secondary" sx={{ display: "block" }}>
                    Total Sent
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "secondary.light" }}>
                    {formatSol(user.total_sent)} SOL
                  </Typography>
                </Box>
              </Box>
              
              {walletAddress === user.wallet_address ? (
                <Button component={RouterLink} to="/settings" variant="outlined" color="secondary" size="large" startIcon={<SettingsIcon />}>
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ mt: 4 }}>
                  {!showTipForm ? (
                    <Button 
                      variant="contained" 
                      size="large" 
                      onClick={() => setShowTipForm(true)}
                      sx={{ 
                        px: 6, 
                        py: 2, 
                        borderRadius: "14px", 
                        fontWeight: 800,
                        background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
                        boxShadow: (theme) => `0 8px 25px ${theme.palette.primary.main}4d`,
                        "&:hover": { transform: "translateY(-2px)", boxShadow: (theme) => `0 12px 30px ${theme.palette.primary.main}66` }
                      }}
                    >
                      Send Super Chat
                    </Button>
                  ) : (
                    <Box sx={{ textAlign: "left", animation: "fadeInUp 0.4s ease-out" }}>
                      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Send Tip</Typography>
                        <Button size="small" onClick={() => setShowTipForm(false)} sx={{ color: "text.secondary" }}>Cancel</Button>
                      </Box>
                      <TipForm defaultCreatorAddress={user.wallet_address} />
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>


          {/* Activity Tabs */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: "rgba(255,255,255,0.1)" }}>
              <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} centered textColor="primary" indicatorColor="primary">
                <Tab label={`Received (${receivedTips.length})`} sx={{ fontWeight: 700 }} />
                <Tab label={`Sent (${sentTips.length})`} sx={{ fontWeight: 700 }} />
              </Tabs>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <List disablePadding>
                {(activeTab === 0 ? receivedTips : sentTips).length === 0 ? (
                  <Typography sx={{ textAlign: "center", py: 4, color: "text.secondary", fontStyle: "italic" }}>
                    No activity found
                  </Typography>
                ) : (
                  (activeTab === 0 ? receivedTips : sentTips).map((tip, idx, arr) => (
                    <Box key={tip.tx_hash}>
                      <ListItem sx={{ flexDirection: "column", alignItems: "stretch", px: 0, py: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip 
                              icon={activeTab === 0 ? <CallReceivedIcon fontSize="small" /> : <CallMadeIcon fontSize="small" />} 
                              label={activeTab === 0 ? "Received" : "Sent"} 
                              color={activeTab === 0 ? "primary" : "secondary"} 
                              size="small" 
                              variant="outlined" 
                            />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {formatSol(tip.amount)} SOL
                            </Typography>
                            {tip.status && (
                              <Chip 
                                label={tip.status} 
                                color={tip.status === "verified" ? "success" : tip.status === "failed" ? "error" : "warning"} 
                                size="small" 
                                variant="outlined" 
                                sx={{ fontWeight: 800, fontSize: "0.65rem", height: 20, borderRadius: "6px" }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {activeTab === 0 ? (
                              <>from <Link component={RouterLink} to={`/profile/${tip.sender_wallet}`} color="inherit" sx={{ fontWeight: 600 }}>{shorten(tip.sender_wallet)}</Link></>
                            ) : (
                              <>to <Link component={RouterLink} to={`/profile/${tip.creator_wallet}`} color="inherit" sx={{ fontWeight: 600 }}>{shorten(tip.creator_wallet)}</Link></>
                            )}
                          </Typography>
                        </Box>

                        {tip.message && (
                          <Box sx={{ my: 1, p: 1.5, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontStyle: "italic" }}>"{tip.message}"</Typography>
                          </Box>
                        )}

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(tip.timestamp)}
                          </Typography>
                          <Link href={getExplorerUrl(tip.tx_hash)} target="_blank" rel="noopener noreferrer" color="primary.main" sx={{ display: "flex", alignItems: "center", fontSize: "0.75rem", gap: 0.5 }}>
                            Explorer <OpenInNewIcon sx={{ fontSize: 12 }} />
                          </Link>
                        </Box>
                      </ListItem>
                      {idx < arr.length - 1 && <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />}
                    </Box>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
}
