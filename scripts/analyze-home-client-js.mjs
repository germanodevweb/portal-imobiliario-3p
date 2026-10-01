/**
 * Estima chunks de Client Components referenciados pela home (/).
 * Executar após `pnpm build`: node scripts/analyze-home-client-js.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const MANIFEST = path.join(
  ROOT,
  ".next",
  "server",
  "app",
  "page_client-reference-manifest.js"
);
const STATIC = path.join(ROOT, ".next", "static", "chunks");

const HOME_CLIENT_MODULES = [
  "app/components/Header",
  "app/components/IncomeFilter",
  "app/components/PropertySmartSearch",
  "app/components/Pagination",
  "app/components/ServicesSection",
  "app/components/HomeServicosHashScroll",
  "app/components/GoogleReviewsSection",
  "app/components/WhatsAppButton",
  "app/components/GoogleAnalytics",
  "app/components/IncomeFilterBar",
  "app/components/PropertyCard",
  "app/components/PropertyGallery",
];

function chunkSizeKb(chunkPath) {
  const normalized = chunkPath.replace(/^\/_next\/static\/chunks\//, "");
  const file = path.join(STATIC, normalized);
  if (!fs.existsSync(file)) return 0;
  return Math.round((fs.statSync(file).size / 1024) * 10) / 10;
}

if (!fs.existsSync(MANIFEST)) {
  console.error("Rode pnpm build antes.");
  process.exit(1);
}

const text = fs.readFileSync(MANIFEST, "utf8");
const chunkPaths = [
  ...text.matchAll(/(?:\/_next\/)?(static\/chunks\/[a-f0-9]+\.js)/g),
].map((m) => m[1]);

const uniqueChunks = [...new Set(chunkPaths)];
let totalKb = 0;
for (const c of uniqueChunks) totalKb += chunkSizeKb(c);

console.log(`Home — total entry chunks (manifest): ${Math.round(totalKb * 10) / 10} kB em ${uniqueChunks.length} ficheiros\n`);

console.log("Módulos client da home (presença no manifest):");
for (const mod of HOME_CLIENT_MODULES) {
  const slug = mod.replace(/\//g, "[\\\\/]");
  const re = new RegExp(slug.replace(/\./g, "\\."));
  console.log(`  ${re.test(text) ? "✓" : "·"} ${mod}`);
}

console.log(
  "\nNota: peso por componente exige @next/bundle-analyzer; use esta lista para priorizar dynamic()/RSC."
);
