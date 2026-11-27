import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroAutoplayVideo } from "@/components/hero-autoplay-video";
import { HERO_VIDEO_DESKTOP_SRC, HERO_VIDEO_MOBILE_SRC } from "@/lib/cms-settings";
import { media } from "@/lib/catalog";
import { optimizeImageUrl } from "@/lib/cloudinary-url";
import { cloudinaryVideoMp4Url, cloudinaryVideoPosterUrl } from "@/lib/cloudinary-video-poster";
import { useSiteSettings } from "@/lib/use-site-settings";

const DESKTOP_HERO_POSTER = "/hero-fashion-film-desktop-poster.jpg";

function readHeroViewport(): "mobile" | "desktop" {
  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

function pickHeroVideoSrc(
  viewport: "mobile" | "desktop",
  apiDesktop: string,
  apiMobile: string,
): string {
  const raw =
    viewport === "mobile"
      ? apiMobile.trim() || HERO_VIDEO_MOBILE_SRC
      : apiDesktop.trim() || HERO_VIDEO_DESKTOP_SRC;
  return cloudinaryVideoMp4Url(raw);
}

export function CinematicHero() {
  const fallbackTriedRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState<"mobile" | "desktop">("desktop");
  const [useVideo, setUseVideo] = useState(true);
  const [videoSrcOverride, setVideoSrcOverride] = useState<string | null>(null);
  const { data: siteSettings } = useSiteSettings();

  const apiDesktop = siteSettings.heroVideoDesktop ?? "";
  const apiMobile = siteSettings.heroVideoMobile ?? "";

  const resolvedVideoSrc = useMemo(
    () => pickHeroVideoSrc(viewport, apiDesktop, apiMobile),
    [viewport, apiDesktop, apiMobile],
  );
  const videoSrc = videoSrcOverride ?? resolvedVideoSrc;

  const localFallback = viewport === "mobile" ? HERO_VIDEO_MOBILE_SRC : HERO_VIDEO_DESKTOP_SRC;
  const isLocalVideo = videoSrc.startsWith("/");

  const posterSrc = useMemo(() => {
    const fromCloudinary = cloudinaryVideoPosterUrl(videoSrc, 1600);
    if (fromCloudinary) return fromCloudinary;
    if (viewport === "desktop") return DESKTOP_HERO_POSTER;
    return optimizeImageUrl(media.heroImage, 1600);
  }, [videoSrc, viewport]);

  useEffect(() => {
    setMounted(true);
    setViewport(readHeroViewport());
    const mq = window.matchMedia("(max-width: 767px)");
    const onViewport = () => {
      setViewport(mq.matches ? "mobile" : "desktop");
      fallbackTriedRef.current = false;
      setVideoSrcOverride(null);
    };
    mq.addEventListener("change", onViewport);
    return () => mq.removeEventListener("change", onViewport);
  }, []);

  useEffect(() => {
    fallbackTriedRef.current = false;
    setVideoSrcOverride(null);
  }, [resolvedVideoSrc]);

  function handleVideoError() {
    if (!fallbackTriedRef.current && videoSrc !== localFallback) {
      fallbackTriedRef.current = true;
      setVideoSrcOverride(localFallback);
      return;
    }
    setUseVideo(false);
  }

  return (
    <section className="relative h-screen bg-primary">
      <div className="relative h-full overflow-hidden">
        {mounted && useVideo ? (
          <HeroAutoplayVideo
            src={videoSrc}
            poster={isLocalVideo ? undefined : posterSrc}
            onError={handleVideoError}
          />
        ) : (
          <img
            src={posterSrc}
            alt=""
            width={1600}
            height={900}
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 z-0 h-full w-full object-cover"
            aria-hidden
          />
        )}

        <div className="absolute inset-0 z-[1] bg-hero-shade" />

        <div className="absolute inset-0 z-[2] flex items-center justify-center px-5 text-center text-primary-foreground">
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