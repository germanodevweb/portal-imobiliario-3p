/**
 * Preenche alt ausente em PropertyImage usando o padrão SEO local.
 * Não sobrescreve alt personalizado existente.
 *
 * Executar: pnpm backfill:image-alt
 * Dry-run:  pnpm backfill:image-alt -- --dry-run
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { fillMissingImageAlts } from "../lib/utils/featuredImageAlt";
import { syncPropertyGalleryFieldsFromImages } from "../lib/property/sync-gallery-fields";

const BATCH_SIZE = 200;
const dryRun = process.argv.includes("--dry-run");

async function main() {
  const connectionString =
    process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL ou DATABASE_URL não encontrada.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  let scanned = 0;
  let updatedImages = 0;
  let updatedProperties = 0;
  let cursor: string | undefined;

  console.log(dryRun ? "Modo dry-run (sem gravar)" : "Gravando alterações…");

  while (true) {
    const rows = await prisma.propertyImage.findMany({
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      where: {
        OR: [{ alt: null }, { alt: "" }],
        environment: { not: null },
      },
      select: {
        id: true,
        propertyId: true,
        url: true,
        alt: true,
        environment: true,
        property: {
          select: {
            type: true,
            city: true,
            neighborhood: true,
            transactionType: true,
          },
        },
      },
    });

    if (rows.length === 0) break;
    cursor = rows[rows.length - 1]?.id;

    const byProperty = new Map<
      string,
      {
        context: {
          type: string;
          neighborhood: string | null;
          city: string;
          transactionType: "SALE" | "RENT";
        };
        images: typeof rows;
      }
    >();

    for (const row of rows) {
      scanned++;
      const entry = byProperty.get(row.propertyId);
      const context = {
        type: row.property.type,
        neighborhood: row.property.neighborhood,
        city: row.property.city,
        transactionType: row.property.transactionType,
      };
      if (entry) {
        entry.images.push(row);
      } else {
        byProperty.set(row.propertyId, { context, images: [row] });
      }
    }

    for (const [propertyId, group] of byProperty) {
      const filled = fillMissingImageAlts(group.images, group.context);
      const changes = filled.filter(
        (img, i) => img.alt !== group.images[i]?.alt && img.alt?.trim()
      );

      if (changes.length === 0) continue;

      if (!dryRun) {
        await prisma.$transaction(
          changes.map((img) =>
            prisma.propertyImage.update({
              where: { id: img.id },
              data: { alt: img.alt },
            })
          )
        );
        await syncPropertyGalleryFieldsFromImages(prisma, propertyId);
      }

      updatedImages += changes.length;
      updatedProperties++;
    }

    console.log(`Processadas ${scanned} imagens sem alt (lote atual: ${rows.length})`);
  }

  await prisma.$disconnect();

  console.log("\n--- Resumo ---");
  console.log(`Imagens analisadas: ${scanned}`);
  console.log(`Imagens ${dryRun ? "que seriam atualizadas" : "atualizadas"}: ${updatedImages}`);
  console.log(`Imóveis ${dryRun ? "afetados" : "sincronizados"}: ${updatedProperties}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
