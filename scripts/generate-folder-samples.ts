/**
 * Gera PNGs de exemplo em scripts/output/ (gitignored).
 * Uso: pnpm exec tsx scripts/generate-folder-samples.ts
 */
import "dotenv/config";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { buildFolderPropertyDefaults } from "@/lib/folder/build-folder-defaults";
import { generatePropertyFolderVerticalPng } from "@/lib/folder/generate-vertical-image";
import type { PropertyFolderVerticalPayload } from "@/lib/folder/types";

const TARGET_SLUGS = ["viver-club-mais-que-morar-e-pertencer"];

async function resolveBeachClassEssenceSlug(): Promise<string | null> {
  const row = await prisma.property.findFirst({
    where: {
      published: true,
      title: { contains: "Beach Class", mode: "insensitive" },
    },
    select: { slug: true },
    orderBy: { updatedAt: "desc" },
  });
  return row?.slug ?? null;
}

function defaultsToPayload(
  d: ReturnType<typeof buildFolderPropertyDefaults>
): PropertyFolderVerticalPayload {
  return {
    developmentName: d.developmentName,
    subtitle: d.subtitle,
    neighborhood: d.neighborhood,
    locationText: d.locationText,
    bedrooms: d.bedrooms,
    nearbyPoints: [],
    highlights: [
      { iconId: "leisure", text: "Área de lazer completa" },
      { iconId: "parking", text: "Vaga de garagem" },
      { iconId: "security", text: "Segurança e conforto" },
    ],
    seal: d.seal,
    footerPhrase: d.footerPhrase,
    showWhatsApp: d.showWhatsApp,
    photoUrls: d.photoUrls,
  };
}

async function main() {
  const outDir = path.join(process.cwd(), "scripts", "output");
  await mkdir(outDir, { recursive: true });

  const extra = await resolveBeachClassEssenceSlug();
  const slugs = extra ? [...TARGET_SLUGS, extra] : TARGET_SLUGS;

  for (const slug of slugs) {
    const property = await prisma.property.findFirst({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        neighborhood: true,
        bedrooms: true,
        isLaunch: true,
        isOpportunity: true,
        isFeatured: true,
        featuredImage: true,
        images: {
          select: {
            url: true,
            environment: true,
            isPrimary: true,
            isHidden: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!property) {
      console.warn(`Imóvel não encontrado: ${slug}`);
      continue;
    }

    const defaults = buildFolderPropertyDefaults(property);
    const payload = defaultsToPayload(defaults);
    const buffer = await generatePropertyFolderVerticalPng(payload);
    const filePath = path.join(outDir, `${slug}-vertical.png`);
    await writeFile(filePath, Buffer.from(buffer));
    console.log("OK", filePath);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  void prisma.$disconnect();
  process.exit(1);
});
