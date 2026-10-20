import type { Product } from "@/lib/catalog";
import { isCloudinaryUrl } from "@/lib/product-images";

/** Safe fallback when static `/catalog/` assets are not on the CDN. */
export const MARKETING_IMAGE_FALLBACK =
  "https://res.cloudinary.com/cozu2jtr/image/upload/w_900,f_auto,q_auto/v1792484857/twinklingz/nec-57165-1-1.png";

export function pickCloudinaryImage(products: Product[], fallback = MARKETING_IMAGE_FALLBACK): string {
  const fromList = products.find((p) => isCloudinaryUrl(p.image))?.image;
  return fromList || (isCloudinaryUrl(fallback) ? fallback : MARKETING_IMAGE_FALLBACK);
}

export function categoryImageFromProducts(products: Product[], category: string, staticFallback: string): string {
  if (category === "New Arrivals") {
    const newPick = products.find((p) => p.badge === "NEW" && isCloudinaryUrl(p.image));
    if (newPick) return newPick.image;
  }
  const match = products.find((p) => p.category === category && isCloudinaryUrl(p.image));
  return match?.image || pickCloudinaryImage(products, staticFallback);
}

export function galleryFromProducts(products: Product[], limit = 24): string[] {
  const urls = products.flatMap((p) => [...p.images, p.image, p.altImage]).filter(isCloudinaryUrl);
  const unique = [...new Set(urls)];
  if (unique.length >= 6) return unique.slice(0, limit);
  return unique.length ? unique : [MARKETING_IMAGE_FALLBACK];
}
