import { useEffect, useState } from "react";
import { LazyImage } from "@/components/ui/lazy-image";
import { ADMIN_LOGIN_VIDEO_SRC, BRAND } from "@/lib/cms-settings";
import { media } from "@/lib/catalog";
import { galleryFromProducts, MARKETING_IMAGE_FALLBACK, pickCloudinaryImage } from "@/lib/marketing-images";
import { usePublicProducts } from "@/lib/use-public-products";

export function AdminLoginShowcase() {
  const { data: products = [] } = usePublicProducts();
  const photos = galleryFromProducts(products, 8);
  const poster = pickCloudinaryImage(products, media.heroImage || MARKETING_IMAGE_FALLBACK);
  const [useVideo, setUseVideo] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (useVideo || photos.length < 2) return;
    const id = window.setInterval(() => setSlide((s) => (s + 1) % photos.length), 4500);
    return () => window.clearInterval(id);
  }, [useVideo, photos.length]);

  const stillSrc = photos[slide] ?? poster;

  return (
    <div className="relative flex min-h-[42vh] flex-col justify-end overflow-hidden bg-primary lg:min-h-screen">
      {useVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={ADMIN_LOGIN_VIDEO_SRC}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setUseVideo(false)}
        />
      ) : (
        <LazyImage
          src={stillSrc}
          alt=""
          optimizeWidth={1200}
          priority
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-primary/20" />
      <div className="relative z-10 p-8 text-primary-foreground lg:p-12">
        <p className="text-xs tracking-[0.28em] text-champagne">{BRAND.name.toUpperCase()}</p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl">Admin studio</h2>
        <p className="mt-3 max-w-md text-sm text-primary-foreground/85">
          {BRAND.subBrand} — manage products, Cloudinary photos, orders, and storefront content.
        </p>
      </div>
      {photos.length > 0 && (
        <div className="relative z-10 border-t border-primary-foreground/15 bg-primary/40 p-4 backdrop-blur-sm lg:p-6">
          <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-primary-foreground/70">
            FROM YOUR CATALOGUE
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => {
                  setUseVideo(false);
                  setSlide(i);
                }}
                className={`size-16 shrink-0 overflow-hidden rounded-md border-2 transition sm:size-20 ${
                  !useVideo && slide === i
                    ? "border-champagne"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
                aria-label={`Preview catalogue photo ${i + 1}`}
              >
                <LazyImage src={src} alt="" optimizeWidth={160} className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
