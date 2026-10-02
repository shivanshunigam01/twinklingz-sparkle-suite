import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const catalogDir = path.join(root, "..", "public", "catalog");
const outFile = path.join(root, "..", "src", "lib", "catalog-data.generated.ts");

const categories = ["Necklaces", "Earrings", "Bracelets", "Rings", "Jewellery Sets"];
const namePrefixes = ["Noor", "Gul", "Meher", "Ruhi", "Zarah", "Inaaya", "Mira", "Aabha", "Sana", "Kiara", "Riya", "Anya"];

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const entries = fs.readdirSync(catalogDir, { withFileTypes: true }).filter((d) => d.isDirectory());
const skus = entries.map((d) => d.name).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const catalogEntries = skus.map((sku, index) => {
  const dir = path.join(catalogDir, sku);
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.png$/i.test(f))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  const images = files.map((f) => `/catalog/${encodeURIComponent(sku)}/${f}`);
  const category = categories[index % categories.length];
  const prefix = namePrefixes[index % namePrefixes.length];
  const style = sku.replace(/-/g, " ");
  const name = `${prefix} · Style ${style}`;
  const h = hash(sku);
  const price = 899 + (h % 12) * 200;
  const mrp = price + 400 + (h % 5) * 100;
  const rating = 4.5 + (h % 5) * 0.1;
  const reviews = 12 + (h % 90);
  let badge;
  if (index < 8) badge = "NEW";
  else if (index % 7 === 0) badge = "BESTSELLER";

  return {
    sku,
    slug: slugify(`style-${sku}`),
    name,
    category,
    price,
    mrp,
    badge,
    rating: Math.round(rating * 10) / 10,
    reviews,
    images,
  };
});

const lines = [
  "/** Auto-generated from public/catalog — run: node scripts/generate-catalog.mjs */",
  "export type CatalogEntry = {",
  "  sku: string;",
  "  slug: string;",
  "  name: string;",
  "  category: string;",
  "  price: number;",
  "  mrp: number;",
  "  badge?: \"NEW\" | \"BESTSELLER\";",
  "  rating: number;",
  "  reviews: number;",
  "  images: readonly string[];",
  "};",
  "",
  `export const catalogEntries: readonly CatalogEntry[] = ${JSON.stringify(catalogEntries, null, 2)} as const;`,
  "",
];

fs.writeFileSync(outFile, lines.join("\n"));
console.log(`Wrote ${catalogEntries.length} products to ${outFile}`);
