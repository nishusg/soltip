import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  List,
  ListItem,
  Paper,
  Skeleton,
  Typography,
  Grid
} from "@mui/material";

// ============================================================================
// 1. Recent Tips Activity Log Skeleton
// ============================================================================
export function RecentTipsSkeleton() {
  return (
    <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {Array.from({ length: 3 }).map((_, idx) => (
        <ListItem 
          key={idx}
          sx={{ 
            flexDirection: "column", 
            alignItems: "stretch", 
            px: 3, 
            py: 3,
            bgcolor: "rgba(255,255,255,0.02)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.03)",
            pointerEvents: "none"
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 3 }, width: "100%" }}>
              <Box sx={{ 
                width: { xs: 44, sm: 52 }, 
                height: { xs: 44, sm: 52 }, 
                borderRadius: "14px", 
                flexShrink: 0
              }}>
                <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: "14px" }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="60px" height={24} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="140px" height={16} />
              </Box>
            </Box>
            <Skeleton variant="rectangular" width="60px" height={24} sx={{ borderRadius: "8px", flexShrink: 0 }} />
          </Box>

          <Box sx={{ 
            my: 2, 
            p: 2.5, 
            bgcolor: "rgba(255,255,255,0.01)", 
            borderRadius: "12px",
            borderLeft: "4px solid rgba(255,255,255,0.05)"
          }}>
            <Skeleton variant="text" width="80%" height={20} />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, pt: 2, borderTop: "1px dashed rgba(255,255,255,0.05)" }}>
            <Skeleton variant="text" width="80px" height={16} />
            <Skeleton variant="text" width="100px" height={16} />
          </Box>
        </ListItem>
      ))}
    </List>
  );
}

// ============================================================================
// 2. Creator Search Skeleton
// ============================================================================
export function CreatorSearchSkeleton() {
  return (
    <Box sx={{ animation: "fadeIn 0.4s ease-out" }}>
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
        Searching Creators...
      </Typography>
      <Grid container spacing={2}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <Grid size={{ xs: 12, sm: 6 }} key={idx}>
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                borderRadius: "16px",
                bgcolor: "rgba(255,255,255,0.01)",
                border: "1px solid rgba(255,255,255,0.02)",
              }}
            >
              <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "12px" }} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="40%" height={15} />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// ============================================================================
// 3. Profile Settings Skeleton
// ============================================================================
export function ProfileSettingsSkeleton() {
  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", overflow: "hidden", pb: 8 }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, position: "relative", zIndex: 1 }}>
        <Box sx={{ mb: { xs: 4, md: 6 }, animation: "fadeIn 0.3s ease-out" }}>
          <Skeleton variant="text" width={280} height={60} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={420} height={25} />
        </Box>

        <Grid container spacing={4}>
          {/* Left Column: Avatar Skeleton */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Card>
                <CardContent sx={{ p: { xs: 3, sm: 4 }, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <Skeleton variant="text" width="40%" height={24} sx={{ alignSelf: "flex-start", mb: 3 }} />
                  <Box sx={{ mb: 3 }}>
                    <Skeleton variant="circular" width={140} height={140} />
                  </Box>
                  <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="80%" height={16} />
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Right Column: Fields Skeletons */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                <Skeleton variant="text" width="40%" height={32} sx={{ mb: 4 }} />
                
                <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {/* Display Name */}
                  <Box>
                    <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1.5 }} />
                    <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: "12px" }} />
                  </Box>

                  {/* Username */}
                  <Box>
                    <Skeleton variant="text" width="25%" height={20} sx={{ mb: 1.5 }} />
                    <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: "12px" }} />
                  </Box>

                  {/* About You */}
                  <Box>
                    <Skeleton variant="text" width="15%" height={20} sx={{ mb: 1.5 }} />
                    <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: "12px" }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// ============================================================================
// 4. Public Profile Page Skeleton
// ============================================================================
export function PublicProfileSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      {/* Banner Card Skeleton */}
      <Card sx={{ mb: 4, overflow: "visible", position: "relative" }}>
        <Skeleton variant="rectangular" width="100%" height={150} />
        <CardContent sx={{ pt: 0, px: { xs: 3, md: 6 }, pb: 5 }}>
          <Box sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", sm: "row" }, 
            alignItems: { xs: "center", sm: "flex-end" }, 
            gap: { xs: 2.5, sm: 3.5 },
            mb: 4
          }}>
            <Box sx={{ mt: "-60px", zIndex: 5, flexShrink: 0 }}>
              <Skeleton variant="circular" width={120} height={120} sx={{ border: "4px solid #10141e" }} />
            </Box>
            <Box sx={{ flexGrow: 1, textAlign: { xs: "center", sm: "left" }, width: "100%" }}>
              <Skeleton variant="text" width="250px" height={36} sx={{ mx: { xs: "auto", sm: 0 }, mb: 1 }} />
              <Skeleton variant="text" width="150px" height={24} sx={{ mx: { xs: "auto", sm: 0 } }} />
            </Box>
          </Box>
          <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={24} />
        </CardContent>
      </Card>

      {/* Main split grid skeleton */}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 4, borderRadius: "24px", bgcolor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", mb: 4 }}>
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" width="100%" height={320} sx={{ borderRadius: "16px" }} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 4, borderRadius: "24px", bgcolor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", mb: 4 }}>
            <Skeleton variant="text" width="50%" height={32} sx={{ mb: 3 }} />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5, mb: 3 }}>
              <Skeleton variant="rectangular" height={50} sx={{ borderRadius: "12px" }} />
              <Skeleton variant="rectangular" height={50} sx={{ borderRadius: "12px" }} />
              <Skeleton variant="rectangular" height={50} sx={{ borderRadius: "12px" }} />
            </Box>
            <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: "14px", mb: 3 }} />
            <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: "14px", mb: 3 }} />
            <Skeleton variant="rectangular" width="100%" height={50} sx={{ borderRadius: "14px" }} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

// ============================================================================
// 5. Creator Leaderboard Page Skeleton
// ============================================================================
export function CreatorLeaderboardSkeleton() {
  return (
    <Box sx={{ animation: "fadeIn 0.5s ease-out" }}>
      {/* Podium Skeleton (Hidden on Mobile) */}
      <Grid
        container
        spacing={3}
        sx={{
          mb: 8,
          display: { xs: "none", md: "flex" },
          justifyContent: "center",
          alignItems: "flex-end"
        }}
      >
        {/* 2nd Place Skeleton */}
        <Grid size={{ xs: 12, md: 3.8 }}>
          <Card sx={{ borderRadius: "24px", border: "1px solid rgba(255,255,255,0.04)", p: 3, textAlign: "center", bgcolor: "rgba(255,255,255,0.01)", pointerEvents: "none" }}>
            <Skeleton variant="text" width="40%" height={28} sx={{ mx: "auto", mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Skeleton variant="circular" width={84} height={84} />
            </Box>
            <Skeleton variant="text" width="60%" height={24} sx={{ mx: "auto", mb: 1 }} />
            <Skeleton variant="text" width="40%" height={16} sx={{ mx: "auto", mb: 2 }} />
            <Skeleton variant="rectangular" width="80%" height={32} sx={{ mx: "auto", borderRadius: "8px" }} />
          </Card>
        </Grid>

        {/* 1st Place Skeleton */}
        <Grid size={{ xs: 12, md: 4.4 }}>
          <Card sx={{ borderRadius: "28px", border: "1px solid rgba(255,255,255,0.06)", p: 4.5, textAlign: "center", bgcolor: "rgba(255,255,255,0.02)", pointerEvents: "none" }}>
            <Skeleton variant="text" width="50%" height={36} sx={{ mx: "auto", mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Skeleton variant="circular" width={98} height={98} />
            </Box>
            <Skeleton variant="text" width="70%" height={28} sx={{ mx: "auto", mb: 1 }} />
            <Skeleton variant="text" width="50%" height={18} sx={{ mx: "auto", mb: 2 }} />
            <Skeleton variant="rectangular" width="80%" height={36} sx={{ mx: "auto", borderRadius: "10px" }} />
          </Card>
        </Grid>

        {/* 3rd Place Skeleton */}
        <Grid size={{ xs: 12, md: 3.8 }}>
          <Card sx={{ borderRadius: "24px", border: "1px solid rgba(255,255,255,0.04)", p: 3, textAlign: "center", bgcolor: "rgba(255,255,255,0.01)", pointerEvents: "none" }}>
            <Skeleton variant="text" width="40%" height={28} sx={{ mx: "auto", mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Skeleton variant="circular" width={76} height={76} />
            </Box>
            <Skeleton variant="text" width="60%" height={24} sx={{ mx: "auto", mb: 1 }} />
            <Skeleton variant="text" width="40%" height={16} sx={{ mx: "auto", mb: 2 }} />
            <Skeleton variant="rectangular" width="80%" height={32} sx={{ mx: "auto", borderRadius: "8px" }} />
          </Card>
        </Grid>
      </Grid>

      {/* List Skeleton */}
      <Box sx={{ mt: 4 }}>
        <Skeleton variant="text" width="180px" height={28} sx={{ mb: 3 }} />
        <List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <Card
              key={idx}
              sx={{
                p: { xs: 2, sm: 3.5 },
                borderRadius: "20px",
                bgcolor: "rgba(255,255,255,0.01)",
                border: "1px solid rgba(255,255,255,0.03)",
                display: "flex",
                alignItems: "center"
              }}
            >
              <Skeleton variant="circular" width={44} height={44} sx={{ mr: { xs: 1.5, sm: 3 }, flexShrink: 0 }} />
              <Skeleton variant="circular" width={52} height={52} sx={{ mr: { xs: 1.5, sm: 3 }, flexShrink: 0 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="50%" height={16} />
              </Box>
              <Box sx={{ textAlign: "right", minWidth: 80 }}>
                <Skeleton variant="text" width="60px" height={20} sx={{ ml: "auto" }} />
                <Skeleton variant="text" width="80px" height={24} sx={{ ml: "auto" }} />
              </Box>
            </Card>
          ))}
        </List>
      </Box>
    </Box>
  );
}

// ============================================================================
// 6. Dashboard Page Skeleton
// ============================================================================
export function DashboardSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 6 }}>
        <Skeleton variant="text" width={220} height={50} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={400} height={25} />
      </Box>
      
      {/* LED stats cards skeletons */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 2 }}>
            <Paper sx={{ p: 2.5, borderRadius: "20px", bgcolor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)" }}>
              <Skeleton variant="circular" width={32} height={32} sx={{ mx: "auto", mb: 1.5 }} />
              <Skeleton variant="text" width="60%" height={24} sx={{ mx: "auto", mb: 0.5 }} />
              <Skeleton variant="text" width="40%" height={16} sx={{ mx: "auto" }} />
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, height: 420, borderRadius: "24px", bgcolor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", mb: 4 }}>
            <Skeleton variant="text" width="30%" height={30} sx={{ mb: 4 }} />
            <Skeleton variant="rectangular" width="100%" height={280} sx={{ borderRadius: "16px" }} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, height: 420, borderRadius: "24px", bgcolor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", mb: 4 }}>
            <Skeleton variant="text" width="50%" height={30} sx={{ mb: 4 }} />
            <Skeleton variant="circular" width={180} height={180} sx={{ mx: "auto", mb: 4 }} />
            <Skeleton variant="text" width="40%" height={25} sx={{ mx: "auto" }} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

// ============================================================================
// 7. Profile Page Skeleton
// ============================================================================
export function ProfilePageSkeleton() {
  return (
    <Box sx={{ animation: "fadeIn 0.5s ease-out" }}>
      {/* Profile Card Skeleton */}
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
          alignItems: "center",
          justifyContent: "center",
          background: (theme) => theme.palette.background.default
        }}>
          <Skeleton variant="circular" width={108} height={108} />
        </Box>
        
        <CardContent sx={{ pt: 0 }}>
          <Skeleton variant="text" width="40%" height={40} sx={{ mx: "auto", mb: 1 }} />
          <Skeleton variant="text" width="60%" height={20} sx={{ mx: "auto", mb: 3 }} />
          <Skeleton variant="text" width="80%" height={24} sx={{ mx: "auto", mb: 4 }} />

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
              <Skeleton variant="text" width="50%" height={16} sx={{ mx: "auto", mb: 1 }} />
              <Skeleton variant="text" width="70%" height={36} sx={{ mx: "auto" }} />
            </Box>
            <Box sx={{ borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
              <Skeleton variant="text" width="50%" height={16} sx={{ mx: "auto", mb: 1 }} />
              <Skeleton variant="text" width="70%" height={36} sx={{ mx: "auto" }} />
            </Box>
          </Box>

          <Skeleton variant="rectangular" width={150} height={42} sx={{ mx: "auto", borderRadius: "8px" }} />
        </CardContent>
      </Card>

      {/* Activity Tabs Skeleton */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "rgba(255,255,255,0.1)", display: "flex", justifyContent: "center", py: 2 }}>
          <Skeleton variant="rectangular" width="40%" height={32} sx={{ borderRadius: "8px" }} />
        </Box>
        <CardContent sx={{ p: 4 }}>
          <List disablePadding>
            {Array.from({ length: 3 }).map((_, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
                  <Skeleton variant="circular" width={44} height={44} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Skeleton variant="text" width="30%" height={24} />
                      <Skeleton variant="text" width="20%" height={20} />
                    </Box>
                    <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: "8px", mb: 1 }} />
                    <Skeleton variant="text" width="15%" height={16} />
                  </Box>
                </Box>
                {idx < 2 && <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />}
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

// ============================================================================
// 8. Activity Page Skeleton
// ============================================================================
export function ActivityPageSkeleton() {
  return (
    <Box sx={{ animation: "fadeIn 0.5s ease-out", display: "flex", flexDirection: "column", gap: 2 }}>
      {Array.from({ length: 4 }).map((_, idx) => (
        <Box key={idx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
            <Skeleton variant="circular" width={44} height={44} />
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Skeleton variant="text" width="80px" height={24} />
                  <Skeleton variant="rectangular" width="60px" height={20} sx={{ borderRadius: "6px" }} />
                </Box>
                <Skeleton variant="text" width="120px" height={20} />
              </Box>
              <Skeleton variant="rectangular" width="100%" height={36} sx={{ borderRadius: "8px", mb: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Skeleton variant="text" width="80px" height={16} />
                <Skeleton variant="text" width="60px" height={16} />
              </Box>
            </Box>
          </Box>
          {idx < 3 && <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />}
        </Box>
      ))}
    </Box>
  );
}
