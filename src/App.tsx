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
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";

// Lazy loaded components
const Home = React.lazy(() => import("./pages/Home"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const OverlayPage = React.lazy(() => import("./pages/OverlayPage"));
const CreatorLeaderboard = React.lazy(() => import("./components/CreatorLeaderboard"));
const ProfileSettings = React.lazy(() => import("./pages/ProfileSettings"));
const ActivityPage = React.lazy(() => import("./pages/ActivityPage"));

function AppLayout() {
  const location = useLocation();
  const isOverlay = location.pathname.startsWith("/overlay");

  return (
    <>
      {/* Hide navbar on overlay pages (OBS browser source) */}
      {!isOverlay && <Navbar />}

      {/* Page routes */}
      <Suspense fallback={<div className="page-wrapper container"><div className="spinner"></div></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/leaderboard"
            element={
              <div className="page-wrapper">
                <div className="container">
                  <CreatorLeaderboard />
                </div>
              </div>
            }
          />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/profile/:wallet" element={<ProfilePage />} />
          <Route path="/settings" element={<ProfileSettings />} />
          <Route path="/overlay/:walletAddress" element={<OverlayPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>

      {/* Global Toast Notifications */}
      <Toaster position="bottom-right" />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
