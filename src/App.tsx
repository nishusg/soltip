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
//      - /creator/:wallet → Individual creator profile
//
// The Solana wallet and auth providers are set up in main.tsx,
// wrapping this component.
// ============================================================================

import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";

// Lazy loaded components
const Home = React.lazy(() => import("./pages/Home"));
const CreatorPage = React.lazy(() => import("./pages/CreatorPage"));
const CreatorLeaderboard = React.lazy(() => import("./components/CreatorLeaderboard"));
const ProfileSettings = React.lazy(() => import("./pages/ProfileSettings"));
const ActivityPage = React.lazy(() => import("./pages/ActivityPage"));

export default function App() {
  return (
    <BrowserRouter>
      {/* Navbar is always visible */}
      <Navbar />

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
          <Route path="/creator/:wallet" element={<CreatorPage />} />
          <Route path="/settings" element={<ProfileSettings />} />
        </Routes>
      </Suspense>

      {/* Global Toast Notifications */}
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}
