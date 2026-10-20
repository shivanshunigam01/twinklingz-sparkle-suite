import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const catalogDir = path.join(root, "..", "public", "catalog");
const outFile = path.join(root, "..", "src", "lib", "catalog-data.generated.ts");
const categoriesFile = path.join(root, "..", "src", "lib", "product-categories.json");

const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function loadSkuCategories() {
  if (!fs.existsSync(categoriesFile)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(categoriesFile, "utf8"));
    return data.skuCategories || {};
  } catch {
    return {};
  }
}

function priceFromFolder(folder) {
  const f = String(folder || "");
  const standard = f.match(/^(\d+)-(\d+)$/);
  if (standard) return Number(standard[2]);
  const rs = f.match(/(\d{3,5})\s*rs?\b/i);
  if (rs) return Number(rs[1]);
  return 999;
}

const skuCategories = loadSkuCategories();

if (!fs.existsSync(catalogDir)) {
  fs.mkdirSync(catalogDir, { recursive: true });
}

const entries = fs
  .readdirSync(catalogDir, { withFileTypes: true })
  .filter((d) => d.isDirectory());

const skus = entries.map((d) => d.name).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const catalogEntries = skus.map((sku, index) => {
  const dir = path.join(catalogDir, sku);
  const files = fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const images = files.map((f) => `/catalog/${encodeURIComponent(sku)}/${f}`);
  const meta = skuCategories[sku] || {};
  const category = (typeof meta === "string" ? meta : meta.category) || "Necklaces";
  const folder = (typeof meta === "object" && meta.folder) || sku.replace(/^[^-]+-/, "");
  const price = priceFromFolder(folder);
  const shortCat = category.replace(/s$/, "");
  const name = `${shortCat} · Style ${folder}`;
  const rating = 4.7 + (index % 3) * 0.1;
  const reviews = 8 + (index % 40);
  let badge;
  if (index < 6) badge = "NEW";

  return {
    sku,
    slug: slugify(`${category}-${folder}`),
    name,
    category,
    price,
    mrp: price,
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
