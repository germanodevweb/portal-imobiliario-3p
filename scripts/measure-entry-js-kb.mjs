/**
 * Estima "First Load JS" (shared + entry) a partir do client-reference-manifest do build.
 * Alinhado ao que o Next reporta: chunks de layout + página (deduplicados).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const NEXT_DIR = path.join(ROOT, ".next");
const STATIC = path.join(NEXT_DIR, "static", "chunks");

const ROUTES = [
  { label: "/", manifest: "server/app/page_client-reference-manifest.js", key: "/page" },
  {
    label: "/imoveis",
    manifest: "server/app/imoveis/page_client-reference-manifest.js",
    key: "/imoveis/page",
  },
  {
    label: "/imoveis/[slug]",
    manifest: "server/app/imoveis/[slug]/page_client-reference-manifest.js",
    key: "/imoveis/[slug]/page",
  },
];

function chunkBytes(chunkPath) {
  const normalized = chunkPath.replace(/^\/_next\/static\/chunks\//, "").replace(/^static\/chunks\//, "");
  const file = path.join(STATIC, normalized);
  if (!fs.existsSync(file)) return 0;
  return fs.statSync(file).size;
}

function measureManifest(relativeManifest, pageKey) {
  const filePath = path.join(NEXT_DIR, relativeManifest);
  if (!fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, "utf8");
  const chunkSet = new Set();
  const entryStart = text.indexOf('"entryJSFiles":');
  const entryEnd = text.indexOf('"entryCSSFiles":', entryStart);
  const entryBlock = entryStart >= 0 && entryEnd > entryStart ? text.slice(entryStart, entryEnd) : text;
  const matches = entryBlock.matchAll(/(?:\/_next\/)?(static\/chunks\/[a-f0-9]+\.js)/g);
  for (const m of matches) chunkSet.add(m[1]);

  let bytes = 0;
  for (const c of chunkSet) bytes += chunkBytes(c);
  return { chunks: chunkSet.size, kb: Math.round((bytes / 1024) * 10) / 10 };
}

for (const route of ROUTES) {
  const result = measureManifest(route.manifest, route.key);
  if (!result) {
    console.log(`${route.label}\t(n/a)`);
    continue;
  }
  console.log(`${route.label}\t${result.kb} kB\t(${result.chunks} chunks entry+layout)`);
}
