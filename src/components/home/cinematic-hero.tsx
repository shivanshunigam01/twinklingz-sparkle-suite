import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_VIDEO_DESKTOP_SRC, HERO_VIDEO_MOBILE_SRC } from "@/lib/cms-settings";
import { media } from "@/lib/catalog";
import { optimizeImageUrl } from "@/lib/cloudinary-url";

const DESKTOP_HERO_POSTER = "/hero-fashion-film-desktop-poster.jpg";

function readHeroViewport(): "mobile" | "desktop" {
  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

/** SSR + first client paint must match — viewport is applied after mount. */
export function CinematicHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const coverDismissedRef = useRef(false);
  const previousVideoSrcRef = useRef<string | null>(null);
  const [showCover, setShowCover] = useState(true);
  const [useVideo, setUseVideo] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [viewport, setViewport] = useState<"mobile" | "desktop">("desktop");
  const [clientReady, setClientReady] = useState(false);

  const videoSrc = viewport === "mobile" ? HERO_VIDEO_MOBILE_SRC : HERO_VIDEO_DESKTOP_SRC;
  const coverImageSrc = useMemo(() => {
    if (viewport === "desktop") return DESKTOP_HERO_POSTER;
    return optimizeImageUrl(media.heroImage, 1600);
  }, [viewport]);

  const dismissCover = useCallback(() => {
    if (coverDismissedRef.current) return;
    coverDismissedRef.current = true;
    setShowCover(false);
  }, []);

  useEffect(() => {
    setClientReady(true);
    setViewport(readHeroViewport());

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPrefersReducedMotion(reduced);
    if (reduced) setUseVideo(false);

    const mq = window.matchMedia("(max-width: 767px)");
    const onViewportChange = () => setViewport(mq.matches ? "mobile" : "desktop");
    mq.addEventListener("change", onViewportChange);
    return () => mq.removeEventListener("change", onViewportChange);
  }, []);

  useEffect(() => {
    const previous = previousVideoSrcRef.current;
    previousVideoSrcRef.current = videoSrc;
    if (previous === null || previous === videoSrc) return;
    coverDismissedRef.current = false;
    setShowCover(true);
  }, [videoSrc]);

  const showVideo = useVideo && !prefersReducedMotion;

  useEffect(() => {
    if (!showVideo) return;

    const video = videoRef.current;
    if (!video) return;

    const syncCover = () => {
      if (video.currentTime > 0.05 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        dismissCover();
      }
    };

    /** Avoid a black flash when the browser seeks back to 0 at loop end. */
    const smoothLoop = () => {
      const { duration, currentTime } = video;
      if (!Number.isFinite(duration) || duration <= 0) return;
      if (currentTime >= duration - 0.08) {
        video.currentTime = 0.001;
      }
    };

    video.addEventListener("playing", dismissCover);
    video.addEventListener("timeupdate", syncCover);
    video.addEventListener("timeupdate", smoothLoop);
    video.addEventListener("loadeddata", syncCover);

    syncCover();
    if (video.paused) {
      void video.play().catch(() => {
        /* Autoplay blocked — keep cover until interaction */
      });
    }

    return () => {
      video.removeEventListener("playing", dismissCover);
      video.removeEventListener("timeupdate", syncCover);
      video.removeEventListener("timeupdate", smoothLoop);
      video.removeEventListener("loadeddata", syncCover);
    };
  }, [showVideo, videoSrc, dismissCover]);

  return (
    <section className="relative h-screen bg-primary">
      <div className="relative h-full overflow-hidden">
        {showVideo && clientReady ? (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            playsInline
            autoPlay
            loop
            preload="auto"
            disablePictureInPicture
            className="absolute inset-0 h-full w-full object-cover [transform:translateZ(0)]"
            onPlaying={dismissCover}
            onError={() => setUseVideo(false)}
          />
        ) : null}

        {showCover ? (
          <img
            src={coverImageSrc}
            alt=""
            width={1600}
            height={900}
            decoding="async"
            fetchPriority="high"
            aria-hidden
            className="absolute inset-0 z-[1] h-full w-full object-cover"
          />
        ) : null}

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
