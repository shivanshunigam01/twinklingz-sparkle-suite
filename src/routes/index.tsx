import { createFileRoute } from "@tanstack/react-router";
import { CinematicHero } from "@/components/home/cinematic-hero";
import { HERO_VIDEO_DESKTOP_SRC, HERO_VIDEO_MOBILE_SRC } from "@/lib/cms-settings";
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
    links: [
      {
        rel: "preload",
        href: HERO_VIDEO_DESKTOP_SRC,
        as: "video",
        type: "video/mp4",
        media: "(min-width: 768px)",
      },
      {
        rel: "preload",
        href: HERO_VIDEO_MOBILE_SRC,
        as: "video",
        type: "video/mp4",
        media: "(max-width: 767px)",
      },
    ],
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
