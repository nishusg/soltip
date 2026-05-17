// ============================================================================
// App Component — App.tsx
// ============================================================================
//
// Root application component that sets up:
//   1. React Router for page navigation
//   2. Navbar (always visible)
//   3. Page routes:
//      - / → Home page (tip form or wallet connect)
//      - /leaderboard → Creator leaderboard
//      - /profile/:wallet → Creator profile
//      - /overlay/:walletAddress → OBS overlay for creators
//      - /dashboard → Creator revenue dashboard
//
// The Solana wallet and auth providers are set up in main.tsx,
// wrapping this component.
// ============================================================================

import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { baseTheme, premiumThemes } from "./themes";
import { getPremiumOverrides } from "./themes/shared";

// Lazy loaded components
const Home = React.lazy(() => import("./pages/Home"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const OverlayPage = React.lazy(() => import("./pages/OverlayPage"));
const CreatorLeaderboard = React.lazy(() => import("./components/CreatorLeaderboard"));
const ProfileSettings = React.lazy(() => import("./pages/ProfileSettings"));
const ActivityPage = React.lazy(() => import("./pages/ActivityPage"));
const UnauthorizedPage = React.lazy(() => import("./pages/UnauthorizedPage"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const isOverlay = location.pathname.startsWith("/overlay");
  
  // Determine which theme to use
  let currentTheme = baseTheme;
  let premiumStyles = "";
  if (user?.is_premium) {
    const themeKey = user.selected_theme || "gold";
    currentTheme = premiumThemes[themeKey] || premiumThemes.gold;

    // Generate dynamic premium style overrides directly from the active theme's palette
    const primaryColor = currentTheme.palette.primary.main;
    const secondaryColor = currentTheme.palette.secondary?.main || primaryColor;
    const bgColor = currentTheme.palette.background.default || "#050508";

    premiumStyles = getPremiumOverrides(primaryColor, secondaryColor, bgColor, "");
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      {premiumStyles && <style dangerouslySetInnerHTML={{ __html: premiumStyles }} />}
      
      {/* Hide the global background mesh gradient on overlay pages (OBS overlay) */}
      {!isOverlay && <div className="mesh-gradient" />}
      
      {/* Hide navbar on overlay pages (OBS browser source) */}
      {!isOverlay && <Navbar />}

      {/* Page routes */}
      <Suspense fallback={<div className="page-wrapper container"><div className="spinner"></div></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <div className="page-wrapper">
                  <div className="container">
                    <CreatorLeaderboard />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
          <Route path="/profile/:wallet" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
          <Route path="/overlay/:walletAddress" element={<OverlayPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </Suspense>

      {/* Global Toast Notifications */}
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
