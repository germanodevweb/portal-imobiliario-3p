import { FOLDER_LAYOUT_METRICS } from "@/lib/folder/folder-frame-metrics";
import type { FolderVariant } from "@/lib/folder/types";

export type FolderVideoCropMode = "fill" | "fit";

/** Raio do desfoque no slot (modo inteiro); reduzido para ffmpeg.wasm. */
const SLOT_BOXBLUR = "16:1";

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
  slotW: number,
  slotH: number,
  canvasH: number,
  y: number
): string {
  return [
    `[0:v]split[a][b]`,
    `[a]scale=${slotW}:${slotH}:force_original_aspect_ratio=increase,crop=${slotW}:${slotH},boxblur=${SLOT_BOXBLUR},setsar=1[bg]`,
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
  return buildWholeVideoChain(slotW, slotH, canvasH, y);
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
