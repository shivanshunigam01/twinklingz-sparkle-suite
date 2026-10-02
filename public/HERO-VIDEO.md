# Scroll-controlled hero video

Upload a compressed MP4 as **`public/hero-scroll.mp4`** (recommended: 1080p, H.264, under ~15MB).

The homepage pins the video for ~320vh of scroll and scrubs playback to scroll position. If the file is missing, the site uses catalogue still frames from `/public/catalog/` instead.

Optional: set `VITE_HERO_SCROLL_VIDEO=/your-path.mp4` in `.env`.
