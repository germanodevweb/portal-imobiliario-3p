/**
 * Gera MP4 vertical (vídeo horizontal + moldura) e extrai quadro ~5 s em scripts/output/.
 * Usa ffmpeg no PATH (mesmo filter_complex do navegador).
 * Uso: pnpm exec tsx scripts/generate-folder-video-sample.ts
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
import { buildFolderVideoFilterComplex } from "@/lib/folder/folder-video-filter-graph";
import { generatePropertyFolderVideoFrame } from "@/lib/folder/generate-folder-frame";
import { mergeFolderPayloadWithCadastro } from "@/lib/folder/merge-folder-payload";

const execFileAsync = promisify(execFile);

const SAMPLE_MP4_URL =
  "https://download.samplelib.com/mp4/sample-5s.mp4";

async function downloadSample(outPath: string): Promise<void> {
  const res = await fetch(SAMPLE_MP4_URL);
  if (!res.ok) {
    throw new Error(`Falha ao baixar vídeo de teste: ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buf);
}

async function runFfmpeg(args: string[]): Promise<void> {
  await execFileAsync("ffmpeg", args, { windowsHide: true });
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

  const inputPath = path.join(outDir, "folder-video-sample-input.mp4");
  await downloadSample(inputPath);

  const frameBuf = await generatePropertyFolderVideoFrame(merged, "vertical");
  const framePath = path.join(outDir, `${property.slug}-frame-vertical.png`);
  await writeFile(framePath, Buffer.from(frameBuf));

  const filter = buildFolderVideoFilterComplex({
    variant: "vertical",
    cropMode: "fill",
  });

  const mp4Path = path.join(outDir, `${property.slug}-video-vertical-sample.mp4`);
  const previewPath = path.join(
    outDir,
    `${property.slug}-video-vertical-frame-5s.png`
  );

  await runFfmpeg([
    "-y",
    "-i",
    inputPath,
    "-i",
    framePath,
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
    "-shortest",
    mp4Path,
  ]);

  await runFfmpeg([
    "-y",
    "-ss",
    "5",
    "-i",
    mp4Path,
    "-frames:v",
    "1",
    previewPath,
  ]);

  console.log("OK MP4:", mp4Path);
  console.log("OK quadro ~5 s:", previewPath);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  void prisma.$disconnect();
  process.exit(1);
});
