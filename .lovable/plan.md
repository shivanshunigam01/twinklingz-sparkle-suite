# Twinklingz production build plan

## Foundation
- Establish the original Twinklingz design system using the supplied burgundy, blush, ivory, champagne, and rose-gold palette; editorial serif headings, clean sans-serif UI text, and restrained script accents.
- Build a reusable storefront shell with responsive announcement bar, transparent-to-solid header, search, account, wishlist, bag drawer, footer, and mobile bottom navigation.
- Use clearly labelled demo/sample catalogue content until real product files and specifications are supplied.

## Storefront experience
- Build the homepage around a pinned, scroll-controlled cinematic jewellery sequence with motion-reduced and mobile fallbacks, followed by category discovery, new arrivals, campaign, bestsellers, interactive Shop the Look, editorial collections, brand story, trust points, social gallery, and newsletter.
- Create dedicated routes for the requested catalogue, category, collection, product, cart, checkout, confirmation, account, wishlist, tracking, story, contact, FAQ, care, and policy pages.
- Add working catalogue filtering/sorting, predictive search, product galleries and variants, wishlist, cart drawer/page, checkout steps, order summary, loading/empty/error/success states, and mobile-first interactions.

## Commerce backend and accounts
- Use Lovable Cloud for customer authentication, persistent catalogue/CMS data, addresses, wishlists, carts, inventory, orders, payments, reviews, coupons, banners, and settings.
- Add role-safe admin access with a separate roles table, row-level access rules, and server-validated permissions.
- Implement email/password and Google sign-in, password recovery, customer profile/address/order history, and persistent guest-to-account shopping state.
- Keep payment details entirely with the future approved gateway; prepare a secure server-side payment adapter and webhook boundary without inventing credentials.

## Admin
- Build an authenticated admin dashboard for products and variants, inventory, orders and statuses, customers, coupons, banners, homepage content, policies, social links, and settings.
- Add media upload architecture and CSV product import with validation, preview, row-level errors, and demo-data safeguards.

## SEO, analytics, and quality
- Add unique metadata for every public content route, product and breadcrumb structured data, canonical URLs, robots rules, and sitemap output.
- Add consent-aware analytics hooks for the requested commerce events, ready for future GA4, GTM, Meta, and Merchant Centre identifiers.
- Optimize images/video, lazy loading, route splitting, motion preferences, keyboard access, mobile/desktop layouts, and critical shopping flows.
- Verify the main journey end to end: browse → product → wishlist/cart → checkout → confirmation, plus sign-in/account and admin product/order workflows.

## External inputs still needed for launch
- Actual Twinklingz logo file, jewellery photography/video, final product catalogue/specifications, official contact/social details, shipping thresholds/timelines, tax rules, and legal/business identity.
- Approved payment-gateway credentials and production analytics/marketing IDs.
- Until supplied, the site will visibly identify catalogue entries as sample data and will not make unsupported policy or delivery claims.
