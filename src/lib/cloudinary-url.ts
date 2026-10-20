/** Smaller, auto-format Cloudinary URLs for faster page loads. */
export function optimizeImageUrl(src: string, width = 600): string {
  if (!src || !/res\.cloudinary\.com/i.test(src)) return src;
  if (/\/upload\/[^/]*\bw_\d+/.test(src)) return src;
  const transform = `c_limit,w_${width},f_auto,q_auto:good,dpr_auto`;
  return src.replace("/upload/", `/upload/${transform}/`);
}

/** PDP hero: fill frame (4:5) so catalogue shots don’t sit tiny inside a large box. */
export function optimizePdpHeroUrl(src: string, width = 1000): string {
  if (!src || !/res\.cloudinary\.com/i.test(src)) return src;
  if (/\/upload\/[^/]*\bc_fill/.test(src)) return src;
  const height = Math.round(width * 1.25);
  const transform = `c_fill,g_auto,w_${width},h_${height},f_auto,q_auto:good,dpr_auto`;
  return src.replace("/upload/", `/upload/${transform}/`);
}
