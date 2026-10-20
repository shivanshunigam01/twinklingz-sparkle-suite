import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LazyImage } from "@/components/ui/lazy-image";
import type { Product } from "@/lib/catalog";

function galleryUrls(product: Product): string[] {
  const merged = [...(product.images ?? []), product.image, product.altImage].filter(Boolean) as string[];
  return [...new Set(merged)];
}

type ProductImageSliderDialogProps = {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex?: number;
};

export function ProductImageSliderDialog({
  product,
  open,
  onOpenChange,
  initialIndex = 0,
}: ProductImageSliderDialogProps) {
  const images = useMemo(() => galleryUrls(product), [product]);
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(Math.min(initialIndex, Math.max(0, images.length - 1)));
  }, [open, initialIndex, images.length]);

  const current = images[index] ?? images[0];
  const multi = images.length > 1;

  function prev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }

  function next() {
    setIndex((i) => (i + 1) % images.length);
  }

  if (!current) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[92vh] w-[min(calc(100vw-1rem),40rem)] flex-col gap-0 overflow-hidden border-none bg-background p-0 sm:max-w-lg"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{product.name} — photos</DialogTitle>
        <div className="relative flex min-h-[50vh] items-center justify-center bg-muted/40 px-12 py-8">
          {multi && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-background/90"
              onClick={prev}
              aria-label="Previous image"
            >
              <ChevronLeft />
            </Button>
          )}
          <LazyImage
            key={current}
            src={current}
            alt={`${product.name} photo ${index + 1}`}
            optimizeWidth={1000}
            priority
            className="max-h-[min(65vh,520px)] w-full object-contain"
          />
          {multi && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-background/90"
              onClick={next}
              aria-label="Next image"
            >
              <ChevronRight />
            </Button>
          )}
          {multi && (
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground/80 px-2.5 py-0.5 text-[11px] text-background">
              {index + 1} / {images.length}
            </span>
          )}
        </div>
        {multi && (
          <div className="flex gap-2 overflow-x-auto border-t border-border p-3">
            {images.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                className={`size-14 shrink-0 overflow-hidden rounded-md border-2 transition ${
                  i === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <LazyImage src={src} alt="" optimizeWidth={112} className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <p className="border-t border-border px-4 py-3 text-center text-sm font-medium">{product.name}</p>
      </DialogContent>
    </Dialog>
  );
}

export function productGalleryCount(product: Product): number {
  return galleryUrls(product).length;
}
