/** Product photos are served from Cloudinary in production. */

export function isCloudinaryUrl(url: string): boolean {
  if (!url) return false;
  return /res\.cloudinary\.com/i.test(url) || /cloudinary\.com/i.test(url);
}

export function filterCloudinaryUrls(urls: string[]): string[] {
  return urls.filter((u) => typeof u === "string" && isCloudinaryUrl(u));
}

export function collectImageUrls(input: {
  images?: string[];
  image?: string;
  altImage?: string;
}): string[] {
  const merged = [...(input.images ?? []), input.image, input.altImage].filter(Boolean) as string[];
  const cloud = filterCloudinaryUrls(merged);
  if (cloud.length > 0) return [...new Set(cloud)];
  return [...new Set(merged)];
}
