import { prisma } from "@/lib/prisma";
import {
  formatBuilderDisplayName,
  normalizeBuilderKey,
  slugifyBuilder,
} from "@/lib/utils/builder-normalize";
import { hasBuilderTable } from "@/lib/admin/schema-migration";

export type ResolvedBuilder = {
  builderName: string | null;
  builderSlug: string | null;
};

/**
 * Resolve construtora ao salvar imóvel.
 * - Se existir no cadastro manual (/admin/construtoras), reutiliza nome e slug canônicos.
 * - Caso contrário, apenas formata o texto digitado (não cria registro em Builder).
 * - Imóveis já cadastrados permanecem como estão até serem editados.
 */
export async function resolveBuilderForProperty(input: {
  builderName: string | null;
}): Promise<ResolvedBuilder> {
  const raw = input.builderName?.trim() ?? "";
  if (!raw) {
    return { builderName: null, builderSlug: null };
  }

  const normalizedKey = normalizeBuilderKey(raw);

  if (await hasBuilderTable()) {
    const existingRegistry = await prisma.builder.findUnique({
      where: { normalizedKey },
      select: { name: true, slug: true },
    });

    if (existingRegistry) {
      return {
        builderName: existingRegistry.name,
        builderSlug: existingRegistry.slug,
      };
    }
  }

  const formattedName = formatBuilderDisplayName(raw);
  const slug = slugifyBuilder(formattedName);

  return {
    builderName: formattedName,
    builderSlug: slug,
  };
}
