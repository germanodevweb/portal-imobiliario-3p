import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Posts que listam este imóvel em "Imóveis relacionados" ficam em cache estático;
 * sem isto, o blog continua com foto/título antigos após editar o imóvel.
 */
export async function revalidateBlogPagesReferencingProperty(
  propertyId: string
): Promise<void> {
  const posts = await prisma.post.findMany({
    where: { relatedPropertyIds: { has: propertyId } },
    select: { slug: true },
  });
  for (const { slug } of posts) {
    revalidatePath(`/blog/${slug}`);
  }
  if (posts.length > 0) {
    revalidatePath("/blog");
  }
}
