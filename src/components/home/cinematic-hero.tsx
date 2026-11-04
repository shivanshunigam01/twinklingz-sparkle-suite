import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_VIDEO_DESKTOP_SRC, HERO_VIDEO_MOBILE_SRC } from "@/lib/cms-settings";
import { media } from "@/lib/catalog";
import { optimizeImageUrl } from "@/lib/cloudinary-url";
import { cloudinaryVideoMp4Url, cloudinaryVideoPosterUrl } from "@/lib/cloudinary-video-poster";
import { useSiteSettings } from "@/lib/use-site-settings";

const DESKTOP_HERO_POSTER = "/hero-fashion-film-desktop-poster.jpg";

function readHeroViewport(): "mobile" | "desktop" {
  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

function tryPlay(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.loop = true;
  return video.play();
}

/** SSR + first client paint must match — viewport is applied after mount. */
export function CinematicHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const coverDismissedRef = useRef(false);
  const previousVideoSrcRef = useRef<string | null>(null);
  const fallbackTriedRef = useRef(false);
  const [showCover, setShowCover] = useState(true);
  const [useVideo, setUseVideo] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [viewport, setViewport] = useState<"mobile" | "desktop">("desktop");
  const [clientReady, setClientReady] = useState(false);
  const { data: siteSettings } = useSiteSettings();

  const desktopFallback = HERO_VIDEO_DESKTOP_SRC;
  const mobileFallback = HERO_VIDEO_MOBILE_SRC;
  const desktopVideo = cloudinaryVideoMp4Url(siteSettings.heroVideoDesktop?.trim() || desktopFallback);
  const mobileVideo = cloudinaryVideoMp4Url(siteSettings.heroVideoMobile?.trim() || mobileFallback);
  const videoSrc = viewport === "mobile" ? mobileVideo : desktopVideo;
  const localFallback = viewport === "mobile" ? mobileFallback : desktopFallback;

  const coverImageSrc = useMemo(() => {
    const activeVideo = viewport === "mobile" ? mobileVideo : desktopVideo;
    const fromCloudinary = cloudinaryVideoPosterUrl(activeVideo, 1600);
    if (fromCloudinary) return fromCloudinary;
    if (viewport === "desktop") return DESKTOP_HERO_POSTER;
    return optimizeImageUrl(media.heroImage, 1600);
  }, [viewport, desktopVideo, mobileVideo]);

  const [posterSrc, setPosterSrc] = useState(coverImageSrc);
  useEffect(() => {
    setPosterSrc(coverImageSrc);
  }, [coverImageSrc]);

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
    fallbackTriedRef.current = false;
    setShowCover(true);
  }, [videoSrc]);

  const showVideo = useVideo && !prefersReducedMotion;

  useEffect(() => {
    if (!showVideo || !clientReady) return;

    const video = videoRef.current;
    if (!video) return;

    const syncCover = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && (!video.paused || video.currentTime > 0)) {
        dismissCover();
      }
    };

    const smoothLoop = () => {
      const { duration, currentTime } = video;
      if (!Number.isFinite(duration) || duration <= 0) return;
      if (currentTime >= duration - 0.08) {
        video.currentTime = 0.001;
      }
    };

    const tick = window.setInterval(() => {
      if (video.paused) {
        void tryPlay(video).catch(() => undefined);
      } else {
        dismissCover();
      }
    }, 500);

    const coverSafety = window.setTimeout(() => {
      if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) dismissCover();
    }, 1800);

    const onUserGesture = () => {
      void tryPlay(video).then(() => dismissCover()).catch(() => undefined);
    };
    document.addEventListener("pointerdown", onUserGesture, { once: true, passive: true });

    video.addEventListener("playing", dismissCover);
    video.addEventListener("timeupdate", syncCover);
    video.addEventListener("timeupdate", smoothLoop);

    void tryPlay(video).catch(() => undefined);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(coverSafety);
      document.removeEventListener("pointerdown", onUserGesture);
      video.removeEventListener("playing", dismissCover);
      video.removeEventListener("timeupdate", syncCover);
      video.removeEventListener("timeupdate", smoothLoop);
    };
  }, [showVideo, clientReady, videoSrc, dismissCover]);

  const handleVideoError = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!fallbackTriedRef.current && videoSrc !== localFallback) {
      fallbackTriedRef.current = true;
      video.src = localFallback;
      void tryPlay(video).catch(() => undefined);
      return;
    }
    setUseVideo(false);
  }, [videoSrc, localFallback]);

  return (
    <section className="relative h-screen bg-primary">
      <div className="relative h-full overflow-hidden">
        {showVideo && clientReady ? (
          <video
            key={videoSrc}
            ref={videoRef}
            src={videoSrc}
            muted
            defaultMuted
            playsInline
            autoPlay
            loop
            preload="auto"
            disablePictureInPicture
            className="absolute inset-0 z-0 h-full w-full object-cover [transform:translateZ(0)]"
            onPlaying={dismissCover}
            onPlay={dismissCover}
            onTimeUpdate={dismissCover}
            onError={handleVideoError}
          />
        ) : null}

        {showCover ? (
          <img
            src={posterSrc}
            alt=""
            width={1600}
            height={900}
            decoding="async"
            fetchPriority="high"
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover"
            onError={() => {
              if (viewport === "desktop") setPosterSrc(DESKTOP_HERO_POSTER);
              else setPosterSrc(optimizeImageUrl(media.heroImage, 1600));
              dismissCover();
            }}
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
