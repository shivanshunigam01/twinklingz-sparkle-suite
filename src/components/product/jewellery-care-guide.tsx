import { cn } from "@/lib/utils";

const TIPS = [
  {
    id: "makeup",
    label: "Wear jewellery after make up",
    Icon: IconJewelleryStand,
  },
  {
    id: "water",
    label: "Avoid water / moisture / chemicals",
    Icon: IconNoWater,
  },
  {
    id: "perfume",
    label: "Avoid perfume / lotions",
    Icon: IconNoPerfume,
  },
  {
    id: "sleep",
    label: "Remove before exercise / sleep",
    Icon: IconRemoveBeforeSleep,
  },
] as const;

type JewelleryCareGuideProps = {
  className?: string;
  compact?: boolean;
};

/** Shared care tips grid — shown on PDP below product description. */
export function JewelleryCareGuide({ className, compact = false }: JewelleryCareGuideProps) {
  return (
    <section
      aria-labelledby="jewellery-care-guide-title"
      className={cn(
        "relative overflow-hidden rounded-lg border border-border/80 bg-gradient-to-b from-[#fff9f6] to-secondary/30 px-4 py-6 sm:px-6 sm:py-8",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -left-8 -top-6 size-24 rounded-full bg-champagne/25 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-8 -right-6 size-28 rounded-full bg-blush/40 blur-2xl"
        aria-hidden
      />

      <div className="relative text-center">
        <h2 id="jewellery-care-guide-title" className="font-display text-foreground">
          <span className={cn("block leading-none", compact ? "text-[1.65rem]" : "text-[1.85rem] sm:text-[2rem]")}>
            Jewellery
          </span>
          <span
            className={cn(
              "mt-1 block font-sans font-normal uppercase tracking-[0.32em] text-muted-foreground",
              compact ? "text-[10px]" : "text-[11px] sm:text-xs",
            )}
          >
            Care
          </span>
        </h2>
      </div>

      <div
        className={cn(
          "relative mx-auto mt-6 grid max-w-md grid-cols-2 gap-x-3 gap-y-7 sm:mt-8 sm:gap-x-6 sm:gap-y-9",
          compact ? "max-w-sm" : "max-w-md",
        )}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-border/90" />
          <span className="absolute bottom-0 top-0 left-1/2 w-px -translate-x-1/2 bg-border/90" />
          <span className="relative z-10 text-[10px] text-champagne">✦</span>
        </div>

        {TIPS.map(({ id, label, Icon }) => (
          <div key={id} className="relative z-[1] flex flex-col items-center px-1 text-center">
            <div className="flex size-[4.5rem] items-center justify-center rounded-full border border-champagne/90 bg-background/80 shadow-[0_0_0_1px_rgba(231,198,168,0.15)] sm:size-20">
              <Icon className="size-9 text-foreground sm:size-10" />
            </div>
            <p className="mt-3 max-w-[9.5rem] font-sans text-[9px] font-medium uppercase leading-snug tracking-[0.12em] text-foreground/90 sm:max-w-[10.5rem] sm:text-[10px]">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function IconJewelleryStand({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M10 34h28M14 34V28c0-4 3-7 7-7h6c4 0 7 3 7 7v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M24 21V14M20 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="24" cy="11" rx="5" ry="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="18" r="2" stroke="currentColor" strokeWidth="1.25" />
      <path d="M16 20v4M14 24h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="32" cy="18" r="2" stroke="currentColor" strokeWidth="1.25" />
      <path d="M32 20v4M30 24h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function IconNoWater({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M24 8c6 8 10 13 10 18a10 10 0 1 1-20 0c0-5 4-10 10-18Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 34l20-20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconNoPerfume({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <rect x="18" y="16" width="12" height="22" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M21 16v-4h6v4M24 12V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 24h8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M13 35l22-22" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconRemoveBeforeSleep({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M28 20c-1.5-2-4-2.5-6-1.5M20 28c1.5 2 4 2.5 6 1.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path d="M30 18l3-3M18 30l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="31" cy="17" r="1.25" fill="currentColor" />
    </svg>
  );
}
