// ---------------------------------------------------------------------------
// Queries administrativas — acesso a todos os dados, sem filtro published.
// Separado de lib/queries/properties para não misturar lógica pública e admin.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";

export type AdminPropertyListItem = {
  id: string;
  slug: string;
  title: string;
  price: string;
  city: string;
  citySlug: string;
  neighborhood: string | null;
  neighborhoodSlug: string | null;
  featuredImage: string | null;
  /** URL para miniatura na lista: `featuredImage` ou primeira linha de `PropertyImage`. */
  listThumbnailUrl: string | null;
  isFeatured: boolean;
  isLaunch: boolean;
  isOpportunity: boolean;
  published: boolean;
  updatedAt: Date;
};

const adminListSelect = {
  id: true,
  slug: true,
  title: true,
  price: true,
  city: true,
  citySlug: true,
  neighborhood: true,
  neighborhoodSlug: true,
  featuredImage: true,
  isFeatured: true,
  isLaunch: true,
  isOpportunity: true,
  published: true,
  updatedAt: true,
} as const;

/**
 * Lista todos os imóveis para o painel administrativo.
 * Ordena por updatedAt descendente (mais recentes primeiro).
 */
export async function getAdminProperties(): Promise<AdminPropertyListItem[]> {
  const results = await prisma.property.findMany({
    select: {
      ...adminListSelect,
      images: {
        take: 1,
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        select: { url: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return results.map((p) => {
    const { images, ...rest } = p;
    const listThumbnailUrl = rest.featuredImage ?? images[0]?.url ?? null;
    return {
      ...rest,
      price: String(rest.price),
      listThumbnailUrl,
    };
  });
}

// ---------------------------------------------------------------------------
// Leads — listagem administrativa
// ---------------------------------------------------------------------------

export type AdminLeadListItem = {
  id: string;
  name: string;
  phone: string;
  desiredPriceRange: string | null;
  origin: "site" | "manual";
  manualSource: string | null;
  status: "novo" | "em_contato" | "qualificado" | "vendido" | "perdido";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Lista todos os leads para o painel administrativo.
 * Ordena por createdAt descendente (mais recentes primeiro).
 */
export async function getAdminLeads(): Promise<AdminLeadListItem[]> {
  const results = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });
  return results;
}

