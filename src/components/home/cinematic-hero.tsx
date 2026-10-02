import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { HERO_SCROLL_VIDEO_SRC } from "@/lib/cms-settings";
import { heroScrollFrames, media } from "@/lib/catalog";

const SCROLL_VH = 320;
const COPY = [
  "TWINKLINGZ",
  "Jewellery made for your moments.",
  "Elegant.\nTimeless.\nUniquely You.",
  "Because every sparkle tells a story.",
  "TWINKLINGZ",
] as const;

export function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [useVideo, setUseVideo] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const p = -rect.top / Math.max(1, el.offsetHeight - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, p)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced || !useVideo || !videoReady) return;
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    video.currentTime = progress * duration;
  }, [progress, reduced, useVideo, videoReady]);

  const frameIndex = Math.min(
    heroScrollFrames.length - 1,
    Math.floor(progress * heroScrollFrames.length),
  );
  const copyIndex = Math.min(4, Math.floor(progress * 5));
  const poster = media.heroImage;
  const frameSrc = heroScrollFrames[frameIndex] ?? poster;

  return (
    <section ref={sectionRef} className="relative bg-primary" style={{ height: `${SCROLL_VH}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {useVideo && !reduced ? (
          <video
            ref={videoRef}
            src={HERO_SCROLL_VIDEO_SRC}
            poster={poster}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
            onLoadedMetadata={() => setVideoReady(true)}
            onError={() => setUseVideo(false)}
          />
        ) : (
          <img
            src={frameSrc}
            alt="Twinklingz premium fashion jewellery"
            width={1536}
            height={1024}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
            style={{ transform: `scale(${1 + progress * 0.06})` }}
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

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-[10px] tracking-[0.3em] text-primary-foreground">
          <span>SCROLL TO DISCOVER</span>
          <div className="mx-auto mt-3 h-12 w-px bg-primary-foreground/50">
            <div className="w-px bg-champagne" style={{ height: `${progress * 100}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
