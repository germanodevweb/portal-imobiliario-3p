/**
 * Migra fotos legadas Code49 (/admin/imovel/*.jpg) para Cloudinary.
 *
 * Pré-requisito: os arquivos ainda acessíveis no servidor antigo.
 * Defina LEGACY_PROPERTY_IMAGE_ORIGIN no .env (ex.: http://IP_DO_HOSTING_ANTIGO)
 *
 * Uso:
 *   pnpm migrate:legacy-images          # executa
 *   pnpm migrate:legacy-images --dry-run
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import {
  getLegacyPropertyImageOrigin,
  isLegacyCode49PropertyImageUrl,
} from "../lib/property/legacy-image-url";
import { fetchPropertyImageBytes } from "../lib/property/fetch-property-image";
import { uploadImageBufferToCloudinary } from "../lib/upload/cloudinary-buffer";
import {
  normalizePropertyImagePrimaryBySortOrder,
  syncPropertyGalleryFieldsFromImages,
} from "../lib/property/sync-gallery-fields";

const dryRun = process.argv.includes("--dry-run");

async function collectLegacyUrls(prisma: PrismaClient): Promise<string[]> {
  const fromImages = await prisma.propertyImage.findMany({
    where: { url: { contains: "/admin/imovel/" } },
    select: { url: true },
    distinct: ["url"],
  });

  const fromFeatured = await prisma.property.findMany({
    where: { featuredImage: { contains: "/admin/imovel/" } },
    select: { featuredImage: true },
  });

  const set = new Set<string>();
  for (const row of fromImages) {
    if (isLegacyCode49PropertyImageUrl(row.url)) set.add(row.url.trim());
  }
  for (const row of fromFeatured) {
    const url = row.featuredImage?.trim();
    if (url && isLegacyCode49PropertyImageUrl(url)) set.add(url);
  }
  return [...set];
}

async function main() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL ou DATABASE_URL não encontrada.");
  }

  const legacyOrigin = getLegacyPropertyImageOrigin();
  if (!legacyOrigin) {
    console.error(`
ERRO: defina LEGACY_PROPERTY_IMAGE_ORIGIN no .env

Exemplo (servidor antigo onde os .jpg ainda existem):
  LEGACY_PROPERTY_IMAGE_ORIGIN=http://SEU_IP_OU_DOMINIO_ANTIGO

As URLs no banco apontam para www.3pinheirosconsultoria.com.br/admin/imovel/...
No portal novo esse caminho devolve a página de login — não a foto.
`);
    process.exit(1);
  }

  console.log(`Origem legada: ${legacyOrigin}`);
  if (dryRun) console.log("Modo dry-run — nenhuma alteração no banco/Cloudinary.\n");

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const legacyUrls = await collectLegacyUrls(prisma);
  console.log(`URLs legadas únicas: ${legacyUrls.length}\n`);

  const urlMap = new Map<string, string>();
  let uploaded = 0;
  let failed = 0;
  let skipped = 0;

  for (const oldUrl of legacyUrls) {
    if (urlMap.has(oldUrl)) continue;

    const fetched = await fetchPropertyImageBytes(oldUrl);
    if (!fetched.ok) {
      failed++;
      console.error(`[FALHA] ${oldUrl}\n        → ${fetched.reason}`);
      continue;
    }

    if (dryRun) {
      console.log(`[OK dry-run] ${oldUrl} (${fetched.buffer.byteLength} bytes)`);
      skipped++;
      continue;
    }

    const upload = await uploadImageBufferToCloudinary(
      Buffer.from(fetched.buffer),
      fetched.contentType
    );
    if (!upload.ok) {
      failed++;
      console.error(`[UPLOAD FALHOU] ${oldUrl} → ${upload.error}`);
      continue;
    }

    urlMap.set(oldUrl, upload.url);
    uploaded++;
    console.log(`[CLOUDINARY] ${oldUrl}\n           → ${upload.url}`);
  }

  if (!dryRun && urlMap.size > 0) {
    const affectedPropertyIds = new Set<string>();

    for (const [oldUrl, newUrl] of urlMap) {
      const updatedImages = await prisma.propertyImage.updateMany({
        where: { url: oldUrl },
        data: { url: newUrl },
      });

      if (updatedImages.count > 0) {
        const rows = await prisma.propertyImage.findMany({
          where: { url: newUrl },
          select: { propertyId: true },
        });
        for (const r of rows) affectedPropertyIds.add(r.propertyId);
      }

      const props = await prisma.property.findMany({
        where: {
          OR: [
            { featuredImage: oldUrl },
            { galleryImages: { has: oldUrl } },
          ],
        },
        select: { id: true, galleryImages: true, featuredImage: true },
      });

      for (const p of props) {
        affectedPropertyIds.add(p.id);
        await prisma.property.update({
          where: { id: p.id },
          data: {
            featuredImage: p.featuredImage === oldUrl ? newUrl : p.featuredImage,
            galleryImages: p.galleryImages.map((u) => (u === oldUrl ? newUrl : u)),
          },
        });
      }
    }

    for (const propertyId of affectedPropertyIds) {
      await normalizePropertyImagePrimaryBySortOrder(prisma, propertyId);
      await syncPropertyGalleryFieldsFromImages(prisma, propertyId);
    }

    console.log(`\nImóveis sincronizados: ${affectedPropertyIds.size}`);
  }

  await prisma.$disconnect();

  console.log("\n--- Resumo ---");
  console.log(`URLs processadas: ${legacyUrls.length}`);
  console.log(`Enviadas ao Cloudinary: ${uploaded}`);
  console.log(`Dry-run OK: ${skipped}`);
  console.log(`Falhas: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
