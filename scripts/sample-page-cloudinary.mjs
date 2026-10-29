const path = process.argv[2] ?? "/imoveis";
const base = "http://127.0.0.1:3500";
const html = await fetch(base + path).then((r) => r.text());
const srcsetCount = (html.match(/srcset=/gi) ?? []).length;
const imgSrc = [...html.matchAll(/<img[^>]+>/gi)].slice(0, 3);
for (const tag of imgSrc) {
  console.log(tag[0].slice(0, 300));
}
console.log("srcset attrs", srcsetCount);
const unique = new Set(
  [...html.matchAll(/https?:\/\/res\.cloudinary\.com[^"'\\s<>]+/gi)].map((m) => m[0])
);
const widths = new Set();
for (const u of unique) {
  for (const m of u.matchAll(/w_(\d+)/g)) {
    const n = Number(m[1]);
    if (n >= 32) widths.add(n);
  }
}
console.log("distinct urls", unique.size, "widths", [...widths].sort((a,b)=>a-b));
