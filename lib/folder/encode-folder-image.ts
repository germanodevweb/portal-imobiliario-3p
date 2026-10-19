import { createRequire } from "node:module";

export type FolderImageFormat = "png" | "jpeg";

const nodeRequire = createRequire(import.meta.url);

type SharpFactory = (input: Buffer) => {
  jpeg: (options: { quality: number }) => { toBuffer: () => Promise<Buffer> };
};

function loadSharp(): SharpFactory | null {
  try {
    return nodeRequire("sharp") as SharpFactory;
  } catch {
    return null;
  }
}

export async function encodeFolderImageBuffer(
  pngBuffer: Buffer,
  format: FolderImageFormat
): Promise<Buffer> {
  if (format === "png") {
    return pngBuffer;
  }
  const sharp = loadSharp();
  if (!sharp) {
    throw new Error(
      "Dependência sharp não encontrada. Rode pnpm install no projeto."
    );
  }
  return sharp(pngBuffer).jpeg({ quality: 90 }).toBuffer();
}
