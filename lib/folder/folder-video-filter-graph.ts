import { FOLDER_LAYOUT_METRICS } from "@/lib/folder/folder-frame-metrics";
import type { FolderVariant } from "@/lib/folder/types";

export type FolderVideoCropMode = "fill" | "fit";

/** Desfoque em resolução reduzida (modo inteiro) — ~5× mais rápido que blur em 1080p. */
const WHOLE_VIDEO_BLUR_BG: Record<
  FolderVariant,
  { smallW: number; smallH: number; slotW: number; slotH: number }
> = {
  vertical: { smallW: 216, smallH: 140, slotW: 1080, slotH: 700 },
  feed: { smallW: 216, smallH: 100, slotW: 1080, slotH: 500 },
};

function buildFillVideoChain(
  slotW: number,
  slotH: number,
  canvasH: number,
  y: number
): string {
  const slotChain = `scale=${slotW}:${slotH}:force_original_aspect_ratio=increase,crop=${slotW}:${slotH},setsar=1`;
  return [
    `[0:v]${slotChain},pad=${slotW}:${canvasH}:0:${y}:color=black@0.0[vid]`,
    `[1:v]scale=${slotW}:${canvasH},format=rgba[ov]`,
    `[vid][ov]overlay=0:0:shortest=1,setsar=1[vout]`,
  ].join(";");
}

function buildWholeVideoChain(
  variant: FolderVariant,
  canvasH: number,
  y: number
): string {
  const { smallW, smallH, slotW, slotH } = WHOLE_VIDEO_BLUR_BG[variant];
  const bgChain = `scale=${smallW}:${smallH}:force_original_aspect_ratio=increase,crop=${smallW}:${smallH},boxblur=4:1,scale=${slotW}:${slotH},setsar=1`;

  return [
    `[0:v]split[a][b]`,
    `[a]${bgChain}[bg]`,
    `[b]scale=${slotW}:${slotH}:force_original_aspect_ratio=decrease,setsar=1[fg]`,
    `[bg][fg]overlay=(W-w)/2:(H-h)/2,pad=${slotW}:${canvasH}:0:${y}[vid]`,
    `[1:v]scale=${slotW}:${canvasH},format=rgba[ov]`,
    `[vid][ov]overlay=0:0:shortest=1,setsar=1[vout]`,
  ].join(";");
}

export function buildFolderVideoFilterComplex(options: {
  variant: FolderVariant;
  cropMode: FolderVideoCropMode;
}): string {
  const m = FOLDER_LAYOUT_METRICS[options.variant];
  const slotW = m.width;
  const slotH = m.photoHeight;
  const canvasH = m.height;
  const y = m.photoTop;

  if (options.cropMode === "fill") {
    return buildFillVideoChain(slotW, slotH, canvasH, y);
  }
  return buildWholeVideoChain(options.variant, canvasH, y);
}

export function buildFolderVideoFfmpegArgs(options: {
  variant: FolderVariant;
  cropMode: FolderVideoCropMode;
  inputVideoName: string;
  framePngName: string;
  outputName: string;
}): string[] {
  const filter = buildFolderVideoFilterComplex({
    variant: options.variant,
    cropMode: options.cropMode,
  });

  return [
    "-i",
    options.inputVideoName,
    "-loop",
    "1",
    "-i",
    options.framePngName,
    "-filter_complex",
    filter,
    "-map",
    "[vout]",
    "-map",
    "0:a?",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    options.outputName,
  ];
}
