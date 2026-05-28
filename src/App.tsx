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

import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { useAuth } from "./context/AuthContext";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { baseTheme, premiumThemes } from "./themes";
import { getPremiumOverrides } from "./themes/shared";

// Lazy loaded components
const Home = React.lazy(() => import("./pages/Home"));
const HowItWorks = React.lazy(() => import("./pages/HowItWorks"));
const ObsOverlayPage = React.lazy(() => import("./pages/ObsOverlayPage"));
const VerticalCreatorPage = React.lazy(() => import("./pages/VerticalCreatorPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const OverlayPage = React.lazy(() => import("./pages/OverlayPage"));
const CreatorLeaderboard = React.lazy(() => import("./pages/CreatorLeaderboard"));
const ProfileSettings = React.lazy(() => import("./pages/ProfileSettings"));
const ActivityPage = React.lazy(() => import("./pages/ActivityPage"));
const UnauthorizedPage = React.lazy(() => import("./pages/UnauthorizedPage"));
const PricingPage = React.lazy(() => import("./pages/PricingPage"));
const SecurityPage = React.lazy(() => import("./pages/SecurityPage"));
const BlogPage = React.lazy(() => import("./pages/BlogPage"));
const BlogPostPage = React.lazy(() => import("./pages/BlogPostPage"));
const PublicProfilePage = React.lazy(() => import("./pages/PublicProfilePage"));
const SearchPage = React.lazy(() => import("./pages/SearchPage"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Force authenticated users to set a display name upon first login before using other pages
  if (user && !user.name && location.pathname !== "/settings") {
    toast.error("Please set a display name to complete your registration!", { id: "profile-name-required" });
    return <Navigate to="/settings" state={{ from: location }} replace />;
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
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/obs-overlay" element={<ObsOverlayPage />} />
          <Route path="/for-youtube" element={<VerticalCreatorPage platform="youtube" />} />
          <Route path="/for-kick" element={<VerticalCreatorPage platform="kick" />} />
          <Route path="/for-streamlabs" element={<VerticalCreatorPage platform="streamlabs" />} />
          <Route path="/for-content-creators" element={<VerticalCreatorPage platform="general" />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
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
          {/* Public SEO profile page — must be last to avoid intercepting static routes */}
          <Route path="/:username" element={<PublicProfilePage />} />
        </Routes>
      </Suspense>

      {/* Hide footer on overlay pages */}
      {!isOverlay && <Footer />}

      {/* Global Toast Notifications */}
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppLayout />
    </BrowserRouter>
  );
}
