/** First-frame JPG from a Cloudinary-hosted hero video (cover while video loads). */
export function cloudinaryVideoPosterUrl(videoUrl: string, width = 1600): string {
  if (!videoUrl || !/res\.cloudinary\.com/i.test(videoUrl) || !/\/video\//.test(videoUrl)) {
    return "";
  }
  const transformed = videoUrl.replace(
    "/video/upload/",
    `/video/upload/so_0,f_jpg,q_auto,w_${width}/`,
  );
  return transformed.replace(/\.(mp4|mov|webm)(\?.*)?$/i, ".jpg$2");
}
