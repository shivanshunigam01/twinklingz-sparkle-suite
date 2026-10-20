/** Smaller, auto-format Cloudinary URLs for faster page loads. */
export function optimizeImageUrl(src: string, width = 600): string {
  if (!src || !/res\.cloudinary\.com/i.test(src)) return src;
  if (/\/upload\/[^/]*\bw_\d+/.test(src)) return src;
  const transform = `c_limit,w_${width},f_auto,q_auto:good,dpr_auto`;
  return src.replace("/upload/", `/upload/${transform}/`);
}
