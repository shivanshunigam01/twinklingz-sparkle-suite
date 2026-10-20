/** Editable storefront copy — wire to admin CMS when backend is live. */

export const BRAND = {
  name: "Twinklingz",
  subBrand: "by Priya Kaur",
  tagline: "Because every sparkle tells a story.",
  category: "Premium Fashion Jewellery",
} as const;

export const ANNOUNCEMENT_BAR =
  "✦ Free Shipping on Selected Orders | Secure Online Payments ✦";

export const SOCIAL = {
  instagramHandle: "@Twinklingz",
  instagramUrl: "https://www.instagram.com/",
} as const;

export const RETURN_REFUND_POLICY =
  "All sales are final. No returns, refunds, or exchanges.";

export const STORY_COPY = {
  headline: "Jewellery for the stories only you can tell.",
  body: `We bring you elegant, timeless, and trend-forward jewellery designed to complement every style and occasion.

From everyday essentials to statement pieces, each collection is carefully curated to help you shine with confidence.

Our mission is to offer beautiful jewellery that combines quality, affordability, and sophistication.`,
  highlight: "Because every sparkle tells a story. ✨",
} as const;

/** Hero background video under /public (override with VITE_HERO_SCROLL_VIDEO). */
export const HERO_SCROLL_VIDEO_SRC =
  (import.meta.env.VITE_HERO_SCROLL_VIDEO as string | undefined)?.trim() || "/hero-fashion-film.mp4";

/** Optional separate clip for `/admin/login` (defaults to hero video). */
export const ADMIN_LOGIN_VIDEO_SRC =
  (import.meta.env.VITE_ADMIN_LOGIN_VIDEO as string | undefined)?.trim() || HERO_SCROLL_VIDEO_SRC;

export const CATALOG_DEMO_NOTICE =
  "Styles and pricing shown use catalogue photography from Priya Kaur’s shoot. Final product titles and specs can be updated from admin.";
