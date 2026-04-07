/**
 * Repara Property.galleryImages, featuredImage e featuredImageAlt
 * para imóveis que já possuem PropertyImage mas a importação antiga não sincronizou esses campos.
 *
 * Executar: npx tsx scripts/repair-property-gallery-fields.ts
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import {
  normalizePropertyImagePrimaryBySortOrder,
  syncPropertyGalleryFieldsFromImages,
} from "../lib/property/sync-gallery-fields";

async function main() {
  const connectionString =
    process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL ou DATABASE_URL não encontrada.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const withImages = await prisma.property.findMany({
    where: { images: { some: {} } },
    select: { id: true },
  });

  console.log(`Imóveis com PropertyImage: ${withImages.length}`);

  let ok = 0;
  let errors = 0;
  for (const p of withImages) {
    try {
      await normalizePropertyImagePrimaryBySortOrder(prisma, p.id);
      await syncPropertyGalleryFieldsFromImages(prisma, p.id);
      ok++;
    } catch (e) {
      errors++;
      console.error(`[ERRO] propertyId=${p.id}:`, e);
    }
  }

  console.log(`Concluído: ${ok} imóveis, ${errors} erros.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
