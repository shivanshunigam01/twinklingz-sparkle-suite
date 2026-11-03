import { formatPrice } from "@/lib/catalog";

export type ProductSharePayload = {
  name: string;
  slug: string;
  price?: number;
};

export function getProductShareUrl(slug: string): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return `${window.location.origin}/products/${encodeURIComponent(slug)}`;
  }
  return `https://www.twinklingz.com/products/${encodeURIComponent(slug)}`;
}

export function getProductShareMessage({ name, price }: ProductSharePayload): string {
  const line = `Check out ${name} on Twinklingz`;
  if (price == null || Number.isNaN(price)) return line;
  return `${line} — ${formatPrice(price)}`;
}

export async function copyProductLink(slug: string, message?: string): Promise<void> {
  const url = getProductShareUrl(slug);
  const text = message ? `${message}\n${url}` : url;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export async function nativeShareProduct(payload: ProductSharePayload): Promise<boolean> {
  if (!navigator.share) return false;
  const url = getProductShareUrl(payload.slug);
  const text = getProductShareMessage(payload);
  try {
    await navigator.share({
      title: `${payload.name} | Twinklingz`,
      text,
      url,
    });
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return true;
    return false;
  }
}

export function whatsAppShareUrl(payload: ProductSharePayload): string {
  const url = getProductShareUrl(payload.slug);
  const text = getProductShareMessage(payload);
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
}

export function facebookShareUrl(slug: string): string {
  const url = getProductShareUrl(slug);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function twitterShareUrl(payload: ProductSharePayload): string {
  const url = getProductShareUrl(payload.slug);
  const text = getProductShareMessage(payload);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}
