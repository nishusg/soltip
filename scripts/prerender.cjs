// ============================================================================
// Static Site Generation (SSG) Pre-renderer — scripts/prerender.cjs
// ============================================================================
//
// Post-build script to pre-render static HTML pages for SEO crawler spiders.
//
// How It Works:
//   1. Reads the built production bundle template at 'dist/index.html'
//   2. Loops through all public static marketing routes and blog paths
//   3. Injects custom <title>, <meta description>, OpenGraph, and Twitter tags
//   4. Generates dynamic JSON-LD structured schemas (WebSite, Organization, FAQPage)
//   5. Inserts basic, accessible fallback HTML structure inside <div id="root">
//   6. Writes fully indexable standalone folders (e.g. dist/pricing/index.html)
// ============================================================================

const fs = require("fs");
const path = require("path");

const DIST_DIR = path.join(__dirname, "../dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");

// 1. Define custom route metadata and fallback schemas for indexation
const routes = [
  {
    path: "",
    title: "SolTip — Solana-Powered Creator Superchats & OBS stream alerts",
    description: "The premier superchat, alerts, and tipping layer for Solana creators. Connect Phantom or Solflare, claim your public username, and set up dynamic OBS overlay triggers.",
    keywords: "crypto donations for streamers, solana donations, web3 superchat, obs crypto overlay, twitch crypto tipping, youtube crypto donations, phantom wallet donations, instant creator payments, wallet based tipping, on chain superchat, decentralized creator monetization, solana, superchat, tips, streamers, crypto tipping, obs alerts, web3, creator tools",
    faqs: [
      { q: "How do I get paid?", a: "Instantly and directly! SolTip uses fully non-custodial smart contracts and direct on-chain transactions." },
      { q: "What are the platform fees?", a: "SolTip operates with a clean, transparent flat 5% platform fee on all standard tips to support development." }
    ]
  },
  {
    path: "pricing",
    title: "Creator-First Pricing & Fee Transparency | SolTip",
    description: "Simple, open, and transparent pricing. Flat 5% platform fee + micro Solana network gas. No monthly subscriptions, no chargebacks, and instant P2P payouts.",
    keywords: "instant creator payments, wallet based tipping, on chain superchat, decentralized creator monetization, solana, pricing, platform fees, twitch tips, commission splits",
    faqs: [
      { q: "Why does SolTip charge a flat 5% platform fee?", a: "Our flat 5% platform fee helps fund the development of our high-speed websocket servers, customizable OBS alert engines, and wallet integrations." },
      { q: "Do I have to wait to withdraw my earnings?", a: "Not at all. SolTip is fully decentralized and non-custodial. Payouts settle inside your personal Solana wallet instantly." }
    ]
  },
  {
    path: "how-it-works",
    title: "How It Works — Streaming Crypto Tips Overlay Guide | SolTip",
    description: "Learn how SolTip connects viewers to creators using secure wallet based tipping, instant crypto donations for streamers, and customizable OBS stream tipping overlays.",
    keywords: "crypto donations for streamers, solana donations, web3 superchat, phantom wallet donations, wallet based tipping, on chain superchat, solana tipping, wallet setup, stream layout, obs panels",
    faqs: [
      { q: "What is SolTip and how does a solana superchat work?", a: "SolTip is a non-custodial crypto monetization gateway built explicitly for creators. A solana superchat triggers a live visual alert on the stream." }
    ]
  },
  {
    path: "obs-overlay",
    title: "OBS Overlay Integration — Setup Twitch & OBS Crypto Alerts | SolTip",
    description: "Configure your OBS superchat overlay with SolTip. Full guide for Twitch crypto donations OBS, transparency settings, Streamlabs support, and Solana stream alerts.",
    keywords: "obs crypto overlay, twitch crypto tipping, youtube crypto donations, instant creator payments, on chain superchat, obs studio, twitch integration, stream alerts, browser source",
    faqs: [
      { q: "What are OBS crypto alerts and how fast do they display?", a: "OBS crypto alerts are live graphic and audio stream notifications triggered instantly in under 300ms via secure websockets." }
    ]
  },
  {
    path: "security",
    title: "Security Ledger & Wallet Transparency | SolTip",
    description: "Audit our secure Web3 smart contracts and cryptographic signature verifications. Secure, fully non-custodial, and protected against payment fraud chargebacks.",
    keywords: "instant creator payments, wallet based tipping, decentralized creator monetization, security audit, smart contracts, ledger security, non-custodial"
  },
  {
    path: "blog",
    title: "Creator Economy Blogs & Streamer Guides | SolTip",
    description: "Read advanced tips, stream tutorials, OBS overlay tricks, and monetization strategies to expand your digital broadcasting brand with Web3 tools.",
    keywords: "crypto donations for streamers, web3 superchat, decentralized creator monetization, blogs, streamer tutorials, creator monetization, crypto guide"
  },
  {
    path: "for-youtube",
    title: "YouTube Creator Solana Tipping & OBS Alerts Guide | SolTip",
    description: "Expand your YouTube broadcast revenue. Connect your Solana wallet, integrate our websocket OBS overlays, and receive instant 95% revenue splits with zero delays.",
    keywords: "youtube crypto donations, phantom wallet donations, instant creator payments, on chain superchat, youtube creators, youtube superchat alternative, solana tipping guide"
  },
  {
    path: "for-kick",
    title: "Kick Streamer Solana Tipping & OBS Alerts Guide | SolTip",
    description: "Optimize your Kick tipping setup. Bypass card dispute costs and get instant, non-custodial Solana donations integrated into your OBS alerts.",
    keywords: "twitch crypto tipping, instant creator payments, wallet based tipping, kick streaming, kick tips, decentralized donation widget"
  },
  {
    path: "for-streamlabs",
    title: "Streamlabs Solana Tipping & OBS Alerts Guide | SolTip",
    description: "Set up Web3 tipping inside Streamlabs. Easily paste your secure browser source URL to display real-time, customizable alerts on-stream in sub-seconds.",
    keywords: "obs crypto overlay, twitch crypto tipping, instant creator payments, streamlabs widgets, solana stream widgets, twitch alert panel"
  },
  {
    path: "for-content-creators",
    title: "Web3 Creator Solana Tipping & OBS Alerts Guide | SolTip",
    description: "The complete Web3 toolkit for content creators. Set up absolute decentralized tipping channels, direct wallet payouts, and glowing on-screen superchats.",
    keywords: "web3 superchat, decentralized creator monetization, on chain superchat, creator economy, dapps for streamers, decentralized superchats"
  },
  // 2. Individual SEO blog article pages
  {
    path: "blog/how-to-accept-crypto-donations-on-twitch",
    title: "How to Accept Crypto Donations on Twitch | SolTip Guide",
    description: "Step-by-step setup guide for Twitch streamers to accept decentralized cryptocurrency tips. Skip high commissions and prevent chargeback fraud entirely.",
    keywords: "Twitch Tipping, Crypto Donations, Stream Setup"
  },
  {
    path: "blog/best-obs-overlay-for-solana-donations",
    title: "Best OBS Overlay for Solana Donations & Alerts | SolTip",
    description: "Configure real-time, transparent Solana crypto alerts on your OBS overlays. Low-latency alert sandboxes with premium soundwaves and custom alerts.",
    keywords: "OBS Alerts, Solana Overlay, Streamlabs Setup"
  },
  {
    path: "blog/how-streamers-avoid-high-platform-fees",
    title: "How Streamers Avoid High Platform Fees | SolTip Tipping",
    description: "Discover the fee structures of major platforms. Learn why streamers are shifting to non-custodial crypto tipping to save up to 45% in platform commissions.",
    keywords: "Platform Fees, Streamer Earnings, Crypto Superchat"
  },
  {
    path: "blog/crypto-superchat-vs-youtube-superchat",
    title: "Crypto Superchat vs YouTube Superchat | SolTip Tipping",
    description: "A complete feature comparison between YouTube's native Super Chat and SolTip's crypto-based alternative. Save 25% on fees and settle tips instantly.",
    keywords: "YouTube Super Chat, Tipping Alternatives, DeFi Monetization"
  },
  {
    path: "blog/how-wallet-based-donations-work",
    title: "How Wallet-Based Donations Work | Web3 Creator Guide",
    description: "A simplified technical explanation of non-custodial crypto donations, client-side wallet adapters, and instant smart contract payouts on Solana.",
    keywords: "Web3 Wallet, Decentralized Finance, How It Works"
  },
  {
    path: "blog/best-solana-tools-for-creators",
    title: "Best Solana Tools for Creators & Streamers | SolTip Hub",
    description: "Our review of the best Solana tools, dApps, and non-custodial platforms for streamers, YouTubers, and content creators looking to monetize in Web3.",
    keywords: "Solana Tools, Creator Economy, Staking for Streamers"
  }
];

function prerender() {
  if (!fs.existsSync(INDEX_HTML_PATH)) {
    console.error(`☠️ Prerender failed: 'dist/index.html' not found! Make sure to run 'npm run build' first.`);
    process.exit(1);
  }

  console.log(`🚀 Starting Static Site Generation (SSG) Pre-render Engine...`);
  const template = fs.readFileSync(INDEX_HTML_PATH, "utf8");

  routes.forEach((route) => {
    const routeUrl = `https://soltip.in/${route.path}`;
    const canonicalTag = `<link rel="canonical" href="${routeUrl}" />`;
    const absoluteImage = "https://soltip.in/og-image.png";

    // Build custom header tags
    const metaHeadTags = `
    <title>${route.title}</title>
    <meta name="description" content="${route.description}" />
    <meta name="keywords" content="${route.keywords || ''}" />
    ${canonicalTag}
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${routeUrl}" />
    <meta property="og:title" content="${route.title}" />
    <meta property="og:description" content="${route.description}" />
    <meta property="og:image" content="${absoluteImage}" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${routeUrl}" />
    <meta property="twitter:title" content="${route.title}" />
    <meta property="twitter:description" content="${route.description}" />
    <meta property="twitter:image" content="${absoluteImage}" />
    `;

    // Build JSON-LD structured schemas
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SolTip",
      "url": "https://soltip.in",
      "description": "Solana-Powered Creator Superchats & OBS stream alerts"
    };

    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SolTip",
      "url": "https://soltip.in",
      "logo": "https://soltip.in/logo.png"
    };

    let schemasHTML = `
    <script type="application/ld+json">${JSON.stringify(websiteSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(organizationSchema)}</script>
    `;

    if (route.faqs && route.faqs.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": route.faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      };
      schemasHTML += `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>\n`;
    }

    // Build clean fallback static readable layout for non-JS bots
    let bodyFallbackHTML = `
    <div id="root">
      <header style="padding: 20px; text-align: center; font-family: sans-serif;">
        <h1 style="color: #9945FF;">SolTip Protocol</h1>
        <p>${route.title}</p>
      </header>
      <main style="max-width: 800px; margin: 40px auto; padding: 20px; font-family: sans-serif; line-height: 1.6;">
        <h2>${route.title}</h2>
        <p><strong>Description:</strong> ${route.description}</p>
        <p>This is a fast-loading pre-rendered version of the page. For full Web3 wallet connectivity, stream simulator games, and real-time settings, please enable JavaScript in your browser settings.</p>
    `;

    if (route.faqs && route.faqs.length > 0) {
      bodyFallbackHTML += `<h3>Frequently Asked Questions</h3>`;
      route.faqs.forEach(f => {
        bodyFallbackHTML += `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #14F195; border-radius: 8px;">
          <p><strong>Q: ${f.q}</strong></p>
          <p>A: ${f.a}</p>
        </div>
        `;
      });
    }

    bodyFallbackHTML += `
      </main>
      <footer style="text-align: center; padding: 20px; border-top: 1px solid #333; font-family: sans-serif; font-size: 12px; color: #888;">
        &copy; 2026 SolTip. Built natively on Solana. Instant peer-to-peer creator tips.
      </footer>
    </div>
    `;

    // Inject meta and fallback body into the main index.html template
    let hydratedHtml = template
      .replace("<title>SolTip | Solana Superchats</title>", "") // Remove dynamic/placeholder title
      .replace('<meta name="description" content="SolTip — The premier superchat and tipping platform for Solana creators. Experience instant on-stream alerts and non-custodial tipping." />', "")
      .replace("</head>", `${metaHeadTags}\n${schemasHTML}\n</head>`)
      .replace('<div id="root"></div>', bodyFallbackHTML);

    // Save index files into dedicated subfolders
    if (route.path === "") {
      // Main root file (keep as dist/index.html but fully hydrated)
      fs.writeFileSync(INDEX_HTML_PATH, hydratedHtml, "utf8");
      console.log(`   ✅ Pre-rendered homepage (/) directly inside 'dist/index.html'`);
    } else {
      // Subpage folder structure (e.g. dist/pricing/index.html)
      // Safe: route.path is from a hardcoded configuration array, not user input.
      // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
      const folderPath = path.join(DIST_DIR, route.path);
      fs.mkdirSync(folderPath, { recursive: true });
      // Safe: folderPath is safe and index.html is a static filename.
      // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
      fs.writeFileSync(path.join(folderPath, "index.html"), hydratedHtml, "utf8");
      console.log(`   ✅ Pre-rendered route (/${route.path}) inside 'dist/${route.path}/index.html'`);
    }
  });

  console.log(`🎉 Static Site Generation completed successfully! All index pages are fully hydrated for crawlers.`);
}

prerender();
