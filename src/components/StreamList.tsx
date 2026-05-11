import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { listActiveStreams } from "../services/api";
import { Box, Typography, Grid, Card, CardContent, CardMedia, Chip, Skeleton, Avatar } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import PeopleIcon from "@mui/icons-material/People";

export default function StreamList() {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listActiveStreams()
      .then(setStreams)
      .catch((err) => console.error("Failed to load streams:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Live Now</Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Skeleton 
                variant="rectangular" 
                sx={{ 
                  width: "100%", 
                  aspectRatio: "16/9", 
                  borderRadius: "12px" 
                }} 
              />
              <Box sx={{ mt: 1.5, display: "flex", gap: 1.5 }}>
                <Skeleton variant="circular" width={24} height={24} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (streams.length === 0) {
    return (
      <Box sx={{ mt: 8, textAlign: "center", py: 8, bgcolor: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.1)" }}>
        <Typography variant="h6" color="text.secondary">No streams live right now.</Typography>
        <Typography variant="body2" color="text.secondary">Be the first to go live!</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
        Live Now
        <Box component="span" sx={{ width: 8, height: 8, bgcolor: "#ff4b4b", borderRadius: "50%", animation: "pulse 2s infinite" }} />
      </Typography>
      
      <Grid container spacing={3}>
        {streams.map((stream) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={stream._id}>
            <Card 
              component={RouterLink} 
              to={`/stream/${stream._id}`}
              sx={{ 
                height: "100%", 
                textDecoration: "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
                  "& .stream-thumbnail": { transform: "scale(1.05)" }
                }
              }}
            >
              <Box sx={{ position: "relative", overflow: "hidden" }}>
                <CardMedia
                  className="stream-thumbnail"
                  component="div"
                  sx={{ 
                    width: "100%",
                    aspectRatio: "16/9", 
                    bgcolor: "grey.900",
                    transition: "transform 0.5s ease"
                  }}
                />
                <Chip
                  icon={<FiberManualRecordIcon sx={{ fontSize: "0.8rem !important", color: "#ff4b4b !important" }} />}
                  label="LIVE"
                  size="small"
                  sx={{ position: "absolute", top: 12, left: 12, bgcolor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", color: "#fff", fontWeight: 800 }}
                />
                <Box sx={{ position: "absolute", bottom: 12, right: 12, display: "flex", alignItems: "center", gap: 0.5, bgcolor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", px: 1, borderRadius: "4px" }}>
                  <PeopleIcon sx={{ fontSize: "0.9rem", color: "#fff" }} />
                  <Typography variant="caption" sx={{ color: "#fff", fontWeight: 700 }}>{stream.viewer_count || 0}</Typography>
                </Box>
              </Box>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" noWrap sx={{ fontWeight: 700, mb: 0.5 }}>{stream.title}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: "0.7rem" }}>{stream.creator_wallet.slice(0, 1)}</Avatar>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {stream.creator_wallet.slice(0, 4)}...{stream.creator_wallet.slice(-4)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
