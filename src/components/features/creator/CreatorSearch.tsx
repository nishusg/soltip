import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Chip,
  Paper,
  CircularProgress,
  InputAdornment,
  Stack
} from "@mui/material";
import BoringAvatar from "boring-avatars";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedIcon from "@mui/icons-material/Verified";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import { searchCreators } from "../../../services/api";
import { CreatorSearchSkeleton } from "../../common/LoadingSkeletons";

export default function CreatorSearch() {
  // Creator Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch searched creators
  useEffect(() => {
    let active = true;

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await searchCreators(searchQuery);
        if (active) {
          setSearchResults(data.creators || []);
        }
      } catch (err) {
        if (active) {
          console.error("Search failed:", err);
        }
      } finally {
        if (active) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery]);

  return (
    <Box
      sx={{
        maxWidth: 750,
        mx: "auto",
        p: { xs: 3, md: 5 },
        borderRadius: "24px",
        background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        textAlign: "center"
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          mb: 1.5,
          fontFamily: "Space Grotesk, sans-serif",
          background: "linear-gradient(90deg, #fff 0%, #cbd5e1 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}
      >
        Find Solana Creators
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, maxWidth: 500, mx: "auto" }}>
        Search creators by name, custom username slug, or wallet address to tip them instantly.
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search creator name, @username, or wallet..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "rgba(255,255,255,0.4)" }} />
              </InputAdornment>
            ),
            endAdornment: searchLoading && (
              <InputAdornment position="end">
                <CircularProgress size={20} color="primary" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "14px",
              bgcolor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              "&:hover": {
                borderColor: "rgba(255,255,255,0.15)"
              },
              "&.Mui-focused": {
                borderColor: "primary.main",
                boxShadow: "0 0 15px rgba(153, 69, 242, 0.25)"
              },
              transition: "all 0.2s ease"
            }
          }
        }}
        sx={{ mb: 4 }}
      />

      {/* Results Grid */}
      {searchResults.length > 0 && !searchLoading ? (
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "left",
              fontWeight: 800,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.08em",
              mb: 2,
              textTransform: "uppercase"
            }}
          >
            Search Results
          </Typography>
          <Grid container spacing={2}>
            {searchResults.map((creator) => (
              <Grid size={{ xs: 12, sm: 6 }} key={creator.wallet_address}>
                <Paper
                  component={RouterLink}
                  to={`/${creator.username || creator.wallet_address}`}
                  elevation={0}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: "16px",
                    bgcolor: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    textDecoration: "none",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    textAlign: "left",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.05)",
                      borderColor: "primary.main", /* creator.is_premium ? "#FFD700" : "primary.main" */
                      transform: "translateY(-3px)",
                      boxShadow: "0 8px 24px rgba(153, 69, 242, 0.15)" /* creator.is_premium
                        ? "0 8px 24px rgba(255, 215, 0, 0.12)"
                        : "0 8px 24px rgba(153, 69, 242, 0.15)" */
                    }
                  }}
                >
                  {/* Avatar Wrapper */}
                  <Box sx={{ width: 44, height: 44, borderRadius: "12px", overflow: "hidden", display: "flex", flexShrink: 0 }}>
                    <BoringAvatar
                      size={44}
                      name={creator.username || creator.wallet_address}
                      variant="marble"
                      colors={["#9945FF", "#14F195", "#8052FF", "#00FF80", "#E1C3FF"]}
                    />
                  </Box>

                  {/* Details */}
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9rem" }}>
                        {creator.name || creator.username || "Creator"}
                      </Typography>
                      {/* creator.is_premium && (
                        <Chip
                          label="GOLD"
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: "0.6rem",
                            fontWeight: 900,
                            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                            color: "#000",
                            px: 0.5,
                            "& .MuiChip-label": { px: 0.5 }
                          }}
                        />
                      ) */}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                      {creator.username ? `@${creator.username}` : `${creator.wallet_address.slice(0, 4)}...${creator.wallet_address.slice(-4)}`}
                    </Typography>
                  </Box>

                  {/* Tip Stats */}
                  {creator.total_received > 0 && (
                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.72rem" }}>
                        Tips
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 900, color: "primary.light" }}>
                        {parseFloat((creator.total_received / 1e9).toFixed(2))} SOL
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : searchLoading ? (
        <CreatorSearchSkeleton />
      ) : (
        searchQuery.trim() && !searchLoading && (
          <Box sx={{ py: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              No creators found matching your search.
            </Typography>
          </Box>
        )
      )}

      {/* Initial State Dashboard */}
      {!searchQuery.trim() && !searchLoading && (
        <Box sx={{ mt: 4, animation: "fadeIn 0.5s ease-out" }}>
          <Typography
            variant="subtitle2"
            sx={{
              display: "block",
              fontWeight: 800,
              color: "primary.light",
              letterSpacing: "0.1em",
              mb: 3,
              textTransform: "uppercase"
            }}
          >
            💡 Search Tips & Guidelines
          </Typography>
          <Grid container spacing={2.5}>
            {[
              {
                title: "Search by Name",
                desc: "Type any part of the creator's real or display name to find their profile.",
                example: "e.g., Aero Degen",
                icon: <EmojiPeopleIcon sx={{ fontSize: 28, color: "#14F195" }} />
              },
              {
                title: "Search by Username",
                desc: "Search directly using their custom slug identifier with or without @.",
                example: "e.g., @aerodegen",
                icon: <VerifiedIcon sx={{ fontSize: 28, color: "#FFD700" }} />
              },
              {
                title: "Search by Wallet",
                desc: "Input a full Sol address to find and tip any wallet on the network.",
                example: "e.g., 4zMMC...8yF7",
                icon: <FlashOnIcon sx={{ fontSize: 28, color: "#9945FF" }} />
              }
            ].map((tip, idx) => (
              <Grid size={{ xs: 12, sm: 4 }} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: "18px",
                    bgcolor: "rgba(255,255,255,0.01)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(255,255,255,0.1)",
                      transform: "translateY(-4px)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                    }
                  }}
                >
                  <Box sx={{ mb: 2, p: 1.5, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.02)" }}>
                    {tip.icon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#fff", mb: 1 }}>
                    {tip.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2, fontSize: "0.85rem" }}>
                    {tip.desc}
                  </Typography>
                  <Chip
                    label={tip.example}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.05)",
                      color: "rgba(255,255,255,0.6)",
                      fontWeight: 700,
                      fontSize: "0.75rem"
                    }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
