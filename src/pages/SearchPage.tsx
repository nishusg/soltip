import CreatorSearch from "../components/features/creator/CreatorSearch";
import { Container, Box } from "@mui/material";
import SEO from "../components/common/SEO";

export default function SearchPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6, minHeight: "calc(100vh - 120px)" }}>
      <SEO 
        title="Search Solana Creators & Streamers"
        description="Search and discover your favorite Solana streamers, content creators, and degens. Tip them instantly with near-zero network fees."
      />
      <Box sx={{ animation: "fadeInUp 0.6s ease-out" }}>
        <CreatorSearch />
      </Box>
    </Container>
  );
}
