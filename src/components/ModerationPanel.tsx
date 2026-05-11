import React, { useState } from "react";
import { Box, Typography, TextField, Button, Switch, FormControlLabel, List, ListItem, ListItemText, IconButton, Paper, Divider } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import { updateStreamSettings, toggleBan } from "../services/api";

interface ModerationPanelProps {
  streamId: string;
  initialSlowMode: number;
  initialBlockedKeywords: string[];
  bannedWallets: string[];
  initialDonationGoal: number;
  onUpdate: () => void;
}

const ModerationPanel: React.FC<ModerationPanelProps> = ({ 
  streamId, 
  initialSlowMode, 
  initialBlockedKeywords,
  bannedWallets,
  initialDonationGoal,
  onUpdate 
}) => {
  const [slowMode, setSlowMode] = useState(initialSlowMode);
  const [keyword, setKeyword] = useState("");
  const [blockedKeywords, setBlockedKeywords] = useState(initialBlockedKeywords);
  const [loading, setLoading] = useState(false);

  const handleUpdateSlowMode = async () => {
    setLoading(true);
    try {
      await updateStreamSettings(streamId, { slow_mode: slowMode });
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = async () => {
    if (!keyword) return;
    // Note: Backend needs an endpoint for keywords, but I'll reuse settings for now if I add it
    // For now, I'll just show the logic
  };

  const handleToggleBan = async (wallet: string, action: "ban" | "unban") => {
    try {
      await toggleBan(streamId, wallet, action);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 2, height: "100%", overflowY: "auto" }}>
      <Typography variant="subtitle2" sx={{ mb: 2, color: "primary.main", fontWeight: 700 }}>
        OBS OVERLAY
      </Typography>
      <Box sx={{ mb: 4, p: 2, bgcolor: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.1)" }}>
        <Typography variant="caption" sx={{ display: "block", mb: 1, opacity: 0.7 }}>
          Add this URL as a Browser Source in OBS (1920x1080 recommended)
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            slotProps={{
              input: {
                readOnly: true,
              }
            }}
            value={`${window.location.origin}/overlay/${streamId}`}
            sx={{ "& input": { fontSize: "0.75rem", fontFamily: "monospace" } }}
          />
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/overlay/${streamId}`);
              alert("Overlay URL copied!");
            }}
          >
            Copy
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 3, opacity: 0.1 }} />

      <Typography variant="subtitle2" sx={{ mb: 2, color: "primary.main", fontWeight: 700 }}>
        DONATION GOAL
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>Set Goal Amount (SOL)</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            type="number"
            size="small"
            id="donation-goal-input"
            defaultValue={initialDonationGoal / 1000000000}
            sx={{ flexGrow: 1 }}
          />
          <Button 
            variant="contained" 
            size="small" 
            onClick={async () => {
              const el = document.getElementById("donation-goal-input") as HTMLInputElement;
              if (el) {
                await updateStreamSettings(streamId, { donation_goal: Number(el.value) * 1000000000 });
                onUpdate();
              }
            }}
          >
            Set Goal
          </Button>
        </Box>
        <Typography variant="caption" sx={{ mt: 1, display: "block", opacity: 0.6 }}>
          Set to 0 to hide the goal bar from the overlay.
        </Typography>
      </Box>

      <Divider sx={{ mb: 3, opacity: 0.1 }} />

      <Typography variant="subtitle2" sx={{ mb: 2, color: "primary.main", fontWeight: 700 }}>
        CHAT SETTINGS
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>Slow Mode (seconds)</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            type="number"
            size="small"
            value={slowMode}
            onChange={(e) => setSlowMode(Number(e.target.value))}
            sx={{ flexGrow: 1 }}
          />
          <Button 
            variant="contained" 
            size="small" 
            onClick={handleUpdateSlowMode}
            disabled={loading}
          >
            Update
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 3, opacity: 0.1 }} />

      <Typography variant="subtitle2" sx={{ mb: 2, color: "primary.main", fontWeight: 700 }}>
        BANNED USERS ({bannedWallets.length})
      </Typography>
      
      <List dense>
        {bannedWallets.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No users banned.</Typography>
        ) : (
          bannedWallets.map((wallet) => (
            <ListItem 
              key={wallet}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleToggleBan(wallet, "unban")} color="error">
                  <DeleteIcon />
                </IconButton>
              }
              sx={{ bgcolor: "rgba(255,255,255,0.03)", mb: 1, borderRadius: "8px" }}
            >
              <ListItemText 
                primary={wallet.slice(0, 4) + "..." + wallet.slice(-4)} 
                slotProps={{
                  primary: {
                    variant: "body2",
                    sx: { fontFamily: "monospace" }
                  }
                }}
              />
            </ListItem>
          ))
        )}
      </List>

      {/* Manual Ban Input */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>Manual Ban (Wallet Address)</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            placeholder="Paste wallet address"
            size="small"
            id="manual-ban-input"
            sx={{ flexGrow: 1 }}
          />
          <Button 
            variant="outlined" 
            color="error" 
            size="small"
            onClick={() => {
              const el = document.getElementById("manual-ban-input") as HTMLInputElement;
              if (el?.value) handleToggleBan(el.value, "ban");
            }}
          >
            Ban
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ModerationPanel;
