/**
 * Gera moldura PNG (frame=video) e valida alfa do slot + faixa verde.
 * Uso: pnpm exec tsx scripts/validate-folder-video-frame.ts
 */
import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { hasPropertyDevelopmentNameColumn } from "@/lib/admin/schema-migration";
import { getSiteWhatsAppPhoneDisplay } from "@/lib/constants/contato";
import { buildFolderPropertyDefaults } from "@/lib/folder/build-folder-defaults";
import { generatePropertyFolderVideoFrame } from "@/lib/folder/generate-folder-frame";
import { mergeFolderPayloadWithCadastro } from "@/lib/folder/merge-folder-payload";

async function main() {
  const slug = "viver-club-mais-que-morar-e-pertencer";
  const includeDevelopmentName = await hasPropertyDevelopmentNameColumn();
  const property = await prisma.property.findFirst({
    where: { slug },
    select: {
      id: true,
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
    id: property.id,
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

  const phone = getSiteWhatsAppPhoneDisplay();
  if (!phone) {
    throw new Error("NEXT_PUBLIC_WHATSAPP_PHONE não definido.");
  }
  const payload = mergeFolderPayloadWithCadastro(
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
  if ("error" in payload) {
    throw new Error(payload.error);
  }

  const outDir = path.join(process.cwd(), "scripts", "output");
  await mkdir(outDir, { recursive: true });

  for (const variant of ["vertical", "feed"] as const) {
    const buf = await generatePropertyFolderVideoFrame(payload, variant);
    const file = path.join(outDir, `${property.slug}-frame-${variant}.png`);
    await writeFile(file, Buffer.from(buf));
    console.log(`OK ${variant}: ${file} (pixel check incluído no gerador)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
