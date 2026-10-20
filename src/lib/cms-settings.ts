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
  headline: "A Journey of Purpose, Passion & Sparkle",
  body: `Every beautiful journey begins with a dream. Twinklingz By Priya Kaur brings together elegant, timeless jewellery chosen with an eye for beauty, detail, and timeless appeal — so every woman can find a piece that feels uniquely hers.`,
  highlight: "Every woman has a story. Let yours sparkle.",
} as const;

/** Full founder narrative for the About page */
export const FOUNDER_STORY = {
  title: "A Journey of Purpose, Passion & Sparkle",
  subtitle: "The story behind Twinklingz By Priya Kaur",
  paragraphs: [
    "Every beautiful journey begins with a dream. Mine began with a desire to create something of my own.",
    "After dedicating 10 years to the corporate world, working across Human Resources, Recruitment, and Marketing, I gained invaluable experiences, met incredible people, and learned the true value of building meaningful relationships.",
    "I have always loved meeting new people, understanding their stories, and connecting with them. Over time, I felt a growing desire to channel that passion into something personal — something I could build with my own vision, creativity, and heart.",
    "That desire became Twinklingz By Priya Kaur.",
    "For me, jewellery is more than an accessory. It is a reflection of personality, an expression of confidence, and a beautiful way to make everyday moments feel special. I wanted to create a brand where elegance meets individuality, and where every woman can find a piece that feels uniquely hers.",
    "Twinklingz is a new chapter in my journey — one that brings together my professional experience, my love for connecting with people, and my dream of building something meaningful.",
    "Every design we bring to you is chosen with an eye for beauty, detail, and timeless appeal. Whether you are dressing up for a special occasion or adding a little sparkle to your everyday style, I hope Twinklingz becomes a part of your most cherished moments.",
    "This is more than a jewellery brand. It is a dream taking shape, one beautiful piece at a time.",
    "Thank you for being here and becoming a part of my journey.",
  ],
  signOff: {
    closing: "With love,",
    name: "Priya Kaur",
    role: "Founder, Twinklingz By Priya Kaur",
  },
  tagline: "Every woman has a story. Let yours sparkle.",
} as const;

/** Hero background video under /public (override with VITE_HERO_SCROLL_VIDEO). */
export const HERO_SCROLL_VIDEO_SRC =
  (import.meta.env.VITE_HERO_SCROLL_VIDEO as string | undefined)?.trim() || "/hero-fashion-film.mp4";

/** Optional separate clip for `/admin/login` (defaults to hero video). */
export const ADMIN_LOGIN_VIDEO_SRC =
  (import.meta.env.VITE_ADMIN_LOGIN_VIDEO as string | undefined)?.trim() || HERO_SCROLL_VIDEO_SRC;

export const CATALOG_DEMO_NOTICE =
  "Styles and pricing shown use catalogue photography from Priya Kaur’s shoot. Final product titles and specs can be updated from admin.";
