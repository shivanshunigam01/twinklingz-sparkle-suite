import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { HERO_VIDEO_DESKTOP_SRC, HERO_VIDEO_MOBILE_SRC } from "@/lib/cms-settings";
import { media } from "@/lib/catalog";
import { cn } from "@/lib/utils";

function readHeroViewport(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

export function CinematicHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const coverDismissedRef = useRef(false);
  const [coverVisible, setCoverVisible] = useState(true);
  const [useVideo, setUseVideo] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [viewport, setViewport] = useState(readHeroViewport);
  const poster = media.heroImage;
  const videoSrc = viewport === "mobile" ? HERO_VIDEO_MOBILE_SRC : HERO_VIDEO_DESKTOP_SRC;

  const dismissCover = useCallback(() => {
    if (coverDismissedRef.current) return;
    coverDismissedRef.current = true;
    setCoverVisible(false);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPrefersReducedMotion(reduced);
    if (reduced) setUseVideo(false);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => setViewport(mq.matches ? "mobile" : "desktop");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    coverDismissedRef.current = false;
    setCoverVisible(true);
  }, [videoSrc]);

  useEffect(() => {
    if (prefersReducedMotion || !useVideo) return;

    const video = videoRef.current;
    if (!video) return;

    const onPlayback = () => {
      if (video.currentTime > 0.02 || !video.paused) dismissCover();
    };

    video.addEventListener("playing", dismissCover);
    video.addEventListener("timeupdate", onPlayback);
    video.addEventListener("loadeddata", onPlayback);

    void video.play().catch(() => {
      /* Autoplay blocked — keep cover until user interacts */
    });

    return () => {
      video.removeEventListener("playing", dismissCover);
      video.removeEventListener("timeupdate", onPlayback);
      video.removeEventListener("loadeddata", onPlayback);
    };
  }, [prefersReducedMotion, useVideo, videoSrc, dismissCover]);

  const showVideo = useVideo && !prefersReducedMotion;

  return (
    <section className="relative h-screen bg-primary">
      <div className="relative h-full overflow-hidden">
        {showVideo ? (
          <video
            key={videoSrc}
            ref={videoRef}
            src={videoSrc}
            muted
            playsInline
            autoPlay
            loop
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
            onPlaying={dismissCover}
            onError={() => setUseVideo(false)}
          />
        ) : null}

        <LazyImage
          src={poster}
          alt=""
          optimizeWidth={1600}
          width={1600}
          height={900}
          priority
          aria-hidden
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            showVideo && "pointer-events-none transition-opacity duration-700 ease-out",
            showVideo && (coverVisible ? "z-[1] opacity-100" : "z-0 opacity-0"),
          )}
        />

        <div className="absolute inset-0 z-[2] bg-hero-shade" />

        <div className="absolute inset-0 z-[3] flex items-center justify-center px-5 text-center text-primary-foreground">
          <div className="max-w-4xl">
            <p className="font-display text-5xl sm:text-7xl lg:text-8xl">TWINKLINGZ</p>
            <p className="mt-4 font-display text-2xl leading-snug sm:text-4xl">
              Jewellery made for your moments.
            </p>
            <p className="mt-3 font-script text-3xl text-champagne sm:text-4xl">by Priya Kaur</p>
            <p className="mx-auto mt-5 max-w-lg text-sm tracking-[0.18em] text-primary-foreground/90 sm:text-base">
              Because every sparkle tells a story.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-primary-foreground text-primary hover:bg-champagne"
            >
              <Link to="/shop">
                EXPLORE THE COLLECTION <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
