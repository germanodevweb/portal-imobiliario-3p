/**
 * Casos de regressão do loader Cloudinary (next/image).
 * Uso: pnpm exec tsx scripts/test-cloudinary-next-image-loader.ts
 */
import { buildCloudinaryImageLoaderUrl } from "../lib/cloudinary/next-image-loader";

const BASE = "https://res.cloudinary.com/demo/image/upload";
const WATERMARK_CHAIN =
  "f_auto,q_auto,l_3p:logo,o_55,c_scale,fl_relative,w_0.25,g_center,fl_layer_apply";
const VERSION = "v1776273471";
const PUBLIC_ID = "3p/properties/xxx.png";

const cases: { label: string; src: string; width: number }[] = [
  {
    label: "com marca d'água",
    src: `${BASE}/${WATERMARK_CHAIN}/${VERSION}/${PUBLIC_ID}`,
    width: 640,
  },
  {
    label: 'pasta com "_" sem versão',
    src: `${BASE}/imoveis_ce/foto.jpg`,
    width: 640,
  },
  {
    label: 'arquivo com "_" sem pasta',
    src: `${BASE}/foto_casa.jpg`,
    width: 640,
  },
];

for (const { label, src, width } of cases) {
  const out = buildCloudinaryImageLoaderUrl(src, width);
  console.log(`\n--- ${label} ---`);
  console.log("in: ", src);
  console.log("out:", out);
}
