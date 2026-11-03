import { useEffect, useState } from "react";
import { Copy, Facebook, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  copyProductLink,
  facebookShareUrl,
  getProductShareMessage,
  nativeShareProduct,
  type ProductSharePayload,
  twitterShareUrl,
  whatsAppShareUrl,
} from "@/lib/share-product";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ProductShareButtonProps = {
  product: ProductSharePayload;
  className?: string;
  variant?: "chip" | "icon";
};

export function ProductShareButton({ product, className, variant = "chip" }: ProductShareButtonProps) {
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    setHasNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const payload: ProductSharePayload = {
    name: product.name,
    slug: product.slug,
    price: product.price,
  };

  async function handleNativeShare() {
    const ok = await nativeShareProduct(payload);
    if (ok) toast.success("Thanks for sharing!");
  }

  async function handleCopy() {
    try {
      await copyProductLink(payload.slug, getProductShareMessage(payload));
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  }

  function openExternal(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const chipClass =
    variant === "chip"
      ? "h-11 min-w-11 rounded-lg border border-border bg-background px-3 shadow-sm"
      : "size-11 shrink-0";

  const icon = <Share2 className="size-[1.15rem]" aria-hidden />;

  if (hasNativeShare) {
    return (
      <Button
        type="button"
        variant="outline"
        size={variant === "chip" ? "default" : "icon"}
        className={cn(chipClass, className)}
        aria-label="Share this product"
        onClick={() => void handleNativeShare()}
      >
        {icon}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={variant === "chip" ? "default" : "icon"}
          className={cn(chipClass, className)}
          aria-label="Share this product"
        >
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => void handleCopy()}>
          <Copy className="mr-2 size-4" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openExternal(whatsAppShareUrl(payload))}>
          <MessageCircle className="mr-2 size-4" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openExternal(facebookShareUrl(payload.slug))}>
          <Facebook className="mr-2 size-4" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openExternal(twitterShareUrl(payload))}>
          <span className="mr-2 inline-flex size-4 items-center justify-center text-xs font-bold">𝕏</span>
          Post on X
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
