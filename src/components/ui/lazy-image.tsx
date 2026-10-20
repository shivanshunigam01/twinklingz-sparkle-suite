import { useState, type ImgHTMLAttributes } from "react";
import { optimizeImageUrl } from "@/lib/cloudinary-url";
import { cn } from "@/lib/utils";

type LazyImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "loading"> & {
  src: string;
  /** LCP / hero images only */
  priority?: boolean;
  /** Max width sent to Cloudinary transform */
  optimizeWidth?: number;
};

export function LazyImage({
  src,
  alt = "",
  className,
  priority = false,
  optimizeWidth = 600,
  width,
  height,
  sizes,
  onError,
  onLoad,
  ...props
}: LazyImageProps) {
  const [failed, setFailed] = useState(false);
  const [useOriginal, setUseOriginal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const optimized = optimizeImageUrl(src, optimizeWidth);
  const displaySrc = useOriginal ? src : optimized;

  if (!src || failed) {
    return (
      <div
        className={cn("animate-pulse bg-muted", className)}
        role="img"
        aria-label={alt || "Image unavailable"}
      />
    );
  }

  return (
    <span className="relative block size-full">
      {!loaded && <span className="absolute inset-0 z-0 animate-pulse bg-muted" aria-hidden />}
      <img
        {...props}
        src={displaySrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={cn(
          "relative z-[1] transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          if (!useOriginal && optimized !== src) {
            setUseOriginal(true);
            setLoaded(false);
            return;
          }
          setFailed(true);
          onError?.(e);
        }}
      />
    </span>
  );
}
