import { createFileRoute } from "@tanstack/react-router";
import { CinematicHero } from "@/components/home/cinematic-hero";
import { DiwaliOfferSection } from "@/components/home/diwali-offer-section";
import {
  BestsellersSection,
  BrandStorySection,
  CampaignSection,
  CategorySection,
  EditSection,
  NewArrivalsSection,
  NewsletterSection,
  SocialSection,
  WhyTwinklingzSection,
} from "@/components/home/home-sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Twinklingz by Priya Kaur | Premium Fashion Jewellery" },
      {
        name: "description",
        content: "Discover elegant, contemporary fashion jewellery curated for every moment by Twinklingz.",
      },
      { property: "og:title", content: "Twinklingz by Priya Kaur" },
      { property: "og:description", content: "Because every sparkle tells a story." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main>
      <CinematicHero />
      <DiwaliOfferSection />
      <CategorySection />
      <NewArrivalsSection />
      <CampaignSection />
      <BestsellersSection />
      <EditSection />
      <BrandStorySection />
      <WhyTwinklingzSection />
      <SocialSection />
      <NewsletterSection />
    </main>
  );
}
