/**
 * Valida o pipeline de vídeo do folder (mesmos args do navegador via ffmpeg CLI).
 * Uso: pnpm exec tsx scripts/generate-folder-video-sample.ts
 * Requer ffmpeg e ffprobe no PATH.
 */
import "dotenv/config";
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { prisma } from "@/lib/prisma";
import { hasPropertyDevelopmentNameColumn } from "@/lib/admin/schema-migration";
import { getSiteWhatsAppPhoneDisplay } from "@/lib/constants/contato";
import { buildFolderPropertyDefaults } from "@/lib/folder/build-folder-defaults";
import { FOLDER_LAYOUT_METRICS } from "@/lib/folder/folder-frame-metrics";
import {
  buildFolderVideoFfmpegArgs,
  type FolderVideoCropMode,
} from "@/lib/folder/folder-video-filter-graph";
import { generatePropertyFolderVideoFrame } from "@/lib/folder/generate-folder-frame";
import { mergeFolderPayloadWithCadastro } from "@/lib/folder/merge-folder-payload";
import type { FolderVariant } from "@/lib/folder/types";

const execFileAsync = promisify(execFile);

const INPUT_DURATION_SEC = 12;
const DURATION_TOLERANCE_SEC = 0.2;

type FfprobeStream = {
  codec_type?: string;
  width?: number;
  height?: number;
  sample_aspect_ratio?: string;
  display_aspect_ratio?: string;
};

type FfprobeResult = {
  format?: { duration?: string };
  streams?: FfprobeStream[];
};

async function runFfmpeg(args: string[]): Promise<void> {
  await execFileAsync("ffmpeg", args, { windowsHide: true });
}

async function ffprobeJson(filePath: string): Promise<FfprobeResult> {
  const { stdout } = await execFileAsync(
    "ffprobe",
    [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      filePath,
    ],
    { windowsHide: true }
  );
  return JSON.parse(stdout) as FfprobeResult;
}

async function ensureTestInputVideo(outPath: string): Promise<number> {
  await runFfmpeg([
    "-y",
    "-f",
    "lavfi",
    "-i",
    `testsrc=duration=${INPUT_DURATION_SEC}:size=1280x720:rate=30`,
    "-f",
    "lavfi",
    "-i",
    `sine=frequency=440:duration=${INPUT_DURATION_SEC}`,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-shortest",
    outPath,
  ]);

  const probe = await ffprobeJson(outPath);
  const duration = Number(probe.format?.duration ?? 0);
  if (duration < 10) {
    throw new Error(
      `Vídeo de teste deveria ter ≥10 s; obtido ${duration.toFixed(3)} s.`
    );
  }
  return duration;
}

function parseSar(stream: FfprobeStream): string {
  const sar = stream.sample_aspect_ratio?.trim();
  if (!sar || sar === "0:1" || sar === "N/A") {
    return "1:1";
  }
  return sar;
}

async function assertOutputValid(options: {
  label: string;
  outputPath: string;
  expectedDurationSec: number;
  expectedWidth: number;
  expectedHeight: number;
}): Promise<number> {
  const probe = await ffprobeJson(options.outputPath);
  const duration = Number(probe.format?.duration ?? 0);
  if (
    Math.abs(duration - options.expectedDurationSec) > DURATION_TOLERANCE_SEC
  ) {
    throw new Error(
      `[${options.label}] duração ${duration.toFixed(3)} s ≠ entrada ${options.expectedDurationSec.toFixed(3)} s (±${DURATION_TOLERANCE_SEC}).`
    );
  }

  const video = probe.streams?.find((s) => s.codec_type === "video");
  if (!video?.width || !video.height) {
    throw new Error(`[${options.label}] stream de vídeo ausente.`);
  }
  if (video.width !== options.expectedWidth || video.height !== options.expectedHeight) {
    throw new Error(
      `[${options.label}] resolução ${video.width}×${video.height} ≠ ${options.expectedWidth}×${options.expectedHeight}.`
    );
  }

  const sar = parseSar(video);
  if (sar !== "1:1") {
    throw new Error(`[${options.label}] SAR ${sar} ≠ 1:1.`);
  }

  const audio = probe.streams?.some((s) => s.codec_type === "audio");
  if (!audio) {
    throw new Error(`[${options.label}] faixa de áudio ausente.`);
  }

  return duration;
}

async function encodeCase(options: {
  inputPath: string;
  framePath: string;
  outputPath: string;
  variant: FolderVariant;
  cropMode: FolderVideoCropMode;
}): Promise<void> {
  const args = buildFolderVideoFfmpegArgs({
    variant: options.variant,
    cropMode: options.cropMode,
    inputVideoName: options.inputPath,
    framePngName: options.framePath,
    outputName: options.outputPath,
  });
  await runFfmpeg(["-y", ...args]);
}

async function extractMiddleFrame(
  videoPath: string,
  durationSec: number,
  pngPath: string
): Promise<void> {
  const t = Math.max(0, durationSec / 2);
  await runFfmpeg([
    "-y",
    "-ss",
    String(t),
    "-i",
    videoPath,
    "-frames:v",
    "1",
    pngPath,
  ]);
}

async function main() {
  const phone = getSiteWhatsAppPhoneDisplay();
  if (!phone) {
    throw new Error("NEXT_PUBLIC_WHATSAPP_PHONE não definido.");
  }

  const slug = "viver-club-mais-que-morar-e-pertencer";
  const includeDevelopmentName = await hasPropertyDevelopmentNameColumn();
  const property = await prisma.property.findFirst({
    where: { slug },
    select: {
      slug: true,
      title: true,
      neighborhood: true,
      city: true,
      featuredImage: true,
      ...(includeDevelopmentName ? { developmentName: true } : {}),
      images: {
        where: { isHidden: false },
        select: { url: true, isPrimary: true, isHidden: true, sortOrder: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!property?.featuredImage) {
    throw new Error(`Imóvel ${slug} não encontrado ou sem foto.`);
  }

  const defaults = buildFolderPropertyDefaults({
    id: "sample",
    slug: property.slug,
    title: property.title,
    developmentName:
      includeDevelopmentName && "developmentName" in property
        ? (property.developmentName as string | null)
        : null,
    neighborhood: property.neighborhood,
    city: property.city,
    bedrooms: 3,
    garage: 2,
    isLaunch: false,
    isOpportunity: false,
    isFeatured: false,
    featuredImage: property.featuredImage,
    images: property.images,
  });

  const merged = mergeFolderPayloadWithCadastro(
    {
      title: property.title,
      developmentName:
        includeDevelopmentName && "developmentName" in property
          ? (property.developmentName as string | null)
          : null,
      neighborhood: property.neighborhood,
      city: property.city,
      featuredImage: property.featuredImage,
      images: property.images,
    },
    {
      developmentName: defaults.developmentNameDisplay,
      sealBannerText: defaults.sealBannerText,
      showFullPhoto: defaults.showFullPhoto,
      highlightBedrooms: defaults.highlightBedrooms,
      showLeisure: defaults.showLeisure,
      highlightGarage: defaults.highlightGarage,
      phone: defaults.phone || phone,
    }
  );
  if ("error" in merged) {
    throw new Error(merged.error);
  }

  const outDir = path.join(process.cwd(), "scripts", "output");
  await mkdir(outDir, { recursive: true });

  const inputPath = path.join(outDir, "folder-video-test-input-12s.mp4");
  const inputDuration = await ensureTestInputVideo(inputPath);
  console.log(`Entrada: ${inputDuration.toFixed(3)} s (${inputPath})`);

  const cases: {
    variant: FolderVariant;
    cropMode: FolderVideoCropMode;
  }[] = [
    { variant: "vertical", cropMode: "fill" },
    { variant: "vertical", cropMode: "fit" },
    { variant: "feed", cropMode: "fill" },
    { variant: "feed", cropMode: "fit" },
  ];

  let previewWritten = false;

  for (const { variant, cropMode } of cases) {
    const label = `${variant}-${cropMode}`;
    const frameBuf = await generatePropertyFolderVideoFrame(merged, variant);
    const framePath = path.join(outDir, `folder-video-test-frame-${variant}.png`);
    await writeFile(framePath, Buffer.from(frameBuf));

    const outputPath = path.join(
      outDir,
      `folder-video-test-${variant}-${cropMode}.mp4`
    );

    await encodeCase({
      inputPath,
      framePath,
      outputPath,
      variant,
      cropMode,
    });

    const m = FOLDER_LAYOUT_METRICS[variant];
    const outDuration = await assertOutputValid({
      label,
      outputPath,
      expectedDurationSec: inputDuration,
      expectedWidth: m.width,
      expectedHeight: m.height,
    });

    console.log(
      `OK ${label}: ${outDuration.toFixed(3)} s, ${m.width}×${m.height}, SAR 1:1, áudio`
    );

    if (variant === "vertical" && cropMode === "fill" && !previewWritten) {
      const previewPath = path.join(
        outDir,
        `${property.slug}-video-vertical-frame-mid.png`
      );
      await extractMiddleFrame(outputPath, outDuration, previewPath);
      console.log("OK quadro (meio):", previewPath);
      previewWritten = true;
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  void prisma.$disconnect();
  process.exit(1);
});
