/**
 * Gera PNG/JPG de exemplo em scripts/output/ (gitignored).
 * Uso: pnpm exec tsx scripts/generate-folder-samples.ts
 */
import "dotenv/config";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { suggestFolderAiPrefill } from "@/lib/ai/folder";
import { buildFolderPropertyDefaults } from "@/lib/folder/build-folder-defaults";
import { generatePropertyFolderVerticalImage } from "@/lib/folder/generate-vertical-image";
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
        city: true,
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

    const base = buildFolderPropertyDefaults(property);
    const ai = await suggestFolderAiPrefill({
      description: property.description ?? "",
      neighborhood: base.neighborhood,
      city: property.city,
    });

    const payload: PropertyFolderVerticalPayload = {
      developmentName: base.developmentName,
      subtitle: base.subtitle,
      neighborhood: base.neighborhood,
      locationText:
        ai.locationText ||
        (base.neighborhood
          ? `Localização privilegiada no ${base.neighborhood}, com infraestrutura completa na região.`
          : "Localização estratégica com fácil acesso a serviços e comércio."),
      bedrooms: base.bedrooms,
      nearbyPoints: ai.nearbyPoints,
      highlights: [
        { iconId: "leisure", text: "Área de lazer completa" },
        { iconId: "parking", text: "Vaga de garagem" },
        { iconId: "security", text: "Segurança e conforto" },
      ],
      seal: base.seal,
      footerPhrase: base.footerPhrase,
      showWhatsApp: base.showWhatsApp,
      photoUrls: base.photoUrls,
    };

    const png = await generatePropertyFolderVerticalImage(payload, "png");
    const pngPath = path.join(outDir, `${slug}-vertical.png`);
    await writeFile(pngPath, Buffer.from(png));
    console.log("OK PNG", pngPath);

    try {
      const jpg = await generatePropertyFolderVerticalImage(payload, "jpeg");
      const jpgPath = path.join(outDir, `${slug}-vertical.jpg`);
      await writeFile(jpgPath, Buffer.from(jpg));
      console.log("OK JPG", jpgPath);
    } catch (e) {
      console.warn(
        "JPG omitido (instale sharp com pnpm install):",
        e instanceof Error ? e.message : e
      );
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  void prisma.$disconnect();
  process.exit(1);
});
