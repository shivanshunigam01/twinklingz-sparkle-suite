import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type HeroAutoplayVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  onError?: () => void;
};

/** Muted background loop — same autoplay pattern as admin login showcase. */
export function HeroAutoplayVideo({ src, poster, className, onError }: HeroAutoplayVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const tryPlay = () => {
      void video.play().catch(() => undefined);
    };

    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);

    const tick = window.setInterval(() => {
      if (video.paused && video.readyState >= HTMLMediaElement.HAVE_METADATA) tryPlay();
    }, 600);

    const onGesture = () => tryPlay();
    document.addEventListener("pointerdown", onGesture, { once: true, passive: true });

    return () => {
      window.clearInterval(tick);
      document.removeEventListener("pointerdown", onGesture);
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
    };
  }, [src]);

  const clearPosterOnPlay = () => {
    ref.current?.removeAttribute("poster");
  };

  return (
    <video
      key={src}
      ref={ref}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      src={src}
      poster={poster}
      autoPlay
      muted
      defaultMuted
      playsInline
      loop
      preload="auto"
      disablePictureInPicture
      onPlay={clearPosterOnPlay}
      onPlaying={clearPosterOnPlay}
      onTimeUpdate={clearPosterOnPlay}
      onError={onError}
    />
  );
}