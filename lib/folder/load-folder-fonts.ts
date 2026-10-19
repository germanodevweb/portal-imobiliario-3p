import { readFile } from "node:fs/promises";
import path from "node:path";

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
};

let cached: OgFont[] | null = null;

async function readFontArrayBuffer(relativePath: string): Promise<ArrayBuffer> {
  const filePath = path.join(process.cwd(), relativePath);
  const buf = await readFile(filePath);
  return Uint8Array.from(buf).buffer;
}

export async function loadFolderOgFonts(): Promise<OgFont[]> {
  if (cached) return cached;

  const [playfairBold, montserratRegular, montserratBold, kaushan] =
    await Promise.all([
      readFontArrayBuffer("assets/fonts/PlayfairDisplay-Bold.ttf"),
      readFontArrayBuffer("assets/fonts/Montserrat-Regular.ttf"),
      readFontArrayBuffer("assets/fonts/Montserrat-Bold.ttf"),
      readFontArrayBuffer("assets/fonts/KaushanScript-Regular.ttf"),
    ]);

  cached = [
    { name: "Playfair", data: playfairBold, weight: 700, style: "normal" },
    {
      name: "Montserrat",
      data: montserratRegular,
      weight: 400,
      style: "normal",
    },
    { name: "Montserrat", data: montserratBold, weight: 700, style: "normal" },
    { name: "Kaushan", data: kaushan, weight: 400, style: "normal" },
  ];
  return cached;
}

export async function loadFolderLogoDataUrl(): Promise<string> {
  const filePath = path.join(process.cwd(), "public", "logo.png");
  const buf = await readFile(filePath);
  const b64 = buf.toString("base64");
  return `data:image/png;base64,${b64}`;
}
