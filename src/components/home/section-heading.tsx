export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-10 text-center">
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-accent">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-4xl sm:text-5xl">{title}</h2>
      {subtitle ? <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
