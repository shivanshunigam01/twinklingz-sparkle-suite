import { Link } from "@tanstack/react-router";
export function BrandLogo({ light = false }: { light?: boolean }) {
  return <Link to="/" className={light ? "brand-logo text-primary-foreground" : "brand-logo text-primary"} aria-label="Twinklingz home"><span>TWINKLINGZ</span><small>by Priya Kaur</small></Link>;
}
