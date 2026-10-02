import heroImage from "@/assets/twinklingz-hero.jpg";
import categoriesImage from "@/assets/twinklingz-categories.jpg";
import campaignImage from "@/assets/twinklingz-campaign.jpg";
import lookImage from "@/assets/twinklingz-look.jpg";

export type Product = {
  id: string; slug: string; name: string; category: string; price: number; mrp?: number;
  badge?: "NEW" | "BESTSELLER"; rating: number; reviews: number; image: string; altImage: string;
};

export const products: Product[] = [
  { id: "p1", slug: "noor-layered-necklace", name: "Noor Layered Necklace", category: "Necklaces", price: 2299, mrp: 2999, badge: "NEW", rating: 4.8, reviews: 42, image: heroImage, altImage: categoriesImage },
  { id: "p2", slug: "gul-drop-earrings", name: "Gul Drop Earrings", category: "Earrings", price: 1499, mrp: 1999, badge: "BESTSELLER", rating: 4.9, reviews: 86, image: categoriesImage, altImage: lookImage },
  { id: "p3", slug: "meher-tennis-bracelet", name: "Meher Tennis Bracelet", category: "Bracelets", price: 1899, mrp: 2499, badge: "NEW", rating: 4.7, reviews: 31, image: categoriesImage, altImage: campaignImage },
  { id: "p4", slug: "ruhi-cocktail-ring", name: "Ruhi Cocktail Ring", category: "Rings", price: 1299, mrp: 1699, rating: 4.8, reviews: 57, image: categoriesImage, altImage: lookImage },
  { id: "p5", slug: "zarah-statement-set", name: "Zarah Statement Set", category: "Jewellery Sets", price: 4299, mrp: 5499, badge: "BESTSELLER", rating: 4.9, reviews: 64, image: campaignImage, altImage: lookImage },
  { id: "p6", slug: "inaaya-petal-studs", name: "Inaaya Petal Studs", category: "Earrings", price: 999, mrp: 1299, badge: "NEW", rating: 4.6, reviews: 24, image: heroImage, altImage: categoriesImage },
  { id: "p7", slug: "mira-fine-chain", name: "Mira Fine Chain", category: "Necklaces", price: 1699, rating: 4.7, reviews: 19, image: heroImage, altImage: campaignImage },
  { id: "p8", slug: "aabha-stack-rings", name: "Aabha Stack Rings", category: "Rings", price: 1599, mrp: 1999, rating: 4.8, reviews: 38, image: categoriesImage, altImage: campaignImage },
];

export const categoryNames = ["Necklaces", "Earrings", "Bracelets", "Rings", "Jewellery Sets", "New Arrivals"];
export const media = { heroImage, categoriesImage, campaignImage, lookImage };
export const formatPrice = (price: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
