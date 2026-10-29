/**
 * Conta URLs Cloudinary no HTML renderizado (pnpm build && pnpm start -p PORT).
 * Uso: node scripts/measure-cloudinary-html.mjs http://127.0.0.1:3500
 */
const base = (process.argv[2] ?? "http://127.0.0.1:3500").replace(/\/$/, "");

const PAGES = [
  { label: "home", path: "/" },
  { label: "imoveis", path: "/imoveis" },
  {
    label: "imovel",
    path: "/imoveis/viver-club-mais-que-morar-e-pertencer",
  },
  { label: "bairro", path: "/cidade/fortaleza/bairro/meireles" },
];

function extractCloudinaryUrls(html) {
  const urls = new Set();
  const re = /https?:\/\/res\.cloudinary\.com\/[^"'\\s<>]+/gi;
  for (const m of html.matchAll(re)) {
    urls.add(m[0].replace(/&amp;/g, "&"));
  }
  return [...urls];
}

/** Larguras de entrega (ignora w_0.25 do overlay relativo). */
function deliveryWidths(url) {
  const ws = new Set();
  for (const m of url.matchAll(/w_(\d+)/g)) {
    const n = Number(m[1]);
    if (n >= 32) ws.add(n);
  }
  return ws;
}

async function fetchPage(path) {
  const res = await fetch(`${base}${path}`, {
    headers: { Accept: "text/html" },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`${path} → HTTP ${res.status}`);
  }
  return res.text();
}

async function main() {
  const rows = [];
  for (const page of PAGES) {
    const html = await fetchPage(page.path);
    const urls = extractCloudinaryUrls(html);
    const allWidths = new Set();
    for (const u of urls) {
      for (const w of deliveryWidths(u)) allWidths.add(w);
    }
    const hasSrcset = /srcset="[^"]*cloudinary/i.test(html);
    rows.push({
      page: page.label,
      distinctUrls: urls.length,
      distinctDeliveryWidths: [...allWidths].sort((a, b) => a - b),
      srcsetCloudinary: hasSrcset,
    });
  }

  console.log(JSON.stringify({ base, rows }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
