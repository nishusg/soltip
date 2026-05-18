import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
  faqs?: Array<{ q: string; a: string }>;
  creatorProfile?: {
    name: string;
    bio: string;
    avatarUrl: string;
    walletAddress: string;
    socials?: {
      twitter?: string;
      youtube?: string;
      twitch?: string;
      kick?: string;
      discord?: string;
    };
  };
}

export default function SEO({ 
  title = "SolChat — Solana-Powered Superchats", 
  description = "The premier superchat and tipping platform for Solana creators. Experience instant on-stream alerts and non-custodial tipping.",
  image = "/og-image.png",
  url,
  keywords = "solana, superchat, tips, streamers, crypto tipping, obs alerts, web3, creator tools",
  faqs,
  creatorProfile
}: SEOProps) {
  const fullTitle = title.includes("SolChat") ? title : `${title} | SolChat`;

  // Dynamically resolve canonical URL
  const canonicalUrl = url || (typeof window !== "undefined" ? window.location.origin + window.location.pathname : "https://solchat.io");

  // Dynamically resolve absolute image URL to prevent broken embeds
  const absoluteImage = image.startsWith("http") 
    ? image 
    : (typeof window !== "undefined" ? window.location.origin + image : `https://solchat.io${image}`);

  // Base structured schemas
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SolChat",
    "url": "https://solchat.io",
    "description": "Solana-Powered Creator Superchats & OBS stream alerts"
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SolChat",
    "url": "https://solchat.io",
    "logo": "https://solchat.io/logo.png",
    "sameAs": [
      "https://twitter.com/solchat_io",
      "https://github.com/solchat-gh"
    ]
  };

  // Conditionally compile FAQ schema for Google Search Accordions
  const faqSchema = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  } : null;

  // Conditionally compile dynamic creator ProfilePage schema
  const profileSchema = creatorProfile ? {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": creatorProfile.name,
      "description": creatorProfile.bio,
      "image": creatorProfile.avatarUrl,
      "identifier": creatorProfile.walletAddress,
      "sameAs": Object.values(creatorProfile.socials || {}).filter(Boolean)
    }
  } : null;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={absoluteImage} />

      {/* Inject JSON-LD Schema Markups */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
      {profileSchema && (
        <script type="application/ld+json">
          {JSON.stringify(profileSchema)}
        </script>
      )}
    </Helmet>
  );
}
