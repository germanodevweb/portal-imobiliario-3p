/**
 * Mantém Property.featuredImage, featuredImageAlt e galleryImages alinhados
 * à tabela PropertyImage — mesma regra conceitual de `updatePropertyAction` no admin.
 *
 * Usado após importação em lote e por script de reparo de dados legados.
 */

import type { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Garante um único `isPrimary`: o primeiro registro por `sortOrder` (desempate `createdAt`).
 */
export async function normalizePropertyImagePrimaryBySortOrder(
  prisma: PrismaClient,
  propertyId: string
): Promise<void> {
  const rows = await prisma.propertyImage.findMany({
    where: { propertyId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  if (rows.length === 0) return;

  const firstId = rows[0].id;
  const alreadyOk = rows.every((r) => r.isPrimary === (r.id === firstId));
  if (alreadyOk) return;

  await prisma.$transaction([
    prisma.propertyImage.updateMany({
      where: { propertyId },
      data: { isPrimary: false },
    }),
    prisma.propertyImage.update({
      where: { id: firstId },
      data: { isPrimary: true },
    }),
  ]);
}

/**
 * Atualiza `galleryImages` (ordem visível), `featuredImage` e `featuredImageAlt` a partir de PropertyImage.
 * Imagens com `isHidden: true` não entram na galeria pública nem no array.
 */
export async function syncPropertyGalleryFieldsFromImages(
  prisma: PrismaClient,
  propertyId: string
): Promise<void> {
  const rows = await prisma.propertyImage.findMany({
    where: { propertyId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const visible = rows.filter((r) => !r.isHidden);

  if (visible.length === 0) {
    await prisma.property.update({
      where: { id: propertyId },
      data: {
        galleryImages: [],
        featuredImage: null,
        featuredImageAlt: null,
      },
    });
    return;
  }

  const primary =
    visible.find((r) => r.isPrimary) ?? visible[0];

  await prisma.property.update({
    where: { id: propertyId },
    data: {
      galleryImages: visible.map((r) => r.url),
      featuredImage: primary.url,
      featuredImageAlt: primary.alt?.trim() ?? null,
    },
  });
}
