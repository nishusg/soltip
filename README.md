# SolTip Frontend 🎨

SolTip is a modern, real-time tipping and crowdfunding dashboard built on the Solana blockchain. It allows content creators, streamers, and developers to receive tips with instant on-screen alerts, set glassmorphic tipping goals, track analytics, and manage profile settings.

## 🚀 Features

- **Solana Wallet Integration:** Secure login using `@solana/wallet-adapter-phantom` and message signatures.
- **Glassmorphic Stream Overlays:** Dynamic OBS-compatible alerts and live tipping goal progress bars that update instantly via WebSockets.
- **Interactive Analytics:** Visual graphs and statistics of received tips and earnings using Recharts.
- **Profile Customization:** Customize avatars, usernames, and tipping page settings.
- **Real-Time Updates:** Syncs overlay widget goals and standard alerts in real-time through WebSockets.

---

## 💻 Tech Stack

- **Framework:** Vite + React + TypeScript
- **Styling:** Material UI (MUI) + Custom CSS
- **State Management:** Custom React hooks (`useDashboardData`, `useOverlayManager`)
- **Crypto Integration:** `@solana/web3.js` & `@coral-xyz/anchor`
- **Real-time Networking:** `socket.io-client`

---

## ⚙️ Project Structure

```text
soltip/
├── public/              # Static public assets
├── src/
│   ├── assets/          # Stylesheets, icons, and visual assets
│   ├── components/      # Shared components (Navbar, Sidebar, RecentTips, Skeletons)
│   ├── hooks/           # Custom data fetching and overlay state hooks
│   ├── pages/           # Page views (Dashboard, ProfileSettings, OverlayPage, PublicProfile)
│   ├── utils/           # Utility helpers (RPC connection, formatting)
│   └── App.tsx          # Router and global provider configurations
├── scripts/
│   └── prerender.cjs    # SEO Pre-renderer for crawler index optimization
├── Dockerfile           # Multi-stage production Docker build
└── package.json         # Package configuration
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Navigate to the `soltip` directory:
   ```bash
   cd soltip
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration
Copy `.env.example` to `.env` and fill in the required variables:
```bash
cp .env.example .env
```

Configuration Knobs:
```ini
# Address of the backend API
VITE_API_URL=http://localhost:3001
# Solana Program ID for the smart contract
VITE_PROGRAM_ID=your_solana_program_id
# Platform Treasury Wallet Address for receiving fee splits
VITE_PLATFORM_WALLET=your_platform_treasury_wallet_address
# Solana Network RPC URL
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
# App website name
VITE_SITE_NAME=SolTip
# Frontend Website URL
VITE_SITE_URL=http://localhost:5173
# Platform transaction fee percentage (flat rate, e.g. 5 for 5%)
VITE_PLATFORM_FEE=5
```

### Run Locally
Start the Vite development server:
```bash
npm run dev
```
The site will run on [http://localhost:5173](http://localhost:5173).

---

## 🐳 Docker Deployment

The frontend includes an Nginx-backed multi-stage production Docker configuration.

### Build and Run with Docker
1. Build the Docker image:
   ```bash
   docker build -t soltip-frontend .
   ```
2. Run the container:
   ```bash
   docker run -p 80:80 --env-file .env soltip-frontend
   ```
