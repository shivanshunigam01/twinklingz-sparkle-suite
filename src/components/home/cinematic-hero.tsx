import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { HERO_SCROLL_VIDEO_SRC } from "@/lib/cms-settings";
import { media } from "@/lib/catalog";

const COPY = [
  "TWINKLINGZ",
  "Jewellery made for your moments.",
  "Elegant.\nTimeless.\nUniquely You.",
  "Because every sparkle tells a story.",
  "TWINKLINGZ",
] as const;

function copyIndexForProgress(progress: number) {
  const p = Math.min(1, Math.max(0, progress));
  return Math.min(COPY.length - 1, Math.floor(p * COPY.length));
}

export function CinematicHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [useVideo, setUseVideo] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced || !useVideo) return;

    const syncProgress = () => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      setProgress(video.currentTime / duration);
    };
    const onEnded = () => setProgress(1);

    video.addEventListener("timeupdate", syncProgress);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("timeupdate", syncProgress);
      video.removeEventListener("ended", onEnded);
    };
  }, [reduced, useVideo, videoReady]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced || !useVideo || !videoReady) return;
    void video.play().catch(() => setUseVideo(false));
  }, [reduced, useVideo, videoReady]);

  const copyIndex = copyIndexForProgress(progress);
  const poster = media.heroImage;

  return (
    <section className="relative h-screen bg-primary">
      <div className="relative h-full overflow-hidden">
        {useVideo && !reduced ? (
          <video
            ref={videoRef}
            src={HERO_SCROLL_VIDEO_SRC}
            poster={poster}
            muted
            playsInline
            autoPlay
            loop
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
            onLoadedMetadata={() => setVideoReady(true)}
            onError={() => setUseVideo(false)}
          />
        ) : (
          <LazyImage
            src={poster}
            alt="Twinklingz premium fashion jewellery"
            optimizeWidth={1600}
            width={1600}
            height={900}
            priority
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-hero-shade" />

        <div className="absolute inset-0 flex items-center justify-center px-5 text-center text-primary-foreground">
          <motion.div
            key={copyIndex}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >
            <p
              className={`whitespace-pre-line font-display ${
                copyIndex === 0 || copyIndex === 4
                  ? "text-5xl sm:text-7xl lg:text-8xl"
                  : "text-4xl sm:text-6xl"
              }`}
            >
              {COPY[copyIndex]}
            </p>
            {copyIndex === 4 && (
              <>
                <p className="mt-3 font-script text-3xl text-champagne">by Priya Kaur</p>
                <Button
                  asChild
                  size="lg"
                  className="mt-8 bg-primary-foreground text-primary hover:bg-champagne"
                >
                  <Link to="/shop">
                    EXPLORE THE COLLECTION <ArrowRight />
                  </Link>
                </Button>
              </>
            )}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
