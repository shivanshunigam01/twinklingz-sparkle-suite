import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { HERO_VIDEO_DESKTOP_SRC, HERO_VIDEO_MOBILE_SRC } from "@/lib/cms-settings";
import { media } from "@/lib/catalog";
import { cn } from "@/lib/utils";

function videoIsRenderable(video: HTMLVideoElement) {
  return !video.paused || video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
}

export function CinematicHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoVisible, setVideoVisible] = useState(false);
  const [useVideo, setUseVideo] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const poster = media.heroImage;

  const revealVideo = useCallback(() => {
    setVideoVisible(true);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPrefersReducedMotion(reduced);
    if (reduced) setUseVideo(false);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !useVideo) return;

    const video = videoRef.current;
    if (!video) return;

    if (videoIsRenderable(video)) {
      revealVideo();
    }

    const onReady = () => {
      if (videoIsRenderable(video)) revealVideo();
    };

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("playing", revealVideo);

    const tryPlay = () => {
      void video.play().catch(() => {
        /* Autoplay blocked — keep poster + try again on first interaction */
      });
    };
    tryPlay();

    return () => {
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("playing", revealVideo);
    };
  }, [prefersReducedMotion, useVideo, revealVideo]);

  return (
    <section className="relative h-screen bg-primary">
      <div className="relative h-full overflow-hidden">
        <LazyImage
          src={poster}
          alt=""
          optimizeWidth={1600}
          width={1600}
          height={900}
          priority
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />

        {useVideo && !prefersReducedMotion ? (
          <video
            ref={videoRef}
            poster={poster}
            muted
            playsInline
            autoPlay
            loop
            preload="auto"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out",
              videoVisible ? "opacity-100" : "opacity-0",
            )}
            onPlaying={revealVideo}
            onLoadedData={revealVideo}
            onCanPlay={revealVideo}
            onError={() => setUseVideo(false)}
          >
            <source src={HERO_VIDEO_DESKTOP_SRC} media="(min-width: 768px)" type="video/mp4" />
            <source src={HERO_VIDEO_MOBILE_SRC} media="(max-width: 767px)" type="video/mp4" />
          </video>
        ) : null}

        <div className="absolute inset-0 bg-hero-shade" />

        <div className="absolute inset-0 flex items-center justify-center px-5 text-center text-primary-foreground">
          <div className="max-w-4xl motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700">
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
