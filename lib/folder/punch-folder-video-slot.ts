import { createRequire } from "node:module";
import type { FolderPhotoSlotRect } from "@/lib/folder/folder-frame-metrics";

const nodeRequire = createRequire(import.meta.url);

type SharpInstance = {
  ensureAlpha: () => SharpInstance;
  composite: (
    inputs: { input: Buffer; left: number; top: number; blend: string }[]
  ) => SharpInstance;
  png: () => { toBuffer: () => Promise<Buffer> };
  raw: () => { toBuffer: (options: { resolveWithObject: true }) => Promise<{ data: Buffer; info: { width: number; height: number; channels: number } }> };
};

type SharpFromRaw = (
  input: Buffer,
  options: { raw: { width: number; height: number; channels: number } }
) => SharpInstance;

type SharpModule = (input: Buffer) => SharpInstance;
type SharpNamespace = SharpModule & { (): SharpInstance };

function loadSharpModule(): SharpModule | null {
  try {
    return nodeRequire("sharp") as SharpModule;
  } catch {
    return null;
  }
}

export async function punchTransparentPhotoSlot(
  pngBuffer: Buffer,
  slot: FolderPhotoSlotRect
): Promise<Buffer> {
  const sharpMod = loadSharpModule();
  if (!sharpMod) {
    throw new Error(
      "Dependência sharp não encontrada. Rode pnpm install no projeto."
    );
  }

  const { data, info } = await sharpMod(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const x0 = slot.left;
  const x1 = slot.left + slot.width;
  const y0 = slot.top;
  const y1 = slot.top + slot.height;

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const alphaIndex = (y * info.width + x) * channels + (channels - 1);
      data[alphaIndex] = 0;
    }
  }

  const fromRaw = sharpMod as unknown as SharpFromRaw;
  return fromRaw(data, {
    raw: { width: info.width, height: info.height, channels },
  })
    .png()
    .toBuffer();
}

export type FolderFrameAlphaCheck = {
  slotCenterAlpha: number;
  greenBandAlpha: number;
};

export async function readPngPixelAlpha(
  pngBuffer: Buffer,
  x: number,
  y: number
): Promise<number> {
  const sharpMod = loadSharpModule();
  if (!sharpMod) {
    throw new Error("sharp não disponível.");
  }
  const { data, info } = await sharpMod(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels < 4) {
    throw new Error("PNG sem canal alfa.");
  }
  const px = y * info.width + x;
  const alphaIndex = px * info.channels + (info.channels - 1);
  return data[alphaIndex] ?? 0;
}

export async function validateFolderVideoFrameAlpha(
  pngBuffer: Buffer,
  slot: FolderPhotoSlotRect,
  greenBandSampleY: number
): Promise<FolderFrameAlphaCheck> {
  const cx = Math.floor(slot.left + slot.width / 2);
  const cy = Math.floor(slot.top + slot.height / 2);
  const slotCenterAlpha = await readPngPixelAlpha(pngBuffer, cx, cy);
  const greenBandAlpha = await readPngPixelAlpha(pngBuffer, cx, greenBandSampleY);

  if (slotCenterAlpha !== 0) {
    throw new Error(
      `Slot do vídeo deveria ter alfa 0 no centro; obtido ${slotCenterAlpha}.`
    );
  }
  if (greenBandAlpha !== 255) {
    throw new Error(
      `Faixa verde deveria ter alfa 255; obtido ${greenBandAlpha} em y=${greenBandSampleY}.`
    );
  }

  return { slotCenterAlpha, greenBandAlpha };
}
