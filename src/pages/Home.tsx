import { useWalletAuth } from "../hooks/useWalletAuth";
import WalletConnect from "../components/WalletConnect";
import TipForm from "../components/TipForm";
import RecentTips from "../components/RecentTips";
import { Link as RouterLink } from "react-router-dom";
import { Container, Box, Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, ListItemButton } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";

export default function Home() {
  const { connected, walletAddress } = useWalletAuth();

  return (
    <Container maxWidth="md" sx={{ py: 4, minHeight: "calc(100vh - 64px)" }}>
      {/* Show hero section when no wallet is connected */}
      {!connected && <WalletConnect />}

      {/* Show tipping interface when wallet is connected */}
      {connected && (
        <Box sx={{ animation: "fadeInUp 0.6s ease-out" }}>
          <TipForm />
          <RecentTips />
          
          {/* Quick Links / Dev Navigation */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <List disablePadding>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/leaderboard">
                    <ListItemIcon><EmojiEventsIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="View Leaderboard" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/settings">
                    <ListItemIcon><SettingsIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Edit Profile Settings" />
                  </ListItemButton>
                </ListItem>
                {walletAddress && (
                  <ListItem disablePadding>
                    <ListItemButton component={RouterLink} to={`/creator/${walletAddress}`}>
                      <ListItemIcon><PersonIcon color="primary" /></ListItemIcon>
                      <ListItemText primary="View My Creator Page" />
                    </ListItemButton>
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
}
